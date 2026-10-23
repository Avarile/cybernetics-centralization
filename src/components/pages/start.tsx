import type { Metadata } from "next";
import { CyborgFigure } from "@/components/blog/cyborg-figure";
import { PrefToggles } from "@/components/chrome/lang-toggle";
import { TuiButton } from "@/components/tui/tui-button";
import { UntranslatedNote } from "@/components/untranslated-note";
import { getPage } from "@/lib/blog";
import { HTML_LANG, localePath, type Copy, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/markdown";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const PDF = "/downloads/cyborg-migration-4-week-checklist.pdf";

const COPY: Copy<{ title: string; description: string; follow: string; pdf: string }> = {
  en: {
    title: "Your 4-week Cyborg Migration",
    description: "The week-by-week checklist and the starter template.",
    follow: "follow the build",
    pdf: "download the PDF",
  },
  zh: {
    title: "你的 4 周赛博格迁移",
    description: "逐周检查清单和入门模板。",
    follow: "关注建造进展",
    pdf: "下载 PDF",
  },
};

// Sign-up reward: linked from the /register success screen, kept out of search.
export function startMetadata(locale: Locale): Metadata {
  const { title, description } = COPY[locale];
  return {
    title,
    description,
    alternates: alternates("/start", locale),
    openGraph: { ...baseOpenGraph(locale), url: localePath(locale, "/start"), title, description, images: [defaultOgImage] },
    robots: { index: false, follow: false },
  };
}

export function Start({ locale }: { locale: Locale }) {
  const page = getPage("start", locale);
  const t = COPY[locale];
  const blog = localePath(locale, "/blog");
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <div className="no-print flex flex-wrap gap-3">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
        <TuiButton href={blog} label={t.follow} />
        <PrefToggles className="ml-auto" />
      </div>

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{page.series}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <UntranslatedNote locale={locale} lang={page.lang} />

      <header className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{page.title}</h1>
          <p className="mt-4 text-dim text-pretty">{page.dek}</p>
          <div className="no-print mt-6">
            <TuiButton href={PDF} label={t.pdf} primary />
          </div>
        </div>
        <CyborgFigure stage={page.stage} locale={locale} className="mx-auto w-44 md:w-full" />
      </header>

      <div lang={HTML_LANG[page.lang]} className="prose-tui mt-12 max-w-[72ch]">
        {renderMarkdown(page.body, { cta: () => null, locale })}
      </div>

      <div className="no-print mt-12 flex flex-wrap gap-3">
        <TuiButton href={PDF} label={t.pdf} primary />
        <TuiButton href={blog} label={t.follow} />
      </div>
    </main>
  );
}
