"use client";

import { useRef, useState } from "react";
import { SITE_URL, type ModuleId } from "@/lib/content";
import { ScrambleText } from "../tui/scramble-text";
import { Topology } from "../tui/topology";
import { TuiButton } from "../tui/tui-button";
import { BootTerminal } from "./boot-terminal";

export function Hero({ logoWide, logoNarrow }: { logoWide: string; logoNarrow: string }) {
  const [linked, setLinked] = useState<ModuleId[]>([]);
  const [flash, setFlash] = useState<ModuleId | null>(null);
  const [cyborg, setCyborg] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function link(id: ModuleId) {
    setLinked((l) => (l.includes(id) ? l : [...l, id]));
    setFlash(id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 700);
  }

  return (
    <section id="top" aria-labelledby="top-title" className="relative">
      <div className="mx-auto max-w-[110ch] px-4 pt-10 pb-16 sm:px-6 md:pt-14">
        <pre aria-hidden className="glow hidden text-[10px] leading-[1.15] text-accent md:block lg:text-[11px]">
          {logoWide}
        </pre>
        <pre aria-hidden className="glow text-[12px] leading-tight text-accent md:hidden">
          {logoNarrow}
        </pre>
        <p className="mt-4 text-xs text-dim">
          CYBERNETICS OS v1.0 · tty1 · personal operating layer for the agent era
        </p>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1 id="top-title" className="glow text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
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

            <p className="mt-6 max-w-[60ch] text-dim text-pretty">
              <span className="text-dim"># </span>
              Cybernetics turns <span className="text-data">what you know</span> and{" "}
              <span className="text-proj">what you do</span> into structured data you own — ready for any AI
              agent over MCP.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <TuiButton href={SITE_URL} label="Get started" primary external />
              <TuiButton href="#shell" label="Try the shell" />
              <TuiButton href="#know" label="How it works" />
            </div>

            <div className="mt-10 max-w-[64ch]">
              <BootTerminal
                onLink={link}
                onDone={() => setCyborg(true)}
                onRestart={() => {
                  setLinked([]);
                  setCyborg(false);
                }}
              />
            </div>
          </div>

          <div className="justify-self-center">
            <Topology linked={linked} online={cyborg} flash={flash} />
            <p className="mt-4 text-center text-xs text-dim">
              {cyborg ? (
                <>
                  <span className="text-proj">●</span> 4/4 linked · packets flowing
                </>
              ) : (
                <>
                  <span className="text-crm">○</span> {linked.length}/4 linked
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
