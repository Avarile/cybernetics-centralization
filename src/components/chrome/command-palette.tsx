"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { host, modules, sections, SITE_URL } from "@/lib/content";
import { gotoSection, toggleCrt, toggleTheme } from "@/lib/prefs";

type Item = { cmd: string; hint: string; run: () => void };

const OPEN_NAMES: Record<string, string> = { data: "data", proj: "projects", crm: "crm", agent: "agents" };

const ITEMS: Item[] = [
  ...sections.map((s, i) => ({
    cmd: `goto ${s.win}`,
    hint: `${i} · ${s.path}`,
    run: () => gotoSection(s.id),
  })),
  ...modules.map((m) => ({
    cmd: `open ${OPEN_NAMES[m.id]}`,
    hint: host(m.url),
    run: () => window.open(m.url, "_blank", "noopener,noreferrer"),
  })),
  { cmd: "theme phosphor", hint: "dark", run: () => toggleTheme("dark") },
  { cmd: "theme paper", hint: "light", run: () => toggleTheme("light") },
  { cmd: "crt on", hint: "scanlines + glow", run: () => toggleCrt("on") },
  { cmd: "crt off", hint: "plain screen", run: () => toggleCrt("off") },
  { cmd: "blog", hint: host(SITE_URL), run: () => window.open(SITE_URL, "_blank", "noopener,noreferrer") },
  { cmd: "exocortex", hint: "what's the big idea?", run: () => { window.location.href = "/exocortex"; } },
];

function isTyping(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/** vim-style `:` command line. Opens on `:` or Ctrl/⌘+K, or from the status bar. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ITEMS.filter((it) => `${it.cmd} ${it.hint}`.toLowerCase().includes(q)) : ITEMS;
  }, [query]);

  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setSel(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === ":" && !isTyping(e.target))) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("cyber:palette", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cyber:palette", show);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    returnFocus.current?.focus?.();
  }

  function exec(item: Item | undefined) {
    if (!item) return;
    close();
    item.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      setSel((s) => (s + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      setSel((s) => (s - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      exec(results[sel]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center bg-black/50 px-4 pt-[15vh]" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="term glow w-full max-w-[64ch] border border-[color-mix(in_oklab,var(--accent)_50%,var(--line))] bg-bg text-sm shadow-2xl"
      >
        <label className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <span className="text-accent">:</span>
          <span className="sr-only">Command</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSel(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[sel] ? `palette-${sel}` : undefined}
            spellCheck={false}
            autoComplete="off"
            placeholder="goto, open, theme, crt…"
            className="min-w-0 flex-1 bg-transparent text-fg caret-[var(--accent)] outline-none placeholder:text-dim"
          />
          <span className="text-xs text-dim">esc</span>
        </label>
        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && <li className="px-3 py-1.5 text-dim">E492: Not an editor command: {query}</li>}
          {results.map((it, i) => (
            <li
              key={it.cmd}
              id={`palette-${i}`}
              role="option"
              aria-selected={i === sel}
              onMouseEnter={() => setSel(i)}
              onClick={() => exec(it)}
              className={`flex cursor-pointer justify-between gap-4 px-3 py-1.5 ${
                i === sel ? "bg-accent text-accent-fg" : ""
              }`}
            >
              <span>{it.cmd}</span>
              <span className={i === sel ? "" : "text-dim"}>{it.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
