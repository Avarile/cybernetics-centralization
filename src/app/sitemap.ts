import type { MetadataRoute } from "next";
import { getPublishedPosts, pageHref } from "@/lib/blog";
import { getAllDocs, getAllGuides } from "@/lib/docs";
import { LOCALES, localePath } from "@/lib/i18n";
import { absolute, languages } from "@/lib/seo";

// Static export: written to out/sitemap.xml at build time.
export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

/** Published docs and guides, plus their hubs once either has something in it. */
function docsEntries(): Entry[] {
  const docs = getAllDocs().filter((d) => !d.draft);
  const guides = getAllGuides().filter((g) => !g.draft);
  const page = (href: string, updated?: string): Entry => ({
    url: href,
    ...(updated && { lastModified: updated }),
    changeFrequency: "monthly",
    priority: 0.6,
  });
  return [
    ...(docs.length ? [page("/docs")] : []),
    ...docs.map((d) => page(d.href, d.updated)),
    ...(guides.length ? [page("/guides")] : []),
    ...guides.map((g) => page(g.href, g.updated)),
  ];
}

/** Every page once per language, each listing the other through `hreflang` alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  const pages: Entry[] = [
    { url: "/", changeFrequency: "weekly", priority: 1 },
    { url: "/register", changeFrequency: "monthly", priority: 0.9 },
    { url: "/blog", lastModified: posts[0]?.date, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: "/exocortex", changeFrequency: "yearly", priority: 0.4 },
    ...docsEntries(),
    ...["about", "privacy", "open-source"].flatMap((name) => {
      const href = pageHref(name);
      return href ? [{ url: href, changeFrequency: "yearly" as const, priority: 0.3 }] : [];
    }),
  ];
  const links = (path: string) =>
    Object.fromEntries(Object.entries(languages(path)).map(([lang, href]) => [lang, absolute(href)]));
  return LOCALES.flatMap((locale) =>
    pages.map((p) => ({ ...p, url: absolute(localePath(locale, p.url)), alternates: { languages: links(p.url) } })),
  );
}
