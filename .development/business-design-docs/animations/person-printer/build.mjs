import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/avarile/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/home/avarile/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
// The dark build wears the same "data space" skin as the memory catalog.
const CYBER = theme === "dark";

const WIDTH = 640;
const HEIGHT = 400;

// ── World plan (units ≈ px, z up; +x and +y face the reader) ────────────────
const BENCH = { x: -96, y: -98, w: 196, d: 196, r: 9 };
const BENCH_H = 10;
const FOOT_H = 5;

const CHASSIS = { x: -64, y: -74, w: 108, d: 148, r: 4 };
const CH_H = 22;
const FACE_Y = CHASSIS.y + CHASSIS.d; // the control face (+y)
const FACE_X = CHASSIS.x + CHASSIS.w; // the vented face (+x)

const BED = { x: -40, y: -34, w: 60, d: 68, r: 2 };
const BED_Z = CH_H;
const BED_TOP = BED_Z + 4;

const FIG = [-10, 0];
const LH = M.LAYER_H;
const layerZ = (i) => BED_TOP + i * LH;

const POST_X = -46; // post centre
const POST_Y = 62;
const POST_TOP = 162;
const BAR_H = 6;

// The moving head is built with its nozzle tip at z = 0 and y = 0, then translated.
const tipFor = (layers) => layerZ(layers) + 0.3;
const PARK = 30; // the head waits this far to one side of the figure

const TROUGH = { x0: BED.x + BED.w, x1: 67, z: 22.6, h: 2.2, w: 2.6 };
const CAN = { x: 70, y: 0, r: 12, h: 18 };
const FUNNEL_R = 5;
const SIGHT = { x: CAN.x + CAN.r - 0.4, z0: 3, z1: 15 };

const SLIDER = { x0: -50, x1: -8, z: 10 };
const LEVER_X = 4;
const COUNTER = { x: 16, w: 20, z0: 9, z1: 16 };

const P = k.fitProjection(
  [
    ...k.boxCorners(BENCH, -BENCH_H - FOOT_H, 0),
    [POST_X, -POST_Y - 6, POST_TOP + BAR_H + 12],
    [POST_X, POST_Y + 6, POST_TOP + BAR_H],
    [POST_X + 14, -POST_Y, POST_TOP + BAR_H + 12],
  ],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 36 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const onFaceY = (x0, x1, z, y = FACE_Y) => k.segment([x0, y, z], [x1, y, z], P);
const upFaceY = (x, z0, z1, y = FACE_Y) => k.segment([x, y, z0], [x, y, z1], P);
const box = (x0, x1, y0, y1, z, h, r = 0.6, steps = 2) => slab({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z, h, steps);

// ── Bench ───────────────────────────────────────────────────────────────────
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BENCH, -BENCH_H - FOOT_H, BENCH_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BENCH, 22))) {
    out.push(S(k.cylinder(x, y, 7, -BENCH_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BENCH_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(slab(BENCH, -BENCH_H, BENCH_H, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(BENCH, -BENCH_H + 4, P, 8), { tone: "faint" }) }));
  const groove = k.insetPlan(BENCH, 5);
  if (CYBER) {
    const lines = [];
    for (let x = -80; x <= 90; x += 10) lines.push(k.lineOnTop([x, groove.y], [x, groove.y + groove.d], 0, P));
    for (let y = -90; y <= 90; y += 10) lines.push(k.lineOnTop([groove.x, y], [groove.x + groove.w, y], 0, P));
    out.push(L(lines.join(""), { tone: "faint", className: "cy-grid" }));
  }
  out.push(L(k.planOutline(groove, 0, P), { tone: "faint" }));
  const screws = k.corners(BENCH, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  return out.join("");
}

// A ruler strip along the near (+y) edge: one tick per day of the window, a long one per week.
function ruler() {
  const strip = { x: -60, y: 80, w: 104, d: 6.5, r: 1 };
  const out = [S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" })];
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.1, 0.6, [2, 3.8], P, "x");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.5, strip.y + 4.6, 0.6]), at([strip.x + strip.w - 1.5, strip.y + 4.6, 0.6])], { size: 0.45 }));
  return out.join("");
}

function plate() {
  const plan = { x: 54, y: 62, w: 36, d: 22, r: 1.6 };
  const out = [S(slab(plan, 0, 0.8, 4), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([plan.x + 5, plan.y + 7.5], 0.8, P, "x"), "person/", { size: 4.2, tone: "lo" }));
  for (const [y, len] of [[12, 24], [15, 18], [18, 21]]) out.push(L(k.lineOnTop([plan.x + 5, plan.y + y], [plan.x + 5 + len, plan.y + y], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([plan.x + 2.6, plan.y + 3, 0.8]), at([plan.x + plan.w - 2.6, plan.y + 3, 0.8]), at([plan.x + 2.6, plan.y + plan.d - 3, 0.8]), at([plan.x + plan.w - 2.6, plan.y + plan.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ── Chassis: the printer's body, with its controls on the near face ─────────
function chassis() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CHASSIS, 0, 2, P)}" style="filter:blur(3px)"/>`];
  // Rubber feet under the corners.
  for (const [x, y] of byDepth(k.corners(CHASSIS, 8))) out.push(S(k.cylinder(x, y, 3.4, 0, 1.6, P, 20), { tone: "lo" }));
  out.push(S(slab(CHASSIS, 1.6, CH_H - 1.6, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(CHASSIS, 5, P, 4), { tone: "faint" }) }));
  // Top deck: a groove and four screws.
  const deck = k.insetPlan(CHASSIS, 4);
  out.push(L(k.planOutline(deck, CH_H, P, 4), { tone: "faint" }));
  out.push(D(k.corners(CHASSIS, 2.2).map(([x, y]) => at([x, y, CH_H])), { size: 0.5 }));
  // Vents on the +x face: closed slots.
  for (let i = 0; i < 9; i++) {
    const y0 = -52 + i * 6;
    const slot = [[FACE_X, y0, 8], [FACE_X, y0 + 3.6, 8], [FACE_X, y0 + 3.6, 15], [FACE_X, y0, 15]].map(at);
    out.push(L(k.pathOf(slot, true), { tone: "lo" }));
  }
  // The trough bracket on the +x face.
  out.push(S(box(FACE_X, FACE_X + 2, -3.4, 3.4, 15, 7.4), { tone: "mid", crease: "none" }));
  out.push(D([at([FACE_X + 2, -2, 21]), at([FACE_X + 2, 2, 21])], { size: 0.4 }));
  return out.join("");
}

// The persistence slider: a slot with a scale above it and a knob that rides it.
function sliderStatic() {
  const { x0, x1, z } = SLIDER;
  const out = [];
  const bezel = box(x0 - 3, x1 + 3, FACE_Y, FACE_Y + 0.6, z - 3, 6, 0.6);
  out.push(S(bezel, { tone: "lo", crease: "none" }));
  const y = FACE_Y + 0.6;
  out.push(L(k.pathOf([[x0, y, z - 0.8], [x1, y, z - 0.8], [x1, y, z + 0.8], [x0, y, z + 0.8]].map(at), true), { tone: "faint" }));
  const ticks = k.sideTicks(x0, x1, (x1 - x0) / 20, 5, y, z + 3, [0.9, 1.8], P, "x");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([x0 - 1.6, y, z]), at([x1 + 1.6, y, z])], { size: 0.4 }));
  return out.join("");
}
function sliderKnob() {
  const { x0, z } = SLIDER;
  const y = FACE_Y + 0.6;
  return S(box(x0 - 1.6, x0 + 1.6, y, y + 2.4, z - 2.2, 4.4, 0.6), { tone: "hi" }) + L(k.segment([x0, y + 2.4, z - 1.4], [x0, y + 2.4, z + 1.4], P), { tone: "mid" });
}

// The retention lever: a boss on the face and a handle up (hold) or down (wash).
function leverBoss() {
  return S(box(LEVER_X - 3, LEVER_X + 3, FACE_Y, FACE_Y + 1.6, 7, 7, 1.2), { tone: "mid" }) + D([at([LEVER_X, FACE_Y + 1.6, 10.5])], { size: 0.5 });
}
function leverHandle(up) {
  const y = FACE_Y + 1.6;
  const [z0, z1] = up ? [10, 19.5] : [1.5, 11];
  const grip = up ? z1 - 3 : z0;
  return S(box(LEVER_X - 0.9, LEVER_X + 0.9, y, y + 1.4, z0, z1 - z0, 0.4), { tone: "mid", crease: "none" }) + S(box(LEVER_X - 1.8, LEVER_X + 1.8, y + 1.4, y + 3.2, grip, 3, 0.8), { tone: "hi" });
}

// The day counter: three wheels behind a window on the face.
function counter() {
  const { x, w, z0, z1 } = COUNTER;
  const out = [S(box(x, x + w, FACE_Y, FACE_Y + 0.8, z0, z1 - z0, 0.6), { tone: "lo" })];
  const y = FACE_Y + 0.8;
  for (let i = 1; i < 3; i++) out.push(L(upFaceY(x + (w * i) / 3, z0 + 1, z1 - 1, y), { tone: "faint" }));
  out.push(L(k.pathOf([[x + 1, y, z0 + 1], [x + w - 1, y, z0 + 1], [x + w - 1, y, z1 - 1], [x + 1, y, z1 - 1]].map(at), true), { tone: "faint" }));
  const text = k.faceTextSvg(k.sideMatrix([x + 2.2, y + 0.05], z0 + 2.1, P, "left"), "000", { size: 4.6, tone: "hi" });
  out.push(text.replace("<text", '<text data-counter textLength="' + (w - 4.4) + '" lengthAdjust="spacing"'));
  return out.join("");
}

// ── Bed: the plate the person is printed on, with its four hold clamps ──────
const CLIPS = [[BED.x + 6, BED.y], [BED.x + BED.w - 14, BED.y], [BED.x + 6, BED.y + BED.d - 4], [BED.x + BED.w - 14, BED.y + BED.d - 4]];
function bedStatic() {
  const out = [S(slab(BED, BED_Z, 4, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(BED, BED_Z + 1.6, P, 3), { tone: "faint" }) })];
  out.push(L(k.planOutline(k.insetPlan(BED, 3), BED_TOP, P, 3), { tone: "faint" }));
  // The drain groove: from the foot of the figure to the trough at the bed's edge.
  const g0 = FIG[0] + M.PROFILE[0] + 1;
  out.push(L(k.lineOnTop([g0, -1.2], [BED.x + BED.w, -1.2], BED_TOP, P) + k.lineOnTop([g0, 1.2], [BED.x + BED.w, 1.2], BED_TOP, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([g0, -1.2], [g0, 1.2], BED_TOP, P), { tone: "lo" }));
  return out.join("");
}
function clip([x, y]) {
  const out = [S(box(x, x + 8, y, y + 4, BED_TOP, 1.6, 0.6), { tone: "mid" })];
  out.push(D([at([x + 4, y + 2, BED_TOP + 1.6])], { size: 0.45 }));
  return out.join("");
}

// ── The person: one solid per layer, and a wet twin that is drawn while it is fresh ──
function layers() {
  return M.PROFILE.map((r, i) => {
    const z = layerZ(i);
    // Far arm, body, near arm: each layer is painted back to front.
    const a = M.armR(i);
    const pieces = (style) => [a ? S(k.cylinder(FIG[0], FIG[1] - M.ARM.y, a, z, LH, P, 16), style) : "", S(k.cylinder(FIG[0], FIG[1], r, z, LH, P, 28), style), a ? S(k.cylinder(FIG[0], FIG[1] + M.ARM.y, a, z, LH, P, 16), style) : ""].join("");
    const solid = pieces({ tone: "hi", crease: "lo" });
    const wet = pieces({ tone: "lo", crease: "none" });
    return `<g data-layer="${i}" style="display:none"><g data-solid>${solid}</g><g data-wet opacity="0">${wet}</g></g>`;
  }).join("");
}

// ── Frame: two posts, the top bar and the spool of fresh data ───────────────
function post(sign) {
  const y = sign * POST_Y;
  const plan = { x: POST_X - 4, y: y - 4, w: 8, d: 8, r: 1 };
  const out = [S(box(POST_X - 7, POST_X + 7, y - 7, y + 7, CH_H, 3, 1), { tone: "mid" })];
  out.push(D(k.corners({ x: POST_X - 7, y: y - 7, w: 14, d: 14 }, 2).map(([px, py]) => at([px, py, CH_H + 3])), { size: 0.45 }));
  out.push(S(slab(plan, CH_H + 3, POST_TOP - CH_H - 3, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, 60, P, 3), { tone: "faint" }) }));
  // A ruler strip on the near post's +x face: one tick per two layers, a long one every ten.
  if (sign > 0) {
    const face = POST_X + 4, strip = { x: face, y: y - 3.4, w: 0.5, d: 6.4, r: 0.2 };
    out.push(S(slab(strip, BED_TOP - 2, LH * M.N + 4, 2), { tone: "lo", crease: "none" }));
    const minor = [], major = [];
    for (let i = 0; i <= M.N; i += 2) {
      const z = BED_TOP + i * LH, edge = strip.y + 0.05;
      (i % 10 === 0 ? major : minor).push(k.segment([face + 0.5, edge, z], [face + 0.5, edge + (i % 10 === 0 ? 3.2 : 1.8), z], P));
    }
    out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  }
  return out.join("");
}
function topBar() {
  const bar = { x: POST_X - 5, y: -POST_Y - 6, w: 10, d: POST_Y * 2 + 12, r: 1.4 };
  const out = [S(slab(bar, POST_TOP, BAR_H, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(bar, POST_TOP + 2.4, P, 3), { tone: "faint" }) })];
  out.push(D([-POST_Y, POST_Y].flatMap((y) => [at([POST_X, y - 2.6, POST_TOP + BAR_H]), at([POST_X, y + 2.6, POST_TOP + BAR_H])]), { size: 0.5 }));
  return out.join("");
}
const SPOOL = [POST_X, -POST_Y + 26];
const SPOOL_Z = POST_TOP + BAR_H;
function spool() {
  const [x, y] = SPOOL;
  const out = [];
  out.push(S(k.cylinder(x, y, 3, SPOOL_Z, 2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 15, SPOOL_Z + 2, 1.2, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 12.5, SPOOL_Z + 3.2, 5.6, P, 40), { tone: "lo", inner: L([1, 2, 3, 4].map((i) => k.sideArc(x, y, 12.5, SPOOL_Z + 3.2 + i * 1.12, P, 32)).join(""), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 15, SPOOL_Z + 8.8, 1.2, P, 40), { tone: "mid" }));
  out.push(L(k.ring(x, y, 4.4, SPOOL_Z + 10, P, 24), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 2.4, SPOOL_Z + 10, 2.4, P, 20), { tone: "mid" }) + L(k.knurl(x, y, 2.4, SPOOL_Z + 10, SPOOL_Z + 12.4, 12, P), { tone: "lo" }));
  return out.join("");
}
const SPOOL_OUT = [SPOOL[0] + 12.5, SPOOL[1] + 2, SPOOL_Z + 6];

// ── The moving gantry: carriages on the posts, the beam, and the print head ──
// Built with the nozzle tip at z = 0; the beam and carriages move in z only, the head also in y.
const BEAM = { x: POST_X + 5, w: 6, z: 12, h: 8 };
function carriage(sign) {
  const y = sign * POST_Y;
  const plan = { x: POST_X + 4, y: y - 7, w: 5, d: 14, r: 1 };
  return S(slab(plan, 8, 16, 3, 0.4), { tone: "mid" }) + D([at([POST_X + 9, y - 4, 12]), at([POST_X + 9, y + 4, 12]), at([POST_X + 9, y - 4, 20]), at([POST_X + 9, y + 4, 20])], { size: 0.4 });
}
function beam() {
  const plan = { x: BEAM.x + 4, y: -POST_Y + 7, w: BEAM.w, d: POST_Y * 2 - 14, r: 1 };
  const out = [S(slab(plan, BEAM.z, BEAM.h, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, BEAM.z + 3, P, 3), { tone: "faint" }) })];
  // A rail strip along the beam's top.
  const strip = { x: plan.x + 1.6, y: plan.y + 3, w: 2.8, d: plan.d - 6, r: 0.6 };
  out.push(S(slab(strip, BEAM.z + BEAM.h, 0.5, 2), { tone: "lo", crease: "none" }));
  out.push(D([at([strip.x + 1.4, strip.y + 1.2, BEAM.z + BEAM.h + 0.5]), at([strip.x + 1.4, strip.y + strip.d - 1.2, BEAM.z + BEAM.h + 0.5])], { size: 0.4 }));
  return out.join("");
}
const HEAD_X = BEAM.x + 4 + BEAM.w; // the carriage plate's back, on the beam's +x face
function headSvg() {
  const out = [];
  // Carriage plate on the beam.
  const platePlan = { x: HEAD_X, y: -9, w: 3, d: 18, r: 0.8 };
  out.push(S(slab(platePlan, 9, 18, 3, 0.4), { tone: "mid" }));
  out.push(D([[-6, 11], [6, 11], [-6, 25], [6, 25]].map(([y, z]) => at([HEAD_X + 3, y, z])), { size: 0.45 }));
  // Arm out to the hot end.
  const arm = { x: HEAD_X + 3, y: -4, w: FIG[0] - 3 - HEAD_X - 3, d: 8, r: 0.8 };
  out.push(S(slab(arm, 15, 6, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(arm, 17, P, 3), { tone: "faint" }) }));
  // The cure lamp hangs from the arm: a hood and its lens, facing the work.
  const hood = { x: FIG[0] - 15, y: -4.5, w: 6, d: 9, r: 1 };
  out.push(S(slab(hood, 8, 7, 3, 0.4), { tone: "mid" }));
  out.push(`<g data-lamp>${S(box(FIG[0] - 9, FIG[0] - 8.4, -3.4, 3.4, 9, 4.4, 0.3), { tone: "lo", crease: "none" })}</g>`);
  // Heater block, fan shroud with its grille, and the nozzle.
  const heater = { x: FIG[0] - 5, y: -5, w: 10, d: 10, r: 0.8 };
  out.push(S(slab(heater, 4, 11, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(heater, 8, P, 3), { tone: "faint" }) }));
  const fan = { x: FIG[0] - 5, y: 5, w: 10, d: 3, r: 0.6 };
  const grille = [];
  for (let i = 0; i < 4; i++) {
    const x = FIG[0] - 3.8 + i * 2.2;
    grille.push(k.pathOf([[x, 8, 6], [x + 1.2, 8, 6], [x + 1.2, 8, 13], [x, 8, 13]].map(at), true));
  }
  out.push(S(slab(fan, 4.6, 10.4, 2), { tone: "mid", inner: L(grille.join(""), { tone: "lo" }) }));
  out.push(S(k.cylinder(FIG[0], 0, 2.4, 1.6, 2.4, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(FIG[0], 0, 1.1, 0.2, 1.4, P, 16), { tone: "hi" }));
  out.push(D([at([FIG[0] + 5, -3, 15]), at([FIG[0] + 5, 3, 15])], { size: 0.4 }));
  // The filament coupler on top of the carriage.
  out.push(S(k.cylinder(HEAD_X + 1.5, 0, 2, 27, 3, P, 16), { tone: "mid" }));
  return out.join("");
}
const COUPLER = [HEAD_X + 1.5, 0, 30];

// ── Waste: trough, canister and its sight glass ─────────────────────────────
function trough() {
  const { x0, x1, z, h, w } = TROUGH;
  const plan = { x: x0, y: -w / 2, w: x1 - x0 + w / 2, d: w, r: 0.5 };
  const out = [S(slab(plan, z, h, 2), { tone: "mid", inner: "" })];
  out.push(L(k.lineOnTop([x0, 0], [x1, 0], z + h, P), { tone: "faint" }));
  // The chute drops from the trough's end to just above the funnel.
  const chute = { x: x1 - w / 2, y: -w / 2, w, d: w, r: 0.5 };
  out.push(S(slab(chute, CAN.h + 3, z - CAN.h - 3, 2), { tone: "mid" }));
  return out.join("");
}
function canister() {
  const { x, y, r, h } = CAN;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - r, y: y - r, w: r * 2, d: r * 2, r }, 0, 2, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.cylinder(x, y, r + 1, 0, 1.6, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, r, 1.6, h - 1.6, P, 40), { tone: "mid", inner: L(k.sideArc(x, y, r, 6, P, 40), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, r + 0.6, h, 1.4, P, 40), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, FUNNEL_R, h + 1.4, 1.6, P, 28), { tone: "mid" }));
  out.push(L(k.ring(x, y, FUNNEL_R - 1.2, h + 3, P, 24), { tone: "lo" }));
  out.push(D([0, 90, 180, 270].map((a) => at([x + Math.cos((a * Math.PI) / 180) * (r - 2.6), y + Math.sin((a * Math.PI) / 180) * (r - 2.6), h + 1.4])), { size: 0.45 }));
  return out.join("");
}
// The sight glass on the canister's +x side, with a scale; the level inside it moves.
function sightStatic() {
  const { x, z0, z1 } = SIGHT;
  const out = [S(box(x, x + 1.4, -2.2, 2.2, z0 - 1, z1 - z0 + 2, 0.6), { tone: "lo" })];
  const face = x + 1.4;
  const minor = [], major = [];
  for (let i = 0; i <= 8; i++) {
    const z = z0 + ((z1 - z0) * i) / 8;
    (i % 4 === 0 ? major : minor).push(k.segment([face, 2.2, z], [face, i % 4 === 0 ? 3.8 : 3.2, z], P));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  return out.join("");
}
function sightLevel() {
  const { x, z0 } = SIGHT;
  // Built full height; the page scales it from the bottom.
  return S(box(x + 1.4, x + 1.8, -1.2, 1.2, z0, SIGHT.z1 - z0, 0.2), { tone: "hi", crease: "none" });
}

// ── The path a drop of uncured resin runs: down the figure's near side, along the
// groove, the trough and the chute, into the funnel. One per layer.
function dripPath(i) {
  const pts = [];
  const side = (r) => FIG[0] + r + 0.5;
  pts.push([side(M.PROFILE[i]), 0, layerZ(i) + LH * 0.6]);
  for (let j = i; j >= 0; j--) {
    pts.push([side(M.PROFILE[j]), 0, layerZ(j) + LH]);
    pts.push([side(M.PROFILE[j]), 0, layerZ(j)]);
  }
  pts.push([side(M.PROFILE[0]) + 1.2, 0, BED_TOP]);
  pts.push([BED.x + BED.w, 0, BED_TOP]);
  pts.push([TROUGH.x0 + 0.4, 0, TROUGH.z + TROUGH.h]);
  pts.push([TROUGH.x1, 0, TROUGH.z + TROUGH.h]);
  pts.push([TROUGH.x1 + 2.2, 0, CAN.h + 3]);
  pts.push([CAN.x, 0, CAN.h + 2]);
  return pts.map(at).map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
}

// ── Assemble ────────────────────────────────────────────────────────────────
const REST_TIP = tipFor(0);
const label = `A small resin printer on a bench, printing a person one layer a day. The head lays a fresh layer of resin each day. When the cure lamp sets it, it becomes part of the person; when it doesn't, it stays liquid and drains down the side, along a trough and into a waste canister, adding nothing. A lever on the side sets whether the bed holds the print; without it, the print is washed off every ${M.WINDOW} days.`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label,
  body: [
    `<g data-tip="bench">${bench()}${ruler()}${plate()}</g>`,
    `<g data-tip="body">${chassis()}</g>`,
    `<g data-tip="persist">${sliderStatic()}<g data-part="knob">${sliderKnob()}</g></g>`,
    `<g data-tip="retain">${leverBoss()}<g data-part="lever-up">${leverHandle(true)}</g><g data-part="lever-down" style="display:none">${leverHandle(false)}</g></g>`,
    `<g data-tip="counter">${counter()}</g>`,
    `<g data-tip="bed">${bedStatic()}</g>`,
    `<g data-tip="retain">${CLIPS.slice(0, 2).map((c, i) => `<g data-clip="${i}">${clip(c)}</g>`).join("")}</g>`,
    `<g data-tip="frame">${post(-1)}</g>`,
    `<g data-tip="person">${layers()}</g>`,
    `<g data-tip="retain">${CLIPS.slice(2).map((c, i) => `<g data-clip="${i + 2}">${clip(c)}</g>`).join("")}</g>`,
    `<g data-tip="waste">${canister()}${trough()}${sightStatic()}<g data-part="level">${sightLevel()}</g></g>`,
    `<g data-slot="drips"></g>`,
    `<g data-tip="frame">${post(1)}</g>`,
    `<g data-part="gantry" data-tip="frame" transform="${k.translateAlong(P, [0, 0, REST_TIP])}">${carriage(-1)}${beam()}${carriage(1)}</g>`,
    `<g data-part="head" data-tip="head" transform="${k.translateAlong(P, [0, -PARK, REST_TIP])}">${headSvg()}</g>`,
    `<g data-tip="frame">${topBar()}</g>`,
    `<g data-tip="spool">${spool()}</g>`,
    `<g data-part="filament" data-tip="spool">${k.wireSvg(at(SPOOL_OUT), at([COUPLER[0], -PARK, COUPLER[2] + REST_TIP]), { tone: "lo", size: 0.7 })}</g>`,
  ],
});

// ── Live ────────────────────────────────────────────────────────────────────
const DATA = {
  P,
  N: M.N,
  LH,
  PROFILE: M.PROFILE,
  PERSON: M.PERSON,
  WINDOW: M.WINDOW,
  DRIPS: M.PROFILE.map((_, i) => dripPath(i)),
  C: { REST_TIP, PARK, SLIDE: SLIDER.x1 - SLIDER.x0, SIGHT_Z0: SIGHT.z0, SIGHT_X: SIGHT.x + 1.4, SIGHT_H: SIGHT.z1 - SIGHT.z0, SPOOL_OUT, COUPLER, CLIP_LIFT: 1.8 },
};
const MODEL = [M.armR, M.volumeOf, M.fresh, M.step].map((fn) => fn.toString()).join("\n");

const live = `
const D = ${JSON.stringify(DATA)};
const P = D.P, C = D.C;
const N = D.N, PROFILE = D.PROFILE, PERSON = D.PERSON, WINDOW = D.WINDOW;
const ARM = ${JSON.stringify(M.ARM)};
${MODEL}
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const q = (sel) => svg.querySelector(sel);
const parts = { gantry: q('[data-part="gantry"]'), head: q('[data-part="head"]'), knob: q('[data-part="knob"]'), up: q('[data-part="lever-up"]'), down: q('[data-part="lever-down"]'), level: q('[data-part="level"]'), lamp: q("[data-lamp] .iso-solid"), filament: q('[data-part="filament"] .iso-wire'), counter: q("[data-counter]") };
const layerEls = [...svg.querySelectorAll("[data-layer]")].map((g) => ({ g, solid: g.querySelector("[data-solid]"), wet: g.querySelector("[data-wet]"), bodies: [...g.querySelectorAll("[data-solid] .iso-solid")] }));
const clipEls = [...svg.querySelectorAll("[data-clip]")];
const dripSlot = q('[data-slot="drips"]');
const readout = document.querySelector("[data-readout]");
const announcer = stage.querySelector("[data-live]");
const ui = { persist: document.querySelector("[data-persist]"), persistOut: document.querySelector("[data-persist-out]"), retain: document.querySelector("[data-retain]"), play: document.querySelector("[data-play]"), speed: document.querySelector("[data-speed]"), reset: document.querySelector("[data-reset]") };
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const ramp = (t, a, b) => ease(clamp((t - a) / (b - a), 0, 1));

// ── Settings and the model ──
const settings = { persist: 1, retain: true, speed: 1, playing: true };
let model = fresh();
const DAY = 1.05; // seconds a day takes at 1×
// What is on the bench right now: layers shown as solid, the day in progress, a wash in progress.
let shown = 0, today = null, wash = null, hold = 0, lastSide = 1;
const drips = []; // { pts, lens, total, t, dur }
const level = [0, 0]; // canister level [shown, target], 0..1 of one person
const tip = [C.REST_TIP, C.REST_TIP];

function startDay() {
  const index = model.layers;
  const out = step(model, settings.persist, settings.retain);
  if (out.done && out.index === undefined) return false;
  lastSide = -lastSide;
  today = { ...out, t: 0, from: -lastSide * (PROFILE[out.index] + 8), to: lastSide * (PROFILE[out.index] + 8) };
  layerEls[index].g.style.display = "";
  layerEls[index].wet.setAttribute("opacity", "0");
  layerEls[index].solid.setAttribute("opacity", "0");
  return true;
}
function addDrip(i, delay = 0) {
  const pts = D.DRIPS[i];
  const lens = [0];
  for (let j = 1; j < pts.length; j++) lens.push(lens[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  dripSlot.insertAdjacentHTML("beforeend", '<circle class="pp-drip" r="1.1" cx="-99" cy="-99"/>');
  drips.push({ el: dripSlot.lastElementChild, pts, lens, total: lens[lens.length - 1], t: -delay, dur: 1.1 + lens[lens.length - 1] / 160, vol: volumeOf(i) });
}
function pointAt(d, s) {
  let j = 1;
  while (j < d.lens.length - 1 && d.lens[j] < s) j++;
  const f = (s - d.lens[j - 1]) / Math.max(1e-6, d.lens[j] - d.lens[j - 1]);
  return [d.pts[j - 1][0] + (d.pts[j][0] - d.pts[j - 1][0]) * f, d.pts[j - 1][1] + (d.pts[j][1] - d.pts[j - 1][1]) * f];
}

// One frame of the bench. Returns true while anything still moves.
let headY = -C.PARK, lamp = 0;
function advance(dt) {
  const T = DAY / settings.speed;
  if (!today && !wash && settings.playing && hold <= 0) {
    if (model.layers >= N) hold = 2.4;
    else startDay();
  }
  if (hold > 0) hold -= dt;
  if (today) {
    today.t += dt / T;
    const t = today.t, i = today.index, L = layerEls[i];
    // Lay: the head crosses the layer and the wet resin appears behind it.
    headY = today.from + (today.to - today.from) * ramp(t, 0, 0.5);
    L.wet.setAttribute("opacity", ramp(t, 0.02, 0.48).toFixed(3));
    if (today.cured) {
      // Cure: the lamp lights, the wet layer sets into a solid one.
      lamp = Math.sin(Math.PI * clamp((t - 0.5) / 0.3, 0, 1));
      const set = ramp(t, 0.52, 0.8);
      L.solid.setAttribute("opacity", set.toFixed(3));
      L.wet.setAttribute("opacity", (1 - set).toFixed(3));
      for (const b of L.bodies) b.toggleAttribute("data-lit", t > 0.5 && t < 1.1);
      tip[1] = C.REST_TIP + (model.layers - (today.washed ? 0 : 0)) * D.LH;
    } else {
      // No cure: the layer stays liquid and runs off.
      lamp = 0;
      if (t >= 0.5 && !today.dripped) { today.dripped = true; addDrip(i); }
      L.wet.setAttribute("opacity", (ramp(t, 0.02, 0.48) * (1 - ramp(t, 0.55, 1))).toFixed(3));
    }
    if (t >= 1) {
      for (const b of L.bodies) b.removeAttribute("data-lit");
      if (!today.cured) L.g.style.display = "none";
      else shown = i + 1;
      if (today.washed) wash = { t: 0, from: shown, n: shown };
      today = null;
    }
  } else lamp = 0;
  if (wash) {
    // Without retention, the bed lets go: the layers re-liquefy from the top and drain.
    wash.t += dt;
    const per = 0.16 / Math.sqrt(settings.speed);
    const gone = Math.min(wash.n, Math.floor(wash.t / per));
    while (shown > wash.n - gone) {
      shown--;
      const L = layerEls[shown];
      L.solid.setAttribute("opacity", "0");
      L.wet.setAttribute("opacity", "1");
      L.fading = 1;
      addDrip(shown);
    }
    tip[1] = C.REST_TIP + shown * D.LH;
    if (gone >= wash.n && wash.t > wash.n * per + 0.3) wash = null;
  }
  for (const L of layerEls) if (L.fading) {
    L.fading = Math.max(0, L.fading - dt / 0.5);
    L.wet.setAttribute("opacity", L.fading.toFixed(3));
    if (!L.fading) { L.fading = 0; L.g.style.display = "none"; }
  }
  let moving = !!(today || wash || hold > 0);
  for (let j = drips.length - 1; j >= 0; j--) {
    const d = drips[j];
    d.t += dt * Math.sqrt(settings.speed);
    if (d.t < 0) continue;
    const f = clamp(d.t / d.dur, 0, 1);
    const [x, y] = pointAt(d, d.total * (f * f * 0.35 + f * 0.65));
    d.el.setAttribute("cx", x.toFixed(2));
    d.el.setAttribute("cy", y.toFixed(2));
    d.el.setAttribute("opacity", (1 - ramp(f, 0.9, 1)).toFixed(3));
    if (f >= 1) { d.el.remove(); drips.splice(j, 1); level[1] = Math.min(1, level[1] + d.vol / PERSON); }
    moving = true;
  }
  const k = still.matches ? 1 : 1 - Math.exp(-dt / 0.25);
  for (const pair of [level, tip]) { pair[0] += (pair[1] - pair[0]) * k; if (Math.abs(pair[1] - pair[0]) < 1e-3) pair[0] = pair[1]; else moving = true; }
  return moving || settings.playing;
}

// ── Drawing ──
const applied = new Map();
function setT(el, value) { if (applied.get(el) !== value) { el.setAttribute("transform", value); applied.set(el, value); } }
const pad3 = (n) => String(Math.min(999, n)).padStart(3, "0");
let lastText = "", lastSay = "";
function draw() {
  setT(parts.gantry, translateAlong(P, [0, 0, tip[0]]));
  setT(parts.head, translateAlong(P, [0, headY, tip[0]]));
  const from = iso(C.SPOOL_OUT, P), to = iso([C.COUPLER[0], headY, C.COUPLER[2] + tip[0]], P);
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 6];
  const wire = parts.filament;
  wire.querySelector("path").setAttribute("d", "M" + from[0].toFixed(1) + " " + from[1].toFixed(1) + "Q" + mid[0].toFixed(1) + " " + mid[1].toFixed(1) + " " + to[0].toFixed(1) + " " + to[1].toFixed(1));
  const ends = wire.querySelectorAll("circle");
  ends[1].setAttribute("cx", to[0].toFixed(1)); ends[1].setAttribute("cy", to[1].toFixed(1));
  parts.lamp.toggleAttribute("data-lit", lamp > 0.2);
  setT(parts.knob, translateAlong(P, [C.SLIDE * settings.persist, 0, 0]));
  parts.up.style.display = settings.retain ? "" : "none";
  parts.down.style.display = settings.retain ? "none" : "";
  for (const el of clipEls) setT(el, settings.retain ? "" : translateAlong(P, [0, 0, C.CLIP_LIFT]));
  // The level: the bar is scaled about its bottom.
  const base = iso([C.SIGHT_X, 0, C.SIGHT_Z0], P);
  const s = Math.max(0.001, level[0]);
  setT(parts.level, "translate(" + base[0].toFixed(2) + " " + base[1].toFixed(2) + ") scale(1 " + s.toFixed(3) + ") translate(" + (-base[0]).toFixed(2) + " " + (-base[1]).toFixed(2) + ")");
  parts.counter.textContent = pad3(model.day);
  const pct = Math.round((shown / N) * 100);
  const text = "day " + model.day + " · " + (wash ? "washing off" : "person " + pct + "%") + " · " + model.lost + " lost";
  if (text !== lastText) { readout.textContent = text; lastText = text; }
  const say = model.layers >= N && !today ? "person complete in " + model.day + " days" : text;
  if (say !== lastSay && (model.day % 5 === 0 || model.layers >= N)) { announcer.textContent = say; lastSay = say; }
  if (tipOn) tipFill();
}

// ── Clock ──
let frame = 0, last = 0, visible = false;
function tick(t) {
  const dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
  last = t;
  const busy = advance(dt);
  draw();
  if (touring) tour(dt);
  frame = visible && (busy || touring) ? requestAnimationFrame(tick) : 0;
}
function wake() { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } }
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) wake(); }, { rootMargin: "120px 0px" }).observe(stage);

function reset() {
  model = fresh();
  today = null; wash = null; hold = 0; shown = 0;
  for (const d of drips) d.el.remove();
  drips.length = 0;
  for (const L of layerEls) { L.g.style.display = "none"; L.fading = 0; for (const b of L.bodies) b.removeAttribute("data-lit"); }
  level[1] = 0; tip[1] = C.REST_TIP;
  if (still.matches) { level[0] = 0; tip[0] = C.REST_TIP; }
}

// Reduced motion: no animation, each change jumps to where the run ends up after a set number of days.
function settleStill(days) {
  reset();
  for (let d = 0; d < days && model.layers < N; d++) {
    const out = step(model, settings.persist, settings.retain);
    if (out.cured) shown = model.layers; else level[1] += volumeOf(out.index) / PERSON;
    if (out.washed) { for (let i = 0; i < out.washed; i++) level[1] += volumeOf(i) / PERSON; shown = 0; }
  }
  level[1] = Math.min(1, level[1]); level[0] = level[1];
  layerEls.forEach((L, i) => { L.g.style.display = i < shown ? "" : "none"; L.solid.setAttribute("opacity", "1"); L.wet.setAttribute("opacity", "0"); });
  tip[0] = tip[1] = C.REST_TIP + shown * D.LH;
  draw();
}

// ── The tour: four runs that make the point, then round again ──
const PRESETS = [
  { persist: 1, retain: true, say: "every day persisted" },
  { persist: 0.6, retain: true, say: "3 days in 5 persisted" },
  { persist: 1, retain: false, days: 30, say: "persisted, not retained" },
  { persist: 0, retain: true, days: 24, say: "nothing persisted" },
];
let touring = !still.matches, presetAt = 0, idle = 0;
function applyPreset(p) {
  settings.persist = p.persist; settings.retain = p.retain; settings.speed = 2;
  reset(); sync();
}
function tour() {
  const p = PRESETS[presetAt];
  const finished = (model.layers >= N && hold <= 0 && !today) || (p.days && model.day >= p.days && !today && !wash && !drips.length);
  if (finished) { presetAt = (presetAt + 1) % PRESETS.length; applyPreset(PRESETS[presetAt]); }
}
function takeOver() {
  if (touring) { touring = false; settings.speed = 1; }
  clearTimeout(idle);
  if (!still.matches) idle = setTimeout(() => { touring = true; presetAt = 0; applyPreset(PRESETS[0]); settings.playing = true; sync(); wake(); }, 40000);
}

// ── Controls ──
function sync() {
  ui.persist.value = String(Math.round(settings.persist * 100));
  ui.persistOut.textContent = Math.round(settings.persist * 100) + "%";
  ui.retain.setAttribute("aria-pressed", String(settings.retain));
  ui.retain.textContent = settings.retain ? "Retention: hold" : "Retention: off";
  ui.play.textContent = settings.playing ? "Pause" : "Run";
  ui.play.setAttribute("aria-pressed", String(settings.playing));
  ui.speed.textContent = settings.speed + "×";
}
function changed() { sync(); if (still.matches) settleStill(60); else wake(); }
ui.persist.addEventListener("input", () => { takeOver(); settings.persist = Number(ui.persist.value) / 100; changed(); });
ui.retain.addEventListener("click", () => { takeOver(); settings.retain = !settings.retain; changed(); });
ui.play.addEventListener("click", () => { takeOver(); settings.playing = !settings.playing; if (settings.playing && model.layers >= N) reset(); changed(); });
ui.speed.addEventListener("click", () => { takeOver(); settings.speed = settings.speed === 1 ? 2 : settings.speed === 2 ? 4 : 1; changed(); });
ui.reset.addEventListener("click", () => { takeOver(); reset(); settings.playing = true; changed(); });
stage.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "ArrowRight" || key === "ArrowUp") settings.persist = Math.min(1, Math.round(settings.persist * 20 + 1) / 20);
  else if (key === "ArrowLeft" || key === "ArrowDown") settings.persist = Math.max(0, Math.round(settings.persist * 20 - 1) / 20);
  else if (key === "r" || key === "R") settings.retain = !settings.retain;
  else if (key === " ") settings.playing = !settings.playing;
  else if (key === "Backspace" || key === "0") { reset(); settings.playing = true; }
  else return;
  event.preventDefault();
  takeOver();
  changed();
});
// In the drawing: the lever toggles retention, the slider sets persistence by where you click along it.
stage.addEventListener("click", (event) => {
  const part = event.target.closest && event.target.closest("[data-tip]");
  if (!part) return;
  if (part.dataset.tip === "retain") { takeOver(); settings.retain = !settings.retain; changed(); }
  if (part.dataset.tip === "persist") {
    takeOver();
    const p0 = iso([${SLIDER.x0}, ${FACE_Y}, ${SLIDER.z}], P), p1 = iso([${SLIDER.x1}, ${FACE_Y}, ${SLIDER.z}], P);
    const pt = svg.createSVGPoint(); pt.x = event.clientX; pt.y = event.clientY;
    const v = pt.matrixTransform(svg.getScreenCTM().inverse());
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
    settings.persist = Math.round(clamp(((v.x - p0[0]) * dx + (v.y - p0[1]) * dy) / (dx * dx + dy * dy), 0, 1) * 20) / 20;
    changed();
  }
  if (part.dataset.tip === "head" || part.dataset.tip === "person") { takeOver(); settings.playing = !settings.playing; changed(); }
});

// ── Tooltip ──
const tipBox = stage.querySelector("[data-tip-box]");
const tipLines = ["name", "what", "stat", "act"].map((key) => tipBox.querySelector("[data-tip-" + key + "]"));
const pctOf = (v) => Math.round(v * 100) + "%";
const TIPS = {
  person: () => ["The person", "Everything that was persisted and retained: one cured layer per day that counted.", shown + " of " + N + " layers · " + pctOf(shown / N) + " complete", "Click to pause or run"],
  head: () => ["Print head · iteration", "Every day it lays one fresh layer: that day's data. Its lamp decides whether the layer is cured.", "day " + model.day + " · " + (lamp > 0.2 ? "curing" : today ? (today.cured ? "laying" : "laying, no cure today") : "waiting"), "Click to pause or run"],
  persist: () => ["Persistence", "How many days' layers are cured and kept. A layer that isn't cured stays liquid and runs off.", pctOf(settings.persist) + " of days persisted", "Click along the scale to set it"],
  retain: () => ["Retention · the bed's hold", "Whether the bed keeps the print. Without it, every " + WINDOW + " days the print is washed off, cured or not.", settings.retain ? "holding · nothing is washed off" : "released · " + (WINDOW - (model.day % WINDOW)) + " days to the next wash", "Click to flip the lever"],
  counter: () => ["Day counter", "Iterations so far: one layer is laid each day, whether or not it is kept.", model.day + " days · " + model.kept + " layers kept", ""],
  waste: () => ["Waste canister", "Everything laid but not persisted or retained. It holds exactly one person's worth of resin.", model.lost + " layers lost · " + pctOf(model.wasted / PERSON) + " of a person poured away", ""],
  bed: () => ["Build plate", "The person can only grow on what is already there: each layer needs the one below it.", shown ? shown + " layers standing on it" : "empty", ""],
  spool: () => ["Spool · incoming data", "Fresh material arrives every day whatever happens to it. Only persisted material becomes the person.", model.day + " layers' worth fed so far", ""],
  frame: () => ["Frame and gantry", "The beam climbs one layer height for each layer kept. It never climbs for a layer that ran off.", "beam at layer " + shown, ""],
  body: () => ["Printer", "Same machine and same input every day; persistence and retention decide what is left.", settings.speed + "× speed · " + (settings.playing ? "running" : "paused"), ""],
  bench: () => ["Bench", "A person built from days: " + N + " layers make one.", "full person: " + N + " cured days in a row", ""],
};
let tipOn = null, tipText = "", tipTimer = 0;
function tipFill() {
  const lines = tipOn && TIPS[tipOn] ? TIPS[tipOn]() : null;
  const text = lines ? lines.join("|") : "";
  if (text === tipText) return !!lines;
  tipText = text;
  if (lines) lines.forEach((line, i) => (tipLines[i].textContent = line));
  return !!lines;
}
function tipShow(name, clientX, clientY) {
  clearTimeout(tipTimer);
  tipOn = name;
  if (!tipFill()) return tipHide();
  const box = stage.getBoundingClientRect(), w = tipBox.offsetWidth, h = tipBox.offsetHeight;
  let x = clientX - box.left + 14, y = clientY - box.top + 18;
  if (x + w > box.width - 4) x = clientX - box.left - 14 - w;
  if (y + h > box.height - 4) y = clientY - box.top - 14 - h;
  tipBox.style.transform = "translate(" + Math.max(4, x).toFixed(0) + "px," + Math.max(4, y).toFixed(0) + "px)";
  tipBox.setAttribute("data-on", "");
}
function tipHide() { clearTimeout(tipTimer); tipOn = null; tipBox.removeAttribute("data-on"); }
stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  const part = event.target.closest && event.target.closest("[data-tip]");
  if (part) tipShow(part.dataset.tip, event.clientX, event.clientY); else tipHide();
});
stage.addEventListener("pointerleave", tipHide);
stage.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "touch") return;
  const part = event.target.closest && event.target.closest("[data-tip]");
  if (part) { tipShow(part.dataset.tip, event.clientX, event.clientY); tipTimer = setTimeout(tipHide, 2600); }
});
stage.addEventListener("blur", tipHide);

if (touring) applyPreset(PRESETS[0]); else sync();
if (still.matches) settleStill(40); else draw();
window.__figure = { model: () => ({ ...model, shown }), set: (p) => { takeOver(); Object.assign(settings, p); changed(); }, reset: () => { reset(); changed(); }, run: (seconds) => { for (let s = 0; s < seconds; s += 1 / 60) advance(1 / 60); draw(); } };
`;

const CSS = `<style>
.iso-stage{position:relative;touch-action:pan-y;-webkit-tap-highlight-color:transparent}
.iso-stage [data-tip="retain"],.iso-stage [data-tip="persist"],.iso-stage [data-tip="head"],.iso-stage [data-tip="person"]{cursor:pointer}
.iso-stage [data-live]{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.pp-drip{fill:var(--anatomy-mid);stroke:var(--anatomy-paper);stroke-width:.4}
.pp-tip{position:absolute;left:0;top:0;z-index:2;width:max-content;max-width:min(244px,70%);padding:8px 10px 9px;pointer-events:none;font-family:var(--anatomy-mono);font-size:10.5px;line-height:1.45;letter-spacing:.02em;color:var(--anatomy-text);background:var(--anatomy-card);box-shadow:0 0 0 1px var(--anatomy-mid),0 6px 18px -8px #0006;opacity:0;transition:opacity .14s ease-out}
.pp-tip[data-on]{opacity:1}
.pp-tip b{display:block;margin-bottom:3px;color:var(--anatomy-strong);font-weight:500;font-size:10px;letter-spacing:.1em;text-transform:uppercase}
.pp-tip [data-tip-what],.pp-tip [data-tip-stat],.pp-tip [data-tip-act]{display:block}
.pp-tip [data-tip-stat]{margin-top:5px;color:var(--anatomy-strong);font-variant-numeric:tabular-nums}
.pp-tip [data-tip-act]{margin-top:5px;padding-top:5px;border-top:1px solid var(--anatomy-faint);color:var(--anatomy-muted)}
.pp-tip :empty{display:none}
.pp-desk{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-top:12px;font-family:var(--anatomy-mono);font-size:11px;letter-spacing:.04em}
.pp-desk label{display:flex;align-items:center;gap:8px;color:var(--anatomy-muted);text-transform:uppercase;letter-spacing:.1em}
.pp-desk input[type=range]{width:150px;accent-color:var(--anatomy-hi)}
.pp-desk output{min-width:3.4em;color:var(--anatomy-strong);font-variant-numeric:tabular-nums}
.pp-desk button{font:inherit;color:var(--anatomy-text);background:var(--anatomy-card);border:1px solid var(--anatomy-lo);border-radius:0;padding:5px 10px;cursor:pointer;transition:border-color .15s}
.pp-desk button:hover{border-color:var(--anatomy-hi)}
.pp-desk button:focus-visible,.pp-desk input:focus-visible{outline:1px solid var(--anatomy-hi);outline-offset:2px}
.pp-desk .pp-push{margin-left:auto}
@media (max-width:520px){.iso-plate{overflow:hidden}.iso-stage svg{width:112%;margin:0 -6%}.pp-desk .pp-push{margin-left:0}}
@media (prefers-reduced-motion:reduce){.pp-tip{transition:none}}
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
body.iso[data-theme="dark"] .cy-grid{stroke:#0e4a62;opacity:.55}
body.iso[data-theme="dark"] .iso-face-text{fill:#6ff6ff}
body.iso[data-theme="dark"] .iso-legend{color:#4f8ea3}
body.iso[data-theme="dark"] .pp-tip{background:#050b17f2;box-shadow:0 0 0 1px #1fa3c2aa,0 0 16px -4px #00d9ff55;color:#7fb8c8}
body.iso[data-theme="dark"] .pp-tip b{color:#9ff9ff;text-shadow:0 0 6px #00d9ff66}
body.iso[data-theme="dark"] .pp-tip [data-tip-stat]{color:#6ff6ff}
body.iso[data-theme="dark"] .pp-tip [data-tip-act]{border-top-color:#0c3448;color:#3d9bb3}
body.iso[data-theme="dark"] .pp-desk button{border-color:#14606f;box-shadow:inset 0 0 12px #00e5ff0a}
body.iso[data-theme="dark"] .pp-desk button:hover{border-color:#21d8ee;box-shadow:0 0 8px #00e5ff33,inset 0 0 12px #00e5ff14}
body.iso[data-theme="dark"] .pp-drip{fill:#6ff6ff}
</style>` : "");

const full = M.daysToFinish(1, true), sixty = M.daysToFinish(0.6, true);
const desk = `<div class="pp-desk" role="group" aria-label="Printer controls">
<label>Persistence <input type="range" min="0" max="100" step="5" value="100" data-persist aria-label="Persistence: share of days whose layer is cured"><output data-persist-out>100%</output></label>
<button type="button" data-retain aria-pressed="true">Retention: hold</button>
<button type="button" data-play aria-pressed="true" class="pp-push">Pause</button>
<button type="button" data-speed>1×</button>
<button type="button" data-reset>Reset</button>
</div>`;
const body = k.plateHtml({
  fig: "Fig 2",
  title: "Persisted, retained, iterated",
  hint: "Point to inspect · click the lever or slider",
  readout: "day 0 · person 0% · 0 lost",
  keys: [
    { mark: "lit", label: "The layer the cure lamp is setting today: data being persisted" },
    { mark: "raised", label: `The person: ${M.N} cured layers, one per day that was persisted and retained` },
    { mark: "flat", label: "Wet resin: a day's data that was laid but not persisted; it drains to the canister" },
    { mark: "edge", label: `The canister's sight glass: how much of one person has been poured away` },
  ],
  caption: `A system that stands for a person grows only from what it keeps. Iteration: every day the head lays one fresh layer, the day's data, whatever happens to it next. Persistence: the cure lamp sets that layer, and only a set layer can carry the next one; a layer that isn't set stays liquid, runs down the side and drains into the canister, so the day happened but the person gained nothing from it. Retention: the bed must keep holding the print; with the lever released, the print is washed off every ${M.WINDOW} days and every cured layer goes to the canister too. With every day persisted and retained the person is complete in ${full} days; at 3 days in 5 it takes ${sixty}; without retention, or at 0 %, it never is, however many days run. Keys: ←/→ persistence, R retention, Space pause, 0 reset.`,
  body: CSS + `<div class="iso-stage" tabindex="0" role="group" aria-roledescription="interactive figure" aria-label="Person printer. Left and right arrows set persistence, R toggles retention, Space pauses, 0 resets.">${svg}<span data-live aria-live="polite"></span><div class="pp-tip" data-tip-box aria-hidden="true"><b data-tip-name></b><span data-tip-what></span><span data-tip-stat></span><span data-tip-act></span></div></div>` + desk,
});

const name = theme === "light" ? "person-printer-light.html" : "person-printer.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Person printer", theme, body, script: kitScript() + live, width: 720 }));
console.log("wrote", name, `${(svg.length / 1024).toFixed(0)} KB svg`);
