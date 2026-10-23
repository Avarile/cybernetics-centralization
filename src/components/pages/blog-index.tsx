import type { Metadata } from "next";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { TuiButton } from "@/components/tui/tui-button";
import { getAllPosts, getPublishedPosts } from "@/lib/blog";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";

export const BLOG_COPY: Copy<{ title: string; description: string; tagline: string; min: string; empty: string }> = {
  en: {
    title: "Cyborg Migration",
    description: "A build log about becoming AI-native: one memory you own, any AI plugged into it, and a weekly loop that learns.",
    tagline: "Becoming AI-native, one system at a time.",
    min: "min",
    empty: "$ ls posts/ — nothing published yet.",
  },
  zh: {
    title: "赛博格迁移",
    description: "一份关于成为 AI 原生的建造日志：一份属于你的记忆，任何 AI 都能接入，再加上一个会学习的每周闭环。",
    tagline: "成为 AI 原生，一次一个系统。",
    min: "分钟",
    empty: "$ ls posts/ — 还没有发布任何文章。",
  },
};

export function blogIndexMetadata(locale: Locale): Metadata {
  const { title, description } = BLOG_COPY[locale];
  return {
    title: locale === "zh" ? `${title}博客` : `${title} blog`,
    description,
    alternates: alternates("/blog", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/blog"),
      title,
      description,
      // The share card has no CJK font, so both languages use the English one.
      ...(locale !== "en" && { images: [{ url: "/blog/opengraph-image", width: 1200, height: 630, alt: "Cyborg Migration" }] }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// `pnpm dev` lists drafts too, marked, so they can be reviewed; the production build never does.
const showDrafts = process.env.NODE_ENV === "development";

export function BlogIndex({ locale }: { locale: Locale }) {
  const t = BLOG_COPY[locale];
  const posts = getPublishedPosts(locale);
  const listed = showDrafts ? getAllPosts(locale) : posts;
  const postHref = (slug: string) => localePath(locale, `/blog/${slug}`);
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <JsonLd
        data={{
          "@type": "Blog",
          name: t.title,
          description: t.description,
          url: absolute(localePath(locale, "/blog")),
          inLanguage: HTML_LANG[locale],
          author,
          publisher: organization,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absolute(postHref(p.slug)),
            datePublished: p.date,
          })),
        }}
      />
      <div className="flex flex-wrap gap-3">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
        <PrefToggles className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">blog</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <h1 className="glow text-2xl font-semibold tracking-tight sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {t.title}
      </h1>
      <p className="mt-4 text-sm text-dim">
        {t.tagline}{" "}
        <a
          href={localePath(locale, "/blog/feed.xml")}
          className="underline decoration-line underline-offset-4 hover:text-accent"
        >
          rss
        </a>
      </p>

      <ul className="mt-10 space-y-6">
        {listed.map((p) => (
          <li
            key={p.slug}
            className={`border-l pl-4 transition-colors hover:border-accent ${p.draft ? "border-dashed border-red" : "border-line"}`}
          >
            <a href={postHref(p.slug)} className="group block">
              <span className="text-xs text-dim">
                {p.draft && <span className="mr-2 border border-dashed border-red px-1 text-red">draft</span>}
                <time dateTime={p.date}>{p.date}</time> · {p.readingMinutes} {t.min}
                {p.series && <> · {p.series}</>}
              </span>
              <span lang={HTML_LANG[p.lang]} className="block text-lg group-hover:text-accent">
                {p.title}
              </span>
              <span lang={HTML_LANG[p.lang]} className="block text-sm text-dim">
                {p.dek}
              </span>
            </a>
          </li>
        ))}
        {!listed.length && <li className="text-dim">{t.empty}</li>}
      </ul>
    </main>
  );
}
