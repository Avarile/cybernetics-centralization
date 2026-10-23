import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { assertFilled, getPublishedPosts, readContent } from "./blog";
import type { ModuleId } from "./content";
import { localePath, type Copy, type Locale } from "./i18n";
import { headingId } from "./markdown";

/**
 * Docs are Markdown files in `content/docs/<section>/<nn>-<slug>.md`, served at
 * `/docs/<section>/<slug>`; guides are `content/guides/<slug>.md` at `/guides/<slug>`.
 * Both follow the posts' rules: `draft: true` builds but stays unlisted and unindexed,
 * and a published entry can't keep a `[YOU: …]` placeholder.
 */
const DOCS_DIR = join(process.cwd(), "content", "docs");
const GUIDES_DIR = join(process.cwd(), "content", "guides");

/** Docs sections in sidebar order. */
const SECTIONS = [
  { id: "start", title: { en: "Start here", zh: "从这里开始" } },
  { id: "connect", title: { en: "Connect your AI", zh: "连接你的 AI" } },
  { id: "self-host", title: { en: "Self-hosting", zh: "自托管" } },
  { id: "modules", title: { en: "Modules", zh: "模块" } },
] as const satisfies readonly { id: string; title: Copy<string> }[];

export type DocSectionId = (typeof SECTIONS)[number]["id"];

export const docSections = (locale: Locale = "en") => SECTIONS.map((s) => ({ id: s.id, title: s.title[locale] }));

const MODULE_IDS: ModuleId[] = ["data", "proj", "crm", "agent"];

/** `modules: data, proj` → `["data", "proj"]`, keeping only known module ids. */
const moduleList = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ModuleId => MODULE_IDS.includes(s as ModuleId));

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export type Doc = {
  section: DocSectionId;
  slug: string;
  /** `/docs/<section>/<slug>` */
  href: string;
  title: string;
  seoTitle: string;
  description: string;
  /** Rough time to follow it, e.g. "10 min". */
  time: string;
  modules: ModuleId[];
  /** What the steps were last checked against, e.g. "Claude Code 2.x, 2026-10-23"; empty if never. */
  verified: string;
  updated: string;
  draft: boolean;
  body: string;
  /** The language `title` and `body` are in: a doc without a translation shows the English. */
  lang: Locale;
};

export type Guide = {
  slug: string;
  href: string;
  title: string;
  seoTitle: string;
  dek: string;
  order: number;
  time: string;
  /** Persona logins from `content.ts` (freelancer, founder, researcher, student, team). */
  personas: string[];
  modules: ModuleId[];
  /** Data Base schema packs the guide uses: progress, people, knowledge, finance. */
  packs: string[];
  updated: string;
  draft: boolean;
  body: string;
  lang: Locale;
};

/** Dev lists drafts too (marked) so they can be reviewed; the production build never does. */
export const showDrafts = process.env.NODE_ENV === "development";

export function getAllDocs(locale: Locale = "en"): Doc[] {
  return SECTIONS.flatMap(({ id: section }) => {
    const dir = join(DOCS_DIR, section);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((file) => {
        const { meta, body, lang } = readContent(`docs/${section}/${file}`, locale);
        const slug = file.replace(/^\d+-/, "").replace(/\.md$/, "");
        const doc: Doc = {
          section,
          slug,
          href: localePath(locale, `/docs/${section}/${slug}`),
          title: meta.title ?? slug,
          seoTitle: meta.seoTitle || meta.title || slug,
          description: meta.description ?? "",
          time: meta.time ?? "",
          modules: moduleList(meta.modules),
          verified: meta.verified ?? "",
          updated: meta.updated ?? "",
          draft: meta.draft === "true",
          body,
          lang,
        };
        assertFilled(doc, `content/${lang === "en" ? "" : `${lang}/`}docs/${section}/${file}`);
        return doc;
      });
  });
}

/** Docs a reader sees: published ones, plus drafts under `pnpm dev`. */
export const getVisibleDocs = (locale: Locale = "en") => getAllDocs(locale).filter((d) => showDrafts || !d.draft);

export const getDoc = (section: string, slug: string, locale: Locale = "en") =>
  getAllDocs(locale).find((d) => d.section === section && d.slug === slug);

export function getAllGuides(locale: Locale = "en"): Guide[] {
  if (!existsSync(GUIDES_DIR)) return [];
  return readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { meta, body, lang } = readContent(`guides/${file}`, locale);
      const slug = file.replace(/\.md$/, "");
      const guide: Guide = {
        slug,
        href: localePath(locale, `/guides/${slug}`),
        title: meta.title ?? slug,
        seoTitle: meta.seoTitle || meta.title || slug,
        dek: meta.dek ?? "",
        order: Number(meta.order ?? 99),
        time: meta.time ?? "",
        personas: list(meta.personas),
        modules: moduleList(meta.modules),
        packs: list(meta.packs),
        updated: meta.updated ?? "",
        draft: meta.draft === "true",
        body,
        lang,
      };
      assertFilled(guide, `content/${lang === "en" ? "" : `${lang}/`}guides/${file}`);
      return guide;
    })
    .sort((a, b) => a.order - b.order);
}

export const getVisibleGuides = (locale: Locale = "en") => getAllGuides(locale).filter((g) => showDrafts || !g.draft);

export const getGuide = (slug: string, locale: Locale = "en") => getAllGuides(locale).find((g) => g.slug === slug);

/** Whether any doc or guide is published, so nav links appear only once there's something to read. */
export const hasPublishedDocs = () => getAllDocs().some((d) => !d.draft);
export const hasPublishedGuides = () => getAllGuides().some((g) => !g.draft);

export type NavLink = { href: string; label: string; hint: string };

/**
 * The reading sections for site navigation (title bar, command palette, footer): each
 * once it has something published, and always under `pnpm dev` so drafts can be reviewed.
 */
export function readingLinks(locale: Locale = "en"): NavLink[] {
  const zh = locale === "zh";
  return [
    {
      href: "/blog",
      label: zh ? "博客" : "blog",
      hint: zh ? "赛博格迁移建造日志" : "cyborg migration build log",
      show: getPublishedPosts().length > 0,
    },
    { href: "/docs", label: zh ? "文档" : "docs", hint: zh ? "连接你的 AI，自托管" : "connect your AI, self-host", show: hasPublishedDocs() },
    { href: "/guides", label: zh ? "指南" : "guides", hint: zh ? "工作流，一步一步来" : "workflows, step by step", show: hasPublishedGuides() },
  ]
    .filter((l) => showDrafts || l.show)
    .map(({ href, label, hint }) => ({ href: localePath(locale, href), label, hint }));
}

/** `## Heading` lines of a body, for the "on this page" list; ids match `renderMarkdown`'s. */
export const headings = (body: string) =>
  body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { text: text.replace(/[*`]/g, ""), id: headingId(text) };
    });
