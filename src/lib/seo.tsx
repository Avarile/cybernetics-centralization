import type { Metadata } from "next";
import { AUTHOR, BASE_URL, SITE_NAME } from "./content";
import { HTML_LANG, LOCALES, localePath, OG_LOCALE, splitLocale, type Locale } from "./i18n";

/**
 * Open Graph fields every page shares. A page's `openGraph` replaces the root one
 * instead of merging with it, so pages spread this in.
 */
export const baseOpenGraph = (locale: Locale = "en") =>
  ({
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale],
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    type: "website",
  }) satisfies Metadata["openGraph"];

/**
 * The home page card, for pages without their own `opengraph-image` file. Set in
 * config it would override those files, so only such pages use it.
 */
export const defaultOgImage = { url: "/opengraph-image", width: 1200, height: 630, alt: "Cybernetics" };

/** `hreflang` links to the page in every language; English is also the default. */
export const languages = (path: string) => {
  const base = splitLocale(path).path;
  return {
    ...Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], localePath(l, base)])),
    "x-default": base,
  };
};

/**
 * Canonical link, the page in the other language, and the RSS feed. Like `openGraph`, a
 * page's `alternates` replaces the parent's, so every page sets its own through this.
 * `path` may be either language's; the canonical is the one in `locale`.
 */
export const alternates = (path: string, locale: Locale = "en") =>
  ({
    canonical: localePath(locale, splitLocale(path).path),
    languages: languages(path),
    types: {
      "application/rss+xml": [
        { url: localePath(locale, "/blog/feed.xml"), title: locale === "zh" ? "赛博格迁移" : "Cyborg Migration" },
      ],
    },
  }) satisfies Metadata["alternates"];

export const absolute = (path: string) => new URL(path, BASE_URL).toString();

export const author = { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url };

export const organization = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: SITE_NAME,
  url: BASE_URL,
  logo: absolute("/brand/cyborg-figure-3of3.svg"),
};

/** Structured data for search engines, as the Next.js JSON-LD guide renders it. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
