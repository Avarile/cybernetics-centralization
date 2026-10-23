"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Copy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { Cursor } from "../tui/bits";
import { Box } from "../tui/box";
import { TuiSection, useRevealed } from "../tui/tui-section";

const records = [
  { id: "#001", kind: "how-to", title: { en: "Deploy to production", zh: "部署到生产环境" } },
  { id: "#002", kind: "ref", title: { en: "Stripe API docs", zh: "Stripe API 文档" } },
  { id: "#003", kind: "knowledge", title: { en: "Pricing rationale", zh: "定价依据" } },
  { id: "#004", kind: "how-to", title: { en: "Weekly review ritual", zh: "每周回顾流程" } },
];

// Each task is linked to one record, in this order.
const tasks = [
  { slug: "billing", title: "set up billing", record: 1 },
  { slug: "ship-v2", title: "ship v2 to production", record: 0 },
  { slug: "pricing-page", title: "publish pricing page", record: 2 },
];

const STEP_MS = 2400;

const COPY = {
  en: {
    title: "Two layers make a person legible: what you know, and what you do.",
    intro: (
      <>
        The <span className="text-data">Data Base</span> holds your knowledge, how-tos and references.{" "}
        <span className="text-proj">Project Management</span> holds your goals and tasks — with the Data Base built in,
        so every task carries the know-how to finish it.
      </>
    ),
    rows: "rows",
    summary: (linked: number) => `1 goal · ${tasks.length} tasks · ${linked} linked`,
    allLinked: "every task linked to the know-how it needs.",
    manual: "Cybernetics Manual",
    entries: [
      [
        "DESCRIPTION",
        "Knowledge becomes context. How-tos and references are records, not buried notes — queryable by you and by your agents.",
      ],
      [
        "LINKING",
        "Tasks carry their know-how. Link a task to the records it needs; whoever picks it up — you or an agent — starts informed.",
      ],
      [
        "FEEDBACK",
        "Outcomes flow back. Finished work leaves new knowledge behind, so the system gets sharper every time you use it.",
      ],
    ],
  },
  zh: {
    title: "两层信息让一个人变得可读：你知道什么，以及你在做什么。",
    intro: (
      <>
        <span className="text-data">数据库</span>存放你的知识、操作指南和参考资料。
        <span className="text-proj">项目管理</span>存放你的目标和任务——内置数据库，每个任务都带着完成它所需的经验。
      </>
    ),
    rows: "行",
    summary: (linked: number) => `1 个目标 · ${tasks.length} 个任务 · 已链接 ${linked} 个`,
    allLinked: "每个任务都链接到了它所需的经验。",
    manual: "Cybernetics 手册",
    entries: [
      ["描述", "知识变成上下文。操作指南和参考资料是记录，而不是被埋没的笔记——你和你的智能体都能查询。"],
      ["链接", "任务带着经验。把任务链接到它需要的记录；无论谁来接手——你或者智能体——一开始就心中有数。"],
      ["反馈", "结果回流。完成的工作会留下新的知识，所以系统每用一次都更敏锐。"],
    ],
  },
} satisfies Copy<unknown>;

export function KnowDo() {
  const t = COPY[useLocale()];
  return (
    <TuiSection id="know" title={t.title} command="tmux split-window -h 'data-base' 'projects'" intro={t.intro}>
      <SplitPanes />
      <ManPage />
    </TuiSection>
  );
}

function SplitPanes() {
  const locale = useLocale();
  const t = COPY[locale];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const revealed = useRevealed();
  const reduce = useReducedMotion();
  // step k (< tasks.length): linking task k; tasks before k are linked. Two idle steps then loop.
  const [step, setStep] = useState(0);
  const linkedCount = reduce ? tasks.length : Math.min(step, tasks.length);
  const current = !reduce && step < tasks.length ? tasks[step] : null;

  useEffect(() => {
    if (!inView || !revealed || reduce) return;
    const t = setInterval(
      () => setStep((s) => (s + 1) % (tasks.length + 2)),
      STEP_MS,
    );
    return () => clearInterval(t);
  }, [inView, revealed, reduce]);

  return (
    <div ref={ref}>
      <Box
        title="tmux · know │ do"
        bodyClassName="grid text-[13px] lg:grid-cols-2"
      >
        {/* Left pane: what you know */}
        <div className="min-w-0 border-line p-4 max-lg:border-b lg:border-r">
          <p className="mb-3 text-xs">
            <span className="text-data">data-base&gt;</span> query knowledge
            --kind how-to,ref
          </p>
          <table className="w-full text-left">
            <thead className="text-xs text-dim">
              <tr>
                <th className="pb-1 font-normal">ID</th>
                <th className="pb-1 font-normal">KIND</th>
                <th className="pb-1 font-normal">TITLE</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const active = current?.record === i;
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors duration-300 ${active ? "bg-data text-bg" : ""}`}
                  >
                    <td className={`py-0.5 pr-3 ${active ? "" : "text-dim"}`}>
                      {r.id}
                    </td>
                    <td className={`pr-3 ${active ? "" : "text-data"}`}>
                      {r.kind}
                    </td>
                    <td className="truncate">{r.title[locale]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-dim">
            ({records.length} {t.rows})
          </p>
        </div>

        {/* Right pane: what you do */}
        <div className="min-w-0 p-4">
          <p className="mb-3 text-xs">
            <span className="text-proj">projects&gt;</span> tree
            ~/goals/launch-v2
          </p>
          <p className="text-proj">launch-v2/</p>
          {tasks.map((t, i) => {
            const done = i < linkedCount;
            const active = current === t;
            const rec = records[t.record];
            const last = i === tasks.length - 1;
            return (
              <p key={t.slug} className="flex flex-wrap gap-x-2 whitespace-pre">
                <span className="text-dim">{last ? "└──" : "├──"}</span>
                <span
                  className={
                    done ? "text-proj" : active ? "text-accent" : "text-dim"
                  }
                >
                  [{done ? "x" : " "}]
                </span>
                <span className={active ? "bg-proj text-bg" : ""}>
                  {t.slug}
                </span>
                {done && (
                  <span className="flicker-in text-data">
                    → {rec.kind}
                    {rec.id}
                  </span>
                )}
              </p>
            );
          })}
          <p className="mt-3 text-xs text-dim">{t.summary(linkedCount)}</p>
        </div>
      </Box>

      {/* The link command, as it happens */}
      <p className="mt-3 min-h-[1.65em] text-[13px]" aria-live="polite">
        {current ? (
          <>
            <span className="text-accent">❯</span> ln -s{" "}
            <span className="text-data">
              data://{records[current.record].kind}
              {records[current.record].id}
            </span>{" "}
            <span className="text-proj">
              projects://launch-v2/{current.slug}
            </span>{" "}
            <Cursor />
          </>
        ) : (
          <>
            <span className="text-proj">✓</span>{" "}
            <span className="text-dim">{t.allLinked}</span>
          </>
        )}
      </p>
    </div>
  );
}

function ManPage() {
  const t = COPY[useLocale()];
  return (
    <div className="mt-12 text-[13px] sm:text-sm">
      <p className="flex justify-between text-dim">
        <span>CYBORGIZE(1)</span>
        <span className="hidden sm:inline">{t.manual}</span>
        <span>CYBORGIZE(1)</span>
      </p>
      <dl className="mt-4 space-y-5">
        {t.entries.map(([term, body]) => (
          <div key={term}>
            <dt className="font-semibold text-fg">{term}</dt>
            <dd className="mt-1 max-w-[72ch] pl-[4ch] text-dim">{body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
