import { pageHref } from "./blog";
import { host, type Consumer, type Module, type ModuleId } from "./content";
import { contentFor } from "./content-i18n";
import { getDoc, readingLinks, showDrafts, type NavLink } from "./docs";
import { localePath, type Copy, type Locale } from "./i18n";

/** A module's page: `/product/<slug>`. */
export const productHref = (m: Pick<Module, "slug">, locale: Locale = "en") => localePath(locale, `/product/${m.slug}`);

/** A doc's href once it's published (always under `pnpm dev`), so nothing links to a draft. */
export function docHref(section: string, slug: string, locale: Locale = "en") {
  const doc = getDoc(section, slug, locale);
  return doc && (showDrafts || !doc.draft) ? doc.href : undefined;
}

/**
 * LLM clients with a page under `/integrations`, and the connect doc each one follows.
 * The Agentic Platform is ours, so it's a product page instead. `seoName` stands in for
 * the name in search titles where the name alone reads badly.
 */
const INTEGRATIONS: { id: string; slug: string; doc: string; seoName?: Copy<string> }[] = [
  { id: "claude-code", slug: "claude-code", doc: "claude-code" },
  { id: "claude-cowork", slug: "claude-cowork", doc: "claude-desktop" },
  { id: "chatgpt", slug: "chatgpt", doc: "chatgpt" },
  { id: "codex", slug: "codex", doc: "codex" },
  {
    id: "any",
    slug: "mcp-clients",
    doc: "cursor-and-others",
    seoName: { en: "Cursor, Gemini and other MCP clients", zh: "Cursor、Gemini 等 MCP 客户端" },
  },
];

export type Integration = Consumer & {
  slug: string;
  href: string;
  seoName: string;
  /** The connect doc, once it's published (always under `pnpm dev`). */
  docHref?: string;
  /** Modules the client reads in its example session, in first-use order. */
  reads: ModuleId[];
};

export const integrationSlugs = INTEGRATIONS.map((i) => i.slug);

export function getIntegrations(locale: Locale = "en"): Integration[] {
  const { consumers } = contentFor(locale);
  return INTEGRATIONS.map((i) => {
    const c = consumers.find((x) => x.id === i.id)!;
    const reads = [...new Set(c.session.flatMap((l) => (l.kind === "tool" ? [l.module] : [])))];
    return {
      ...c,
      slug: i.slug,
      href: localePath(locale, `/integrations/${i.slug}`),
      seoName: i.seoName?.[locale] ?? c.name,
      docHref: docHref("connect", i.doc, locale),
      reads,
    };
  });
}

export const getIntegration = (slug: string, locale: Locale = "en") => getIntegrations(locale).find((i) => i.slug === slug);

/**
 * The site's main navigation, in header order: product, integrations, pricing once it's
 * published, then the reading sections with the blog last.
 */
export function siteLinks(locale: Locale = "en"): NavLink[] {
  const zh = locale === "zh";
  const pricing = pageHref("pricing", locale);
  const blog = localePath(locale, "/blog");
  const reading = readingLinks(locale);
  return [
    { href: localePath(locale, "/product"), label: zh ? "产品" : "product", hint: zh ? "四个模块" : "the four modules" },
    {
      href: localePath(locale, "/integrations"),
      label: zh ? "集成" : "integrations",
      hint: zh ? "Claude、ChatGPT、Codex……" : "claude, chatgpt, codex, …",
    },
    ...(pricing ? [{ href: pricing, label: zh ? "价格" : "pricing", hint: zh ? "抢先体验与方案" : "early access and plans" }] : []),
    ...reading.filter((l) => l.href !== blog),
    ...reading.filter((l) => l.href === blog),
  ];
}

export type FooterLink = { href: string; label: string; external?: boolean; tone?: ModuleId };

const FOOTER: Copy<{
  product: string;
  resources: string;
  company: string;
  apps: string;
  overview: string;
  integrations: string;
  pricing: string;
  exocortex: string;
  pages: Record<(typeof COMPANY_PAGES)[number], string>;
}> = {
  en: {
    product: "product",
    resources: "resources",
    company: "company",
    apps: "sign in",
    overview: "overview",
    integrations: "integrations",
    pricing: "pricing",
    exocortex: "exocortex — the big idea",
    pages: {
      about: "about",
      contact: "contact",
      security: "security",
      "open-source": "open source",
      privacy: "privacy",
      terms: "terms",
    },
  },
  zh: {
    product: "产品",
    resources: "资源",
    company: "关于我们",
    apps: "登录",
    overview: "概览",
    integrations: "集成",
    pricing: "价格",
    exocortex: "外脑 — 核心理念",
    pages: {
      about: "关于",
      contact: "联系",
      security: "安全",
      "open-source": "开源",
      privacy: "隐私政策",
      terms: "服务条款",
    },
  },
};

/** Standalone pages in the footer's company column; each appears once it's published. */
const COMPANY_PAGES = ["about", "contact", "security", "open-source", "privacy", "terms"] as const;

/** Footer columns; a column with nothing published yet is left out. */
export function footerGroups(locale: Locale = "en"): { title: string; links: FooterLink[] }[] {
  const t = FOOTER[locale];
  const { modules } = contentFor(locale);
  const pricing = pageHref("pricing", locale);
  return [
    {
      title: t.product,
      links: [
        { href: localePath(locale, "/product"), label: t.overview },
        ...modules.map((m) => ({ href: productHref(m, locale), label: m.name.toLowerCase(), tone: m.id })),
        { href: localePath(locale, "/integrations"), label: t.integrations },
        ...(pricing ? [{ href: pricing, label: t.pricing }] : []),
      ],
    },
    {
      title: t.resources,
      links: [
        ...readingLinks(locale).map((l) => ({ href: l.href, label: l.label })),
        { href: localePath(locale, "/exocortex"), label: t.exocortex },
      ],
    },
    {
      title: t.company,
      links: COMPANY_PAGES.flatMap((name) => {
        const href = pageHref(name, locale);
        return href ? [{ href, label: t.pages[name] }] : [];
      }),
    },
    {
      title: t.apps,
      links: modules.map((m) => ({ href: m.url, label: host(m.url), external: true, tone: m.id })),
    },
  ].filter((g) => g.links.length > 0);
}
