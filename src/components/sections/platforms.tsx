import { host, tone, type ModuleId } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import type { Copy, Locale } from "@/lib/i18n";
import { ShotWindow } from "../tui/shot-window";
import { Tabs } from "../tui/tabs";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

const FOUNDATION: {
  id: "data" | "proj" | "crm";
  tab: string;
  note: Copy<string>;
}[] = [
  {
    id: "data",
    tab: "data-base",
    note: { en: "01 · foundation", zh: "01 · 地基" },
  },
  {
    id: "proj",
    tab: "project-mgmt",
    note: { en: "02 · you ↔ your agents", zh: "02 · 你 ↔ 你的智能体" },
  },
  { id: "crm", tab: "crm", note: { en: "03 · for your business", zh: "03 · 为你的业务" } },
];

const COPY = {
  en: {
    title: "Four platforms. One of you.",
    intro:
      "Each platform runs on its own and ships its own MCP server. Together they share one person — and the fourth, the Agentic Platform, puts it all to work.",
    tabs: "Platforms",
    builtIn: (name: string) => `+ ${name.toLowerCase()} built in`,
    open: (name: string) => `open ${name.toLowerCase()}`,
  },
  zh: {
    title: "四个平台。同一个你。",
    intro: "每个平台都能独立运行，并各自带有 MCP 服务器。它们共享同一个人——而第四个，智能体平台，让这一切运转起来。",
    tabs: "平台",
    builtIn: (name: string) => `+ 内置${name}`,
    open: (name: string) => `打开${name}`,
  },
} satisfies Copy<unknown>;

function Platform({ id, note, locale }: { id: "data" | "proj" | "crm"; note: string; locale: Locale }) {
  const { modules, screenshots } = contentFor(locale);
  const t = COPY[locale];
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
              {t.builtIn(partner.name)}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <TuiButton
              href={m.url}
              label={t.open(m.name)}
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

export function Modules({ locale = "en" }: { locale?: Locale }) {
  const t = COPY[locale];
  return (
    <TuiSection id="modules" title={t.title} command="ps aux | grep cybernetics" intro={t.intro}>
      <Tabs
        label={t.tabs}
        tabs={FOUNDATION.map((f) => ({
          id: f.id,
          label: f.tab,
          tone: tone[f.id],
          content: <Platform id={f.id} note={f.note[locale]} locale={locale} />,
        }))}
      />
    </TuiSection>
  );
}
