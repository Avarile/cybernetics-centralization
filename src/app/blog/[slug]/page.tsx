import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CyborgFigure } from "@/components/blog/cyborg-figure";
import { InlineCta, SignupCard } from "@/components/blog/signup";
import { TuiButton } from "@/components/tui/tui-button";
import { getAllPosts, getPost, registerHref } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";

// Static export: every post is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} — Cyborg Migration`,
    description: post.dek,
    openGraph: { type: "article", title: post.title, description: post.dek, publishedTime: post.date },
    twitter: { card: "summary_large_image", title: post.title, description: post.dek },
    // Drafts build (for review links) but stay unlisted and out of search.
    ...(post.draft && { robots: { index: false, follow: false } }),
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const href = registerHref(post);

  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/blog" label="all posts" />
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
              {post.date && <time dateTime={post.date}>{post.date}</time>} · {post.readingMinutes} min read
            </p>
          </div>
          <CyborgFigure stage={post.stage} className="mx-auto w-44 md:w-full" />
        </header>

        <div className="prose-tui mt-12 max-w-[68ch]">
          {renderMarkdown(post.body, { cta: (text, key) => <InlineCta key={key} text={text} href={href} /> })}
        </div>
      </article>

      <SignupCard href={href} />
    </main>
  );
}
