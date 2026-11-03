import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FigureStage } from "./cyborg-figure";

/** Posts are Markdown files in `content/blog/`, standalone pages in `content/pages/`; read at build time. */
const DIR = join(process.cwd(), "content", "blog");
const PAGES_DIR = join(process.cwd(), "content", "pages");

export type Post = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  series: string;
  /** Campaign piece id sent as `utm_content` (e.g. `blog-01`); defaults to the slug. */
  piece: string;
  /** Migration stage the post's figure shows. */
  stage: FigureStage;
  /** `true` keeps a post off the index (it still builds, for review links). */
  draft: boolean;
  body: string;
  readingMinutes: number;
};

/** `---` front matter with `key: value` lines; values may be quoted. */
function parse(slug: string, raw: string): Post {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  const meta: Record<string, string> = {};
  for (const line of match?.[1].split("\n") ?? []) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  const body = match ? raw.slice(match[0].length) : raw;
  const stage = Number(meta.stage ?? 3);
  return {
    slug,
    title: meta.title ?? slug,
    dek: meta.dek ?? "",
    date: meta.date ?? "",
    series: meta.series ?? "",
    piece: meta.piece || slug,
    stage: (stage >= 0 && stage <= 3 ? stage : 3) as FigureStage,
    draft: meta.draft === "true",
    body,
    readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 230)),
  };
}

export function getAllPosts(): Post[] {
  const posts = readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), readFileSync(join(DIR, f), "utf8")));
  // `[YOU: …]` marks facts only the author can fill in; never publish one unfilled.
  const unfilled = posts.find((p) => !p.draft && p.body.includes("[YOU"));
  if (unfilled) throw new Error(`content/blog/${unfilled.slug}.md is published but still has a [YOU: …] placeholder`);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getAllPosts().find((p) => p.slug === slug);

/** A standalone page (same front matter as posts), e.g. `getPage("start")`. */
export const getPage = (name: string) => parse(name, readFileSync(join(PAGES_DIR, `${name}.md`), "utf8"));

/** Signup link for a post; first-touch UTM is stored by the register form. */
export const registerHref = (post: Post) =>
  `/register?utm_source=blog&utm_medium=blog&utm_campaign=cyborg-migration&utm_content=${encodeURIComponent(post.piece)}`;
