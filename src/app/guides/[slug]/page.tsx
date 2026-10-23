import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InlineCta, SignupCard } from "@/components/blog/signup";
import { ModuleBadges } from "@/components/docs/docs-shell";
import { TuiButton } from "@/components/tui/tui-button";
import { personas } from "@/lib/content";
import { getAllGuides, getGuide, getVisibleGuides, headings } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";
import { ThemeToggle } from "@/components/chrome/theme-toggle";

// Static export: every guide is prerendered, unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.seoTitle,
    description: guide.dek,
    alternates: alternates(guide.href),
    openGraph: {
      ...baseOpenGraph,
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

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const href = `/register?utm_source=guides&utm_medium=docs&utm_campaign=docs&utm_content=${guide.slug}`;
  const all = getVisibleGuides();
  const i = all.findIndex((g) => g.slug === guide.slug);
  const next = all[i + 1];
  const toc = headings(guide.body);
  const forWho = personas.filter((p) => guide.personas.includes(p.login)).map((p) => p.name.toLowerCase());

  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      {!guide.draft && (
        <JsonLd
          data={{
            "@type": "Article",
            headline: guide.title,
            description: guide.dek,
            url: absolute(guide.href),
            ...(guide.updated && { dateModified: guide.updated }),
            author,
            publisher: organization,
          }}
        />
      )}
      <div className="flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/guides" label="all guides" />
        <TuiButton href="/docs" label="docs" />
        <ThemeToggle className="ml-auto" />
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

      <article>
        <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{guide.title}</h1>
        {guide.dek && <p className="mt-4 max-w-[68ch] text-dim text-pretty">{guide.dek}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-dim">
          {guide.time && <span className="border border-line px-1.5">{guide.time}</span>}
          <ModuleBadges ids={guide.modules} />
          {forWho.length > 0 && <span>for {forWho.join(", ")}</span>}
        </div>

        {toc.length >= 3 && (
          <nav aria-label="On this page" className="mt-8 border-l border-line pl-4 text-[13px]">
            <p className="text-xs text-dim"># on this page</p>
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

        <div className="prose-tui mt-10 max-w-[72ch]">
          {renderMarkdown(guide.body, { cta: (text, key) => <InlineCta key={key} text={text} href={href} /> })}
        </div>
      </article>

      {next && (
        <a href={next.href} className="group mt-14 block border border-line p-4 text-sm transition-colors hover:border-accent">
          <span className="text-xs text-dim">next guide →</span>
          <span className="mt-1 block group-hover:text-accent">{next.title}</span>
        </a>
      )}

      <SignupCard href={href} />
    </main>
  );
}
