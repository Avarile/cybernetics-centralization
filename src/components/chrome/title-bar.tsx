"use client";

import { sections } from "@/lib/content";
import { THEME_LABEL, toggleCrt, toggleTheme, useHtmlData } from "@/lib/prefs";
import { useActiveSection } from "../tui/use-active-section";

/** Window title: `you@cybernetics: <path>` follows the section you're reading. */
export function TitleBar() {
  const active = useActiveSection();
  const path = sections.find((s) => s.id === active)?.path ?? "~";
  const theme = useHtmlData("theme", "dark") ?? "dark";
  const crt = useHtmlData("crt", undefined) === "off" ? "off" : "on";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
      <div className="flex h-9 items-center gap-3 px-3 text-xs sm:px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <a href="#top" className="hidden text-dim hover:text-fg sm:inline">
          cybernetics
        </a>
        <p className="min-w-0 flex-1 truncate text-center" aria-live="off">
          <span className="text-accent">you@cybernetics</span>
          <span className="text-dim">: </span>
          <span className="text-data">{path}</span>
        </p>
        <button
          type="button"
          onClick={() => toggleTheme()}
          className="text-dim hover:text-fg"
          aria-label={`Theme: ${THEME_LABEL[theme]}. Switch theme`}
        >
          [<span className="hidden sm:inline">theme:</span>
          <span className="text-fg">{THEME_LABEL[theme]}</span>]
        </button>
        <button
          type="button"
          onClick={() => toggleCrt()}
          className="hidden text-dim hover:text-fg sm:inline"
          aria-label={`CRT effect ${crt}. Toggle`}
        >
          [crt:<span className="text-fg">{crt}</span>]
        </button>
      </div>
    </header>
  );
}
