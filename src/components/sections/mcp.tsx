"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { RotateCcw } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { mcpSnippets, modules, tone, transcript } from "@/lib/content";
import { Cursor, Spinner } from "../tui/bits";
import { Box } from "../tui/box";
import { Tabs } from "../tui/tabs";
import { TuiSection, useRevealed } from "../tui/tui-section";

const SKILLS = [
  "weekly-report",
  "launch-planner",
  "pdca-retro",
  "statement-sorter",
];

export function Mcp() {
  return (
    <TuiSection
      id="mcp"
      title="The Agentic Platform: where it all comes together."
      command="mcp connect --all --skills"
      intro="Knowledge from the Data Base, work from Project Management and relationships from the CRM converge here. Custom agents read all three over MCP and use skills for the harder jobs — on any model you choose."
    >
      <Hub />
      <Tabs
        className="mt-12"
        label="Agentic Platform views"
        tabs={[
          {
            id: "session",
            label: "agent-session",
            tone: tone.agent,
            content: <AgentSession />,
          },
          {
            id: "connect",
            label: "connect",
            tone: tone.agent,
            content: <ConfigWindows />,
          },
        ]}
      />
    </TuiSection>
  );
}

/** Three sources → MCP + skills → custom agents. */
function Hub() {
  const sources = (["data", "proj", "crm"] as const).map((id) =>
    modules.find((m) => m.id === id)!,
  );
  const arrow = (color: string) => (
    <div
      aria-hidden
      className="flex flex-col items-center leading-none"
      style={{ color }}
    >
      <span>│</span>
      <span>│</span>
      <span>▼</span>
    </div>
  );
  return (
    <div className="text-[13px]">
      <div className="grid gap-6 md:grid-cols-3">
        {sources.map((m) => (
          <div key={m.id}>
            <Box
              tone={tone[m.id]}
              title={m.repo
                .replace("cybernetics-", "")
                .replace("data-centre", "data-base")}
              bodyClassName="p-4"
            >
              <p className="font-semibold" style={{ color: tone[m.id] }}>
                {m.name}
              </p>
              <p className="mt-1 text-xs text-dim">{m.role.toLowerCase()}</p>
              <p className="mt-3 text-xs">
                <span className="text-dim">mcp ▸ </span>
                {m.mcpTools[0]}
              </p>
            </Box>
            <div className="mt-1 max-md:hidden">{arrow(tone[m.id])}</div>
          </div>
        ))}
      </div>
      <Box
        term
        tone={tone.agent}
        title="agentic-platform"
        className="mt-1"
        bodyClassName="p-5 sm:p-6"
      >
        <div className="grid gap-6 md:grid-cols-[1fr_1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-widest text-agent">MCP</p>
            <p className="mt-2 text-dim">
              One protocol into every platform. Per-user tokens decide what each
              agent may see.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-agent">
              Skills
            </p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {SKILLS.map((k) => (
                <span
                  key={k}
                  className="border border-line bg-bg-alt px-1.5 text-xs"
                >
                  {k}
                </span>
              ))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-agent">
              Custom agents
            </p>
            <p className="mt-2 text-dim">
              Build agents for your own jobs. Bring any model; your data never
              leaves your database.
            </p>
          </div>
        </div>
      </Box>
    </div>
  );
}

/** Configs as tmux windows: `1:claude-code 2:cursor 3:agents`. */
function ConfigWindows() {
  const [active, setActive] = useState(0);
  const snippet = mcpSnippets[active];

  return (
    <Box
      title={`cat ${snippet.file === "terminal" ? "setup.sh" : snippet.file}`}
      bodyClassName="flex h-full flex-col"
    >
      <pre className="flex-1 overflow-x-auto p-4 text-[12.5px] leading-relaxed sm:p-5">
        <code>{snippet.code}</code>
      </pre>
      <div
        role="tablist"
        aria-label="MCP client"
        className="flex flex-wrap border-t border-line bg-bg-alt text-xs"
      >
        {mcpSnippets.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 transition-colors ${i === active ? "bg-fg text-bg" : "text-dim hover:text-fg"}`}
          >
            {i + 1}:{s.label.toLowerCase().replace(/\s+/g, "-")}
            {i === active ? "*" : ""}
          </button>
        ))}
      </div>
    </Box>
  );
}

const prompt = transcript[0].kind === "prompt" ? transcript[0].text : "";
const rest = transcript.slice(1);
const TYPE_MS = 28;
const TOOL_MS = 750;

function AgentSession() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const revealed = useRevealed();
  const reduce = useReducedMotion();

  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [run, setRun] = useState(0);

  const typedCount = reduce ? prompt.length : typed;
  const shownCount = reduce ? rest.length : shown;
  const resolvedCount = reduce ? rest.length : resolved;
  const finished = shownCount === rest.length;

  useEffect(() => {
    if (!inView || !revealed || reduce) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      setTyped(0);
      setShown(0);
      setResolved(0);
      await wait(300);
      for (let i = 1; i <= prompt.length && !cancelled; i++) {
        setTyped(i);
        await wait(TYPE_MS);
      }
      for (let i = 0; i < rest.length && !cancelled; i++) {
        await wait(250);
        if (cancelled) return;
        setShown(i + 1);
        if (rest[i].kind === "tool") {
          await wait(TOOL_MS);
          if (cancelled) return;
          setResolved(i + 1);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, revealed, reduce, run]);

  return (
    <div ref={ref} className="min-w-0">
      <Box
        term
        title="agent@cybernetics — mcp session"
        className="h-full"
        bodyClassName="space-y-1.5 p-4 text-[12.5px] leading-relaxed sm:p-5"
        right={
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            disabled={!finished || !!reduce}
            aria-label="Replay the session"
            className="flex items-center gap-1 text-dim transition-opacity hover:text-fg disabled:opacity-0"
          >
            <RotateCcw className="size-3" aria-hidden /> replay
          </button>
        }
      >
        <p>
          <span className="text-agent">you</span>{" "}
          <span className="text-accent">❯</span> {prompt.slice(0, typedCount)}
          {typedCount < prompt.length && <Cursor />}
        </p>
        <div aria-live="polite" className="space-y-1.5">
          {rest.slice(0, shownCount).map((line, i) =>
            line.kind === "tool" ? (
              <p
                key={`${run}-${i}`}
                className="flicker-in flex items-center gap-2 text-xs"
              >
                <span className="w-3 text-center">
                  {i < resolvedCount ? (
                    <span style={{ color: tone[line.module] }}>✓</span>
                  ) : (
                    <Spinner />
                  )}
                </span>
                <span>
                  <span style={{ color: tone[line.module] }}>
                    {line.server}.
                  </span>
                  {line.tool}
                </span>
                <span className="hidden truncate text-dim sm:inline">
                  → {line.detail}
                </span>
              </p>
            ) : line.kind === "reply" ? (
              <p
                key={`${run}-${i}`}
                className="flicker-in mt-3 border-l-2 border-agent pl-3 text-pretty"
              >
                {line.text}
              </p>
            ) : null,
          )}
        </div>
        {finished && (
          <p className="pt-2">
            <span className="text-agent">you</span>{" "}
            <span className="text-accent">❯</span> <Cursor />
          </p>
        )}
      </Box>
    </div>
  );
}
