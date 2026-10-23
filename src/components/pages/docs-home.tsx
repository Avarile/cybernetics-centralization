import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell, ModuleBadges } from "@/components/docs/docs-shell";
import { tone } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { docSections, getVisibleDocs, getVisibleGuides } from "@/lib/docs";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { absolute, alternates, baseOpenGraph, JsonLd } from "@/lib/seo";

type Door = { id: "connect" | "self-host"; label: string; title: string; line: string };

const COPY: Copy<{
  title: string;
  heading: string;
  description: string;
  doors: Door[];
  start: (title: string) => string;
  writing: string;
  modules: string;
  workflows: string;
  browse: string;
}> = {
  en: {
    title: "Cybernetics docs",
    heading: "Docs",
    description:
      "Connect Claude, ChatGPT, Codex or Cursor to your Data Base, Project Management and CRM, self-host the stack, and learn the workflows.",
    doors: [
      {
        id: "connect",
        label: "use it",
        title: "Connect your AI",
        line: "You have an account, hosted or your own. Create a token and plug Claude, ChatGPT, Codex, Cursor or the Agentic Platform into your data.",
      },
      {
        id: "self-host",
        label: "host it",
        title: "Self-host the stack",
        line: "Run the Data Base, Project Management, CRM and Agentic Platform on your own server with Docker. For technical users; community supported.",
      },
    ],
    start: (title) => `start: ${title.toLowerCase()} →`,
    writing: "being written. Follow the blog for updates.",
    modules: "# the four modules",
    workflows: "Looking for workflows rather than setup?",
    browse: "Browse the guides →",
  },
  zh: {
    title: "Cybernetics 文档",
    heading: "文档",
    description:
      "把 Claude、ChatGPT、Codex 或 Cursor 连接到你的数据库、项目管理和 CRM，自托管整套系统，并学习各种工作流。",
    doors: [
      {
        id: "connect",
        label: "使用",
        title: "连接你的 AI",
        line: "你已经有账号，无论是托管的还是自己部署的。创建一个令牌，把 Claude、ChatGPT、Codex、Cursor 或智能体平台接入你的数据。",
      },
      {
        id: "self-host",
        label: "托管",
        title: "自托管整套系统",
        line: "用 Docker 在你自己的服务器上运行数据库、项目管理、CRM 和智能体平台。面向技术用户；由社区提供支持。",
      },
    ],
    start: (title) => `从这里开始：${title} →`,
    writing: "正在撰写中。关注博客获取更新。",
    modules: "# 四个模块",
    workflows: "想看工作流，而不是设置？",
    browse: "浏览指南 →",
  },
};

export function docsHomeMetadata(locale: Locale): Metadata {
  const t = COPY[locale];
  return {
    title: t.heading,
    description: t.description,
    alternates: alternates("/docs", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/docs"),
      title: t.title,
      description: t.description,
      // The share card has no CJK font, so both languages use the English one.
      ...(locale !== "en" && { images: [{ url: "/docs/opengraph-image", width: 1200, height: 630, alt: "Cybernetics docs" }] }),
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export function DocsHome({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const { modules } = contentFor(locale);
  const docs = getVisibleDocs(locale);
  const guides = getVisibleGuides(locale);
  return (
    <DocsShell locale={locale}>
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: t.title,
          url: absolute(localePath(locale, "/docs")),
          inLanguage: HTML_LANG[locale],
          hasPart: docs.filter((d) => !d.draft).map((d) => ({ "@type": "TechArticle", headline: d.title, url: absolute(d.href) })),
        }}
      />
      <h1 className="glow text-2xl font-semibold tracking-tight sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {t.heading}
      </h1>
      <p className="mt-4 max-w-[68ch] text-sm text-dim">{t.description}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {t.doors.map((door) => {
          const first = docs.find((d) => d.section === door.id);
          return (
            <div key={door.id} className="border border-line p-5">
              <p className="text-xs tracking-[0.2em] text-dim uppercase">{door.label}</p>
              <h2 className="mt-2 text-lg font-semibold">{door.title}</h2>
              <p className="mt-2 text-[13px] text-dim">{door.line}</p>
              <p className="mt-4 text-[13px]">
                {first ? (
                  <a href={first.href} className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent">
                    {t.start(first.title)}
                  </a>
                ) : (
                  <span className="text-dim">{t.writing}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mt-12" aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-sm text-dim">
          {t.modules}
        </h2>
        <ul className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id} className="border-l border-line pl-3">
              <span style={{ color: tone[m.id] }}>●</span> {m.name} <span className="text-dim">— {m.role.toLowerCase()}</span>
              {m.mcpUrl && <span className="block text-xs text-dim">mcp: {m.mcpUrl}</span>}
            </li>
          ))}
        </ul>
      </section>

      {docSections(locale).map((s) => {
        const items = docs.filter((d) => d.section === s.id);
        if (!items.length) return null;
        return (
          <section key={s.id} id={s.id} className="mt-12" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="text-sm text-dim">
              # {s.title.toLowerCase()}
            </h2>
            <ul className="mt-3 space-y-4">
              {items.map((d) => (
                <li key={d.href} className={`border-l pl-4 ${d.draft ? "border-dashed border-red" : "border-line"}`}>
                  <a href={d.href} className="group block" lang={HTML_LANG[d.lang]}>
                    <span className="block group-hover:text-accent">
                      {d.title}
                      {d.draft && <span className="ml-2 text-xs text-red">draft</span>}
                    </span>
                    <span className="block text-[13px] text-dim">{d.description}</span>
                  </a>
                  {d.modules.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <ModuleBadges ids={d.modules} locale={locale} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {guides.length > 0 && (
        <p className="mt-12 text-[13px] text-dim">
          {t.workflows}{" "}
          <Link href={localePath(locale, "/guides")} className="text-accent underline decoration-line underline-offset-4">
            {t.browse}
          </Link>
        </p>
      )}
    </DocsShell>
  );
}
