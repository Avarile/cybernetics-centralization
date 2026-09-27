"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { RotateCcw } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { mcpSnippets, tone, transcript } from "@/lib/content";
import { Cursor, Spinner } from "../tui/bits";
import { Box } from "../tui/box";
import { TuiSection, useRevealed } from "../tui/tui-section";

export function Mcp() {
  return (
    <TuiSection
      id="mcp"
      title="Every module speaks MCP."
      command="mcp connect --all"
      intro="Point any MCP-capable agent — Claude, Cursor, or Cybernetics Agents — at your modules. One request can reach across your knowledge, your projects and your people."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <ConfigWindows />
        <AgentSession />
      </div>
    </TuiSection>
  );
}

/** Configs as tmux windows: `1:claude-code 2:cursor 3:agents`. */
function ConfigWindows() {
  const [active, setActive] = useState(0);
  const snippet = mcpSnippets[active];

  return (
    <Box title={`cat ${snippet.file === "terminal" ? "setup.sh" : snippet.file}`} bodyClassName="flex h-full flex-col">
      <pre className="flex-1 overflow-x-auto p-4 text-[12.5px] leading-relaxed sm:p-5">
        <code>{snippet.code}</code>
      </pre>
      <div role="tablist" aria-label="MCP client" className="flex flex-wrap border-t border-line bg-bg-alt text-xs">
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
        bodyClassName="glow space-y-1.5 p-4 text-[12.5px] leading-relaxed sm:p-5"
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
          <span className="text-agent">you</span> <span className="text-accent">❯</span> {prompt.slice(0, typedCount)}
          {typedCount < prompt.length && <Cursor />}
        </p>
        <div aria-live="polite" className="space-y-1.5">
          {rest.slice(0, shownCount).map((line, i) =>
            line.kind === "tool" ? (
              <p key={`${run}-${i}`} className="flicker-in flex items-center gap-2 text-xs">
                <span className="w-3 text-center">
                  {i < resolvedCount ? <span style={{ color: tone[line.module] }}>✓</span> : <Spinner />}
                </span>
                <span>
                  <span style={{ color: tone[line.module] }}>{line.server}.</span>
                  {line.tool}
                </span>
                <span className="hidden truncate text-dim sm:inline">→ {line.detail}</span>
              </p>
            ) : line.kind === "reply" ? (
              <p key={`${run}-${i}`} className="flicker-in mt-3 border-l-2 border-agent pl-3 text-pretty">
                {line.text}
              </p>
            ) : null,
          )}
        </div>
        {finished && (
          <p className="pt-2">
            <span className="text-agent">you</span> <span className="text-accent">❯</span> <Cursor />
          </p>
        )}
      </Box>
    </div>
  );
}
