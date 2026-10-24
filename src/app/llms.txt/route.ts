import { getPage, getPublishedPosts, pageHref } from "@/lib/blog";
import { modules, SITE_DESCRIPTION, SITE_NAME } from "@/lib/content";
import { getAllDocs, getAllGuides } from "@/lib/docs";
import { getIntegrations, productHref } from "@/lib/nav";
import { absolute } from "@/lib/seo";

// Static export: written to out/llms.txt at build time.
export const dynamic = "force-static";

const item = (title: string, href: string, note?: string) => `- [${title}](${absolute(href)})${note ? `: ${note}` : ""}`;

/** A map of the site for AI assistants (llmstxt.org): what Cybernetics is, and where to read more. Published pages only. */
export function GET() {
  const docs = getAllDocs().filter((d) => !d.draft);
  const guides = getAllGuides().filter((g) => !g.draft);
  const posts = getPublishedPosts();
  const pages = ["pricing", "security", "about", "contact", "open-source", "privacy", "terms"].flatMap((name) => {
    const href = pageHref(name);
    return href ? [item(getPage(name).title, href, getPage(name).dek)] : [];
  });

  const sections: [string, string[]][] = [
    ["Product", [item("Overview", "/product"), ...modules.map((m) => item(m.name, productHref(m), `${m.role}. ${m.tagline}`))]],
    ["Integrations", [item("All integrations", "/integrations"), ...getIntegrations().map((i) => item(i.name, i.href, i.headline))]],
    ["Docs", docs.map((d) => item(d.title, d.href, d.description))],
    ["Guides", guides.map((g) => item(g.title, g.href, g.dek))],
    ["Blog", posts.map((p) => item(p.title, `/blog/${p.slug}`, p.dek))],
    ["Company", pages],
  ];

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Cybernetics is four modules that share one person: a Data Base for what you know, Project Management for what you do, a CRM for who you work with, and an Agentic Platform for custom agents. Each module that holds data runs its own MCP server, so Claude, ChatGPT, Codex, Cursor or any MCP client can read and write it. Data stays on servers Cybernetics operates, not on an AI platform. It's in early access: register at " +
      absolute("/register") +
      ". A Chinese version of the site is at " +
      absolute("/zh") +
      ".",
    ...sections.filter(([, items]) => items.length).flatMap(([title, items]) => ["", `## ${title}`, "", ...items]),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
