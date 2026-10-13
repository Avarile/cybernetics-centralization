import { TuiButton } from "@/components/tui/tui-button";
import { CyborgFigure } from "./cyborg-figure";

const CTA_LABEL = "start your 4-week migration";

/** Mid-post call to action: one line and the button. */
export function InlineCta({ text, href }: { text: string; href: string }) {
  return (
    <aside className="term my-10 flex flex-col gap-4 border border-line bg-bg p-5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="text-dim">$</span> {text || "ready to start your own?"}
      </p>
      <TuiButton href={href} label={CTA_LABEL} primary />
    </aside>
  );
}

/** End-of-post signup card. */
export function SignupCard({ href }: { href: string }) {
  return (
    <section className="term mt-16 grid items-center gap-8 border border-line bg-bg p-6 sm:grid-cols-[200px_1fr] sm:p-8">
      <CyborgFigure stage={3} className="mx-auto w-40 sm:w-full" />
      <div className="space-y-4 text-sm">
        <p className="text-xs tracking-[0.22em] text-dim uppercase">your move</p>
        <h2 className="glow text-xl font-semibold tracking-tight text-balance sm:text-2xl">
          My memory. Any mind. Closed loops.
        </h2>
        <p className="text-dim">
          Start your own 4-week migration. Register and get the week-by-week checklist and the starter template.
          No tech skills needed.
        </p>
        <TuiButton href={href} label={CTA_LABEL} primary />
      </div>
    </section>
  );
}
