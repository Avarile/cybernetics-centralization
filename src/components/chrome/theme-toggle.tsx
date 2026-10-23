"use client";

import { THEMES, toggleTheme, useHtmlData } from "@/lib/prefs";

/**
 * `[ light / cyberpunk ]`: both themes, the current one lit. One click switches.
 * `compact` shows just ◐, for the narrow title bar on phones.
 */
export function ThemeToggle({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const theme = useHtmlData("theme", "light") === "cyberpunk" ? "cyberpunk" : "light";
  const next = theme === "light" ? "cyberpunk" : "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      title={`Switch to ${next} theme`}
      className={`inline-flex items-center whitespace-nowrap px-1 py-0.5 text-sm text-dim transition-colors hover:text-fg ${className}`}
    >
      {compact ? (
        <span aria-hidden className="text-accent">
          ◐
        </span>
      ) : (
        <span aria-hidden>
          [&nbsp;
          {THEMES.map((t, i) => (
            <span key={t}>
              {i > 0 && " / "}
              <span className={t === theme ? "text-accent underline decoration-accent underline-offset-4" : ""}>{t}</span>
            </span>
          ))}
          &nbsp;]
        </span>
      )}
    </button>
  );
}
