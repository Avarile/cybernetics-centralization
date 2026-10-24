import type { Metadata } from "next";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNav } from "@/components/chrome/site-nav";
import { CyborgFigure } from "@/components/blog/cyborg-figure";
import { InlineCta, SignupCard } from "@/components/blog/signup";
import { UntranslatedNote } from "@/components/untranslated-note";
import { getNeighbours, getPost, registerHref, type Post } from "@/lib/blog";
import { AUTHOR } from "@/lib/content";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";
import { BLOG_COPY } from "./blog-index";

const COPY: Copy<{ home: string; blog: string; by: string; read: string; more: string; prev: string; next: string }> =
  {
    en: {
      home: "Home",
      blog: "Blog",
      by: "by",
      read: "min read",
      more: "More in the series",
      prev: "← previous",
      next: "next →",
    },
    zh: {
      home: "首页",
      blog: "博客",
      by: "作者",
      read: "分钟阅读",
      more: "本系列更多文章",
      prev: "← 上一篇",
      next: "下一篇 →",
    },
  };

/** Search results cut titles off around 60 characters; the series name goes only where it fits. */
const docTitle = (t: string, series: string) => {
  const suffix = ` — ${series}`;
  return t.length + suffix.length <= 60 ? t + suffix : t;
};

export function blogPostMetadata(slug: string, locale: Locale): Metadata {
  const post = getPost(slug, locale);
  if (!post) return {};
  const path = localePath(locale, `/blog/${post.slug}`);
  return {
    title: { absolute: docTitle(post.seoTitle, BLOG_COPY[locale].title) },
    description: post.dek,
    authors: [AUTHOR],
    alternates: alternates(path, locale),
    openGraph: {
      ...baseOpenGraph(locale),
      type: "article",
      url: path,
      title: post.title,
      description: post.dek,
      publishedTime: post.date,
      authors: [AUTHOR.name],
      section: post.series || undefined,
      // The share card has no CJK font, so both languages use the English one.
      ...(locale !== "en" && {
        images: [{ url: `/blog/${post.slug}/opengraph-image`, width: 1200, height: 630, alt: "Cyborg Migration" }],
      }),
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.dek },
    // Drafts build (for review links) but stay unlisted and out of search.
    ...(post.draft && { robots: { index: false, follow: false } }),
  };
}

export function BlogPost({ post, locale }: { post: Post; locale: Locale }) {
  const t = COPY[locale];
  const href = registerHref(post, locale);
  const { prev, next } = getNeighbours(post, locale);
  const blog = localePath(locale, "/blog");
  const url = absolute(localePath(locale, `/blog/${post.slug}`));

  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      {!post.draft && (
        <JsonLd
          data={{
            "@graph": [
              {
                "@type": "BlogPosting",
                "@id": `${url}#post`,
                headline: post.title,
                description: post.dek,
                datePublished: post.date,
                url,
                mainEntityOfPage: url,
                inLanguage: HTML_LANG[post.lang],
                image: absolute(`/blog/${post.slug}/opengraph-image`),
                author,
                publisher: organization,
                isPartOf: { "@type": "Blog", name: BLOG_COPY[locale].title, url: absolute(blog) },
                wordCount: post.body.split(/\s+/).length,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: t.home, item: absolute(localePath(locale, "/")) },
                  { "@type": "ListItem", position: 2, name: t.blog, item: absolute(blog) },
                  { "@type": "ListItem", position: 3, name: post.title, item: url },
                ],
              },
            ],
          }}
        />
      )}
      <SiteNav locale={locale} current="/blog" />

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{post.series || "blog"}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      {post.draft && (
        <p role="note" className="mb-8 border border-dashed border-red px-3 py-2 text-xs text-red">
          DRAFT — unlisted, not indexed. Awaiting review.
        </p>
      )}
      <UntranslatedNote locale={locale} lang={post.lang} />

      <article lang={HTML_LANG[post.lang]}>
        <header className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
          <div>
            <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
            {post.dek && <p className="mt-4 text-dim text-pretty">{post.dek}</p>}
            <p lang={HTML_LANG[locale]} className="mt-4 text-xs text-dim">
              {t.by} {AUTHOR.name} · {post.date && <time dateTime={post.date}>{post.date}</time>} · {post.readingMinutes}{" "}
              {t.read}
            </p>
          </div>
          <CyborgFigure stage={post.stage} locale={locale} className="mx-auto w-44 md:w-full" />
        </header>

        <div className="prose-tui mt-12 max-w-[68ch]">
          {renderMarkdown(post.body, {
            cta: (text, key) => <InlineCta key={key} text={text} href={href} locale={locale} />,
            locale,
          })}
        </div>
      </article>

      <SignupCard href={href} locale={locale} />

      {(prev || next) && (
        <nav aria-label={t.more} className="mt-12 grid gap-4 text-sm sm:grid-cols-2">
          {prev && <PostLink post={prev} dir="prev" locale={locale} />}
          {next && <PostLink post={next} dir="next" locale={locale} />}
        </nav>
      )}
      <SiteFooter locale={locale} />
    </main>
  );
}

function PostLink({ post, dir, locale }: { post: Post; dir: "prev" | "next"; locale: Locale }) {
  const t = COPY[locale];
  return (
    <a
      href={localePath(locale, `/blog/${post.slug}`)}
      rel={dir}
      className={`group block border border-line p-4 transition-colors hover:border-accent ${dir === "next" ? "sm:col-start-2 sm:text-right" : ""}`}
    >
      <span className="text-xs text-dim">{dir === "prev" ? t.prev : t.next}</span>
      <span lang={HTML_LANG[post.lang]} className="mt-1 block group-hover:text-accent">
        {post.title}
      </span>
    </a>
  );
}
