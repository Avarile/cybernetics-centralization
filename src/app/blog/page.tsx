import type { Metadata } from "next";
import { TuiButton } from "@/components/tui/tui-button";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Cybernetics",
  description: "Cyborg Migration: a build log about becoming AI-native. My memory. Any mind. Closed loops.",
};

export default function BlogIndex() {
  const posts = getAllPosts().filter((p) => !p.draft);
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
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
        Cyborg Migration
      </h1>
      <p className="mt-4 text-sm text-dim">Becoming AI-native, one system at a time.</p>

      <ul className="mt-10 space-y-6">
        {posts.map((p) => (
          <li key={p.slug} className="border-l border-line pl-4 transition-colors hover:border-accent">
            <a href={`/blog/${p.slug}`} className="group block">
              <span className="text-xs text-dim">
                {p.date} · {p.readingMinutes} min
              </span>
              <span className="block text-lg group-hover:text-accent">{p.title}</span>
              <span className="block text-sm text-dim">{p.dek}</span>
            </a>
          </li>
        ))}
        {!posts.length && <li className="text-dim">$ ls posts/ — nothing published yet.</li>}
      </ul>
    </main>
  );
}
