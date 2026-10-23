import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell, ModuleBadges } from "@/components/docs/docs-shell";
import { modules, tone } from "@/lib/content";
import { docSections, getVisibleDocs, getVisibleGuides } from "@/lib/docs";
import { absolute, alternates, baseOpenGraph, JsonLd } from "@/lib/seo";

const TITLE = "Cybernetics docs";
const DESCRIPTION =
  "Connect Claude, ChatGPT, Codex or Cursor to your Data Base, Project Management and CRM, self-host the stack, and learn the workflows.";

export const metadata: Metadata = {
  title: "Docs",
  description: DESCRIPTION,
  alternates: alternates("/docs"),
  openGraph: { ...baseOpenGraph, url: "/docs", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const doors = [
  {
    id: "connect",
    label: "use it",
    title: "Connect your AI",
    line: "You have an account, hosted or your own. Create a token and plug Claude, ChatGPT, Codex, Cursor or the Agentic Platform into your data.",
  },
  {
    id: "self-host",
    label: "host it",
    title: "Self-host the stack",
    line: "Run the Data Base, Project Management, CRM and Agentic Platform on your own server with Docker. For technical users; community supported.",
  },
] as const;

export default function DocsHome() {
  const docs = getVisibleDocs();
  const guides = getVisibleGuides();
  return (
    <DocsShell>
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: TITLE,
          url: absolute("/docs"),
          hasPart: docs.filter((d) => !d.draft).map((d) => ({ "@type": "TechArticle", headline: d.title, url: absolute(d.href) })),
        }}
      />
      <h1 className="glow text-2xl font-semibold tracking-tight sm:text-4xl">
        <span aria-hidden className="text-dim">
          #{" "}
        </span>
        Docs
      </h1>
      <p className="mt-4 max-w-[68ch] text-sm text-dim">{DESCRIPTION}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {doors.map((door) => {
          const first = docs.find((d) => d.section === door.id);
          return (
            <div key={door.id} className="border border-line p-5">
              <p className="text-xs tracking-[0.2em] text-dim uppercase">{door.label}</p>
              <h2 className="mt-2 text-lg font-semibold">{door.title}</h2>
              <p className="mt-2 text-[13px] text-dim">{door.line}</p>
              <p className="mt-4 text-[13px]">
                {first ? (
                  <a href={first.href} className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent">
                    start: {first.title.toLowerCase()} →
                  </a>
                ) : (
                  <span className="text-dim">being written. Follow the blog for updates.</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mt-12" aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-sm text-dim">
          # the four modules
        </h2>
        <ul className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id} className="border-l border-line pl-3">
              <span style={{ color: tone[m.id] }}>●</span> {m.name} <span className="text-dim">— {m.role.toLowerCase()}</span>
              {m.mcpUrl && <span className="block text-xs text-dim">mcp: {m.mcpUrl}</span>}
            </li>
          ))}
        </ul>
      </section>

      {docSections.map((s) => {
        const items = docs.filter((d) => d.section === s.id);
        if (!items.length) return null;
        return (
          <section key={s.id} id={s.id} className="mt-12" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="text-sm text-dim">
              # {s.title.toLowerCase()}
            </h2>
            <ul className="mt-3 space-y-4">
              {items.map((d) => (
                <li key={d.href} className={`border-l pl-4 ${d.draft ? "border-dashed border-red" : "border-line"}`}>
                  <a href={d.href} className="group block">
                    <span className="block group-hover:text-accent">
                      {d.title}
                      {d.draft && <span className="ml-2 text-xs text-red">draft</span>}
                    </span>
                    <span className="block text-[13px] text-dim">{d.description}</span>
                  </a>
                  {d.modules.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <ModuleBadges ids={d.modules} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {guides.length > 0 && (
        <p className="mt-12 text-[13px] text-dim">
          Looking for workflows rather than setup?{" "}
          <Link href="/guides" className="text-accent underline decoration-line underline-offset-4">
            Browse the guides →
          </Link>
        </p>
      )}
    </DocsShell>
  );
}
