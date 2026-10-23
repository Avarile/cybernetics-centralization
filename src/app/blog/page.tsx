import type { Metadata } from "next";
import { TuiButton } from "@/components/tui/tui-button";
import { getAllPosts, getPublishedPosts } from "@/lib/blog";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";

const TITLE = "Cyborg Migration";
const DESCRIPTION = "A build log about becoming AI-native: one memory you own, any AI plugged into it, and a weekly loop that learns.";

export const metadata: Metadata = {
  title: `${TITLE} blog`,
  description: DESCRIPTION,
  alternates: alternates("/blog"),
  openGraph: { ...baseOpenGraph, url: "/blog", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// `pnpm dev` lists drafts too, marked, so they can be reviewed; the production build never does.
const showDrafts = process.env.NODE_ENV === "development";

export default function BlogIndex() {
  const posts = getPublishedPosts();
  const listed = showDrafts ? getAllPosts() : posts;
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <JsonLd
        data={{
          "@type": "Blog",
          name: TITLE,
          description: DESCRIPTION,
          url: absolute("/blog"),
          author,
          publisher: organization,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absolute(`/blog/${p.slug}`),
            datePublished: p.date,
          })),
        }}
      />
      <TuiButton href="/" label="← cybernetics" />

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
        {TITLE}
      </h1>
      <p className="mt-4 text-sm text-dim">
        Becoming AI-native, one system at a time.{" "}
        <a href="/blog/feed.xml" className="underline decoration-line underline-offset-4 hover:text-accent">
          rss
        </a>
      </p>

      <ul className="mt-10 space-y-6">
        {listed.map((p) => (
          <li
            key={p.slug}
            className={`border-l pl-4 transition-colors hover:border-accent ${p.draft ? "border-dashed border-red" : "border-line"}`}
          >
            <a href={`/blog/${p.slug}`} className="group block">
              <span className="text-xs text-dim">
                {p.draft && <span className="mr-2 border border-dashed border-red px-1 text-red">draft</span>}
                <time dateTime={p.date}>{p.date}</time> · {p.readingMinutes} min
                {p.series && <> · {p.series}</>}
              </span>
              <span className="block text-lg group-hover:text-accent">{p.title}</span>
              <span className="block text-sm text-dim">{p.dek}</span>
            </a>
          </li>
        ))}
        {!listed.length && <li className="text-dim">$ ls posts/ — nothing published yet.</li>}
      </ul>
    </main>
  );
}
