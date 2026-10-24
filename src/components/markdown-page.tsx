import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNav } from "@/components/chrome/site-nav";
import { UntranslatedNote } from "@/components/untranslated-note";
import { getPage, type Post } from "@/lib/blog";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const COPY: Copy<{ updated: string }> = {
  en: { updated: "last updated" },
  zh: { updated: "最后更新" },
};

/** Metadata for a standalone page from `content/pages/`, served at `/<name>`. */
export function markdownPageMetadata(name: string, locale: Locale, og: Partial<Metadata["openGraph"]> = {}): Metadata {
  const page = getPage(name, locale);
  const path = `/${name}`;
  return {
    title: page.seoTitle,
    description: page.dek,
    alternates: alternates(path, locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, path),
      title: page.title,
      description: page.dek,
      images: [defaultOgImage],
      ...og,
    } as Metadata["openGraph"],
    ...(page.draft && { robots: { index: false, follow: false } }),
  };
}

/** A standalone page from `content/pages/` (about, privacy): header, draft notice and body. */
export function MarkdownPage({
  page,
  label,
  locale,
  children,
}: {
  page: Post;
  label: string;
  locale: Locale;
  children?: ReactNode;
}) {
  const t = COPY[locale];
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <SiteNav locale={locale} current={`/${page.slug}`} />

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{label}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      {page.draft && (
        <p role="note" className="mb-8 border border-dashed border-red px-3 py-2 text-xs text-red">
          DRAFT — unlisted, not indexed. Fill in every [YOU: …] line, then set draft: false.
        </p>
      )}
      <UntranslatedNote locale={locale} lang={page.lang} />

      <div lang={HTML_LANG[page.lang]}>
        <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
          <span aria-hidden className="text-dim">
            #{" "}
          </span>
          {page.title}
        </h1>
        {page.dek && <p className="mt-4 text-dim text-pretty">{page.dek}</p>}
        {page.date && (
          <p className="mt-4 text-xs text-dim">
            {t.updated} <time dateTime={page.date}>{page.date}</time>
          </p>
        )}

        <div className="prose-tui mt-12 max-w-[72ch]">{renderMarkdown(page.body, { cta: () => null, locale })}</div>
      </div>
      {children}
      <SiteFooter locale={locale} />
    </main>
  );
}
