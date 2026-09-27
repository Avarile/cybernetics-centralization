"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Cursor } from "../tui/bits";
import { Box } from "../tui/box";
import { TuiSection, useRevealed } from "../tui/tui-section";

const records = [
  { id: "#001", kind: "how-to", title: "Deploy to production" },
  { id: "#002", kind: "ref", title: "Stripe API docs" },
  { id: "#003", kind: "knowledge", title: "Pricing rationale" },
  { id: "#004", kind: "how-to", title: "Weekly review ritual" },
];

// Each task is linked to one record, in this order.
const tasks = [
  { slug: "billing", title: "set up billing", record: 1 },
  { slug: "ship-v2", title: "ship v2 to production", record: 0 },
  { slug: "pricing-page", title: "publish pricing page", record: 2 },
];

const STEP_MS = 2400;

export function KnowDo() {
  return (
    <TuiSection
      id="know"
      title="Two layers make a person legible: what you know, and what you do."
      command="tmux split-window -h 'data-centre' 'projects'"
      intro={
        <>
          The <span className="text-data">Data Centre</span> holds your knowledge, how-tos and references.{" "}
          <span className="text-proj">Projects</span> holds your goals and tasks — with the Data Centre built in, so
          every task carries the know-how to finish it.
        </>
      }
    >
      <SplitPanes />
      <ManPage />
    </TuiSection>
  );
}

function SplitPanes() {
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
    const t = setInterval(() => setStep((s) => (s + 1) % (tasks.length + 2)), STEP_MS);
    return () => clearInterval(t);
  }, [inView, revealed, reduce]);

  return (
    <div ref={ref}>
      <Box title="tmux · know │ do" bodyClassName="grid text-[13px] lg:grid-cols-2">
        {/* Left pane: what you know */}
        <div className="min-w-0 border-line p-4 max-lg:border-b lg:border-r">
          <p className="mb-3 text-xs">
            <span className="text-data">data-centre&gt;</span> query knowledge --kind how-to,ref
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
                    <td className={`py-0.5 pr-3 ${active ? "" : "text-dim"}`}>{r.id}</td>
                    <td className={`pr-3 ${active ? "" : "text-data"}`}>{r.kind}</td>
                    <td className="truncate">{r.title}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-dim">({records.length} rows)</p>
        </div>

        {/* Right pane: what you do */}
        <div className="min-w-0 p-4">
          <p className="mb-3 text-xs">
            <span className="text-proj">projects&gt;</span> tree ~/goals/launch-v2
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
                <span className={done ? "text-proj" : active ? "text-accent" : "text-dim"}>
                  [{done ? "x" : " "}]
                </span>
                <span className={active ? "bg-proj text-bg" : ""}>{t.slug}</span>
                {done && (
                  <span className="flicker-in text-data">
                    → {rec.kind}
                    {rec.id}
                  </span>
                )}
              </p>
            );
          })}
          <p className="mt-3 text-xs text-dim">
            1 goal · {tasks.length} tasks · {linkedCount} linked
          </p>
        </div>
      </Box>

      {/* The link command, as it happens */}
      <p className="mt-3 min-h-[1.65em] text-[13px]" aria-live="polite">
        {current ? (
          <>
            <span className="text-accent">❯</span> ln -s{" "}
            <span className="text-data">data://{records[current.record].kind}{records[current.record].id}</span>{" "}
            <span className="text-proj">projects://launch-v2/{current.slug}</span> <Cursor />
          </>
        ) : (
          <>
            <span className="text-proj">✓</span>{" "}
            <span className="text-dim">every task linked to the know-how it needs.</span>
          </>
        )}
      </p>
    </div>
  );
}

function ManPage() {
  const entries = [
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
  ];
  return (
    <div className="mt-12 text-[13px] sm:text-sm">
      <p className="flex justify-between text-dim">
        <span>CYBORGIZE(1)</span>
        <span className="hidden sm:inline">Cybernetics Manual</span>
        <span>CYBORGIZE(1)</span>
      </p>
      <dl className="mt-4 space-y-5">
        {entries.map(([term, body]) => (
          <div key={term}>
            <dt className="font-semibold text-fg">{term}</dt>
            <dd className="mt-1 max-w-[72ch] pl-[4ch] text-dim">{body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
