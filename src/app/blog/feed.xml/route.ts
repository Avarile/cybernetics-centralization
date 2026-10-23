import { getPublishedPosts } from "@/lib/blog";
import { AUTHOR } from "@/lib/content";
import { absolute } from "@/lib/seo";

// Static export: written to out/blog/feed.xml at build time.
export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of published posts, titles and deks only. */
export function GET() {
  const posts = getPublishedPosts();
  const items = posts
    .map((p) => {
      const url = absolute(`/blog/${p.slug}`);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.dek)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${esc(AUTHOR.name)}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Cyborg Migration</title>
    <link>${absolute("/blog")}</link>
    <atom:link href="${absolute("/blog/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>Becoming AI-native, one system at a time. My memory. Any mind. Closed loops.</description>
    <language>en</language>
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
