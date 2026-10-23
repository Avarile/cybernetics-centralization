/**
 * The site's two languages. English lives at the root (`/blog`), Chinese under `/zh`
 * (`/zh/blog`). It's a static export, so there's no server to pick one by
 * Accept-Language: the language switch links between the two copies of each page.
 */
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

/** `<html lang>` and `hreflang` values. */
export const HTML_LANG: Record<Locale, string> = { en: "en", zh: "zh-CN" };

/** Open Graph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_AU", zh: "zh_CN" };

/** The switch shows each language in itself. */
export const LOCALE_NAME: Record<Locale, string> = { en: "en", zh: "中文" };

const ZH = /^\/zh(?=\/|$)/;

/**
 * A site page's path in `locale`: "/blog" → "/zh/blog", "/" → "/zh". Only for pages;
 * files in public/ (screens, downloads, figures) have one copy and keep their path.
 * Anchors, queries and external URLs pass through.
 */
export function localePath(locale: Locale, path: string) {
  if (locale === "en" || !path.startsWith("/") || ZH.test(path)) return path;
  return path === "/" ? "/zh" : `/zh${path}`;
}

/** The language a pathname is in, and the path without its `/zh` prefix. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  return ZH.test(pathname)
    ? { locale: "zh", path: pathname.replace(ZH, "") || "/" }
    : { locale: "en", path: pathname };
}

/** The same page in the other language. */
export const switchLocalePath = (pathname: string, to: Locale) => localePath(to, splitLocale(pathname).path);

/** A string in each language, for copy that sits next to the code using it. */
export type Copy<T> = Record<Locale, T>;
