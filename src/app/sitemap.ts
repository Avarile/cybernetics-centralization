import type { MetadataRoute } from "next";
import { getPublishedPosts, pageHref } from "@/lib/blog";
import { absolute } from "@/lib/seo";

// Static export: written to out/sitemap.xml at build time.
export const dynamic = "force-static";

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
    ...["about", "privacy"].flatMap((name) => {
      const href = pageHref(name);
      return href ? [{ url: absolute(href), changeFrequency: "yearly" as const, priority: 0.3 }] : [];
    }),
  ];
}
