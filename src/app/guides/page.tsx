import type { Metadata } from "next";
import { GuideList } from "@/components/docs/guide-list";
import { TuiButton } from "@/components/tui/tui-button";
import { modules, personas } from "@/lib/content";
import { getVisibleGuides } from "@/lib/docs";
import { absolute, alternates, baseOpenGraph, JsonLd } from "@/lib/seo";

const TITLE = "Guides";
const DESCRIPTION =
  "Step-by-step workflows for running your life and work on one memory with any AI: capture, weekly reviews, projects, people, money and agents.";

export const metadata: Metadata = {
  title: "Guides: workflows with your AI",
  description: DESCRIPTION,
  alternates: alternates("/guides"),
  openGraph: {
    ...baseOpenGraph,
    url: "/guides",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/docs/opengraph-image", width: 1200, height: 630, alt: "Cybernetics docs" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function GuidesHome() {
  const guides = getVisibleGuides();
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: TITLE,
          url: absolute("/guides"),
          hasPart: guides.filter((g) => !g.draft).map((g) => ({ "@type": "Article", headline: g.title, url: absolute(g.href) })),
        }}
      />
      <div className="flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/docs" label="docs" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">guides</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <h1 className="glow text-2xl font-semibold tracking-tight sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        Guides
      </h1>
      <p className="mt-4 max-w-[68ch] text-sm text-dim">{DESCRIPTION}</p>

      <GuideList
        personas={personas.map(({ login, name }) => ({ login, name }))}
        guides={guides.map((g) => ({
          href: g.href,
          title: g.title,
          dek: g.dek,
          time: g.time,
          personas: g.personas,
          modules: g.modules.map((id) => ({ id, name: modules.find((m) => m.id === id)!.name })),
          draft: g.draft,
        }))}
      />
    </main>
  );
}
