import { TuiButton } from "@/components/tui/tui-button";
import type { Copy, Locale } from "@/lib/i18n";
import { CyborgFigure } from "./cyborg-figure";

const COPY: Copy<{ cta: string; ready: string; move: string; title: string; line: string }> = {
  en: {
    cta: "start your 4-week migration",
    ready: "ready to start your own?",
    move: "your move",
    title: "My memory. Any mind. Closed loops.",
    line: "Start your own 4-week migration. Register and get the week-by-week checklist and the starter template. No tech skills needed.",
  },
  zh: {
    cta: "开始你的 4 周迁移",
    ready: "准备好开始你自己的了吗？",
    move: "轮到你了",
    title: "我的记忆。任何头脑。闭环运转。",
    line: "开始你自己的 4 周迁移。注册即可获得逐周检查清单和入门模板。无需任何技术背景。",
  },
};

/** Mid-post call to action: one line and the button. */
export function InlineCta({ text, href, locale = "en" }: { text: string; href: string; locale?: Locale }) {
  const t = COPY[locale];
  return (
    <aside className="term my-10 flex flex-col gap-4 border border-line bg-bg p-5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="text-dim">$</span> {text || t.ready}
      </p>
      <TuiButton href={href} label={t.cta} primary />
    </aside>
  );
}

/** End-of-post signup card. */
export function SignupCard({ href, locale = "en" }: { href: string; locale?: Locale }) {
  const t = COPY[locale];
  return (
    <section className="term mt-16 grid items-center gap-8 border border-line bg-bg p-6 sm:grid-cols-[200px_1fr] sm:p-8">
      <CyborgFigure stage={3} locale={locale} className="mx-auto w-40 sm:w-full" />
      <div className="space-y-4 text-sm">
        <p className="text-xs tracking-[0.22em] text-dim uppercase">{t.move}</p>
        <h2 className="glow text-xl font-semibold tracking-tight text-balance sm:text-2xl">{t.title}</h2>
        <p className="text-dim">{t.line}</p>
        <TuiButton href={href} label={t.cta} primary />
      </div>
    </section>
  );
}
