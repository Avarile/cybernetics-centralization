import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/avarile/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/home/avarile/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
// The dark build wears the "data space" skin: neon lines on deep navy, a grid on the bench.
const CYBER = theme === "dark";

const WIDTH = 640;
const HEIGHT = 372;

// ── World plan (units ≈ px, z up) ───────────────────────────────────────────
const BASE = { x: -100, y: -172, w: 200, d: 350, r: 9 };
const BASE_H = 12;
const FOOT_H = 5;

const TRAY_W = 40; // along y
const TRAY_GAP = 8;
const TRAY_X0 = -64; // back of the floor
const TRAY_X1 = 59; // front face
const WALL_H = 22;
const FRONT_H = 24;
const CARD_H = 30;
const CARD_Z = 2;
const CARD_TOP = CARD_Z + CARD_H;
const CARD_D = 34;
const PITCH = 3;
const FIRST = -57;
const trayY = (index) => -150 + index * (TRAY_W + TRAY_GAP);
const trayMid = (index) => trayY(index) + TRAY_W / 2;

const HOPPER = { x0: -64, x1: -22, y: 52 };
const HOPPER_MID = HOPPER.y + TRAY_W / 2;
const BLANKS = [-43.6, -40.6, -37.6, -34.6, -31.6];
const PICK_X = -28.6; // the front blank, the one the head takes

const DESK = { x: -16, y: 52, w: 72, d: 92, r: 3 };
const DESK_H = 14;
const SHEET = { x: -11, y: 58, w: 64, d: 80, r: 1 };
const ROW0 = -6;
const ROW = 1.3;
const MAX_NEW = 6; // fresh index lines the sheet has room for
const LINE_Y = 64;
const PER_CHAR = 0.22;

const RAIL_X = 80;
const RAIL_Y0 = -164;
const RAIL_Y1 = 152;
const BEAM_Z = 86;
const BEAM_H = 8;
const HEAD_DY = 12; // the rod sits this far in front of the beam's centre line
const BUSH_Z = 70;
const BUSH_TOP = 84;
const ROD_L = 54;
const REST_TIP = 66;
const LIFT_TIP = 64;

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    // The gantry only travels between the feedback tray and the desk.
    [-88, -94, BEAM_Z + BEAM_H],
    [88, 86, BEAM_Z + BEAM_H],
    [0, -94, REST_TIP + 4 + ROD_L + 3],
    [0, 86, REST_TIP + 4 + ROD_L + 3],
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 36 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
// A line on a face that points +x (tray fronts, card faces): y runs left to right on screen.
const onFaceX = (x, y0, y1, z) => k.segment([x, y0, z], [x, y1, z], P);

// ── Base ────────────────────────────────────────────────────────────────────
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(slab(BASE, -BASE_H, BASE_H, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 8), { tone: "faint" }) }));
  const groove = k.insetPlan(BASE, 5);
  if (CYBER) {
    // A holographic grid inside the groove: every line runs from groove edge to groove edge.
    const lines = [];
    for (let x = -90; x <= 90; x += 10) lines.push(k.lineOnTop([x, groove.y], [x, groove.y + groove.d], 0, P));
    for (let y = -160; y <= 170; y += 10) lines.push(k.lineOnTop([groove.x, y], [groove.x + groove.w, y], 0, P));
    out.push(L(lines.join(""), { tone: "faint", className: "cy-grid" }));
  }
  out.push(L(k.planOutline(groove, 0, P), { tone: "faint" }));
  const screws = k.corners(BASE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  return out.join("");
}

// The ruler under the near truck's pointer: one major tick per 25 units of travel.
function ruler() {
  const strip = { x: 87.5, y: RAIL_Y0 + 2, w: 6.5, d: RAIL_Y1 - RAIL_Y0 - 4, r: 1 };
  const out = [S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" })];
  const ticks = k.topTicks(strip.y + 3, strip.y + strip.d - 3, 5, 5, strip.x + 0.1, 0.6, [2, 3.8], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 4.6, strip.y + 1.5, 0.6]), at([strip.x + 4.6, strip.y + strip.d - 1.5, 0.6])], { size: 0.45 }));
  return out.join("");
}

function plate() {
  const plan = { x: 30, y: 158, w: 58, d: 15, r: 1.6 };
  const out = [S(slab(plan, 0, 0.8, 4), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([plan.x + 7, plan.y + 9.6], 0.8, P, "x"), "memory/", { size: 4.2, tone: "lo" }));
  out.push(L(k.lineOnTop([plan.x + 33, plan.y + 5], [plan.x + 50, plan.y + 5], 0.8, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([plan.x + 33, plan.y + 7.6], [plan.x + 46, plan.y + 7.6], 0.8, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([plan.x + 33, plan.y + 10.2], [plan.x + 48, plan.y + 10.2], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([plan.x + 3, plan.y + 7.5, 0.8]), at([plan.x + plan.w - 3, plan.y + 7.5, 0.8])], { size: 0.45 }));
  return out.join("");
}

function rails() {
  const out = [];
  for (const x of [-RAIL_X, RAIL_X]) {
    out.push(S(slab({ x: x - 3, y: RAIL_Y0, w: 6, d: RAIL_Y1 - RAIL_Y0, r: 1 }, 0, 4, 3, 0.4), { tone: "mid" }));
    out.push(D([RAIL_Y0 + 8, -60, 40, RAIL_Y1 - 8].map((y) => at([x, y, 4])), { size: 0.4, tone: "lo" }));
    for (const [y0, y1] of [[RAIL_Y0 - 6, RAIL_Y0], [RAIL_Y1, RAIL_Y1 + 6]]) {
      out.push(S(slab({ x: x - 6, y: y0, w: 12, d: y1 - y0, r: 1.2 }, 0, 9, 3, 0.5), { tone: "mid" }));
      out.push(D([at([x - 3, (y0 + y1) / 2, 9]), at([x + 3, (y0 + y1) / 2, 9])], { size: 0.45 }));
    }
  }
  return out.join("");
}

// ── Cards ───────────────────────────────────────────────────────────────────
// One card is one memory file. Its face carries the frontmatter (name, description,
// type), a rule, then the fact itself, its length taken from the real description.
function cardSvg(x, yc, { blank = false, desc = 140, lit = false, id } = {}) {
  const plan = { x: x - 0.4, y: yc - CARD_D / 2, w: 0.8, d: CARD_D, r: 0.2 };
  const face = x + 0.4;
  const y0 = yc - CARD_D / 2;
  const lines = [];
  if (!blank) {
    const head = [[29.4, 12], [27.8, 8 + (desc % 17)], [26.2, 7]];
    for (const [z, len] of head) lines.push(L(onFaceX(face, y0 + 2.4, y0 + 2.4 + len, z), { tone: "lo", free: true }));
    lines.push(L(onFaceX(face, y0, y0 + CARD_D, 24.8), { tone: "faint" }));
    const body = [0.92, 0.74, 0.88, 0.4 + (desc % 5) / 10].map((share) => share * (CARD_D - 4.8));
    body.forEach((len, row) => lines.push(L(onFaceX(face, y0 + 2.4, y0 + 2.4 + len, 22.6 - row * 1.6), { tone: "faint", free: true })));
  }
  const stamp = blank ? "" : `<g data-stamp opacity="0">${L(onFaceX(face, y0 + 2.4, y0 + 14.4, 29.4), { tone: "lit", free: true })}${L(onFaceX(face, y0 + 2.4, y0 + 12 + (desc % 17), 27.8), { tone: "lit", free: true })}${L(onFaceX(face, y0 + 2.4, y0 + 9.4, 26.2), { tone: "lit", free: true })}</g>`;
  return `<g data-card="${id}">${S(slab(plan, CARD_Z, CARD_H, 2), { tone: "hi", crease: "lo", lit, inner: lines.join("") + stamp })}</g>`;
}

// A guide card stands behind each category with its tab at its own place along the top.
function guideSvg(x, yc, index) {
  const plan = { x: x - 0.4, y: yc - CARD_D / 2, w: 0.8, d: CARD_D, r: 0.2 };
  const tab = { x: x - 0.4, y: yc - CARD_D / 2 + 1.5 + index * 7.4, w: 0.8, d: 9, r: 0.4 };
  return S(slab(plan, CARD_Z, CARD_H, 2), { tone: "mid" }) + S(slab(tab, CARD_TOP, 4.5, 2), { tone: "mid" });
}

function follower(x, yc) {
  const plan = { x, y: yc - 14, w: 7, d: 28, r: 1 };
  return S(slab(plan, CARD_Z, 13, 3, 0.4), { tone: "mid" }) + D([at([x + 3.5, yc - 9, CARD_Z + 13]), at([x + 3.5, yc + 9, CARD_Z + 13])], { size: 0.45 }) + L(k.lineOnTop([x + 1.2, yc - 4], [x + 1.2, yc + 4], CARD_Z + 13, P), { tone: "faint" });
}

// ── Trays ───────────────────────────────────────────────────────────────────
// Floor, far walls, cards back to front, near side wall, front wall with its fittings.
function traySvg({ y0, x0 = TRAY_X0, x1 = TRAY_X1, contents, front = true, wallH = WALL_H, frontH = FRONT_H }) {
  const yc = y0 + TRAY_W / 2;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x0, y: y0, w: x1 - x0, d: TRAY_W, r: 2 }, 0, 2, P)}" style="filter:blur(3px)"/>`];
  out.push(S(slab({ x: x0, y: y0, w: x1 - x0, d: TRAY_W, r: 1.6 }, 0, CARD_Z, 3), { tone: "mid" }));
  // The rod channel down the floor, and the two screws that hold the floor to its walls.
  const channel = { x: x0 + 6, y: yc - 1.6, w: x1 - x0 - 14, d: 3.2, r: 1.6 };
  out.push(L(k.planOutline(channel, CARD_Z, P, 4), { tone: "faint" }));
  out.push(D([at([x0 + 4.4, yc, CARD_Z]), at([x1 - 6.4, yc, CARD_Z])], { size: 0.45, tone: "lo" }));
  out.push(S(slab({ x: x0, y: y0, w: 2.8, d: TRAY_W, r: 1 }, CARD_Z, wallH - CARD_Z, 3, 0.4), { tone: "mid" }));
  out.push(S(slab({ x: x0 + 2.8, y: y0, w: x1 - x0 - 6.8, d: 2, r: 0.6 }, CARD_Z, wallH - CARD_Z, 2, 0.3), { tone: "mid" }));
  out.push(contents);
  const side = { x: x0, y: y0 + TRAY_W - 2, w: x1 - x0 - 4, d: 2, r: 0.6 };
  out.push(S(slab(side, CARD_Z, wallH - CARD_Z, 2, 0.3), { tone: "mid", inner: L(k.sideSeam(side, Math.min(9, wallH - 4), P, 2), { tone: "faint" }) }));
  if (front) {
    // One tick per card place along the wall's top edge, a long one every fifth.
    const ticks = k.topTicks(FIRST, x1 - 6, PITCH, 5, side.y + 0.1, wallH, [0.8, 1.5], P, "x");
    out.push(L(ticks.minor, { tone: "faint" }), L(ticks.major, { tone: "lo" }));
  }
  const wall = { x: x1 - 4, y: y0, w: 4, d: TRAY_W, r: 1.2 };
  out.push(S(slab(wall, 0, frontH, 3, 0.6), { tone: "mid" }));
  out.push(D([at([x1 - 2, y0 + 3, frontH]), at([x1 - 2, y0 + TRAY_W - 3, frontH])], { size: 0.45 }));
  if (front) {
    const holder = { x: x1, y: yc - 9, w: 0.6, d: 18, r: 0.3 };
    out.push(S(slab(holder, 13.6, 7, 2), { tone: "mid", crease: "none" }));
    out.push(S(slab({ x: x1 + 0.6, y: yc - 7.6, w: 0.3, d: 15.2, r: 0.1 }, 14.6, 5, 2), { tone: "hi", crease: "none" }));
    out.push(D([at([x1 + 0.6, yc - 8.2, 17.1]), at([x1 + 0.6, yc + 8.2, 17.1])], { size: 0.4 }));
  }
  for (const dy of [-6.6, 5]) out.push(S(slab({ x: x1, y: yc + dy, w: 2.6, d: 1.6, r: 0.4 }, 7, 2, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: x1 + 2.2, y: yc - 7.4, w: 1.8, d: 14.8, r: 0.7 }, 6.4, 3.2, 3, 0.3), { tone: "mid" }));
  out.push(S(slab({ x: x1, y: yc - 1.3, w: 1.4, d: 2.6, r: 0.4 }, 2.6, 2.6, 2), { tone: "mid", crease: "none" }));
  return out.join("");
}

const cardX = (slot) => FIRST + slot * PITCH;
const CARDS = M.TYPES.flatMap((type, index) => M.byType[type].map((memory, slot) => ({ id: memory.id, slot, type, x: cardX(slot), yc: trayMid(index) })));
const SLOT_NEW = cardX(M.byType[M.NEW_TYPE].length);

// Threads sit in the nearest tray (project), each drawn right after the nearest card it
// lands on, so cards in front of that one cover it and a lifted card behind it doesn't.
function catalog(threadsAt) {
  return M.TYPES.map((type, index) => {
    const yc = trayMid(index);
    const memories = M.byType[type];
    const inner = [guideSvg(FIRST - 3.6, yc, index)];
    memories.forEach((memory, slot) => {
      inner.push(threadsAt.before.get(memory.id) ?? "");
      inner.push(cardSvg(cardX(slot), yc, { desc: memory.desc, id: memory.id }));
      inner.push(threadsAt.after.get(memory.id) ?? "");
    });
    // New cards are filed here, after the last card and in front of the follower that keeps them upright.
    inner.push(`<g data-slot="tray-${type}"></g>`);
    const last = cardX(memories.length - 1);
    inner.push(`<g data-part="follower-${type}">${follower(last + 1.6, yc)}</g>`);
    return `<g data-tray="${type}">${traySvg({ y0: trayY(index), contents: inner.join("") })}</g>`;
  }).join("");
}

// The hopper of blank cards: a spring pushes the stack against the front wall.
function hopper() {
  const yc = HOPPER_MID;
  const spring = k.coil(HOPPER.x0 + 2.8, BLANKS[0] - 8.4, [yc, 8], 3.4, 7, "x", P);
  const inner = [
    L(spring.back, { tone: "lo" }),
    S(slab({ x: HOPPER.x0 + 2.8, y: yc - 1, w: BLANKS[0] - 8.4 - HOPPER.x0 - 2.8, d: 2, r: 0.9 }, 7, 2, 3), { tone: "mid", crease: "none" }),
    L(spring.front, { tone: "mid" }),
    follower(BLANKS[0] - 8.4, yc),
    ...BLANKS.map((x) => cardSvg(x, yc, { blank: true, id: "blank" })),
    `<g data-slot="hopper"></g>`,
  ];
  return traySvg({ y0: HOPPER.y, x0: HOPPER.x0, x1: HOPPER.x1, contents: inner.join(""), front: false, wallH: 13, frontH: 15 });
}

// MEMORY.md: one ruled line per memory, its length the real line's length.
const rowLine = (row, chars) => k.lineOnTop([ROW0 + row * ROW, LINE_Y], [ROW0 + row * ROW, LINE_Y + chars * PER_CHAR], DESK_H + 0.5, P);
const ROWS = M.INDEX.map((chars, row) => rowLine(row, chars));
const FRESH = [186, 150, 209, 172, 132, 200].slice(0, MAX_NEW).map((chars, i) => rowLine(M.INDEX.length + i, chars));
function desk() {
  const out = [`<path class="iso-halo" d="${k.haloOf(DESK, 0, DESK_H, P)}" style="filter:blur(3px)"/>`];
  out.push(S(slab(DESK, 0, DESK_H, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(DESK, 2.4, P, 6), { tone: "faint" }) }));
  const drawer = { x: DESK.x + DESK.w, y: DESK.y + 18, w: 0.6, d: DESK.d - 36, r: 0.8 };
  out.push(S(slab(drawer, 4, 7.4, 3), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: drawer.x + 0.6, y: drawer.y + drawer.d / 2 - 6, w: 1.6, d: 12, r: 0.6 }, 6.6, 2.2, 3), { tone: "mid", crease: "none" }));
  out.push(S(slab(SHEET, DESK_H, 0.5, 3), { tone: "lo", crease: "none" }));
  const top = DESK_H + 0.5;
  out.push(L(k.lineOnTop([ROW0 - 2.6, LINE_Y], [ROW0 - 2.6, LINE_Y + 30], top, P), { tone: "mid", free: true }));
  ROWS.forEach((d) => out.push(L(d, { tone: "lo", free: true })));
  // Room for the lines of new cards: each is written lit, then settles to ink like the rest.
  FRESH.forEach((d, i) => out.push(`<g data-fresh="${i}"><g opacity="0">${L(d, { tone: "lo", free: true })}</g><g opacity="0">${L(d, { tone: "lit", free: true })}</g></g>`));
  out.push(`<path data-part="hit" class="iso-line" data-tone="lit" data-free="" opacity="0" d=""/>`);
  const clip = { x: SHEET.x - 2.6, y: SHEET.y + 10, w: 5.2, d: SHEET.d - 20, r: 1.6 };
  out.push(S(slab(clip, top, 2.6, 3, 0.4), { tone: "mid" }));
  out.push(D([at([clip.x + 2.6, clip.y + 4, top + 2.6]), at([clip.x + 2.6, clip.y + clip.d - 4, top + 2.6])], { size: 0.5 }));
  out.push(`<path data-part="scan" class="iso-line" data-tone="lit" data-free="" opacity="0" d=""/>`);
  return out.join("");
}

// ── Threads ([[links]]) ─────────────────────────────────────────────────────
const cardOf = (id) => CARDS.find((card) => card.id === id);
const threadPoints = (a, b, liftA = 0) => {
  const from = [a.x, a.yc, CARD_TOP + liftA];
  const to = [b.x, b.yc, CARD_TOP];
  const span = Math.hypot(b.x - a.x, b.yc - a.yc);
  const rise = Math.min(6 + span * 0.18, 78 - Math.max(from[2], to[2]));
  const points = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    points.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t + Math.sin(Math.PI * t) * rise]);
  }
  return points;
};
const pairOf = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
// Every [[link]] once, whichever card wrote it.
const PAIRS = [...new Map(M.LINKS.map(([a, b]) => [pairOf(a, b), [Math.min(a, b), Math.max(a, b)]])).values()];
function threads() {
  const types = M.MEMORIES.map((memory) => memory.type);
  const nearest = (ids) => ids.map(cardOf).filter((card) => card.type === "project").sort((a, b) => b.slot - a.slot)[0];
  const before = new Map(), after = new Map();
  const add = (map, id, svg) => map.set(id, (map.get(id) ?? "") + svg);
  // A thread inside one tray would lie along the cards, so only threads between trays are drawn at rest.
  // When either end card lifts, the page hides this one and draws it live, from the same curve.
  for (const [a, b] of PAIRS) {
    if (types[a] === types[b]) continue;
    const points = threadPoints(cardOf(a), cardOf(b)).map(at);
    add(after, nearest([a, b]).id, k.wireSvg(points[0], points[points.length - 1], { via: points.slice(1, -1), tone: "faint", size: 0.7 }).replace('<g class="iso-wire"', `<g class="iso-wire" data-pair="${pairOf(a, b)}"`));
  }
  return { before, after };
}

// ── Gantry ──────────────────────────────────────────────────────────────────
function truck(x) {
  const plan = { x: x - 6, y: -10, w: 12, d: 20, r: 2 };
  const out = [S(slab(plan, 4, 8, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, 7, P, 4), { tone: "faint" }) })];
  out.push(D(k.corners(plan, 2.4).map(([px, py]) => at([px, py, 12])), { size: 0.45 }));
  out.push(S(slab({ x: x - 4.5, y: -6, w: 9, d: 12, r: 1.4 }, 12, 4, 3, 0.4), { tone: "mid" }));
  return out.join("");
}
function post(x) {
  const out = [S(slab({ x: x - 3, y: -3, w: 6, d: 6, r: 1 }, 16, BEAM_Z - 16, 3, 0.4), { tone: "mid", inner: L(k.sideSeam({ x: x - 3, y: -3, w: 6, d: 6, r: 1 }, 50, P, 3), { tone: "faint" }) })];
  return out.join("");
}
function bridgeFar() {
  return truck(-RAIL_X) + post(-RAIL_X);
}
function bridgeNear() {
  const out = [truck(RAIL_X)];
  out.push(S(slab({ x: RAIL_X + 6, y: -0.8, w: 7.4, d: 1.6, r: 0.4 }, 7, 1.2, 2), { tone: "hi", crease: "none", lit: false }));
  out.push(post(RAIL_X));
  const beam = { x: -RAIL_X - 8, y: -BEAM_H / 2, w: RAIL_X * 2 + 16, d: BEAM_H, r: 1.6 };
  out.push(S(slab(beam, BEAM_Z, BEAM_H, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(beam, BEAM_Z + 2.4, P, 3), { tone: "faint" }) }));
  const strip = { x: -60, y: -1.6, w: 120, d: 3.2, r: 0.6 };
  out.push(S(slab(strip, BEAM_Z + BEAM_H, 0.4, 2), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 2, strip.x + strip.w - 2, 4, 5, strip.y + 0.1, BEAM_Z + BEAM_H + 0.4, [1.2, 2.4], P, "x");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([-RAIL_X - 4, -RAIL_X + 4, RAIL_X - 4, RAIL_X + 4].map((x) => at([x, 0, BEAM_Z + BEAM_H])), { size: 0.5 }));
  return out.join("");
}

// The head: a plate riding the beam, the rod with its gripper, and the bushing it slides in.
const ROD = (tip0) => S(k.cylinder(0, HEAD_DY, 1.5, tip0 + 4, ROD_L, P, 20), { tone: "mid", crease: "none" }) + S(k.cylinder(0, HEAD_DY, 2.4, tip0 + 4 + ROD_L, 3, P, 20), { tone: "mid" }) + L(k.knurl(0, HEAD_DY, 2.4, tip0 + 4 + ROD_L, tip0 + 7 + ROD_L, 14, P), { tone: "lo" });
function headPlate() {
  const plate = { x: -10, y: BEAM_H / 2, w: 20, d: 3, r: 0.8 };
  const out = [S(slab(plate, BUSH_Z - 2, BEAM_Z + BEAM_H + 3 - BUSH_Z + 2, 3, 0.4), { tone: "mid" })];
  const hat = { x: -10, y: -BEAM_H / 2 - 1.4, w: 20, d: BEAM_H + 1.4 + 3, r: 1 };
  out.push(S(slab(hat, BEAM_Z + BEAM_H, 3, 3, 0.4), { tone: "mid" }));
  out.push(D([at([-6, -1.6, BEAM_Z + BEAM_H + 3]), at([6, -1.6, BEAM_Z + BEAM_H + 3])], { size: 0.45 }));
  out.push(D([[-7, BEAM_Z + 4], [7, BEAM_Z + 4], [-7, BUSH_TOP + 0.5], [7, BUSH_TOP + 0.5]].map(([x, z]) => at([x, BEAM_H / 2 + 3, z])), { size: 0.45 }));
  return out.join("");
}
function gripper() {
  const bar = { x: -2.2, y: HEAD_DY - 17.6, w: 4.4, d: 35.2, r: 1.2 };
  const out = [];
  for (const y of [bar.y + 0.2, bar.y + bar.d - 1.6]) out.push(S(slab({ x: -1.6, y, w: 3.2, d: 1.4, r: 0.3 }, -2.4, 2.4, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab(bar, 0, 4, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(bar, 1.8, P, 3), { tone: "faint" }) }));
  out.push(D([at([0, bar.y + 3, 4]), at([0, bar.y + bar.d - 3, 4])], { size: 0.45 }));
  out.push(S(k.cylinder(0, HEAD_DY, 3, 4, 2, P, 20), { tone: "mid" }));
  return out.join("");
}
function bushing() {
  const plan = { x: -5, y: BEAM_H / 2 + 3, w: 10, d: 10, r: 1.6 };
  return S(slab(plan, BUSH_Z, BUSH_TOP - BUSH_Z, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, BUSH_Z + 3, P, 3), { tone: "faint" }) }) + L(k.ring(0, HEAD_DY, 2.2, BUSH_TOP, P, 20), { tone: "lo" });
}
const [axisX, axisY] = at([0, HEAD_DY, BUSH_TOP]);
const ROD_CLIP = `M${(axisX - 12).toFixed(1)} -400H${(axisX + 12).toFixed(1)}V${axisY.toFixed(1)}H${(axisX - 12).toFixed(1)}Z`;

function head() {
  return [
    headPlate(),
    `<g data-part="rod" transform="${k.translateAlong(P, [0, 0, REST_TIP])}">${gripper()}${ROD(0)}</g>`,
    bushing(),
    `<clipPath id="rod-above"><path d="${ROD_CLIP}"/></clipPath>`,
    `<g clip-path="url(#rod-above)"><g data-part="rod-top" transform="${k.translateAlong(P, [0, 0, REST_TIP])}">${ROD(0)}</g></g>`,
  ].join("");
}

// ── Assemble ────────────────────────────────────────────────────────────────
const START = { hx: -20, hy: HOPPER_MID, tip: REST_TIP };
const bridgeAt = (hx, hy) => k.translateAlong(P, [0, hy - HEAD_DY, 0]);
const catalogSvg = catalog(threads());
const NEW_CARD = cardSvg(PICK_X, HOPPER_MID, { desc: 125, id: "new" });

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A card catalog on a bench, read and filed by a gantry. Four open trays hold one card per memory file, sorted by type: user, feedback, reference and project, far to near, 1, 2, 4 and 32 cards. A hopper of blank cards and a desk holding MEMORY.md, one ruled line per card, sit in front. Threads join cards that link to each other. A gripper on the gantry takes a blank card, files it in its tray, updates a card in place, adds its index line, reads a card back and follows its threads. The reader can send it to any card, or have it write and file new ones.",
  body: [
    base(),
    ruler(),
    plate(),
    rails(),
    `<g data-part="bridge-far" transform="${bridgeAt(START.hx, START.hy)}">${bridgeFar()}</g>`,
    catalogSvg,
    `<g data-slot="threads"></g>`,
    `<g data-hopper>${hopper()}</g>`,
    `<g data-desk>${desk()}</g>`,
    `<g data-slot="carried"></g>`,
    `<g data-part="bridge-near" transform="${bridgeAt(START.hx, START.hy)}">${bridgeNear()}</g>`,
    `<g data-part="head" transform="${k.translateAlong(P, [START.hx, START.hy - HEAD_DY, 0])}">${head()}</g>`,
    `<template data-new>${NEW_CARD}</template>`,
  ],
});

// ── Live: the gantry runs jobs from wherever it stands ──────────────────────
// The reader gives it jobs (recall a card, write one, file it, read the index); when nobody
// does, it tours the six stages. Every job is built from the same few moves.
const cardHome = Object.fromEntries(CARDS.map((card) => [card.id, [card.x, card.yc]]));
const neighbours = (id) => [...new Set([...M.outOf(id), ...M.into(id)])];
const DATA = {
  P,
  HOME: cardHome,
  ORDER: CARDS.map((card) => card.id),
  TYPES: M.TYPES,
  TYPE_OF: M.MEMORIES.map((memory) => memory.type),
  KB: M.MEMORIES.map((memory) => +(memory.bytes / 1024).toFixed(1)),
  NEIGH: M.MEMORIES.map((memory) => neighbours(memory.id)),
  PAIRS: PAIRS.map(([a, b]) => [a, b, M.MEMORIES[a].type !== M.MEMORIES[b].type ? 1 : 0]),
  TRAY_Y: Object.fromEntries(M.TYPES.map((type, index) => [type, trayMid(index)])),
  COUNT: Object.fromEntries(M.TYPES.map((type) => [type, M.byType[type].length])),
  // A tray is full when the follower behind its last card would meet the front wall.
  CAP: Math.floor((TRAY_X1 - 4 - 8.6 - FIRST) / PITCH) + 1,
  ROWS,
  TOPS: Object.fromEntries(CARDS.map((card) => [card.id, [...at([card.x + 0.4, card.yc - CARD_D / 2, CARD_TOP]), ...at([card.x + 0.4, card.yc + CARD_D / 2, CARD_TOP])].map((v) => +v.toFixed(1))])),
  LINKS: M.LINKS.length,
  FILES: M.MEMORIES.length,
  C: { HEAD_DY, CARD_TOP, WALL_H, PICK_X, HOPPER_MID, PITCH, FIRST, ROW0, ROW, LINE_Y, DESK_TOP: DESK_H + 0.5, SHEET_Y1: SHEET.y + SHEET.d - 4, REST: REST_TIP, LIFT: LIFT_TIP, DESK_Y: 98, DESK_TIP: 26, HOME_X: START.hx, INDEX: M.INDEX.length, MAX_NEW, MANAGED: M.MANAGED, RECALLED: M.RECALLED, NEW_TYPE: M.NEW_TYPE },
};

const live = `
const D = ${JSON.stringify(DATA)};
const P = D.P, C = D.C;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const q = (sel) => svg.querySelector(sel);
const parts = { far: q('[data-part="bridge-far"]'), near: q('[data-part="bridge-near"]'), head: q('[data-part="head"]'), rod: q('[data-part="rod"]'), rodTop: q('[data-part="rod-top"]'), scan: q('[data-part="scan"]'), hit: q('[data-part="hit"]') };
const followers = {}, traySlots = {};
for (const type of D.TYPES) { followers[type] = q('[data-part="follower-' + type + '"]'); traySlots[type] = q('[data-slot="tray-' + type + '"]'); }
const slots = { hopper: q('[data-slot="hopper"]'), carried: q('[data-slot="carried"]'), threads: q('[data-slot="threads"]') };
const tpl = q("template[data-new]");
const cards = {};
for (const id of D.ORDER) cards[id] = q('[data-card="' + id + '"]');
const statics = {};
svg.querySelectorAll("[data-pair]").forEach((g) => (statics[g.dataset.pair] = statics[g.dataset.pair] || []).push(g));
const fresh = [...svg.querySelectorAll("[data-fresh]")].map((g) => ({ lo: g.children[0], lit: g.children[1], ink: [0, 0], glow: [0, 0], until: 0 }));
const readout = document.querySelector("[data-readout]");
const announcer = stage.querySelector("[data-live]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const ease = (t) => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ── State ──
const head = { hx: C.HOME_X, hy: C.HOPPER_MID, tip: C.REST };
const shown = { ...head };
let held = null, mine = false, fromTour = false, heldEl = null, hopperCard = null, hover = null, sel = -1, zone = null, focus = null, jobCard = null, reserved = null;
let say = "1 store · one fact, one file", written = 0, pending = 0, clockNow = 0, stampEl = null, hitRow = -1;
const extras = []; // new cards filed this visit: { el, type }
const fades = [];
const lift = {}, peeked = new Set();
const fx = { stamp: [0, 0], scan: [0, 0], link: [0, 0], hit: [0, 0] }; // [shown, target]
const shift = {};
for (const type of D.TYPES) shift[type] = [0, 0];
const holding = () => held === "new" && mine;
const countIn = (type) => D.COUNT[type] + extras.filter((e) => e.type === type).length;
const fileCount = () => D.FILES + extras.length;
const lineCount = () => C.INDEX + written;
const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");
const describe = (id) => D.TYPE_OF[id] + " card · " + D.KB[id] + " KB · " + plural(D.NEIGH[id].length, "link");

function spawn(fade) {
  slots.hopper.insertAdjacentHTML("beforeend", tpl.innerHTML);
  hopperCard = slots.hopper.lastElementChild;
  if (fade) { hopperCard.setAttribute("opacity", "0"); fades.push({ el: hopperCard, v: 0, to: 1 }); }
}
function grip(id) {
  held = id;
  heldEl = id === "new" ? hopperCard : cards[id];
  // A new card the tour picked up is the tour's; the reader files only a card it asked for.
  if (id === "new") { hopperCard = null; mine = !fromTour; }
  heldEl.firstElementChild.setAttribute("data-lit", "");
}
function letGo() {
  // A card set down keeps the height it had, then settles: nothing jumps.
  if (held !== "new") lift[held] = shown.tip - C.CARD_TOP;
  heldEl.firstElementChild.removeAttribute("data-lit");
  held = null; heldEl = null;
}
function putBack() {
  const el = heldEl;
  letGo();
  hopperCard = el;
  slots.hopper.appendChild(el);
  setT(el, "");
}
function fileNew(type) {
  const el = heldEl, x = C.FIRST + countIn(type) * C.PITCH;
  letGo();
  reserved = null;
  traySlots[type].appendChild(el);
  setT(el, translateAlong(P, [x - C.PICK_X, D.TRAY_Y[type] - C.HOPPER_MID, 0]));
  extras.push({ el, type });
  pending++;
  spawn(true);
}
function clearExtras() {
  for (const e of extras) if (!e.gone) {
    e.gone = true;
    fades.push({ el: e.el, v: 1, to: 0, done: () => { e.el.remove(); extras.splice(extras.indexOf(e), 1); } });
  }
  for (const f of fresh) f.ink[1] = 0;
  written = pending = 0;
}
function startLink(id) { focus = id; peeked.clear(); for (const n of D.NEIGH[id]) peeked.add(n); fx.link[1] = 1; }
function endLink() { fx.link[1] = 0; peeked.clear(); }

// ── Steps and jobs ──
// A step moves the head to a goal, waits, or acts; a job is a list of steps built when it starts.
let steps = [], step = null, from = null, queue = [], touring = !still.matches, tourAt = 0;
const safe = () => (held === null ? C.REST : C.LIFT);
const to = (x, y, tip, more) => Object.assign({ to: () => [x, y, tip] }, more);
const up = (more) => Object.assign({ to: () => [head.hx, head.hy, Math.max(head.tip, safe())] }, more);
const travel = (x, y, more) => [up(more), { to: () => [x, y, safe()] }];
const act = (end, more) => Object.assign({ dur: 0.15, end, keep: true }, more);
const pause = (dur, more) => Object.assign({ dur }, more);
const tag = (n, text) => (n ? n + " " : "") + text;

function tidy() {
  if (held === "new") return [...travel(C.PICK_X, C.HOPPER_MID), to(C.PICK_X, C.HOPPER_MID, C.CARD_TOP), act(putBack), to(C.PICK_X, C.HOPPER_MID, C.REST)];
  if (held === null) return [];
  return returnSteps(held, true);
}
function returnSteps(id, go) {
  const [x, y] = D.HOME[id];
  return [...(go ? travel(x, y) : []), to(x, y, C.CARD_TOP), act(letGo), to(x, y, C.REST)];
}
const stamping = () => pause(1.4, { start: () => { stampEl = heldEl; fx.stamp[1] = 1; }, end: () => (fx.stamp[1] = 0) });
function store(n, ask = true) {
  // A card already in the gripper is taken over as it is.
  const asking = pause(0, { start: () => (mine = !fromTour), say: "categorise · now click a tray" });
  if (held === "new") return ask ? [asking] : [];
  return [...tidy(), ...travel(C.PICK_X, C.HOPPER_MID, { say: tag(n, "store · one fact, one file") }), to(C.PICK_X, C.HOPPER_MID, C.CARD_TOP), act(() => grip("new")), to(C.PICK_X, C.HOPPER_MID, C.LIFT, { say: tag(n, "store · name, description, type") }), stamping(), ...(ask ? [asking] : [])];
}
function file(type, n, index = true) {
  if (countIn(type) >= D.CAP) return [pause(1.6, { say: "the " + type + " tray is full" })];
  if (written + pending >= C.MAX_NEW) return [pause(1.6, { say: "the index sheet is full · Esc clears new cards" })];
  const x = () => C.FIRST + countIn(type) * C.PITCH, y = D.TRAY_Y[type];
  return [
    ...store(n, false),
    // The follower slides forward first, to open the gap the card drops into.
    up({ start: () => (reserved = type), say: () => tag(n, "categorise · type: " + type + " · " + plural(countIn(type) + 1, "card")) }),
    { to: () => [x(), y, C.LIFT] },
    { to: () => [head.hx, head.hy, C.CARD_TOP] },
    act(() => fileNew(type)),
    { to: () => [head.hx, head.hy, C.REST] },
    ...(index ? [{ expand: () => indexSteps(0) }] : []),
  ];
}
function indexSteps(n) {
  const writing = pending > 0, row = writing ? C.INDEX + written : C.INDEX - 1;
  const x0 = C.ROW0 - 3, x1 = C.ROW0 + row * C.ROW;
  return [
    ...tidy(),
    ...travel(x0, C.DESK_Y),
    to(x0, C.DESK_Y, C.DESK_TIP),
    { to: () => [x1, C.DESK_Y, C.DESK_TIP], dur: 0.8 + row * 0.07, start: () => (fx.scan[1] = 1), say: tag(n, writing ? "index · writing line " + (row + 1) + " of MEMORY.md" : "index · MEMORY.md · " + lineCount() + " lines, read every session") },
    ...(writing ? [act(() => { const f = fresh[written++]; pending--; f.ink[1] = 1; f.until = clockNow + 1.6; }, { dur: 0.9, say: tag(n, "index · MEMORY.md · " + (row + 1) + " lines") })] : []),
    pause(0.3, { start: () => (fx.scan[1] = 0) }),
    { to: () => [head.hx, head.hy, C.REST] },
  ];
}
function linkSteps(id, n, calm) {
  const [x, y] = D.HOME[id], count = D.NEIGH[id].length;
  if (!count) return [pause(1.2, { say: tag(n, "link · no threads from this card") })];
  const say = tag(n, "link · " + plural(count, "thread") + " of " + D.LINKS);
  if (calm) return [to(x, y, 52), act(() => startLink(id), { say })];
  return [to(x, y, 52), pause(3.6, { start: () => startLink(id), end: endLink, say })];
}
function recall(id, n, links = true, back = true) {
  // Under reduced motion a recall ends still, with the card up and its threads lit.
  const calm = still.matches;
  if (calm) back = false;
  jobCard = id;
  if (held === id) return [...(links ? linkSteps(id, n, calm) : []), ...(back ? returnSteps(id) : [])];
  const [x, y] = D.HOME[id], rx = C.ROW0 + id * C.ROW;
  return [
    ...tidy(),
    // The agent reads the index first: the scan stops on the line whose description matches.
    ...travel(C.ROW0 - 3, C.DESK_Y, { say: tag(n, "recall · reading MEMORY.md") }),
    to(C.ROW0 - 3, C.DESK_Y, C.DESK_TIP),
    { to: () => [rx, C.DESK_Y, C.DESK_TIP], dur: 0.6 + id * 0.06, start: () => (fx.scan[1] = 1) },
    pause(0.8, { start: () => { hitRow = id; fx.hit[1] = 1; }, say: tag(n, "recall · line " + (id + 1) + " matches") }),
    { to: () => [head.hx, head.hy, C.REST], start: () => (fx.scan[1] = 0), end: () => (fx.hit[1] = 0) },
    ...travel(x, y),
    to(x, y, C.CARD_TOP),
    act(() => grip(id)),
    to(x, y, C.LIFT, { say: n ? tag(n, "recall · " + lineCount() + " lines read, 1 card opened") : "recall · " + describe(id) }),
    ...(links ? linkSteps(id, n, calm) : [pause(0.6)]),
    ...(back ? returnSteps(id) : []),
  ];
}
function manage(id, n) {
  const [x, y] = D.HOME[id];
  jobCard = id;
  const take = held === id ? [] : [...tidy(), ...travel(x, y), to(x, y, C.CARD_TOP), act(() => grip(id))];
  return [...take, to(x, y, 50, { say: tag(n, "manage · updated in place · " + fileCount() + " files") }), stamping(), ...returnSteps(id)];
}
function reset() {
  return [...tidy(), pause(extras.length ? 1.1 : 0, { start: clearExtras }), ...travel(C.HOME_X, C.HOPPER_MID)];
}
const TOUR = [
  () => store(1, false),
  () => file(C.NEW_TYPE, 2, false),
  () => manage(C.MANAGED, 3),
  () => indexSteps(4),
  () => recall(C.RECALLED, 5, false, false),
  () => [...recall(C.RECALLED, 6), ...travel(C.HOME_X, C.HOPPER_MID)],
  reset,
];

function begin(s) {
  step = s; s.t = 0; from = { ...head };
  s.goal = s.to ? s.to() : null;
  if (s.dur === undefined) {
    const run = s.goal ? Math.hypot(s.goal[0] - head.hx, s.goal[1] - head.hy) : 0, rise = s.goal ? Math.abs(s.goal[2] - head.tip) : 0;
    s.dur = run + rise > 0.5 ? 0.3 + run / 120 + rise / 50 : 0;
  }
  if (s.say !== undefined) say = typeof s.say === "function" ? s.say() : s.say;
  if (s.start) s.start();
}
function advance(dt) {
  for (let guard = 0; guard < 64; guard++) {
    if (!step) {
      if (!steps.length) {
        if (!queue.length) {
          jobCard = null;
          if (!touring) return;
          queue.push(TOUR[tourAt]);
          tourAt = (tourAt + 1) % TOUR.length;
          fromTour = true;
        }
        steps = queue.shift()();
        continue;
      }
      const next = steps.shift();
      if (next.expand) { steps.unshift(...next.expand()); continue; }
      begin(next);
    }
    step.t += dt;
    if (!still.matches) dt = 0;
    const f = step.dur > 0 ? clamp(step.t / step.dur, 0, 1) : 1;
    if (step.goal) {
      const e = ease(f);
      head.hx = from.hx + (step.goal[0] - from.hx) * e;
      head.hy = from.hy + (step.goal[1] - from.hy) * e;
      head.tip = from.tip + (step.goal[2] - from.tip) * e;
    }
    if (f < 1) return;
    const done = step;
    step = null;
    if (done.end) done.end();
  }
}
// A new job takes over at once; only a grip or a release is let finish.
function command(job) {
  touring = false;
  fromTour = false;
  if (step && !step.keep) step = null;
  steps = [];
  queue = [job];
  fx.stamp[1] = fx.scan[1] = fx.hit[1] = 0;
  endLink();
  reserved = null;
  touched();
}

// ── Drawing ──
const applied = new Map();
function setT(el, value) { if (applied.get(el) !== value) { el.setAttribute("transform", value); applied.set(el, value); } }
function follow(pair, k) { pair[0] += (pair[1] - pair[0]) * k; if (Math.abs(pair[1] - pair[0]) < 0.002) pair[0] = pair[1]; return pair[0] !== pair[1]; }
const liftOf = (id) => (held === id ? shown.tip - C.CARD_TOP : lift[id] || 0);
const wires = new Map();
function wireFor(key) {
  let g = wires.get(key);
  if (!g) {
    slots.threads.insertAdjacentHTML("beforeend", '<g class="iso-wire" data-tone="faint"><path class="iso-line" data-tone="faint" d=""/><circle class="iso-wire-end" r="0.7"/><circle class="iso-wire-end" r="0.7"/></g>');
    g = slots.threads.lastElementChild;
    wires.set(key, g);
  }
  return g;
}
// The same curve the build drew, with each end riding its card.
function threadPath(a, b, la, lb) {
  const A = D.HOME[a], B = D.HOME[b], za = C.CARD_TOP + la, zb = C.CARD_TOP + lb;
  const span = Math.hypot(B[0] - A[0], B[1] - A[1]), rise = Math.min(6 + span * 0.18, 78 - Math.max(za, zb));
  const pts = [];
  for (let j = 0; j <= 16; j++) { const t = j / 16; pts.push(iso([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, za + (zb - za) * t + Math.sin(Math.PI * t) * rise], P)); }
  return pts;
}
function threads() {
  const glow = fx.link[0];
  for (const [a, b, cross] of D.PAIRS) {
    const key = a + "-" + b, la = liftOf(a), lb = liftOf(b);
    const onFocus = focus !== null && (a === focus || b === focus) && glow > 0.005;
    // Threads inside one tray are not drawn at rest, so they fade in with the link stage.
    const on = cross ? Math.abs(la) > 0.01 || Math.abs(lb) > 0.01 || onFocus : onFocus;
    for (const g of statics[key] || []) { const display = on ? "none" : ""; if (g.style.display !== display) g.style.display = display; }
    const g = on ? wireFor(key) : wires.get(key);
    if (!g) continue;
    if (!on) { if (g.style.display !== "none") g.style.display = "none"; continue; }
    g.style.display = "";
    const pts = threadPath(a, b, la, lb);
    g.firstElementChild.setAttribute("d", pathOf(pts));
    const [e0, e1] = g.querySelectorAll("circle");
    e0.setAttribute("cx", pts[0][0].toFixed(1)); e0.setAttribute("cy", pts[0][1].toFixed(1));
    e1.setAttribute("cx", pts[16][0].toFixed(1)); e1.setAttribute("cy", pts[16][1].toFixed(1));
    g.setAttribute("opacity", cross ? "1" : glow.toFixed(3));
    const tone = onFocus && glow > 0.5 ? "lit" : "faint";
    if (g.dataset.tone !== tone) {
      g.dataset.tone = tone;
      const line = g.firstElementChild;
      line.dataset.tone = tone;
      // Data runs along a lit thread, out from the card in the gripper.
      if (tone === "lit" && !still.matches) line.setAttribute("data-flow", ""); else line.removeAttribute("data-flow");
    }
  }
}
function readoutText() {
  // While a job the reader asked for runs, its progress wins over what the pointer is on.
  if (!fromTour && (step || steps.length || queue.length)) return say;
  if (hover !== null) return describe(hover);
  if (zone === "hopper") return holding() ? "hopper · put the card back" : "hopper · click to write a card";
  if (zone === "desk") return "MEMORY.md · " + lineCount() + " lines · click to read it";
  if (zone && holding()) return "file it under " + zone;
  if (zone) return "click to write a " + zone + " card";
  return say;
}
let lastText = "", lastSay = "", lastHit = -1;
function draw(dt) {
  const calm = still.matches;
  const k = calm ? 1 : 1 - Math.exp(-dt / 0.12);
  const kf = calm ? 1 : 1 - Math.exp(-dt / 0.2);
  let moving = false;
  for (const key of ["hx", "hy", "tip"]) {
    shown[key] += (head[key] - shown[key]) * k;
    if (Math.abs(head[key] - shown[key]) < 0.01) shown[key] = head[key]; else moving = true;
  }
  const by = shown.hy - C.HEAD_DY;
  setT(parts.far, translateAlong(P, [0, by, 0]));
  setT(parts.near, translateAlong(P, [0, by, 0]));
  setT(parts.head, translateAlong(P, [shown.hx, by, 0]));
  const rod = translateAlong(P, [0, 0, shown.tip]);
  setT(parts.rod, rod);
  setT(parts.rodTop, rod);
  // Filed cards: the held one rides the gripper; a pointed-at card is thumbed up; linked cards rise.
  for (const id of D.ORDER) {
    if (held === id) { setT(cards[id], translateAlong(P, [0, 0, shown.tip - C.CARD_TOP])); continue; }
    const goal = (peeked.has(id) ? 6 : 0) + (hover === id && id !== jobCard ? 3 : 0);
    let v = lift[id] || 0;
    v += (goal - v) * k;
    if (Math.abs(goal - v) < 0.01) v = goal; else moving = true;
    lift[id] = v;
    setT(cards[id], v ? translateAlong(P, [0, 0, v]) : "");
  }
  if (held === "new") {
    const dz = shown.tip - C.CARD_TOP;
    setT(heldEl, translateAlong(P, [shown.hx - C.PICK_X, shown.hy - C.HOPPER_MID, dz]));
    let slot = slots.carried;
    if (dz <= C.WALL_H + 2) {
      if (Math.abs(shown.hy - C.HOPPER_MID) < 30) slot = slots.hopper;
      else slot = traySlots[D.TYPES.reduce((best, type) => (Math.abs(D.TRAY_Y[type] - shown.hy) < Math.abs(D.TRAY_Y[best] - shown.hy) ? type : best))];
    }
    if (heldEl.parentNode !== slot) slot.appendChild(heldEl);
  }
  for (const type of D.TYPES) {
    shift[type][1] = C.PITCH * (extras.filter((e) => e.type === type).length + (reserved === type ? 1 : 0));
    if (follow(shift[type], kf)) moving = true;
    setT(followers[type], shift[type][0] ? translateAlong(P, [shift[type][0], 0, 0]) : "");
  }
  for (let i = fades.length - 1; i >= 0; i--) {
    const f = fades[i];
    f.v += (f.to - f.v) * kf;
    if (Math.abs(f.to - f.v) < 0.01) { f.v = f.to; fades.splice(i, 1); if (f.done) f.done(); } else moving = true;
    f.el.setAttribute("opacity", f.v.toFixed(3));
  }
  const kx = calm ? 1 : 1 - Math.exp(-dt / 0.15);
  for (const key in fx) if (follow(fx[key], kx)) moving = true;
  if (focus !== null && !fx.link[0] && !fx.link[1]) focus = null;
  if (stampEl) {
    const stamp = stampEl.querySelector("[data-stamp]");
    if (stamp) stamp.setAttribute("opacity", fx.stamp[0].toFixed(3));
    if (!fx.stamp[0] && !fx.stamp[1]) stampEl = null;
  }
  parts.scan.setAttribute("opacity", fx.scan[0].toFixed(3));
  if (fx.scan[0] > 0) parts.scan.setAttribute("d", lineOnTop([shown.hx, C.LINE_Y - 2], [shown.hx, C.SHEET_Y1], C.DESK_TOP + 0.05, P));
  if (hitRow !== lastHit) { parts.hit.setAttribute("d", D.ROWS[hitRow] || ""); lastHit = hitRow; }
  parts.hit.setAttribute("opacity", fx.hit[0].toFixed(3));
  for (const f of fresh) {
    f.glow[1] = clockNow < f.until ? 1 : 0;
    if (follow(f.ink, kf) | follow(f.glow, kf) || f.until > clockNow) moving = true;
    f.lo.setAttribute("opacity", f.ink[0].toFixed(3));
    f.lit.setAttribute("opacity", f.glow[0].toFixed(3));
  }
  threads();
  stage.toggleAttribute("data-holding", holding());
  const text = readoutText();
  if (text !== lastText) { readout.textContent = text; lastText = text; }
  if (say !== lastSay) { announcer.textContent = say; lastSay = say; }
  return moving;
}

// ── Clock ──
let frame = 0, last = 0, visible = false, idleTimer = 0;
function tick(t) {
  const dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
  last = t;
  clockNow += dt;
  advance(still.matches ? Infinity : dt);
  const moving = draw(dt);
  const busy = moving || step || steps.length || queue.length || touring;
  frame = visible && busy ? requestAnimationFrame(tick) : 0;
}
function wake() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
// After a quiet spell the bench tidies itself and the tour starts again.
function touched() { clearTimeout(idleTimer); if (!still.matches) idleTimer = setTimeout(resume, 12000); wake(); }
function resume() {
  if (step || steps.length || queue.length || hover !== null) { idleTimer = setTimeout(resume, 3000); return; }
  touring = true;
  tourAt = TOUR.length - 1;
  wake();
}
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) wake(); }, { rootMargin: "120px 0px" }).observe(stage);

// ── Input ──
const pt = svg.createSVGPoint();
function toSegment(p, [x1, y1, x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1, t = clamp(((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(p.x - x1 - dx * t, p.y - y1 - dy * t);
}
function pick(event) {
  const target = event.target.closest ? event.target : event.target.parentElement;
  const tray = target.closest("[data-tray]");
  if (tray) {
    // Cards stand 3 apart and show only a sliver of face, so the top edge nearest the pointer
    // wins; away from every edge, the card under the pointer (the front card's broad face).
    pt.x = event.clientX; pt.y = event.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    let best = null, reach = 2.5;
    for (const id of D.ORDER) {
      if (D.TYPE_OF[id] !== tray.dataset.tray) continue;
      const d = toSegment(p, D.TOPS[id]);
      if (d < reach) { reach = d; best = id; }
    }
    if (best !== null) return { card: best };
    const card = target.closest("[data-card]");
    if (card && D.HOME[card.dataset.card]) return { card: Number(card.dataset.card) };
    return { tray: tray.dataset.tray };
  }
  if (target.closest("[data-hopper]")) return { zone: "hopper" };
  if (target.closest("[data-desk]")) return { zone: "desk" };
  return {};
}
stage.addEventListener("pointermove", (event) => {
  const found = pick(event);
  const id = found.card !== undefined && !holding() ? found.card : null;
  const place = found.zone || found.tray || (found.card !== undefined ? D.TYPE_OF[found.card] : null);
  if (id === hover && place === zone) return;
  hover = id;
  zone = id === null ? place : null;
  if (id !== null) sel = D.ORDER.indexOf(id);
  wake();
});
stage.addEventListener("pointerleave", () => { hover = null; zone = null; wake(); });
stage.addEventListener("click", (event) => {
  const found = pick(event);
  if (found.card !== undefined) {
    const id = found.card;
    if (holding()) return command(() => file(D.TYPE_OF[id], 0));
    if (held === id && !step) return command(() => returnSteps(id));
    return command(() => recall(id, 0));
  }
  if (found.tray) return command(() => file(found.tray, 0));
  if (found.zone === "hopper") return command(() => (holding() ? tidy() : store(0)));
  if (found.zone === "desk") return command(() => indexSteps(0));
});
const TRAY_KEYS = { u: "user", f: "feedback", r: "reference", p: "project" };
stage.addEventListener("keydown", (event) => {
  const key = event.key, lower = key.toLowerCase();
  let job = null;
  if (/^[1-6]$/.test(key)) job = TOUR[Number(key) - 1];
  else if (key === "ArrowRight" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowUp") {
    const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
    sel = (sel + step + D.ORDER.length) % D.ORDER.length;
    hover = D.ORDER[sel];
    zone = null;
    touched();
  } else if ((key === "Enter" || key === " ") && hover !== null) {
    const id = hover;
    const filing = holding();
    job = () => (filing ? file(D.TYPE_OF[id], 0) : recall(id, 0));
  } else if (lower === "n") job = () => store(0);
  else if (TRAY_KEYS[lower]) job = () => file(TRAY_KEYS[lower], 0);
  else if (lower === "i") job = () => indexSteps(0);
  else if (key === "Escape") { hover = null; job = reset; }
  else return;
  event.preventDefault();
  if (job) command(job);
});
stage.addEventListener("blur", () => { if (hover !== null) { hover = null; wake(); } });

spawn(false);
if (still.matches) {
  // One still frame: the recalled card up, its threads lit.
  const [x, y] = D.HOME[C.RECALLED];
  Object.assign(head, { hx: x, hy: y, tip: 52 });
  Object.assign(shown, head);
  grip(C.RECALLED);
  startLink(C.RECALLED);
  fx.link[0] = 1;
  say = "6 link · " + plural(D.NEIGH[C.RECALLED].length, "thread") + " of " + D.LINKS;
}
draw(1 / 60);
`;

const STRETCH = `<style>
.iso-stage{position:relative;touch-action:pan-y;-webkit-tap-highlight-color:transparent}
.iso-stage [data-tray],.iso-stage [data-hopper],.iso-stage [data-desk]{cursor:pointer}
.iso-stage [data-live]{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:520px){.iso-plate{overflow:hidden}.iso-stage svg{width:118%;margin:0 -9%}}
</style>` + (CYBER ? `<style>
body.iso[data-theme="dark"]{
  --anatomy-page:#02040a;--anatomy-card:#050b17;--anatomy-text:#7fb8c8;--anatomy-strong:#d8fbff;--anatomy-muted:#3d7487;
  --anatomy-paper:#050b17;--anatomy-face:#0b1830;--anatomy-top:#0d1d38;
  --anatomy-shade-0:#060e1e;--anatomy-shade-1:#081227;--anatomy-shade-2:#0a172f;--anatomy-shade-3:#0c1b37;
  --anatomy-lit-top:#2a0c3a;--anatomy-lit-shade:#1d0a2c;
  --anatomy-hi:#6ff6ff;--anatomy-mid:#1fa3c2;--anatomy-lo:#13607a;--anatomy-faint:#0c3448;--anatomy-lit:#ff4fd8;
  --anatomy-halo:#00d9ff;--anatomy-halo-opacity:.16;--anatomy-dot:#6ff6ff;
  background:radial-gradient(120% 80% at 50% 0%,#071a2e 0%,#02040a 60%) fixed;
}
body.iso[data-theme="dark"] .iso-plate{
  box-shadow:0 0 0 1px #1fa3c255,0 0 40px -10px #00d9ff33,inset 0 0 80px -20px #00d9ff22;
  background:
    repeating-linear-gradient(0deg,#ffffff03 0 1px,transparent 1px 3px),
    linear-gradient(#0d3a4f22 1px,transparent 1px) 0 0/24px 24px,
    linear-gradient(90deg,#0d3a4f22 1px,transparent 1px) 0 0/24px 24px,
    radial-gradient(90% 70% at 50% 45%,#08203a 0%,#050b17 70%);
}
body.iso[data-theme="dark"] .iso-plate::before,body.iso[data-theme="dark"] .iso-plate::after{
  content:"";position:absolute;width:14px;height:14px;border:1px solid #6ff6ff;pointer-events:none;opacity:.7}
body.iso[data-theme="dark"] .iso-plate::before{top:-1px;left:-1px;border-right:0;border-bottom:0}
body.iso[data-theme="dark"] .iso-plate::after{right:-1px;bottom:-1px;border-left:0;border-top:0}
body.iso[data-theme="dark"] .iso-plate-corner{color:#3d9bb3;text-shadow:0 0 6px #00d9ff55}
body.iso[data-theme="dark"] .iso-plate-corner[data-corner="readout"],body.iso[data-theme="dark"] .iso-plate-corner[data-corner="fig"]{color:#9ff9ff}
body.iso[data-theme="dark"] .iso-svg{filter:drop-shadow(0 0 1.2px #00e1ff59)}
body.iso[data-theme="dark"] .iso-solid[data-lit]>.iso-edge,body.iso[data-theme="dark"] .iso-line[data-tone="lit"]{filter:drop-shadow(0 0 1.6px #ff4fd8)}
body.iso[data-theme="dark"] .iso-solid[data-lit]>.iso-edge{stroke-width:.9px}
body.iso[data-theme="dark"] .iso-line[data-tone="lit"]{stroke-width:.9px}
body.iso[data-theme="dark"] .iso-wire[data-tone="lit"] .iso-wire-end{fill:#ff4fd8}
body.iso[data-theme="dark"] .cy-grid{stroke:#0e4a62;opacity:.55}
body.iso[data-theme="dark"] .iso-face-text{fill:#6ff6ff}
body.iso[data-theme="dark"] .iso-legend{color:#4f8ea3}
</style>` : "");
const body = k.plateHtml({
  fig: "Fig 1",
  title: "Agent memory catalog",
  hint: "Click a card, a tray or the hopper",
  readout: "1 store · one fact, one file",
  keys: [
    { mark: "lit", label: "The card in the gripper: the memory being written, updated or read" },
    { mark: "raised", label: `Cards: one file each, ${M.MEMORIES.length} filed. Trays, far to near: user ${M.byType.user.length}, feedback ${M.byType.feedback.length}, reference ${M.byType.reference.length}, project ${M.byType.project.length}` },
    { mark: "flat", label: `The sheet on the desk: MEMORY.md, one line per card, read at the start of every session` },
    { mark: "edge", label: `Threads: [[name]] links, ${M.LINKS.length} between filed cards` },
  ],
  caption: `How an agent's memory keeps the right references to hand. Store: each fact goes in its own small file with a header giving its name, a one-line description and its type. Categorise: the type puts it in one of four trays. Manage: before writing, the agent looks for a card that already covers the fact and updates that one instead of adding a duplicate, and it removes a card that turns out to be wrong. Index: each card gets one line in MEMORY.md, and that sheet is loaded into every new session, so the agent sees every description without opening a single file. Recall: when a line's description matches the task, the agent opens that one card. Link: [[name]] threads lead it on to related cards. The figure uses this machine's real memory, snapshotted on ${M.SNAPSHOT}: ${M.MEMORIES.length} files in ${M.FOLDERS} project folders and ${M.INDEX.length} index lines. ${M.RAW_LINKS} links are written in the files: ${M.LINKS.length} reach a filed card, ${M.DANGLING} name a card nobody has written yet (still allowed: a dangling link marks a note worth writing), and one is repeated. Click any card and the gantry reads the index, opens that card and follows its threads. Click the hopper or a tray and it writes a new card, files it and adds its line to the index. Keys: arrows and Enter, N, U F R P, I, 1–6, Esc.`,
  body: STRETCH + `<div class="iso-stage" tabindex="0" role="group" aria-roledescription="interactive figure" aria-label="Agent memory catalog. Arrow keys choose a card and Enter recalls it. N writes a new card; U, F, R or P files it in the user, feedback, reference or project tray. I reads the index, 1 to 6 run each stage, Escape clears new cards.">${svg}<span data-live aria-live="polite"></span></div>`,
});

const name = theme === "light" ? "memory-catalog-light.html" : "memory-catalog.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Agent memory catalog", theme, body, script: kitScript() + live, width: 720 }));
console.log("wrote", name, `${(svg.length / 1024).toFixed(0)} KB svg`);
