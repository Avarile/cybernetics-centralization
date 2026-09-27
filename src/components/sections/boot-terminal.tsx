"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { RotateCcw } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { BOOT_COMMAND, BOOT_DONE, bootSequence, tone, type ModuleId } from "@/lib/content";
import { whenBooted } from "@/lib/prefs";
import { Bar, Cursor } from "../tui/bits";
import { Box } from "../tui/box";

const BAR = 10;
const TYPE_MS = 35;
const BAR_STEP_MS = 55;

type State = {
  typed: number; // characters of BOOT_COMMAND shown
  lines: number; // module lines visible
  fill: number; // bar cells filled on the newest line
  done: boolean;
};

const EMPTY: State = { typed: 0, lines: 0, fill: 0, done: false };
const FULL: State = { typed: BOOT_COMMAND.length, lines: bootSequence.length, fill: BAR, done: true };

/**
 * Types `cyborgize --subject you`, links each module with a progress bar,
 * and reports progress so the hero graph and headline can react.
 */
export function BootTerminal({
  onLink,
  onDone,
  onRestart,
}: {
  onLink: (id: ModuleId) => void;
  onDone: () => void;
  onRestart: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>(EMPTY);
  const [run, setRun] = useState(0);
  const s = reduce ? FULL : state;

  const link = useEffectEvent(onLink);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    if (reduce) {
      bootSequence.forEach((b) => link(b.id));
      done();
    }
  }, [reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setState(EMPTY);
      await whenBooted();
      await wait(700);
      for (let i = 1; i <= BOOT_COMMAND.length; i++) {
        if (cancelled) return;
        setState((st) => ({ ...st, typed: i }));
        await wait(TYPE_MS);
      }
      await wait(250);
      for (let l = 0; l < bootSequence.length; l++) {
        if (cancelled) return;
        setState((st) => ({ ...st, lines: l + 1, fill: 0 }));
        for (let f = 1; f <= BAR; f++) {
          await wait(BAR_STEP_MS + Math.random() * 40);
          if (cancelled) return;
          setState((st) => ({ ...st, fill: f }));
        }
        link(bootSequence[l].id);
        await wait(180);
      }
      if (cancelled) return;
      setState((st) => ({ ...st, done: true }));
      done();
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, reduce, run]);

  function restart() {
    onRestart();
    setRun((r) => r + 1);
  }

  return (
    <div ref={ref}>
      <Box
        term
        title="tty1 — cyborgize"
        bodyClassName="glow min-h-[196px] p-4 text-[12.5px] leading-relaxed"
        right={
          <button
            type="button"
            onClick={restart}
            disabled={!s.done || !!reduce}
            aria-label="Run the sequence again"
            className="flex items-center gap-1 text-dim transition-opacity hover:text-fg disabled:opacity-0"
          >
            <RotateCcw className="size-3" aria-hidden /> rerun
          </button>
        }
      >
        <p>
          <span className="text-accent">❯</span> {BOOT_COMMAND.slice(0, s.typed)}
          {s.typed < BOOT_COMMAND.length && <Cursor />}
        </p>

        {bootSequence.slice(0, s.lines).map((b, i) => {
          const fill = i < s.lines - 1 || s.done ? BAR : s.fill;
          return (
            <p key={b.id} className="flex gap-2 whitespace-pre">
              <span className="text-dim">▸</span>
              <span className="w-[17ch] shrink-0">link {b.label}</span>
              <Bar fill={fill} cells={BAR} tone={tone[b.id]} />
              <span
                className={`hidden truncate text-dim transition-opacity sm:inline ${fill === BAR ? "opacity-100" : "opacity-0"}`}
              >
                {b.detail}
              </span>
            </p>
          );
        })}

        {s.done && (
          <>
            <p className="mt-1">
              <span className="text-proj">✓</span> {BOOT_DONE}
            </p>
            <p>
              <span className="text-accent">❯</span> <Cursor />
            </p>
          </>
        )}
      </Box>
    </div>
  );
}
