import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FigureStage } from "./cyborg-figure";
import { localePath, type Locale } from "./i18n";

/** Posts are Markdown files in `content/blog/`, standalone pages in `content/pages/`; read at build time. */
const CONTENT = join(process.cwd(), "content");
const DIR = join(CONTENT, "blog");

export type Post = {
  slug: string;
  title: string;
  /** Shorter title for search results and the browser tab; the page and share cards keep `title`. */
  seoTitle: string;
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
  /** The language `title` and `body` are in: a page without a translation shows the English. */
  lang: Locale;
};

/** `---` front matter with `key: value` lines; values may be quoted. Shared with docs and guides. */
export function parseFrontMatter(raw: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  const meta: Record<string, string> = {};
  for (const line of match?.[1].split("\n") ?? []) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: match ? raw.slice(match[0].length) : raw };
}

/** Front matter a translation may override; dates, drafts, order and the like stay with the English file. */
const TEXT_FIELDS = ["title", "seoTitle", "dek", "description", "series", "time"];

/**
 * Reads `content/<file>` in `locale`. A translation is the same path under `content/zh/`; it
 * overrides the body and the text fields of the front matter. Without one, the English stands in.
 */
export function readContent(file: string, locale: Locale) {
  const en = parseFrontMatter(readFileSync(join(CONTENT, file), "utf8"));
  const translated = join(CONTENT, locale, file);
  if (locale === "en" || !existsSync(translated)) return { ...en, lang: "en" as Locale };
  const zh = parseFrontMatter(readFileSync(translated, "utf8"));
  const meta = { ...en.meta };
  for (const k of TEXT_FIELDS) if (zh.meta[k]) meta[k] = zh.meta[k];
  return { meta, body: zh.body, lang: locale };
}

/** About 230 English words or 400 Chinese characters a minute. */
export function readingMinutes(body: string) {
  const cjk = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = body.replace(/[\u3400-\u9fff]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230 + cjk / 400));
}

/** `[YOU: …]` marks facts only the author can fill in; never publish one unfilled. */
export function assertFilled(entry: { draft: boolean; body: string }, file: string) {
  if (!entry.draft && entry.body.includes("[YOU"))
    throw new Error(`${file} is published but still has a [YOU: …] placeholder`);
}

function parse(slug: string, { meta, body, lang }: ReturnType<typeof readContent>): Post {
  const stage = Number(meta.stage ?? 3);
  return {
    slug,
    title: meta.title ?? slug,
    seoTitle: meta.seoTitle || meta.title || slug,
    dek: meta.dek ?? "",
    date: meta.date ?? "",
    series: meta.series ?? "",
    piece: meta.piece || slug,
    stage: (stage >= 0 && stage <= 3 ? stage : 3) as FigureStage,
    draft: meta.draft === "true",
    body,
    readingMinutes: readingMinutes(body),
    lang,
  };
}

export function getAllPosts(locale: Locale = "en"): Post[] {
  const posts = readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), readContent(`blog/${f}`, locale)));
  for (const p of posts) assertFilled(p, `content/${p.lang === "en" ? "" : `${p.lang}/`}blog/${p.slug}.md`);
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string, locale: Locale = "en") => getAllPosts(locale).find((p) => p.slug === slug);

/** Posts that are listed, indexed and in the feed: newest first. */
export const getPublishedPosts = (locale: Locale = "en") => getAllPosts(locale).filter((p) => !p.draft);

/**
 * The published posts either side of `post` in reading order (oldest first).
 * A draft gets neighbours too, so its review link shows the finished layout.
 */
export function getNeighbours(post: Post, locale: Locale = "en") {
  const order = getAllPosts(locale)
    .filter((p) => !p.draft || p.slug === post.slug)
    .reverse();
  const i = order.findIndex((p) => p.slug === post.slug);
  return { prev: order[i - 1], next: order[i + 1] };
}

/** A standalone page (same front matter as posts), e.g. `getPage("start")`. */
export function getPage(name: string, locale: Locale = "en") {
  const page = parse(name, readContent(`pages/${name}.md`, locale));
  assertFilled(page, `content/${page.lang === "en" ? "" : `${page.lang}/`}pages/${name}.md`);
  return page;
}

/** Where a page lives once published; `undefined` while it's a draft, so nothing links to it yet. */
export const pageHref = (name: string, locale: Locale = "en") =>
  getPage(name).draft ? undefined : localePath(locale, `/${name}`);

/** Signup link for a post; first-touch UTM is stored by the register form. */
export const registerHref = (post: Post, locale: Locale = "en") =>
  `${localePath(locale, "/register")}?utm_source=blog&utm_medium=blog&utm_campaign=cyborg-migration&utm_content=${encodeURIComponent(post.piece)}`;
