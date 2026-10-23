import type { ReactNode } from "react";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { TuiButton } from "@/components/tui/tui-button";
import { tone, type ModuleId } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { docSections, getVisibleDocs, type Doc } from "@/lib/docs";
import { localePath, type Copy, type Locale } from "@/lib/i18n";

const COPY: Copy<{ docs: string; guides: string; nav: string; contents: string; more: string; prev: string; next: string }> = {
  en: {
    docs: "docs",
    guides: "guides",
    nav: "Docs",
    contents: "contents",
    more: "More docs",
    prev: "← previous",
    next: "next →",
  },
  zh: {
    docs: "文档",
    guides: "指南",
    nav: "文档",
    contents: "目录",
    more: "更多文档",
    prev: "← 上一篇",
    next: "下一篇 →",
  },
};

/** Module chips in each module's signal colour. */
export function ModuleBadges({ ids, locale = "en" }: { ids: ModuleId[]; locale?: Locale }) {
  const { modules } = contentFor(locale);
  return (
    <>
      {ids.map((id) => (
        <span key={id} className="border border-line px-1.5" style={{ color: tone[id] }}>
          ● {modules.find((m) => m.id === id)?.name}
        </span>
      ))}
    </>
  );
}

function Sidebar({ current, locale }: { current?: string; locale: Locale }) {
  const docs = getVisibleDocs(locale);
  return (
    <nav aria-label={COPY[locale].nav} className="space-y-6 text-[13px]">
      {docSections(locale).map((s) => {
        const items = docs.filter((d) => d.section === s.id);
        if (!items.length) return null;
        return (
          <div key={s.id}>
            <p className="text-xs text-dim">
              <span className="text-accent">#</span> {s.title.toLowerCase()}
            </p>
            <ul className="mt-2 space-y-1 border-l border-line">
              {items.map((d) => (
                <li key={d.href}>
                  <a
                    href={d.href}
                    aria-current={d.href === current ? "page" : undefined}
                    className={`-ml-px block border-l py-0.5 pl-3 transition-colors ${
                      d.href === current ? "border-accent text-fg" : "border-transparent text-dim hover:text-fg"
                    }`}
                  >
                    {d.title}
                    {d.draft && <span className="ml-2 text-[11px] text-red">draft</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/**
 * The docs frame: top links, the sidebar (a disclosure on phones), and the page itself.
 * `current` is the href of the open doc, for highlighting.
 */
export function DocsShell({ current, locale = "en", children }: { current?: string; locale?: Locale; children: ReactNode }) {
  const t = COPY[locale];
  return (
    <main className="mx-auto max-w-[140ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap gap-3">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
        <TuiButton href={localePath(locale, "/docs")} label={t.docs} />
        <TuiButton href={localePath(locale, "/guides")} label={t.guides} />
        <PrefToggles className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">docs</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <details className="border border-line p-3 lg:hidden">
          <summary className="cursor-pointer text-[13px] text-dim">{t.contents}</summary>
          <div className="mt-4">
            <Sidebar current={current} locale={locale} />
          </div>
        </details>
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar current={current} locale={locale} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}

/** Previous and next doc in sidebar order. */
export function DocPager({ doc, locale = "en" }: { doc: Doc; locale?: Locale }) {
  const t = COPY[locale];
  const docs = getVisibleDocs(locale);
  const i = docs.findIndex((d) => d.href === doc.href);
  const prev = docs[i - 1];
  const next = docs[i + 1];
  if (!prev && !next) return null;
  return (
    <nav aria-label={t.more} className="mt-14 grid gap-4 text-sm sm:grid-cols-2">
      {prev && (
        <a href={prev.href} rel="prev" className="group block border border-line p-4 transition-colors hover:border-accent">
          <span className="text-xs text-dim">{t.prev}</span>
          <span className="mt-1 block group-hover:text-accent">{prev.title}</span>
        </a>
      )}
      {next && (
        <a
          href={next.href}
          rel="next"
          className="group block border border-line p-4 transition-colors hover:border-accent sm:col-start-2 sm:text-right"
        >
          <span className="text-xs text-dim">{t.next}</span>
          <span className="mt-1 block group-hover:text-accent">{next.title}</span>
        </a>
      )}
    </nav>
  );
}
