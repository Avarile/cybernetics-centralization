import type { Metadata } from "next";
import { TuiButton } from "@/components/tui/tui-button";
import { localePath, type Copy, type Locale } from "@/lib/i18n";
import { alternates, baseOpenGraph, defaultOgImage } from "@/lib/seo";

const COPY: Copy<{ title: string; description: string }> = {
  en: { title: "Exocortex", description: "A basic idea of the exocortex, shown rather than explained." },
  zh: { title: "外脑", description: "外脑的基本理念——不是讲出来，而是演给你看。" },
};

export function exocortexMetadata(locale: Locale): Metadata {
  const { title, description } = COPY[locale];
  return {
    title,
    description,
    alternates: alternates("/exocortex", locale),
    openGraph: { ...baseOpenGraph(locale), url: localePath(locale, "/exocortex"), title, description, images: [defaultOgImage] },
  };
}

export function Exocortex({ locale }: { locale: Locale }) {
  return (
    <div className="fixed inset-0 bg-bg">
      <div className="fixed top-3 left-3 z-10">
        <TuiButton href={localePath(locale, "/")} label="← cybernetics" />
      </div>
      <iframe src="/bundles/exocortex.html" title={COPY[locale].title} className="h-full w-full border-0" />
    </div>
  );
}
