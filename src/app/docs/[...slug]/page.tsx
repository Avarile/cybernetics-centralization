import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InlineCta } from "@/components/blog/signup";
import { DocPager, DocsShell, ModuleBadges } from "@/components/docs/docs-shell";
import { docSections, getAllDocs, getDoc, headings } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, alternates, author, baseOpenGraph, JsonLd, organization } from "@/lib/seo";

// Static export: every doc is prerendered, unknown paths 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((d) => ({ slug: [d.section, d.slug] }));
}

const find = async (params: PageProps<"/docs/[...slug]">["params"]) => {
  const [section, slug] = (await params).slug;
  return getDoc(section, slug ?? "");
};

export async function generateMetadata({ params }: PageProps<"/docs/[...slug]">): Promise<Metadata> {
  const doc = await find(params);
  if (!doc) return {};
  return {
    title: doc.seoTitle,
    description: doc.description,
    alternates: alternates(doc.href),
    openGraph: {
      ...baseOpenGraph,
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

export default async function DocPage({ params }: PageProps<"/docs/[...slug]">) {
  const doc = await find(params);
  if (!doc) notFound();
  const section = docSections.find((s) => s.id === doc.section)!;
  const toc = headings(doc.body);
  const url = absolute(doc.href);
  const cta = `/register?utm_source=docs&utm_medium=docs&utm_campaign=docs&utm_content=${doc.section}-${doc.slug}`;

  return (
    <DocsShell current={doc.href}>
      {!doc.draft && (
        <JsonLd
          data={{
            "@graph": [
              {
                "@type": "TechArticle",
                headline: doc.title,
                description: doc.description,
                url,
                ...(doc.updated && { dateModified: doc.updated }),
                author,
                publisher: organization,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Docs", item: absolute("/docs") },
                  { "@type": "ListItem", position: 2, name: section.title, item: absolute(`/docs#${section.id}`) },
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

      <article>
        <p className="text-xs text-dim">{section.title.toLowerCase()}</p>
        <h1 className="glow mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{doc.title}</h1>
        {doc.description && <p className="mt-4 max-w-[68ch] text-dim text-pretty">{doc.description}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-dim">
          {doc.time && <span className="border border-line px-1.5">{doc.time}</span>}
          <ModuleBadges ids={doc.modules} />
          <span className="border border-dashed border-line px-1.5">
            {doc.verified ? `verified: ${doc.verified}` : "not yet verified"}
          </span>
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

        <div className="prose-tui mt-10 max-w-[78ch]">
          {renderMarkdown(doc.body, { cta: (text, key) => <InlineCta key={key} text={text} href={cta} /> })}
        </div>
      </article>

      <DocPager doc={doc} />
    </DocsShell>
  );
}
