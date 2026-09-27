"use client";

import { useEffect, useState } from "react";

/** `[██████░░░░]` progress bar. */
export function Bar({ fill, cells = 10, tone }: { fill: number; cells?: number; tone?: string }) {
  const f = Math.max(0, Math.min(cells, fill));
  return (
    <span style={{ color: tone }} className="whitespace-pre">
      [{"█".repeat(f)}
      <span className="opacity-25">{"░".repeat(cells - f)}</span>]
    </span>
  );
}

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Braille spinner, the classic CLI loading indicator. */
export function Spinner({ className = "text-dim" }: { className?: string }) {
  const [f, setF] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setF((n) => (n + 1) % FRAMES.length), 80);
    return () => clearInterval(t);
  }, []);
  return <span className={className}>{FRAMES[f]}</span>;
}

export function Cursor() {
  return <span aria-hidden className="cursor-block" />;
}
