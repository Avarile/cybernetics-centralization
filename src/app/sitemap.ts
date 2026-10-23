import type { MetadataRoute } from "next";
import { getPublishedPosts, pageHref } from "@/lib/blog";
import { getAllDocs, getAllGuides } from "@/lib/docs";
import { absolute } from "@/lib/seo";

// Static export: written to out/sitemap.xml at build time.
export const dynamic = "force-static";

/** Published docs and guides, plus their hubs once either has something in it. */
function docsEntries(): MetadataRoute.Sitemap {
  const docs = getAllDocs().filter((d) => !d.draft);
  const guides = getAllGuides().filter((g) => !g.draft);
  const page = (href: string, updated?: string) => ({
    url: absolute(href),
    ...(updated && { lastModified: updated }),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  });
  return [
    ...(docs.length ? [page("/docs")] : []),
    ...docs.map((d) => page(d.href, d.updated)),
    ...(guides.length ? [page("/guides")] : []),
    ...guides.map((g) => page(g.href, g.updated)),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/register"), changeFrequency: "monthly", priority: 0.9 },
    { url: absolute("/blog"), lastModified: posts[0]?.date, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: absolute(`/blog/${p.slug}`),
      lastModified: p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absolute("/exocortex"), changeFrequency: "yearly", priority: 0.4 },
    ...docsEntries(),
    ...["about", "privacy", "open-source"].flatMap((name) => {
      const href = pageHref(name);
      return href ? [{ url: absolute(href), changeFrequency: "yearly" as const, priority: 0.3 }] : [];
    }),
  ];
}
