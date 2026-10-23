import { cyborgFigureSvg, migrationBarSvg, type FigureStage } from "@/lib/cyborg-figure";
import type { Locale } from "@/lib/i18n";

// Theme tokens instead of the creatives' fixed greys, so the figure follows paper/phosphor.
const THEMED = { outline: "var(--dim)", solid: "var(--fg)" };

/** The Cyborg Migration figure with its migration bar. Static SVG from our own source. */
export function CyborgFigure({
  stage,
  locale = "en",
  className = "",
}: {
  stage: FigureStage;
  locale?: Locale;
  className?: string;
}) {
  return (
    <figure aria-hidden className={`glow flex flex-col items-center gap-3 ${className}`}>
      <span className="block w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: cyborgFigureSvg(stage, THEMED) }} />
      <span className="flex items-center gap-2 text-[11px] tracking-[0.2em] whitespace-nowrap text-dim uppercase">
        <span dangerouslySetInnerHTML={{ __html: migrationBarSvg(stage, THEMED, 96) }} />
        {locale === "zh" ? "迁移" : "migration"} {stage}/3
      </span>
    </figure>
  );
}
