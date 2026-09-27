"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Fragment, useEffect, useState } from "react";
import { tone, type ModuleId } from "@/lib/content";
import { Spinner } from "../tui/bits";
import { Box } from "../tui/box";
import { TuiSection, useRevealed } from "../tui/tui-section";

type Profile = "standalone" | "together";
type Line = { kind: "Network" | "Container" | "Volume"; name: string; tone?: ModuleId; state: string; note?: string };

const OUTPUT: Record<Profile, Line[]> = {
  standalone: [
    { kind: "Container", name: "data-centre", tone: "data", state: "Started", note: "mcp → /mcp" },
    { kind: "Container", name: "projects", tone: "proj", state: "Started", note: "mcp → /mcp" },
    { kind: "Container", name: "crm", tone: "crm", state: "Started", note: "mcp → /mcp" },
    { kind: "Container", name: "agents", tone: "agent", state: "Started" },
  ],
  together: [
    { kind: "Network", name: "you-mesh", state: "Created" },
    { kind: "Container", name: "data-centre", tone: "data", state: "Started" },
    { kind: "Container", name: "projects", tone: "proj", state: "Started", note: "linked → data-centre" },
    { kind: "Container", name: "crm", tone: "crm", state: "Started", note: "linked → projects" },
    { kind: "Container", name: "agents", tone: "agent", state: "Started", note: "mcp → data, projects, crm" },
    { kind: "Volume", name: "you", state: "Created" },
  ],
};

const SUMMARY: Record<Profile, string> = {
  standalone: "4 independent apps · each useful alone · each with its own MCP server",
  together: "one person · shared links between modules · agents see everything you allow",
};

// Segments: [text, module tone?]
type Seg = [string, ModuleId?];
const DIAGRAM: Record<Profile, Seg[][]> = {
  standalone: [
    [["┌──────┐ ┌──────┐ ┌─────┐ ┌────────┐"]],
    [["│ "], ["data", "data"], [" │ │ "], ["proj", "proj"], [" │ │ "], ["crm", "crm"], [" │ │ "], ["agents", "agent"], [" │"]],
    [["└──────┘ └──────┘ └─────┘ └────────┘"]],
  ],
  together: [
    [["┌──────┐ ┌──────┐ ┌─────┐ ┌────────┐"]],
    [["│ "], ["data", "data"], [" ├─┤ "], ["proj", "proj"], [" ├─┤ "], ["crm", "crm"], [" ├─┤ "], ["agents", "agent"], [" │"]],
    [["└──┬───┘ └──┬───┘ └──┬──┘ └───┬────┘"]],
    [["   └────────┴───┬────┴────────┘"]],
    [["             ["], ["you"], ["]"]],
  ],
};

export function Compose() {
  const [profile, setProfile] = useState<Profile>("together");
  return (
    <TuiSection
      id="compose"
      title="Start with one. Snap in the rest."
      command="docker compose --profile together up -d"
      intro="Every module runs on its own. Put them together and they share one person: tasks link to knowledge, contacts link to projects, agents see the whole picture."
    >
      <div role="radiogroup" aria-label="Compose profile" className="mb-6 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-dim">--profile</span>
        {(["standalone", "together"] as const).map((p) => (
          <button
            key={p}
            role="radio"
            aria-checked={profile === p}
            onClick={() => setProfile(p)}
            className={`px-1 ${profile === p ? "bg-accent text-accent-fg" : "text-accent hover:bg-bg-alt"}`}
          >
            [ {p} ]
          </button>
        ))}
      </div>
      <ComposeRun key={profile} profile={profile} />
    </TuiSection>
  );
}

function ComposeRun({ profile }: { profile: Profile }) {
  const lines = OUTPUT[profile];
  const revealed = useRevealed();
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(0); // lines visible
  const [done, setDone] = useState(0); // lines finished
  const shown = reduce ? lines.length : started;
  const finished = reduce ? lines.length : done;

  useEffect(() => {
    if (!revealed || reduce) return;
    const timers = lines.flatMap((_, i) => [
      setTimeout(() => setStarted(i + 1), i * 260),
      setTimeout(() => setDone(i + 1), i * 260 + 520),
    ]);
    return () => timers.forEach(clearTimeout);
  }, [revealed, reduce, lines]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <Box term title="docker compose" bodyClassName="glow min-h-[13em] p-4 text-[12.5px] sm:p-5">
        <p>
          <span className="text-accent">❯</span> docker compose --profile {profile} up -d
        </p>
        <p className="text-data">
          [+] Running {finished}/{lines.length}
        </p>
        {lines.slice(0, shown).map((l, i) => (
          <p key={l.name + l.kind} className="flex gap-2 whitespace-pre">
            <span className="w-3 text-center">{i < finished ? <span className="text-proj">✔</span> : <Spinner />}</span>
            <span className="w-[9ch] shrink-0 text-dim">{l.kind}</span>
            <span className="w-[12ch] shrink-0" style={{ color: l.tone ? tone[l.tone] : "var(--accent)" }}>
              {l.name}
            </span>
            <span className={i < finished ? "text-proj" : "text-dim"}>{i < finished ? l.state : "Starting"}</span>
            {l.note && i < finished && <span className="hidden truncate text-dim sm:inline">{l.note}</span>}
          </p>
        ))}
        {finished === lines.length && <p className="flicker-in mt-2 text-dim"># {SUMMARY[profile]}</p>}
      </Box>

      <pre aria-hidden className="glow self-center text-[12px] leading-[1.3] text-dim sm:text-[13px]">
        {DIAGRAM[profile].map((row, i) => (
          <div key={i}>
            {row.map(([text, t], j) => (
              <Fragment key={j}>
                {t ? (
                  <span style={{ color: tone[t] }}>{text}</span>
                ) : text === "you" ? (
                  <span className="text-accent">{text}</span>
                ) : (
                  text
                )}
              </Fragment>
            ))}
          </div>
        ))}
      </pre>
    </div>
  );
}
