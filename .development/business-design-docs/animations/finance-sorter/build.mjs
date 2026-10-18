import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/avarile/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/avarile/.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "/home/avarile/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const CYBER = theme === "dark"; // the dark build is the cyber data-space theme
// A display window in the cyber theme: tinted glass with scanlines, under the window's own outline.
const screen = (x, y, w, h, r) => (CYBER ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="cy-glass"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#cy-scan)"/>` : "");

const WIDTH = 640;
const HEIGHT = 372;

// World plan: x along the machine, y toward the viewer, z up. Units are about 1 px of the real sorter.
const PLATE = { x: -222, y: -80, w: 432, d: 154, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const BED = { x: -210, y: -18, w: 376, d: 26, r: 1.5 };
const BED_Z = 38;
const BED_TOP = 44;
const LIP = { x: BED.x, y: -18, w: BED.w, d: 2, r: 0.6 };
const LIP_TOP = 48;
const CARD = { w: 24, d: 18, h: 0.9, gap: 1.35 };
const LANE_Y = -5.5;
const HOPPER_X = -194;
const READ_X = -150;

// The routing core: a chamfered monolith on a plinth, its front a glass crossbar matrix over a bay of blades.
const CORE = { x: -128, y: -76, w: 184, d: 24, r: 2 };
const CORE_TOP = 126;
const CORE_CHAMFER = 7;
const PLINTH_H = 6;
const FACE_Y = CORE.y + CORE.d;
const XF = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]); // prisms along x, profile in (y, z)

// The console: a chamfered terminal with a wide LED module, a row of window keys and a glass slate in its dock.
const TAB = { x: 66, y: -70, w: 132, d: 50, r: 3 };
const TAB_TOP = 78;
const TAB_FACE = TAB.y + TAB.d;
const TAB_BROW = TAB_FACE - 5; // where the chamfer meets the top deck
const TAB_LIP = 72; // where the chamfer meets the front face
const DIAL_FULL = 1000; // $ per month that fills the LED bar
// The window keys: five backlit push keys in a strip in front of the LED module; the lit, pressed one is the window.
const KEYS = { x0: 76, pitch: 15.2, w: 12, y: -35, d: 5.5, h: 2.2, press: 0.6 };
const PRINTER = { x: 160, y: -64, w: 32, d: 22, r: 2 };
const PRINTER_TOP = TAB_TOP + 14;
const SLIP_Y = -52;
const SLIP = { x0: 165, x1: 187, rows: 7, pitch: 3.4 };

const POCKET_W = 34;
const POCKET_PITCH = 38;
const POCKET_X0 = -152;
const POCKET_Y = 14;
const POCKET_D = 50;
const WALL = 2;
const BACK_H = 24;
const LIP_H = 12;
const pocketX = (index) => POCKET_X0 + index * POCKET_PITCH;
const pocketCentre = (index) => [pocketX(index) + POCKET_W / 2, POCKET_Y + POCKET_D / 2 - 1];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [CORE.x, CORE.y, CORE_TOP + 6], [CORE.x + CORE.w, CORE.y, CORE_TOP + 6], [PRINTER.x + 22, SLIP_Y, PRINTER_TOP + 30]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 62 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const onFace = (y, x, z) => k.sideMatrix([x, y], z, P, "left"); // local (u, v) = (+x, -z) on a face looking toward +y
const box = (plan, z, h, tone = "mid", steps = 3, bevel = 0.4, extra = {}) => S(k.slabOf(plan, z, h, P, steps, bevel), { tone, ...extra });
const screws = (points, z, size = 0.45) => D(points.map(([x, y]) => at([x, y, z])), { size });
const ringed = (points, z, r = 1.6) => L(points.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + screws(points, z);

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "lo", inner: L(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(ringed(k.corners(PLATE, 10), 0, 2.2));
  // ruler strip along the front edge, under the pockets
  const strip = { x: POCKET_X0 - 2, y: PLATE.y + PLATE.d - 9, w: POCKET_PITCH * 8, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 2, strip.x + strip.w - 2, POCKET_PITCH / 8, 4, strip.y + 0.6, 0.6, [1.6, 3.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // label plate at the right front corner
  const plate = { x: 172, y: PLATE.y + PLATE.d - 26, w: 30, d: 16, r: 1.5 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 4), { tone: "mid", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P, 4), { tone: "faint" }));
  [[22], [16], [19]].forEach(([len], row) => out.push(L(k.lineOnTop([plate.x + 4, plate.y + 5 + row * 3], [plate.x + 4 + len * 0.95, plate.y + 5 + row * 3], 0.8, P), { tone: "lo", free: true })));
  out.push(screws([[plate.x + 2.6, plate.y + 2.6], [plate.x + plate.w - 2.6, plate.y + plate.d - 2.6]], 0.8, 0.4));
  return out.join("");
}

// The routing core: the payee -> Default Category map as a crossbar on its glass face. Payee columns run down
// to the row of their pocket; a lit node is a taught default, a column with no node is a payee not yet taught.
const MATRIX = { u0: 12, u1: 172, z0: 55, z1: 111 };
const CAP_Z = [105, 109];
const PORT_U = 166;
const colU = (index) => (index < M.PAYEES.length ? 18 + index * 8 : 144 + (index - M.PAYEES.length) * 8);
const TYPE_COL = { t: M.PAYEES.length, r: M.PAYEES.length + 1, x: M.PAYEES.length + 2 }; // Transfer, refund, no default
const rowZ = (pocket) => 101 - pocket * 6;
const BLADES = { u0: 15.5, pitch: 27, w: 25, z0: 12, z1: 42 };
const SOCKET = { x: CORE.x + 3, y: FACE_Y, w: 8, d: 3, r: 0.6 };
const SIDE_PORT = { x: CORE.x + CORE.w, y: CORE.y + 9, w: 3, d: 6, r: 0.5 };
// A closed light bar on a chamfer: t runs up the chamfer from its lower edge.
const chamferBar = (x0, x1, faceY, lowZ, t0, t1) => k.pathOf(k.pointsAt([[x0, faceY - t0, lowZ + t0], [x1, faceY - t0, lowZ + t0], [x1, faceY - t1, lowZ + t1], [x0, faceY - t1, lowZ + t1]], P), true);
const strip = (d) => `<path class="iso-line fx-strip" data-tone="lo" d="${d}"/>`;
const led = (u, v, w = 2.4, h = 1.2, delay = 0) => `<rect x="${u}" y="${v}" width="${w}" height="${h}" rx="${h / 2}" class="fx-led" style="animation-delay:${delay}s"/>`;

function core() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CORE, -4), 0, 2, P)}" style="filter:blur(3px)"/>`);
  // plinth, set back under the body, with a light strip along its front
  const plinth = k.insetPlan(CORE, 2.5);
  out.push(box(plinth, 0, PLINTH_H, "lo", 3, 0.3));
  out.push(`<g transform="${onFace(plinth.y + plinth.d, plinth.x, 0)}">${strip(`M4 -3.8H${plinth.w - 4}V-2.2H4Z`)}</g>`);
  // body: a prism along x with its top front edge chamfered
  const profile = [[CORE.y, PLINTH_H], [FACE_Y, PLINTH_H], [FACE_Y, CORE_TOP - CORE_CHAMFER], [FACE_Y - CORE_CHAMFER, CORE_TOP], [CORE.y, CORE_TOP]];
  const seam = k.pathOf(k.pointsAt([[CORE.x, FACE_Y, 47], [CORE.x + CORE.w, FACE_Y, 47], [CORE.x + CORE.w, CORE.y, 47]], P));
  out.push(S(G.prismOf(XF, profile, CORE.x, CORE.x + CORE.w, P), { tone: "mid", crease: "lo", inner: L(seam, { tone: "faint" }) }));
  out.push(strip(chamferBar(CORE.x + 8, CORE.x + CORE.w - 8, FACE_Y, CORE_TOP - CORE_CHAMFER, 2.8, 4.2)));
  // front face: the display bezel and glass, the crossbar grid, and the blade bay under it
  const face = [];
  face.push(`<rect x="5" y="-117.5" width="174" height="70.5" rx="4" class="iso-line" data-tone="faint" fill="none"/>`);
  face.push(`<rect x="8" y="-115" width="168" height="65" rx="2.4" class="iso-fill"/>${screen(8, -115, 168, 65, 2.4)}<rect x="8" y="-115" width="168" height="65" rx="2.4" class="iso-line" data-tone="mid" fill="none"/>`);
  const { u0, u1, z0, z1 } = MATRIX;
  const grid = [];
  for (let i = 0; i < M.PAYEES.length + 3; i += 1) grid.push(`M${colU(i)} ${-z1}V${-z0}`);
  M.POCKETS.forEach((_, pocket) => grid.push(`M${u0} ${-rowZ(pocket)}H${PORT_U}`));
  grid.push(`M137 ${-z1}V${-z0}`); // divider: payee columns | Type columns
  face.push(`<path class="iso-line" data-tone="faint" d="${grid.join("")}"/>`);
  face.push(`<rect x="${u0}" y="${-z1}" width="${u1 - u0}" height="${z1 - z0}" rx="1.4" class="iso-line" data-tone="lo" fill="none"/>`);
  for (let i = 0; i < M.PAYEES.length + 3; i += 1) face.push(`<rect x="${colU(i) - 1.5}" y="${-CAP_Z[1]}" width="3" height="${CAP_Z[1] - CAP_Z[0]}" rx="0.6" class="iso-fill"/><rect x="${colU(i) - 1.5}" y="${-CAP_Z[1]}" width="3" height="${CAP_Z[1] - CAP_Z[0]}" rx="0.6" class="iso-line" data-tone="${i < M.PAYEES.length ? "lo" : "mid"}" fill="none"/>`);
  M.POCKETS.forEach((_, pocket) => face.push(`<rect x="${PORT_U}" y="${-rowZ(pocket) - 1.6}" width="${u1 - PORT_U}" height="3.2" rx="0.6" class="iso-fill"/><rect x="${PORT_U}" y="${-rowZ(pocket) - 1.6}" width="${u1 - PORT_U}" height="3.2" rx="0.6" class="iso-line" data-tone="mid" fill="none"/>`));
  // blade bay: six compute blades, each with a pull slot, vent slots and status lights
  face.push(`<rect x="13" y="-44" width="${CORE.w - 15}" height="34" rx="1.8" class="iso-line" data-tone="faint" fill="none"/>`);
  for (let b = 0; b < 6; b += 1) {
    const u = BLADES.u0 + b * BLADES.pitch;
    face.push(`<rect x="${u}" y="${-BLADES.z1}" width="${BLADES.w}" height="${BLADES.z1 - BLADES.z0}" rx="1.2" class="iso-line" data-tone="mid" fill="none"/>`);
    face.push(`<rect x="${u + 4}" y="-18" width="17" height="3" rx="1.5" class="iso-line" data-tone="lo" fill="none"/>`);
    for (const v of [-38, -35.4, -32.8]) face.push(`<rect x="${u + 4}" y="${v}" width="17" height="1.2" rx="0.6" class="iso-line" data-tone="faint" fill="none"/>`);
    face.push(led(u + 4, -26, 2.4, 1.2, b * 0.37), led(u + 8, -26, 2.4, 1.2, b * 0.61 + 0.2), led(u + 12, -26, 2.4, 1.2, b * 0.23 + 0.5));
    face.push(`<rect x="${u + 17}" y="-26.6" width="4" height="2.4" rx="0.5" class="iso-line" data-tone="lo" fill="none"/>`);
  }
  out.push(`<g transform="${onFace(FACE_Y, CORE.x, 0)}">${face.join("")}</g>`);
  out.push(D([[6.5, 115.5], [CORE.w - 6.5, 115.5], [6.5, 49], [CORE.w - 6.5, 49]].map(([u, z]) => at([CORE.x + u, FACE_Y, z])), { size: 0.45 }));
  // the read head's socket, on the face's left margin
  out.push(box(SOCKET, 20, 10, "mid", 2, 0.3));
  // +x end: an intake grille, a status column and the console's port
  const side = [];
  for (let i = 0; i < 6; i += 1) side.push(`<rect x="${4 + i * 3}" y="-96" width="1.6" height="32" rx="0.8" class="iso-line" data-tone="lo" fill="none"/>`);
  for (let i = 0; i < 4; i += 1) side.push(led(4 + i * 4.5, -40, 2.4, 1.2, i * 0.5));
  side.push(`<rect x="2" y="-100" width="${CORE.d - 4}" height="40" rx="1.6" class="iso-line" data-tone="faint" fill="none"/>`);
  out.push(`<g transform="${k.sideMatrix([CORE.x + CORE.w, FACE_Y], 0, P, "right")}">${side.join("")}</g>`);
  out.push(box(SIDE_PORT, 101, 6, "mid", 2, 0.3));
  // top: a heat sink of fins on a base plate, back to front
  const sink = { x: CORE.x + 26, y: CORE.y + 2.5, w: 116, d: CORE.d - CORE_CHAMFER - 5, r: 1 };
  out.push(box(sink, CORE_TOP, 1, "lo", 3, 0.2));
  for (let j = 0; j < 6; j += 1) out.push(box({ x: sink.x + 2, y: sink.y + 1 + j * 2.2, w: sink.w - 4, d: 0.8, r: 0 }, CORE_TOP + 1, 4.5, "mid", 1, 0));
  out.push(ringed([[CORE.x + 6, CORE.y + 4.5], [CORE.x + CORE.w - 6, CORE.y + 4.5], [CORE.x + 6, FACE_Y - CORE_CHAMFER - 4.5], [CORE.x + CORE.w - 6, FACE_Y - CORE_CHAMFER - 4.5]], CORE_TOP, 1.4));
  return out.join("");
}

// A route: down its column from the cap to the node on its pocket's row, then along the row to the row's port.
function routeSvg(col, pocket) {
  const u = colU(col);
  const v = -rowZ(pocket);
  const path = `<path class="iso-line" data-tone="faint" d="M${u} ${-CAP_Z[0]}V${v}H${PORT_U}"/>`;
  const node = `<circle cx="${u}" cy="${v}" r="1.6" class="iso-fill"/><circle cx="${u}" cy="${v}" r="1.6" class="iso-line" data-tone="mid" fill="none"/>`;
  return `<g transform="${onFace(FACE_Y, CORE.x, 0)}">${path}${node}</g>`;
}
function cords() {
  const out = [];
  M.PAYEES.forEach((payee, index) => {
    if (!payee.pocket) return; // not taught yet: its column has no node
    out.push(`<g data-cord="p${index}">${routeSvg(index, M.pocketOf(payee.pocket))}</g>`);
  });
  // Type columns: a Transfer goes straight to its row; Income from a payee not taught as income is a refund;
  // an Expense with no default waits in Uncategorised
  out.push(`<g data-cord="t">${routeSvg(TYPE_COL.t, M.pocketOf("transfer"))}</g>`);
  out.push(`<g data-cord="r">${routeSvg(TYPE_COL.r, M.pocketOf("refunds"))}</g>`);
  out.push(`<g data-cord="x">${routeSvg(TYPE_COL.x, M.pocketOf("reject"))}</g>`);
  // the read head's lead, from the bridge beam to the core's socket
  out.push(k.wireSvg(at([READ_X, -17, 66]), at([SOCKET.x + SOCKET.w / 2, SOCKET.y + SOCKET.d, 25]), { via: [at([READ_X + 1, -23, 64]), at([READ_X + 12, -36, 46]), at([SOCKET.x + 3, FACE_Y + 7, 29])], tone: CYBER ? "mid" : "lo", flow: CYBER, size: 1 }));
  return out.join("");
}

function tabulator() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(TAB, -3), 0, 2, P)}" style="filter:blur(3px)"/>`);
  const plinth = k.insetPlan(TAB, 2);
  out.push(box(plinth, 0, 5, "lo", 3, 0.3));
  out.push(`<g transform="${onFace(plinth.y + plinth.d, plinth.x, 0)}">${strip(`M4 -3.4H${plinth.w - 4}V-2H4Z`)}</g>`);
  const profile = [[TAB.y, 5], [TAB_FACE, 5], [TAB_FACE, TAB_LIP], [TAB_BROW, TAB_TOP], [TAB.y, TAB_TOP]];
  const seam = k.pathOf(k.pointsAt([[TAB.x, TAB_FACE, 36], [TAB.x + TAB.w, TAB_FACE, 36], [TAB.x + TAB.w, TAB.y, 36]], P));
  out.push(S(G.prismOf(XF, profile, TAB.x, TAB.x + TAB.w, P), { tone: "mid", crease: "lo", inner: L(seam, { tone: "faint" }) }));
  out.push(strip(chamferBar(TAB.x + 6, TAB.x + TAB.w - 6, TAB_FACE, TAB_LIP, 2, 3)));
  const deck = { x: TAB.x + 4, y: TAB.y + 4, w: TAB.w - 8, d: TAB_BROW - TAB.y - 8, r: 2 };
  out.push(L(k.planOutline(deck, TAB_TOP, P, 4), { tone: "faint" }));
  out.push(ringed([[TAB.x + 2.4, TAB.y + 2.4], [TAB.x + TAB.w - 2.4, TAB.y + 2.4], [TAB.x + 2.4, TAB_BROW - 2.4], [TAB.x + TAB.w - 2.4, TAB_BROW - 2.4]], TAB_TOP, 1.1));
  // the lead from the core's port into the console's side
  out.push(k.wireSvg(at([SIDE_PORT.x + SIDE_PORT.w, SIDE_PORT.y + SIDE_PORT.d / 2, 104]), at([TAB.x, TAB.y + 12, 64]), { via: [at([SIDE_PORT.x + SIDE_PORT.w + 3, SIDE_PORT.y + 3, 100]), at([TAB.x - 4, TAB.y + 10, 70])], tone: CYBER ? "mid" : "lo", flow: CYBER, size: 1 }));
  // front face: two glass windows (net spend, data-to date), status lights and an intake grille
  const m = onFace(TAB_FACE, TAB.x, 0);
  const face = [];
  const win = (x, w) => `<rect x="${x}" y="-70" width="${w}" height="13" rx="1.6" class="iso-fill"/>${screen(x, -70, w, 13, 1.6)}<rect x="${x}" y="-70" width="${w}" height="13" rx="1.6" class="iso-line" data-tone="mid" fill="none"/><rect x="${x - 1.6}" y="-71.4" width="${w + 3.2}" height="15.8" rx="2.4" class="iso-line" data-tone="faint" fill="none"/>`;
  face.push(win(6, 66), win(78, 46));
  for (let i = 0; i < 6; i += 1) face.push(led(8 + i * 6, -48, 3, 1.4, i * 0.41));
  for (let i = 0; i < 16; i += 1) face.push(`<rect x="${70 + i * 3.4}" y="-51" width="1.4" height="10" rx="0.7" class="iso-line" data-tone="lo" fill="none"/>`);
  face.push(`<rect x="66" y="-53" width="58" height="14" rx="1.6" class="iso-line" data-tone="faint" fill="none"/>`);
  face.push(`<text class="iso-face-text" data-tone="hi" data-readout-net x="70" y="-60" font-size="8.4" text-anchor="end" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">$0.00</text>`);
  face.push(`<text class="iso-face-text" data-tone="mid" data-readout-date x="120" y="-60" font-size="7.6" text-anchor="end" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">none</text>`);
  out.push(`<g transform="${m}">${face.join("")}</g>`);
  out.push(D([[TAB.x + 3, 69], [TAB.x + TAB.w - 3, 69], [TAB.x + 3, 40], [TAB.x + TAB.w - 3, 40]].map(([x, z]) => at([x, TAB_FACE, z])), { size: 0.45 }));
  // +x end: a vent grille
  const side = k.sideMatrix([TAB.x + TAB.w, TAB_FACE], 0, P, "right");
  const vents = [];
  for (let i = 0; i < 10; i += 1) vents.push(`<rect x="${14 + i * 3.4}" y="-50" width="1.6" height="22" rx="0.8" class="iso-line" data-tone="lo" fill="none"/>`);
  vents.push(`<rect x="11" y="-53" width="${10 * 3.4 + 3.2}" height="28" rx="1.6" class="iso-line" data-tone="faint" fill="none"/>`);
  out.push(`<g transform="${side}">${vents.join("")}</g>`);
  return out.join("");
}

// Seven-segment LED digits, drawn flat in a face's own plane. Each segment is a slim hexagon, lit or a dim ghost.
const SEGS = { " ": "", "-": "g", 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
function segmentPath(name, w, h, t) {
  const bar = (cx, cy, len, across) => {
    const [a, b] = [len / 2, across ? t * 0.65 : t / 2]; // horizontal bars thicker: the tilted face foreshortens them
    const pts = across ? [[-a, 0], [-a + b, -b], [a - b, -b], [a, 0], [a - b, b], [-a + b, b]] : [[0, -a], [b, -a + b], [b, a - b], [0, a], [-b, a - b], [-b, -a + b]];
    return "M" + pts.map(([u, v]) => `${(cx + u).toFixed(2)} ${(cy + v).toFixed(2)}`).join("L") + "Z";
  };
  const gap = 0.25;
  const H = w - t - gap * 2;
  const V = h / 2 - t / 2 - gap * 2;
  return { a: bar(w / 2, 0, H, true), b: bar(w, h / 4, V, false), c: bar(w, (h * 3) / 4, V, false), d: bar(w / 2, h, H, true), e: bar(0, (h * 3) / 4, V, false), f: bar(0, h / 4, V, false), g: bar(w / 2, h / 2, H, true) }[name];
}
function digitsSvg(id, text, u0, v0, { w, h, t, pitch, dp = -1 }) {
  const out = [];
  [...text].forEach((ch, i) => {
    const on = SEGS[ch] ?? "";
    const segs = "abcdefg".split("").map((name) => `<path data-s="${name}" class="fx-seg"${on.includes(name) ? " data-on" : ""} d="${segmentPath(name, w, h, t)}"/>`);
    out.push(`<g data-digit="${id}${i}" transform="translate(${(u0 + i * pitch).toFixed(2)} ${v0})">${segs.join("")}</g>`);
  });
  if (dp >= 0) out.push(`<rect class="fx-seg" data-on x="${(u0 + dp * pitch + w + (pitch - w) / 2 - t / 2).toFixed(2)}" y="${(v0 + h - t / 2).toFixed(2)}" width="${t}" height="${t}" rx="${t / 4}"/>`);
  return out.join("");
}
// A face plane through o, with u along ex and v along ey (both world unit vectors).
function planeMatrix(o, ex, ey) {
  const O = k.iso(o, P);
  const X = k.iso([o[0] + ex[0], o[1] + ex[1], o[2] + ex[2]], P);
  const Y = k.iso([o[0] + ey[0], o[1] + ey[1], o[2] + ey[2]], P);
  return `matrix(${[X[0] - O[0], X[1] - O[1], Y[0] - O[0], Y[1] - O[1], O[0], O[1]].map((n) => n.toFixed(4)).join(" ")})`;
}

// The LED module: a wedge on the console deck whose tilted glass shows net spend per month in seven-segment
// digits, over a twenty-step bar that fills to DIAL_FULL.
const MOD = { x0: 74, x1: 152, y0: -66, y1: -39, base: TAB_TOP + 1.5, lip: 5, rise: 22 };
const MOD_SLOPE = Math.hypot(MOD.y1 - MOD.y0 - 6, MOD.rise);
const MOD_FACE = planeMatrix([MOD.x0, MOD.y0 + 6, MOD.base + MOD.lip + MOD.rise], [1, 0, 0], [0, (MOD.y1 - MOD.y0 - 6) / MOD_SLOPE, -MOD.rise / MOD_SLOPE]);
const LED = { digits: 6, u0: 12.4, v0: 5.5, w: 6.2, h: 13, t: 1.3, pitch: 9.4, dp: 3, bars: 20 };
const ledText = (value) => {
  const v = Math.min(9999.99, Math.abs(value));
  const [whole, cents] = v.toFixed(2).split(".");
  return ((value < -0.004 ? "-" : "") + whole).padStart(4, " ") + cents;
};
function ledModule() {
  const out = [];
  const { x0, x1, y0, y1, base, lip, rise } = MOD;
  out.push(box({ x: x0 - 2, y: y0 - 2, w: x1 - x0 + 4, d: y1 - y0 + 4, r: 1.2 }, TAB_TOP, 1.5, "lo", 3, 0.3));
  const profile = [[y0, base], [y1, base], [y1, base + lip], [y0 + 6, base + lip + rise], [y0, base + lip + rise]];
  out.push(S(G.prismOf(XF, profile, x0, x1, P), { tone: "mid", crease: "lo" }));
  // the tilted face: bezel, the digit window and the bar window
  const face = [];
  face.push(`<rect x="1.4" y="1.4" width="${x1 - x0 - 2.8}" height="${MOD_SLOPE - 2.8}" rx="2" class="iso-line" data-tone="faint" fill="none"/>`);
  const glass = (u, v, w, h) => `<rect x="${u}" y="${v}" width="${w}" height="${h}" rx="1.2" class="iso-fill"/>${screen(u, v, w, h, 1.2)}<rect x="${u}" y="${v}" width="${w}" height="${h}" rx="1.2" class="iso-line" data-tone="mid" fill="none"/>`;
  face.push(glass(3, 3, x1 - x0 - 6, 18), glass(3, 22.6, x1 - x0 - 6, 4.8));
  face.push(`<g data-part="led">${digitsSvg("m", ledText(0), LED.u0, LED.v0, LED)}</g>`);
  const bars = [];
  for (let i = 0; i < LED.bars; i += 1) bars.push(`<rect data-bar="${i}" class="fx-seg" x="${(4.6 + i * 3.47).toFixed(2)}" y="23.6" width="2.3" height="2.8" rx="0.4"/>`);
  face.push(bars.join(""));
  out.push(`<g transform="${MOD_FACE}">${face.join("")}</g>`);
  // corner screws on the bezel, and vent slots on the +x end
  const onSlope = (u, v) => [x0 + u, y0 + 6 + (v * (y1 - y0 - 6)) / MOD_SLOPE, base + lip + rise - (v * rise) / MOD_SLOPE];
  out.push(D([onSlope(1.4, 0.8), onSlope(x1 - x0 - 1.4, 0.8), onSlope(1.4, MOD_SLOPE - 0.8), onSlope(x1 - x0 - 1.4, MOD_SLOPE - 0.8)].map(at), { size: 0.4 }));
  const vents = [];
  for (let i = 0; i < 4; i += 1) vents.push(`<rect x="${16 + i * 2.4}" y="${-base - lip - 9}" width="1.2" height="8" rx="0.6" class="iso-line" data-tone="lo" fill="none"/>`);
  out.push(`<g transform="${k.sideMatrix([x1, y1], 0, P, "right")}">${vents.join("")}</g>`);
  return out.join("");
}

function keys() {
  const out = [];
  const n = M.WINDOWS.length;
  out.push(box({ x: KEYS.x0 - 2, y: KEYS.y - 1.5, w: (n - 1) * KEYS.pitch + KEYS.w + 4, d: KEYS.d + 3, r: 1 }, TAB_TOP, 1, "lo", 3, 0.3));
  for (let i = 0; i < n; i += 1) {
    const plan = { x: KEYS.x0 + i * KEYS.pitch, y: KEYS.y, w: KEYS.w, d: KEYS.d, r: 1 };
    const top = TAB_TOP + 1 + KEYS.h;
    const lamp = k.planOutline({ x: plan.x + 2.5, y: plan.y + 1.5, w: plan.w - 5, d: 1.5, r: 0.75 }, top, P, 3);
    out.push(`<g data-key="${i}" role="button" aria-label="${M.WINDOWS[i].label}">${S(k.slabOf(plan, TAB_TOP + 1, KEYS.h, P, 3, 0.5), { tone: "mid" })}<path class="iso-line fx-keylamp" data-tone="lo" d="${lamp}"/></g>`);
  }
  return out.join("");
}

// The slate dock: a glass slate stands in its slot and shows each pocket's share.
function printer() {
  const out = [];
  out.push(S(k.slabOf(PRINTER, TAB_TOP, PRINTER_TOP - TAB_TOP, P, 3, 1), { tone: "mid", inner: L(k.sideSeam(PRINTER, TAB_TOP + 4, P, 3), { tone: "faint" }) }));
  out.push(`<g transform="${onFace(PRINTER.y + PRINTER.d, PRINTER.x, 0)}">${strip(`M4 ${-TAB_TOP - 9.6}H${PRINTER.w - 4}V${-TAB_TOP - 8.2}H4Z`)}</g>`);
  out.push(L(k.planOutline({ x: SLIP.x0 - 2, y: SLIP_Y - 1.4, w: SLIP.x1 - SLIP.x0 + 4, d: 2.8, r: 1.2 }, PRINTER_TOP, P, 3), { tone: "lo" }));
  out.push(L(k.planOutline({ x: SLIP.x0 - 4, y: SLIP_Y - 3.4, w: SLIP.x1 - SLIP.x0 + 8, d: 6.8, r: 2.4 }, PRINTER_TOP, P, 4), { tone: "faint" }));
  out.push(screws([[PRINTER.x + 2.5, PRINTER.y + 2.5], [PRINTER.x + PRINTER.w - 2.5, PRINTER.y + PRINTER.d - 2.5], [PRINTER.x + 2.5, PRINTER.y + PRINTER.d - 2.5], [PRINTER.x + PRINTER.w - 2.5, PRINTER.y + 2.5]], PRINTER_TOP));
  return out.join("");
}

// The slip: a printed report standing out of the slot. Built per print: its bars are the pocket shares.
const SLIP_H = SLIP.rows * SLIP.pitch + 9;
function slipPaths() {
  const plan = { x: SLIP.x0, y: SLIP_Y - 0.3, w: SLIP.x1 - SLIP.x0, d: 0.6, r: 0 };
  return k.slabOf(plan, PRINTER_TOP - 3, SLIP_H + 3, P, 1);
}

// The feeder: a glass-fronted magazine on the bed, a capped tower with an LED counter of the cards still to feed.
const MAG = { x0: HOPPER_X - 14, x1: HOPPER_X + 14, top: BED_TOP + 44, cap: 11 };
function hopper() {
  const back = [];
  const front = [];
  const z = BED_TOP;
  const { x0, x1, top, cap } = MAG;
  back.push(box({ x: x0, y: -18, w: 28, d: 2, r: 0.6 }, LIP_TOP, top - LIP_TOP, "mid", 2, 0.4));
  back.push(box({ x: x0 - 2, y: -18, w: 2, d: 26, r: 0.6 }, z, top - z, "mid", 2, 0.4));
  // right wall stops above the throat: one card at a time leaves under it
  front.push(box({ x: x1, y: -18, w: 2, d: 26, r: 0.6 }, z + 2.2, top - z - 2.2, "mid", 2, 0.4));
  front.push(box({ x: x1 - 1, y: 4.5, w: 4, d: 3.5, r: 0.8 }, z, 2.2, "lo", 2, 0));
  front.push(box({ x: x0 - 2, y: 5, w: 3, d: 3, r: 0.6 }, z, top - z, "mid", 2, 0.3));
  // the glass front, with two glints, over the stack
  const pane = [];
  const h = top - (z + 2.6);
  pane.push(`<rect x="1" y="${-top}" width="${x1 - x0 - 1}" height="${h}" class="fx-pane"/>`);
  pane.push(`<path class="fx-glint" d="M6 ${-top + 2}L9.4 ${-top + 2}L3.4 ${-top + 16}L2 ${-top + 16}Z M12 ${-top + 2}L13.4 ${-top + 2}L6.4 ${-top + 18}L5 ${-top + 18}Z"/>`);
  pane.push(`<rect x="1" y="${-top}" width="${x1 - x0 - 1}" height="${h}" class="iso-line" data-tone="mid" fill="none"/>`);
  front.push(`<g transform="${onFace(8, x0, 0)}">${pane.join("")}</g>`);
  // the cap: a block across the tower's top, its front an LED counter, its top a vent grille
  const capPlan = { x: x0 - 2, y: -18, w: x1 - x0 + 4, d: 26, r: 0.8 };
  front.push(S(k.slabOf(capPlan, top, cap, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(capPlan, top + 2, P, 3), { tone: "faint" }) }));
  const face = [];
  const cw = capPlan.w;
  face.push(`<rect x="7" y="${-top - cap + 2}" width="${cw - 11}" height="7" rx="1.2" class="iso-fill"/>${screen(7, -top - cap + 2, cw - 11, 7, 1.2)}<rect x="7" y="${-top - cap + 2}" width="${cw - 11}" height="7" rx="1.2" class="iso-line" data-tone="mid" fill="none"/>`);
  face.push(`<g data-part="counter">${digitsSvg("h", String(M.CARDS.length).padStart(2, "0"), 7 + (cw - 11) / 2 - 4.2, -top - cap + 3.3, { w: 3.2, h: 4.4, t: 0.7, pitch: 4.6 })}</g>`);
  face.push(led(2.6, -top - cap + 5, 2.4, 1.2, 0));
  front.push(`<g transform="${onFace(capPlan.y + capPlan.d, capPlan.x, 0)}">${face.join("")}</g>`);
  const vents = [];
  for (let i = 0; i < 5; i += 1) vents.push(k.planOutline({ x: x0 + 3, y: -14 + i * 3.4, w: x1 - x0 - 6, d: 1.4, r: 0.7 }, top + cap, P, 3));
  front.push(L(vents.join(""), { tone: "lo" }));
  front.push(screws([[x0, -16], [x1, -16], [x0, 6], [x1, 6]], top + cap));
  return { back: back.join(""), front: front.join("") };
}
// The follower: a flat plate riding the top of the stack, with a sensor lens in its middle.
const WEIGHT = { x: -12, y: -9, w: 24, d: 18, r: 1.5 };
function weight() {
  return box({ ...WEIGHT }, 0, 2.4, "mid", 3, 0.4) + S(k.cylinder(0, 0, 2.6, 2.4, 0.8, P, 20, 0.2), { tone: "hi", crease: "lo" }) + L(k.planOutline(k.insetPlan(WEIGHT, 2), 2.4, P, 3), { tone: "faint" });
}

function track() {
  const out = [];
  for (const x of [-202, -100, 0, 100, 158]) {
    out.push(box({ x: x - 3, y: -12, w: 6, d: 6, r: 1 }, 0, BED_Z, "mid", 2, 0.3));
    out.push(S(k.cylinder(x, -9, 5, 0, 1.2, P, 20), { tone: "lo" }));
  }
  out.push(S(k.slabOf(BED, BED_Z, BED_TOP - BED_Z, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(BED, BED_Z + 3, P, 3), { tone: "faint" }) }));
  out.push(L(k.lineOnTop([BED.x, LANE_Y], [BED.x + BED.w, LANE_Y], BED_TOP, P), { tone: "faint" }));
  out.push(box(LIP, BED_TOP, LIP_TOP - BED_TOP, "mid", 2, 0.3));
  M.POCKETS.forEach((_, index) => {
    const cx = pocketX(index) + POCKET_W / 2;
    out.push(L(k.planOutline({ x: cx - 13, y: -14, w: 26, d: 2.4, r: 1.2 }, BED_TOP, P, 3), { tone: "lo" }));
    out.push(L(k.planOutline({ x: cx - 13, y: 2.6, w: 26, d: 2.4, r: 1.2 }, BED_TOP, P, 3), { tone: "lo" }));
    out.push(screws([[cx - 16, -12.8], [cx + 16, -12.8], [cx - 16, 3.8], [cx + 16, 3.8]], BED_TOP, 0.35));
  });
  out.push(screws([-180, -120, -60, 0, 60, 120].map((x) => [x, -17]), LIP_TOP, 0.4));
  // end stop
  out.push(box({ x: BED.x + BED.w - 4, y: -18, w: 4, d: 26, r: 0.8 }, BED_TOP, 6, "mid", 2, 0.4));
  return out.join("");
}
function bridgeBack() {
  return box({ x: READ_X - 3, y: -18, w: 6, d: 2, r: 0.5 }, LIP_TOP, 18, "mid", 2, 0.3);
}
function bridgeFront() {
  const out = [];
  out.push(box({ x: READ_X - 3, y: 4, w: 6, d: 3, r: 0.5 }, BED_TOP, 22, "mid", 2, 0.3));
  out.push(box({ x: READ_X - 5, y: -19, w: 10, d: 27, r: 1 }, 66, 5, "mid", 3, 0.5));
  out.push(screws([[READ_X - 2.5, -16], [READ_X + 2.5, 5]], 71));
  return out.join("");
}
function readHead() {
  return box({ x: READ_X - 2, y: -12, w: 4, d: 10, r: 0.6 }, 49, 17, "hi", 2, 0, { crease: "lo" });
}

function pocketParts(index) {
  const x = pocketX(index);
  const y = POCKET_Y;
  const back = [];
  const front = [];
  back.push(`<path class="iso-halo" d="${k.haloOf({ x, y, w: POCKET_W, d: POCKET_D, r: 2 }, 0, 1, P)}" style="filter:blur(2px)"/>`);
  back.push(box({ x, y, w: POCKET_W, d: POCKET_D, r: 1.5 }, 0, 2, "lo", 3, 0.3));
  back.push(box({ x, y, w: POCKET_W, d: WALL, r: 0.6 }, 2, BACK_H, "mid", 2, 0.4));
  back.push(box({ x, y: y + WALL, w: WALL, d: POCKET_D - WALL * 2, r: 0.6 }, 2, BACK_H - 6, "mid", 2, 0.3));
  // a stacker plate leaning on the back wall, with its spring rod
  back.push(L(k.lineOnTop([x + WALL, y + WALL + 1.5], [x + POCKET_W - WALL, y + WALL + 1.5], 2, P), { tone: "faint" }));
  front.push(box({ x: x + POCKET_W - WALL, y: y + WALL, w: WALL, d: POCKET_D - WALL * 2, r: 0.6 }, 2, BACK_H - 6, "mid", 2, 0.3));
  front.push(box({ x, y: y + POCKET_D - WALL, w: POCKET_W, d: WALL, r: 0.6 }, 2, LIP_H, "mid", 2, 0.4));
  front.push(screws([[x + 2.2, y + 1], [x + POCKET_W - 2.2, y + 1]], 2 + BACK_H));
  // counter window on the lip's face
  const m = onFace(y + POCKET_D, x, 0);
  const wx = POCKET_W / 2 - 7;
  front.push(`<g transform="${m}"><rect x="${wx}" y="-11.4" width="14" height="7.4" rx="1.2" class="iso-fill"/>${screen(wx, -11.4, 14, 7.4, 1.2)}<rect x="${wx}" y="-11.4" width="14" height="7.4" rx="1.2" class="iso-line" data-tone="mid" fill="none"/><text class="iso-face-text" data-tone="hi" data-count="${index}" x="${POCKET_W / 2}" y="-5.6" font-size="5.6" text-anchor="middle" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">00</text></g>`);
  front.push(D([[x + 3, 7], [x + POCKET_W - 3, 7]].map(([px, z]) => at([px, y + POCKET_D, z])), { size: 0.4 }));
  return { back: back.join(""), front: front.join("") };
}

// One card: a thin plate with the clipped corner of a punch card, and its holes: the Type row and the payee column.
const CARD_RING = [
  [-CARD.w / 2 + 3, -CARD.d / 2],
  [CARD.w / 2, -CARD.d / 2],
  [CARD.w / 2, CARD.d / 2],
  [-CARD.w / 2, CARD.d / 2],
  [-CARD.w / 2, -CARD.d / 2 + 3],
];
const TYPE_ROW = { Expense: -5, Income: -2, Transfer: 1 };
function cardSvg(card) {
  const paths = k.extrude(CARD_RING, 0, CARD.h, P, { convex: true });
  const holes = [];
  const hole = (u, v) => holes.push(k.onTop([[u - 0.35, v - 0.9], [u + 0.35, v - 0.9], [u + 0.35, v + 0.9], [u - 0.35, v + 0.9]], CARD.h, P, true));
  hole(-9 + 1.2 * 0, TYPE_ROW[card.type]); // the Type field
  if (card.payee) hole(-6 + 1.15 * M.payeeIndex(card.payee), 5); // the payee field
  const month = Number(card.date.slice(5, 7));
  hole(-9 + 1.4 * month, 7); // date punch
  const rule = k.lineOnTop([-CARD.w / 2 + 1.5, -CARD.d / 2 + 1.5 + 6.5], [CARD.w / 2 - 1.5, -CARD.d / 2 + 1.5 + 6.5], CARD.h, P);
  return S(paths, { tone: "hi", crease: "lo", inner: "" }) + L(rule, { tone: "faint", free: true }) + L(holes.join(""), { tone: "lo" });
}

// --- assemble -------------------------------------------------------------------------------------------
const hop = hopper();
const pockets = M.POCKETS.map((_, index) => pocketParts(index));
const FLOOR_Z = -PLATE_H - FOOT_H;
const FLOOR_R = 430;
// Packets on the floor grid: statement data flowing in from the left and back, reports leaving to the right.
const PACKETS = [
  { from: [-420, -40], to: [-226, -40], dur: 5.2, begin: 0 },
  { from: [-420, 40], to: [-226, 40], dur: 6.4, begin: 2.1 },
  { from: [-112, -400], to: [-112, -84], dur: 5.8, begin: 1.2 },
  { from: [-32, -400], to: [-32, -84], dur: 7.0, begin: 3.4 },
  { from: [48, -400], to: [48, -84], dur: 6.1, begin: 0.6 },
  { from: [214, 0], to: [420, 0], dur: 4.8, begin: 1.7, out: true },
  { from: [214, 48], to: [420, 48], dur: 5.6, begin: 4.0, out: true },
];
function floor() {
  if (!CYBER) return "";
  const m = k.topMatrix([0, 0], FLOOR_Z, P, "x");
  const defs = `<defs>
<pattern id="cy-minor" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0H16M0 0V16" class="cy-grid" style="stroke-width:.35;vector-effect:none"/></pattern>
<pattern id="cy-major" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M0 0H80M0 0V80" class="cy-grid" style="stroke-width:.8;vector-effect:none"/></pattern>
<radialGradient id="cy-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${FLOOR_R}"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="cy-mask" maskUnits="userSpaceOnUse" x="${-FLOOR_R}" y="${-FLOOR_R}" width="${FLOOR_R * 2}" height="${FLOOR_R * 2}"><rect x="${-FLOOR_R}" y="${-FLOOR_R}" width="${FLOOR_R * 2}" height="${FLOOR_R * 2}" fill="url(#cy-fade)"/></mask>
<pattern id="cy-scan" width="4" height="1.2" patternUnits="userSpaceOnUse"><rect width="4" height=".45" class="cy-scanline"/></pattern>
<filter id="cy-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
  const grid = `<g transform="${m}" mask="url(#cy-mask)" class="cy-floor"><rect x="${-FLOOR_R}" y="${-FLOOR_R}" width="${FLOOR_R * 2}" height="${FLOOR_R * 2}" fill="url(#cy-minor)"/><rect x="${-FLOOR_R}" y="${-FLOOR_R}" width="${FLOOR_R * 2}" height="${FLOOR_R * 2}" fill="url(#cy-major)"/></g>`;
  const glow = `<path class="cy-underglow" d="${k.haloOf(k.insetPlan(PLATE, -10), FLOOR_Z, 0.1, P)}"/>`;
  // packets live in the floor's own plane, so the grid's fade takes them out at the edge
  const packets = PACKETS.map(({ from, to, dur, begin, out }) => {
    const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
    const n = Math.hypot(dx, dy);
    return `<g class="cy-packet"${out ? ' data-out=""' : ""}><path d="M${from[0]} ${from[1]}l${((dx / n) * 14).toFixed(2)} ${((dy / n) * 14).toFixed(2)}"><animateTransform attributeName="transform" type="translate" from="0 0" to="${dx} ${dy}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></path></g>`;
  }).join("");
  return defs + glow + grid.replace("</g>", "") + packets + "</g>";
}

const body = [
  floor(),
  base(),
  core(),
  `<g data-part="cords">${cords()}</g>`,
  tabulator(),
  ledModule(),
  keys(),
  `<g data-slot="slip">${S(slipPaths(), { tone: "hi", crease: "lo" })}<g data-part="slip-lines"></g></g>`,
  printer(),
  track(),
  hop.back,
  `<g data-slot="hopper">${M.CARDS.map((card) => `<g data-card="${card.id}" transform="${k.translateAlong(P, [HOPPER_X, LANE_Y, BED_TOP + card.id * CARD.gap])}">${cardSvg(card)}</g>`).join("")}</g>`,
  `<g data-part="weight">${weight()}</g>`,
  hop.front,
  bridgeBack(),
  `<g data-slot="track"></g>`,
  `<g data-part="head">${readHead()}</g>`,
  bridgeFront(),
  ...pockets.flatMap((pocket, index) => [pocket.back, `<g data-slot="pocket${index}"></g>`, pocket.front]),
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A card sorter on a base plate, in front of a routing computer and a console. Each card is one bank-statement transaction. Cards feed one at a time from a glass-fronted feeder, whose LED counter shows the cards left, along a track, under a read head, and drop into one of eight pockets: income, refunds, four expense groups, transfers and uncategorised. Behind the track, a computer core shows a crossbar on its glass face: each payee column has a node on the row of its default category's pocket, and three Type columns route transfers, refunds and payees with no default. A console reads the pockets: a row of five backlit keys picks the window (month to date, last month, 3, 6 or 12 complete months), the lit key held down, a tilted seven-segment LED display shows net spend per month over a bar that fills toward $1,000, two glass windows show net spend in total and the date of the last card, and a glass slate in a dock shows the share of each pocket.",
  body,
});

// Slip geometry, in the slip's own face plane (u along +x from SLIP.x0, v down from its top).
const SLIP_FACE = { y: SLIP_Y + 0.3, x: SLIP.x0, top: PRINTER_TOP + SLIP_H };

const live = `
const P = ${JSON.stringify(P)};
const CARDS = ${JSON.stringify(M.CARDS)};
const POCKETS = ${JSON.stringify(M.POCKETS.map(({ key, name, cost }) => ({ key, name, cost })))};
const PAYEES = ${JSON.stringify(M.PAYEES.map(({ key }) => key))};
const WINDOWS = ${JSON.stringify(M.WINDOWS)};
const C = ${JSON.stringify({ HOPPER_X, READ_X, LANE_Y, BED_TOP, CARD_GAP: CARD.gap, CARD_W: CARD.w, POCKET_FLOOR: 2, DIAL_FULL, KEYS, TAB_TOP, SLIP_FACE, SLIP, SLIP_H, LED })};
const POCKET_AT = ${JSON.stringify(M.POCKETS.map((_, index) => pocketCentre(index)))};
${M.route.toString()}
${M.report.toString()}
const pocketOf = (key) => POCKETS.findIndex((pocket) => pocket.key === key);
const DAY = 86400000;
const days = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);
const money = ${M.money.toString()};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = ${M.shortDate.toString()};
const DIAL_FULL = C.DIAL_FULL, LED = C.LED, SEGS = ${JSON.stringify(SEGS)};
const ledText = ${ledText.toString()};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const NS = "http://www.w3.org/2000/svg";
const slots = { hopper: svg.querySelector('[data-slot="hopper"]'), track: svg.querySelector('[data-slot="track"]'), pockets: POCKETS.map((_, i) => svg.querySelector('[data-slot="pocket' + i + '"]')) };
// Seven-segment digits: each <g data-digit> holds its a-g segments; a lit segment carries data-on.
const digitEls = (id, n) => Array.from({ length: n }, (_, i) => [...svg.querySelectorAll('[data-digit="' + id + i + '"] [data-s]')]);
const ledDigits = digitEls("m", LED.digits), counterDigits = digitEls("h", 2);
const bars = [...svg.querySelectorAll("[data-bar]")];
const shown = {};
function showDigits(key, els, text) {
  if (shown[key] === text) return;
  shown[key] = text;
  els.forEach((segs, i) => { const on = SEGS[text[i]] || ""; segs.forEach((seg) => seg.toggleAttribute("data-on", on.includes(seg.dataset.s))); });
}
function showLed(value) {
  showDigits("m", ledDigits, ledText(value));
  const lit = Math.round(Math.min(1, Math.max(0, value / DIAL_FULL)) * bars.length);
  if (shown.bars !== lit) { shown.bars = lit; bars.forEach((bar, i) => bar.toggleAttribute("data-on", i < lit)); }
}
const keyEls = [...svg.querySelectorAll("[data-key]")];
const weight = svg.querySelector('[data-part="weight"]');
const head = svg.querySelector('[data-part="head"]');
const slipLines = svg.querySelector('[data-part="slip-lines"]');
const slip = svg.querySelector('[data-slot="slip"]');
const netText = svg.querySelector("[data-readout-net]");
const dateText = svg.querySelector("[data-readout-date]");
const counts = POCKETS.map((_, i) => svg.querySelector('[data-count="' + i + '"]'));
const cordOf = (card) => svg.querySelector('[data-cord="' + (card.type === "Transfer" ? "t" : card.pocket === pocketOf("refunds") ? "r" : card.pocket === pocketOf("reject") ? "x" : "p" + PAYEES.indexOf(card.payee)) + '"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

// Every card is a <use> of its own drawing, moved by a world offset and parented to the slot it physically sits in.
const els = CARDS.map((card) => svg.querySelector('[data-card="' + card.id + '"]'));
const litCard = (i, on) => { const solid = els[i].querySelector(".iso-solid"); if (solid) solid.toggleAttribute("data-lit", on); };
const headSolid = svg.querySelector('[data-part="head"] .iso-solid');
const place = (i, slot, p) => { const el = els[i]; if (el.parentNode !== slot) slot.appendChild(el); el.setAttribute("transform", translateAlong(P, p)); };
const tone = (group, value) => group && group.querySelectorAll("[data-tone]").forEach((node) => node.setAttribute("data-tone", value));
const tint = (group, on) => { if (group) { group.querySelectorAll(".iso-wire,.iso-line").forEach((n) => { if (!n.hasAttribute("data-off")) n.setAttribute("data-off", n.getAttribute("data-tone")); n.setAttribute("data-tone", on ? "lit" : n.getAttribute("data-off")); }); group.querySelectorAll(".iso-line").forEach((n) => n.toggleAttribute("data-flow", on)); group.toggleAttribute("data-live", on); } };

let fed = 0, sorted = [], stacks = POCKETS.map(() => 0), flight = null, win = 4, needleAt = 0, needleRate = 0, slipRise = 1;
let frame = 0, last = 0, visible = false, touring = !still.matches, idle = 0, clock = 0, lastFeed = -9, resetAt = null, toured = 0;
const HOPPER_Z = (j) => C.BED_TOP + (j - fed) * C.CARD_GAP;
function layHopper() {
  for (let j = fed; j < CARDS.length; j += 1) place(j, slots.hopper, [C.HOPPER_X, C.LANE_Y, HOPPER_Z(j)]);
  weight.setAttribute("transform", translateAlong(P, [C.HOPPER_X, C.LANE_Y, C.BED_TOP + (CARDS.length - fed) * C.CARD_GAP]));
  showDigits("h", counterDigits, String(CARDS.length - fed).padStart(2, "0"));
}
const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
// A card's path: out of the throat, under the read head (a pause while it is read), along the track, then kicked forward and down onto its pocket's stack.
function pose(f, t) {
  const [px, py] = POCKET_AT[f.card.pocket];
  const pz = C.POCKET_FLOOR + f.stack * C.CARD_GAP;
  const z0 = C.BED_TOP;
  if (t < 0.22) return { slot: "track", p: [lerp(C.HOPPER_X, C.READ_X, ease(t / 0.22)), C.LANE_Y, z0], reading: t > 0.16 };
  if (t < 0.42) return { slot: "track", p: [C.READ_X, C.LANE_Y, z0], reading: true };
  if (t < 0.7) return { slot: "track", p: [lerp(C.READ_X, px, ease((t - 0.42) / 0.28)), C.LANE_Y, z0], reading: false };
  const s = ease((t - 0.7) / 0.3);
  const lift = Math.sin(Math.min(1, s * 1.6) * Math.PI) * 4;
  return { slot: s > 0.12 ? "pocket" : "track", p: [px, lerp(C.LANE_Y, py, Math.min(1, s * 1.25)), lerp(z0, pz, s * s) + lift], reading: false };
}
const FLIGHT = 1.9;
function feed() {
  if (flight || resetAt !== null) return false;
  if (fed >= CARDS.length) { resetAt = 0; return true; }
  const card = CARDS[fed];
  flight = { i: fed, card, t: 0, stack: stacks[card.pocket] };
  fed += 1;
  layHopper();
  return true;
}
function land(f) {
  place(f.i, slots.pockets[f.card.pocket], [POCKET_AT[f.card.pocket][0], POCKET_AT[f.card.pocket][1], C.POCKET_FLOOR + f.stack * C.CARD_GAP]);
  stacks[f.card.pocket] += 1;
  sorted = sorted.concat([f.card]);
  slipRise = 0;
  print();
}
// The report is never stored: every landing or key press recomputes it from the pockets.
let rep = report(sorted, win);
function print() {
  rep = report(sorted, win);
  counts.forEach((el, i) => { el.textContent = String(stacks[i]).padStart(2, "0"); });
  netText.textContent = money(rep.net);
  dateText.textContent = rep.last ? rep.last.slice(8, 10) + "." + rep.last.slice(5, 7) + "." + rep.last.slice(2, 4) : "--.--.--";
  keyEls.forEach((key, i) => {
    const on = i === win;
    key.querySelector(".iso-solid").toggleAttribute("data-lit", on);
    key.querySelector(".fx-keylamp").toggleAttribute("data-on", on);
    key.setAttribute("transform", on ? translateAlong(P, [0, 0, -C.KEYS.press]) : "");
  });
  // slip: a heading rule, then one bar per cost pocket (refunds after), as share of the window's expense
  const F = C.SLIP_FACE, U = C.SLIP.x1 - C.SLIP.x0 - 4;
  const rows = [2, 3, 4, 5, 7, 1];
  const parts = [];
  const line = (u0, u1, v, tone, free) => parts.push('<path class="iso-line" data-tone="' + tone + '"' + (free ? ' data-free="end"' : "") + ' d="M' + u0 + " " + v + "H" + u1 + '"/>');
  parts.push('<path class="iso-line" data-tone="faint" d="M2 0V' + (C.SLIP_H + 2) + '"/>');
  line(0, C.SLIP.x1 - C.SLIP.x0, 4.2, "mid", false);
  rows.forEach((pocket, row) => {
    const share = rep.expense > 0 ? rep.byPocket[pocket] / rep.expense : 0;
    const len = Math.max(0, share * U);
    if (len > 0.3) line(2, 2 + len, 8 + row * C.SLIP.pitch, pocket === 1 ? "lo" : "hi", true);
  });
  slipLines.innerHTML = '<g transform="' + sideMatrix([F.x, F.y], F.top, P, "left") + '">' + parts.join("") + "</g>";
  const text = rep.window.label + " · " + money(rep.perMonth) + "/mo · to " + shortDate(rep.last) + (rep.partial ? " · partial" : "");
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(win));
  stage.setAttribute("aria-valuetext", text);
}
function turn(to) { win = (to + WINDOWS.length) % WINDOWS.length; print(); }
function resetAll() {
  fed = 0; sorted = []; stacks = POCKETS.map(() => 0); resetAt = null;
  els.forEach((el) => el.style.opacity = "");
  layHopper(); print();
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now; clock += dt;
  const calm = still.matches;
  if (flight) {
    flight.t += calm ? 1 : dt / FLIGHT;
    const p = pose(flight, Math.min(1, flight.t));
    place(flight.i, p.slot === "pocket" ? slots.pockets[flight.card.pocket] : slots.track, p.p);
    if (headSolid) headSolid.toggleAttribute("data-lit", p.reading);
    litCard(flight.i, true);
    tint(cordOf(flight.card), p.reading || (flight.t > 0.42 && flight.t < 1));
    if (flight.t >= 1) { tint(cordOf(flight.card), false); litCard(flight.i, false); if (headSolid) headSolid.removeAttribute("data-lit"); const f = flight; flight = null; land(f); lastFeed = clock; }
  }
  if (resetAt !== null) {
    resetAt += dt;
    const a = Math.max(0, 1 - resetAt / 0.7);
    for (let j = 0; j < CARDS.length; j += 1) els[j].style.opacity = String(a);
    if (resetAt > 0.8 || calm) resetAll();
  }
  if (touring && !flight && resetAt === null && clock - lastFeed > (fed >= CARDS.length ? 2.8 : 0.35)) {
    feed();
    toured += 1;
    if (toured % 5 === 0) turn(win === 4 ? 2 : win === 2 ? 1 : 4);
  }
  // the LED reading rolls to net spend per month on a damped spring
  const want = rep.perMonth;
  const stiff = 60, drag = calm ? 2 * Math.sqrt(60) : 11;
  for (let s = 0; s < 4; s += 1) { needleRate += ((want - needleAt) * stiff - needleRate * drag) * dt / 4; needleAt += needleRate * dt / 4; }
  if (calm) { needleAt = want; needleRate = 0; }
  showLed(needleAt);
  slipRise = Math.min(1, slipRise + dt / 0.5);
  slip.setAttribute("transform", translateAlong(P, [0, 0, (ease(slipRise) - 1) * 4]));
  const settled = !touring && !flight && resetAt === null && Math.abs(want - needleAt) < 0.5 && Math.abs(needleRate) < 0.5 && slipRise >= 1;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; run(); }, 6000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("click", () => { hold(); feed(); });
keyEls.forEach((key, i) => key.addEventListener("click", (event) => { event.stopPropagation(); hold(); turn(i); }));
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowUp") turn(Math.min(WINDOWS.length - 1, win + 1));
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") turn(Math.max(0, win - 1));
  else if (event.key === " " || event.key === "Enter") feed();
  else return;
  event.preventDefault();
  hold();
});
if (still.matches) { fed = CARDS.length; CARDS.forEach((card, i) => { place(i, slots.pockets[card.pocket], [POCKET_AT[card.pocket][0], POCKET_AT[card.pocket][1], C.POCKET_FLOOR + stacks[card.pocket] * C.CARD_GAP]); stacks[card.pocket] += 1; }); sorted = CARDS.slice(); layHopper(); }
else layHopper();
print();
needleAt = rep.perMonth;
showLed(needleAt);
if (still.matches && svg.pauseAnimations) svg.pauseAnimations();
window.__sorter = { feed, turn, state: () => ({ fed, win, rep, stacks }) };
`;

const r12 = M.report(M.CARDS, 4);
const plate = k.plateHtml({
  fig: "Fig 1",
  title: "Statement sorter",
  hint: "Click: feed · keys or ←/→: window",
  readout: "12m",
  keys: [
    { mark: "lit", label: "The card being read and the crossbar route that sends it" },
    { mark: "raised", label: "Cards: one bank-statement transaction each (date, Type, payee, amount)" },
    { mark: "edge", label: "Crossbar: payee column → node on its Default Category row; a column with no node is a payee not yet taught" },
    { mark: "raised", label: `Pockets, left to right: ${M.POCKETS.map((p) => `${p.name} (${p.rows.toLocaleString("en-AU")})`).join(", ")}` },
  ],
  caption: `Every row of the ledger is a card. The read head checks Type first: a Transfer goes to its own pocket and is never counted as cost or income; Income from a payee taught as income is income, and Income from a shop is a refund. For an Expense, the node in the payee's crossbar column picks the category; a payee with no node drops into Uncategorised, which still counts as cost and is what fin categorize and fin doctor clear. The console never stores a report: it recomputes from the pockets on every card and every press of a window key, using the windows of fin cost (month to date, then 1, 3, 6 or 12 complete months). Net spend is expenses minus refunds, the LED display shows it per month, the slate shows each group's share, and the date window is the coverage line: every window that runs past the last card is marked partial. The thirty sample cards are illustrative (12m: ${M.money(r12.net)} net, ${M.money(r12.perMonth)} a month); the pocket counts in the legend are the real ledger's ${M.LEDGER.rows.toLocaleString("en-AU")} rows, ${M.LEDGER.firstDate} to ${M.LEDGER.lastDate}.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Statement sorter: click or press space to feed a card, arrow keys turn the report window" aria-valuemin="0" aria-valuemax="4" aria-valuenow="4">${svg}</div>`,
});

const CYBER_CSS = `
body.iso[data-theme="dark"]{
  --anatomy-page:#02050b;--anatomy-card:#040a15;--anatomy-text:#5f8fa6;--anatomy-strong:#c9f6ff;--anatomy-muted:#3d6577;
  --anatomy-paper:#061224;--anatomy-face:#0b1d36;--anatomy-top:#0a1a30;
  --anatomy-shade-0:#040c18;--anatomy-shade-1:#06101f;--anatomy-shade-2:#081527;--anatomy-shade-3:#0a1a2f;
  --anatomy-lit-top:#2a0f33;--anatomy-lit-shade:#1c0a24;
  --anatomy-hi:#8ff5ff;--anatomy-mid:#2e9fc4;--anatomy-lo:#1b5d7c;--anatomy-faint:#123552;--anatomy-lit:#ff4fe6;
  --anatomy-halo:#00c2ff;--anatomy-halo-opacity:.10;--anatomy-dot:#8ff5ff;
  --cy-grid:#1fb6ff;--cy-glass:#03202e;--cy-scan:#41e3ff;--cy-glow:#00d0ff;
  --anatomy-lift:inset 0 1px 0 0 #8ff5ff14,inset 0 0 0 1px #2e9fc426,0 0 0 1px #000,0 0 40px -8px #00b7ff40;
}
body.iso[data-theme="dark"] .iso-plate{
  background:
    radial-gradient(ellipse 70% 55% at 50% 58%,#0a2a4a66,transparent 70%),
    radial-gradient(ellipse 40% 30% at 85% 15%,#ff4fe612,transparent 70%),
    linear-gradient(#040a15,#030812);
}
body.iso[data-theme="dark"] .iso-plate::after{
  content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:repeating-linear-gradient(0deg,#8ff5ff05 0 1px,transparent 1px 3px);
}
body.iso[data-theme="dark"] .iso-plate-corner{color:var(--anatomy-mid);text-shadow:0 0 6px #00d0ff55}
body.iso[data-theme="dark"] .iso-plate-corner[data-corner="readout"]{color:var(--anatomy-hi)}
.cy-grid{fill:none;stroke:var(--cy-grid);opacity:.32}
.cy-underglow{fill:var(--cy-glow);opacity:.16;filter:blur(14px)}
.cy-glass{fill:var(--cy-glass)}
.cy-scanline{fill:var(--cy-scan);opacity:.09}
.cy-packet path{fill:none;stroke:var(--anatomy-hi);stroke-width:2.2;stroke-linecap:round;filter:url(#cy-glow)}
.cy-packet[data-out] path{stroke:var(--anatomy-lit)}
body.iso[data-theme="dark"] .iso-face-text[data-tone="hi"]{filter:url(#cy-glow)}
body.iso[data-theme="dark"] [data-live] .iso-line{filter:url(#cy-glow);stroke-width:1}
body.iso[data-theme="dark"] [data-live] .iso-wire-end{fill:var(--anatomy-lit)}
body.iso[data-theme="dark"] .iso-solid[data-lit]>.iso-edge{filter:url(#cy-glow)}
body.iso[data-theme="dark"] .iso-solid>.iso-edge{stroke:var(--anatomy-mid)}
body.iso[data-theme="dark"] .iso-wire-end{stroke:var(--anatomy-mid)}
body.iso[data-theme="dark"] .iso-dots circle{fill:var(--anatomy-hi)}
body.iso[data-theme="dark"] .fx-led{fill:var(--anatomy-hi);filter:url(#cy-glow);animation:fx-blink 2.6s steps(1,end) infinite}
body.iso[data-theme="dark"] .fx-strip{fill:var(--anatomy-hi);fill-opacity:.5;stroke:var(--anatomy-hi);filter:url(#cy-glow)}
body.iso[data-theme="dark"] .fx-seg{fill:var(--anatomy-faint);opacity:.55}
body.iso[data-theme="dark"] .fx-seg[data-on]{fill:var(--anatomy-hi);opacity:1;filter:url(#cy-glow)}
body.iso[data-theme="dark"] .fx-pane{fill:#41e3ff;fill-opacity:.07}
body.iso[data-theme="dark"] .fx-glint{fill:#8ff5ff;fill-opacity:.16}
body.iso[data-theme="dark"] .fx-keylamp{fill:var(--anatomy-faint)}
body.iso[data-theme="dark"] .fx-keylamp[data-on]{fill:var(--anatomy-hi);stroke:var(--anatomy-hi);filter:url(#cy-glow)}
@keyframes fx-blink{0%{opacity:1}40%{opacity:.25}55%{opacity:1}80%{opacity:.6}}
@media (prefers-reduced-motion: reduce){.cy-packet{display:none}.fx-led{animation:none!important}}
`;
const CSS = `<style>${CYBER ? CYBER_CSS : ""}
.iso-stage { cursor: pointer; outline: none; }
.fx-led { fill: var(--anatomy-lo); }
.fx-strip { fill: var(--anatomy-faint); }
.fx-seg { fill: var(--anatomy-faint); opacity: .45; }
.fx-seg[data-on] { fill: var(--anatomy-lit); opacity: 1; }
.fx-pane { fill: var(--anatomy-hi); fill-opacity: .04; }
.fx-glint { fill: #fff; fill-opacity: .55; }
.fx-keylamp { fill: var(--anatomy-faint); }
.fx-keylamp[data-on] { fill: var(--anatomy-lit); stroke: var(--anatomy-lit); }
[data-key] { cursor: pointer; }
.iso-stage:focus-visible { box-shadow: 0 0 0 1px var(--anatomy-lo); border-radius: 6px; }
</style>`;

const name = theme === "light" ? "finance-sorter-light.html" : "finance-sorter.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Statement sorter", theme, body: CSS + plate, script: kitScript() + live, width: 720 }));
console.log("wrote", name);
