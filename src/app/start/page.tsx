import type { Metadata } from "next";
import { CyborgFigure } from "@/components/blog/cyborg-figure";
import { TuiButton } from "@/components/tui/tui-button";
import { getPage } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const PDF = "/downloads/cyborg-migration-4-week-checklist.pdf";

// Sign-up reward: linked from the /register success screen, kept out of search.
export const metadata: Metadata = {
  title: "Your 4-week Cyborg Migration",
  description: "The week-by-week checklist and the starter template.",
  alternates: alternates("/start"),
  openGraph: {
    ...baseOpenGraph,
    url: "/start",
    title: "Your 4-week Cyborg Migration",
    description: "The week-by-week checklist and the starter template.",
    images: [defaultOgImage],
  },
  robots: { index: false, follow: false },
};

export default function StartPage() {
  const page = getPage("start");
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="no-print flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/blog" label="follow the build" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{page.series}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <header className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{page.title}</h1>
          <p className="mt-4 text-dim text-pretty">{page.dek}</p>
          <div className="no-print mt-6">
            <TuiButton href={PDF} label="download the PDF" primary />
          </div>
        </div>
        <CyborgFigure stage={page.stage} className="mx-auto w-44 md:w-full" />
      </header>

      <div className="prose-tui mt-12 max-w-[72ch]">{renderMarkdown(page.body, { cta: () => null })}</div>

      <div className="no-print mt-12 flex flex-wrap gap-3">
        <TuiButton href={PDF} label="download the PDF" primary />
        <TuiButton href="/blog" label="follow the build" />
      </div>
    </main>
  );
}
