"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { logLines, logStages, tone } from "@/lib/content";
import { Cursor } from "../tui/bits";
import { Box } from "../tui/box";
import { TuiSection, useRevealed } from "../tui/tui-section";

const STAGE_TONE = { capture: tone.data, structure: tone.proj, delegate: tone.agent };
const START = 4; // lines present on first render
const MAX = 9; // lines kept on screen
const EVERY_MS = 1800;

/** Deterministic timestamps (09:41:00 + 7s per line) so server and client agree. */
function stamp(k: number) {
  const t = 9 * 3600 + 41 * 60 + k * 7;
  const hh = String(Math.floor(t / 3600)).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function Log() {
  return (
    <TuiSection
      id="log"
      title="Capture. Structure. Delegate."
      command="tail -f /var/log/you.log"
    >
      <dl className="mb-8 grid gap-4 text-[13px] md:grid-cols-3">
        {logStages.map((s, i) => (
          <div key={s.stage}>
            <dt>
              <span className="text-dim">0{i + 1} </span>
              <span style={{ color: STAGE_TONE[s.stage] }}>[{s.stage}]</span>
            </dt>
            <dd className="mt-1 text-dim text-pretty">{s.text}</dd>
          </div>
        ))}
      </dl>
      <LogStream />
    </TuiSection>
  );
}

function LogStream() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const revealed = useRevealed();
  const reduce = useReducedMotion();
  const [count, setCount] = useState(START);

  useEffect(() => {
    if (!inView || !revealed || reduce) return;
    const t = setInterval(() => setCount((c) => c + 1), EVERY_MS);
    return () => clearInterval(t);
  }, [inView, revealed, reduce]);

  const first = Math.max(0, count - MAX);
  const visible = Array.from({ length: count - first }, (_, i) => first + i);

  return (
    <div ref={ref}>
      <Box term title="/var/log/you.log" right={<span className="text-proj">● live</span>} bodyClassName="glow min-h-[15.5em] p-4 text-[12.5px] sm:p-5">
        {visible.map((k) => {
          const l = logLines[k % logLines.length];
          return (
            <p key={k} className={`flex gap-3 whitespace-pre ${k >= START ? "flicker-in" : ""}`}>
              <span className="text-dim">{stamp(k)}</span>
              <span className="text-proj">INFO</span>
              <span className="w-[9ch] shrink-0" style={{ color: STAGE_TONE[l.stage] }}>
                {l.stage}
              </span>
              <span className="min-w-0 truncate" style={{ color: k === count - 1 ? tone[l.tone] : undefined }}>
                {l.text}
              </span>
            </p>
          );
        })}
        <Cursor />
      </Box>
    </div>
  );
}
