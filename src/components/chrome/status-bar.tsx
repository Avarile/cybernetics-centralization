"use client";

import { useEffect, useState } from "react";
import { sections } from "@/lib/content";
import { gotoSection, openPalette } from "@/lib/prefs";
import { useActiveSection } from "../tui/use-active-section";

/** tmux-style status line — the site navigation. */
export function StatusBar() {
  const active = useActiveSection();
  const index = sections.findIndex((s) => s.id === active);
  const clock = useClock();

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-50 flex h-7 items-center border-t border-line bg-bg-alt text-xs"
    >
      <span className="flex h-full items-center bg-accent px-2 font-semibold text-accent-fg">[cybernetics]</span>

      {/* Desktop: every window. */}
      <ul className="hidden h-full min-w-0 flex-1 items-center overflow-hidden lg:flex">
        {sections.map((s, i) => {
          const current = s.id === active;
          return (
            <li key={s.id} className="h-full">
              <a
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className={`flex h-full items-center px-2 transition-colors ${
                  current ? "bg-fg text-bg" : "text-dim hover:text-fg"
                }`}
              >
                {i}:{s.win}
                {current ? "*" : " "}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Mobile: current window, tap for the palette. */}
      <button
        type="button"
        onClick={openPalette}
        className="flex h-full min-w-0 flex-1 items-center gap-1 px-2 text-left lg:hidden"
        aria-label="Open command palette to jump to a section"
      >
        <span className="bg-fg px-1 text-bg">
          {index}:{sections[index]?.win}*
        </span>
        <span className="text-dim">
          [{index + 1}/{sections.length}] ▾
        </span>
      </button>

      <div className="flex h-full items-center gap-3 px-2 text-dim">
        <button type="button" onClick={openPalette} className="hidden hover:text-fg sm:inline">
          <span className="text-accent">:</span> cmd
        </button>
        <button type="button" onClick={() => gotoSection("mcp")} className="hidden hover:text-fg md:inline">
          <span className="text-proj">●</span> 3 mcp online
        </button>
        <span className="tabular-nums" suppressHydrationWarning>
          {clock}
        </span>
      </div>
    </nav>
  );
}

function useClock() {
  const [now, setNow] = useState("--:--");
  useEffect(() => {
    const fmt = () =>
      setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    const first = setTimeout(fmt, 0);
    const t = setInterval(fmt, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return now;
}
