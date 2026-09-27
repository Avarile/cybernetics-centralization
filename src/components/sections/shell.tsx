"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BOOT_COMMAND,
  BOOT_DONE,
  bootSequence,
  host,
  modules,
  sections,
  SITE_URL,
  tone,
  type Module,
} from "@/lib/content";
import { gotoSection, THEME_LABEL, toggleCrt, toggleTheme } from "@/lib/prefs";
import { Box } from "../tui/box";
import { TuiSection } from "../tui/tui-section";

type Entry = { id: number; input?: string; output?: ReactNode; cyborg?: boolean };

const COMMANDS: Record<string, string> = {
  help: "list commands",
  whoami: "who you are, for now",
  modules: "list the four modules",
  mcp: "show MCP endpoints",
  cyborgize: "link every module to you",
  open: "open <module> in a new tab",
  goto: "goto <section> on this page",
  theme: "theme [phosphor|paper]",
  crt: "crt [on|off]",
  blog: "read the blog",
  clear: "clear the screen",
};

const ALIASES: Record<string, Module["id"]> = {
  data: "data",
  "data-centre": "data",
  db: "data",
  database: "data",
  projects: "proj",
  project: "proj",
  pm: "proj",
  crm: "crm",
  agents: "agent",
  agent: "agent",
  agentic: "agent",
};

const OPEN_TARGETS = ["data", "projects", "crm", "agents"];

const SUGGESTIONS = ["help", "cyborgize", "goto modules", "theme", "open projects"];

let nextId = 0;

export function InteractiveShell({ logo, logoNarrow }: { logo: string; logoNarrow: string }) {
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: nextId++, output: <Banner logo={logo} logoNarrow={logoNarrow} /> },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1); // index into history while browsing with ↑/↓
  const [cyborg, setCyborg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the newest output in view (inside the terminal only — never scroll the page).
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  function print(inputText: string, output?: ReactNode) {
    setEntries((e) => [...e, { id: nextId++, input: inputText, output, cyborg }]);
  }

  function run(raw: string) {
    const line = raw.trim();
    if (line) {
      setHistory((h) => [...h, line]);
    }
    setCursor(-1);
    setInput("");

    const [cmd = "", ...args] = line.split(/\s+/);
    const arg = args.join(" ").toLowerCase();

    switch (cmd.toLowerCase()) {
      case "":
        return print("");
      case "help":
        return print(line, <Help />);
      case "whoami":
        return print(
          line,
          cyborg ? (
            <p>
              you — <Tone c="var(--accent)">100% cyborgized</Tone>. your agents know you.
            </p>
          ) : (
            <p>
              you — <Tone c="var(--crm)">analog</Tone>. run <Cmd>cyborgize</Cmd> to fix that.
            </p>
          ),
        );
      case "ls":
      case "modules":
        return print(line, <ModuleList />);
      case "mcp":
        return print(line, <McpList />);
      case "cyborgize":
        setCyborg(true);
        return print(line, <Cyborgize />);
      case "open": {
        const id = ALIASES[arg];
        const m = modules.find((mod) => mod.id === id);
        if (!m) {
          return print(
            line,
            <p>usage: open &lt;{OPEN_TARGETS.join("|")}&gt;</p>,
          );
        }
        window.open(m.url, "_blank", "noopener,noreferrer");
        return print(
          line,
          <p>
            opening <Tone c={tone[m.id]}>{host(m.url)}</Tone> …
          </p>,
        );
      }
      case "goto":
      case "cd": {
        const target = sections.find((sec) => sec.win === arg || sec.id === arg);
        if (!target) {
          return print(line, <p>usage: goto &lt;{sections.map((sec) => sec.win).join("|")}&gt;</p>);
        }
        gotoSection(target.id);
        return print(line, <p>→ {target.path}</p>);
      }
      case "theme": {
        const to = arg === "paper" ? "light" : arg === "phosphor" ? "dark" : undefined;
        toggleTheme(to);
        return print(line, <p>theme: {THEME_LABEL[document.documentElement.dataset.theme ?? "dark"]}</p>);
      }
      case "crt": {
        toggleCrt(arg === "on" || arg === "off" ? arg : undefined);
        return print(line, <p>crt: {document.documentElement.dataset.crt === "off" ? "off" : "on"}</p>);
      }
      case "blog":
        window.open(SITE_URL, "_blank", "noopener,noreferrer");
        return print(line, <p>opening {host(SITE_URL)} …</p>);
      case "clear":
        setEntries([]);
        return;
      case "sudo":
        return print(
          line,
          <p>
            {cyborg
              ? "you are already root of yourself."
              : "permission denied: only cyborgs may sudo. try `cyborgize`."}
          </p>,
        );
      case "exit":
        return print(line, <p>there is no exit. only agents.</p>);
      case "echo":
        return print(line, <p>{args.join(" ")}</p>);
      case "date":
        return print(line, <p>{new Date().toString()}</p>);
      default:
        return print(
          line,
          <p>
            <Tone c="var(--crm)">command not found:</Tone> {cmd}. try <Cmd>help</Cmd>.
          </p>,
        );
    }
  }

  function complete() {
    const [cmd, ...rest] = input.split(" ");
    if (rest.length === 0) {
      const hits = [...Object.keys(COMMANDS)].filter((c) => c.startsWith(cmd));
      if (hits.length === 1) setInput(hits[0] + " ");
    } else if (cmd === "open") {
      const hits = OPEN_TARGETS.filter((a) => a.startsWith(rest.join(" ")));
      if (hits.length === 1) setInput(`open ${hits[0]}`);
    } else if (cmd === "goto") {
      const hits = sections.map((sec) => sec.win).filter((w) => w.startsWith(rest.join(" ")));
      if (hits.length === 1) setInput(`goto ${hits[0]}`);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === -1) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <TuiSection
      id="shell"
      title="Poke the system."
      command="exec zsh --login"
      intro="A tiny shell into Cybernetics. Try help, cyborgize, goto modules or open projects. Tab completes, ↑/↓ recalls."
    >
      <div onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <Box term title={`${cyborg ? "cyborg" : "guest"}@cybernetics: ~ — zsh`} bodyClassName="glow cursor-text text-[12.5px]">
          <div ref={bodyRef} className="h-[440px] overflow-y-auto p-4 sm:p-5" aria-live="polite">
            {entries.map((e) => (
              <div key={e.id}>
                {e.input !== undefined && <Prompt cyborg={!!e.cyborg}>{e.input}</Prompt>}
                {e.output && <div className="mb-2">{e.output}</div>}
              </div>
            ))}

            <label className="flex items-center gap-2">
              <PromptSymbol cyborg={cyborg} />
              <span className="sr-only">Shell command</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-fg caret-[var(--accent)] outline-none placeholder:text-dim"
                placeholder="type a command…"
              />
            </label>
          </div>
        </Box>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            onClick={() => run(sug)}
            className="px-1 text-accent transition-colors hover:bg-accent hover:text-accent-fg"
          >
            [ $ {sug} ]
          </button>
        ))}
      </div>
    </TuiSection>
  );
}

/* ---------- Output blocks ---------- */

function Banner({ logo, logoNarrow }: { logo: string; logoNarrow: string }) {
  return (
    <div className="mb-3">
      <pre aria-hidden className="hidden leading-[1.2] text-accent sm:block">
        {logo}
      </pre>
      <pre aria-hidden className="text-[12px] leading-tight text-accent sm:hidden">
        {logoNarrow}
      </pre>
      <p className="sr-only">Cybernetics</p>
      <p className="mt-3 text-dim">
        cybernetics shell v1.0 · 4 modules · type <Cmd>help</Cmd> to begin.
      </p>
    </div>
  );
}

function Help() {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-4">
      {Object.entries(COMMANDS).map(([c, d]) => (
        <div key={c} className="contents">
          <Cmd>{c}</Cmd>
          <span className="text-dim">{d}</span>
        </div>
      ))}
    </div>
  );
}

function ModuleList() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:grid-cols-[8rem_10rem_1fr]">
      {modules.map((m) => (
        <div key={m.id} className="contents">
          <Tone c={tone[m.id]}>{m.name.toLowerCase().replace(" ", "-")}</Tone>
          <span className="text-dim">{m.role.toLowerCase()}</span>
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 mb-1 underline decoration-line underline-offset-4 hover:text-accent sm:col-span-1 sm:mb-0"
          >
            {host(m.url)}
          </a>
        </div>
      ))}
    </div>
  );
}

function McpList() {
  return (
    <div>
      {modules
        .filter((m) => m.id !== "agent")
        .map((m) => (
          <p key={m.id}>
            <Tone c={tone[m.id]}>●</Tone> {m.url}/mcp
          </p>
        ))}
      <p className="mt-1 text-dim">add these to any MCP client — or use {host(modules.find((m) => m.id === "agent")!.url)}.</p>
    </div>
  );
}

function Cyborgize() {
  const reduce = useReducedMotion();
  const step = reduce ? 0 : 0.55;
  return (
    <div>
      <p className="text-dim">$ {BOOT_COMMAND}</p>
      {bootSequence.map((b, i) => (
        <motion.p
          key={b.id}
          className="flex gap-2 whitespace-pre"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * step }}
        >
          <span className="text-dim">▸</span>
          <span className="w-[17ch] shrink-0">link {b.label}</span>
          <Tone c={tone[b.id]}>
            <AnimatedBar delay={i * step} />
          </Tone>
          <span className="hidden text-dim sm:inline">{b.detail}</span>
        </motion.p>
      ))}
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: bootSequence.length * step + 0.1 }}
      >
        <Tone c="var(--proj)">✓</Tone> {BOOT_DONE}
      </motion.p>
    </div>
  );
}

function AnimatedBar({ delay, cells = 10 }: { delay: number; cells?: number }) {
  const reduce = useReducedMotion();
  const [fill, setFill] = useState(0);
  const shown = reduce ? cells : fill;

  useEffect(() => {
    if (reduce) return;
    let n = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        n += 1;
        setFill(n);
        if (n >= cells) clearInterval(interval);
      }, 40);
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [delay, cells, reduce]);

  return (
    <>
      [{"█".repeat(shown)}
      <span className="opacity-25">{"░".repeat(cells - shown)}</span>]
    </>
  );
}

/* ---------- Bits ---------- */

function PromptSymbol({ cyborg }: { cyborg: boolean }) {
  return (
    <span className="shrink-0">
      <span className={cyborg ? "text-accent" : "text-[var(--crm)]"}>{cyborg ? "cyborg" : "guest"}</span>
      <span className="text-dim">@cybernetics</span> <span className="text-accent">❯</span>
    </span>
  );
}

function Prompt({ cyborg, children }: { cyborg: boolean; children: ReactNode }) {
  return (
    <p className="flex gap-2">
      <PromptSymbol cyborg={cyborg} />
      <span className="break-all">{children}</span>
    </p>
  );
}

function Tone({ c, children }: { c: string; children: ReactNode }) {
  return <span style={{ color: c }}>{children}</span>;
}

function Cmd({ children }: { children: ReactNode }) {
  return <span className="text-accent">{children}</span>;
}
