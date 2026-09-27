import { host, modules, SITE_URL, tone } from "@/lib/content";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

export function Logout() {
  return (
    <TuiSection id="logout" title="Become legible to your agents." command="sudo cyborgize --me">
      <div className="text-[13px] sm:text-sm">
        <p className="text-dim">[sudo] password for you: ••••••••</p>
        <p className="mt-1">
          <span className="text-proj">✓</span> welcome, cyborg. start with your knowledge and your projects — everything
          else plugs in when you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TuiButton href={SITE_URL} label="Get started" primary external />
          <TuiButton href={SITE_URL} label="Read the blog" external />
        </div>
      </div>

      <footer className="mt-20 text-[13px]">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-dim"># modules</p>
            <ul className="mt-2 space-y-1">
              {modules.map((m) => (
                <li key={m.id}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="group">
                    <span style={{ color: tone[m.id] }}>●</span> {m.name.toLowerCase()}{" "}
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
                <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent">
                  {host(SITE_URL)}
                </a>
              </li>
              <li>
                <a href="#mcp" className="underline decoration-line underline-offset-4 hover:text-accent">
                  mcp integration
                </a>
              </li>
              <li className="text-dim">
                press <kbd className="text-accent">:</kbd> anywhere for the command palette
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 text-dim">
          <p>
            <span className="text-accent">you@cybernetics</span>:~$ logout
          </p>
          <p>Connection to cybernetics.avarile.com closed.</p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} cybernetics · 4 modules · 4 mcp servers · 1 you</p>
        </div>
      </footer>
    </TuiSection>
  );
}
