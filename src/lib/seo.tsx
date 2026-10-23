import type { Metadata } from "next";
import { AUTHOR, BASE_URL, SITE_NAME } from "./content";

/**
 * Open Graph fields every page shares. A page's `openGraph` replaces the root one
 * instead of merging with it, so pages spread this in.
 */
export const baseOpenGraph = {
  siteName: SITE_NAME,
  locale: "en_AU",
  type: "website",
} satisfies Metadata["openGraph"];

/**
 * The home page card, for pages without their own `opengraph-image` file. Set in
 * config it would override those files, so only such pages use it.
 */
export const defaultOgImage = { url: "/opengraph-image", width: 1200, height: 630, alt: "Cybernetics" };

/**
 * Canonical link plus the RSS feed. Like `openGraph`, a page's `alternates` replaces
 * the parent's, so every page sets its own through this.
 */
export const alternates = (path: string) =>
  ({
    canonical: path,
    types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: "Cyborg Migration" }] },
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
