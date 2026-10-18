"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Bot, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  consumers,
  modules,
  tone,
  type Consumer,
  type TranscriptLine,
} from "@/lib/content";
import { Cursor, Spinner } from "../tui/bits";
import { Box } from "../tui/box";
import { BrandIcon } from "../tui/brand-icon";
import { TuiSection, useRevealed } from "../tui/tui-section";

export function Mcp() {
  return (
    <TuiSection
      id="mcp"
      title="One memory. Any agent."
      command="mcp connect --all"
      intro="Knowledge from the Data Base, work from Project Management and relationships from the CRM are consumed over MCP — by Claude Code, Codex, ChatGPT, Claude Cowork, our own Agentic Platform or any other MCP client. Your data stays put; the model is your choice."
    >
      <Sources />
      <Consumers />
    </TuiSection>
  );
}

/** The three platforms that serve data over MCP, flowing down into the consumers. */
function Sources() {
  const sources = (["data", "proj", "crm"] as const).map((id) =>
    modules.find((m) => m.id === id)!,
  );
  return (
    <div className="grid gap-6 text-[13px] md:grid-cols-3">
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
          <div
            aria-hidden
            className="mt-1 flex flex-col items-center leading-none max-md:hidden"
            style={{ color: tone[m.id] }}
          >
            <span>│</span>
            <span>│</span>
            <span>▼</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** How long a finished session stays on screen before the next platform. */
const HOLD_MS = 6000;

/** Carousel of LLM platforms, each replaying its own MCP session. */
function Consumers() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const current = consumers[index];
  const done = doneId === current.id;

  // Advance once the current session has played out; hover or focus pauses it.
  useEffect(() => {
    if (reduce || paused || !done) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % consumers.length),
      HOLD_MS,
    );
    return () => clearTimeout(t);
  }, [done, paused, reduce]);

  const go = (i: number) => setIndex((i + consumers.length) % consumers.length);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      (index + (e.key === "ArrowRight" ? 1 : -1) + consumers.length) %
      consumers.length;
    go(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="LLM platforms consuming your data over MCP"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Box
        tone={tone.agent}
        title={`consumer ▸ ${current.name.toLowerCase()}`}
        bodyClassName=""
      >
        <div
          role="tablist"
          aria-label="LLM platforms"
          onKeyDown={onKeyDown}
          className="flex flex-wrap border-b border-line bg-bg-alt text-xs"
        >
          {consumers.map((c, i) => (
            <button
              key={c.id}
              id={`${uid}-tab-${i}`}
              role="tab"
              aria-selected={i === index}
              aria-controls={`${uid}-panel`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                i === index ? "bg-fg text-bg" : "text-dim hover:text-fg"
              }`}
            >
              <ConsumerIcon icon={c.icon} className="size-3.5" />
              {i + 1}:{c.tab}
              {i === index ? "*" : ""}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${index}`}
          className="p-4 sm:p-6"
        >
          <ConsumerSlide
            key={current.id}
            consumer={current}
            onFinished={() => setDoneId(current.id)}
          />
        </div>
      </Box>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-dim">
        <p>
          {reduce ? (
            <>use ← → or the tabs to browse</>
          ) : paused ? (
            <>
              <span className="text-crm">❚❚</span> paused — move away to resume
            </>
          ) : (
            <>
              <span className="text-proj">●</span> auto-playing · {index + 1}/
              {consumers.length}
            </>
          )}
        </p>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous platform"
            className="p-1 hover:text-fg"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next platform"
            className="p-1 hover:text-fg"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </span>
      </div>
    </div>
  );
}

function ConsumerIcon({
  icon,
  className,
}: {
  icon: Consumer["icon"];
  className?: string;
}) {
  return icon === "agent" ? (
    <Bot className={`shrink-0 ${className}`} aria-hidden />
  ) : (
    <BrandIcon name={icon} className={className} />
  );
}

function ConsumerSlide({
  consumer: c,
  onFinished,
}: {
  consumer: Consumer;
  onFinished: () => void;
}) {
  return (
    <article aria-labelledby={`consumer-${c.id}`} className="flicker-in">
      <div className="grid items-start gap-x-10 gap-y-8 text-[13px] lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <p className="text-xs uppercase tracking-widest text-agent">
            {c.kind}
          </p>
          <h3
            id={`consumer-${c.id}`}
            className="mt-2 flex items-center gap-3 text-3xl font-semibold"
          >
            <ConsumerIcon icon={c.icon} className="size-8" />
            {c.name}
          </h3>
          <p className="mt-1 text-dim">&gt; {c.headline}</p>
          <p className="mt-4 text-pretty">{c.line}</p>
          <ul className="mt-4 space-y-1.5">
            {c.uses.map((u) => (
              <li key={u} className="flex gap-2">
                <span className="text-agent">-</span>
                {u}
              </li>
            ))}
          </ul>
          {c.chips && (
            <p className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-xs text-dim">skills ▸</span>
              {c.chips.map((k) => (
                <span
                  key={k}
                  className="border border-line bg-bg-alt px-1.5 text-xs"
                >
                  {k}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="min-w-0 lg:col-span-7">
          <AgentSession
            session={c.session}
            title={`you@${c.tab} — mcp session`}
            onFinished={onFinished}
          />
        </div>
      </div>
      <Box title={`cat ${c.connect.file}`} className="mt-10" bodyClassName="">
        <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed sm:p-5">
          <code>{c.connect.code}</code>
        </pre>
      </Box>
    </article>
  );
}

const TYPE_MS = 28;
const TOOL_MS = 750;

function AgentSession({
  session,
  title,
  onFinished,
}: {
  session: TranscriptLine[];
  title: string;
  onFinished?: () => void;
}) {
  const prompt = session[0].kind === "prompt" ? session[0].text : "";
  const rest = session.slice(1);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const revealed = useRevealed();
  const reduce = useReducedMotion();
  // Kept in a ref so a new callback identity doesn't restart the animation.
  const finishedRef = useRef(onFinished);
  useEffect(() => {
    finishedRef.current = onFinished;
  });

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

    const prompt = session[0].kind === "prompt" ? session[0].text : "";
    const rest = session.slice(1);

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
      if (!cancelled) finishedRef.current?.();
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, revealed, reduce, run, session]);

  return (
    <div ref={ref} className="min-w-0">
      <Box
        term
        title={title}
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
