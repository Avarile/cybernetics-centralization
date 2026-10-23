"use client";

import { useState } from "react";
import { tone, type ModuleId } from "@/lib/content";

export type GuideCard = {
  href: string;
  title: string;
  dek: string;
  time: string;
  personas: string[];
  modules: { id: ModuleId; name: string }[];
  draft: boolean;
};

/** Guides with a "who are you?" filter over the personas from `content.ts`. */
export function GuideList({ guides, personas }: { guides: GuideCard[]; personas: { login: string; name: string }[] }) {
  const [persona, setPersona] = useState<string | null>(null);
  const shown = persona ? guides.filter((g) => g.personas.includes(persona)) : guides;
  const chip = "border px-2 py-0.5 transition-colors";

  return (
    <>
      <div role="group" aria-label="Filter by who you are" className="mt-8 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          aria-pressed={!persona}
          onClick={() => setPersona(null)}
          className={`${chip} ${!persona ? "border-accent bg-accent text-accent-fg" : "border-line text-dim hover:text-fg"}`}
        >
          everyone
        </button>
        {personas.map((p) => (
          <button
            key={p.login}
            type="button"
            aria-pressed={persona === p.login}
            onClick={() => setPersona(persona === p.login ? null : p.login)}
            className={`${chip} ${persona === p.login ? "border-accent bg-accent text-accent-fg" : "border-line text-dim hover:text-fg"}`}
          >
            {p.name.toLowerCase()}
          </button>
        ))}
      </div>

      <ol className="mt-8 space-y-6">
        {shown.map((g) => (
          <li key={g.href} className={`border-l pl-4 ${g.draft ? "border-dashed border-red" : "border-line"} hover:border-accent`}>
            <a href={g.href} className="group block">
              <span className="text-xs text-dim">
                {g.draft && <span className="mr-2 border border-dashed border-red px-1 text-red">draft</span>}
                {g.time}
                {g.modules.map((m) => (
                  <span key={m.id} className="ml-2" style={{ color: tone[m.id] }}>
                    ● {m.name}
                  </span>
                ))}
              </span>
              <span className="block text-lg group-hover:text-accent">{g.title}</span>
              <span className="block text-sm text-dim">{g.dek}</span>
            </a>
          </li>
        ))}
        {!shown.length && <li className="text-dim">$ ls guides/ — nothing for this one yet.</li>}
      </ol>
    </>
  );
}
