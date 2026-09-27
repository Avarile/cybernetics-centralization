"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { sections, type SectionId } from "@/lib/content";
import { Cursor } from "./bits";
import { Prompt } from "./prompt";
import { ScrambleText } from "./scramble-text";

const TYPE_MS = 32;

/**
 * - `static`: server render, or the section was already on screen at load — everything shown.
 * - `pending`: below the fold; command blank, output hidden (space reserved, no layout jump).
 * - `typing` → `done`: the command types itself, then the output flickers in.
 */
type Phase = "static" | "pending" | "typing" | "done";

const RevealedContext = createContext(true);

/** True once a section's output is visible — children use it to start their own animations. */
export function useRevealed() {
  return useContext(RevealedContext);
}

export function TuiSection({
  id,
  title,
  command,
  intro,
  children,
}: {
  id: SectionId;
  title: string;
  command: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const index = sections.findIndex((s) => s.id === id);
  const { win, path } = sections[index];
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [rawPhase, setPhase] = useState<Phase>("static");
  const [rawTyped, setTyped] = useState(command.length);
  // Reduced motion always shows the final state, even if the observer already fired.
  const phase: Phase = reduce ? "static" : rawPhase;
  const typed = reduce ? command.length : rawTyped;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let first = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          // Already on screen at load: leave it static rather than hide what's being read.
          if (entry.isIntersecting) {
            io.disconnect();
            return;
          }
          setPhase("pending");
          setTyped(0);
          return;
        }
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPhase("typing");
        let n = 0;
        timer = setInterval(() => {
          n += 1;
          setTyped(n);
          if (n >= command.length) {
            clearInterval(timer);
            setTimeout(() => setPhase("done"), 180);
          }
        }, TYPE_MS);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [command, reduce]);

  const revealed = phase === "static" || phase === "done";

  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-title`} className="relative">
      <div className="mx-auto max-w-[110ch] px-4 py-16 sm:px-6 md:py-24">
        <div aria-hidden className="mb-8 flex items-center gap-2 text-xs text-dim">
          <span>
            ──[ <span className="text-accent">{index}</span>:{win} ]
          </span>
          <span className="flex-1 border-t border-dashed border-line" />
        </div>

        <h2 id={`${id}-title`} className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
          <span aria-hidden className="text-dim">
            #{" "}
          </span>
          <ScrambleText text={title} replayKey={phase === "typing" ? 1 : undefined} />
        </h2>
        {intro && <p className="mt-4 max-w-[72ch] text-dim text-pretty">{intro}</p>}

        <p className="glow mt-8 flex flex-wrap gap-x-2 text-sm">
          <Prompt path={path} />
          <span className="sr-only">{command}</span>
          <span aria-hidden>
            {command.slice(0, typed)}
            {phase === "typing" && <Cursor />}
          </span>
        </p>

        <div
          className={`mt-5 ${phase === "pending" || phase === "typing" ? "invisible" : ""} ${
            phase === "done" ? "flicker-in" : ""
          }`}
        >
          <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
        </div>
      </div>
    </section>
  );
}
