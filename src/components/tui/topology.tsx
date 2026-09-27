"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { modules, tone, type ModuleId } from "@/lib/content";

/*
 * The hero's ASCII network, painted onto a character grid:
 *
 *                ┌───────────────┐
 *                │  data-centre  │
 *                │ what you know ├┄┄┄┄┄┄┄╮
 *                └───────┬───────┘       ┆
 *                        │               ┆
 *   ┌─────────────┐  ┌───┴───┐  ┌────────┴────┐
 *   │     crm     ├──┤  YOU  ├──┤  projects   │
 *   │ your people │  └───┬───┘  │ what you do │
 *   └─────────────┘      │      └─────────────┘
 *                ┌───────┴───────┐
 *                │    agents     │
 *                │ acts for you  │
 *                └───────────────┘
 *
 * Every cell records its owner so modules can light up as they're linked,
 * and packets can travel along the real line cells.
 */

type Owner = ModuleId | "you" | "chord-data" | "chord-proj";
type Kind = "line" | "name" | "role";
type Cell = { ch: string; owner: Owner | null; kind: Kind };
type Pt = [number, number];

const W = 47;
const H = 15;

function paint() {
  const g: Cell[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({ ch: " ", owner: null, kind: "line" as Kind })),
  );
  const put = (x: number, y: number, ch: string, owner: Owner, kind: Kind = "line") => {
    g[y][x] = { ch, owner, kind };
  };
  const box = (x: number, y: number, w: number, h: number, owner: Owner, name: string, role?: string) => {
    for (let i = 1; i < w - 1; i++) {
      put(x + i, y, "─", owner);
      put(x + i, y + h - 1, "─", owner);
    }
    for (let j = 1; j < h - 1; j++) {
      put(x, y + j, "│", owner);
      put(x + w - 1, y + j, "│", owner);
    }
    put(x, y, "┌", owner);
    put(x + w - 1, y, "┐", owner);
    put(x, y + h - 1, "└", owner);
    put(x + w - 1, y + h - 1, "┘", owner);
    const label = (row: number, text: string, kind: Kind) => {
      const start = x + Math.floor((w - text.length) / 2);
      [...text].forEach((c, i) => put(start + i, row, c, owner, kind));
    };
    label(y + 1, name, "name");
    if (role) label(y + 2, role, "role");
  };

  box(15, 0, 17, 4, "data", "data-centre", "what you know");
  box(0, 6, 15, 4, "crm", "crm", "your people");
  box(19, 6, 9, 3, "you", "YOU");
  box(32, 6, 15, 4, "proj", "projects", "what you do");
  box(15, 11, 17, 4, "agent", "agents", "acts for you");

  // Spokes (owned by the module, so they light with it).
  put(23, 3, "┬", "data");
  put(23, 4, "│", "data");
  put(23, 5, "│", "data");
  put(23, 6, "┴", "data");
  put(14, 7, "├", "crm");
  for (let x = 15; x <= 18; x++) put(x, 7, "─", "crm");
  put(19, 7, "┤", "crm");
  put(27, 7, "├", "proj");
  for (let x = 28; x <= 31; x++) put(x, 7, "─", "proj");
  put(32, 7, "┤", "proj");
  put(23, 8, "┬", "agent");
  put(23, 9, "│", "agent");
  put(23, 10, "│", "agent");
  put(23, 11, "┴", "agent");

  // Data Centre ┄ Projects integration.
  put(31, 2, "├", "chord-data");
  for (let x = 32; x <= 38; x++) put(x, 2, "┄", x < 36 ? "chord-data" : "chord-proj");
  put(39, 2, "╮", "chord-proj");
  for (let y = 3; y <= 5; y++) put(39, y, "┆", "chord-proj");
  put(39, 6, "┴", "chord-proj");

  return g;
}

const GRID = paint();

const range = (a: number, b: number) =>
  a <= b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : Array.from({ length: a - b + 1 }, (_, i) => a - i);

// Packet routes: context flows into you; action flows out to agents.
const FLOWS: { id: ModuleId; path: Pt[] }[] = [
  { id: "data", path: range(3, 6).map((y) => [23, y] as Pt) },
  { id: "crm", path: range(14, 19).map((x) => [x, 7] as Pt) },
  { id: "proj", path: range(32, 27).map((x) => [x, 7] as Pt) },
  { id: "agent", path: range(8, 11).map((y) => [23, y] as Pt) },
  { id: "data", path: [...range(31, 39).map((x) => [x, 2] as Pt), ...range(3, 6).map((y) => [39, y] as Pt)] },
];
const GAP = 9;

function colorOf(owner: Owner | null) {
  if (!owner) return undefined;
  if (owner === "you") return "var(--accent)";
  if (owner === "chord-data") return tone.data;
  if (owner === "chord-proj") return tone.proj;
  return tone[owner];
}

export function Topology({
  linked,
  online,
  flash,
}: {
  linked: ModuleId[];
  online: boolean;
  /** The module linked a moment ago; its cells flash bright once. */
  flash?: ModuleId | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const flowing = online && inView && !reduce;

  useEffect(() => {
    if (!flowing) return;
    const t = setInterval(() => setTick((n) => n + 1), 110);
    return () => clearInterval(t);
  }, [flowing]);

  const lit = (owner: Owner | null) => {
    if (!owner) return false;
    if (owner === "you") return online;
    if (owner === "chord-data" || owner === "chord-proj") return linked.includes("data") && linked.includes("proj");
    return linked.includes(owner);
  };

  // Current packet cells, keyed "x,y".
  const packets = new Map<string, ModuleId>();
  if (flowing) {
    FLOWS.forEach((f, i) => {
      const pos = (tick + i * 4) % (f.path.length + GAP);
      if (pos < f.path.length) packets.set(f.path[pos].join(","), f.id);
    });
  }

  return (
    <div ref={ref} className="min-w-0">
      <pre
        aria-hidden
        className="w-fit select-none text-[10.5px] leading-[1.3] sm:text-[13px] lg:text-[14px]"
      >
        {GRID.map((row, y) => (
          <div key={y}>
            {runs(row, y, packets, lit).map((r, i) => (
              <span
                key={`${i}-${r.key}`}
                className={`${r.on ? "glow" : ""} ${flash && r.owner === flash ? "topo-flash" : ""}`}
                style={{
                  color: r.packet ? tone[r.packet] : r.on ? (r.kind === "role" ? "var(--dim)" : colorOf(r.owner)) : "var(--dim)",
                  opacity: r.owner && !r.on ? 0.35 : 1,
                  fontWeight: r.kind === "name" && r.on ? 600 : undefined,
                }}
              >
                {r.text}
              </span>
            ))}
          </div>
        ))}
      </pre>
      <ul className="sr-only">
        {modules.map((m) => (
          <li key={m.id}>
            {m.name}: {linked.includes(m.id) ? "linked" : "not linked"}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Run = { text: string; owner: Owner | null; kind: Kind; on: boolean; packet?: ModuleId; key: string };

/** Groups a row into spans of identical styling so each row is a handful of elements. */
function runs(row: Cell[], y: number, packets: Map<string, ModuleId>, lit: (o: Owner | null) => boolean): Run[] {
  const out: Run[] = [];
  row.forEach((c, x) => {
    const packet = packets.get(`${x},${y}`);
    const on = lit(c.owner);
    const key = `${c.owner}|${c.kind}|${on}|${packet ?? ""}`;
    const prev = out[out.length - 1];
    if (prev && prev.key === key && !packet) {
      prev.text += c.ch;
    } else {
      out.push({ text: packet ? "●" : c.ch, owner: c.owner, kind: c.kind, on, packet, key });
    }
  });
  return out;
}
