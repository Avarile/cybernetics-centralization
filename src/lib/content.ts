export const SITE_URL = "https://blog.avarile.com";

/** "https://crm.avarile.com" → "crm.avarile.com" */
export const host = (url: string) => url.replace(/^https?:\/\//, "");

export type ModuleId = "data" | "proj" | "crm" | "agent";

export type Module = {
  id: ModuleId;
  name: string;
  repo: string;
  url: string;
  role: string;
  tagline: string;
  description: string;
  capabilities: string[];
  mcpTools: string[];
  integratesWith?: ModuleId;
};

/** CSS color variable per module — the single source of each module's signal color. */
export const tone: Record<ModuleId, string> = {
  data: "var(--data)",
  proj: "var(--proj)",
  crm: "var(--crm)",
  agent: "var(--agent)",
};

export const modules: Module[] = [
  {
    id: "data",
    name: "Data Centre",
    repo: "cybernetics-data-centre",
    url: "https://cybernetics.avarile.com",
    role: "What you know",
    tagline: "Your knowledge, structured.",
    description:
      "A data persistence layer for everything you know — knowledge entries, how-tos, references, finances. Tables, views and a record graph an agent can query.",
    capabilities: [
      "Knowledge, how-tos and references as linked records",
      "Custom tables, fields and views — no schema lock-in",
      "Graph of relations between records",
    ],
    mcpTools: ["query_records", "create_records", "get_graph", "get_record_neighbors"],
  },
  {
    id: "proj",
    name: "Projects",
    repo: "cybernetics-projects",
    url: "https://projects.avarile.com",
    role: "What you do",
    tagline: "Your intentions, executable.",
    description:
      "Goals, projects and tasks — with the Data Centre built in, so every task can carry the knowledge needed to finish it.",
    capabilities: [
      "Goals → projects → tasks, with priorities and deadlines",
      "Tasks linked to how-tos and references in the Data Centre",
      "Progress an agent can read, plan and update",
    ],
    mcpTools: ["list_projects", "create_work_items", "update_work_item"],
    integratesWith: "data",
  },
  {
    id: "crm",
    name: "CRM",
    repo: "cybernetics-crm",
    url: "https://crm.avarile.com",
    role: "Who you work with",
    tagline: "Your relationships, remembered.",
    description:
      "People, companies, deals, notes and follow-ups — the social graph around your work.",
    capabilities: [
      "Contacts, companies and opportunities",
      "Notes, tasks and timelines on any record",
      "Email and calendar context",
    ],
    mcpTools: ["find_many_people", "create_one_note"],
  },
  {
    id: "agent",
    name: "Agents",
    repo: "cybernetics-agents",
    url: "https://agentic.avarile.com",
    role: "Who acts for you",
    tagline: "Your delegate, connected.",
    description:
      "An agentic platform that plugs into every module over MCP — and into any other MCP server you use.",
    capabilities: [
      "Multi-model chat and agents",
      "Connects to all Cybernetics MCP servers",
      "Bring your own tools and providers",
    ],
    mcpTools: ["mcp: data · projects · crm"],
  },
];

/** Section 1: the problem as `git diff analog-you cyborg-you`. */
export const diffLines: { minus: string; plus: string }[] = [
  {
    minus: "knowledge scattered across notes, bookmarks, chats and memory",
    plus: "one data-centre: knowledge, how-tos and references as linked records",
  },
  {
    minus: "goals and next steps live only in your head",
    plus: "goals → projects → tasks, each task linked to the know-how it needs",
  },
  {
    minus: "every AI conversation starts from zero",
    plus: "agents connect over MCP and already know how you work",
  },
];

/** Section 5: how it works, as `tail -f /var/log/you.log`. */
export const logLines: { stage: "capture" | "structure" | "delegate"; tone: ModuleId; text: string }[] = [
  { stage: "capture", tone: "data", text: "data-centre +3 records (how-to, ref, note)" },
  { stage: "capture", tone: "proj", text: "projects +1 goal \"launch v2\" → 5 tasks" },
  { stage: "structure", tone: "data", text: "linked task#12 → how-to#001 \"deploy to production\"" },
  { stage: "structure", tone: "crm", text: "linked person#88 → project \"launch v2\"" },
  { stage: "delegate", tone: "agent", text: "agent claimed task#12 via mcp" },
  { stage: "delegate", tone: "agent", text: "agent read how-to#001, ran checklist, 6/6 ✓" },
  { stage: "capture", tone: "data", text: "data-centre +1 record \"launch v2 retro\" (outcome)" },
  { stage: "delegate", tone: "agent", text: "agent drafted beta invite for 12 people (crm)" },
  { stage: "structure", tone: "proj", text: "task#13 unblocked by ref#002 \"stripe api docs\"" },
];

export const logStages = [
  { stage: "capture", text: "Put what you know into the Data Centre and what you intend into Projects. Agents can do the typing." },
  { stage: "structure", text: "Link tasks to the how-tos and references they need; people to the projects they touch." },
  { stage: "delegate", text: "Connect any MCP-capable agent. It reads your context and acts on it — within data you own." },
] as const;

/** Section 6: who it's for, as `finger @cybernetics`. */
export const personas = [
  {
    login: "freelancer",
    name: "Freelancers",
    pain: "Juggling clients, deliverables and hard-won know-how.",
    plan: "One place for clients, projects and the playbooks behind them.",
  },
  {
    login: "founder",
    name: "Founders",
    pain: "Too many threads, not enough hands.",
    plan: "An agent that knows the roadmap, the customers and how things are done.",
  },
  {
    login: "researcher",
    name: "Researchers",
    pain: "References and findings pile up faster than they connect.",
    plan: "A reference graph linked directly to the experiments that use it.",
  },
  {
    login: "student",
    name: "Students",
    pain: "Notes, deadlines and courses spread everywhere.",
    plan: "Knowledge that compounds, and a study plan an agent can keep on track.",
  },
  {
    login: "team",
    name: "Small teams",
    pain: "Tribal knowledge leaves when people do.",
    plan: "Shared how-tos and projects any teammate — or agent — can pick up.",
  },
];

export type TranscriptLine =
  | { kind: "prompt"; text: string }
  | { kind: "tool"; module: ModuleId; server: string; tool: string; detail: string }
  | { kind: "reply"; text: string };

export const transcript: TranscriptLine[] = [
  { kind: "prompt", text: "Plan my Q4 product launch using how I shipped the last one." },
  { kind: "tool", module: "data", server: "data", tool: "query_records", detail: "how-to: “launch checklist” · 1 match" },
  { kind: "tool", module: "data", server: "data", tool: "get_record_neighbors", detail: "3 linked references" },
  { kind: "tool", module: "crm", server: "crm", tool: "find_many_people", detail: "tag: beta-tester · 12 people" },
  { kind: "tool", module: "proj", server: "projects", tool: "create_work_items", detail: "project “Q4 Launch” · 7 tasks" },
  {
    kind: "reply",
    text: "Created “Q4 Launch” with 7 tasks from your launch checklist. Each task links its reference docs, and the beta outreach task lists your 12 testers.",
  },
];

/** Modules that expose an MCP server for agents to connect to (Agents is the client). */
const mcpServers = (["data", "proj", "crm"] as const).map((id) => {
  const m = modules.find((mod) => mod.id === id)!;
  return { name: m.repo.replace("-centre", ""), endpoint: `${m.url}/mcp` };
});

const pad = (s: string, n: number) => s + " ".repeat(Math.max(0, n - s.length));
const width = Math.max(...mcpServers.map((s) => s.name.length));

export const mcpSnippets = [
  {
    id: "claude",
    label: "Claude Code",
    file: "terminal",
    code: mcpServers
      .map((s) => `claude mcp add --transport http ${s.name} \\\n  ${s.endpoint}`)
      .join("\n\n"),
  },
  {
    id: "cursor",
    label: "Cursor",
    file: ".cursor/mcp.json",
    code: `{
  "mcpServers": {
${mcpServers.map((s) => `    ${pad(`"${s.name}":`, width + 3)} { "url": "${s.endpoint}" }`).join(",\n")}
  }
}`,
  },
  {
    id: "agents",
    label: "Cybernetics Agents",
    file: "agents.yaml",
    code: `mcpServers:
${mcpServers.map((s) => `  ${s.name}:\n    type: streamable-http\n    url: ${s.endpoint}`).join("\n")}`,
  },
];

/**
 * Every section of the page, in order. Drives the tmux status bar, the title-bar
 * path and the command palette.
 */
export const sections = [
  { id: "top", win: "boot", path: "~" },
  { id: "diff", win: "diff", path: "~/problem" },
  { id: "know", win: "know", path: "~/know-do" },
  { id: "modules", win: "modules", path: "/opt/cybernetics" },
  { id: "mcp", win: "mcp", path: "~/.config/mcp" },
  { id: "log", win: "log", path: "/var/log" },
  { id: "who", win: "who", path: "/home" },
  { id: "compose", win: "compose", path: "~/stack" },
  { id: "shell", win: "shell", path: "~" },
  { id: "logout", win: "logout", path: "~" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

/** The `cyborgize` boot script: one line per module, linked in this order. */
export const bootSequence: { id: ModuleId; label: string; detail: string }[] = [
  { id: "data", label: "data-centre", detail: "knowledge · how-tos · refs" },
  { id: "proj", label: "projects", detail: "goals · projects · tasks" },
  { id: "crm", label: "crm", detail: "people · companies · deals" },
  { id: "agent", label: "agents", detail: "mcp × 3 online" },
];

export const BOOT_COMMAND = "cyborgize --subject you";
export const BOOT_DONE = "cyborgization complete. your agents now know you.";
