import type { ReactNode } from "react";
import { TuiButton } from "@/components/tui/tui-button";
import type { Post } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";

/** A standalone page from `content/pages/` (about, privacy): header, draft notice and body. */
export function MarkdownPage({ page, label, children }: { page: Post; label: string; children?: ReactNode }) {
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="flex flex-wrap gap-3">
        <TuiButton href="/" label="← cybernetics" />
        <TuiButton href="/blog" label="blog" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{label}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      {page.draft && (
        <p role="note" className="mb-8 border border-dashed border-red px-3 py-2 text-xs text-red">
          DRAFT — unlisted, not indexed. Fill in every [YOU: …] line, then set draft: false.
        </p>
      )}

      <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {page.title}
      </h1>
      {page.dek && <p className="mt-4 text-dim text-pretty">{page.dek}</p>}
      {page.date && (
        <p className="mt-4 text-xs text-dim">
          last updated <time dateTime={page.date}>{page.date}</time>
        </p>
      )}

      <div className="prose-tui mt-12 max-w-[72ch]">{renderMarkdown(page.body, { cta: () => null })}</div>
      {children}
    </main>
  );
}
