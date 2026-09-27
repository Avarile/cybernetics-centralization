import { host, modules, tone } from "@/lib/content";
import { Box } from "../tui/box";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

export function Modules() {
  return (
    <TuiSection
      id="modules"
      title="Four standalone modules. One of you."
      command="ps aux | grep cybernetics"
      intro="Run any one on its own, or all four together. Each ships its own MCP server, so agents can work with every part of you."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="text-xs text-dim">
            <tr className="border-b border-line">
              <th className="py-1.5 pr-4 font-normal">PID</th>
              <th className="pr-4 font-normal">MODULE</th>
              <th className="hidden pr-4 font-normal sm:table-cell">ROLE</th>
              <th className="pr-4 font-normal">STAT</th>
              <th className="pr-4 font-normal">MCP</th>
              <th className="hidden font-normal md:table-cell">HOST</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr key={m.id} className="border-b border-dashed border-line">
                <td className="py-1.5 pr-4 text-dim">{1001 + i}</td>
                <td className="pr-4" style={{ color: tone[m.id] }}>
                  {m.repo.replace("cybernetics-", "")}
                </td>
                <td className="hidden pr-4 text-dim sm:table-cell">{m.role.toLowerCase()}</td>
                <td className="pr-4">
                  <span className="text-proj">●</span> run
                </td>
                <td className="pr-4">{m.id === "agent" ? <span className="text-dim">client</span> : "✓ /mcp"}</td>
                <td className="hidden md:table-cell">
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent">
                    {host(m.url)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {modules.map((m) => {
          const featured = m.id === "data" || m.id === "proj";
          const partner = m.integratesWith && modules.find((x) => x.id === m.integratesWith);
          return (
            <Box
              key={m.id}
              tone={tone[m.id]}
              title={`${m.repo}/README.md`}
              right={<span className="text-dim">{featured ? "★ core" : "module"}</span>}
              bodyClassName="flex h-full flex-col p-5 text-[13px] sm:p-6"
              className="h-full"
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: tone[m.id] }}>
                {m.role}
              </p>
              <h3 className="glow mt-1 text-2xl font-semibold" style={{ color: tone[m.id] }}>
                <span className="text-dim"># </span>
                {m.name}
              </h3>
              <p className="mt-1 text-dim">&gt; {m.tagline}</p>
              {featured && <p className="mt-4 text-pretty">{m.description}</p>}
              <ul className="mt-4 space-y-1">
                {m.capabilities.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span style={{ color: tone[m.id] }}>-</span>
                    {c}
                  </li>
                ))}
              </ul>
              {partner && (
                <p className="mt-4 text-xs" style={{ color: tone[partner.id] }}>
                  + {partner.name.toLowerCase()} built in
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                <TuiButton href={m.url} label={`open ${m.name.toLowerCase()}`} external />
                <span className="text-xs text-dim">{host(m.url)}</span>
              </div>
            </Box>
          );
        })}
      </div>
    </TuiSection>
  );
}
