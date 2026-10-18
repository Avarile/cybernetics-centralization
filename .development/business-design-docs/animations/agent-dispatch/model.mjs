// The truth behind the figure: how a human-led project board hands work to agent
// members and gets it back. It follows the protocol of the workspace's project
// server (Plane): a human writes a work item and assigns it to an agent member;
// the agent loads the item's brief, works through it, reports progress as work
// item comments and stops where the workflow needs human approval; the human
// reviews when they are free, then approves it to Done or comments and sends it
// back. Nobody waits on anybody: the board holds every item between hand-offs.
//
// The reader plays the human. createBoard is a small pure simulation: actions
// (send, approve, note) queue up for the one human, robots pick up work when they
// are free, and step(dt) advances everything. Self-contained so the page can
// carry the same source.

// One lane per agent member, far to near.
export const LANES = [
  { agent: "A1", role: "docs" },
  { agent: "A2", role: "backend" },
  { agent: "A3", role: "triage" },
];

// Where a carrier stops along its lane: at the human's desk, at the agent's
// robot, and one card back from the robot when the agent is still busy.
export const STOPS = { human: 62, agent: -50, queue: -12 };

// The most comment rows a card has room for.
export const ROWS = 7;

// Board states, as the project server names them.
export const STATE = { write: "Todo", ready: "Todo", launch: "Todo", queue: "Todo", work: "In Progress", switch: "In Progress", return: "In Review", hold: "In Review", wait: "In Review", review: "In Review", note: "In Progress", approve: "Done", done: "Done" };

export function createBoard({ stops, lanes, rows: rowMax = 7, seed = 11 }) {
  // Seconds each step takes: the human writing a brief, reading a returned card,
  // writing a note, stamping; the agent writing one comment line; a switch rail.
  const T = { write: 2, review: 0.8, note: 2, approve: 1.4, switch: 0.8, row: 2, carrierFade: 0.6, archive: 1 };
  // Where returning carriers wait on the near wire, first in line first.
  const HOLD = [stops.human, 26, stops.queue];
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (u) => u * u * (3 - 2 * u);
  let state = seed >>> 0;
  const random = () => (state = (state * 1664525 + 1013904223) >>> 0) / 4294967296;
  const length = (lo, hi) => Math.round(lo + random() * (hi - lo));
  const board = { now: 0, items: [], tasks: [], task: null, lanes: lanes.map(() => ({ slots: [null, null] })), next: 1, done: 0 };
  const inLane = (lane) => board.items.filter((item) => item.lane === lane && !item.gone);

  // ── Who is where ──────────────────────────────────────────────────────────
  // The agent's stop is taken by an item working there or on its way there.
  const agentTaken = (lane) => inLane(lane).some((i) => (i.phase === "launch" && i.target === "agent") || i.phase === "work" || (i.phase === "switch" && i.end === "agent"));
  const queueTaken = (lane) => inLane(lane).some((i) => (i.phase === "launch" && i.target === "queue") || i.phase === "queue");
  // The out wire at the desk is taken by a card being written or waiting to leave.
  const deskTaken = (lane, except) => inLane(lane).some((i) => i !== except && (i.phase === "write" || i.phase === "ready" || (i.phase === "switch" && i.end === "human") || (i.wire < 0 && i.phase === "launch" && i.y > stops.human - 24)));
  const holdTaken = (lane, index, except) => inLane(lane).some((i) => i !== except && i.hold === index && ["return", "hold", "wait", "review", "note", "approve", "noted", "switch"].includes(i.phase));
  const nearReturn = (lane) => inLane(lane).some((i) => i.wire > 0 && i.y < stops.agent + 16);
  const outbound = (lane) => inLane(lane).filter((i) => ["write", "ready", "launch", "queue", "work"].includes(i.phase) || (i.phase === "switch" && i.end === "agent")).length + board.tasks.filter((t) => t.kind === "write" && t.lane === lane).length;

  function enter(item, phase) { item.phase = phase; item.since = board.now; }
  function travel(item, to, target) {
    const dist = Math.abs(to - item.y);
    item.leg = { from: item.y, to, at: board.now, dur: 0.5 + dist / 52 };
    item.target = target;
    enter(item, item.phase === "ready" || item.phase === "queue" ? "launch" : item.phase === "hold" || item.phase === "switch" ? "return" : item.phase);
  }

  // ── The reader's actions: each becomes a task on the human's list ─────────
  // At most two items heading out (one at the robot, one queued) and three in the lane, one per waiting place.
  board.canSend = (lane) => outbound(lane) < 2 && inLane(lane).filter((i) => i.phase !== "done").length + board.tasks.filter((t) => t.kind === "write" && t.lane === lane).length < HOLD.length;
  board.send = (lane) => {
    if (!board.canSend(lane)) return false;
    board.tasks.push({ kind: "write", lane });
    return true;
  };
  board.inbox = () => board.items.filter((i) => i.phase === "wait" && !board.tasks.some((t) => t.item === i) && board.task?.item !== i).sort((a, b) => a.bell - b.bell);
  board.waiting = (lane) => board.inbox().find((i) => i.lane === lane);
  board.canNote = (item) => !!item && item.note === undefined && item.rowLens.length + 3 <= rowMax;
  board.approve = (item) => {
    if (!item || item.phase !== "wait" || board.tasks.some((t) => t.item === item)) return false;
    board.tasks.push({ kind: "approve", item });
    return true;
  };
  board.note = (item) => {
    if (!board.canNote(item) || item.phase !== "wait" || board.tasks.some((t) => t.item === item)) return false;
    board.tasks.push({ kind: "note", item });
    return true;
  };

  // ── The human: one task at a time, the first one that can start ───────────
  function startTask() {
    const index = board.tasks.findIndex((t) => t.kind !== "write" || !deskTaken(t.lane));
    if (index < 0) return;
    const task = board.tasks.splice(index, 1)[0];
    task.at = board.now;
    if (task.kind === "write") {
      const pass = length(3, 4);
      const item = {
        id: "PM-" + board.next++, lane: task.lane, wire: -1, y: stops.human, phase: "write", since: board.now,
        briefLens: [length(20, 27), length(15, 27), length(15, 25)], rowLens: Array.from({ length: pass }, () => length(15, 25)),
        pass: Array.from({ length: pass }, (_, i) => i), note: undefined, workAt: -1, bell: -1, hold: -1, slot: -1, leg: null, target: null, end: null, doneAt: -1, archivedAt: -1, gone: false,
      };
      board.items.push(item);
      task.item = item;
      task.dur = T.write;
    } else {
      enter(task.item, "review");
      task.dur = T.review + (task.kind === "note" ? T.note : T.approve);
      if (task.kind === "approve") {
        // The card goes into the done tray; when both places are full the oldest one is archived.
        const slots = board.lanes[task.item.lane].slots;
        let slot = slots.indexOf(null);
        if (slot < 0) {
          const oldest = slots.reduce((a, b) => (a.doneAt <= b.doneAt ? a : b));
          slot = slots.indexOf(oldest);
          oldest.archivedAt = board.now;
        }
        slots[slot] = task.item;
        task.item.slot = slot;
      }
    }
    board.task = task;
  }
  function runTask() {
    const task = board.task, u = board.now - task.at, item = task.item;
    if (task.kind !== "write" && u >= T.review && item.phase === "review") enter(item, task.kind);
    if (u < task.dur) return;
    if (task.kind === "write") enter(item, "ready");
    if (task.kind === "approve") { enter(item, "done"); item.doneAt = board.now; board.done++; }
    if (task.kind === "note") {
      // The note becomes a row on the card, and the agent owes two more rows after it.
      item.note = item.rowLens.length;
      item.rowLens.push(length(14, 20));
      const a = item.rowLens.length;
      item.rowLens.push(length(15, 22), length(14, 20));
      item.pass = [a, a + 1];
      item.workAt = -1;
      enter(item, "noted");
    }
    board.task = null;
  }

  // ── Everything else: carriers, switch rails and the robots ────────────────
  function advance(item) {
    const now = board.now, el = now - item.since;
    if (item.leg) {
      const u = clamp((now - item.leg.at) / item.leg.dur);
      item.y = item.leg.from + (item.leg.to - item.leg.from) * ease(u);
      if (u < 1) return;
      item.y = item.leg.to;
      item.leg = null;
      if (item.phase === "launch") {
        if (item.target === "agent") { enter(item, "work"); item.workAt = now; }
        else enter(item, "queue");
      } else if (item.phase === "return") {
        if (item.hold === 0) { enter(item, "wait"); item.bell = now; }
        else enter(item, "hold");
      }
      return;
    }
    switch (item.phase) {
      case "ready": {
        if (!queueTaken(item.lane) && !agentTaken(item.lane)) { item.launchAt = now; travel(item, stops.agent, "agent"); }
        else if (!queueTaken(item.lane)) { item.launchAt = now; travel(item, stops.queue, "queue"); }
        break;
      }
      case "queue":
        if (!agentTaken(item.lane)) travel(item, stops.agent, "agent");
        break;
      case "work":
        if (now - item.workAt >= item.pass.length * T.row && !nearReturn(item.lane)) { enter(item, "switch"); item.end = "agent"; }
        break;
      case "noted":
        if (!deskTaken(item.lane, item)) { enter(item, "switch"); item.end = "human"; }
        break;
      case "switch": {
        const u = clamp(el / T.switch), from = item.end === "agent" ? -1 : 1;
        item.wire = from * (1 - 2 * ease(u));
        if (u < 1) break;
        item.wire = -from;
        if (item.end === "agent") {
          const hold = HOLD.findIndex((_, index) => !holdTaken(item.lane, index, item));
          item.hold = hold < 0 ? HOLD.length - 1 : hold;
          travel(item, HOLD[item.hold], "hold");
        } else { enter(item, "ready"); item.hold = -1; }
        item.end = null;
        break;
      }
      case "hold": {
        const nearer = item.hold - 1;
        if (nearer >= 0 && !holdTaken(item.lane, nearer, item)) { item.hold = nearer; travel(item, HOLD[nearer], "hold"); }
        break;
      }
    }
  }

  // What the page draws for one item: positions, how far each line is written, and its robot's progress.
  function view(item) {
    const now = board.now, el = now - item.since;
    const v = { id: item.id, lane: item.lane, wire: item.wire, y: item.y, phase: item.phase, bell: item.bell, slot: item.slot, note: item.note, rowLens: item.rowLens, briefLens: item.briefLens };
    v.shown = item.phase === "write" ? clamp(el / 0.4) : 1;
    v.brief = item.phase === "write" ? clamp(el / T.write) : 1;
    v.carrier = item.doneAt >= 0 ? 1 - clamp((now - item.doneAt) / T.carrierFade) : v.shown;
    v.fade = item.archivedAt >= 0 ? clamp((now - item.archivedAt - 0.4) / T.archive) : 0;
    v.pull = item.phase === "launch" && item.launchAt !== undefined && item.leg && item.leg.from === stops.human ? Math.sin(Math.PI * clamp((now - item.launchAt) / 0.7)) : 0;
    v.noteU = item.note === undefined ? 0 : 1;
    if (item.phase === "note") v.noteU = clamp(el / T.note);
    v.stamp = item.phase === "approve" ? clamp(el / 0.35) : item.phase === "done" ? 1 : 0;
    v.lift = item.phase === "approve" ? ease(clamp(el / T.approve)) : item.phase === "done" ? 1 : 0;
    v.done = item.phase === "done";
    // Rows: every row before this pass is written; this pass fills in as the robot works.
    const first = item.pass[0];
    v.rows = item.rowLens.map((_, j) => (j < first && j !== item.note ? 1 : 0));
    v.work = null;
    if (item.workAt >= 0) {
      const of = item.pass.length, w = Math.min(now - item.workAt, of * T.row);
      const k = Math.min(of - 1, Math.floor(w / T.row)), u = (w - k * T.row) / T.row;
      item.pass.forEach((row, j) => { if (j < k) v.rows[row] = 1; });
      v.rows[item.pass[k]] = clamp((u - 0.15) / 0.7);
      const end = now - item.workAt >= of * T.row;
      v.work = { at: item.workAt, list: item.pass, row: item.pass[k], prev: k > 0 ? item.pass[k - 1] : -1, v: end ? 1 : u, k, of, end, since: now - item.workAt - of * T.row, into: now - item.workAt };
    } else item.pass.forEach((row) => (v.rows[row] = 0));
    return v;
  }

  board.step = (dt) => {
    board.now += dt;
    if (!board.task) startTask();
    if (board.task) runTask();
    if (!board.task) startTask();
    for (const item of board.items) if (!item.gone) advance(item);
    // Archived cards and their freed tray places.
    for (const item of board.items) if (item.archivedAt >= 0 && board.now - item.archivedAt > T.archive + 0.6) item.gone = true;
    board.items = board.items.filter((item) => !item.gone);
  };
  board.view = () => board.items.map(view);
  board.humanDoing = () => {
    const t = board.task;
    if (!t) return board.tasks.length ? "waiting for a carrier" : "free";
    const word = t.kind === "write" ? "writing" : t.item.phase === "review" ? "reviewing" : t.kind === "note" ? "noting" : "approving";
    return word + " " + t.item.id;
  };

  // ── Autopilot: plays the human while nobody else does ─────────────────────
  let nextMove = 0.3, turn = 0;
  board.autopilot = () => {
    if (board.now < nextMove) return;
    nextMove = board.now + 1.4 + random() * 2.2;
    if (board.task || board.tasks.length) return;
    const waiting = board.inbox()[0];
    if (waiting) {
      if (board.canNote(waiting) && random() < 0.3) board.note(waiting);
      else board.approve(waiting);
      return;
    }
    const busy = board.items.filter((i) => i.phase !== "done").length;
    if (busy >= 5) return;
    for (let k = 0; k < lanes.length; k++) {
      const lane = (turn + k) % lanes.length;
      if (board.canSend(lane) && outbound(lane) === 0) { board.send(lane); turn = lane + 1; return; }
    }
    if (busy < 3) for (let k = 0; k < lanes.length; k++) { const lane = (turn + k) % lanes.length; if (board.canSend(lane)) { board.send(lane); turn = lane + 1; return; } }
  };
  return board;
}
