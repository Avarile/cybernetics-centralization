"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { figures, tone, type Figure } from "@/lib/content";
import { FigureEmbed } from "../tui/figure-embed";
import { ScrambleText } from "../tui/scramble-text";
import { TuiButton } from "../tui/tui-button";

type Slide = {
  figure: Figure;
  tab: string;
  stage: string;
  color: string;
  headline: string;
  line: string;
};

/** The story in five frames: capture → data base → project management → agents → the result. */
const SLIDES: Slide[] = [
  {
    figure: figures.personPrinter,
    tab: "digitalize",
    stage: "01 · capture",
    color: "var(--accent)",
    headline: "Turn yourself into data.",
    line: "What you know and do is persisted, day after day, until a complete, readable version of you exists.",
  },
  {
    figure: figures.financeSorter,
    tab: "data-base",
    stage: "02 · data base",
    color: tone.data,
    headline: "Data first, AI second.",
    line: "Raw statements, notes and references become structured records you own and your agents can query.",
  },
  {
    figure: figures.agentDispatch,
    tab: "projects",
    stage: "03 · project management",
    color: tone.proj,
    headline: "Plan with people and agents.",
    line: "A classic project board that is also the layer between you and your agents. Write a task, assign it, review the result.",
  },
  {
    figure: figures.memoryCatalog,
    tab: "agents",
    stage: "04 · agentic platform",
    color: tone.agent,
    headline: "Agents that remember.",
    line: "Custom agents read your data, projects and contacts over MCP, and file what they learn back. Any model, closed loops.",
  },
  {
    figure: figures.oneManArmy,
    tab: "studio",
    stage: "05 · the result",
    color: tone.crm,
    headline: "One person. A studio's output.",
    line: "Connected to the same memory, a team of agents works your way — and every lap makes the next one better.",
  },
];

const AUTO_MS = 60000;

export function Hero({ logo }: { logo: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cyborg, setCyborg] = useState(false);
  const slide = SLIDES[index];

  // Auto-advance until the visitor touches the carousel; hover or focus pauses it.
  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTO_MS,
    );
    return () => clearTimeout(t);
  }, [index, paused, reduce]);

  // The headline's first word flips once, as the page "boots".
  useEffect(() => {
    const t = setTimeout(() => setCyborg(true), 2600);
    return () => clearTimeout(t);
  }, []);

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(index + (e.key === "ArrowRight" ? 1 : -1));
    setPaused(true);
  }

  return (
    <section id="top" aria-labelledby="top-title" className="relative">
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-14 sm:px-6 md:pt-12 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
          {/* Left: the pitch */}
          <div className="min-w-0">
            <pre
              aria-hidden
              className="glow text-[10px] leading-tight text-accent sm:text-[12px]"
            >
              {logo}
            </pre>
            <p className="mt-2 text-xs text-dim">
              personal operating layer for the agent era
            </p>

            <h1
              id="top-title"
              className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              <span className="sr-only">Cyborgize yourself, agentically.</span>
              <span aria-hidden>
                <span className="block">
                  <span className="text-dim">$ </span>
                  <ScrambleText
                    text={cyborg ? "Cyborgize" : "Digitalize"}
                    className={`transition-colors duration-700 ${cyborg ? "text-accent" : ""}`}
                  />
                </span>
                <span className="block pl-[2ch]">yourself,</span>
                <span className="block pl-[2ch] text-accent">agentically.</span>
              </span>
            </h1>

            <p className="mt-6 max-w-[52ch] text-pretty text-dim">
              <span className="text-dim"># </span>
              Four platforms — <span className="text-data">
                Data Base
              </span>, <span className="text-proj">Project Management</span>,{" "}
              <span className="text-crm">CRM</span> and the{" "}
              <span className="text-agent">Agentic Platform</span> — turn what
              you know and what you do into data you own, ready for any AI agent
              over MCP.
            </p>
            <p className="mt-3 text-sm">
              <span className="text-dim"># </span>
              <span className="text-data">My memory.</span>{" "}
              <span className="text-agent">Any mind.</span>{" "}
              <span className="text-proj">Closed loops.</span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <TuiButton
                href="/register"
                label="Register for early access"
                primary
              />
              <TuiButton href="#modules" label="See the platforms" />
            </div>
          </div>

          {/* Right: the carousel */}
          <div
            className="min-w-0"
            role="group"
            aria-roledescription="carousel"
            aria-label="Cybernetics in five animations"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div
              role="tablist"
              aria-label="Animations"
              onKeyDown={onKeyDown}
              className="flex flex-wrap border-b border-line text-xs"
            >
              {SLIDES.map((s, i) => (
                <button
                  key={s.tab}
                  role="tab"
                  aria-selected={i === index}
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => {
                    setIndex(i);
                    setPaused(true);
                  }}
                  style={i === index ? { backgroundColor: s.color } : undefined}
                  className={`px-3 py-1.5 transition-colors ${i === index ? "text-bg" : "text-dim hover:text-fg"}`}
                >
                  {i + 1}:{s.tab}
                  {i === index ? "*" : ""}
                </button>
              ))}
            </div>

            <div className="pt-5" aria-live="polite">
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: slide.color }}
              >
                {slide.stage}
              </p>
              <h2
                className="mt-1 text-xl font-semibold sm:text-2xl"
                style={{ color: slide.color }}
              >
                <span className="text-dim"># </span>
                {slide.headline}
              </h2>
              <p className="mt-2 max-w-[64ch] text-[13px] text-dim text-pretty">
                {slide.line}
              </p>
            </div>

            <div className="mt-5" key={slide.figure.id}>
              <FigureEmbed
                figure={slide.figure}
                tone={slide.color}
                caption={false}
                bare
                stage={0.85}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-dim">
              <p>
                {reduce ? (
                  <>use ← → or the tabs to browse</>
                ) : paused ? (
                  <>
                    <span className="text-crm">❚❚</span> paused — move away to
                    resume
                  </>
                ) : (
                  <>
                    <span className="text-proj">●</span> auto-playing ·{" "}
                    {index + 1}/{SLIDES.length}
                  </>
                )}
              </p>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous animation"
                  className="p-1 hover:text-fg"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next animation"
                  className="p-1 hover:text-fg"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
