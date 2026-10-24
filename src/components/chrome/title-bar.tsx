"use client";

import Link from "next/link";
import { sections } from "@/lib/content";
import type { NavLink } from "@/lib/docs";
import { localePath } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { LangToggle } from "./lang-toggle";
import { ThemeToggle } from "./theme-toggle";
import { useActiveSection } from "../tui/use-active-section";

/**
 * Window title: `you@cybernetics: <path>` follows the section you're reading.
 * `links` are the site sections (product, integrations, docs, …); hidden on phones, where
 * the status bar's palette lists them instead.
 */
export function TitleBar({ links = [] }: { links?: NavLink[] }) {
  const active = useActiveSection();
  const path = sections.find((s) => s.id === active)?.path ?? "~";
  const locale = useLocale();
  const zh = locale === "zh";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
      <div className="flex h-9 items-center gap-3 px-3 text-xs sm:px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-fg/70" />
          <span className="size-2.5 rounded-full bg-fg/40" />
          <span className="size-2.5 rounded-full bg-fg/20" />
        </div>
        <a href="#top" className="hidden text-dim hover:text-fg sm:inline">
          cybernetics
        </a>
        <p className="min-w-0 flex-1 truncate text-center" aria-live="off">
          <span className="text-accent">you@cybernetics</span>
          <span className="text-dim">: </span>
          <span className="text-data">{path}</span>
        </p>
        {links.length > 0 && (
          <nav aria-label={zh ? "网站" : "Site"} className="hidden items-center gap-3 sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-dim transition-colors hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <span className="hidden sm:inline">
          <LangToggle className="text-xs" />
        </span>
        <span className="sm:hidden">
          <LangToggle compact className="text-xs" />
        </span>
        <span className="hidden sm:inline">
          <ThemeToggle className="text-xs" />
        </span>
        <span className="sm:hidden">
          <ThemeToggle compact className="text-xs" />
        </span>
        <a
          href={localePath(locale, "/register")}
          className="bg-accent px-1.5 font-semibold text-accent-fg transition-colors hover:bg-fg hover:text-bg"
        >
          [{zh ? "注册" : "register"}<span className="hidden sm:inline">{zh ? " — 抢先体验" : " — early access"}</span>]
        </a>
      </div>
    </header>
  );
}
