import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";
import { TuiButton } from "@/components/tui/tui-button";
import { modules, tone } from "@/lib/content";

export const metadata: Metadata = {
  title: "Register — Cybernetics",
  description: "Register for early access to Cybernetics: your knowledge, projects and relationships, ready for any AI agent over MCP.",
  openGraph: {
    title: "Start your 4-week Cyborg Migration",
    description: "One memory you own, any AI plugged into it, and a weekly loop that learns. No tech skills needed.",
  },
  twitter: { card: "summary_large_image" },
};

const steps = [
  "register — about two minutes",
  "we reach out personally to set you up",
  "start with the modules you picked",
  "connect any MCP agent to your data",
];

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <TuiButton href="/" label="← cybernetics" />

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">register</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <aside className="space-y-10 text-[13px]">
          <div>
            <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
              <span aria-hidden className="text-dim">
                #{" "}
              </span>
              Get early access.
            </h1>
            <p className="mt-4 text-sm text-dim">
              Turn what you know and what you do into structured data you own, ready for any AI agent over MCP.
            </p>
          </div>

          <section>
            <h2 className="text-dim"># what you get</h2>
            <ul className="mt-2 space-y-2">
              {modules.map((m) => (
                <li key={m.id} className="border-l border-line pl-3">
                  <span style={{ color: tone[m.id] }}>●</span> {m.name}{" "}
                  <span className="text-dim">— {m.role.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-dim"># how it goes</h2>
            <ol className="mt-2 space-y-1">
              {steps.map((s, i) => (
                <li key={s}>
                  <span className="text-accent">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-dim"># your data</h2>
            <p className="mt-2 text-dim">
              We only use these details to set up your access and to contact you about it. Product updates are opt-in.
              Ask us to delete your details at any time.
            </p>
          </section>
        </aside>

        <div className="lg:border-l lg:border-line lg:pl-12">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
