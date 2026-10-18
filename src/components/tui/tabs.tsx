"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export type Tab = {
  id: string;
  label: string;
  tone?: string;
  content: ReactNode;
};

/**
 * tmux-style tab strip over a single panel. Only the active panel is mounted, so
 * inactive figures and iframes cost nothing until opened.
 */
export function Tabs({
  tabs,
  label,
  className = "",
}: {
  tabs: Tab[];
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const current = tabs[active];

  function onKeyDown(e: KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex flex-wrap border-b border-line text-xs sm:text-[13px]"
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`${uid}-tab-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`${uid}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 transition-colors ${
              i === active ? "bg-fg text-bg" : "text-dim hover:text-fg"
            }`}
          >
            {i + 1}:{t.label}
            {i === active ? "*" : ""}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${active}`}
        className="pt-6"
      >
        {current.content}
      </div>
    </div>
  );
}
