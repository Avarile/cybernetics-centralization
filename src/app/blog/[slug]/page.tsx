import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CyborgFigure } from "@/components/blog/cyborg-figure";
import { InlineCta, SignupCard } from "@/components/blog/signup";
import { TuiButton } from "@/components/tui/tui-button";
import { getAllPosts, getNeighbours, getPost, registerHref, type Post } from "@/lib/blog";
import { AUTHOR } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";
import { ThemeToggle } from "@/components/chrome/theme-toggle";

// Static export: every post is prerendered, unknown slugs 404.

const SUFFIX = " — Cyborg Migration";
/** Search results cut titles off around 60 characters; the series name goes only where it fits. */
const docTitle = (t: string) => (t.length + SUFFIX.length <= 60 ? t + SUFFIX : t);
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: { absolute: docTitle(post.seoTitle) },
    description: post.dek,
    authors: [AUTHOR],
    alternates: alternates(path),
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      url: path,
      title: post.title,
      description: post.dek,
      publishedTime: post.date,
      authors: [AUTHOR.name],
      section: post.series || undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.dek },
    // Drafts build (for review links) but stay unlisted and out of search.
    ...(post.draft && { robots: { index: false, follow: false } }),
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const href = registerHref(post);
  const { prev, next } = getNeighbours(post);
  const url = absolute(`/blog/${post.slug}`);

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
                image: `${url}/opengraph-image`,
                author,
                publisher: organization,
                isPartOf: { "@type": "Blog", name: "Cyborg Migration", url: absolute("/blog") },
                wordCount: post.body.split(/\s+/).length,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
                  { "@type": "ListItem", position: 2, name: "Blog", item: absolute("/blog") },
                  { "@type": "ListItem", position: 3, name: post.title, item: url },
                ],
              },
            ],
          }}
        />
      )}
      <div className="flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/blog" label="all posts" />
        <ThemeToggle className="ml-auto" />
      </div>

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

      <article>
        <header className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
          <div>
            <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
            {post.dek && <p className="mt-4 text-dim text-pretty">{post.dek}</p>}
            <p className="mt-4 text-xs text-dim">
              by {AUTHOR.name} · {post.date && <time dateTime={post.date}>{post.date}</time>} · {post.readingMinutes}{" "}
              min read
            </p>
          </div>
          <CyborgFigure stage={post.stage} className="mx-auto w-44 md:w-full" />
        </header>

        <div className="prose-tui mt-12 max-w-[68ch]">
          {renderMarkdown(post.body, { cta: (text, key) => <InlineCta key={key} text={text} href={href} /> })}
        </div>
      </article>

      <SignupCard href={href} />

      {(prev || next) && (
        <nav aria-label="More in the series" className="mt-12 grid gap-4 text-sm sm:grid-cols-2">
          {prev && <PostLink post={prev} dir="prev" />}
          {next && <PostLink post={next} dir="next" />}
        </nav>
      )}
    </main>
  );
}

function PostLink({ post, dir }: { post: Post; dir: "prev" | "next" }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      rel={dir}
      className={`group block border border-line p-4 transition-colors hover:border-accent ${dir === "next" ? "sm:col-start-2 sm:text-right" : ""}`}
    >
      <span className="text-xs text-dim">{dir === "prev" ? "← previous" : "next →"}</span>
      <span className="mt-1 block group-hover:text-accent">{post.title}</span>
    </a>
  );
}
