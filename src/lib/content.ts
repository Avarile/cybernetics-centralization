export const SITE_URL = "https://blog.avarile.com";

/** Where this site is served; absolute URLs for canonical links and OG images. */
export const BASE_URL = "https://avarile.com";

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
    name: "Data Base",
    repo: "cybernetics-data-centre",
    url: "https://cybernetics.avarile.com",
    role: "What you know",
    tagline: "The foundation. Your knowledge, structured.",
    description:
      "The foundation of everything else. One database you own for knowledge, how-tos, references and finances — tables, views and a record graph that you and your agents can query.",
    capabilities: [
      "Knowledge, how-tos and references as linked records",
      "Custom tables, fields and views — no schema lock-in",
      "Graph of relations between records",
    ],
    mcpTools: ["query_records", "create_records", "get_graph", "get_record_neighbors"],
  },
  {
    id: "proj",
    name: "Project Management",
    repo: "cybernetics-projects",
    url: "https://projects.avarile.com",
    role: "What you do",
    tagline: "Your intentions, executable.",
    description:
      "A classic project management tool that doubles as the layer connecting a person to their agents — with the Data Base built in, so every task carries the knowledge needed to finish it.",
    capabilities: [
      "A classic project tool: goals, projects, cycles and tasks",
      "The intermediate layer between you and your agents — assign work to either",
      "Tasks linked to the knowledge they need in the Data Base",
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
      "For anyone running a private business: people, companies, deals, notes and follow-ups — the social graph around your work.",
    capabilities: [
      "Contacts, companies and opportunities",
      "Notes, tasks and timelines on any record",
      "Email and calendar context",
    ],
    mcpTools: ["find_many_people", "create_one_note"],
  },
  {
    id: "agent",
    name: "Agentic Platform",
    repo: "cybernetics-agents",
    url: "https://agentic.avarile.com",
    role: "Who acts for you",
    tagline: "Where it all comes together.",
    description:
      "Data from the Data Base, Project Management and CRM meets here. Custom agents consume it over MCP and use skills for the harder jobs.",
    capabilities: [
      "Custom agents that consume all three platforms over MCP",
      "Skills for complex, repeatable tasks",
      "Any model, any provider — your data stays yours",
    ],
    mcpTools: ["mcp: data · projects · crm"],
  },
];

/** Section 1: the problem as `git diff analog-you cyborg-you`. */
export const diffLines: { minus: string; plus: string }[] = [
  {
    minus: "knowledge scattered across notes, bookmarks, chats and memory",
    plus: "one data base: knowledge, how-tos and references as linked records",
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
  { stage: "capture", tone: "data", text: "data base +3 records (how-to, ref, note)" },
  { stage: "capture", tone: "proj", text: "projects +1 goal \"launch v2\" → 5 tasks" },
  { stage: "structure", tone: "data", text: "linked task#12 → how-to#001 \"deploy to production\"" },
  { stage: "structure", tone: "crm", text: "linked person#88 → project \"launch v2\"" },
  { stage: "delegate", tone: "agent", text: "agent claimed task#12 via mcp" },
  { stage: "delegate", tone: "agent", text: "agent read how-to#001, ran checklist, 6/6 ✓" },
  { stage: "capture", tone: "data", text: "data base +1 record \"launch v2 retro\" (outcome)" },
  { stage: "delegate", tone: "agent", text: "agent drafted beta invite for 12 people (crm)" },
  { stage: "structure", tone: "proj", text: "task#13 unblocked by ref#002 \"stripe api docs\"" },
];

export const logStages = [
  { stage: "capture", text: "Put what you know into the Data Base and what you intend into Project Management. Agents can do the typing." },
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
  { id: "principles", win: "principles", path: "~/principles" },
  { id: "know", win: "know", path: "~/know-do" },
  { id: "modules", win: "platforms", path: "/opt/cybernetics" },
  { id: "mcp", win: "agentic", path: "~/.config/mcp" },
  { id: "log", win: "log", path: "/var/log" },
  { id: "who", win: "who", path: "/home" },
  { id: "compose", win: "compose", path: "~/stack" },
  { id: "shell", win: "shell", path: "~" },
  { id: "logout", win: "logout", path: "~" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

/** The `cyborgize` boot script: one line per module, linked in this order. */
export const bootSequence: { id: ModuleId; label: string; detail: string }[] = [
  { id: "data", label: "data-base", detail: "knowledge · how-tos · refs" },
  { id: "proj", label: "projects", detail: "goals · projects · tasks" },
  { id: "crm", label: "crm", detail: "people · companies · deals" },
  { id: "agent", label: "agents", detail: "mcp × 3 online" },
];

export const BOOT_COMMAND = "cyborgize --subject you";
export const BOOT_DONE = "cyborgization complete. your agents now know you.";

/** The three principles behind the platform, from the Personal-migration design doc. */
export const principles = [
  {
    n: "01",
    tone: "data" as ModuleId,
    name: "Data first, AI second",
    line: "Compute without a data foundation is a hallucination dispenser.",
    body: "Everything you plan, learn, decide and fix lands in one structured database — facts in a warehouse, live work in an operational layer. AI is only as good as what it can read.",
  },
  {
    n: "02",
    tone: "agent" as ModuleId,
    name: "AI agnostic",
    line: "Your data does not live on any LLM platform.",
    body: "Persistence is separate from the model. Swap Claude for another provider, or use several at once: the same records can write code, draw images or draft ads.",
  },
  {
    n: "03",
    tone: "proj" as ModuleId,
    name: "Closed loops",
    line: "Every lap makes the next one better.",
    body: "Who did what, when, with which knowledge, and how it turned out — all recorded. Finished work feeds back as experience, so processes improve instead of repeating mistakes.",
  },
];

export type Shot = { file: string; label: string; caption: string };

/** Screenshots per platform, in public/screens. The Agentic Platform has none yet. */
export const screenshots: Record<"data" | "proj" | "crm", Shot[]> = {
  data: [
    { file: "screenshot-database-mcp.png", label: "mcp", caption: "Per-user access tokens and one MCP endpoint: your agents get exactly the access you grant." },
  ],
  proj: [
    { file: "screenshot-project-management-homepage.png", label: "home", caption: "Your workspace home: recent work, quicklinks and stickies." },
    { file: "screenshot-project-management-projects.png", label: "work items", caption: "Projects, cycles and modules — the classic tooling, done properly. Some items are assigned to AI agents." },
    { file: "screenshot-project-management-detailed-task.png", label: "task", caption: "A work item with its history and relations — assigned to an agent, reviewed by you." },
    { file: "screenshot-project-management-module-control.png", label: "modules", caption: "Plan in modules and cycles; people and agents work the same board." },
  ],
  crm: [
    { file: "screenshot-crm-workflow.png", label: "workflow", caption: "People, companies and opportunities, with workflows running on top." },
    { file: "screenshot-crm-mcp.png", label: "mcp", caption: "Your relationships, reachable by Claude, ChatGPT, Cursor and more over MCP." },
  ],
};

export type Figure = { id: string; src: string; title: string; caption: string };

/** Interactive isometric figures, in public/figures (light builds). */
export const figures: Record<string, Figure> = {
  personPrinter: {
    id: "person-printer",
    src: "/figures/person-printer.html",
    title: "Person printer",
    caption: "Digitalize yourself: what you know and do is captured once and printed into structured records.",
  },
  oneManArmy: {
    id: "one-man-army",
    src: "/figures/one-man-army.html",
    title: "One-person studio",
    caption: "One person, a studio's worth of output — because the agents are connected to the same memory.",
  },
  financeSorter: {
    id: "finance-sorter",
    src: "/figures/finance-sorter.html",
    title: "Statement sorter",
    caption: "Raw statements go in; categorised, queryable finance records come out of the Data Base.",
  },
  agentDispatch: {
    id: "agent-dispatch",
    src: "/figures/agent-dispatch.html",
    title: "Agent dispatch railway",
    caption: "Project Management as the layer between you and your agents: write a task, assign it, watch it move.",
  },
  memoryCatalog: {
    id: "memory-catalog",
    src: "/figures/memory-catalog.html",
    title: "Agent memory catalog",
    caption: "How agents file, index and recall memory — the closed loop that makes them sharper over time.",
  },
};
