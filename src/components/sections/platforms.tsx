import { host, modules, screenshots, tone, type ModuleId } from "@/lib/content";
import { ShotWindow } from "../tui/shot-window";
import { Tabs } from "../tui/tabs";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

const FOUNDATION: {
  id: "data" | "proj" | "crm";
  tab: string;
  note: string;
}[] = [
  {
    id: "data",
    tab: "data-base",
    note: "01 · foundation",
  },
  {
    id: "proj",
    tab: "project-mgmt",
    note: "02 · you ↔ your agents",
  },
  { id: "crm", tab: "crm", note: "03 · for your business" },
];

function Platform({
  id,

  note,
}: {
  id: "data" | "proj" | "crm";

  note: string;
}) {
  const m = modules.find((x) => x.id === id)!;
  const partner =
    m.integratesWith && modules.find((x) => x.id === m.integratesWith);
  const screens = (
    <ShotWindow
      shots={screenshots[id]}
      tone={tone[id]}
      name={m.name.toLowerCase()}
    />
  );

  return (
    <article aria-labelledby={`plat-${id}`}>
      <div className="grid items-start gap-x-10 gap-y-6 text-[13px] lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: tone[id] }}
          >
            {note}
          </p>
          <h3
            id={`plat-${id}`}
            className="mt-2 text-3xl font-semibold"
            style={{ color: tone[id] }}
          >
            <span className="text-dim"># </span>
            {m.name}
          </h3>
          <p className="mt-1 text-dim">&gt; {m.tagline}</p>
          <p className="mt-4 text-pretty">{m.description}</p>
        </div>
        <div className="min-w-0 lg:col-span-7 lg:pt-7">
          <ul className="space-y-1.5">
            {m.capabilities.map((c) => (
              <li key={c} className="flex gap-2">
                <span style={{ color: tone[id] }}>-</span>
                {c}
              </li>
            ))}
          </ul>
          {partner && (
            <p
              className="mt-3 text-xs"
              style={{ color: tone[partner.id as ModuleId] }}
            >
              + {partner.name.toLowerCase()} built in
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <TuiButton
              href={m.url}
              label={`open ${m.name.toLowerCase()}`}
              external
            />
            <span className="text-xs text-dim">{host(m.url)}</span>
          </div>
        </div>
      </div>
      <div className="mt-8">{screens}</div>
    </article>
  );
}

export function Modules() {
  return (
    <TuiSection
      id="modules"
      title="Four platforms. One of you."
      command="ps aux | grep cybernetics"
      intro="Each platform runs on its own and ships its own MCP server. Together they share one person — and the fourth, the Agentic Platform, puts it all to work."
    >
      <Tabs
        label="Platforms"
        tabs={FOUNDATION.map((f) => ({
          id: f.id,
          label: f.tab,
          tone: tone[f.id],
          content: <Platform {...f} />,
        }))}
      />
    </TuiSection>
  );
}
