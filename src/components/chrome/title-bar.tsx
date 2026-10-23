"use client";

import Link from "next/link";
import { sections } from "@/lib/content";
import type { NavLink } from "@/lib/docs";
import { useActiveSection } from "../tui/use-active-section";

/**
 * Window title: `you@cybernetics: <path>` follows the section you're reading.
 * `links` are the reading sections (blog, docs, guides); hidden on phones, where the
 * status bar's palette lists them instead.
 */
export function TitleBar({ links = [] }: { links?: NavLink[] }) {
  const active = useActiveSection();
  const path = sections.find((s) => s.id === active)?.path ?? "~";

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
          <nav aria-label="Read" className="hidden items-center gap-3 sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-dim transition-colors hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <a
          href="/register"
          className="bg-accent px-1.5 font-semibold text-accent-fg transition-colors hover:bg-fg hover:text-bg"
        >
          [register<span className="hidden sm:inline"> — early access</span>]
        </a>
      </div>
    </header>
  );
}
