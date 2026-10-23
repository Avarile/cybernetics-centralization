import { getPublishedPosts } from "./blog";
import { AUTHOR } from "./content";
import { HTML_LANG, localePath, type Copy, type Locale } from "./i18n";
import { absolute } from "./seo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CHANNEL: Copy<{ title: string; description: string }> = {
  en: {
    title: "Cyborg Migration",
    description: "Becoming AI-native, one system at a time. My memory. Any mind. Closed loops.",
  },
  zh: {
    title: "赛博格迁移",
    description: "成为 AI 原生，一次一个系统。我的记忆。任何头脑。闭环运转。",
  },
};

/** RSS 2.0 feed of published posts in `locale`, titles and deks only. */
export function rssFeed(locale: Locale) {
  const posts = getPublishedPosts(locale);
  const items = posts
    .map((p) => {
      const url = absolute(localePath(locale, `/blog/${p.slug}`));
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
    <title>${esc(CHANNEL[locale].title)}</title>
    <link>${absolute(localePath(locale, "/blog"))}</link>
    <atom:link href="${absolute(localePath(locale, "/blog/feed.xml"))}" rel="self" type="application/rss+xml" />
    <description>${esc(CHANNEL[locale].description)}</description>
    <language>${HTML_LANG[locale]}</language>
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
