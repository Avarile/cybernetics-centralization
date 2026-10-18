import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/home/avarile/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/home/avarile/.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "/home/avarile/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Themes: the cyber data-space look by default, the kit's plain dark (--classic) and light (--light).
const theme = process.argv.includes("--light") ? "light" : process.argv.includes("--classic") ? "dark" : "cyber";
const CYBER = theme === "cyber";

const WIDTH = 640;
const HEIGHT = 500;

// ── World plan (units ≈ px, z up). The room's floor is the top of the base; wall A
// stands along y = −140, wall B along x = −140, and the viewer looks in from +x +y.
const { ROOM } = M;
const WALL = { t: 8, h: 88 };
const BASE = { x: ROOM.x - WALL.t, y: ROOM.y - WALL.t, w: ROOM.w + WALL.t, d: ROOM.d + WALL.t, r: 0 };
const BASE_H = 12;
const FOOT_H = 5;
const EDGE = BASE.x + BASE.w; // the floor's open edges, x = EDGE and y = EDGE
const SKIRT = { h: 5, t: 1.4 };

const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - FOOT_H, 0), [BASE.x, BASE.y, WALL.h], [EDGE, BASE.y, WALL.h], [BASE.x, EDGE, WALL.h]],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 45, elevation: 32 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const tip = (kind, index, html) => `<g data-tip="${kind}"${index === undefined ? "" : ` data-i="${index}"`}>${html}</g>`;
const halo = (plan, z, h, blur = 3) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(${blur}px)"/>`;
const hull = (points) => {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (const p of [...pts].reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};
// A clip region for something that rises out of (or is printed up from) a level opening:
// the opening's outline swept straight up (or down) the screen.
const sweep = (plan, z, dir) => k.pathOf(hull([...k.ringOf(plan, 3).map(([x, y]) => at([x, y, z])), ...k.ringOf(plan, 3).map(([x, y]) => at([x, y, z + dir * 400]))]), true);
const shadeOf = (n) => Math.min(3, G.toneOf(n, P));
let clipCount = 0;
const clipId = () => `om-clip-${clipCount++}`;

// ── Station frames. f runs forward from the wall face into the room, l along the
// wall; on both walls larger f and larger l are nearer the viewer.
function frameOf(st) {
  const B = st.wall === "B";
  const w0 = B ? ROOM.x : ROOM.y;
  const pt = (f, l, z = 0) => (B ? [w0 + f, l, z] : [l, w0 + f, z]);
  const plan = (f, l, fw, lw, r = 0) => (B ? { x: w0 + f, y: l, w: fw, d: lw, r } : { x: l, y: w0 + f, w: lw, d: fw, r });
  const left = (l0, l1) => (B ? l1 : l0); // the lateral end of a span that is on the screen's left
  // A front face (normal +f) at f: u runs right along it from lLeft, v runs down from zTop, d goes into it.
  const face = (f, lLeft, zTop) => ({
    at: (u, v, d = 0) => pt(f - d, B ? lLeft - u : lLeft + u, zTop - v),
    plane: (d = 0) => (B ? k.sideMatrix([w0 + f - d, lLeft], zTop, P, "x") : k.sideMatrix([lLeft, w0 + f - d], zTop, P, "left")),
    U: B ? [0, -1, 0] : [1, 0, 0],
    N: B ? [1, 0, 0] : [0, 1, 0],
  });
  const cyl = (f, l, r, z, h, steps = 24, bevel = 0) => k.cylinder(...pt(f, l).slice(0, 2), r, z, h, P, steps, bevel);
  return { B, pt, plan, left, face, cyl, at: (f, l, z) => at(pt(f, l, z)) };
}
const FRAMES = M.STATIONS.map(frameOf);

// A window recessed into a front face: clipped to its opening, with the inner walls
// that face the viewer shaded by facing, the glass and what it shows at the back.
const roundedFlat = ({ u0, u1, v0, v1, r }) => k.pathOf(k.roundedPlan({ x: u0, y: v0, w: u1 - u0, d: v1 - v0, r }, 5), true);
function recessWindow(face, back, win, glass = "om-glass") {
  const id = clipId();
  const ring = k.roundedPlan({ x: win.u0, y: win.v0, w: win.u1 - win.u0, d: win.v1 - win.v0, r: win.r }, 5);
  const V = G.viewOf(P);
  const cu = (win.u0 + win.u1) / 2, cv = (win.v0 + win.v1) / 2;
  const tops = [], sides = [[], [], [], []];
  ring.forEach(([au, av], i) => {
    const [bu, bv] = ring[(i + 1) % ring.length];
    const len = Math.hypot(bu - au, bv - av) || 1;
    let [nu, nv] = [(bv - av) / len, -(bu - au) / len];
    if (nu * (cu - (au + bu) / 2) + nv * (cv - (av + bv) / 2) < 0) [nu, nv] = [-nu, -nv];
    const n = [face.U[0] * nu, face.U[1] * nu, -nv]; // v runs down
    if (G.dot3(n, V) <= 1e-6) return;
    const quad = k.pathOf([face.at(au, av), face.at(bu, bv), face.at(bu, bv, win.depth), face.at(au, av, win.depth)].map(at), true);
    if (n[2] > 0.7) tops.push(quad);
    else sides[shadeOf(n)].push(quad);
  });
  const shape = roundedFlat(win);
  return [
    `<clipPath id="${id}"><path transform="${face.plane()}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${face.plane(win.depth)}"><path class="${glass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    `</g>`,
    `<g transform="${face.plane()}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}
// A rectangular hole in a level face at z, depth deep: its dark floor, then the two
// inner walls that face the viewer (the ones on the far sides), clipped to the opening.
function holeSvg(plan, z, deep) {
  const id = clipId();
  const { x, y, w, d } = plan;
  const open = k.pathOf([[x, y], [x + w, y], [x + w, y + d], [x, y + d]].map(([a, b]) => at([a, b, z])), true);
  const wallX = k.pathOf([[x, y, z], [x, y + d, z], [x, y + d, z - deep], [x, y, z - deep]].map(at), true); // faces +x
  const wallY = k.pathOf([[x, y, z], [x + w, y, z], [x + w, y, z - deep], [x, y, z - deep]].map(at), true); // faces +y
  return `<clipPath id="${id}"><path d="${open}"/></clipPath><g clip-path="url(#${id})"><path class="om-pit" d="${open}"/>` +
    `<path class="iso-shade" data-shade="${shadeOf([1, 0, 0])}" d="${wallX}"/><path class="iso-shade" data-shade="${shadeOf([0, 1, 0])}" d="${wallY}"/>` +
    `${L(k.segment([x, y, z - deep], [x + w, y, z - deep], P) + k.segment([x, y, z - deep], [x, y + d, z - deep], P) + k.segment([x, y, z], [x, y, z - deep], P), { tone: "faint" })}</g>` +
    L(open, { tone: "lo" });
}

// ── Base and floor ──────────────────────────────────────────────────────────
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
  for (const [x, y] of byDepth(k.corners(BASE, 24))) {
    out.push(S(k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  const seam = L(k.sideSeam(BASE, -BASE_H + 4, P, 2), { tone: "faint" });
  out.push(S(slab(BASE, -BASE_H, BASE_H, 2, 1.6), { tone: "lo", inner: seam }));
  // A label plate on the front (+x) face of the base, with its two screws.
  const lp = { y0: -60, y1: -10, z0: -9.4, z1: -3.6 };
  out.push(S(slab({ x: EDGE, y: lp.y0, w: 0.6, d: lp.y1 - lp.y0, r: 0.6 }, lp.z0, lp.z1 - lp.z0, 3), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.sideMatrix([EDGE + 0.6, lp.y1 - 3.2], lp.z1 - 1.3, P, "x"), "one person · five agents", { size: 3.1, tone: "mid" }));
  out.push(D([at([EDGE + 0.6, lp.y1 - 1.4, (lp.z0 + lp.z1) / 2]), at([EDGE + 0.6, lp.y0 + 1.4, (lp.z0 + lp.z1) / 2])], { size: 0.45 }));
  // A ruler down the +y face, one minor tick per 10 units, a major per 50.
  const t = k.sideTicks(ROOM.x + 10, EDGE - 10, 10, 5, EDGE, 0, [1.8, 3.6], P, "x");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return tip("base", undefined, out.join(""));
}

function floor() {
  const out = [];
  // Floor tiles: every rule runs from the skirting to the open edge.
  const step = 36;
  const grid = [], major = [];
  for (let x = ROOM.x + step, i = 1; x < EDGE - 4; x += step, i++) (i % 4 ? grid : major).push(k.lineOnTop([x, ROOM.y + SKIRT.t], [x, EDGE], 0, P));
  for (let y = ROOM.y + step, i = 1; y < EDGE - 4; y += step, i++) (i % 4 ? grid : major).push(k.lineOnTop([ROOM.x + SKIRT.t, y], [EDGE, y], 0, P));
  out.push(L(grid.join(""), { tone: "faint" }), L(major.join(""), { tone: CYBER ? "lo" : "faint" }));
  return out.join("");
}

// ── Walls ───────────────────────────────────────────────────────────────────
const WALL_A = { x: BASE.x, y: BASE.y, w: BASE.w, d: WALL.t, r: 0 };
const WALL_B = { x: BASE.x, y: ROOM.y, w: WALL.t, d: BASE.d - WALL.t, r: 0 };
function walls() {
  const out = [];
  out.push(S(slab(WALL_A, 0, WALL.h, 2, 1), { tone: "lo" }));
  out.push(S(slab(WALL_B, 0, WALL.h, 2, 1), { tone: "lo" }));
  // Panel joints, top of the skirting to the top of the wall.
  const joints = [];
  for (let x = ROOM.x + 48; x < EDGE - 10; x += 48) if (x < DOOR.x0 - 4 || x > DOOR.x1 + 4) joints.push(k.segment([x, ROOM.y, SKIRT.h], [x, ROOM.y, WALL.h], P));
  for (let y = ROOM.y + 48; y < EDGE - 10; y += 48) joints.push(k.segment([ROOM.x, y, SKIRT.h], [ROOM.x, y, WALL.h], P));
  out.push(L(joints.join(""), { tone: "faint" }));
  // Skirting boards.
  out.push(S(slab({ x: ROOM.x, y: ROOM.y, w: DOOR.x0 - 3.2 - ROOM.x, d: SKIRT.t, r: 0 }, 0, SKIRT.h, 2, 0.3), { tone: "lo" }));
  out.push(S(slab({ x: DOOR.x1 + 3.2, y: ROOM.y, w: EDGE - DOOR.x1 - 3.2, d: SKIRT.t, r: 0 }, 0, SKIRT.h, 2, 0.3), { tone: "lo" }));
  out.push(S(slab({ x: ROOM.x, y: ROOM.y + SKIRT.t, w: SKIRT.t, d: EDGE - ROOM.y - SKIRT.t, r: 0 }, 0, SKIRT.h, 2, 0.3), { tone: "lo" }));
  return tip("walls", undefined, out.join(""));
}

// A wall clock on wall A, its face in the wall's plane. The page turns the hands:
// the loop runs one working day, nine to six.
const CLOCK = { x: -116, z: 46, r: 9 };
function clock() {
  const F = G.frameOf([CLOCK.x, ROOM.y, CLOCK.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const out = [S(G.disc(0, 2.2, CLOCK.r, F, P), { tone: "mid", inner: L(G.arcOf(F, 1.1, CLOCK.r, P), { tone: "faint" }) })];
  out.push(S(G.disc(2.2, 2.8, CLOCK.r - 1.2, F, P), { tone: "hi" }));
  const face = k.sideMatrix([CLOCK.x, ROOM.y + 2.8], CLOCK.z, P, "left");
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r0 = CLOCK.r - 1.6, r1 = r0 - (i % 5 ? 0.9 : 2);
    ticks.push(`M${(Math.sin(a) * r0).toFixed(2)} ${(-Math.cos(a) * r0).toFixed(2)}L${(Math.sin(a) * r1).toFixed(2)} ${(-Math.cos(a) * r1).toFixed(2)}`);
  }
  out.push(`<g transform="${face}"><path class="iso-line" data-tone="lo" d="${ticks.filter((_, i) => i % 5).join("")}"/><path class="iso-line" data-tone="mid" d="${ticks.filter((_, i) => !(i % 5)).join("")}"/>` +
    `<path class="iso-line om-hand" data-tone="hi" data-free="end" data-hand="h" d="M0 0L0 -4.2"/><path class="iso-line om-hand" data-tone="hi" data-free="end" data-hand="m" d="M0 0L0 -6.2"/>` +
    `<circle class="om-hub" r="0.7"/></g>`);
  return tip("clock", undefined, out.join(""));
}

// The room's door, on the free stretch of wall A: a frame, a panelled leaf, a handle
// and the light switch beside it.
const DOOR = { x0: 56, x1: 88, h: 62 };
function door() {
  const y = ROOM.y, out = [];
  const leaf = { x: DOOR.x0, y, w: DOOR.x1 - DOOR.x0, d: 0.6, r: 0 };
  out.push(S(slab(leaf, 0, DOOR.h, 2), { tone: "mid", crease: "lo" }));
  const face = k.sideMatrix([DOOR.x0, y + 0.6], DOOR.h, P, "left");
  const W = DOOR.x1 - DOOR.x0;
  out.push(`<g transform="${face}"><path class="iso-line" data-tone="lo" d="${roundedFlat({ u0: 4, u1: W - 4, v0: 5, v1: 27, r: 0.8 })}${roundedFlat({ u0: 4, u1: W - 4, v0: 31, v1: 55, r: 0.8 })}"/>` +
    `<path class="iso-line" data-tone="faint" d="${roundedFlat({ u0: 6, u1: W - 6, v0: 7, v1: 25, r: 0.6 })}${roundedFlat({ u0: 6, u1: W - 6, v0: 33, v1: 53, r: 0.6 })}"/></g>`);
  for (const x of [DOOR.x0 - 3.2, DOOR.x1]) out.push(S(slab({ x, y, w: 3.2, d: 1.6, r: 0.3 }, 0, DOOR.h + 3.2, 2, 0.3), { tone: "mid" }));
  out.push(S(slab({ x: DOOR.x0 - 3.2, y, w: W + 6.4, d: 1.6, r: 0.3 }, DOOR.h, 3.2, 2, 0.3), { tone: "mid" }));
  // Hinges on the left jamb, a handle on the right.
  out.push(D([at([DOOR.x0 + 0.6, y + 0.6, 12]), at([DOOR.x0 + 0.6, y + 0.6, 48])], { size: 0.5, tone: "lo" }));
  const H = G.frameOf([DOOR.x1 - 4, y + 0.6, 30], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(slab({ x: DOOR.x1 - 5.4, y: y + 0.6, w: 2.8, d: 0.6, r: 0.4 }, 27.4, 6, 2), { tone: "mid", crease: "none" }));
  out.push(S(G.disc(1.2, 3.4, 0.7, H, P), { tone: "mid" }), S(G.disc(3.4, 4.6, 1.5, H, P), { tone: "hi" }));
  // The light switch.
  const sw = { x: DOOR.x1 + 7, y, w: 4, d: 0.6, r: 0.5 };
  out.push(S(slab(sw, 33, 6, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: sw.x + 1.4, y: y + 0.6, w: 1.2, d: 0.8, r: 0.3 }, 35, 2.2, 2), { tone: "hi", crease: "none" }));
  return tip("door", undefined, out.join(""));
}

// ── The rail: along wall B, round the corner and along wall A, on brackets.
// Carriers hang from it to move work from one robot to the next.
const RAIL_W = 2.6, RAIL_H = 3.4;
const RAIL_Z = M.RAIL.z;
const railB = ROOM.x + M.RAIL.off, railA = ROOM.y + M.RAIL.off;
function rail() {
  const out = [];
  const brackets = [];
  for (let s = 12; s < M.RAIL_LENGTH - 6; s += 46) brackets.push(M.railPoint(s));
  const bracket = ([x, y]) => {
    const onB = Math.abs(x - railB) < 0.5;
    const plan = onB ? { x: ROOM.x, y: y - 1.4, w: M.RAIL.off - RAIL_W / 2, d: 2.8, r: 0.3 } : { x: x - 1.4, y: ROOM.y, w: 2.8, d: M.RAIL.off - RAIL_W / 2, r: 0.3 };
    const foot = onB ? { x: ROOM.x, y: y - 3.4, w: 0.8, d: 6.8, r: 0.4 } : { x: x - 3.4, y: ROOM.y, w: 6.8, d: 0.8, r: 0.4 };
    return S(slab(foot, RAIL_Z - 1, RAIL_H + 4, 2), { tone: "mid", crease: "none" }) + S(slab(plan, RAIL_Z, RAIL_H, 2), { tone: "mid", crease: "none" });
  };
  brackets.sort((a, b) => depth(...a) - depth(...b)).forEach((p) => out.push(bracket(p)));
  const straightB = { x: railB - RAIL_W / 2, y: railA + M.RAIL.r, w: RAIL_W, d: M.RAIL.start - railA - M.RAIL.r, r: 0 };
  const straightA = { x: railB + M.RAIL.r, y: railA - RAIL_W / 2, w: M.RAIL.start - railB - M.RAIL.r, d: RAIL_W, r: 0 };
  const cx = railB + M.RAIL.r, cy = railA + M.RAIL.r;
  const arc = [];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI / 2; arc.push([cx - Math.cos(a) * (M.RAIL.r + RAIL_W / 2), cy - Math.sin(a) * (M.RAIL.r + RAIL_W / 2)]); }
  for (let i = 12; i >= 0; i--) { const a = (i / 12) * Math.PI / 2; arc.push([cx - Math.cos(a) * (M.RAIL.r - RAIL_W / 2), cy - Math.sin(a) * (M.RAIL.r - RAIL_W / 2)]); }
  out.push(S(k.extrude(arc, RAIL_Z, RAIL_H, P, { convex: false }), { tone: "mid" }));
  out.push(S(slab(straightA, RAIL_Z, RAIL_H, 2, 0.3), { tone: "mid" }));
  out.push(S(slab(straightB, RAIL_Z, RAIL_H, 2, 0.3), { tone: "mid" }));
  // End stops at both open ends.
  out.push(S(slab({ x: railB - 2.2, y: M.RAIL.start - 1, w: 4.4, d: 3, r: 0.6 }, RAIL_Z - 1.4, RAIL_H + 2.8, 2), { tone: "mid" }));
  out.push(S(slab({ x: M.RAIL.start - 1, y: railA - 2.2, w: 3, d: 4.4, r: 0.6 }, RAIL_Z - 1.4, RAIL_H + 2.8, 2), { tone: "mid" }));
  // A drop marker under the rail above each robot.
  M.STATIONS.forEach((_, i) => {
    const [x, y] = M.railPoint(M.railStop(i));
    out.push(`<g data-stop="${i}">${D([at([x, y, RAIL_Z])], { size: 0.7, tone: "lo" })}</g>`);
  });
  return tip("rail", undefined, out.join(""));
}
// A carrier: a trolley hub under the rail, a hanger and a canister with a lit band.
const CAN = { r: 2.4, z0: 60.6, z1: 67 };
function carrierSvg() {
  const out = [S(k.cylinder(0, 0, 2.2, RAIL_Z - 2.6, 2.6, P, 20, 0.3), { tone: "mid" })];
  out.push(S(k.cylinder(0, 0, 0.5, CAN.z1, RAIL_Z - 2.6 - CAN.z1, P, 10), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(0, 0, CAN.r, CAN.z0, CAN.z1 - CAN.z0, P, 22), { tone: "hi", inner: L(k.sideArc(0, 0, CAN.r, CAN.z0 + 1.2, P, 16) + k.sideArc(0, 0, CAN.r, CAN.z1 - 1.2, P, 16), { tone: "lo" }) }));
  out.push(`<g data-band>${L(k.sideArc(0, 0, CAN.r, (CAN.z0 + CAN.z1) / 2, P, 16), { tone: "lit" })}</g>`);
  return out.join("");
}

// ── Floor lines: one per agent, from a port on the pad's rim to the front of its dock.
const PAD = M.PAD;
const PORT_R = PAD.r - 1.6;
const dockPort = (i) => FRAMES[i].pt(DOCK.f + DOCK.fw, M.STATIONS[i].at);
const DOCK = { f: 10, fw: 28, lw: 38 };
function lineEnds(i) {
  const [dx, dy] = dockPort(i);
  const a = Math.atan2(dy - PAD.y, dx - PAD.x);
  return { a, from: [PAD.x + Math.cos(a) * PAD.r, PAD.y + Math.sin(a) * PAD.r], to: [dx, dy] };
}
const LINE_W = 2.4, LINE_H = 0.7;
function floorLines() {
  const out = [];
  M.ROLES.forEach((_, i) => {
    const { a, from, to } = lineEnds(i);
    const [nx, ny] = [-Math.sin(a) * LINE_W / 2, Math.cos(a) * LINE_W / 2];
    const ring = [[from[0] + nx, from[1] + ny], [to[0] + nx, to[1] + ny], [to[0] - nx, to[1] - ny], [from[0] - nx, from[1] - ny]];
    out.push(tip("line", i, S(k.extrude(ring, 0, LINE_H, P), { tone: "lo", crease: "none" }) + L(k.lineOnTop(from, to, LINE_H, P), { tone: CYBER ? "lo" : "faint", className: "om-line" })));
  });
  return out.join("");
}

// ── The person on the scan pad ───────────────────────────────────────────────
const PAD_H = 2.4;
const POSTS = [135, 315].map((deg) => (deg * Math.PI) / 180);
const POST_R = 27, POST_TOP = 72;
const RING = { r0: 14.6, r1: 17.6, h: 1.6, top: 64, bottom: PAD_H + 1 };
const VIEW_A = Math.atan2(...k.towardViewer(P).slice().reverse()); // the floor direction toward the viewer
function padBase() {
  const out = [halo({ x: PAD.x - PAD.r, y: PAD.y - PAD.r, w: PAD.r * 2, d: PAD.r * 2, r: PAD.r }, 0, PAD_H)];
  out.push(S(k.cylinder(PAD.x, PAD.y, PAD.r, 0, PAD_H, P, 72, 0.6), { tone: "mid", inner: L(k.sideArc(PAD.x, PAD.y, PAD.r, 0.9, P, 48), { tone: "faint" }) }));
  out.push(L(k.ring(PAD.x, PAD.y, PAD.r - 3, PAD_H, P, 64), { tone: "faint" }));
  out.push(L(k.ring(PAD.x, PAD.y, 9, PAD_H, P, 48), { tone: "faint" }));
  const t = k.radialTicks(PAD.x, PAD.y, PAD.r - 3, 72, 6, PAD_H, [1, 2], P);
  out.push(L(t.minor, { tone: "faint" }), L(t.major, { tone: "lo" }));
  // A port where each floor line arrives, with its lamp.
  M.ROLES.forEach((_, i) => {
    const { a } = lineEnds(i);
    const [x, y] = [PAD.x + Math.cos(a) * PORT_R, PAD.y + Math.sin(a) * PORT_R];
    out.push(S(k.cylinder(x, y, 1.2, PAD_H, 0.5, P, 14), { tone: "mid" }));
    out.push(`<g data-port="${i}" opacity="0">${S(k.cylinder(x, y, 1.2, PAD_H, 0.5, P, 14), { tone: "lit", lit: true })}</g>`);
  });
  return tip("pad", undefined, out.join(""));
}
const postAt = (a, r = POST_R) => [PAD.x + Math.cos(a) * r, PAD.y + Math.sin(a) * r];
function postSvg(a) {
  const [x, y] = postAt(a);
  const out = [S(k.cylinder(x, y, 3.2, 0, 2.4, P, 24, 0.4), { tone: "mid" })];
  out.push(S(k.cylinder(x, y, 1.6, 2.4, POST_TOP - 2.4, P, 18), { tone: "mid", crease: "none", inner: L(k.sideArc(x, y, 1.6, 20, P, 12) + k.sideArc(x, y, 1.6, 44, P, 12), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 2.4, POST_TOP, 2, P, 20, 0.3), { tone: "mid" }));
  return tip("post", undefined, out.join(""));
}
// The ring's carriage on one post: a block on the post's inner side and an arm to the ring.
function sledSvg(a) {
  const [bx, by] = postAt(a, POST_R - 2.6);
  const out = [S(k.cylinder(bx, by, 1.4, RING.top - 1.2, RING.h + 2.4, P, 16), { tone: "mid" })];
  const [ux, uy] = [Math.cos(a), Math.sin(a)], [nx, ny] = [-uy * 0.8, ux * 0.8];
  const r0 = RING.r1 - 0.4, r1 = POST_R - 3.6;
  const arm = [[PAD.x + ux * r0 + nx, PAD.y + uy * r0 + ny], [PAD.x + ux * r1 + nx, PAD.y + uy * r1 + ny], [PAD.x + ux * r1 - nx, PAD.y + uy * r1 - ny], [PAD.x + ux * r0 - nx, PAD.y + uy * r0 - ny]];
  out.push(S(k.extrude(arm, RING.top + 0.2, 1.2, P), { tone: "mid", crease: "none" }));
  return out.join("");
}
// One half of the scan ring, as an annular sector, plain and lit.
function ringHalf(near) {
  const a0 = VIEW_A + (near ? -Math.PI / 2 : Math.PI / 2);
  const pts = [];
  for (let i = 0; i <= 32; i++) { const a = a0 + (i / 32) * Math.PI; pts.push([PAD.x + Math.cos(a) * RING.r1, PAD.y + Math.sin(a) * RING.r1]); }
  for (let i = 32; i >= 0; i--) { const a = a0 + (i / 32) * Math.PI; pts.push([PAD.x + Math.cos(a) * RING.r0, PAD.y + Math.sin(a) * RING.r0]); }
  const paths = k.extrude(pts, RING.top, RING.h, P, { convex: false });
  return S(paths, { tone: "mid" }) + `<g data-ring-lit opacity="0">${S(paths, { tone: "lit", lit: true })}</g>`;
}

// The person, facing +x, holding a tablet that shows every agent's state.
const PX = PAD.x - 1, PY = PAD.y, Z0 = PAD_H;
const TAB = { x: PX + 5, y: PY - 6, w: 8.4, d: 12, z: Z0 + 26.6 };
function person() {
  const out = [];
  const cyl = (x, y, r, z, h, style, steps = 20, bevel = 0) => S(k.cylinder(x, y, r, z, h, P, steps, bevel), style);
  // Far side first: far shoe, leg and arm, then the body, then the near side.
  const shoe = (y) => S(slab({ x: PX - 3.4, y: y - 2.1, w: 8.6, d: 4.2, r: 1.9 }, Z0, 2.2, 4, 0.4), { tone: "lo" });
  const leg = (y) => cyl(PX, y, 2.15, Z0 + 2.2, 18.6, { tone: "mid", crease: "none", inner: L(k.sideArc(PX, y, 2.15, Z0 + 11, P, 12), { tone: "faint" }) });
  const upperArm = (y) => cyl(PX - 0.4, y, 1.75, Z0 + 26.4, 9.6, { tone: "hi", crease: "none" });
  const forearm = (y) => S(G.disc(0, 6.4, 1.55, G.frameAlong([PX - 0.4, y, Z0 + 27.4], [1, 0, 0]), P), { tone: "hi" });
  const hand = (y) => S(G.sphereOf([PX + 6.4, y, Z0 + 27.4], 1.5, P), { tone: "mid" });
  out.push(shoe(PY - 3.3), leg(PY - 3.3));
  out.push(upperArm(PY - 7.9), forearm(PY - 7.9), hand(PY - 6.6));
  out.push(shoe(PY + 3.3), leg(PY + 3.3));
  out.push(S(slab({ x: PX - 2.8, y: PY - 5.9, w: 5.6, d: 11.8, r: 2.6 }, Z0 + 19.6, 3.2, 5, 0.3), { tone: "mid" }));
  const torso = { x: PX - 3.4, y: PY - 6.6, w: 7, d: 13.2, r: 3.2 };
  out.push(S(slab(torso, Z0 + 22.4, 14.2, 6, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(torso, Z0 + 25, P, 6), { tone: "lo" }) + L(k.segment([PX + 3.6, PY, Z0 + 22.4], [PX + 3.6, PY, Z0 + 36.6], P), { tone: "lo" }) }));
  // The persona badge: the one lit thing every copy carries.
  out.push(`<path class="om-badge" d="${k.sideRing([PX + 3.6, PY - 3, Z0 + 33.2], 1.15, "x", P, 16)}"/>`);
  const yoke = { x: PX - 3, y: PY - 8.6, w: 6.2, d: 17.2, r: 3 };
  out.push(S(slab(yoke, Z0 + 34.6, 3, 6, 0.5), { tone: "hi", crease: "lo" }));
  out.push(cyl(PX + 0.1, PY, 1.8, Z0 + 37.6, 2.4, { tone: "mid", crease: "none" }));
  // Head, hair and two eyes looking at the tablet.
  out.push(S(G.sphereOf([PX + 0.3, PY, Z0 + 44.2], 4.6, P), { tone: "hi" }));
  const hair = G.solidOf([[0, 4.95], [1.6, 4.75, 1], [3, 4, 1], [4.4, 2.4, 1], [5.2, 0]], G.frameOf([PX - 0.4, PY, Z0 + 44.4], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P);
  out.push(S(hair, { tone: "mid" }));
  out.push(D([at([PX + 4.5, PY - 1.7, Z0 + 43.9]), at([PX + 4.5, PY + 1.7, Z0 + 43.9])], { size: 0.45, tone: "lo" }));
  // The tablet in both hands: a slab whose top face shows one row per agent.
  out.push(S(slab(TAB, TAB.z, 0.9, 3, 0.2), { tone: "mid" }));
  const m = k.topMatrix([TAB.x, TAB.y], TAB.z + 0.9, P, "x");
  const rows = M.ROLES.map((_, i) => {
    const y = 1.6 + i * 2.1;
    return `<circle class="om-led-off" cx="1.5" cy="${y}" r="0.45" data-tab-dot="${i}"/><rect class="om-bar-off" x="2.6" y="${y - 0.35}" width="4.6" height="0.7" rx="0.3"/><rect class="om-bar-on" x="2.6" y="${y - 0.35}" width="0" height="0.7" rx="0.3" data-tab-bar="${i}"/>`;
  }).join("");
  out.push(`<g transform="${m}"><rect class="om-glass" x="0.7" y="0.5" width="${TAB.w - 1.4}" height="${TAB.d - 1}" rx="0.6"/>${rows}</g>`);
  out.push(upperArm(PY + 7.9), forearm(PY + 7.9), hand(PY + 6.6));
  return tip("person", undefined, out.join(""));
}

// ── Robots ──────────────────────────────────────────────────────────────────
const BOT = { feet: 3, hip: 17, chest: 21, neck: 41, head: 43, crown: 53 };
const TORSO = { df: -7, fw: 14, lw: 22, h: 20, r: 3 };
const BOT_TOP = BOT.crown + 11;
const LED = { cols: 8, rows: 4, pitch: 1.8, u: 4.3, v: 4.4, dv: 1.6, r: 0.55, barV: 10.5, barH: 1.2 };
const WIN = { u0: 2.6, u1: 19.4, v0: 3, v1: 13, r: 1, depth: 0.8 };
const STALK = 7;
const RF = 24; // robot centre, forward of the wall
function chestDisplay(F, cf, cl, i) {
  const off = [], on = [];
  for (let r = 0; r < LED.rows; r++)
    for (let c = 0; c < LED.cols; c++) {
      const [u, v] = [(LED.u + c * LED.pitch).toFixed(2), (LED.v + r * LED.dv).toFixed(2)];
      off.push(`<circle cx="${u}" cy="${v}" r="${LED.r}"/>`);
      on.push(`<circle cx="${u}" cy="${v}" r="${LED.r}" opacity="0"/>`);
    }
  const seg = (c) => `x="${(LED.u - 0.65 + c * LED.pitch).toFixed(2)}" y="${LED.barV}" width="1.3" height="${LED.barH}" rx="0.25"`;
  const cols = Array.from({ length: LED.cols }, (_, c) => c);
  const back = `<g class="om-led-off">${off.join("")}${cols.map((c) => `<rect ${seg(c)}/>`).join("")}</g><g class="om-led-on" data-log="${i}">${on.join("")}</g><g class="om-led-bar" data-bar="${i}">${cols.map((c) => `<rect ${seg(c)} opacity="0"/>`).join("")}</g>`;
  const face = F.face(cf + TORSO.df + TORSO.fw, F.left(cl - TORSO.lw / 2, cl + TORSO.lw / 2), BOT.chest + TORSO.h);
  return tip("display", i, recessWindow(face, back, WIN) +
    `<g transform="${face.plane()}"><circle class="om-led-off" cx="4.4" cy="15.6" r="0.75"/><circle class="om-badge-dot" data-badge="${i}" cx="4.4" cy="15.6" r="0.75" opacity="0"/></g>` +
    D([14.2, 15.9, 17.6].map((u) => at(face.at(u, 15.6))), { size: 0.34, tone: "lo" }));
}
function leg(F, cf, cl) {
  const out = [S(slab(F.plan(cf - 5, cl - 3.6, 11, 7.2, 2.4), BOT.feet, 2.6, 4, 0.5), { tone: "mid" })];
  out.push(S(slab(F.plan(cf - 4, cl - 2.8, 6, 5.6, 1.6), BOT.feet + 2.6, 1.4, 3, 0.3), { tone: "mid" }));
  out.push(S(F.cyl(cf - 1, cl, 2.1, BOT.feet + 4, 5, 20), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(cf - 1, cl, 2.9, BOT.feet + 9, 2.4, 24, 0.4), { tone: "mid" }));
  out.push(S(F.cyl(cf - 1, cl, 2.5, BOT.feet + 11.4, BOT.hip - BOT.feet - 11.4, 22), { tone: "mid", crease: "none" }));
  out.push(D([F.at(cf + 1.9, cl, BOT.feet + 10.2)], { size: 0.38 }));
  return out.join("");
}
function botArm(F, cf, cl) {
  const out = [S(slab(F.plan(cf - 2.6, cl - 1.6, 5.2, 3.2, 0.8), BOT.chest - 3, 2.2, 3, 0.3), { tone: "mid" })];
  for (const df of [-1.6, 1.6]) out.push(S(slab(F.plan(cf + df - 0.6, cl - 1.2, 1.2, 2.4, 0.4), BOT.chest - 6, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(cf, cl, 1.6, BOT.chest - 0.8, 6.4, 18), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(cf, cl, 2.3, BOT.chest + 5.6, 2.2, 22, 0.3), { tone: "mid" }));
  out.push(S(F.cyl(cf, cl, 1.8, BOT.chest + 7.8, 6.2, 20), { tone: "mid", crease: "none" }));
  const shoulder = F.plan(cf - 3.4, cl - 2.2, 6.8, 4.4, 1.4);
  out.push(S(slab(shoulder, BOT.chest + 14, 5.4, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(shoulder, BOT.chest + 16.6, P, 4), { tone: "faint" }) }));
  out.push(D([F.at(cf + 3.4, cl, BOT.chest + 18)], { size: 0.38 }));
  return out.join("");
}
function robot(i) {
  const F = FRAMES[i], cl = M.STATIONS[i].at, cf = RF;
  const out = [];
  out.push(leg(F, cf, cl - 6.5));
  out.push(botArm(F, cf, cl - TORSO.lw / 2 - 2.2));
  const pack = F.plan(cf + TORSO.df - 3.6, cl - 8, 3.6, 16, 1.2);
  out.push(S(slab(pack, BOT.chest + 4, 13, 4, 0.4), { tone: "lo" }));
  for (let j = 0; j < 4; j++) out.push(S(slab(F.plan(cf + TORSO.df - 2.8, cl - 5 + j * 3.4, 2, 1, 0.5), BOT.chest + 17, 0.25, 3), { tone: "lo", crease: "none" }));
  out.push(leg(F, cf, cl + 6.5));
  const hip = F.plan(cf - 6, cl - 9.5, 12, 19, 2.4);
  out.push(S(slab(hip, BOT.hip, BOT.chest - BOT.hip, 4, 0.5), { tone: "mid" }));
  const torso = F.plan(cf + TORSO.df, cl - TORSO.lw / 2, TORSO.fw, TORSO.lw, TORSO.r);
  out.push(S(slab(torso, BOT.chest, TORSO.h, 6, 1), { tone: "mid", inner: L(k.sideSeam(torso, BOT.chest + 2.6, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(torso, 1.8), BOT.neck, P, 6), { tone: "faint" }));
  out.push(chestDisplay(F, cf, cl, i));
  out.push(S(F.cyl(cf, cl, 3.4, BOT.neck, 0.8, 26), { tone: "mid" }));
  out.push(S(F.cyl(cf, cl, 2, BOT.neck + 0.8, BOT.head - BOT.neck - 0.8, 18), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(cf - 1.8, cl - 8, 3.6, 1.2, 0.5), BOT.head + 3, 4, 2), { tone: "lo", crease: "none" }));
  const head = F.plan(cf - 6, cl - 7, 12, 14, 3);
  out.push(S(slab(head, BOT.head, BOT.crown - BOT.head, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(head, BOT.head + 2, P, 6), { tone: "faint" }) }));
  const visor = F.face(cf + 6, F.left(cl - 5.4, cl + 5.4), BOT.crown - 2.4);
  out.push(recessWindow(visor, `<rect class="om-eye" data-eye="${i}" x="2.2" y="1.5" width="2.4" height="1.3" rx="0.6"/><rect class="om-eye" data-eye="${i}" x="6.2" y="1.5" width="2.4" height="1.3" rx="0.6"/>`, { u0: 0, u1: 10.8, v0: 0, v1: 4.2, r: 1.4, depth: 0.6 }));
  out.push(D([3.4, 5.4, 7.4].map((u) => at(visor.at(u, 6.4))), { size: 0.36, tone: "lo" }));
  out.push(S(slab(F.plan(cf - 1.8, cl + 7, 3.6, 1.2, 0.5), BOT.head + 3, 4, 2), { tone: "mid", crease: "none" }));
  const [af, al] = [cf - 2.6, cl - 3];
  out.push(tip("beacon", i, S(F.cyl(af, al, 1.6, BOT.crown, 0.8, 18), { tone: "mid" }) +
    S(F.cyl(af, al, 0.45, BOT.crown + 0.8, STALK, 10), { tone: "mid", crease: "none" }) +
    S(F.cyl(af, al, 1.3, BOT.crown + 0.8 + STALK, 1.8, 18), { tone: "mid" }) +
    `<g data-lamp="${i}" opacity="0">${S(F.cyl(af, al, 1.3, BOT.crown + 0.8 + STALK, 1.8, 18), { tone: "lit", lit: true })}</g>`));
  out.push(botArm(F, cf, cl + TORSO.lw / 2 + 2.2));
  return out.join("");
}
// The dock: a print bed the copy is printed on, with its line port at the front.
function dock(i) {
  const F = FRAMES[i], cl = M.STATIONS[i].at;
  const plan = F.plan(DOCK.f, cl - DOCK.lw / 2, DOCK.fw, DOCK.lw, 2.4);
  const out = [halo(plan, 0, BOT.feet)];
  out.push(S(slab(plan, 0, BOT.feet, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(plan, 1.2, P, 6), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2.4), BOT.feet, P, 6), { tone: "lo" }));
  out.push(D(k.corners(plan, 1.3).map(([x, y]) => at([x, y, BOT.feet])), { size: 0.42 }));
  // The port the floor line plugs into, on the dock's front face.
  const port = F.plan(DOCK.f + DOCK.fw, cl - 2.6, 1.2, 5.2, 0.5);
  out.push(S(slab(port, 0, 2.2, 2), { tone: "mid", crease: "none" }));
  return tip("dock", i, out.join(""));
}
// The print plane: a lit outline at the height being printed, split so its far half
// is drawn behind the robot and its near half in front.
const printPlan = (i) => FRAMES[i].plan(DOCK.f + 1.6, M.STATIONS[i].at - DOCK.lw / 2 + 1.6, DOCK.fw - 3.2, DOCK.lw - 3.2, 0);

// ── Crates and tools ────────────────────────────────────────────────────────
const CRATE = { f: 3, fw: 24, lw: 28, h: 24, wall: 2.2, dl: -38 };
const RISE = 22; // how far a tool sits below its crate's rim before it rises
const crateL = (i) => M.STATIONS[i].at + CRATE.dl;
const cratePlan = (i) => FRAMES[i].plan(CRATE.f, crateL(i) - CRATE.lw / 2, CRATE.fw, CRATE.lw, 0.8);
const openPlan = (i) => FRAMES[i].plan(CRATE.f + CRATE.wall, crateL(i) - CRATE.lw / 2 + CRATE.wall, CRATE.fw - CRATE.wall * 2, CRATE.lw - CRATE.wall * 2, 0);
function crate(i) {
  const F = FRAMES[i], c = crateL(i), plan = cratePlan(i);
  const out = [halo(plan, 0, CRATE.h)];
  const seams = L(k.sideSeam(plan, 8, P, 3) + k.sideSeam(plan, 16, P, 3), { tone: "faint" });
  out.push(S(slab(plan, 0, CRATE.h, 3, 0.5), { tone: "mid", inner: seams }));
  // Battens on the front face: top and bottom rails and two stiles, with a brace between.
  const ff = CRATE.f + CRATE.fw, l0 = c - CRATE.lw / 2, l1 = c + CRATE.lw / 2;
  out.push(S(slab(F.plan(ff, l0, 0.8, 3, 0.3), 0, CRATE.h, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(ff, l0 + 3, 0.8, CRATE.lw - 6, 0.3), 0, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(ff, l0 + 3, 0.8, CRATE.lw - 6, 0.3), CRATE.h - 3, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(ff, l1 - 3, 0.8, 3, 0.3), 0, CRATE.h, 2), { tone: "mid", crease: "none" }));
  const face = F.face(ff, F.left(l0, l1), CRATE.h);
  out.push(L(k.segment(face.at(3, 3), face.at(CRATE.lw - 3, CRATE.h - 3), P), { tone: "faint" }));
  // The stencilled role on the front, and nail heads on the battens.
  out.push(`<g class="om-stencil">${k.faceTextSvg(`${face.plane()} translate(${CRATE.lw / 2} ${CRATE.h / 2 + 2})`, M.ROLES[i].id, { size: 5.4, tone: "mid", anchor: "middle" })}</g>`);
  const nails = [];
  for (const u of [1.5, CRATE.lw - 1.5]) for (const v of [1.5, CRATE.h / 2, CRATE.h - 1.5]) nails.push(at(face.at(u, v, -0.8)));
  out.push(D(nails, { size: 0.36, tone: "lo" }));
  // A rope handle on the near side.
  const sl = l1;
  out.push(S(slab(F.plan(CRATE.f + 8, sl, 8, 0.9, 0.4), 14, 1.4, 2), { tone: "lo", crease: "none" }));
  // The open top: walls, the dark inside, and the lift plate the tool stands on.
  out.push(`<g data-hole="${i}" opacity="0">${holeSvg(openPlan(i), CRATE.h, 18)}</g>`);
  return tip("crate", i, out.join(""));
}
function lidSvg(i) {
  const F = FRAMES[i], c = crateL(i);
  const plan = k.insetPlan(cratePlan(i), 0.3);
  const out = [S(slab(plan, CRATE.h, 1.8, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, CRATE.h + 0.9, P, 3), { tone: "faint" }) })];
  for (const df of [5, CRATE.fw - 8]) out.push(S(slab(F.plan(CRATE.f + df, c - CRATE.lw / 2 + 0.6, 3, CRATE.lw - 1.2, 0.3), CRATE.h + 1.8, 1, 2), { tone: "mid", crease: "none" }));
  const nails = [];
  for (const df of [6.5, CRATE.fw - 6.5]) for (const dl of [-11, 0, 11]) nails.push(F.at(CRATE.f + df, c + dl, CRATE.h + 2.8));
  out.push(D(nails.map((p) => p), { size: 0.34, tone: "lo" }));
  return out.join("");
}
// Each tool stands on a lift plate inside its crate and is built where it ends up, on
// the rim; the page lowers it by RISE until the lid is off.
const TOP = CRATE.h;
function liftPlate(i) {
  return S(slab(k.insetPlan(openPlan(i), 0.3), TOP - 1.4, 1.4, 2), { tone: "lo", crease: "none" });
}
function kanban(i) {
  const F = FRAMES[i], c = crateL(i);
  const out = [];
  const z0 = TOP + 6, z1 = TOP + 28, l0 = c - 10.5, l1 = c + 10.5;
  for (const l of [l0 + 2, l1 - 2]) {
    out.push(S(slab(F.plan(8, l - 2.2, 12, 4.4, 1), TOP, 1.4, 3, 0.3), { tone: "mid" }));
    out.push(S(F.cyl(14, l, 0.9, TOP + 1.4, z0 - TOP - 1.4 + 1, 12), { tone: "mid", crease: "none" }));
  }
  const board = F.plan(13, l0, 2, l1 - l0, 0.6);
  out.push(S(slab(board, z0, z1 - z0, 2, 0.4), { tone: "hi" }));
  const face = F.face(15, F.left(l0, l1), z1);
  const W = l1 - l0, H = z1 - z0;
  const cols = [W / 3, (W * 2) / 3];
  const cards = [];
  // Card slots: three columns (to do, doing, done), three cards each. The page moves them.
  for (let j = 0; j < 9; j++) cards.push(`<rect class="om-card" data-card="${j}" x="0" y="0" width="5.2" height="3" rx="0.4"/>`);
  out.push(`<g transform="${face.plane()}"><path class="iso-line" data-tone="lo" d="${roundedFlat({ u0: 1, u1: W - 1, v0: 1, v1: H - 1, r: 0.6 })}"/>` +
    `<path class="iso-line" data-tone="faint" d="M1 4H${W - 1}${cols.map((u) => `M${u.toFixed(2)} 1V${H - 1}`).join("")}"/>` +
    [0, 1, 2].map((j) => `<path class="iso-line" data-tone="lo" data-free="" d="M${(j * W / 3 + 2).toFixed(2)} 2.5H${(j * W / 3 + 2 + [3.6, 4.4, 3].at(j)).toFixed(2)}"/>`).join("") +
    `<g data-kanban="${i}">${cards.join("")}</g></g>`);
  out.push(D([at(face.at(1.8, H - 1.8)), at(face.at(W - 1.8, H - 1.8))], { size: 0.36 }));
  return out.join("");
}
function easel(i) {
  const F = FRAMES[i], c = crateL(i);
  const out = [];
  const l0 = c - 9.5, l1 = c + 9.5, z0 = TOP + 8, z1 = TOP + 27;
  // A back leg, two front masts, the tray and the canvas.
  out.push(S(F.cyl(8, c, 0.9, TOP, z1 - TOP - 2, 12), { tone: "mid", crease: "none" }));
  for (const l of [l0 + 1.6, l1 - 1.6]) out.push(S(F.cyl(12.4, l, 1, TOP, z1 - TOP + 2, 12), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(9, c - 0.9, 3.4, 1.8, 0.4), z1 - 4, 2, 2), { tone: "mid", crease: "none" }));
  const canvas = F.plan(13.4, l0, 1.4, l1 - l0, 0.3);
  out.push(S(slab(canvas, z0, z1 - z0, 2, 0.3), { tone: "hi" }));
  out.push(S(slab(F.plan(13.4, l0 - 0.6, 4.4, l1 - l0 + 1.2, 0.4), z0 - 1.6, 1.6, 2, 0.3), { tone: "mid" }));
  out.push(S(F.cyl(16, c - 4, 0.45, z0, 0.9, 10), { tone: "lo", crease: "none" }), S(F.cyl(16, c + 3, 0.45, z0, 0.9, 10), { tone: "lo", crease: "none" }));
  const face = F.face(14.8, F.left(l0, l1), z1);
  const W = l1 - l0, H = z1 - z0;
  // The mockup the designer draws: a phone screen with a header, a picture and two buttons.
  const mock = [
    roundedFlat({ u0: W / 2 - 4.6, u1: W / 2 + 4.6, v0: 2, v1: H - 2, r: 1.2 }),
    `M${(W / 2 - 4.6).toFixed(2)} 5H${(W / 2 + 4.6).toFixed(2)}`,
    roundedFlat({ u0: W / 2 - 3.4, u1: W / 2 + 3.4, v0: 6.4, v1: 11.4, r: 0.4 }),
    roundedFlat({ u0: W / 2 - 3.4, u1: W / 2 - 0.4, v0: 12.8, v1: 14.4, r: 0.6 }),
    roundedFlat({ u0: W / 2 + 0.4, u1: W / 2 + 3.4, v0: 12.8, v1: 14.4, r: 0.6 }),
  ];
  out.push(`<g transform="${face.plane()}"><g data-mock="${i}">${mock.map((d, j) => `<path class="iso-line om-draw" data-tone="${j ? "mid" : "lo"}" pathLength="1" d="${d}"/>`).join("")}</g>` +
    `<circle class="om-pen" data-pen="${i}" cx="${W / 2}" cy="${H / 2}" r="0.6" opacity="0"/></g>`);
  return out.join("");
}
function terminal(i) {
  const F = FRAMES[i], c = crateL(i);
  const out = [];
  out.push(S(slab(F.plan(8, c - 4.2, 7, 8.4, 1.6), TOP, 1.2, 3, 0.3), { tone: "mid" }));
  out.push(S(F.cyl(11, c, 1.1, TOP + 1.2, 6, 14), { tone: "mid", crease: "none" }));
  const l0 = c - 10.5, l1 = c + 10.5, z0 = TOP + 6.4, z1 = TOP + 21;
  const shell = F.plan(8.6, l0, 4.4, l1 - l0, 1);
  out.push(S(slab(shell, z0, z1 - z0, 3, 0.5), { tone: "mid" }));
  const face = F.face(13, F.left(l0, l1), z1);
  const W = l1 - l0, H = z1 - z0;
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(`<rect class="om-code" data-code="${r}" x="${2.4 + (r % 3 === 1 ? 1.6 : r % 3 === 2 ? 3.2 : 0)}" y="${2.2 + r * 1.65}" width="0" height="0.75" rx="0.3"/>`);
  out.push(recessWindow(face, `<g data-term="${i}">${rows.join("")}<rect class="om-cursor" data-cursor="${i}" x="2.4" y="2.2" width="0.8" height="0.9"/></g>`, { u0: 1.2, u1: W - 1.2, v0: 1.2, v1: H - 2.4, r: 0.6, depth: 0.6 }));
  out.push(D([at(face.at(W / 2, H - 1.2))], { size: 0.4, tone: "lo" }));
  // The keyboard in front of it, its keys a grid of dots.
  const kb = F.plan(15.6, c - 8, 6.4, 16, 0.8);
  out.push(S(slab(kb, TOP, 1.3, 3, 0.4), { tone: "mid" }));
  const keys = [];
  for (let r = 0; r < 3; r++) for (let j = 0; j < 9; j++) keys.push(F.at(16.8 + r * 1.9, c - 6.6 + j * 1.65, TOP + 1.3));
  out.push(D(keys.map(at), { size: 0.3, tone: "lo" }));
  return out.join("");
}
function inspector(i) {
  const F = FRAMES[i], c = crateL(i);
  const out = [];
  // The board under test on a jig, with a chip and its pads.
  out.push(S(slab(F.plan(11, c - 9, 12, 13, 0.6), TOP, 1.6, 2, 0.3), { tone: "mid" }));
  const pcb = F.plan(12.4, c - 7.6, 9.2, 10.2, 0.4);
  out.push(S(slab(pcb, TOP + 1.6, 0.6, 2), { tone: "hi", crease: "lo" }));
  out.push(S(slab(F.plan(15, c - 4.6, 4, 4, 0.3), TOP + 2.2, 0.8, 2), { tone: "lo" }));
  const pads = [];
  for (let j = 0; j < 4; j++) pads.push(F.at(13.6, c - 6.4 + j * 2.6, TOP + 2.2), F.at(20.4, c - 6.4 + j * 2.6, TOP + 2.2));
  out.push(D(pads, { size: 0.3, tone: "lo" }));
  out.push(`<g data-scan="${i}" opacity="0">${L(k.planOutline(F.plan(14.2, c - 5.4, 5.6, 5.6, 2.8), TOP + 2.2, P, 6), { tone: "lit" })}</g>`);
  // The lamp: a post at the near back corner, an arm across and a head over the board.
  const pl = c + 7.4;
  out.push(S(F.cyl(8, pl, 2.6, TOP, 1.4, 20, 0.3), { tone: "mid" }));
  out.push(S(F.cyl(8, pl, 0.9, TOP + 1.4, 19, 12), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(8, pl, 1.6, TOP + 18, 3, 14), { tone: "mid" }));
  out.push(S(slab(F.plan(7.2, c - 1.4, 1.6, pl - c + 1.4, 0.5), TOP + 19, 1.4, 2), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(17, c - 1.6, 0.6, TOP + 14.2, 4.8, 10), { tone: "mid", crease: "none" }));
  out.push(S(slab(F.plan(8.8, c - 2.2, 8.8, 1.4, 0.5), TOP + 19, 1.4, 2), { tone: "mid", crease: "none" }));
  out.push(S(F.cyl(17, c - 1.6, 4, TOP + 10.6, 3.6, 30, 0.4), { tone: "mid", inner: L(k.sideArc(...F.pt(17, c - 1.6).slice(0, 2), 4, TOP + 12, P, 24), { tone: "faint" }) }));
  // A verdict panel: pass and fail lamps.
  const vp = F.plan(17, c - 12.6, 3, 3.6, 0.4);
  out.push(S(slab(vp, TOP, 7, 2, 0.3), { tone: "mid" }));
  const vf = F.face(20, F.left(c - 12.6, c - 9), TOP + 7);
  out.push(`<g transform="${vf.plane()}"><circle class="om-led-off" cx="1.8" cy="1.8" r="0.7"/><circle class="om-led-off" cx="1.8" cy="4.2" r="0.7"/><circle class="om-pass" data-pass="${i}" cx="1.8" cy="1.8" r="0.7" opacity="0"/><circle class="om-fail" data-fail="${i}" cx="1.8" cy="4.2" r="0.7" opacity="0"/></g>`);
  return out.join("");
}
function rack(i) {
  const F = FRAMES[i], c = crateL(i);
  const out = [];
  const l0 = c - 9, l1 = c + 9, z1 = TOP + 24;
  const box = F.plan(7, l0, 14, l1 - l0, 1);
  out.push(S(slab(box, TOP, z1 - TOP, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(box, TOP + 3, P, 3), { tone: "faint" }) }));
  out.push(S(slab(k.insetPlan(box, 1.4), z1, 1, 3, 0.3), { tone: "mid" }));
  const face = F.face(21, F.left(l0, l1), z1);
  const W = l1 - l0;
  const units = [], leds = [];
  for (let u = 0; u < 5; u++) {
    const v = 1.6 + u * 3.9;
    units.push(roundedFlat({ u0: 1.2, u1: W - 1.2, v0: v, v1: v + 3.3, r: 0.4 }));
    units.push(roundedFlat({ u0: 8, u1: W - 2.4, v0: v + 1.2, v1: v + 2.1, r: 0.45 }));
    for (let j = 0; j < 3; j++) leds.push(`<circle class="om-led-off" cx="${2.6 + j * 1.6}" cy="${v + 1.65}" r="0.5"/><circle class="om-led-on" data-rack-led="${u * 3 + j}" cx="${2.6 + j * 1.6}" cy="${v + 1.65}" r="0.5" opacity="0"/>`);
  }
  out.push(`<g transform="${face.plane()}"><path class="iso-line" data-tone="lo" d="${units.join("")}"/><g data-rack="${i}">${leds.join("")}</g></g>`);
  out.push(D([at(face.at(0.8, 1)), at(face.at(W - 0.8, 1)), at(face.at(0.8, 20.6)), at(face.at(W - 0.8, 20.6))], { size: 0.38 }));
  // A big ship button on top.
  out.push(S(F.cyl(12, c + 4, 2.2, z1 + 1, 1, 18), { tone: "mid" }));
  out.push(`<g data-ship="${i}">${S(F.cyl(12, c + 4, 1.5, z1 + 2, 0.9, 16), { tone: "hi" })}</g>`);
  return out.join("");
}
const TOOLS = [kanban, easel, terminal, inspector, rack];

// ── The outbound cart by the door: one parcel lands on it for every goal that ships.
const CART = { x: 62, y: -98, w: 28, d: 21, z: 5.6, h: 1.6 };
const PARCEL = { w: 12, d: 8.6, h: 7.2 };
const parcelAt = (j) => ({ x: CART.x + 1.4 + (j % 2) * (PARCEL.w + 0.8), y: CART.y + 1.4 + Math.floor(j / 2) * (PARCEL.d + 0.8) });
function cart() {
  const out = [halo(CART, 0, CART.z)];
  const casters = k.corners(CART, 3).sort((a, b) => depth(...a) - depth(...b));
  const caster = ([x, y]) => S(slab({ x: x - 1.4, y: y - 0.5, w: 2.8, d: 1, r: 0.3 }, 3.4, CART.z - 3.4, 2), { tone: "mid", crease: "none" }) +
    S(G.disc(-0.6, 0.6, 1.7, G.frameAlong([x, y, 1.7], [0, 1, 0]), P), { tone: "lo" });
  casters.filter(([, y]) => y < CART.y + CART.d / 2).forEach((c) => out.push(caster(c)));
  out.push(S(slab(CART, CART.z, CART.h, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(CART, CART.z + 0.8, P, 3), { tone: "faint" }) }));
  casters.filter(([, y]) => y >= CART.y + CART.d / 2).forEach((c) => out.push(caster(c)));
  out.push(L(k.planOutline(k.insetPlan(CART, 1.2), CART.z + CART.h, P, 3), { tone: "faint" }));
  // Parcels, nearest last; the page drops each one in when its goal ships.
  const top = CART.z + CART.h;
  [0, 1, 2, 3].sort((a, b) => depth(parcelAt(a).x, parcelAt(a).y) - depth(parcelAt(b).x, parcelAt(b).y)).forEach((j) => {
    const { x, y } = parcelAt(j), plan = { x, y, w: PARCEL.w, d: PARCEL.d, r: 0.4 };
    const tape = L(k.lineOnTop([x + PARCEL.w / 2, y], [x + PARCEL.w / 2, y + PARCEL.d], top + PARCEL.h, P), { tone: "lo" });
    out.push(`<g data-parcel="${j}" opacity="0">${S(slab(plan, top, PARCEL.h, 2, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(plan, top + PARCEL.h - 1.4, P, 2), { tone: "faint" }) })}${tape}` +
      `${L(k.segment([x + PARCEL.w / 2, y + PARCEL.d, top + PARCEL.h], [x + PARCEL.w / 2, y + PARCEL.d, top + PARCEL.h - 3], P), { tone: "lo" })}</g>`);
  });
  // The handle: two uprights at the far end and a grip across.
  for (const y of [CART.y + 2, CART.y + CART.d - 3.6]) out.push(S(slab({ x: CART.x + CART.w - 2.4, y, w: 1.6, d: 1.6, r: 0.6 }, top, 22, 2), { tone: "mid", crease: "none" }));
  out.push(S(G.disc(0, CART.d - 2.8, 1.1, G.frameAlong([CART.x + CART.w - 1.6, CART.y + 1.4, top + 22.6], [0, 1, 0]), P), { tone: "mid" }));
  return tip("cart", undefined, out.join(""));
}
// A spare crate, still sealed: another role you can add when the work needs it.
const SPARE = { x: -22, y: 78, w: 24, d: 28, h: 24 };
function spare() {
  const plan = { ...SPARE, r: 0.8 }, x1 = SPARE.x + SPARE.w;
  const out = [halo(plan, 0, SPARE.h)];
  out.push(S(slab(plan, 0, SPARE.h, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 8, P, 3) + k.sideSeam(plan, 16, P, 3), { tone: "faint" }) }));
  const y0 = SPARE.y, y1 = SPARE.y + SPARE.d;
  out.push(S(slab({ x: x1, y: y0, w: 0.8, d: 3, r: 0.3 }, 0, SPARE.h, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: x1, y: y0 + 3, w: 0.8, d: SPARE.d - 6, r: 0.3 }, 0, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: x1, y: y0 + 3, w: 0.8, d: SPARE.d - 6, r: 0.3 }, SPARE.h - 3, 3, 2), { tone: "mid", crease: "none" }));
  out.push(S(slab({ x: x1, y: y1 - 3, w: 0.8, d: 3, r: 0.3 }, 0, SPARE.h, 2), { tone: "mid", crease: "none" }));
  const face = k.sideMatrix([x1 + 0.8, y1], SPARE.h, P, "x");
  out.push(L(k.segment([x1 + 0.8, y1 - 3, SPARE.h - 3], [x1 + 0.8, y0 + 3, 3], P), { tone: "faint" }));
  out.push(`<g class="om-stencil">${k.faceTextSvg(`${face} translate(${SPARE.d / 2} ${SPARE.h / 2 + 2})`, "+1", { size: 5.4, tone: "mid", anchor: "middle" })}</g>`);
  const lid = k.insetPlan(plan, 0.3);
  out.push(S(slab(lid, SPARE.h, 1.8, 3, 0.4), { tone: "mid" }));
  for (const dy of [5, SPARE.d - 8]) out.push(S(slab({ x: SPARE.x + 0.6, y: SPARE.y + dy, w: SPARE.w - 1.2, d: 3, r: 0.3 }, SPARE.h + 1.8, 1, 2), { tone: "mid", crease: "none" }));
  // A rope handle on the near side, and nails on the front battens.
  out.push(S(slab({ x: SPARE.x + 8, y: y1, w: 8, d: 0.9, r: 0.4 }, 14, 1.4, 2), { tone: "lo", crease: "none" }));
  const nails = [];
  for (const y of [y1 - 1.5, y0 + 1.5]) for (const z of [1.5, SPARE.h / 2, SPARE.h - 1.5]) nails.push(at([x1 + 0.8, y, z]));
  out.push(D(nails, { size: 0.36, tone: "lo" }));
  return tip("spare", undefined, out.join(""));
}

// A café table beside the pad: your coffee and notebook. The time the agents give back.
const CAFE = { x: 66, y: 52, r: 10, z: 27 };
function cafe() {
  const { x, y, r, z } = CAFE, out = [halo({ x: x - 7, y: y - 7, w: 14, d: 14, r: 7 }, 0, 2)];
  out.push(S(k.cylinder(x, y, 6.4, 0, 1.4, P, 32, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 1.3, 1.4, z - 1.4 - 1.6, P, 16), { tone: "mid", crease: "none", inner: L(k.sideArc(x, y, 1.3, 14, P, 12), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 2.6, z - 3, 1.4, P, 20, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, r, z - 1.6, 1.6, P, 48, 0.6), { tone: "mid" }));
  out.push(L(k.ring(x, y, r - 1.6, z, P, 40), { tone: "faint" }));
  // The notebook, with a pencil across it and three rule lines of writing.
  const nb = { x: x - 1, y: y - 7, w: 7.4, d: 9.6, r: 0.4 };
  out.push(S(slab(nb, z, 0.8, 2, 0.2), { tone: "hi", crease: "lo" }));
  out.push(L(k.lineOnTop([nb.x, nb.y + 1.2], [nb.x + nb.w, nb.y + 1.2], z + 0.8, P), { tone: "lo" }));
  for (const [dx, len] of [[2.2, 6.2], [3.6, 4.4], [5, 5.6]]) out.push(L(k.lineOnTop([nb.x + dx, nb.y + 2.4], [nb.x + dx, nb.y + 2.4 + len], z + 0.8, P), { tone: "faint", free: true }));
  out.push(S(G.disc(0, 8, 0.45, G.frameAlong([x + 7.2, y - 6.6, z + 1.25], [0, 1, 0]), P), { tone: "mid" }));
  // The mug: a body, a rim, a handle on the near side and the coffee inside.
  const [mx, my] = [x - 4.6, y + 4];
  out.push(S(slab({ x: mx - 0.6, y: my + 1.6, w: 1.2, d: 2, r: 0.5 }, z + 0.8, 3, 2), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(mx, my, 2.1, z, 4.4, P, 24, 0.3), { tone: "hi", crease: "lo", inner: L(k.sideArc(mx, my, 2.1, z + 3.6, P, 16), { tone: "lo" }) }));
  out.push(`<path class="om-pit" d="${k.ring(mx, my, 1.6, z + 4.4, P, 24)}"/>`);
  out.push(L(k.ring(mx, my, 1.6, z + 4.4, P, 24), { tone: "lo" }));
  return tip("cafe", undefined, out.join(""));
}

// ── Assemble ────────────────────────────────────────────────────────────────
function station(i) {
  const clipCrate = clipId(), clipBot = clipId();
  const crateSvg = crate(i) +
    `<clipPath id="${clipCrate}"><path d="${sweep(openPlan(i), TOP, 1)}"/></clipPath>` +
    `<g clip-path="url(#${clipCrate})"><g data-tool="${i}" data-tip="tool" data-i="${i}">${liftPlate(i)}${TOOLS[i](i)}</g></g>` +
    `<g data-lid="${i}" data-tip="lid" data-i="${i}">${lidSvg(i)}</g>`;
  const pp = printPlan(i);
  const botSvg = dock(i) +
    `<path class="iso-line om-print" data-tone="lit" data-print-back="${i}" d=""/>` +
    `<clipPath id="${clipBot}"><path data-print-clip="${i}" d="${sweep(pp, BOT.feet, -1)}"/></clipPath>` +
    `<g data-bot="${i}" clip-path="url(#${clipBot})" opacity="0">${tip("robot", i, robot(i))}</g>` +
    `<path class="iso-line om-print" data-tone="lit" data-print-front="${i}" d=""/>`;
  const F = FRAMES[i];
  return [
    { key: depth(...F.pt(CRATE.f + CRATE.fw / 2, crateL(i))), svg: crateSvg },
    { key: depth(...F.pt(RF, M.STATIONS[i].at)), svg: botSvg },
  ];
}
function padItems() {
  const items = [{ key: depth(PAD.x, PAD.y) - 40, svg: padBase() }];
  const far = POSTS.filter((a) => Math.cos(a - VIEW_A) < 0), near = POSTS.filter((a) => Math.cos(a - VIEW_A) >= 0);
  const ring = (html) => `<g data-ring>${html}</g>`;
  const pad = [
    ...far.map(postSvg),
    ring(far.map(sledSvg).join("") + ringHalf(false)),
    person(),
    ring(ringHalf(true) + near.map(sledSvg).join("")),
    ...near.sort((a, b) => Math.cos(a - VIEW_A) - Math.cos(b - VIEW_A)).map(postSvg),
  ].join("");
  items.push({ key: depth(PAD.x, PAD.y), svg: pad });
  return items;
}

const items = [
  ...M.ROLES.flatMap((_, i) => station(i)),
  ...padItems(),
  { key: depth(CART.x + CART.w / 2, CART.y + CART.d / 2), svg: cart() },
  { key: depth(CAFE.x, CAFE.y), svg: cafe() },
  { key: depth(SPARE.x + SPARE.w / 2, SPARE.y + SPARE.d / 2), svg: spare() },
].sort((a, b) => a.key - b.key);
const packets = M.ROLES.map((_, i) => `<g data-packet="${i}" opacity="0"><circle class="om-packet" r="1.5"/><circle class="om-packet-core" r="0.7"/></g>`).join("") +
  Array.from({ length: 6 }, (_, j) => `<g data-packet-x="${j}" opacity="0"><circle class="om-packet" r="1.5"/><circle class="om-packet-core" r="0.7"/></g>`).join("");
const carriers = Array.from({ length: 3 }, (_, j) => `<g data-carrier="${j}" data-tip="carrier" opacity="0">${carrierSvg()}</g>`).join("");

const svgBody = [
  base(),
  walls(),
  clock(),
  door(),
  rail(),
  carriers,
  tip("floor", undefined, floor()),
  floorLines(),
  `<g data-packets>${packets}</g>`,
  ...items.map((item) => item.svg),
].join("");
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: "A room seen from above at an angle. One person stands on a scan pad holding a tablet; five robots, copies of them printed on docks along two walls, each work at a tool unpacked from a crate. Floor lines carry reports from every robot to the person; a rail along the walls carries work from robot to robot.", body: svgBody });

// Numbers the page needs.
const C = {
  RING, BOT, BOT_TOP, RISE, CRATE_F: CRATE.f, LED, CAN,
  lines: M.ROLES.map((_, i) => { const { from, to } = lineEnds(i); return { from, to }; }),
  print: M.ROLES.map((_, i) => printPlan(i)),
  lidAxis: M.STATIONS.map((st) => (st.wall === "B" ? [1, 0, 0] : [0, 1, 0])),
  LINE_H,
};

const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const live = `
${MODEL}
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const q = (sel) => svg.querySelector(sel);
const qa = (sel) => [...svg.querySelectorAll(sel)];
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const memo = new Map();
const setAttr = (el, name, value) => { let m = memo.get(el); if (!m) memo.set(el, (m = {})); if (m[name] !== value) { m[name] = value; el.setAttribute(name, value); } };
const at = (p) => iso(p, P);
const move = (el, by) => setAttr(el, "transform", translateAlong(P, by));
const fix = (v) => v.toFixed(2);

const els = {
  ring: qa("[data-ring]"), ringLit: qa("[data-ring-lit]"),
  ports: ROLES.map((_, i) => q('[data-port="' + i + '"]')),
  packets: [...ROLES.map((_, i) => q('[data-packet="' + i + '"]')), ...qa("[data-packet-x]")],
  carriers: qa("[data-carrier]"),
  hands: { h: q('[data-hand="h"]'), m: q('[data-hand="m"]') },
  tabDot: ROLES.map((_, i) => q('[data-tab-dot="' + i + '"]')), tabBar: ROLES.map((_, i) => q('[data-tab-bar="' + i + '"]')),
  st: ROLES.map((_, i) => ({
    bot: q('[data-bot="' + i + '"]'), clip: q('[data-print-clip="' + i + '"]'), back: q('[data-print-back="' + i + '"]'), front: q('[data-print-front="' + i + '"]'),
    tool: q('[data-tool="' + i + '"]'), lid: q('[data-lid="' + i + '"]'), hole: q('[data-hole="' + i + '"]'),
    log: [...q('[data-log="' + i + '"]').children], bar: [...q('[data-bar="' + i + '"]').children], badge: q('[data-badge="' + i + '"]'), lamp: q('[data-lamp="' + i + '"]'),
    eyes: qa('[data-eye="' + i + '"]'),
  })),
  kanban: qa("[data-kanban] rect"), mock: qa("[data-mock] path"), pen: q("[data-pen]"),
  code: qa("[data-code]"), cursor: q("[data-cursor]"), scan: q("[data-scan]"), pass: q("[data-pass]"), fail: q("[data-fail]"),
  rackLeds: qa("[data-rack-led]"),
  parcels: [0, 1, 2, 3].map((j) => q('[data-parcel="' + j + '"]')),
};

// The print plane at height z over plan p, split into the far half (−x and −y edges) and the near half.
function printHalves(p, z) {
  const a = [p.x, p.y + p.d, z], b = [p.x, p.y, z], c = [p.x + p.w, p.y, z], d = [p.x + p.w, p.y + p.d, z];
  return { back: pathOf([a, b, c].map(at)), front: pathOf([c, d, a].map(at)) };
}
const lidPath = (u) => {
  // Lift 6, slide forward 26, set down on the floor 24 below where it started.
  const up = Math.min(1, u / 0.25), fwd = Math.max(0, Math.min(1, (u - 0.25) / 0.45)), down = Math.max(0, (u - 0.7) / 0.3);
  return { f: 26 * ease(fwd), z: 6 * ease(up) - 30 * ease(down) };
};
const KAN = { cols: [0, 7, 14], rows: [5.2, 9.2, 13.2], u0: 1.3 };

function draw(t) {
  const s = stateAt(t);
  // Scan ring.
  const ringZ = C.RING.bottom + (C.RING.top - C.RING.bottom) * s.scan.h - C.RING.top;
  els.ring.forEach((el) => move(el, [0, 0, ringZ]));
  els.ringLit.forEach((el) => setAttr(el, "opacity", fix(s.scan.glow)));
  // Stations.
  ROLES.forEach((_, i) => {
    const e = els.st[i], sp = s.spawn[i], a = s.agents[i];
    const z = C.BOT.feet + sp.print * (C.BOT_TOP - C.BOT.feet + 2);
    setAttr(e.bot, "opacity", sp.print > 0.001 ? "1" : "0");
    setAttr(e.clip, "d", sweepDown(C.print[i], z));
    const showPlane = sp.print > 0.001 && sp.print < 0.999;
    const h = showPlane ? printHalves(C.print[i], z) : { back: "", front: "" };
    setAttr(e.back, "d", h.back); setAttr(e.front, "d", h.front);
    setAttr(e.badge, "opacity", fix(span(sp.print, 0.6, 1)));
    // Crate: lid slides off, the hole shows, the tool rises.
    const lp = lidPath(sp.lid);
    const ax = C.lidAxis[i];
    move(e.lid, [ax[0] * lp.f, ax[1] * lp.f, lp.z]);
    setAttr(e.hole, "opacity", sp.lid > 0.3 ? "1" : "0");
    move(e.tool, [0, 0, -C.RISE * (1 - sp.tool)]);
    // Work: the chest log writes, the bar fills, the beacon lights, the eyes brighten.
    const job = a.job, p = job ? job.p : 0;
    const written = job ? Math.floor(p * C.LED.cols * C.LED.rows) : 0;
    const blink = !job && sp.print >= 1 && Math.floor(t * 2) % 2 === 0;
    e.log.forEach((el, j) => setAttr(el, "opacity", j < written || (blink && j === 0) ? "1" : "0"));
    const lit = job ? Math.round(p * C.LED.cols) : 0;
    e.bar.forEach((el, c) => setAttr(el, "opacity", c < lit ? "1" : "0"));
    setAttr(e.lamp, "opacity", job ? fix(0.55 + 0.45 * Math.abs(Math.sin(t * 5))) : a.got ? "1" : "0");
    e.eyes.forEach((el) => setAttr(el, "data-on", sp.print >= 1 ? "1" : "0"));
    setAttr(els.ports[i], "opacity", fix(s.portLit[i]));
    // Tablet: one row per agent: dot lit while it works, bar its progress.
    setAttr(els.tabDot[i], "class", sp.print >= 1 ? (job ? "om-led-lit" : "om-led-on") : "om-led-off");
    setAttr(els.tabBar[i], "width", fix(4.6 * p));
  });
  drawTools(t, s);
  // Floor-line packets: the agent's own slot first, then spares.
  let spare = ROLES.length;
  const used = new Set();
  s.packets.forEach((pk) => {
    let slot = used.has(pk.agent) ? spare++ : pk.agent;
    if (slot >= els.packets.length) return;
    used.add(pk.agent);
    const { from, to } = C.lines[pk.agent];
    const [x, y] = at([from[0] + (to[0] - from[0]) * pk.f, from[1] + (to[1] - from[1]) * pk.f, C.LINE_H]);
    const el = els.packets[slot];
    setAttr(el, "transform", "translate(" + fix(x) + " " + fix(y) + ")");
    setAttr(el, "opacity", "1");
    setAttr(el, "data-kind", pk.kind === "persona" ? "persona" : pk.dir);
    used.add("slot" + slot);
  });
  els.packets.forEach((el, j) => { if (!used.has("slot" + j)) setAttr(el, "opacity", "0"); });
  // Rail carriers.
  els.carriers.forEach((el, j) => {
    const h = s.hops[j];
    if (!h) return setAttr(el, "opacity", "0");
    const [x, y] = railPoint(h.s);
    move(el, [x, y, 0]);
    setAttr(el, "opacity", fix(Math.min(1, h.p * 8, (1 - h.p) * 8)));
    setAttr(el, "data-kind", h.kind);
  });
  // Parcels: each shipped goal drops onto the cart by the door.
  els.parcels.forEach((el, j) => {
    const ship = EVENTS.shipped[j], u = ship && t < DIS + DISMISS.persona[1] ? ease(span(t, ship.t, ship.t + 0.5)) : 0;
    setAttr(el, "opacity", u > 0 ? "1" : "0");
    if (u > 0) move(el, [0, 0, 10 * (1 - u)]);
  });
  // The clock: one working day, nine to six, per loop.
  const hours = 9 + (t / LOOP) * 9;
  setAttr(els.hands.h, "transform", "rotate(" + fix((hours % 12) * 30) + ")");
  setAttr(els.hands.m, "transform", "rotate(" + fix((hours % 1) * 360) + ")");
  setReadout(s);
}
function sweepDown(p, z) {
  const pts = [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.d], [p.x, p.y + p.d]];
  const top = pts.map(([x, y]) => at([x, y, z])), bot = pts.map(([x, y]) => at([x, y, z - 400]));
  return pathOf(hullOf([...top, ...bot]), true);
}
function hullOf(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...pts].reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
}

// Each tool shows its agent's work.
function drawTools(t, s) {
  const job = (i) => s.agents[i].job;
  // PM: cards move from to-do to doing to done as goals are specced.
  const pm = job(0), goals = s.goals, specced = EVENTS.work.filter((w) => w.agent === 0 && t >= w.t1).length;
  els.kanban.forEach((el, j) => {
    // Card j is goal j+1's ticket (three per board, the oldest leave).
    const g = Math.floor(j / 3) + 1 + Math.max(0, Math.floor((goals - 1) / 3)) * 3;
    const n = j % 3;
    let col = -1;
    if (g <= goals) col = 0;
    if (pm && pm.item === g) col = n <= Math.floor(pm.p * 3) ? 1 : 0;
    if (g <= specced) col = 2;
    const row = (j % 3);
    const show = col >= 0 && s.spawn[0].tool > 0.5;
    setAttr(el, "opacity", show ? "1" : "0");
    if (show) setAttr(el, "transform", "translate(" + fix(KAN.u0 + KAN.cols[col] + (Math.floor(j / 3) % 3) * 0.4) + " " + fix(KAN.rows[row] - 1.5 + (Math.floor(j / 3) % 3) * 0.5) + ")");
    setAttr(el, "data-on", pm && pm.item === g && col === 1 ? "1" : "0");
  });
  // Designer: the mockup draws itself while it works, and stays drawn until the next goal.
  const ux = job(1), uxDone = EVENTS.work.filter((w) => w.agent === 1 && t >= w.t1).length;
  const drawn = ux ? ux.p : uxDone ? 1 : 0;
  els.mock.forEach((el, j) => {
    const u = Math.max(0, Math.min(1, drawn * els.mock.length - j));
    setAttr(el, "stroke-dasharray", "1 1");
    setAttr(el, "stroke-dashoffset", fix(1 - u));
  });
  setAttr(els.pen, "opacity", ux ? "1" : "0");
  if (ux) { const a = t * 3.1; setAttr(els.pen, "transform", "translate(" + fix(Math.sin(a) * 3) + " " + fix(Math.cos(a * 1.3) * 5) + ")"); }
  // Developer: lines of code type out, the cursor blinks at the end.
  const dev = job(2);
  const typed = dev ? dev.p * 6 : EVENTS.work.some((w) => w.agent === 2 && t >= w.t1) ? 6 : 0;
  const lens = [7.6, 6, 8.4, 5.2, 7, 4];
  els.code.forEach((el, r) => setAttr(el, "width", fix(Math.max(0, Math.min(1, typed - r)) * lens[r])));
  const row = Math.min(5, Math.floor(typed));
  const x0 = +els.code[row].getAttribute("x") + +els.code[row].getAttribute("width") + 0.4;
  setAttr(els.cursor, "x", fix(x0)); setAttr(els.cursor, "y", fix(2.1 + row * 1.65));
  setAttr(els.cursor, "opacity", s.spawn[2].tool > 0.9 && Math.floor(t * 2.4) % 2 ? "1" : "0");
  // Tester: the scan ring pulses on the board; the verdict lamp shows the last result.
  const tester = job(3);
  setAttr(els.scan, "opacity", tester ? fix(0.4 + 0.6 * Math.abs(Math.sin(t * 6))) : "0");
  const last = EVENTS.work.filter((w) => w.agent === 3 && t >= w.t1).pop();
  setAttr(els.pass, "opacity", last && last.step === "test" && s.spawn[3].tool > 0.9 ? "1" : "0");
  setAttr(els.fail, "opacity", last && last.step === "bug" && s.spawn[3].tool > 0.9 ? "1" : "0");
  // Ops: the rack's lamps run while it deploys, and settle on what has shipped.
  const ops = job(4);
  els.rackLeds.forEach((el, j) => {
    const on = ops ? (Math.floor(t * 9 + j * 1.7) % 4 === 0 || j / els.rackLeds.length < ops.p) : s.spawn[4].tool > 0.9 && j < s.shipped * 3 + 1;
    setAttr(el, "opacity", on ? "1" : "0");
  });
}

let lastText = "";
function setReadout(s) {
  let text;
  if (s.phase === "empty") text = "1 person · 5 crates sealed";
  else if (s.phase === "scan") text = "scanning you · " + Math.round(100 * Math.min(1, (s.t - T.scan[0]) / (T.scan[1] - T.scan[0]))) + "%";
  else if (s.phase === "spawn") text = "you + " + s.online + (s.online === 1 ? " agent" : " agents") + (s.printing >= 0 ? " · printing " + ROLES[s.printing].id : "");
  else if (s.phase === "run") text = s.reports + " reports · " + s.handoffs + " hand-offs · " + s.shipped + " shipped";
  else text = "agents returning · " + s.shipped + " shipped";
  if (text !== lastText) { readout.textContent = text; lastText = text; }
}

// ── Time: a loop, chapters, a scrubber and pause.
const panel = document.querySelector(".om-panel");
const range = panel.querySelector("input[type=range]");
const chapterEls = [...panel.querySelectorAll("[data-chapter]")];
const playEl = panel.querySelector("[data-play]");
let now = CHAPTERS[2].t + 9, playing = !still.matches, visible = false, frame = 0, last = 0;
function show() {
  draw(now);
  range.value = String(now);
  const ch = now >= CHAPTERS[2].t ? 2 : now >= CHAPTERS[1].t ? 1 : 0;
  chapterEls.forEach((el, j) => el.setAttribute("aria-pressed", String(j === ch)));
  playEl.setAttribute("aria-pressed", String(playing));
  playEl.textContent = playing ? "Pause" : "Play";
  if (tipState) showTip();
}
function tick(ms) {
  const dt = last ? Math.min((ms - last) / 1000, 1 / 20) : 0;
  last = ms;
  now = (now + dt) % LOOP;
  show();
  frame = visible && playing ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && playing) { last = 0; frame = requestAnimationFrame(tick); } };
function jump(t, play) { now = t; if (play !== undefined) playing = play; show(); run(); }
chapterEls.forEach((el) => el.addEventListener("click", () => jump(CHAPTERS[+el.dataset.chapter].t, !still.matches)));
playEl.addEventListener("click", () => { playing = !playing; show(); run(); });
range.addEventListener("input", () => { playing = false; now = +range.value; show(); });
stage.addEventListener("keydown", (event) => {
  const n = "123".indexOf(event.key);
  if (n >= 0) jump(CHAPTERS[n].t, !still.matches);
  else if (event.key === " ") { playing = !playing; show(); run(); }
  else return;
  event.preventDefault();
});
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

// ── Pointing at parts: a tooltip names each one and says what it is doing now.
const plate = stage.closest(".iso-plate");
const tipEl = document.createElement("div");
tipEl.className = "om-tip"; tipEl.id = "om-tip"; tipEl.setAttribute("role", "tooltip"); tipEl.hidden = true;
const srEl = document.createElement("div");
srEl.className = "om-sr"; srEl.setAttribute("aria-live", "polite");
plate.append(tipEl, srEl);
const STEP = { spec: "writing the spec", mockup: "drawing the mockup", code: "writing the code", fix: "fixing the bug QA found", test: "testing the build", bug: "testing the build", deploy: "deploying" };
function doing(i, s) {
  const sp = s.spawn[i], a = s.agents[i];
  if (!sp.alive && s.phase !== "dismiss") return sp.persona > 0 ? "Your persona is on its way to the dock" : "Not printed yet: its crate is still sealed";
  if (sp.print < 1) return s.phase === "dismiss" ? "Un-printing: its persona goes back to you" : "Printing: " + Math.round(sp.print * 100) + "%";
  if (a.job) return "Goal " + a.job.item + " · " + STEP[a.job.step] + " · " + Math.round(a.job.p * 100) + "%";
  return "Idle, waiting for work on the rail";
}
const TIPS = {
  base: () => ({ name: "The room", what: "One person's studio, on a bench base. Everything the team does happens inside these two walls." }),
  walls: () => ({ name: "Walls", what: "The back of the room. The rail and the clock hang on them." }),
  floor: () => ({ name: "Floor", what: "Tiled every 36 units. The floor lines are laid on top of it." }),
  clock: (_, s) => ({ name: "Wall clock", what: "One loop is one working day, nine to six.", live: [clockText(s.t)] }),
  cart: (_, s) => ({ name: "Outbound cart", what: "By the door. Every goal that ops ships lands on it as a parcel.", live: [s.shipped + " of " + T.items + " goals shipped"] }),
  spare: () => ({ name: "Spare crate", what: "Still sealed: one more role you can add (a researcher, a writer, support) when the work needs it. Another copy of you, another tool." }),
  cafe: () => ({ name: "Your coffee", what: "With five agents doing the work, your job is goals, reports and decisions. There is time for a coffee and a notebook." }),
  door: () => ({ name: "Door", what: "The way in. You came through it alone, with five crates of tools." }),
  rail: (_, s) => ({ name: "Hand-off rail", what: "How the agents collaborate: a carrier takes each finished piece from one robot to the next, without you in the middle.", live: [s.hops.length ? s.hops.map((h) => ROLES[h.from].id + " → " + ROLES[h.to].id + " · " + h.kind).join(" · ") : "No carrier moving", s.handoffs + " hand-offs so far"] }),
  carrier: (_, s) => ({ name: "Rail carrier", what: "Carries a canister of work between robots: a spec, a mockup, a build, a bug report or a release.", live: [s.hops.length + " moving now"] }),
  line: (i, s) => ({ name: ROLES[i].id + " floor line", what: "The reporting line from " + ROLES[i].name.toLowerCase() + " to you. Your goals go out along it; its reports come back.", live: [s.agents[i].reports + " reports in"] }),
  pad: (_, s) => ({ name: "Scan pad", what: "You stand at the hub. Every floor line ends at a port on its rim; a port's lamp lights when a report comes in.", live: [s.reports + " reports received"] }),
  post: () => ({ name: "Scanner post", what: "One of three posts that carry the scan ring." }),
  person: (_, s) => ({ name: "You", what: "The one person. You set the goals, read the reports on your tablet and decide what ships. Everything else is delegated.", live: [s.online ? "Directing " + s.online + " agents · " + s.goals + " goals set" : s.phase === "scan" ? "Being scanned" : "Alone, with five crates of tools"] }),
  robot: (i, s) => ({ name: ROLES[i].id + " · " + ROLES[i].name, what: "A copy of your persona in a robot body. It " + ROLES[i].job + ", hands its work to the next robot on the rail and reports to you.", live: [doing(i, s)] }),
  display: (i, s) => ({ name: ROLES[i].id + " chest display", what: "Its log fills as it works; the bar is the current step's progress. The lit dot is your persona.", live: [doing(i, s)] }),
  beacon: (i, s) => ({ name: ROLES[i].id + " beacon", what: "Lit while it works, and briefly when a carrier arrives.", live: [s.agents[i].job ? "Lit" : "Dark"] }),
  dock: (i, s) => ({ name: ROLES[i].id + " dock", what: "The print bed the copy is printed on, fed by its floor line.", live: [doing(i, s)] }),
  crate: (i, s) => ({ name: ROLES[i].id + " crate", what: "Holds the " + ROLES[i].tool + ": the tool that makes a copy of you into a " + ROLES[i].name.toLowerCase() + ".", live: [s.spawn[i].tool >= 1 ? "Unpacked" : s.spawn[i].lid > 0 ? "Opening" : "Sealed"] }),
  lid: (i, s) => ({ name: ROLES[i].id + " crate lid", what: "Lifted off and set down on the floor when the robot unpacks its tool." }),
  tool: (i, s) => ({ name: ROLES[i].id + " · " + ROLES[i].tool, what: toolWhat(i), live: [doing(i, s)] }),
};
function toolWhat(i) {
  return ["Tickets for each goal move from to do, to doing, to done.", "The mockup draws itself while the designer works.", "Code types out line by line.", "The lamp scans the board; green is a pass, red a bug sent back to DEV.", "Its lamps run while it deploys; one row lights per release."][i];
}
function clockText(t) { const h = 9 + (t / LOOP) * 9; const m = Math.floor((h % 1) * 60); return Math.floor(h) + ":" + String(m).padStart(2, "0"); }
let tipState = null, lastTip = "", hideAt = 0;
function pick(x, y) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el === svg || !svg.contains(el)) break;
    let part = el.closest("[data-tip]");
    while (part && +(part.closest("[opacity]")?.getAttribute("opacity") ?? 1) < 0.05) part = part.parentNode.closest("[data-tip]");
    if (part) return part;
  }
  return null;
}
function showTip() {
  const part = tipState.part, i = part.dataset.i !== undefined ? +part.dataset.i : undefined;
  const t = TIPS[part.dataset.tip](i, stateAt(now));
  const html = "<b>" + t.name + "</b>" + (t.what ? "<p>" + t.what + "</p>" : "") + (t.live || []).map((s) => '<p class="om-tip-live">' + s + "</p>").join("");
  if (html !== lastTip) { tipEl.innerHTML = html; lastTip = html; }
  tipEl.hidden = false;
  const box = plate.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let x = tipState.x - box.left + 14, y = tipState.y - box.top + 16;
  if (x + w > box.width - 8) x = Math.max(8, tipState.x - box.left - w - 14);
  if (y + h > box.height - 8) y = Math.max(8, tipState.y - box.top - h - 12);
  tipEl.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
}
function setTip(next) {
  const was = tipState && tipState.part, part = next && next.part;
  if (was !== part) { if (was) was.classList.remove("om-tipped"); if (part) part.classList.add("om-tipped"); }
  tipState = next;
  if (tipState) showTip(); else tipEl.hidden = true;
}
stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  const part = pick(event.clientX, event.clientY);
  setTip(part ? { part, x: event.clientX, y: event.clientY } : null);
});
stage.addEventListener("pointerleave", (event) => { if (event.pointerType !== "touch") setTip(null); });
stage.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch") return;
  const part = pick(event.clientX, event.clientY);
  setTip(part ? { part, x: event.clientX, y: event.clientY } : null);
  clearTimeout(hideAt); hideAt = setTimeout(() => setTip(null), 3500);
});
const partsNow = () => qa("[data-tip]").filter((el) => +(el.closest("[opacity]")?.getAttribute("opacity") ?? 1) >= 0.05);
stage.addEventListener("keydown", (event) => {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Escape"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "Escape") return setTip(null);
  const parts = partsNow(), step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  let n = tipState ? parts.indexOf(tipState.part) : -1;
  n = n < 0 ? (step > 0 ? 0 : parts.length - 1) : (n + step + parts.length) % parts.length;
  const part = parts[n], r = part.getBoundingClientRect();
  setTip({ part, x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const t = TIPS[part.dataset.tip](part.dataset.i !== undefined ? +part.dataset.i : undefined, stateAt(now));
  srEl.textContent = t.name + ". " + t.what + " " + (t.live || []).join(". ");
});

range.max = String(LOOP);
window.__figure = { stateAt, jump, get now() { return now; }, LOOP, CHAPTERS };
show();
`;

const panelHtml = `<div class="om-panel" role="group" aria-label="Timeline">
<div class="om-row">${M.CHAPTERS.map((c, j) => `<button type="button" data-chapter="${j}" aria-keyshortcuts="${j + 1}" aria-pressed="false">${j + 1} · ${c.name}</button>`).join("")}<button type="button" data-play aria-pressed="true" aria-keyshortcuts="Space" class="om-play">Pause</button></div>
<div class="om-row"><span class="om-label">Day</span><input type="range" min="0" max="${M.LOOP.toFixed(2)}" step="0.01" value="0" aria-label="Scrub through the day">
<span class="om-ticks" aria-hidden="true">${M.CHAPTERS.map((c) => `<i style="left:${((c.t / M.LOOP) * 100).toFixed(2)}%"></i>`).join("")}</span></div>
</div>`;
const body = k.plateHtml({
  fig: "Fig 1",
  title: "One-person studio",
  hint: "Point at a part · keys 1 2 3",
  readout: "1 person · 5 crates sealed",
  keys: [
    { mark: "lit", label: "Your persona: the badge you wear, the scan ring that copies it, the print plane that builds each robot, and every message on the floor lines" },
    { mark: "raised", label: "Crates: one tool each, unpacked by the robot it belongs to" },
    { mark: "edge", label: "Floor lines run from each robot to you (reports); the rail runs robot to robot (hand-offs)" },
  ],
  caption:
    "How one person becomes a team. 1 · You start alone in an empty room with five sealed crates of tools. 2 · The scan ring copies your persona (your goals, taste and judgment, the lit badge); it runs out along the floor lines, and each dock prints a robot that carries it. Each robot opens its own crate and takes up its tool: the project manager a kanban board, the designer an easel, the developer a terminal, the tester an inspection lamp, ops a server rack. 3 · You set a goal and send it to the PM. From there the agents collaborate with each other on the rail: spec to design, mockup to code, build to test (a failed test goes back to DEV with a bug), release to ops. After every step a robot reports to you along its floor line, and your tablet shows what each one is doing. You decide; they do the work. Four goals ship in one day on the wall clock. Press 1, 2 or 3 for a chapter, space to pause, or drag the day.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="One-person studio: press 1, 2 or 3 to jump to a chapter, space to pause, arrow keys to walk through the parts" aria-describedby="om-tip">${svg}</div>`,
}).replace("</div></div><figcaption", `</div></div>${panelHtml}<figcaption`);

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
.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]::after{content:"_";animation:om-caret 1s steps(1) infinite}
@keyframes om-caret{50%{opacity:0}}
.iso[data-theme="cyber"] .iso-line[data-tone="lit"]{filter:drop-shadow(0 0 1.2px #ff4fd8) drop-shadow(0 0 3px #ff4fd866)}
.iso[data-theme="cyber"] .iso-line.iso-edge[data-tone="hi"]{filter:drop-shadow(0 0 1.4px #00e5ffaa)}
.iso[data-theme="cyber"] .iso-solid[data-lit]>.iso-edge{filter:drop-shadow(0 0 2px #ff4fd8) drop-shadow(0 0 5px #ff4fd880)}
.iso[data-theme="cyber"] .iso-face-text{filter:drop-shadow(0 0 1px #00e5ff99)}
.iso[data-theme="cyber"] .om-line{stroke-dasharray:1 2.2;opacity:.8}
.iso[data-theme="cyber"] .iso-halo{filter:blur(14px)}
.iso[data-theme="cyber"] .iso-legend{color:#4f9fab}
.iso[data-theme="cyber"] .iso-caption{color:#5f8f99}
@media (prefers-reduced-motion:reduce){.iso[data-theme="cyber"] .iso-plate-corner[data-corner="readout"]::after{animation:none}}
`;
const FIG_CSS = `
.om-glass{fill:var(--anatomy-shade-0)}
.om-pit{fill:var(--anatomy-shade-0)}
.om-led-off circle,.om-led-off rect,circle.om-led-off{fill:var(--anatomy-faint)}
.om-led-on circle,circle.om-led-on,rect.om-led-on{fill:var(--anatomy-hi)}
circle.om-led-lit{fill:var(--anatomy-lit)}
.om-led-bar rect{fill:var(--anatomy-lit)}
.om-badge,.om-badge-dot{fill:var(--anatomy-lit)}
.om-eye{fill:var(--anatomy-faint)}
.om-eye[data-on="1"]{fill:var(--anatomy-hi)}
.om-bar-off{fill:var(--anatomy-faint)}
.om-bar-on{fill:var(--anatomy-lit)}
.om-hub{fill:var(--anatomy-hi)}
.om-hand{stroke-width:.9px}
.om-print{stroke-width:1.1px}
.om-stencil text{font-weight:700;letter-spacing:.06em}
.om-card{fill:var(--anatomy-lo)}
.om-card[data-on="1"]{fill:var(--anatomy-lit)}
.om-draw{fill:none}
.om-pen{fill:var(--anatomy-lit)}
.om-code{fill:var(--anatomy-mid)}
.om-cursor{fill:var(--anatomy-hi)}
.om-pass{fill:#3ee08a}
.om-fail{fill:#ff5a6a}
.om-packet{fill:var(--anatomy-lit);opacity:.35}
.om-packet-core{fill:var(--anatomy-lit)}
[data-kind="out"] .om-packet,[data-kind="out"] .om-packet-core{fill:var(--anatomy-hi)}
[data-carrier][data-kind="bug"] [data-band] .iso-line{stroke:#ff5a6a}
.om-tipped .iso-line.iso-edge{stroke:var(--anatomy-hi)}
.om-tip{position:absolute;left:0;top:0;z-index:5;width:max-content;max-width:min(260px,calc(100% - 16px));padding:8px 10px 9px;pointer-events:none;background:var(--anatomy-card);border:1px solid var(--anatomy-mid);box-shadow:0 6px 20px rgba(0,0,0,.35);font-family:var(--anatomy-mono);font-size:11px;line-height:1.45;color:var(--anatomy-text);text-align:left}
.om-tip[hidden]{display:none}
.om-tip b{display:block;margin-bottom:3px;color:var(--anatomy-strong);font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase}
.om-tip p{margin:0;color:var(--anatomy-muted)}
.om-tip .om-tip-live{margin-top:4px;color:var(--anatomy-text);font-variant-numeric:tabular-nums}
.om-tip .om-tip-live::before{content:"";display:inline-block;width:5px;height:5px;margin-right:6px;border-radius:50%;background:var(--anatomy-lit);vertical-align:1px}
.om-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.iso[data-theme="light"] .om-tip{box-shadow:0 6px 20px rgba(0,0,0,.12)}
.iso[data-theme="cyber"] .om-tip{background:#050c18f2;border-color:#1a8c9c;box-shadow:0 0 0 3px #03050b,0 0 18px #00e5ff26,inset 0 0 18px #00e5ff0d}
.iso[data-theme="cyber"] .om-tip b{text-shadow:0 0 6px #21d8ee80}
.iso[data-theme="cyber"] .om-tip .om-tip-live::before{box-shadow:0 0 5px #ff4fd8}
.iso[data-theme="cyber"] .om-tipped .iso-line.iso-edge{filter:drop-shadow(0 0 1.4px #00e5ff)}
.om-panel{display:grid;gap:8px;margin-top:12px;font-family:var(--anatomy-mono);font-size:11px;letter-spacing:.04em}
.om-row{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.om-label{min-width:3.5em;color:var(--anatomy-muted);text-transform:uppercase;letter-spacing:.1em}
.om-panel button{font:inherit;color:var(--anatomy-text);background:var(--anatomy-card);border:1px solid var(--anatomy-lo);border-radius:0;padding:5px 10px;cursor:pointer;transition:border-color .15s}
.om-panel button:hover{border-color:var(--anatomy-hi)}
.om-panel button[aria-pressed="true"]{border-color:var(--anatomy-mid);color:var(--anatomy-strong)}
.om-panel button:focus-visible,.om-panel input:focus-visible{outline:1px solid var(--anatomy-hi);outline-offset:2px}
.om-panel .om-play{margin-left:auto}
.om-panel .om-play::before{content:"";display:inline-block;width:6px;height:6px;margin-right:7px;border:1px solid var(--anatomy-mid);border-radius:50%;vertical-align:1px}
.om-panel .om-play[aria-pressed="true"]::before{background:var(--anatomy-lit);border-color:var(--anatomy-lit)}
.om-panel input[type=range]{flex:1;min-width:160px;accent-color:var(--anatomy-lit);margin:0}
.om-ticks{position:absolute;left:calc(3.5em + 6px);right:0;bottom:-3px;height:4px;pointer-events:none}
.om-ticks i{position:absolute;width:1px;height:4px;background:var(--anatomy-mid)}
.iso[data-theme="cyber"] .om-panel button{border-color:#14606f;box-shadow:inset 0 0 12px #00e5ff0a}
.iso[data-theme="cyber"] .om-panel button:hover{border-color:#21d8ee;box-shadow:0 0 8px #00e5ff33,inset 0 0 12px #00e5ff14}
.iso[data-theme="cyber"] .om-glass,.iso[data-theme="cyber"] .om-pit{fill:#02060c}
.iso[data-theme="cyber"] .om-led-off circle,.iso[data-theme="cyber"] .om-led-off rect{fill:#0b2a35}
.iso[data-theme="cyber"] .om-led-on,.iso[data-theme="cyber"] circle.om-led-on,.iso[data-theme="cyber"] .om-eye[data-on="1"]{filter:drop-shadow(0 0 0.8px #00e5ff) drop-shadow(0 0 2px #00e5ff88)}
.iso[data-theme="cyber"] .om-led-bar,.iso[data-theme="cyber"] .om-badge,.iso[data-theme="cyber"] .om-badge-dot,.iso[data-theme="cyber"] .om-bar-on,.iso[data-theme="cyber"] circle.om-led-lit{filter:drop-shadow(0 0 0.8px #ff4fd8) drop-shadow(0 0 2px #ff4fd888)}
.iso[data-theme="cyber"] .om-packet-core{filter:drop-shadow(0 0 1.5px #ff4fd8)}
.iso[data-theme="cyber"] [data-kind="out"] .om-packet-core{filter:drop-shadow(0 0 1.5px #00e5ff)}
.iso[data-theme="light"] .om-pass{fill:#14a35a}
.iso[data-theme="light"] .om-fail{fill:#d8304a}
`;
const name = theme === "light" ? "one-man-army-light.html" : theme === "dark" ? "one-man-army-classic.html" : "one-man-army.html";
const page = k.pageHtml({ title: "One-person studio", theme, body, script: kitScript() + live }).replace("</style>", (CYBER ? CYBER_CSS : "") + FIG_CSS + "</style>");
writeFileSync(join(HERE, name), page);
console.log("wrote", name, (page.length / 1024).toFixed(0) + " KB");
