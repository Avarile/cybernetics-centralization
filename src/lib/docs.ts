import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assertFilled, parseFrontMatter } from "./blog";
import type { ModuleId } from "./content";
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
export const docSections = [
  { id: "start", title: "Start here" },
  { id: "connect", title: "Connect your AI" },
  { id: "self-host", title: "Self-hosting" },
  { id: "modules", title: "Modules" },
] as const;

export type DocSectionId = (typeof docSections)[number]["id"];

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
};

/** Dev lists drafts too (marked) so they can be reviewed; the production build never does. */
export const showDrafts = process.env.NODE_ENV === "development";

export function getAllDocs(): Doc[] {
  return docSections.flatMap(({ id: section }) => {
    const dir = join(DOCS_DIR, section);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((file) => {
        const { meta, body } = parseFrontMatter(readFileSync(join(dir, file), "utf8"));
        const slug = file.replace(/^\d+-/, "").replace(/\.md$/, "");
        const doc: Doc = {
          section,
          slug,
          href: `/docs/${section}/${slug}`,
          title: meta.title ?? slug,
          seoTitle: meta.seoTitle || meta.title || slug,
          description: meta.description ?? "",
          time: meta.time ?? "",
          modules: moduleList(meta.modules),
          verified: meta.verified ?? "",
          updated: meta.updated ?? "",
          draft: meta.draft === "true",
          body,
        };
        assertFilled(doc, `content/docs/${section}/${file}`);
        return doc;
      });
  });
}

/** Docs a reader sees: published ones, plus drafts under `pnpm dev`. */
export const getVisibleDocs = () => getAllDocs().filter((d) => showDrafts || !d.draft);

export const getDoc = (section: string, slug: string) =>
  getAllDocs().find((d) => d.section === section && d.slug === slug);

export function getAllGuides(): Guide[] {
  if (!existsSync(GUIDES_DIR)) return [];
  return readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { meta, body } = parseFrontMatter(readFileSync(join(GUIDES_DIR, file), "utf8"));
      const slug = file.replace(/\.md$/, "");
      const guide: Guide = {
        slug,
        href: `/guides/${slug}`,
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
      };
      assertFilled(guide, `content/guides/${file}`);
      return guide;
    })
    .sort((a, b) => a.order - b.order);
}

export const getVisibleGuides = () => getAllGuides().filter((g) => showDrafts || !g.draft);

export const getGuide = (slug: string) => getAllGuides().find((g) => g.slug === slug);

/** Whether any doc or guide is published, so nav links appear only once there's something to read. */
export const hasPublishedDocs = () => getAllDocs().some((d) => !d.draft);
export const hasPublishedGuides = () => getAllGuides().some((g) => !g.draft);

/** `## Heading` lines of a body, for the "on this page" list; ids match `renderMarkdown`'s. */
export const headings = (body: string) =>
  body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { text: text.replace(/[*`]/g, ""), id: headingId(text) };
    });
