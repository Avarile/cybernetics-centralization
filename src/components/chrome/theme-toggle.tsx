"use client";

import type { Copy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { THEMES, toggleTheme, useHtmlData, type Theme } from "@/lib/prefs";

const NAMES: Copy<Record<Theme, string>> = {
  en: { light: "light", cyberpunk: "cyberpunk" },
  zh: { light: "浅色", cyberpunk: "赛博朋克" },
};

/**
 * `[ light / cyberpunk ]`: both themes, the current one lit. One click switches.
 * `compact` shows just ◐, for the narrow title bar on phones.
 */
export function ThemeToggle({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const theme = useHtmlData("theme", "light") === "cyberpunk" ? "cyberpunk" : "light";
  const next = theme === "light" ? "cyberpunk" : "light";
  const locale = useLocale();
  const name = NAMES[locale];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={locale === "zh" ? `主题：${name[theme]}。切换到${name[next]}。` : `Theme: ${theme}. Switch to ${next}.`}
      title={locale === "zh" ? `切换到${name[next]}主题` : `Switch to ${next} theme`}
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
              <span className={t === theme ? "text-accent underline decoration-accent underline-offset-4" : ""}>{name[t]}</span>
            </span>
          ))}
          &nbsp;]
        </span>
      )}
    </button>
  );
}
