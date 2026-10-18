// One-person studio: the pure timeline the figure draws.
// A person alone in a room is scanned, five copies of their persona are printed
// as role robots, each robot unpacks its own tool from a crate, and then a
// pipeline of features runs: the person hands a goal to the PM, work moves from
// robot to robot along the wall rail, and every robot reports back to the
// person after each step. Everything is a function of time, so the page can
// loop it, jump to a chapter and still draw every number true.

export const ROLES = [
  { id: "PM", name: "Project manager", tool: "kanban board", job: "turns your goal into tickets", step: "spec" },
  { id: "UX", name: "Designer", tool: "drawing easel", job: "draws the screens", step: "mockup" },
  { id: "DEV", name: "Developer", tool: "terminal", job: "writes the code", step: "code" },
  { id: "QA", name: "Tester", tool: "inspection lamp", job: "tests every build", step: "test" },
  { id: "OPS", name: "Ops", tool: "server rack", job: "ships what passes", step: "deploy" },
];
export const N = ROLES.length;

// ── Room layout (world units, z up). Wall B is the x = −140 wall, its robots face +x;
// wall A is the y = −140 wall, its robots face +y. `at` is the robot's lateral position.
export const ROOM = { x: -140, y: -140, w: 250, d: 250 };
export const STATIONS = [
  { wall: "B", at: 76 },
  { wall: "B", at: 2 },
  { wall: "B", at: -72 },
  { wall: "A", at: -40 },
  { wall: "A", at: 34 },
];
export const PAD = { x: 8, y: 8, r: 22 };
// The overhead rail runs along wall B, round the corner and along wall A.
export const RAIL = { off: 7, z: 74, r: 18, start: 102 };
const railB = ROOM.x + RAIL.off;
const railA = ROOM.y + RAIL.off;
const LEG_B = RAIL.start - (railA + RAIL.r);
const ARC = (Math.PI / 2) * RAIL.r;
export const RAIL_LENGTH = LEG_B + ARC + (RAIL.start - (railB + RAIL.r));
export const railStop = (i) => {
  const st = STATIONS[i];
  return st.wall === "B" ? RAIL.start - st.at : LEG_B + ARC + (st.at - (railB + RAIL.r));
};
// A point on the rail centreline at arc length s.
export function railPoint(s) {
  if (s <= LEG_B) return [railB, RAIL.start - s];
  if (s <= LEG_B + ARC) {
    const a = (s - LEG_B) / RAIL.r; // 0 → π/2, turning from −y to +x
    const cx = railB + RAIL.r, cy = railA + RAIL.r;
    return [cx - Math.cos(a) * RAIL.r, cy - Math.sin(a) * RAIL.r];
  }
  return [railB + RAIL.r + (s - LEG_B - ARC), railA];
}

// ── Timeline (seconds) ──────────────────────────────────────────────────────
export const T = {
  scan: [2.6, 6.2], // the ring sweeps down over you and back up
  spawn0: 6.6, // agent i begins at spawn0 + i·gap
  gap: 1.8,
  persona: [0, 0.9], // persona runs down the floor line to the agent's dock
  print: [0.9, 2.5], // the print plane rises and the robot appears below it
  lid: [2.4, 2.9], // its crate lid slides back
  tool: [2.8, 3.6], // its tool rises out of the crate
  item: 7.5, // a new goal every 7.5 s
  items: 4,
  packet: 0.9, // a floor-line message, dock ↔ pad
  dwell: 0.35, // a rail carrier pauses to pick up and drop off
  speed: 120, // rail carrier speed, units per second
};
export const RUN = T.spawn0 + (N - 1) * T.gap + T.tool[1] + 0.3;
const WORK = { PM: 1.4, UX: 1.6, DEV: 2.0, QA: 1.2, OPS: 1.4, FIX: 1.1, RETEST: 0.9 };

const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const span = (t, a, b) => clamp01((t - a) / (b - a));
export const hopTime = (from, to) => T.dwell + Math.abs(railStop(to) - railStop(from)) / T.speed;

// Build the run's events once: work at a robot, rail hops between robots,
// floor-line packets between a robot and the person, and each shipped feature.
function buildEvents() {
  const work = [], hops = [], packets = [], shipped = [];
  for (let j = 0; j < T.items; j++) {
    let t = RUN + j * T.item;
    const item = j + 1;
    packets.push({ agent: 0, dir: "out", t0: t, t1: t + T.packet, item, kind: "goal" });
    t += T.packet;
    const stage = (agent, len, step) => {
      work.push({ agent, t0: t, t1: t + len, item, step });
      t += len;
      packets.push({ agent, dir: "in", t0: t, t1: t + T.packet, item, kind: step });
    };
    const hop = (from, to, kind) => {
      const len = hopTime(from, to);
      hops.push({ from, to, t0: t, t1: t + len, item, kind });
      t += len;
    };
    stage(0, WORK.PM, "spec");
    hop(0, 1, "spec");
    stage(1, WORK.UX, "mockup");
    hop(1, 2, "mockup");
    stage(2, WORK.DEV, "code");
    hop(2, 3, "build");
    stage(3, WORK.QA, j % 2 ? "bug" : "test");
    if (j % 2) {
      hop(3, 2, "bug");
      stage(2, WORK.FIX, "fix");
      hop(2, 3, "build");
      stage(3, WORK.RETEST, "test");
    }
    hop(3, 4, "release");
    stage(4, WORK.OPS, "deploy");
    shipped.push({ t, item });
  }
  return { work, hops, packets, shipped };
}
export const EVENTS = buildEvents();
const lastEnd = Math.max(...EVENTS.packets.map((p) => p.t1), ...EVENTS.shipped.map((s) => s.t));
export const DIS = lastEnd + 1.6; // the agents un-print and their persona returns
export const DISMISS = { tool: [0, 0.7], lid: [0.6, 1.0], print: [1.0, 2.4], persona: [2.4, 3.3], stagger: 0.12 };
export const LOOP = DIS + DISMISS.persona[1] + N * DISMISS.stagger + 1.4;
export const CHAPTERS = [
  { name: "Empty room", t: 0 },
  { name: "Duplicate", t: T.scan[0] - 0.2 },
  { name: "Run the team", t: RUN },
];

// How far each agent's arrival has got at time t (0 → 1 per part).
export function spawnOf(i, t) {
  const s = T.spawn0 + i * T.gap;
  let persona = span(t, s + T.persona[0], s + T.persona[1]);
  let print = ease(span(t, s + T.print[0], s + T.print[1]));
  let lid = ease(span(t, s + T.lid[0], s + T.lid[1]));
  let tool = ease(span(t, s + T.tool[0], s + T.tool[1]));
  let back = 0; // the persona running home along the floor line, 0 → 1
  if (t >= DIS) {
    const d = t - DIS - i * DISMISS.stagger;
    tool *= 1 - ease(span(d, ...DISMISS.tool));
    lid *= 1 - ease(span(d, ...DISMISS.lid));
    print *= 1 - ease(span(d, ...DISMISS.print));
    back = span(d, ...DISMISS.persona);
    if (back >= 1) persona = 0;
  }
  return { persona, print, lid, tool, back, alive: print > 0.02 };
}

// The scan ring: its height above the pad as a fraction of its travel (1 = top) and its glow.
export function scanOf(t) {
  const [a, b] = T.scan;
  const m = (a + b) / 2;
  const h = t < a || t > b ? 1 : t < m ? 1 - ease(span(t, a, m)) : ease(span(t, m, b));
  const glow = Math.min(span(t, a - 0.3, a + 0.2), 1 - span(t, b - 0.2, b + 0.4));
  return { h, glow };
}

const within = (e, t) => t >= e.t0 && t < e.t1;
export function phaseOf(t) {
  if (t < T.scan[0]) return "empty";
  if (t < T.spawn0) return "scan";
  if (t < RUN) return "spawn";
  if (t < DIS) return "run";
  return "dismiss";
}

// Everything the page needs at time t.
export function stateAt(t) {
  const phase = phaseOf(t);
  const spawn = ROLES.map((_, i) => spawnOf(i, t));
  const agents = ROLES.map((_, i) => {
    const job = EVENTS.work.find((w) => w.agent === i && within(w, t));
    const got = EVENTS.hops.filter((h) => h.to === i && t >= h.t1 && t - h.t1 < 0.7).length > 0;
    const reports = EVENTS.packets.filter((p) => p.agent === i && p.dir === "in" && t >= p.t1).length;
    return { job: job ? { ...job, p: span(t, job.t0, job.t1) } : null, got, reports };
  });
  const hops = EVENTS.hops.filter((h) => within(h, t)).map((h) => {
    const a = railStop(h.from), b = railStop(h.to);
    const u = span(t, h.t0 + T.dwell / 2, h.t1 - T.dwell / 2);
    return { ...h, s: a + (b - a) * ease(u), p: span(t, h.t0, h.t1) };
  });
  const packets = EVENTS.packets.filter((p) => within(p, t)).map((p) => ({ ...p, f: p.dir === "out" ? span(t, p.t0, p.t1) : 1 - span(t, p.t0, p.t1) }));
  // The arrival of each copy is a persona packet going out; the dismissal sends it home.
  spawn.forEach((s, i) => {
    if (s.persona > 0 && s.persona < 1) packets.push({ agent: i, dir: "out", f: s.persona, kind: "persona" });
    if (s.back > 0 && s.back < 1) packets.push({ agent: i, dir: "in", f: 1 - s.back, kind: "persona" });
  });
  const portLit = ROLES.map((_, i) => {
    const hit = EVENTS.packets.filter((p) => p.agent === i && p.dir === "in" && t >= p.t1 && t - p.t1 < 0.8);
    return hit.length ? 1 - (t - hit[hit.length - 1].t1) / 0.8 : 0;
  });
  return {
    t,
    phase,
    scan: scanOf(t),
    spawn,
    agents,
    hops,
    packets,
    portLit,
    online: spawn.filter((s) => s.print >= 1).length,
    printing: spawn.findIndex((s) => s.print > 0 && s.print < 1),
    reports: EVENTS.packets.filter((p) => p.dir === "in" && t >= p.t1).length,
    handoffs: EVENTS.hops.filter((h) => t >= h.t1).length,
    shipped: EVENTS.shipped.filter((s) => t >= s.t).length,
    goals: EVENTS.packets.filter((p) => p.kind === "goal" && t >= p.t0).length,
  };
}
