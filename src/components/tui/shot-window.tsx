"use client";

import { useState } from "react";
import type { Shot } from "@/lib/content";
import { Box } from "./box";

/**
 * Screenshots in a window frame with tmux-style tabs. The app UIs are dark, so each one
 * sits in a dark "monitor" inside the light card — framed on purpose, not clashing.
 */
export function ShotWindow({
  shots,
  tone,
  name,
}: {
  shots: Shot[];
  tone: string;
  name: string;
}) {
  const [active, setActive] = useState(0);
  const shot = shots[active];

  return (
    <Box
      term
      tone={tone}
      title={`${name} — ${shot.label}`}
      bodyClassName="flex flex-col"
    >
      <div className="bg-[#0a0a0a] p-1.5 sm:p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={shot.file}
          src={`/screens/${shot.file}`}
          alt={`${name}: ${shot.caption}`}
          width={1920}
          height={1080}
          loading="lazy"
          className="flicker-in block h-auto w-full grayscale"
        />
      </div>
      <p
        className="border-t border-line px-3 py-2 text-xs text-dim"
        aria-live="polite"
      >
        <span style={{ color: tone }}>›</span> {shot.caption}
      </p>
      {shots.length > 1 && (
        <div
          role="tablist"
          aria-label={`${name} screenshots`}
          className="flex flex-wrap border-t border-line bg-bg-alt text-xs"
        >
          {shots.map((s, i) => (
            <button
              key={s.file}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 transition-colors ${i === active ? "bg-fg text-bg" : "text-dim hover:text-fg"}`}
            >
              {i + 1}:{s.label}
              {i === active ? "*" : ""}
            </button>
          ))}
        </div>
      )}
    </Box>
  );
}
