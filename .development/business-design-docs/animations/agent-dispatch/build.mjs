import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/avarile/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/home/avarile/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Themes: the cyber data-space look by default, the kit's plain dark (--classic) and light (--light).
const theme = process.argv.includes("--light") ? "light" : process.argv.includes("--classic") ? "dark" : "cyber";
const CYBER = theme === "cyber";

const WIDTH = 640;
const HEIGHT = 470;

// ── World plan (units ≈ px, z up). Lanes run along y: agents far (-y), human near (+y).
const BASE = { x: -104, y: -158, w: 208, d: 332, r: 9 };
const BASE_H = 12;
const FOOT_H = 5;
const LANE_X = [-60, 0, 60];
const WIRE_DX = 5; // out wire at x - 5, back wire at x + 5
const WIRE_Z = 97.4; // underside of the wire
const WIRE_T = 1.2;
const WHEEL_R = 2.2;
const WHEEL_Z = WIRE_Z + WIRE_T + WHEEL_R;
const CARD = { d: 34, h: 30, top: 84 };
const CARD_Z = CARD.top - CARD.h;
const POST_A = M.STOPS.agent - 36; // agent post centre (y)
const POST_H = 86; // human post centre (y)
const BAR_Z = 96; // crossbar underside
const WIRE_Y0 = POST_A + 3;
const SPRING = [74, POST_H - 3];
const CAB = { y: POST_A - 58, d: 42, h: 28, w: 36 };
const DESK = { x: -96, y: 100, w: 192, d: 66, r: 3 };
const DESK_H = 16;
const PARK = 44; // the pen's height when the arm is down out of the way
const ARM_END = M.STOPS.agent + 16;
const ROW_Z = (row) => 15.4 - row * 1.8; // comment rows on a card, from its bottom
const BRIEF_Z = [22.6, 21, 19.4];
const LINE_Y0 = 14.6; // lines start at the card's left edge on screen (high y) and run toward -y
const TRAY = { y: 119, d: 40 };
const TRAY_SLOT = [-3, 1]; // where new cards stand in a tray, relative to the lane
const TRAY_Y = TRAY.y + TRAY.d / 2;
const TRAY_FLOOR = DESK_H + 1.6;

const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - FOOT_H, 0), [-69, POST_A, 112], [69, POST_A, 112], [-69, POST_H, 112], [69, POST_H, 112]],
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
// A line on a face that points +x (cards, cabinet fronts): it reads left to right toward -y.
const onFaceX = (x, y0, y1, z) => k.segment([x, y0, z], [x, y1, z], P);
const onFaceY = (y, x0, x1, z) => k.segment([x0, y, z], [x1, y, z], P);
const halo = (plan, z, h, blur = 3) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(${blur}px)"/>`;

// ── Base ────────────────────────────────────────────────────────────────────
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(slab(BASE, -BASE_H, BASE_H, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "faint" }));
  if (CYBER) out.push(grid());
  const screws = k.corners(BASE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // A ruler down the near edge, one major tick per 25 units of lane.
  const strip = { x: 89, y: WIRE_Y0, w: 6.5, d: POST_H - 3 - WIRE_Y0, r: 1 };
  out.push(S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 3, strip.y + strip.d - 3, 5, 5, strip.x + 0.1, 0.6, [2, 3.8], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 4.6, strip.y + 1.5, 0.6]), at([strip.x + 4.6, strip.y + strip.d - 1.5, 0.6])], { size: 0.45 }));
  // The lane grooves: one per wire pair, under the wires.
  for (const x of LANE_X) out.push(L(k.planOutline({ x: x - 9, y: WIRE_Y0 + 8, w: 18, d: SPRING[0] - WIRE_Y0 - 16, r: 2 }, 0, P, 4), { tone: CYBER ? "mid" : "faint", className: CYBER ? "dx-lane" : undefined }));
  // Label plate at the near corner.
  const lp = { x: -92, y: BASE.y + 6, w: 46, d: 12, r: 1.6 };
  out.push(S(slab(lp, 0, 0.8, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.4), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([lp.x + 4, lp.y + 7.6], 0.8, P, "x"), "dispatch/", { size: 3.6, tone: "lo" }));
  out.push(D([at([lp.x + 2.4, lp.y + 6, 0.8]), at([lp.x + lp.w - 2.4, lp.y + 6, 0.8])], { size: 0.4 }));
  return out.join("");
}

// ── Agent member: a robot on a charging dock. The LED display on its chest
// echoes each comment line as the pen writes it, and the bar under the log
// fills with the work item's progress. Its antenna beacon lights while it works.
const BOT = { feet: 6, hip: 20, chest: 24, neck: 44, head: 46, crown: 56 }; // heights of each stage, from the floor
const TORSO = { dx: -7, w: 14, d: 26, h: 20, r: 3 };
const WIN = { u0: 3, u1: 23, v0: 3, v1: 13, r: 1, depth: 0.8 }; // the chest window, in face coordinates
const LED = { cols: 10, rows: 4, pitch: 1.8, u: 4.9, v: 4.4, dv: 1.6, r: 0.55, barV: 10.5, barH: 1.2, max: 25 };
const botY = () => CAB.y + CAB.d / 2;
// A point on a +x face: u runs toward -y from its near end, v down from its top, d into it.
const planeAt = (fx, y0, z0) => ({ at: (u, v, d = 0) => [fx - d, y0 - u, z0 - v], plane: (d = 0) => k.sideMatrix([fx - d, y0], z0, P, "x") });
const chestOf = (cx) => planeAt(cx + TORSO.dx + TORSO.w, botY() + TORSO.d / 2, BOT.chest + TORSO.h);
const roundedFlat = ({ u0, u1, v0, v1, r }) => k.pathOf(k.roundedPlan({ x: u0, y: v0, w: u1 - u0, d: v1 - v0, r }, 5), true);
let clips = 0;
// A window in a face: clipped to its opening, inner walls shaded by facing, the glass and what it shows at the back.
function ledWindow(face, back, win = WIN) {
  const id = `dx-win-${clips++}`;
  const ring = k.roundedPlan({ x: win.u0, y: win.v0, w: win.u1 - win.u0, d: win.v1 - win.v0, r: win.r }, 5);
  const [, vy] = k.towardViewer(P);
  const { cosA } = k.cameraOf(P);
  const cu = (win.u0 + win.u1) / 2, cv = (win.v0 + win.v1) / 2;
  const tops = [], sides = [[], [], [], []];
  ring.forEach(([au, av], i) => {
    const [bu, bv] = ring[(i + 1) % ring.length];
    const len = Math.hypot(bu - au, bv - av) || 1;
    let [nu, nv] = [(bv - av) / len, -(bu - au) / len];
    if (nu * (cu - (au + bu) / 2) + nv * (cv - (av + bv) / 2) < 0) [nu, nv] = [-nu, -nv];
    // Inward normal in the world: u runs toward -y, v runs down.
    const [ny, nz] = [-nu, -nv];
    if (ny * vy + nz * 0.8 <= 1e-6 && !(nz > 0)) return;
    const quad = k.pathOf([face.at(au, av), face.at(bu, bv), face.at(bu, bv, win.depth), face.at(au, av, win.depth)].map(at), true);
    if (nz >= Math.abs(ny)) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((ny * cosA + 1) / 2) * 4)))].push(quad);
  });
  const shape = roundedFlat(win);
  return [
    `<clipPath id="${id}"><path transform="${face.plane()}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${face.plane(win.depth)}"><path class="dx-glass" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    `</g>`,
    `<g transform="${face.plane()}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}
// The chest display: a dot matrix log over a progress bar, both lit live.
function chestDisplay(cx, index) {
  const off = [], on = [];
  for (let r = 0; r < LED.rows; r++)
    for (let c = 0; c < LED.cols; c++) {
      const [u, v] = [(LED.u + c * LED.pitch).toFixed(2), (LED.v + r * LED.dv).toFixed(2)];
      off.push(`<circle cx="${u}" cy="${v}" r="${LED.r}"/>`);
      on.push(`<circle cx="${u}" cy="${v}" r="${LED.r}" opacity="0"/>`);
    }
  const segment = (c) => `x="${(LED.u - 0.65 + c * LED.pitch).toFixed(2)}" y="${LED.barV}" width="1.3" height="${LED.barH}" rx="0.25"`;
  const cols = Array.from({ length: LED.cols }, (_, c) => c);
  const back = [
    `<g class="dx-led-off">${off.join("")}${cols.map((c) => `<rect ${segment(c)}/>`).join("")}</g>`,
    `<g class="dx-led-on" data-log="${index}">${on.join("")}</g>`,
    `<g class="dx-led-bar" data-bar="${index}">${cols.map((c) => `<rect ${segment(c)} opacity="0"/>`).join("")}</g>`,
  ].join("");
  const face = chestOf(cx);
  // Under the window: a power LED that lights while the agent works, and three status dots.
  return ledWindow(face, back) +
    `<g transform="${face.plane()}"><circle class="dx-led-off" cx="4.4" cy="15.4" r="0.55"/><circle class="dx-led-bar" data-power="${index}" cx="4.4" cy="15.4" r="0.55" opacity="0"/></g>` +
    D([18.2, 19.9, 21.6].map((u) => at(face.at(u, 15.4))), { size: 0.34, tone: "lo" });
}
// A leg on its boot: shin, knee and thigh up to the hip.
function leg(cx, y) {
  const out = [S(slab({ x: cx - 5, y: y - 3.6, w: 11, d: 7.2, r: 2.4 }, BOT.feet, 2.6, 4, 0.5), { tone: "mid" })];
  out.push(S(slab({ x: cx - 4, y: y - 2.8, w: 6, d: 5.6, r: 1.6 }, BOT.feet + 2.6, 1.4, 3, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(cx - 1, y, 2.1, BOT.feet + 4, 5, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(cx - 1, y, 2.9, BOT.feet + 9, 2.4, P, 28, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(cx - 1, y, 2.5, BOT.feet + 11.4, BOT.hip - BOT.feet - 11.4, P, 26), { tone: "mid", crease: "none" }));
  out.push(D([at([cx + 1.9, y, BOT.feet + 10.2])], { size: 0.38 }));
  return out.join("");
}
// An arm hanging from a shoulder block: upper arm, elbow, forearm and a two-finger gripper.
function botArm(cx, y) {
  const out = [];
  out.push(S(slab({ x: cx - 2.6, y: y - 1.6, w: 5.2, d: 3.2, r: 0.8 }, BOT.chest - 3, 2.2, 3, 0.3), { tone: "mid" }));
  for (const dx of [-1.6, 1.6]) out.push(S(slab({ x: cx + dx - 0.6, y: y - 1.2, w: 1.2, d: 2.4, r: 0.4 }, BOT.chest - 6, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(cx, y, 1.6, BOT.chest - 0.8, 6.4, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(cx, y, 2.3, BOT.chest + 5.6, 2.2, P, 24, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(cx, y, 1.8, BOT.chest + 7.8, 6.2, P, 22), { tone: "mid", crease: "none" }));
  const shoulder = { x: cx - 3.4, y: y - 2.2, w: 6.8, d: 4.4, r: 1.4 };
  out.push(S(slab(shoulder, BOT.chest + 14, 5.4, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(shoulder, BOT.chest + 16.6, P, 4), { tone: "faint" }) }));
  out.push(D([at([cx + 3.4, y, BOT.chest + 18])], { size: 0.38 }));
  return out.join("");
}
const BOT_DX = -7; // the robot stands toward the dock's far side, so its chest shows between the cards and the posts in front
function robot(lx, index) {
  const cy = botY(), cx = lx + BOT_DX;
  const dock = { x: lx - CAB.w / 2, y: CAB.y, w: CAB.w, d: CAB.d, r: 2.4 };
  const out = [halo(dock, 0, BOT.feet)];
  // Dock: a plinth with a charging plate under each boot and the agent's name plate.
  out.push(S(slab(dock, 0, BOT.feet, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(dock, 2, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(dock, 3), BOT.feet, P, 6), { tone: "faint" }));
  out.push(D(k.corners(dock, 2.6).map(([x, y]) => at([x, y, BOT.feet])), { size: 0.45 }));
  const fx = dock.x + dock.w;
  const plate = { x: fx, y: cy - 2, w: 0.5, d: 16, r: 0.6 };
  out.push(S(slab(plate, 1.2, 3.6, 3), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.sideMatrix([fx + 0.5, plate.y + plate.d - 2], 3.9, P, "x"), M.LANES[index].agent, { size: 2.9, tone: "mid" }));
  out.push(L(onFaceX(fx + 0.5, plate.y + 7, plate.y + 1.6, 3.4), { tone: "lo", free: true }));
  out.push(L(onFaceX(fx + 0.5, plate.y + 7, plate.y + 3.2, 2.4), { tone: "lo", free: true }));
  out.push(D([at([fx, cy - 12, 3]), at([fx, cy - 9.6, 3])], { size: 0.45, tone: "lo" }));
  for (const y of [cy - 8, cy + 8]) out.push(L(k.planOutline({ x: cx - 7, y: y - 5, w: 15, d: 10, r: 1.6 }, BOT.feet, P, 4), { tone: "lo" }));
  // Far side first: the far leg and arm, the backpack, then the body, then the near leg and arm.
  out.push(leg(cx, cy - 8));
  out.push(botArm(cx, cy - TORSO.d / 2 - 2.2));
  const pack = { x: cx + TORSO.dx - 3.6, y: cy - 9, w: 3.6, d: 18, r: 1.2 };
  out.push(S(slab(pack, BOT.chest + 4, 13, 4, 0.4), { tone: "lo" }));
  for (let i = 0; i < 4; i++) out.push(S(slab({ x: pack.x + 0.8, y: pack.y + 3 + i * 3.4, w: 2, d: 1, r: 0.5 }, BOT.chest + 17, 0.25, 3), { tone: "lo", crease: "none" }));
  out.push(leg(cx, cy + 8));
  const hip = { x: cx - 6, y: cy - 11, w: 12, d: 22, r: 2.4 };
  out.push(S(slab(hip, BOT.hip, BOT.chest - BOT.hip, 4, 0.5), { tone: "mid" }));
  out.push(D([at([hip.x + hip.w, cy - 7, BOT.hip + 2]), at([hip.x + hip.w, cy + 7, BOT.hip + 2])], { size: 0.38 }));
  const torso = { x: cx + TORSO.dx, y: cy - TORSO.d / 2, w: TORSO.w, d: TORSO.d, r: TORSO.r };
  out.push(S(slab(torso, BOT.chest, TORSO.h, 6, 1), { tone: "mid", inner: L(k.sideSeam(torso, BOT.chest + 2.6, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(torso, 1.8), BOT.neck, P, 6), { tone: "faint" }));
  out.push(chestDisplay(cx, index));
  // Neck and head: a visor with two eyes, a grille, ear pods and the antenna with its beacon.
  out.push(S(k.cylinder(cx, cy, 3.4, BOT.neck, 0.8, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 2, BOT.neck + 0.8, BOT.head - BOT.neck - 0.8, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: cx - 1.8, y: cy - 8, w: 3.6, d: 1.2, r: 0.5 }, BOT.head + 3, 4, 2), { tone: "lo", crease: "none" }));
  const head = { x: cx - 6, y: cy - 7, w: 12, d: 14, r: 3 };
  out.push(S(slab(head, BOT.head, BOT.crown - BOT.head, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(head, BOT.head + 2, P, 6), { tone: "faint" }) }));
  const visor = planeAt(head.x + head.w, cy + 5.4, BOT.crown - 2.4);
  out.push(ledWindow(visor, `<rect class="dx-led-on" x="2.2" y="1.5" width="2.4" height="1.3" rx="0.6"/><rect class="dx-led-on" x="6.2" y="1.5" width="2.4" height="1.3" rx="0.6"/>`, { u0: 0, u1: 10.8, v0: 0, v1: 4.2, r: 1.4, depth: 0.6 }));
  out.push(D([3.4, 5.4, 7.4].map((u) => at(visor.at(u, 6.4))), { size: 0.36, tone: "lo" }));
  out.push(S(slab({ x: cx - 1.8, y: cy + 7, w: 3.6, d: 1.2, r: 0.5 }, BOT.head + 3, 4, 2), { tone: "mid", crease: "none" }));
  const [ax, ay] = lampAt(cx);
  out.push(S(k.cylinder(ax, ay, 1.6, BOT.crown, 0.8, P, 18), { tone: "mid" }));
  out.push(S(k.cylinder(ax, ay, 0.45, BOT.crown + 0.8, STALK, P, 10), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(ax, ay, 1.3, BOT.crown + 0.8 + STALK, 1.8, P, 18), { tone: "mid" }));
  out.push(`<g data-lamp="${index}" opacity="0">${S(k.cylinder(ax, ay, 1.3, BOT.crown + 0.8 + STALK, 1.8, P, 18), { tone: "lit", lit: true })}</g>`);
  out.push(botArm(cx, cy + TORSO.d / 2 + 2.2));
  return out.join("");
}
const lampAt = (cx) => [cx - 2.6, botY() - 3];
const STALK = 9; // tall enough that the beacon clears the crossbar in front of the far robots

// ── Posts, crossbars and the overhead switch rails ──────────────────────────
function postSvg(cx, yc) {
  const plan = { x: cx - 3, y: yc - 3, w: 6, d: 6, r: 1 };
  const out = [S(slab({ x: cx - 6, y: yc - 6, w: 12, d: 12, r: 1.6 }, 0, 3, 3, 0.5), { tone: "mid" })];
  out.push(D(k.corners({ x: cx - 6, y: yc - 6, w: 12, d: 12 }, 2).map(([x, y]) => at([x, y, 3])), { size: 0.4 }));
  out.push(S(slab(plan, 3, BAR_Z - 3, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, 30, P, 3), { tone: "faint" }) }));
  const bar = { x: cx - 10, y: yc - 3, w: 20, d: 6, r: 1 };
  out.push(S(slab(bar, BAR_Z, 4, 3, 0.4), { tone: "mid" }));
  out.push(D([at([cx - 7.5, yc, BAR_Z + 4]), at([cx + 7.5, yc, BAR_Z + 4])], { size: 0.45 }));
  return out.join("");
}
// The switch rail: a bracket off the crossbar to a short rail across both wires,
// which carries a carrier from one wire to the other.
function switchRail(cx, yc, stop) {
  const out = [];
  out.push(S(slab({ x: cx - 1.5, y: yc - 1.5, w: 3, d: 3, r: 0.6 }, BAR_Z + 4, 6, 2), { tone: "mid", crease: "none" }));
  const y0 = Math.min(yc, stop) - 1.5, y1 = Math.max(yc, stop) + 1.5;
  out.push(S(slab({ x: cx - 1.5, y: y0, w: 3, d: y1 - y0, r: 0.6 }, BAR_Z + 10, 2.2, 3, 0.3), { tone: "mid" }));
  out.push(S(slab({ x: cx - 1.2, y: stop - 1.2, w: 2.4, d: 2.4, r: 0.4 }, WHEEL_Z + WHEEL_R + 2.6, BAR_Z + 10 - WHEEL_Z - WHEEL_R - 2.6, 2), { tone: "mid", crease: "none" }));
  const rail = { x: cx - WIRE_DX - 3, y: stop - 1.4, w: WIRE_DX * 2 + 6, d: 2.8, r: 0.8 };
  out.push(S(slab(rail, WHEEL_Z + WHEEL_R + 0.6, 2, 3, 0.3), { tone: "mid" }));
  out.push(D([at([cx - WIRE_DX - 1.6, stop, WHEEL_Z + WHEEL_R + 2.6]), at([cx + WIRE_DX + 1.6, stop, WHEEL_Z + WHEEL_R + 2.6])], { size: 0.4 }));
  return out.join("");
}

// The floor of the data space: a ruled grid inside its own frame, with a few
// nodes that pulse. Every rule runs frame edge to frame edge.
const GRID = { x: -96, y: BASE.y + 22, w: 192, d: DESK.y - 4 - BASE.y - 22, r: 0 };
function grid() {
  const out = [L(k.planOutline(GRID, 0, P, 1), { tone: "lo" })];
  const minor = [], major = [];
  for (let x = GRID.x + 12, i = 1; x < GRID.x + GRID.w - 1; x += 12, i++) (i % 4 ? minor : major).push(k.lineOnTop([x, GRID.y], [x, GRID.y + GRID.d], 0, P));
  for (let y = GRID.y + 12, i = 1; y < GRID.y + GRID.d - 1; y += 12, i++) (i % 4 ? minor : major).push(k.lineOnTop([GRID.x, y], [GRID.x + GRID.w, y], 0, P));
  out.push(L(minor.join(""), { tone: "faint" }), L(major.join(""), { tone: "lo" }));
  const nodes = [];
  for (let x = GRID.x + 48; x < GRID.x + GRID.w; x += 48) for (let y = GRID.y + 48; y < GRID.y + GRID.d; y += 48) nodes.push(at([x, y, 0]));
  out.push(D(nodes, { size: 0.9, tone: "hi", pulse: true }));
  return out.join("");
}

function wireSvg(x, toward = "agent") {
  const wire = { x: x - WIRE_T / 2, y: WIRE_Y0, w: WIRE_T, d: SPRING[0] - WIRE_Y0, r: 0.5 };
  const out = [S(slab(wire, WIRE_Z, WIRE_T, 2), { tone: "mid", crease: "none" })];
  // Packets: the data streaming along the wire, out toward the agent or back to the human.
  if (CYBER) {
    const ends = [[x, SPRING[0], WIRE_Z + WIRE_T], [x, WIRE_Y0, WIRE_Z + WIRE_T]];
    if (toward !== "agent") ends.reverse();
    out.push(L(k.segment(ends[0], ends[1], P), { tone: toward === "agent" ? "hi" : "lit", flow: true, className: "dx-packet" }));
  }
  return out.join("");
}
function springSvg(x, side) {
  const c = k.coil(SPRING[0], SPRING[1], [x, WIRE_Z + WIRE_T / 2], 1.3, 5, "y", P);
  return side === "back" ? L(c.back, { tone: "lo" }) : L(c.front, { tone: "mid" });
}

// The pull cord the human uses to send a carrier: from the crossbar's far end.
function cord(cx) {
  const x = cx - 9, y = POST_H;
  const out = [S(slab({ x: x - 0.9, y: y - 0.9, w: 1.8, d: 1.8, r: 0.4 }, BAR_Z - 2.6, 2.6, 2), { tone: "mid", crease: "none" })];
  out.push(L(k.segment([x, y, BAR_Z - 2.6], [x, y, 46], P), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 1.1, 44, 2, P, 14), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 1.8, 34, 10, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 1.8, 34, 44, 14, P), { tone: "lo" }));
  return out.join("");
}

// ── Carrier and card, built at the origin and moved with translateAlong ─────
function wheel(y) {
  const d = k.sideRing([0, y, WHEEL_Z], WHEEL_R, "x", P, 24);
  return `<g class="iso-solid"><path class="iso-fill" d="${d}"/><path class="iso-line iso-edge" data-tone="mid" d="${d}"/></g>${L(k.sideRing([0, y, WHEEL_Z], WHEEL_R * 0.55, "x", P, 16), { tone: "faint" })}`;
}
function carrier() {
  const out = [wheel(-5), wheel(5)];
  const body = { x: -1.6, y: -8, w: 3.2, d: 16, r: 1 };
  out.push(S(slab(body, CARD.top, 3, 3, 0.3), { tone: "mid" }));
  const plate = { x: WIRE_T / 2 + 0.2, y: -7.4, w: 0.8, d: 14.8, r: 1.2 };
  out.push(S(slab(plate, CARD.top + 3, WHEEL_Z - CARD.top - 3, 3), { tone: "mid", crease: "none", inner: L(onFaceX(plate.x + 0.8, plate.y, plate.y + plate.d, CARD.top + 7), { tone: "faint" }) }));
  out.push(D([at([plate.x + 0.8, -5, WHEEL_Z]), at([plate.x + 0.8, 5, WHEEL_Z])], { size: 0.55, tone: "mid" }));
  out.push(D([at([1.6, -5.4, CARD.top + 1.5]), at([1.6, 5.4, CARD.top + 1.5])], { size: 0.4 }));
  return out.join("");
}

const FACE = 0.4;
const Y_HI = CARD.d / 2;
function cardSvg({ old = false } = {}) {
  const plan = { x: -0.4, y: -CARD.d / 2, w: 0.8, d: CARD.d, r: 0.3 };
  const lines = [];
  const z = (h) => CARD_Z + h;
  lines.push(L(onFaceX(FACE, -Y_HI, Y_HI, z(24.6)), { tone: "faint" }));
  lines.push(L(onFaceX(FACE, -Y_HI, Y_HI, z(17.6)), { tone: "faint" }));
  if (old) {
    for (const [h, len] of [[26.6, 7], [22.6, 22], [21, 16], [19.4, 19], [15.4, 21], [13.6, 14], [11.8, 18]]) lines.push(L(onFaceX(FACE, LINE_Y0, LINE_Y0 - len, z(h)), { tone: "faint", free: true }));
    lines.push(L(k.sideRing([FACE, -11, z(ROW_Z(6))], 2.6, "x", P, 20), { tone: "lo" }));
    return S(slab(plan, CARD_Z, CARD.h, 2), { tone: "mid", crease: "lo", inner: lines.join("") });
  }
  // A blank card: the page fills in the id, how far each line is written, which row is a note, and the flag beside it.
  lines.push(k.faceTextSvg(k.sideMatrix([FACE, LINE_Y0], z(26.6), P, "x"), "PM-0", { size: 3, tone: "mid" }));
  BRIEF_Z.forEach((_, i) => lines.push(`<path class="iso-line" data-tone="mid" data-free="" data-brief="${i}" d=""/>`));
  for (let i = 0; i < M.ROWS; i++) lines.push(`<path class="iso-line" data-tone="lit" data-free="" data-row="${i}" d=""/>`);
  lines.push(`<g data-flag opacity="0">${S(slab({ x: FACE, y: LINE_Y0 + 0.6, w: 0.2, d: 1.4, r: 0.3 }, z(ROW_Z(0)) - 0.7, 1.4, 2), { tone: "mid", crease: "none" })}</g>`);
  lines.push(`<g data-stamp opacity="0">${L(k.sideRing([FACE, -11, z(ROW_Z(6))], 2.6, "x", P, 20), { tone: "mid" })}${L(onFaceX(FACE, -9.4, -12.6, z(ROW_Z(6))), { tone: "mid" })}</g>`);
  return S(slab(plan, CARD_Z, CARD.h, 2), { tone: "hi", crease: "lo", inner: lines.join("") });
}

// ── The pen arm: a sleeve on the agent's post, an arm reaching along the card,
// and a carriage whose stylus writes each comment line onto the card's face.
function arm(cx) {
  const out = [];
  const sleeve = { x: cx - 4.6, y: POST_A - 4.6, w: 9.2, d: 9.2, r: 1.4 };
  out.push(S(slab(sleeve, PARK - 3, 7.4, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(sleeve, PARK + 0.6, P, 3), { tone: "faint" }) }));
  out.push(D([at([cx + 4.6, POST_A - 2.4, PARK + 2.6]), at([cx + 4.6, POST_A + 2.4, PARK + 2.6])], { size: 0.4 }));
  const bar = { x: cx - 2.8, y: POST_A + 4.6, w: 1.6, d: ARM_END - POST_A - 4.6, r: 0.6 };
  out.push(S(slab(bar, PARK + 1.6, 1.6, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: cx - 3.2, y: ARM_END - 1.6, w: 2.4, d: 1.6, r: 0.5 }, PARK + 0.8, 3.2, 2), { tone: "mid", crease: "none" }));
  return out.join("");
}
function penCarriage(cx) {
  const block = { x: cx - 3.6, y: -2.4, w: 3.2, d: 4.8, r: 0.8 };
  const out = [S(slab(block, PARK - 0.8, 4.2, 3, 0.3), { tone: "mid" })];
  out.push(S(slab({ x: cx - WIRE_DX + FACE, y: -0.4, w: 1.2, d: 0.8, r: 0.3 }, PARK - 0.4, 0.8, 2), { tone: "hi", crease: "none" }));
  out.push(D([at([cx - 2, 0, PARK + 3.4])], { size: 0.4 }));
  return out.join("");
}

// ── Desk: the human's station ───────────────────────────────────────────────
function desk() {
  const out = [halo(DESK, 0, DESK_H)];
  out.push(S(slab(DESK, 0, DESK_H, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(DESK, 2.4, P, 6), { tone: "faint" }) }));
  const fy = DESK.y + DESK.d;
  for (const cx of LANE_X) {
    const drawer = { x: cx - 18, y: fy, w: 36, d: 0.6, r: 0.8 };
    out.push(S(slab(drawer, 5, 8, 3), { tone: "mid", crease: "none" }));
    out.push(S(slab({ x: cx - 5, y: fy + 0.6, w: 10, d: 1.4, r: 0.6 }, 8.2, 1.8, 3), { tone: "mid", crease: "none" }));
  }
  // Name plate between the near drawers.
  const np = { x: 18.5, y: fy, w: 23, d: 0.5, r: 0.5 };
  out.push(S(slab(np, 6.4, 5.6, 3), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.sideMatrix([np.x + 2.2, fy + 0.5], 10.4, P, "left"), "lead", { size: 3.2, tone: "mid" }));
  out.push(L(onFaceY(fy + 0.5, np.x + 12, np.x + 20.5, 9.6), { tone: "lo", free: true }));
  out.push(L(onFaceY(fy + 0.5, np.x + 12, np.x + 18, 8), { tone: "lo", free: true }));
  out.push(L(k.planOutline(k.insetPlan(DESK, 4), DESK_H, P, 6), { tone: "faint" }));
  return out.join("");
}
function trayBack(cx) {
  const x0 = cx - 14, x1 = cx + 10;
  const out = [];
  out.push(S(slab({ x: x0, y: TRAY.y, w: x1 - x0, d: TRAY.d, r: 1.6 }, DESK_H, 1.6, 3), { tone: "mid" }));
  out.push(S(slab({ x: x0, y: TRAY.y, w: 2, d: TRAY.d, r: 0.8 }, TRAY_FLOOR, 10, 3, 0.3), { tone: "mid" }));
  out.push(S(slab({ x: x0 + 2, y: TRAY.y, w: x1 - x0 - 4, d: 1.6, r: 0.5 }, TRAY_FLOOR, 10, 2, 0.3), { tone: "mid" }));
  // Two items filed earlier.
  for (const dx of [-10, -7]) out.push(`<g transform="${k.translateAlong(P, [cx + dx, TRAY_Y, TRAY_FLOOR - CARD_Z])}">${cardSvg({ old: true })}</g>`);
  return out.join("");
}
function trayFront(cx) {
  const x0 = cx - 14, x1 = cx + 10;
  const side = { x: x0 + 2, y: TRAY.y + TRAY.d - 1.6, w: x1 - x0 - 4, d: 1.6, r: 0.5 };
  const out = [S(slab(side, TRAY_FLOOR, 10, 2, 0.3), { tone: "mid" })];
  const front = { x: x1 - 2, y: TRAY.y, w: 2, d: TRAY.d, r: 0.8 };
  out.push(S(slab(front, TRAY_FLOOR, 10, 3, 0.3), { tone: "mid" }));
  const label = { x: x1, y: TRAY_Y - 7, w: 0.5, d: 14, r: 0.4 };
  out.push(S(slab(label, TRAY_FLOOR + 3, 5, 2), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.sideMatrix([x1 + 0.5, TRAY_Y + 5.2], TRAY_FLOOR + 6.6, P, "x"), "done", { size: 2.8, tone: "mid" }));
  out.push(D([at([x1, TRAY_Y - 10, TRAY_FLOOR + 8.6]), at([x1, TRAY_Y + 10, TRAY_FLOOR + 8.6])], { size: 0.4 }));
  return out.join("");
}
// A desk bell: it rings when a carrier comes home with a report.
function bell(cx, index) {
  const [x, y] = [cx + 17, 106];
  const out = [S(k.cylinder(x, y, 4.6, DESK_H, 1.4, P, 32, 0.3), { tone: "mid" })];
  out.push(S(k.cylinder(x, y, 0.9, DESK_H + 1.4, 1.4, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 3.8, DESK_H + 2.8, 1.6, P, 32, 0.4), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 2.6, DESK_H + 4.4, 1.2, P, 28, 0.4), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 0.7, DESK_H + 5.6, 1.4, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 1.3, DESK_H + 7, 0.8, P, 16), { tone: "mid" }));
  out.push(`<g data-bell="${index}" opacity="0">${L(k.ring(x, y, 5.6, DESK_H + 3.6, P, 40), { tone: "lit" })}${L(k.ring(x, y, 7.4, DESK_H + 3.6, P, 40), { tone: "lo" })}</g>`);
  return out.join("");
}
// The rubber stamp and its pad: the human's approval.
function stamp(cx) {
  const [x, y] = [cx + 22, 142];
  const pad = { x: x - 6, y: y - 9, w: 12, d: 18, r: 1.6 };
  const out = [S(slab(pad, DESK_H, 2.2, 4, 0.4), { tone: "mid" })];
  out.push(S(slab(k.insetPlan(pad, 1.6), DESK_H + 2.2, 0.2, 4), { tone: "lo", crease: "none" }));
  const foot = { x: x - 3, y: y + 12, w: 6, d: 8, r: 1 };
  out.push(S(slab(foot, DESK_H, 2.6, 3, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y + 16, 1.2, DESK_H + 2.6, 3.4, P, 14), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y + 16, 2.2, DESK_H + 6, 3.2, P, 22, 0.6), { tone: "mid" }));
  return out.join("");
}

// ── Assemble: lanes far to near, then the desk, then cards in flight ────────
function lane(index) {
  const cx = LANE_X[index];
  const out = [robot(cx, index), postSvg(cx, POST_A)];
  out.push(springSvg(cx - WIRE_DX, "back"), wireSvg(cx - WIRE_DX), springSvg(cx - WIRE_DX, "front"));
  out.push(`<g data-slot="out-${index}"></g>`);
  out.push(postSvg(cx, POST_H), cord(cx).replace(/^/, `<g data-cord="${index}">`) + "</g>");
  out.push(`<g data-arm="${index}">${arm(cx)}<g data-pen="${index}">${penCarriage(cx)}</g></g>`);
  out.push(springSvg(cx + WIRE_DX, "back"), wireSvg(cx + WIRE_DX, "human"), springSvg(cx + WIRE_DX, "front"));
  out.push(`<g data-slot="back-${index}"></g>`);
  out.push(switchRail(cx, POST_A, M.STOPS.agent), switchRail(cx, POST_H, M.STOPS.human));
  return out.join("");
}

// Click targets over the parts the reader works with: a robot or its pull cord
// assigns that robot a new item, a stamp approves the card waiting in its lane,
// and the waiting card itself takes a note and goes back out.
function hullOf(points) {
  const pts = points.map(at).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => { const out = []; for (const p of list) { while (out.length > 1 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop(); out.push(p); } out.pop(); return out; };
  return k.pathOf([...half(pts), ...half([...pts].reverse())], true);
}
const hitBox = (plan, z0, z1) => hullOf(k.boxCorners(plan, z0, z1));
function hits() {
  const out = [];
  LANE_X.forEach((cx, i) => {
    const who = M.LANES[i].agent;
    const bx = cx + BOT_DX, cy = botY();
    out.push(`<path class="dx-hit" data-hit="send" data-lane="${i}" d="${hitBox({ x: bx - 11, y: cy - 17.5, w: 19, d: 35 }, 0, BOT.crown + 2)}"><title>Assign a work item to ${who}</title></path>`);
    out.push(`<path class="dx-hit" data-hit="send" data-lane="${i}" d="${hitBox({ x: cx - 12, y: POST_H - 3, w: 6, d: 6 }, 30, BAR_Z - 2)}"><title>Pull the cord: send a work item to ${who}</title></path>`);
    out.push(`<path class="dx-hit" data-hit="note" data-lane="${i}" d="${hitBox({ x: cx + WIRE_DX - 1, y: M.STOPS.human - CARD.d / 2, w: 2, d: CARD.d }, CARD_Z, CARD.top)}"><title>Write a note on ${who}'s returned card and send it back</title></path>`);
    out.push(`<path class="dx-hit" data-hit="approve" data-lane="${i}" d="${hitBox({ x: cx + 15, y: 131, w: 14, d: 31 }, DESK_H, DESK_H + 10)}"><title>Stamp ${who}'s returned card: approve it to Done</title></path>`);
  });
  return `<g class="dx-hits">${out.join("")}</g>`;
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A cash-carrier wire railway on a bench, and you are the human at its desk. At the near end is the desk, with a bell, a stamp and a done tray for each of three lanes. Each lane has two wires running to an agent robot at the far end, whose chest display logs each comment as it is written and fills a progress bar: work items go out on the far wire and come back on the near one. Click a robot or pull its cord to write a work item and send it; a busy robot's next item waits one card back. When a card comes home the bell rings; stamp it into the done tray, or click the card to write a note and send it back out.",
  body: [
    base(),
    ...LANE_X.map((_, i) => lane(i)),
    desk(),
    ...LANE_X.map((cx, i) => `${trayBack(cx)}<g data-slot="tray-${i}"></g>${trayFront(cx)}${bell(cx, i)}${stamp(cx)}`),
    `<g data-slot="carried"></g>`,
    `<template data-item><g data-carrier>${carrier()}</g><g data-card>${cardSvg()}</g></template>`,
    hits(),
  ],
});

// ── Live ────────────────────────────────────────────────────────────────────
const C = { LANE_X, WIRE_DX, CARD_Z, LINE_Y0, ROWS: Array.from({ length: M.ROWS }, (_, i) => ROW_Z(i)), BRIEF_Z, FACE, PARK, POST_A, TRAY_Y, TRAY_FLOOR, TRAY_SLOT, LED };
const live = `
const P = ${JSON.stringify(P)};
const STOPS = ${JSON.stringify(M.STOPS)};
const LANES = ${JSON.stringify(M.LANES)};
const C = ${JSON.stringify(C)};
const createBoard = ${M.createBoard.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const q = (sel) => svg.querySelector(sel);
const readout = document.querySelector("[data-readout]");
const desk = document.querySelector(".dx-desk");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (u) => u * u * (3 - 2 * u);
const board = createBoard({ stops: STOPS, lanes: LANES, rows: C.ROWS.length });
const template = q("template[data-item]");
const els = new Map();
function elsOf(v) {
  let e = els.get(v.id);
  if (e) return e;
  const box = document.createElementNS("http://www.w3.org/2000/svg", "g");
  box.innerHTML = template.innerHTML;
  const carrier = box.querySelector("[data-carrier]"), card = box.querySelector("[data-card]");
  card.querySelector(".iso-face-text").textContent = v.id;
  e = { carrier, card, brief: [...card.querySelectorAll("[data-brief]")], rows: [...card.querySelectorAll("[data-row]")], stamp: card.querySelector("[data-stamp]"), flag: card.querySelector("[data-flag]") };
  els.set(v.id, e);
  return e;
}
const lanes = LANES.map((_, i) => ({ arm: q('[data-arm="' + i + '"]'), pen: q('[data-pen="' + i + '"]'), lamp: q('[data-lamp="' + i + '"]'), log: [...q('[data-log="' + i + '"]').children], bar: [...q('[data-bar="' + i + '"]').children], power: q('[data-power="' + i + '"]'), bell: q('[data-bell="' + i + '"]'), cord: q('[data-cord="' + i + '"]'), out: q('[data-slot="out-' + i + '"]'), back: q('[data-slot="back-' + i + '"]'), tray: q('[data-slot="tray-' + i + '"]') }));
const carried = q('[data-slot="carried"]');
const memo = new Map();
const setAttr = (el, name, value) => { let m = memo.get(el); if (!m) memo.set(el, (m = {})); if (m[name] !== value) { m[name] = value; el.setAttribute(name, value); } };
const line = (y0, len, h, u) => (u <= 0 ? "" : segment([C.FACE, y0, C.CARD_Z + h], [C.FACE, y0 - len * u, C.CARD_Z + h], P));
function place(el, slot) { if (el.parentNode !== slot) slot.appendChild(el); }

function draw() {
  const t = board.now, views = board.view();
  const pens = LANES.map(() => null);
  const seen = new Set();
  views.forEach((v) => {
    const e = elsOf(v), L = lanes[v.lane], cx = C.LANE_X[v.lane];
    seen.add(v.id);
    const wx = cx + v.wire * C.WIRE_DX;
    const wireSlot = v.wire < 0 ? L.out : L.back;
    place(e.carrier, wireSlot);
    setAttr(e.carrier, "transform", translateAlong(P, [wx, v.y, 0]));
    setAttr(e.carrier, "opacity", v.carrier.toFixed(3));
    // The card: on its carrier, lifted off toward the tray, or standing in it.
    let pos = [wx, v.y, 0], slot = wireSlot, alpha = v.shown;
    if (v.phase === "approve" || v.done) {
      const u = v.lift;
      const tx = cx + C.TRAY_SLOT[v.slot], ty = C.TRAY_Y, tz = C.TRAY_FLOOR - C.CARD_Z;
      const a = clamp01(u / 0.25), b = clamp01((u - 0.2) / 0.5), c = clamp01((u - 0.65) / 0.35);
      pos = [wx + (tx - wx) * ease(b), v.y + (ty - v.y) * ease(b), 8 * ease(a) + (tz - 8) * ease(c)];
      slot = u >= 1 || C.CARD_Z + pos[2] < C.TRAY_FLOOR + 12 ? L.tray : carried;
      if (u > 0.02 && slot !== L.tray) slot = carried;
      alpha = 1 - v.fade;
    }
    place(e.card, slot);
    if (slot === wireSlot && e.card.previousSibling !== e.carrier) e.carrier.after(e.card);
    // In the tray the near place (slot 1) is drawn over the far one.
    if (slot === L.tray && v.slot === 0 && L.tray.firstChild !== e.card) L.tray.insertBefore(e.card, L.tray.firstChild);
    setAttr(e.card, "transform", translateAlong(P, pos));
    setAttr(e.card, "opacity", alpha.toFixed(3));
    v.briefLens.forEach((len, j) => setAttr(e.brief[j], "d", line(C.LINE_Y0, len, C.BRIEF_Z[j], clamp01(v.brief * 3 - j))));
    e.rows.forEach((el, j) => {
      const len = v.rowLens[j];
      setAttr(el, "d", len === undefined ? "" : line(C.LINE_Y0, len, C.ROWS[j], j === v.note ? v.noteU : v.rows[j]));
      setAttr(el, "data-tone", j === v.note ? "mid" : "lit");
    });
    if (v.note !== undefined) setAttr(e.flag, "transform", translateAlong(P, [0, 0, C.ROWS[v.note] - C.ROWS[0]]));
    setAttr(e.flag, "opacity", v.note === undefined ? "0" : clamp01(v.noteU * 4).toFixed(2));
    setAttr(e.stamp, "opacity", v.stamp.toFixed(3));
    if (v.work && (!pens[v.lane] || v.work.at > pens[v.lane].v.work.at)) pens[v.lane] = { v };
  });
  for (const [id, e] of els) if (!seen.has(id)) { e.carrier.remove(); e.card.remove(); els.delete(id); memo.delete(e.carrier); memo.delete(e.card); }
  // Robots: the arm rides to the row being written, the pen draws along it, the chest logs it.
  LANES.forEach((_, li) => {
    const L = lanes[li], p = pens[li];
    let z = C.PARK, y = STOPS.agent + C.LINE_Y0, lamp = 0, turn = 0;
    if (p) {
      const { v } = p, w = v.work;
      const rowZ = (row) => C.CARD_Z + C.ROWS[row];
      const from = w.prev < 0 ? C.PARK : rowZ(w.prev), to = rowZ(w.row), len = v.rowLens[w.row];
      const prevLen = w.prev < 0 ? 0 : v.rowLens[w.prev];
      const written = clamp01((w.v - 0.15) / 0.7);
      if (w.end) {
        // Work done: the pen lifts back to the line start and the arm drops out of the way.
        const m = ease(clamp01(w.since / 0.4));
        z = to + (C.PARK - to) * m; y = STOPS.agent + C.LINE_Y0 - len * (1 - m);
        lamp = 1 - clamp01(w.since / 0.3);
        turn = 1 - ease(clamp01((w.since - 0.4) / 0.8));
      } else {
        if (w.v < 0.15) { const m = ease(w.v / 0.15); z = from + (to - from) * m; y = STOPS.agent + C.LINE_Y0 - prevLen * (1 - m); }
        else { z = to; y = STOPS.agent + C.LINE_Y0 - len * written; }
        lamp = clamp01(w.into / 0.3);
        turn = (w.k + written) / w.of;
      }
    }
    setAttr(L.arm, "transform", translateAlong(P, [0, 0, z - C.PARK]));
    setAttr(L.pen, "transform", translateAlong(P, [0, y, 0]));
    setAttr(L.lamp, "opacity", lamp.toFixed(2));
    // The chest display: each comment line the pen writes is echoed on the LED log as it is written,
    // scrolling up once the log is full; the bar under it is the item's progress.
    let log = [], cursor = null, blink = false;
    if (p && !(p.v.work.end && p.v.work.since > 1.2)) {
      const { v } = p, w = v.work;
      log = w.list.slice(0, w.k + 1).map((row) => Math.round((C.LED.cols * v.rowLens[row] / C.LED.max) * v.rows[row])).slice(-C.LED.rows);
      if (!w.end) { cursor = [log.length - 1, log[log.length - 1]]; blink = Math.floor(t * 3) % 2 === 0; }
    } else { cursor = [0, 0]; blink = Math.floor(t) % 2 === 0; }
    L.log.forEach((el, j) => {
      const r = Math.floor(j / C.LED.cols), c = j % C.LED.cols;
      const on = c < (log[r] || 0) || (blink && cursor && cursor[0] === r && cursor[1] === c);
      setAttr(el, "opacity", on ? "1" : "0");
    });
    const lit = Math.round(turn * C.LED.cols);
    L.bar.forEach((el, c) => setAttr(el, "opacity", c < lit ? "1" : "0"));
    setAttr(L.power, "opacity", lamp.toFixed(2));
    // Bell: the last carrier home on this lane. Cord: pulled as a carrier leaves the desk.
    let ring = 0, pull = 0;
    views.forEach((v) => { if (v.lane !== li) return; if (v.bell >= 0 && t >= v.bell) ring = Math.max(ring, Math.exp(-(t - v.bell) / 0.5) * clamp01((t - v.bell) / 0.05)); pull = Math.max(pull, v.pull); });
    setAttr(L.bell, "opacity", ring.toFixed(2));
    setAttr(L.cord, "transform", translateAlong(P, [0, 0, -5 * pull]));
  });
  setReadout(views);
  setDesk();
}

let lastText = "";
function setReadout(views) {
  const busy = views.filter((v) => v.phase === "work" && !v.work.end).length;
  const waiting = views.filter((v) => v.phase === "wait" || v.phase === "hold").length;
  const text = "human " + board.humanDoing() + " · " + busy + " busy · " + (waiting ? waiting + " waiting · " : "") + board.done + " done";
  if (text !== lastText) { readout.textContent = text; lastText = text; }
}

// ── The reader at the desk ──────────────────────────────────────────────────
const inboxEl = desk.querySelector("[data-inbox]"), approveEl = desk.querySelector("[data-approve]"), noteEl = desk.querySelector("[data-note]"), autoEl = desk.querySelector("[data-auto]");
const sendEls = [...desk.querySelectorAll("[data-send]")];
const hitEls = [...svg.querySelectorAll(".dx-hit")];
let auto = !still.matches, autoHeld = false, resume = 0, lastDesk = "";
function setDesk() {
  const first = board.inbox()[0];
  const state = [auto, first ? first.id : "", board.canNote(first), ...LANES.map((_, i) => board.canSend(i)), ...LANES.map((_, i) => !!board.waiting(i) + ":" + board.canNote(board.waiting(i)))].join("|");
  if (state === lastDesk) return;
  lastDesk = state;
  inboxEl.textContent = first ? "Inbox · " + first.id + " from " + LANES[first.lane].agent : "Inbox · empty";
  approveEl.disabled = !first;
  noteEl.disabled = !board.canNote(first);
  sendEls.forEach((el, i) => (el.disabled = !board.canSend(i)));
  autoEl.setAttribute("aria-pressed", String(auto));
  hitEls.forEach((el) => {
    const lane = +el.dataset.lane, kind = el.dataset.hit, w = board.waiting(lane);
    const ok = kind === "send" ? board.canSend(lane) : kind === "approve" ? !!w : board.canNote(w);
    el.toggleAttribute("data-off", !ok);
  });
}
// Acting takes over from the autopilot; it comes back after 20 s of quiet unless switched off.
function takeOver() {
  if (auto) auto = false;
  clearTimeout(resume);
  if (!autoHeld && !still.matches) resume = setTimeout(() => { auto = true; setDesk(); }, 20000);
}
function act(kind, lane) {
  takeOver();
  const item = lane === undefined ? board.inbox()[0] : board.waiting(lane);
  if (kind === "send") board.send(lane);
  if (kind === "approve") board.approve(item);
  if (kind === "note") board.note(item);
  settle();
}
sendEls.forEach((el) => el.addEventListener("click", () => act("send", +el.dataset.send)));
approveEl.addEventListener("click", () => act("approve"));
noteEl.addEventListener("click", () => act("note"));
autoEl.addEventListener("click", () => { auto = !auto; autoHeld = !auto; clearTimeout(resume); setDesk(); run(); });
hitEls.forEach((el) => el.addEventListener("click", () => { if (!el.hasAttribute("data-off")) act(el.dataset.hit, +el.dataset.lane); }));
stage.addEventListener("keydown", (event) => {
  const n = "123".indexOf(event.key);
  if (n >= 0) act("send", n);
  else if (event.key === "a" || event.key === "A") act("approve");
  else if (event.key === "n" || event.key === "N") act("note");
  else return;
  event.preventDefault();
});

// ── Clock ───────────────────────────────────────────────────────────────────
const DT = 1 / 60;
function advance(seconds) { for (let s = 0; s < seconds - 1e-9; s += DT) { if (auto) board.autopilot(); board.step(DT); } }
// Something is still moving, or the human still has work to do.
const busy = () => board.task || board.tasks.length || board.items.some((i) => !["wait", "done", "hold"].includes(i.phase) || (i.phase === "done" && board.now - i.doneAt < 1) || i.archivedAt >= 0);
// Reduced motion: no animation; each action jumps to where the board comes to rest.
function settle() { if (still.matches) { let n = 0; while (busy() && n++ < 60 * 90) board.step(DT); draw(); } else run(); }
let visible = false, frame = 0, last = 0;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : DT;
  last = now;
  advance(dt);
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
// Open on a busy board: a quarter of a minute of the autopilot at the desk.
const wasAuto = auto;
auto = true; advance(14); auto = wasAuto;
window.__figure = { board, run: (seconds) => { advance(seconds); draw(); }, act, auto: (on) => { auto = on; autoHeld = !on; setDesk(); } };
draw();
`;

const deskPanel = `<div class="dx-desk" role="group" aria-label="Your desk">
<div class="dx-row"><span class="dx-label">Assign</span>${M.LANES.map((lane, i) => `<button type="button" data-send="${i}" aria-keyshortcuts="${i + 1}">${lane.agent} · ${lane.role}</button>`).join("")}</div>
<div class="dx-row"><span class="dx-label" data-inbox aria-live="polite">Inbox · empty</span><button type="button" data-approve aria-keyshortcuts="A" disabled>Approve</button><button type="button" data-note aria-keyshortcuts="N" disabled>Note &amp; send back</button><button type="button" data-auto aria-pressed="true" class="dx-auto">Autopilot</button></div>
</div>`;
const body = k.plateHtml({
  fig: "Fig 1",
  title: "Agent dispatch railway",
  hint: "Click a robot to assign work",
  readout: "human free · 0 busy · 0 done",
  keys: [
    { mark: "lit", label: "Comment lines the agent writes onto a work item, and the bell when it comes home" },
    { mark: "raised", label: "Cards: one work item each, on its own carrier. Far wire out to the agent, near wire back" },
    { mark: "edge", label: "Mid-tone lines: your brief and notes; the ring: your approval" },
  ],
  caption:
    "You are the human at a project board that trades work with three agent members, and nobody waits on anybody. Click a robot (or pull its cord, or press 1–3) to write a work item and send it down that agent's lane. A robot takes it when it is free; a second item waits one card back. It works through the item, writing progress onto it as comments, then stops and sends it back for approval. The board holds returned cards on the near wire until you get to them. Stamp one to approve it to Done (A), or click the card to write a note and send it out again (N). You do one thing at a time, so what you click queues up behind what you are doing. An autopilot plays the human while you watch, and hands the desk back to you the moment you act.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Agent dispatch railway: press 1, 2 or 3 to assign work to A1, A2 or A3; A to approve the next returned card; N to note it and send it back">${svg}</div>`,
}).replace("</div></div><figcaption", `</div></div>${deskPanel}<figcaption`);

// The cyber data space: navy glass, cyan linework, magenta for what the agents send back.
const CYBER_CSS = `
.iso[data-theme="cyber"]{
  --anatomy-page:#03050b;--anatomy-card:#050912;--anatomy-text:#7fe9f2;--anatomy-strong:#d8fdff;--anatomy-muted:#3f8f9c;
  --anatomy-paper:#050912;--anatomy-face:#0c1a2b;--anatomy-top:#0f2236;
  --anatomy-shade-0:#050b14;--anatomy-shade-1:#07101c;--anatomy-shade-2:#0a1524;--anatomy-shade-3:#0d1b2d;
  --anatomy-lit-top:#2a0f2c;--anatomy-lit-shade:#1c0a20;
  --anatomy-hi:#8af7ff;--anatomy-mid:#21b4c8;--anatomy-lo:#14606f;--anatomy-faint:#0c3542;--anatomy-lit:#ff4fd8;
  --anatomy-halo:#00d5ff;--anatomy-halo-opacity:.16;--anatomy-dot:#8af7ff;
  --anatomy-weight:.7px;
}
.iso[data-theme="cyber"] body,body.iso[data-theme="cyber"]{background:radial-gradient(ellipse 90% 60% at 50% 0%,#0a1830 0%,#03050b 60%) fixed}
.iso[data-theme="cyber"] .iso-plate{background:radial-gradient(ellipse 75% 65% at 50% 52%,#0a1a2e 0%,#050912 62%,#03060c 100%);box-shadow:0 0 0 1px #1a6c7c,0 0 0 4px #03050b,0 0 0 5px #0d3a46,0 0 40px #00e5ff14,inset 0 0 60px #00e5ff0d;overflow:hidden}
.iso[data-theme="cyber"] .iso-plate::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,#8af7ff07 0 1px,transparent 1px 3px);mix-blend-mode:screen}
.iso[data-theme="cyber"] .iso-plate::before{content:"";position:absolute;inset:10px;pointer-events:none;background:
  linear-gradient(#21b4c8,#21b4c8) 0 0/14px 1px,linear-gradient(#21b4c8,#21b4c8) 0 0/1px 14px,
  linear-gradient(#21b4c8,#21b4c8) 100% 0/14px 1px,linear-gradient(#21b4c8,#21b4c8) 100% 0/1px 14px,
  linear-gradient(#21b4c8,#21b4c8) 0 100%/14px 1px,linear-gradient(#21b4c8,#21b4c8) 0 100%/1px 14px,
  linear-gradient(#21b4c8,#21b4c8) 100% 100%/14px 1px,linear-gradient(#21b4c8,#21b4c8) 100% 100%/1px 14px;background-repeat:no-repeat}
.iso[data-theme="cyber"] .iso-plate-corner{text-shadow:0 0 6px #21d8ee80}
.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]{color:#ff8be6;text-shadow:0 0 6px #ff4fd899}
.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]::before{content:"> ";color:#21b4c8}
.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]::after{content:"_";animation:dx-caret 1s steps(1) infinite}
@keyframes dx-caret{50%{opacity:0}}
.iso[data-theme="cyber"] .iso-line[data-tone="lit"]{filter:drop-shadow(0 0 1.2px #ff4fd8) drop-shadow(0 0 3px #ff4fd866)}
.iso[data-theme="cyber"] .iso-line.iso-edge[data-tone="hi"]{filter:drop-shadow(0 0 1.4px #00e5ffaa)}
.iso[data-theme="cyber"] .iso-solid[data-lit]>.iso-edge{filter:drop-shadow(0 0 2px #ff4fd8) drop-shadow(0 0 5px #ff4fd880)}
.iso[data-theme="cyber"] .iso-face-text{filter:drop-shadow(0 0 1px #00e5ff99)}
.iso[data-theme="cyber"] .iso-dots[data-tone="hi"] circle{filter:drop-shadow(0 0 1.5px #00e5ff)}
.iso[data-theme="cyber"] .dx-lane{stroke-dasharray:1 2.2;opacity:.8}
.iso[data-theme="cyber"] .dx-packet{stroke-width:1.1px;stroke-dasharray:1.4 10;animation-duration:900ms;filter:drop-shadow(0 0 1.5px currentColor)}
.iso[data-theme="cyber"] .dx-packet[data-tone="hi"]{color:#00e5ff}
.iso[data-theme="cyber"] .dx-packet[data-tone="lit"]{color:#ff4fd8}
.iso[data-theme="cyber"] .iso-halo{filter:blur(14px)}
.iso[data-theme="cyber"] .iso-legend{color:#4f9fab}
.iso[data-theme="cyber"] .iso-caption{color:#5f8f99}
@media (prefers-reduced-motion:reduce){.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]::after{animation:none}}
`;
// The robots' chest displays and visors, the click targets and the desk console, in every theme: dark glass, unlit LEDs faint, the log and eyes hi, the progress bar lit.
const TERMINAL_CSS = `
.dx-glass{fill:var(--anatomy-shade-0)}
.dx-led-off circle,.dx-led-off rect,circle.dx-led-off{fill:var(--anatomy-faint)}
.dx-led-on circle,rect.dx-led-on{fill:var(--anatomy-hi)}
.dx-led-bar rect,circle.dx-led-bar{fill:var(--anatomy-lit)}
.dx-hit{fill:var(--anatomy-hi);fill-opacity:0;stroke:none;cursor:pointer;pointer-events:all;transition:fill-opacity .15s}
.dx-hit:hover{fill-opacity:.07}
.dx-hit[data-off]{cursor:not-allowed}
.dx-hit[data-off]:hover{fill-opacity:0}
.dx-desk{display:grid;gap:8px;margin-top:12px;font-family:var(--anatomy-mono);font-size:11px;letter-spacing:.04em}
.dx-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.dx-label{min-width:8.5em;color:var(--anatomy-muted);text-transform:uppercase;letter-spacing:.1em;font-variant-numeric:tabular-nums}
.dx-desk button{font:inherit;color:var(--anatomy-text);background:var(--anatomy-card);border:1px solid var(--anatomy-lo);border-radius:0;padding:5px 10px;cursor:pointer;transition:border-color .15s,opacity .15s}
.dx-desk button:hover:not(:disabled){border-color:var(--anatomy-hi)}
.dx-desk button:disabled{opacity:.38;cursor:not-allowed}
.dx-desk button:focus-visible{outline:1px solid var(--anatomy-hi);outline-offset:2px}
.dx-desk .dx-auto{margin-left:auto}
@media (max-width:560px){.dx-label{flex-basis:100%;min-width:0}}
.dx-desk .dx-auto::before{content:"";display:inline-block;width:6px;height:6px;margin-right:7px;border:1px solid var(--anatomy-mid);border-radius:50%;vertical-align:1px}
.dx-desk .dx-auto[aria-pressed="true"]::before{background:var(--anatomy-lit);border-color:var(--anatomy-lit)}
.iso[data-theme="cyber"] .dx-desk button{border-color:#14606f;box-shadow:inset 0 0 12px #00e5ff0a}
.iso[data-theme="cyber"] .dx-desk button:hover:not(:disabled){border-color:#21d8ee;box-shadow:0 0 8px #00e5ff33,inset 0 0 12px #00e5ff14}
.iso[data-theme="cyber"] .dx-desk .dx-auto[aria-pressed="true"]::before{box-shadow:0 0 6px #ff4fd8}
.iso[data-theme="cyber"] .dx-glass{fill:#02060c}
.iso[data-theme="cyber"] .dx-led-off circle,.iso[data-theme="cyber"] .dx-led-off rect{fill:#0b2a35}
.iso[data-theme="cyber"] .dx-led-on,.iso[data-theme="cyber"] rect.dx-led-on{filter:drop-shadow(0 0 0.8px #00e5ff) drop-shadow(0 0 2px #00e5ff88)}
.iso[data-theme="cyber"] .dx-led-bar,.iso[data-theme="cyber"] circle.dx-led-bar{filter:drop-shadow(0 0 0.8px #ff4fd8) drop-shadow(0 0 2px #ff4fd888)}
`;
const name = theme === "light" ? "agent-dispatch-light.html" : theme === "dark" ? "agent-dispatch-classic.html" : "agent-dispatch.html";
const page = k.pageHtml({ title: "Agent dispatch railway", theme, body, script: kitScript() + live }).replace("</style>", (CYBER ? CYBER_CSS : "") + TERMINAL_CSS + "</style>");
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
