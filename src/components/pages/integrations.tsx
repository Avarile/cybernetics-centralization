import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/chrome/breadcrumbs";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNav } from "@/components/chrome/site-nav";
import { ModuleBadges } from "@/components/docs/docs-shell";
import { ConsumerIcon } from "@/components/sections/mcp";
import { Box } from "@/components/tui/box";
import { TuiButton } from "@/components/tui/tui-button";
import { getPublishedPosts } from "@/lib/blog";
import { tone } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { docHref, getIntegration, getIntegrations, productHref, type Integration } from "@/lib/nav";
import { absolute, alternates, baseOpenGraph, defaultOgImage, JsonLd, organization } from "@/lib/seo";

const COPY = {
  en: {
    integrations: "integrations",
    title: "Bring the AI you already use.",
    seoTitle: "Integrations: connect Claude, ChatGPT, Codex and Cursor over MCP",
    description:
      "Cybernetics speaks MCP, the open standard AI apps use to reach outside tools. Connect Claude Code, Claude Cowork, ChatGPT, Codex, Cursor or any MCP client to your knowledge, projects and CRM, and switch models without moving your data.",
    whatIsMcp: "# what's mcp?",
    mcpLine:
      "The Model Context Protocol is a standard way for an AI app to use outside tools. Each Cybernetics module runs an MCP server; you add it to your AI app once, and it can read and write your records when you ask.",
    mcpPost: "MCP in plain English →",
    connectAll: "how connecting works →",
    ours: "# our own agents",
    oursLine: "The Agentic Platform builds custom agents on any model, using the same three modules.",
    oursLink: "agentic platform →",
    register: "Register for early access",
    seoPage: (name: string) => `Connect ${name} to your knowledge, projects and CRM`,
    reads: "# what it reads",
    session: "# an example session",
    sessionTitle: (tab: string) => `you@${tab} — mcp session`,
    you: "you",
    setup: "# set it up",
    setupDoc: (name: string) => `step-by-step: connect ${name} →`,
    others: "# other integrations",
  },
  zh: {
    integrations: "集成",
    title: "带上你已经在用的 AI。",
    seoTitle: "集成：通过 MCP 连接 Claude、ChatGPT、Codex 和 Cursor",
    description:
      "Cybernetics 支持 MCP——AI 应用连接外部工具的开放标准。把 Claude Code、Claude Cowork、ChatGPT、Codex、Cursor 或任何 MCP 客户端连接到你的知识、项目和 CRM，换模型也不用搬数据。",
    whatIsMcp: "# 什么是 mcp？",
    mcpLine:
      "模型上下文协议（MCP）是 AI 应用使用外部工具的标准方式。每个 Cybernetics 模块都运行一个 MCP 服务器；你把它添加到 AI 应用里一次，之后它就能在你需要时读写你的记录。",
    mcpPost: "用大白话讲 MCP →",
    connectAll: "连接是怎么回事 →",
    ours: "# 我们自己的智能体",
    oursLine: "智能体平台可以在任何模型上打造自定义智能体，使用的是同样的三个模块。",
    oursLink: "智能体平台 →",
    register: "注册抢先体验",
    seoPage: (name: string) => `把 ${name} 连接到你的知识、项目和 CRM`,
    reads: "# 它读取什么",
    session: "# 一段示例会话",
    sessionTitle: (tab: string) => `you@${tab} — mcp 会话`,
    you: "你",
    setup: "# 设置",
    setupDoc: (name: string) => `一步一步：连接 ${name} →`,
    others: "# 其他集成",
  },
} satisfies Copy<unknown>;

const link = "text-accent underline decoration-line underline-offset-4 hover:decoration-accent";

const registerHref = (locale: Locale, content: string) =>
  `${localePath(locale, "/register")}?utm_source=integrations&utm_medium=site&utm_campaign=site&utm_content=${content}`;

function Frame({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <SiteNav locale={locale} current="/integrations" />
      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{COPY[locale].integrations}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>
      {children}
      <SiteFooter locale={locale} />
    </main>
  );
}

export function integrationsHomeMetadata(locale: Locale): Metadata {
  const t = COPY[locale];
  return {
    title: t.seoTitle,
    description: t.description,
    alternates: alternates("/integrations", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/integrations"),
      title: t.title,
      description: t.description,
      images: [defaultOgImage],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export function IntegrationsHome({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const integrations = getIntegrations(locale);
  const agents = contentFor(locale).modules.find((m) => m.id === "agent")!;
  const overview = docHref("connect", "overview", locale);
  const mcpPost = getPublishedPosts(locale).some((p) => p.slug === "what-is-mcp-in-plain-english")
    ? localePath(locale, "/blog/what-is-mcp-in-plain-english")
    : undefined;
  return (
    <Frame locale={locale}>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: t.seoTitle,
          url: absolute(localePath(locale, "/integrations")),
          itemListElement: integrations.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, url: absolute(i.href) })),
        }}
      />
      <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {t.title}
      </h1>
      <p className="mt-4 max-w-[72ch] text-dim text-pretty">{t.description}</p>

      <ul className="mt-12 grid gap-6 text-[13px] md:grid-cols-2">
        {integrations.map((i) => (
          <li key={i.slug}>
            <Link href={i.href} className="group block h-full border border-line p-5 transition-colors hover:border-accent">
              <p className="text-xs uppercase tracking-widest text-agent">{i.kind}</p>
              <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <ConsumerIcon icon={i.icon} className="size-5" />
                {i.name}
              </h2>
              <p className="mt-1 text-dim">&gt; {i.headline}</p>
              <p className="mt-3 flex flex-wrap gap-2 text-xs">
                <ModuleBadges ids={i.reads} locale={locale} />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16 text-[13px]">
        <h2 className="text-dim">{t.whatIsMcp}</h2>
        <p className="mt-2 max-w-[72ch] text-pretty">{t.mcpLine}</p>
        <p className="mt-2 flex flex-wrap gap-x-4">
          {mcpPost && (
            <Link href={mcpPost} className={link}>
              {t.mcpPost}
            </Link>
          )}
          {overview && (
            <Link href={overview} className={link}>
              {t.connectAll}
            </Link>
          )}
        </p>
      </section>

      <section className="mt-16 text-[13px]">
        <h2 className="text-dim">{t.ours}</h2>
        <p className="mt-2 max-w-[72ch]">{t.oursLine}</p>
        <p className="mt-2">
          <Link href={productHref(agents, locale)} className={link}>
            {t.oursLink}
          </Link>
        </p>
      </section>

      <div className="mt-14">
        <TuiButton href={registerHref(locale, "overview")} label={t.register} primary />
      </div>
    </Frame>
  );
}

export function integrationMetadata(slug: string, locale: Locale): Metadata {
  const i = getIntegration(slug, locale);
  if (!i) return {};
  const title = COPY[locale].seoPage(i.seoName);
  const description = i.line;
  return {
    title,
    description,
    alternates: alternates(i.href, locale),
    openGraph: { ...baseOpenGraph(locale), url: i.href, title, description, images: [defaultOgImage] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function IntegrationPage({ slug, locale }: { slug: string; locale: Locale }) {
  const t = COPY[locale];
  const i = getIntegration(slug, locale)!;
  const { modules } = contentFor(locale);
  const others = getIntegrations(locale).filter((x) => x.slug !== i.slug);
  return (
    <Frame locale={locale}>
      <JsonLd
        data={{
          "@type": "WebPage",
          name: t.seoPage(i.seoName),
          description: i.line,
          url: absolute(i.href),
          inLanguage: HTML_LANG[locale],
          publisher: organization,
        }}
      />
      <Breadcrumbs
        locale={locale}
        items={[
          { name: t.integrations, href: localePath(locale, "/integrations") },
          { name: i.name.toLowerCase(), href: i.href },
        ]}
      />

      <p className="text-xs uppercase tracking-widest text-agent">{i.kind}</p>
      <h1 className="glow mt-2 flex items-center gap-3 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
        <ConsumerIcon icon={i.icon} className="size-8" />
        {i.name}
      </h1>
      <p className="mt-2 text-dim">&gt; {i.headline}</p>
      <p className="mt-4 max-w-[72ch] text-pretty">{i.line}</p>
      <ul className="mt-4 space-y-1.5 text-[13px]">
        {i.uses.map((u) => (
          <li key={u} className="flex gap-2">
            <span className="text-agent">-</span>
            {u}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <TuiButton href={registerHref(locale, i.slug)} label={t.register} primary />
      </div>

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.reads}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {i.reads.map((id) => {
            const m = modules.find((x) => x.id === id)!;
            return (
              <li key={id}>
                <Link href={productHref(m, locale)} className="block border border-line p-3 transition-colors hover:border-accent">
                  <span style={{ color: tone[id] }}>●</span> {m.name}
                  <span className="mt-1 block text-dim">{m.role.toLowerCase()}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.session}</h2>
        <Session i={i} locale={locale} />
      </section>

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.setup}</h2>
        <Box title={`cat ${i.connect.file}`} className="mt-5" bodyClassName="">
          <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed sm:p-5">
            <code>{i.connect.code}</code>
          </pre>
        </Box>
        {i.docHref && (
          <p className="mt-3">
            <Link href={i.docHref} className={link}>
              {t.setupDoc(i.name)}
            </Link>
          </p>
        )}
      </section>

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.others}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={o.href}
                className="inline-flex items-center gap-1.5 border border-line px-2 py-1 transition-colors hover:border-accent hover:text-accent"
              >
                <ConsumerIcon icon={o.icon} className="size-3.5" />
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Frame>
  );
}

/** The example session, written out in full: the home page animates it, this page doesn't. */
function Session({ i, locale }: { i: Integration; locale: Locale }) {
  const t = COPY[locale];
  return (
    <Box term title={t.sessionTitle(i.tab)} className="mt-5" bodyClassName="space-y-1.5 p-4 text-[12.5px] leading-relaxed sm:p-5">
      {i.session.map((line, n) =>
        line.kind === "prompt" ? (
          <p key={n}>
            <span className="text-agent">{t.you}</span> <span className="text-accent">❯</span> {line.text}
          </p>
        ) : line.kind === "tool" ? (
          <p key={n} className="flex flex-wrap items-center gap-x-2 text-xs">
            <span className="w-3 text-center" style={{ color: tone[line.module] }}>
              ✓
            </span>
            <span>
              <span style={{ color: tone[line.module] }}>{line.server}.</span>
              {line.tool}
            </span>
            <span className="text-dim">→ {line.detail}</span>
          </p>
        ) : (
          <p key={n} className="mt-3 border-l-2 border-agent pl-3 text-pretty">
            {line.text}
          </p>
        ),
      )}
    </Box>
  );
}
