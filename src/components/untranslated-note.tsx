import type { Locale } from "@/lib/i18n";

/** Shown on a Chinese page whose Markdown has no translation yet, above the English it falls back to. */
export function UntranslatedNote({ locale, lang }: { locale: Locale; lang: Locale }) {
  if (locale === lang) return null;
  return (
    <p role="note" lang="zh-CN" className="mb-8 border border-dashed border-line px-3 py-2 text-xs text-dim">
      本页暂无中文版本，以下为英文原文。
    </p>
  );
}
