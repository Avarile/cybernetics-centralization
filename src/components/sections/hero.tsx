"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { tone, type Figure } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { localePath, type Copy, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { AsciiLogo } from "../tui/ascii-logo";
import { FigureEmbed } from "../tui/figure-embed";
import { TuiButton } from "../tui/tui-button";

type Slide = {
  figure: Figure;
  tab: string;
  stage: string;
  color: string;
  headline: string;
  line: string;
};

type SlideText = Pick<Slide, "stage" | "headline" | "line">;

/** The story in five frames: capture → data base → project management → agents → the result. */
const slides = (locale: Locale): Slide[] => {
  const { figures } = contentFor(locale);
  return [
    { figure: figures.personPrinter, tab: "digitalize", color: "var(--accent)" },
    { figure: figures.financeSorter, tab: "data-base", color: tone.data },
    { figure: figures.agentDispatch, tab: "projects", color: tone.proj },
    { figure: figures.memoryCatalog, tab: "agents", color: tone.agent },
    { figure: figures.oneManArmy, tab: "studio", color: tone.crm },
  ].map((s, i) => ({ ...s, ...SLIDE_TEXT[locale][i] }));
};

const SLIDE_TEXT: Copy<SlideText[]> = {
  en: [
    {
      stage: "01 · capture",
      headline: "Turn every aspect of yourself into data.",
      line: "What you know and do is persisted, day after day, until a complete, readable version of you exists.",
    },
    {
      stage: "02 · data base",
      headline: "Data first, AI second.",
      line: "Raw statements, notes and references become structured records you own and your agents can query.",
    },
    {
      stage: "03 · project management",
      headline: "Plan with people and agents.",
      line: "A classic project board that is also the layer between you and your agents. Write a task, assign it, review the result.",
    },
    {
      stage: "04 · agentic platform",
      headline: "Agents that remember.",
      line: "Custom agents read your data, projects and contacts over MCP, and file what they learn back. Any model, closed loops.",
    },
    {
      stage: "05 · the result",
      headline: "One person. A studio's output.",
      line: "Connected to the same memory, a team of agents works your way — and every lap makes the next one better.",
    },
  ],
  zh: [
    {
      stage: "01 · 采集",
      headline: "把你的方方面面都变成数据。",
      line: "你知道的和你做的，日复一日被持久化，直到一个完整、可读的你出现。",
    },
    {
      stage: "02 · 数据库",
      headline: "数据优先，AI 其次。",
      line: "原始账单、笔记和参考资料，变成属于你、你的智能体也能查询的结构化记录。",
    },
    {
      stage: "03 · 项目管理",
      headline: "与人和智能体一起做计划。",
      line: "一块经典的项目看板，同时也是你与智能体之间的那一层。写下任务，分配出去，评审结果。",
    },
    {
      stage: "04 · 智能体平台",
      headline: "会记事的智能体。",
      line: "自定义智能体通过 MCP 读取你的数据、项目和联系人，再把学到的东西归档回去。任何模型，闭环运转。",
    },
    {
      stage: "05 · 结果",
      headline: "一个人，一整个工作室的产出。",
      line: "连着同一份记忆，一支智能体团队按你的方式工作——每跑一圈，下一圈都更好。",
    },
  ],
};

const COPY = {
  en: {
    title: "Cyborgize yourself, agentically.",
    register: "Register for early access",
    platforms: "See the platforms",
    carousel: "Cybernetics in five animations",
    tabs: "Animations",
    browse: "use ← → or the tabs to browse",
    paused: "paused — move away to resume",
    playing: "auto-playing",
    prev: "Previous animation",
    next: "Next animation",
  },
  zh: {
    title: "让自己赛博格化，以智能体的方式。",
    register: "注册抢先体验",
    platforms: "查看各平台",
    carousel: "用五段动画了解 Cybernetics",
    tabs: "动画",
    browse: "用 ← → 或标签页浏览",
    paused: "已暂停——移开鼠标继续",
    playing: "自动播放中",
    prev: "上一段动画",
    next: "下一段动画",
  },
} satisfies Copy<Record<string, string>>;

const AUTO_MS = 60000;

export function Hero({ logo }: { logo: string }) {
  const locale = useLocale();
  const SLIDES = slides(locale);
  const t = COPY[locale];
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];

  // Auto-advance until the visitor touches the carousel; hover or focus pauses it.
  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTO_MS,
    );
    return () => clearTimeout(t);
  }, [index, paused, reduce, SLIDES.length]);

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
            <AsciiLogo art={logo} />
            <h1 id="top-title" className="sr-only">
              {t.title}
            </h1>

            <div className="mt-10 lg:min-h-[17rem]" aria-live="polite">
              <p
                className="text-sm uppercase tracking-widest"
                style={{ color: slide.color }}
              >
                {slide.stage}
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-3xl xl:text-4xl"
                style={{ color: slide.color }}
              >
                <span className="text-dim"># </span>
                {slide.headline}
              </h2>
              <p className="mt-5 max-w-[48ch] text-base text-dim text-pretty">
                {slide.line}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TuiButton
                href={localePath(locale, "/register")}
                label={t.register}
                primary
              />
              <TuiButton href="#modules" label={t.platforms} />
            </div>
          </div>

          {/* Right: the carousel */}
          <div
            className="min-w-0"
            role="group"
            aria-roledescription="carousel"
            aria-label={t.carousel}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div
              role="tablist"
              aria-label={t.tabs}
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
                  <>{t.browse}</>
                ) : paused ? (
                  <>
                    <span className="text-crm">❚❚</span> {t.paused}
                  </>
                ) : (
                  <>
                    <span className="text-proj">●</span> {t.playing} ·{" "}
                    {index + 1}/{SLIDES.length}
                  </>
                )}
              </p>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label={t.prev}
                  className="p-1 hover:text-fg"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label={t.next}
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
