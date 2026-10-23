import type { Metadata } from "next";
import { InlineCta } from "@/components/blog/signup";
import { DocPager, DocsShell, ModuleBadges } from "@/components/docs/docs-shell";
import { UntranslatedNote } from "@/components/untranslated-note";
import { docSections, getDoc, headings, type Doc } from "@/lib/docs";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";

const COPY: Copy<{ docs: string; verified: (v: string) => string; unverified: string; toc: string; tocLabel: string }> = {
  en: {
    docs: "Docs",
    verified: (v) => `verified: ${v}`,
    unverified: "not yet verified",
    toc: "# on this page",
    tocLabel: "On this page",
  },
  zh: {
    docs: "文档",
    verified: (v) => `已验证：${v}`,
    unverified: "尚未验证",
    toc: "# 本页内容",
    tocLabel: "本页内容",
  },
};

export const findDoc = (slug: string[], locale: Locale) => getDoc(slug[0], slug[1] ?? "", locale);

export function docMetadata(doc: Doc | undefined, locale: Locale): Metadata {
  if (!doc) return {};
  return {
    title: doc.seoTitle,
    description: doc.description,
    alternates: alternates(doc.href, locale),
    openGraph: {
      ...baseOpenGraph(locale),
      type: "article",
      url: doc.href,
      title: doc.title,
      description: doc.description,
      images: [{ url: "/docs/opengraph-image", width: 1200, height: 630, alt: "Cybernetics docs" }],
    },
    twitter: { card: "summary_large_image", title: doc.title, description: doc.description },
    ...(doc.draft && { robots: { index: false, follow: false } }),
  };
}

export function DocArticle({ doc, locale }: { doc: Doc; locale: Locale }) {
  const t = COPY[locale];
  const section = docSections(locale).find((s) => s.id === doc.section)!;
  const toc = headings(doc.body);
  const url = absolute(doc.href);
  const cta = `${localePath(locale, "/register")}?utm_source=docs&utm_medium=docs&utm_campaign=docs&utm_content=${doc.section}-${doc.slug}`;
  const docs = localePath(locale, "/docs");

  return (
    <DocsShell current={doc.href} locale={locale}>
      {!doc.draft && (
        <JsonLd
          data={{
            "@graph": [
              {
                "@type": "TechArticle",
                headline: doc.title,
                description: doc.description,
                url,
                inLanguage: HTML_LANG[doc.lang],
                ...(doc.updated && { dateModified: doc.updated }),
                author,
                publisher: organization,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: t.docs, item: absolute(docs) },
                  { "@type": "ListItem", position: 2, name: section.title, item: absolute(`${docs}#${section.id}`) },
                  { "@type": "ListItem", position: 3, name: doc.title, item: url },
                ],
              },
            ],
          }}
        />
      )}

      {doc.draft && (
        <p role="note" className="mb-8 border border-dashed border-red px-3 py-2 text-xs text-red">
          DRAFT — unlisted, not indexed. Check every step, fill in any [YOU: …] line, set verified, then draft: false.
        </p>
      )}
      <UntranslatedNote locale={locale} lang={doc.lang} />

      <article>
        <p className="text-xs text-dim">{section.title.toLowerCase()}</p>
        <h1 lang={HTML_LANG[doc.lang]} className="glow mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {doc.title}
        </h1>
        {doc.description && (
          <p lang={HTML_LANG[doc.lang]} className="mt-4 max-w-[68ch] text-dim text-pretty">
            {doc.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-dim">
          {doc.time && <span className="border border-line px-1.5">{doc.time}</span>}
          <ModuleBadges ids={doc.modules} locale={locale} />
          <span className="border border-dashed border-line px-1.5">
            {doc.verified ? t.verified(doc.verified) : t.unverified}
          </span>
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

        <div lang={HTML_LANG[doc.lang]} className="prose-tui mt-10 max-w-[78ch]">
          {renderMarkdown(doc.body, {
            cta: (text, key) => <InlineCta key={key} text={text} href={cta} locale={locale} />,
            locale,
          })}
        </div>
      </article>

      <DocPager doc={doc} locale={locale} />
    </DocsShell>
  );
}
