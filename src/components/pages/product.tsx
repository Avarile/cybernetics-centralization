import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "@/components/chrome/breadcrumbs";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNav } from "@/components/chrome/site-nav";
import { ModuleBadges } from "@/components/docs/docs-shell";
import { ConsumerIcon } from "@/components/sections/mcp";
import { Box } from "@/components/tui/box";
import { FigureEmbed } from "@/components/tui/figure-embed";
import { ShotWindow } from "@/components/tui/shot-window";
import { TuiButton } from "@/components/tui/tui-button";
import { pageHref } from "@/lib/blog";
import { host, tone, type Figure, type Module, type ModuleId } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { getVisibleGuides } from "@/lib/docs";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { docHref, getIntegrations, productHref } from "@/lib/nav";
import { absolute, alternates, baseOpenGraph, defaultOgImage, JsonLd, organization } from "@/lib/seo";

/** Search title and description per module: what someone would type, not the tagline. */
const SEO: Record<ModuleId, Copy<{ title: string; description: string }>> = {
  data: {
    en: {
      title: "Data Base: a knowledge base your AI agents can read",
      description:
        "One database you own for knowledge, how-tos, references and finances, as linked records that Claude, ChatGPT and any MCP agent can query.",
    },
    zh: {
      title: "数据库：一个 AI 智能体能读懂的知识库",
      description: "一个属于你的数据库，存放知识、操作指南、参考资料和财务，都是相互链接的记录，Claude、ChatGPT 和任何 MCP 智能体都能查询。",
    },
  },
  proj: {
    en: {
      title: "Project Management: assign work to people or AI agents",
      description:
        "Goals, projects, cycles and tasks, with agents as project members. Every task links to the know-how it needs, and any MCP agent can pick it up.",
    },
    zh: {
      title: "项目管理：把工作分配给人或 AI 智能体",
      description: "目标、项目、周期和任务，智能体也是项目成员。每个任务都链接到所需的知识，任何 MCP 智能体都能接手。",
    },
  },
  crm: {
    en: {
      title: "CRM: your contacts and deals, reachable by your AI",
      description: "People, companies, deals, notes and follow-ups, connected to Claude, ChatGPT and any MCP client over OAuth.",
    },
    zh: {
      title: "CRM：你的联系人和商机，AI 随时可查",
      description: "人员、公司、商机、笔记和跟进，通过 OAuth 连接到 Claude、ChatGPT 和任何 MCP 客户端。",
    },
  },
  agent: {
    en: {
      title: "Agentic Platform: custom AI agents on any model",
      description:
        "Build custom agents that use your Data Base, Project Management and CRM over MCP, with skills for repeatable jobs, on whichever model you choose.",
    },
    zh: {
      title: "智能体平台：跑在任何模型上的自定义 AI 智能体",
      description: "打造通过 MCP 使用你的数据库、项目管理和 CRM 的自定义智能体，配上处理可重复工作的技能，跑在你选择的任何模型上。",
    },
  },
};

/** Guides listed on a module page; the rest are a click away. */
const GUIDE_LIMIT = 6;

/** The interactive figure that best shows each module, if any. */
const FIGURE: Partial<Record<ModuleId, string>> = { data: "financeSorter", proj: "agentDispatch", agent: "memoryCatalog" };

const COPY = {
  en: {
    product: "product",
    title: "Four modules. One memory you own.",
    seoTitle: "Product: knowledge, projects, CRM and agents over MCP",
    description:
      "Cybernetics is four modules that share one person: a Data Base for what you know, Project Management for what you do, a CRM for who you work with, and an Agentic Platform for who acts for you. Each one connects to any AI over MCP.",
    more: (name: string) => `more on ${name.toLowerCase()} →`,
    how: "# how they fit together",
    stages: [
      ["capture", "Put what you know into the Data Base and what you intend into Project Management. Agents can do the typing."],
      ["structure", "Link tasks to the how-tos and references they need, and people to the projects they touch."],
      ["delegate", "Connect any MCP-capable agent. It reads your context and acts on it, within data you own."],
    ],
    connect: "# connect your AI",
    connectLine: "Every module that holds data runs its own MCP server, so the AI you already use can read and write it.",
    allIntegrations: "all integrations →",
    openSource: "# built on open source",
    openSourceLine: "Each module is a modified open-source project, and the source of what we run is public.",
    openSourceLink: "see what each module is built on →",
    register: "Register for early access",
    does: "# what it does",
    mcp: "# connect it to your AI",
    endpoint: "endpoint",
    auth: "sign-in",
    authToken: "a personal access token, sent as a header",
    authOauth: "OAuth, in the browser",
    tools: "tools include",
    howConnect: "how to connect →",
    tokens: "access tokens →",
    client: "The Agentic Platform doesn't serve data of its own. It's a client: its agents connect to the other three modules over MCP.",
    clientDoc: "set up the Agentic Platform →",
    worksWith: "# works with",
    guides: "# guides that use it",
    allGuides: "all guides →",
    stack: "# the rest of the stack",
    open: (name: string) => `open ${name.toLowerCase()}`,
  },
  zh: {
    product: "产品",
    title: "四个模块。一份属于你的记忆。",
    seoTitle: "产品：通过 MCP 连接的知识、项目、CRM 和智能体",
    description:
      "Cybernetics 由四个共享同一个人的模块组成：数据库存放你知道的，项目管理承载你在做的，CRM 记住你和谁一起工作，智能体平台负责替你行动。每个模块都能通过 MCP 连接任何 AI。",
    more: (name: string) => `了解${name} →`,
    how: "# 它们如何协同",
    stages: [
      ["采集", "把你知道的放进数据库，把你打算做的放进项目管理。录入可以交给智能体。"],
      ["组织", "把任务链接到它需要的操作指南和参考资料，把人链接到他们参与的项目。"],
      ["委派", "连接任何支持 MCP 的智能体。它读取你的上下文并据此行动——始终在你拥有的数据之内。"],
    ],
    connect: "# 连接你的 AI",
    connectLine: "每个存放数据的模块都运行自己的 MCP 服务器，所以你正在用的 AI 就能读写它。",
    allIntegrations: "全部集成 →",
    openSource: "# 基于开源构建",
    openSourceLine: "每个模块都是修改过的开源项目，我们运行的源代码是公开的。",
    openSourceLink: "看看每个模块基于什么构建 →",
    register: "注册抢先体验",
    does: "# 它能做什么",
    mcp: "# 把它连接到你的 AI",
    endpoint: "端点",
    auth: "登录方式",
    authToken: "个人访问令牌，通过请求头发送",
    authOauth: "OAuth，在浏览器中登录",
    tools: "工具包括",
    howConnect: "如何连接 →",
    tokens: "访问令牌 →",
    client: "智能体平台本身不存放数据。它是一个客户端：它的智能体通过 MCP 连接另外三个模块。",
    clientDoc: "设置智能体平台 →",
    worksWith: "# 可以搭配",
    guides: "# 用到它的指南",
    allGuides: "全部指南 →",
    stack: "# 其余模块",
    open: (name: string) => `打开${name}`,
  },
} satisfies Copy<unknown>;

const NOTE: Record<ModuleId, Copy<string>> = {
  data: { en: "01 · foundation", zh: "01 · 地基" },
  proj: { en: "02 · you ↔ your agents", zh: "02 · 你 ↔ 你的智能体" },
  crm: { en: "03 · for your business", zh: "03 · 为你的业务" },
  agent: { en: "04 · where it comes together", zh: "04 · 一切在这里汇合" },
};

const registerHref = (locale: Locale, content: string) =>
  `${localePath(locale, "/register")}?utm_source=product&utm_medium=site&utm_campaign=site&utm_content=${content}`;

const link = "text-accent underline decoration-line underline-offset-4 hover:decoration-accent";

function Frame({ label, locale, children }: { label: string; locale: Locale; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <SiteNav locale={locale} current="/product" />
      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{label}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>
      {children}
      <SiteFooter locale={locale} />
    </main>
  );
}

export function productHomeMetadata(locale: Locale): Metadata {
  const t = COPY[locale];
  return {
    title: t.seoTitle,
    description: t.description,
    alternates: alternates("/product", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/product"),
      title: t.title,
      description: t.description,
      images: [defaultOgImage],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export function ProductHome({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const { modules } = contentFor(locale);
  const integrations = getIntegrations(locale);
  const openSource = pageHref("open-source", locale);
  return (
    <Frame label={t.product} locale={locale}>
      <JsonLd
        data={{
          "@type": "ItemList",
          name: t.title,
          url: absolute(localePath(locale, "/product")),
          itemListElement: modules.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.name,
            url: absolute(productHref(m, locale)),
          })),
        }}
      />
      <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {t.title}
      </h1>
      <p className="mt-4 max-w-[72ch] text-dim text-pretty">{t.description}</p>

      <div className="mt-12 grid gap-6 text-[13px] md:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={productHref(m, locale)}
            className="group block border border-line p-5 transition-colors hover:border-[var(--tone)]"
            style={{ "--tone": tone[m.id] } as CSSProperties}
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: tone[m.id] }}>
              {NOTE[m.id][locale]}
            </p>
            <h2 className="mt-2 text-xl font-semibold" style={{ color: tone[m.id] }}>
              {m.name}
            </h2>
            <p className="mt-1 text-dim">&gt; {m.tagline}</p>
            <p className="mt-3 text-pretty">{m.description}</p>
            <p className="mt-4 text-accent group-hover:underline">{t.more(m.name)}</p>
          </Link>
        ))}
      </div>

      <section className="mt-16 text-[13px]">
        <h2 className="text-dim">{t.how}</h2>
        <ol className="mt-3 grid gap-4 md:grid-cols-3">
          {t.stages.map(([stage, text], i) => (
            <li key={stage} className="border-l border-line pl-3">
              <span className="text-accent">
                {i + 1}. {stage}
              </span>
              <p className="mt-1 text-pretty">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 text-[13px]">
        <h2 className="text-dim">{t.connect}</h2>
        <p className="mt-2 max-w-[72ch]">{t.connectLine}</p>
        <IntegrationChips integrations={integrations} />
        <p className="mt-4">
          <Link href={localePath(locale, "/integrations")} className={link}>
            {t.allIntegrations}
          </Link>
        </p>
      </section>

      {openSource && (
        <section className="mt-16 text-[13px]">
          <h2 className="text-dim">{t.openSource}</h2>
          <p className="mt-2 max-w-[72ch]">{t.openSourceLine}</p>
          <p className="mt-2">
            <Link href={openSource} className={link}>
              {t.openSourceLink}
            </Link>
          </p>
        </section>
      )}

      <div className="mt-14">
        <TuiButton href={registerHref(locale, "overview")} label={t.register} primary />
      </div>
    </Frame>
  );
}

function IntegrationChips({ integrations }: { integrations: ReturnType<typeof getIntegrations> }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {integrations.map((i) => (
        <li key={i.slug}>
          <Link
            href={i.href}
            className="inline-flex items-center gap-1.5 border border-line px-2 py-1 transition-colors hover:border-accent hover:text-accent"
          >
            <ConsumerIcon icon={i.icon} className="size-3.5" />
            {i.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export const productSlugs = () => contentFor("en").modules.map((m) => m.slug);

const findModule = (slug: string, locale: Locale) => contentFor(locale).modules.find((m) => m.slug === slug);

export function productMetadata(slug: string, locale: Locale): Metadata {
  const m = findModule(slug, locale);
  if (!m) return {};
  const { title, description } = SEO[m.id][locale];
  const path = productHref(m, locale);
  return {
    title,
    description,
    alternates: alternates(path, locale),
    openGraph: { ...baseOpenGraph(locale), url: path, title, description, images: [defaultOgImage] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function ProductPage({ slug, locale }: { slug: string; locale: Locale }) {
  const t = COPY[locale];
  const { modules, screenshots, figures } = contentFor(locale);
  const m = findModule(slug, locale)!;
  const path = productHref(m, locale);
  const shots = m.id === "agent" ? [] : screenshots[m.id];
  const figureKey = FIGURE[m.id];
  const figure: Figure | undefined = figureKey ? figures[figureKey] : undefined;
  const integrations = getIntegrations(locale).filter((i) => m.id === "agent" || i.reads.includes(m.id));
  const guides = getVisibleGuides(locale).filter((g) => g.modules.includes(m.id));
  const shownGuides = guides.slice(0, GUIDE_LIMIT);
  const others = modules.filter((x) => x.id !== m.id);

  return (
    <Frame label={t.product} locale={locale}>
      <JsonLd
        data={{
          "@type": "WebPage",
          name: SEO[m.id][locale].title,
          description: SEO[m.id][locale].description,
          url: absolute(path),
          inLanguage: HTML_LANG[locale],
          about: { "@type": "SoftwareApplication", name: `Cybernetics ${m.name}`, applicationCategory: "BusinessApplication", url: m.url },
          publisher: organization,
        }}
      />
      <Breadcrumbs
        locale={locale}
        items={[
          { name: t.product, href: localePath(locale, "/product") },
          { name: m.name.toLowerCase(), href: path },
        ]}
      />

      <p className="text-xs uppercase tracking-widest" style={{ color: tone[m.id] }}>
        {NOTE[m.id][locale]} · {m.role.toLowerCase()}
      </p>
      <h1 className="glow mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-4xl" style={{ color: tone[m.id] }}>
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {m.name}
      </h1>
      <p className="mt-2 text-dim">&gt; {m.tagline}</p>
      <p className="mt-4 max-w-[72ch] text-pretty">{m.description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <TuiButton href={registerHref(locale, m.slug)} label={t.register} primary />
        <TuiButton href={m.url} label={t.open(m.name)} external />
        <span className="text-xs text-dim">{host(m.url)}</span>
      </div>

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.does}</h2>
        <ul className="mt-3 space-y-1.5">
          {m.capabilities.map((c) => (
            <li key={c} className="flex gap-2">
              <span style={{ color: tone[m.id] }}>-</span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {shots.length > 0 && (
        <div className="mt-10">
          <ShotWindow shots={shots} tone={tone[m.id]} name={m.name.toLowerCase()} />
        </div>
      )}
      {figure && (
        <div className="mt-10">
          <FigureEmbed figure={figure} tone={tone[m.id]} />
        </div>
      )}

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.mcp}</h2>
        <McpDetails m={m} locale={locale} />
      </section>

      {integrations.length > 0 && (
        <section className="mt-14 text-[13px]">
          <h2 className="text-dim">{t.worksWith}</h2>
          <IntegrationChips integrations={integrations} />
        </section>
      )}

      {guides.length > 0 && (
        <section className="mt-14 text-[13px]">
          <h2 className="text-dim">{t.guides}</h2>
          <ul className="mt-3 space-y-2">
            {shownGuides.map((g) => (
              <li key={g.slug} className="border-l border-line pl-3">
                <Link href={g.href} className={link}>
                  {g.title}
                </Link>
                {g.draft && <span className="ml-2 text-[11px] text-red">draft</span>}
                {g.dek && <p className="mt-0.5 text-dim text-pretty">{g.dek}</p>}
              </li>
            ))}
          </ul>
          {guides.length > shownGuides.length && (
            <p className="mt-3">
              <Link href={localePath(locale, "/guides")} className={link}>
                {t.allGuides}
              </Link>
            </p>
          )}
        </section>
      )}

      <section className="mt-14 text-[13px]">
        <h2 className="text-dim">{t.stack}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.id}>
              <Link href={productHref(o, locale)} className="group block border border-line p-3 transition-colors hover:border-accent">
                <span style={{ color: tone[o.id] }}>●</span> {o.name}
                <span className="mt-1 block text-dim">{o.role.toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Frame>
  );
}

function McpDetails({ m, locale }: { m: Module; locale: Locale }) {
  const t = COPY[locale];
  if (!m.mcpUrl) {
    const setup = docHref("connect", "agentic-platform", locale);
    return (
      <>
        <p className="mt-2 max-w-[72ch]">{t.client}</p>
        <p className="mt-3 flex flex-wrap items-center gap-2">
          <ModuleBadges ids={["data", "proj", "crm"]} locale={locale} />
        </p>
        {setup && (
          <p className="mt-3">
            <Link href={setup} className={link}>
              {t.clientDoc}
            </Link>
          </p>
        )}
      </>
    );
  }
  const overview = docHref("connect", "overview", locale);
  const tokens = m.mcpAuth === "token" ? docHref("connect", "access-tokens", locale) : undefined;
  return (
    <>
      <Box className="mt-4" bodyClassName="space-y-1 p-4 text-[12.5px]">
        <p>
          <span className="text-dim">{t.endpoint}: </span>
          <code style={{ color: tone[m.id] }}>{m.mcpUrl}</code>
        </p>
        <p>
          <span className="text-dim">{t.auth}: </span>
          {m.mcpAuth === "oauth" ? t.authOauth : t.authToken}
        </p>
        <p>
          <span className="text-dim">{t.tools}: </span>
          {m.mcpTools.join(" · ")}
        </p>
      </Box>
      {(overview || tokens) && (
        <p className="mt-3 flex flex-wrap gap-x-4">
          {overview && (
            <Link href={overview} className={link}>
              {t.howConnect}
            </Link>
          )}
          {tokens && (
            <Link href={tokens} className={link}>
              {t.tokens}
            </Link>
          )}
        </p>
      )}
    </>
  );
}
