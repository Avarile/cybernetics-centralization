import type { Metadata } from "next";
import { InlineCta, SignupCard } from "@/components/blog/signup";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { ModuleBadges } from "@/components/docs/docs-shell";
import { TuiButton } from "@/components/tui/tui-button";
import { UntranslatedNote } from "@/components/untranslated-note";
import { contentFor } from "@/lib/content-i18n";
import { getGuide, getVisibleGuides, headings, type Guide } from "@/lib/docs";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";

const COPY: Copy<{
  all: string;
  docs: string;
  forWho: (who: string[]) => string;
  toc: string;
  tocLabel: string;
  next: string;
}> = {
  en: {
    all: "all guides",
    docs: "docs",
    forWho: (who) => `for ${who.map((w) => w.toLowerCase()).join(", ")}`,
    toc: "# on this page",
    tocLabel: "On this page",
    next: "next guide →",
  },
  zh: {
    all: "全部指南",
    docs: "文档",
    forWho: (who) => `适合${who.join("、")}`,
    toc: "# 本页内容",
    tocLabel: "本页内容",
    next: "下一篇指南 →",
  },
};

export function guideMetadata(slug: string, locale: Locale): Metadata {
  const guide = getGuide(slug, locale);
  if (!guide) return {};
  return {
    title: guide.seoTitle,
    description: guide.dek,
    alternates: alternates(guide.href, locale),
    openGraph: {
      ...baseOpenGraph(locale),
      type: "article",
      url: guide.href,
      title: guide.title,
      description: guide.dek,
      images: [{ url: "/docs/opengraph-image", width: 1200, height: 630, alt: "Cybernetics guides" }],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.dek },
    ...(guide.draft && { robots: { index: false, follow: false } }),
  };
}

export function GuideArticle({ guide, locale }: { guide: Guide; locale: Locale }) {
  const t = COPY[locale];
  const href = `${localePath(locale, "/register")}?utm_source=guides&utm_medium=docs&utm_campaign=docs&utm_content=${guide.slug}`;
  const all = getVisibleGuides(locale);
  const i = all.findIndex((g) => g.slug === guide.slug);
  const next = all[i + 1];
  const toc = headings(guide.body);
  const forWho = contentFor(locale)
    .personas.filter((p) => guide.personas.includes(p.login))
    .map((p) => p.name);

  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      {!guide.draft && (
        <JsonLd
          data={{
            "@type": "Article",
            headline: guide.title,
            description: guide.dek,
            url: absolute(guide.href),
            inLanguage: HTML_LANG[guide.lang],
            ...(guide.updated && { dateModified: guide.updated }),
            author,
            publisher: organization,
          }}
        />
      )}
      <div className="flex flex-wrap gap-3">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
        <TuiButton href={localePath(locale, "/guides")} label={t.all} />
        <TuiButton href={localePath(locale, "/docs")} label={t.docs} />
        <PrefToggles className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">guide</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      {guide.draft && (
        <p role="note" className="mb-8 border border-dashed border-red px-3 py-2 text-xs text-red">
          DRAFT — unlisted, not indexed. Try every step on the demo base, fill in any [YOU: …] line, then draft: false.
        </p>
      )}
      <UntranslatedNote locale={locale} lang={guide.lang} />

      <article>
        <h1 lang={HTML_LANG[guide.lang]} className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
          {guide.title}
        </h1>
        {guide.dek && (
          <p lang={HTML_LANG[guide.lang]} className="mt-4 max-w-[68ch] text-dim text-pretty">
            {guide.dek}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-dim">
          {guide.time && <span className="border border-line px-1.5">{guide.time}</span>}
          <ModuleBadges ids={guide.modules} locale={locale} />
          {forWho.length > 0 && <span>{t.forWho(forWho)}</span>}
        </div>

        {toc.length >= 3 && (
          <nav aria-label={t.tocLabel} className="mt-8 border-l border-line pl-4 text-[13px]">
            <p className="text-xs text-dim">{t.toc}</p>
            <ul className="mt-2 space-y-1">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-dim hover:text-fg">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div lang={HTML_LANG[guide.lang]} className="prose-tui mt-10 max-w-[72ch]">
          {renderMarkdown(guide.body, {
            cta: (text, key) => <InlineCta key={key} text={text} href={href} locale={locale} />,
            locale,
          })}
        </div>
      </article>

      {next && (
        <a href={next.href} className="group mt-14 block border border-line p-4 text-sm transition-colors hover:border-accent">
          <span className="text-xs text-dim">{t.next}</span>
          <span className="mt-1 block group-hover:text-accent">{next.title}</span>
        </a>
      )}

      <SignupCard href={href} locale={locale} />
    </main>
  );
}
