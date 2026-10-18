"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const NOISE = "░▒▓█";
/** Time for the print head to sweep from the first column to the last. */
const SWEEP_MS = 900;
/** How long each cell flickers through noise before settling. */
const SETTLE_MS = 220;
/** Frame interval: a terminal-like 25fps rather than a smooth 60. */
const TICK_MS = 40;

/** The art at `elapsed` ms into a print: blank ahead of the sweep, noise at it, final behind it. */
function frame(rows: string[][], cols: number, elapsed: number): string {
  return rows
    .map((row) =>
      row
        .map((ch, x) => {
          if (ch === " ") return ch;
          const reach = (x / cols) * SWEEP_MS;
          if (elapsed < reach) return " ";
          if (elapsed < reach + SETTLE_MS) {
            return NOISE[Math.floor(Math.random() * NOISE.length)];
          }
          return ch;
        })
        .join(""),
    )
    .join("\n");
}

/**
 * Block-glyph figlet art scaled to fill its container, with a glint sweeping
 * across it. After the boot screen it prints in column by column; hovering
 * replays the print. Like ScrambleText, frames are written straight to the DOM
 * and `art` is rendered as children so it is present before hydration.
 */
export function AsciiLogo({ art }: { art: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const reduce = useReducedMotion();
  const rows = art.split("\n").map((l) => [...l]);
  const cols = Math.max(...rows.map((r) => r.length));

  function print() {
    const el = ref.current;
    if (!el || reduce) return;
    clearInterval(timer.current);
    const start = performance.now();
    timer.current = setInterval(() => {
      const elapsed = performance.now() - start;
      if (elapsed >= SWEEP_MS + SETTLE_MS) {
        clearInterval(timer.current);
        el.textContent = art;
        return;
      }
      el.textContent = frame(rows, cols, elapsed);
    }, TICK_MS);
  }

  // Print in as the boot screen hands over; it only runs once per session.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !document.documentElement.dataset.boot) return;
    el.textContent = frame(rows, cols, -1);
    window.addEventListener("cyber:booted", print, { once: true });
    return () => {
      window.removeEventListener("cyber:booted", print);
      clearInterval(timer.current);
      el.textContent = art;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rows, cols and print derive from art
  }, [art, reduce]);

  return (
    // One monospace cell is 0.6em wide, so this font size makes the widest row fill the container.
    <div className="@container" onPointerEnter={print}>
      <pre
        ref={ref}
        aria-hidden
        className="logo-glint leading-none"
        style={{ fontSize: `min(${(100 / (cols * 0.6)).toFixed(3)}cqw, 14px)` }}
      >
        {art}
      </pre>
    </div>
  );
}
