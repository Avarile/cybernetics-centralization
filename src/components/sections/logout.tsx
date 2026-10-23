import Link from "next/link";
import { pageHref } from "@/lib/blog";
import { hasPublishedDocs, hasPublishedGuides } from "@/lib/docs";
import { host, modules, tone } from "@/lib/content";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

/** Footer links to docs and standalone pages; drafts stay unlinked until published. */
const pageLinks = () => [
  ...(hasPublishedDocs() ? [{ href: "/docs", label: "docs — connect and self-host" }] : []),
  ...(hasPublishedGuides() ? [{ href: "/guides", label: "guides — workflows" }] : []),
  ...[
    { name: "about", label: "about — who builds this" },
    { name: "open-source", label: "open source — credits and code" },
    { name: "privacy", label: "privacy policy" },
  ].flatMap((p) => {
    const href = pageHref(p.name);
    return href ? [{ href, label: p.label }] : [];
  }),
];

export function Logout() {
  return (
    <TuiSection
      id="logout"
      title="Become legible to your agents."
      command="sudo cyborgize --me"
    >
      <div className="text-[13px] sm:text-sm">
        <p className="text-dim">[sudo] password for you: ••••••••</p>
        <p className="mt-1">
          <span className="text-proj">✓</span> welcome, cyborg. start with your
          knowledge and your projects — everything else plugs in when
          you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TuiButton
            href="/register"
            label="Register for early access"
            primary
          />
          <TuiButton href="/blog" label="Read the blog" />
        </div>
      </div>

      <footer className="mt-20 text-[13px]">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-dim"># modules</p>
            <ul className="mt-2 space-y-1">
              {modules.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <span style={{ color: tone[m.id] }}>●</span>{" "}
                    {m.name.toLowerCase()}{" "}
                    <span className="text-dim underline decoration-line underline-offset-4 group-hover:text-accent">
                      {host(m.url)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-dim"># more</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/blog"
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  blog — cyborg migration
                </Link>
              </li>
              <li>
                <a
                  href="#mcp"
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  mcp integration
                </a>
              </li>
              <li>
                <a
                  href="/exocortex"
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  exocortex — the big idea
                </a>
              </li>
              {pageLinks().map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="underline decoration-line underline-offset-4 hover:text-accent"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
              <li className="text-dim">
                press <kbd className="text-accent">:</kbd> anywhere for the
                command palette
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 text-dim">
          <p>
            <span className="text-accent">you@cybernetics</span>:~$ logout
          </p>
          <p>Connection to avarile.com closed.</p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} cybernetics · {modules.length} modules ·{" "}
            {modules.filter((m) => m.mcpUrl).length} mcp servers
            · 1 you
          </p>
        </div>
      </footer>
    </TuiSection>
  );
}
