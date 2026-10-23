"use client";

import { usePathname } from "next/navigation";
import { HTML_LANG, LOCALES, LOCALE_NAME, switchLocalePath } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { ThemeToggle } from "./theme-toggle";

/**
 * `[ en / 中文 ]`: both languages, the current one lit. One click opens the same page
 * in the other language, keeping the query and the section you were reading.
 * `compact` shows just the other language, for the narrow title bar on phones.
 */
export function LangToggle({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const next = locale === "en" ? "zh" : "en";
  const href = switchLocalePath(pathname, next);
  const label = next === "zh" ? "切换到中文" : "Switch to English";

  return (
    <a
      href={href}
      hrefLang={HTML_LANG[next]}
      // A full page load, so the root layout's head script sets <html lang> for the new page.
      onClick={(e) => {
        e.preventDefault();
        window.location.assign(href + window.location.search + window.location.hash);
      }}
      aria-label={label}
      title={label}
      className={`inline-flex items-center whitespace-nowrap px-1 py-0.5 text-sm text-dim transition-colors hover:text-fg ${className}`}
    >
      {compact ? (
        <span aria-hidden className="text-accent">
          {LOCALE_NAME[next]}
        </span>
      ) : (
        <span aria-hidden>
          [&nbsp;
          {LOCALES.map((l, i) => (
            <span key={l}>
              {i > 0 && " / "}
              <span className={l === locale ? "text-accent underline decoration-accent underline-offset-4" : ""}>
                {LOCALE_NAME[l]}
              </span>
            </span>
          ))}
          &nbsp;]
        </span>
      )}
    </a>
  );
}

/** The language and theme switches together, as the reading pages' header shows them. */
export function PrefToggles({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
      <LangToggle />
      <ThemeToggle />
    </span>
  );
}
