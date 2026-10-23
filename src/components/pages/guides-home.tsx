import type { Metadata } from "next";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { GuideList } from "@/components/docs/guide-list";
import { TuiButton } from "@/components/tui/tui-button";
import { contentFor } from "@/lib/content-i18n";
import { getVisibleGuides } from "@/lib/docs";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { absolute, alternates, baseOpenGraph, JsonLd } from "@/lib/seo";

const COPY: Copy<{ title: string; seoTitle: string; description: string; docs: string }> = {
  en: {
    title: "Guides",
    seoTitle: "Guides: workflows with your AI",
    description:
      "Step-by-step workflows for running your life and work on one memory with any AI: capture, weekly reviews, projects, people, money and agents.",
    docs: "docs",
  },
  zh: {
    title: "指南",
    seoTitle: "指南：与你的 AI 一起工作的流程",
    description: "一步一步的工作流，教你用同一份记忆和任何 AI 打理生活与工作：采集、每周回顾、项目、人脉、财务和智能体。",
    docs: "文档",
  },
};

export function guidesHomeMetadata(locale: Locale): Metadata {
  const t = COPY[locale];
  return {
    title: t.seoTitle,
    description: t.description,
    alternates: alternates("/guides", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/guides"),
      title: t.title,
      description: t.description,
      images: [{ url: "/docs/opengraph-image", width: 1200, height: 630, alt: "Cybernetics docs" }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export function GuidesHome({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const { modules, personas } = contentFor(locale);
  const guides = getVisibleGuides(locale);
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: t.title,
          url: absolute(localePath(locale, "/guides")),
          inLanguage: HTML_LANG[locale],
          hasPart: guides.filter((g) => !g.draft).map((g) => ({ "@type": "Article", headline: g.title, url: absolute(g.href) })),
        }}
      />
      <div className="flex flex-wrap gap-3">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
        <TuiButton href={localePath(locale, "/docs")} label={t.docs} />
        <PrefToggles className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">guides</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <h1 className="glow text-2xl font-semibold tracking-tight sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        {t.title}
      </h1>
      <p className="mt-4 max-w-[68ch] text-sm text-dim">{t.description}</p>

      <GuideList
        personas={personas.map(({ login, name }) => ({ login, name }))}
        guides={guides.map((g) => ({
          href: g.href,
          title: g.title,
          dek: g.dek,
          time: g.time,
          personas: g.personas,
          modules: g.modules.map((id) => ({ id, name: modules.find((m) => m.id === id)!.name })),
          draft: g.draft,
        }))}
      />
    </main>
  );
}
