import Link from "next/link";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { TuiButton } from "@/components/tui/tui-button";
import { localePath, type Locale } from "@/lib/i18n";
import { siteLinks } from "@/lib/nav";

/**
 * The reading pages' header: home, the site sections, the language and theme switches,
 * and the register button. `current` is the section's English path (e.g. "/guides"),
 * marked as the current page; the register page passes "/register" to drop its own button.
 */
export function SiteNav({ locale, current, className = "" }: { locale: Locale; current?: string; className?: string }) {
  const zh = locale === "zh";
  const here = current && localePath(locale, current);
  const register = localePath(locale, "/register");
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
      <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
      <nav aria-label={zh ? "网站" : "Site"} className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
        {siteLinks(locale).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.href === here ? "page" : undefined}
            className={l.href === here ? "text-fg" : "text-dim transition-colors hover:text-fg"}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <span className="ml-auto inline-flex flex-wrap items-center gap-3">
        <PrefToggles />
        {here !== register && <TuiButton href={register} label={zh ? "注册" : "register"} primary />}
      </span>
    </div>
  );
}
