import * as en from "./content";
import type { Consumer, Figure, ModuleId, Module, Shot, TranscriptLine } from "./content";
import type { Locale } from "./i18n";

/**
 * The Chinese text of `content.ts`. Only words live here: ids, URLs, tones, tool names and
 * connect snippets come from the English entries, so the two can't drift apart.
 */

type ModuleText = Pick<Module, "name" | "role" | "tagline" | "description" | "capabilities">;

const MODULES: Record<ModuleId, ModuleText> = {
  data: {
    name: "数据库",
    role: "你知道什么",
    tagline: "一切的地基。你的知识，结构化。",
    description:
      "其他一切的基础。一个属于你的数据库，存放知识、操作指南、参考资料、财务，以及任何你能定义的东西——表格、视图和记录关系图，你和你的智能体都能查询。",
    capabilities: ["知识、操作指南和参考资料都是相互链接的记录", "自定义表格、字段和视图——不被任何模式锁定", "记录之间的关系图谱"],
  },
  proj: {
    name: "项目管理",
    role: "你在做什么",
    tagline: "你的意图，可执行。",
    description:
      "一款经典的项目管理工具，同时也是连接人与智能体的那一层——内置数据库，每个任务都带着完成它所需的知识。",
    capabilities: [
      "经典的项目工具：目标、项目、周期和任务",
      "你与智能体之间的中间层——工作可以分配给任何一方",
      "任务链接到数据库里所需的知识",
    ],
  },
  crm: {
    name: "CRM",
    role: "你的客户是谁",
    tagline: "你的人际关系，不会遗忘。",
    description: "为每一位经营私人业务的人准备：人员、公司、商机、笔记和跟进——围绕你工作的社交图谱。",
    capabilities: ["联系人、公司和商机", "任何记录上都能加笔记、任务和时间线", "邮件和日历上下文"],
  },
  agent: {
    name: "智能体平台",
    role: "谁替你行动",
    tagline: "一切在这里汇合。",
    description: "数据库、项目管理和 CRM 的数据在这里汇合。自定义智能体通过 MCP 读取它们，并用技能完成更难的工作。",
    capabilities: ["通过 MCP 读取全部三个平台的自定义智能体", "处理复杂、可重复任务的技能", "任何模型、任何服务商——你的数据始终属于你"],
  },
};

const PERSONAS: Record<string, { name: string; pain: string; plan: string }> = {
  freelancer: {
    name: "自由职业者",
    pain: "在客户、交付物和来之不易的经验之间疲于奔命。",
    plan: "客户、项目和背后的工作手册，都在一个地方。",
  },
  founder: {
    name: "创始人",
    pain: "头绪太多，人手太少。",
    plan: "一个了解路线图、客户和做事方式的智能体。",
  },
  researcher: {
    name: "研究者",
    pain: "参考文献和发现堆积的速度，远超它们被连接起来的速度。",
    plan: "参考文献图谱，直接链接到使用它们的实验。",
  },
  student: {
    name: "学生",
    pain: "笔记、截止日期和课程散落各处。",
    plan: "不断积累的知识，加上一份智能体能帮你坚持的学习计划。",
  },
  team: {
    name: "小团队",
    pain: "人一走，经验就跟着走了。",
    plan: "共享的操作指南和项目，任何队友——或智能体——都能接手。",
  },
};

const PRINCIPLES: Record<string, { name: string; line: string; body: string }> = {
  "01": {
    name: "数据优先，AI 其次",
    line: "没有数据基础的算力，只是一台幻觉制造机。",
    body: "你计划、学习、决定和修复的一切，都落进同一个结构化数据库——事实存进数据仓库，进行中的工作放在操作层。AI 的好坏，取决于它能读到什么。",
  },
  "02": {
    name: "不绑定任何 AI",
    line: "你的数据不住在任何大模型平台上。",
    body: "持久化与大模型服务商相互独立。把 Claude 换成别家，或者同时用好几家：同一批记录可以写代码、画图，也可以起草广告。",
  },
  "03": {
    name: "闭环",
    line: "每跑一圈，下一圈都更好。",
    body: "谁在什么时候、用什么知识做了什么，结果如何——全部有记录。完成的工作作为经验反馈回来，流程因此不断改进，而不是重复犯错。",
  },
};

type ConsumerText = Pick<Consumer, "kind" | "headline" | "line" | "uses"> & {
  /** The session's prompt, each tool call's detail, and the reply, in order. */
  session: string[];
};

const CONSUMERS: Record<string, ConsumerText> = {
  "claude-code": {
    kind: "终端 · 编程智能体",
    headline: "领取任务，完成上线，闭环收尾。",
    line: "Claude Code 从项目管理里领取工作，按数据库里的操作指南执行，完成后记录它做了什么。",
    uses: ["领取分配给它的工作项", "遵循你的操作指南和运维手册", "在工作项上留言并关闭它"],
    session: [
      "领取我的下一个任务，按我们一贯的部署方式上线。",
      "负责人：claude · WEB-12 “上线 v2 api”",
      "操作指南：“部署到生产环境” · 1 条匹配",
      "WEB-12 · 检查清单 6/6 ✓",
      "WEB-12 → 已完成",
      "已按你的部署指南上线 WEB-12：检查清单 6 步全部通过。运行日志已附在工作项上，状态已标记为完成。",
    ],
  },
  codex: {
    kind: "终端 · 编程智能体",
    headline: "修好 bug，留下教训。",
    line: "Codex 从项目管理读取 bug 报告，查一查你已有的相关知识，再把修复方法作为知识存回去，留给下一次。",
    uses: ["读取 bug 报告及其链接的参考资料", "写新代码之前先搜索过去的修复", "把新的经验教训存进数据库"],
    session: [
      "修复 WEB-42，并记下它的原因。",
      "WEB-42 “webhook 重试导致发票重复”",
      "参考资料：“stripe webhooks” · 2 条匹配",
      "操作指南：“幂等的 webhook 处理”",
      "WEB-42 → 评审中",
      "已修复：处理程序现在以 Stripe 事件 id 作为键。我把原因和这个模式存成了一条操作指南，并把 WEB-42 移到了评审。",
    ],
  },
  chatgpt: {
    kind: "聊天 · 网页和手机",
    headline: "随时随地，问问你这一周。",
    line: "在手机上，ChatGPT 能看到你的联系人、商机和待办任务，并把笔记留在该留的地方。",
    uses: ["跨三个平台回答问题", "在 CRM 中查找人员和商机", "在 CRM 记录上留下笔记"],
    session: [
      "这周我该跟进谁？",
      "上次联系 > 14 天 · 5 人",
      "“跟进” · 3 项未完成",
      "person#88 · “跟进续约情况”",
      "有五个人已经超过跟进时间，其中三人还有未完成的任务。先从 Dana 开始，她的续约还有九天到期。我已在那条记录上留了笔记。",
    ],
  },
  "claude-cowork": {
    kind: "桌面 · 知识工作",
    headline: "把琐事交出去。",
    line: "Claude Cowork 在你的桌面上处理较长的工作：它读取周期、笔记和相关人员，然后写出报告。",
    uses: ["在桌面上运行多步骤任务", "把完成的工作整理成报告", "报告和你的其他记录存放在一起"],
    session: [
      "写好本周报告并归档。",
      "周期 42 · 完成 14 项 · 顺延 3 项",
      "本周笔记 · 9 条记录",
      "本周有过往来 · 6 人",
      "报告：“第 42 周”",
      "已归档“第 42 周”：交付 14 项，3 项顺延并附原因，6 次沟通已汇总。报告已链接到它所覆盖的周期。",
    ],
  },
  agents: {
    kind: "cybernetics · 自定义智能体",
    headline: "你自己的智能体，跑在任何模型上。",
    line: "我们自己的平台：为你的工作打造自定义智能体，给它们技能去应对更难的任务，并跑在你选择的任何模型上。",
    uses: ["通过 MCP 读取全部三个平台的自定义智能体", "处理复杂、可重复任务的技能", "任何模型、任何服务商：你的数据始终属于你"],
    session: [
      "参照我上次的发布方式，规划第四季度的产品发布。",
      "操作指南：“发布检查清单” · 1 条匹配",
      "3 条链接的参考资料",
      "标签：beta-tester · 12 人",
      "项目 “Q4 发布” · ×7",
      "已根据你的发布检查清单创建“Q4 发布”项目，包含 7 个任务。每个任务都链接了参考文档，beta 外联任务列出了你的 12 位测试者。",
    ],
  },
  any: {
    kind: "cursor · gemini · vs code · …",
    headline: "无论下一个是什么，都能接上。",
    line: "每个平台都支持 MCP，所以任何支持它的客户端都能获得同样的记忆。换工具，不用换数据。",
    uses: ["一个标准协议，没有锁定", "每个用户的令牌决定每个客户端能看到什么", "无论哪个模型来读，都是同一批记录"],
    session: [
      "关于限流，我已经知道些什么？",
      "“限流” · 4 条记录",
      "2 个项目 · 1 次事故",
      "你有四条相关笔记，包括一条被两个项目使用的令牌桶操作指南，以及三月那次事故的复盘——它改变了你的默认设置。",
    ],
  },
};

/** Puts the translated prompt, tool details and reply back into the English session's lines. */
function translateSession(session: TranscriptLine[], text: string[]): TranscriptLine[] {
  return session.map((line, i) => {
    if (line.kind === "tool") return { ...line, detail: text[i] };
    return { ...line, text: text[i] };
  });
}

const SHOTS: Record<string, Pick<Shot, "label" | "caption">> = {
  "screenshot-database-mcp.png": { label: "mcp", caption: "每个用户一个访问令牌，一个 MCP 端点：你的智能体只拿到你授予的权限。" },
  "screenshot-project-management-homepage.png": { label: "首页", caption: "你的工作区首页：最近的工作、快捷链接和便签。" },
  "screenshot-project-management-projects.png": {
    label: "工作项",
    caption: "项目、周期和模块——经典的工具，做得扎实。有些工作项分配给了 AI 智能体。",
  },
  "screenshot-project-management-detailed-task.png": { label: "任务", caption: "一个带着历史和关联关系的工作项——分配给智能体，由你来评审。" },
  "screenshot-project-management-module-control.png": { label: "模块", caption: "按模块和周期做计划；人和智能体在同一块看板上工作。" },
  "screenshot-crm-workflow.png": { label: "工作流", caption: "人员、公司和商机，上面运行着工作流。" },
  "screenshot-crm-mcp.png": { label: "mcp", caption: "通过 MCP，Claude、ChatGPT、Cursor 等都能触达你的人际关系。" },
};

const FIGURES: Record<string, Pick<Figure, "title" | "caption">> = {
  personPrinter: { title: "人物打印机", caption: "把自己数字化：你知道的和你做的，记录一次，就打印成结构化记录。" },
  oneManArmy: { title: "一人工作室", caption: "一个人，一整个工作室的产出——因为所有智能体都连着同一份记忆。" },
  financeSorter: { title: "账单分拣机", caption: "原始账单进去，分好类、可查询的财务记录从数据库里出来。" },
  agentDispatch: { title: "智能体调度铁路", caption: "项目管理是你与智能体之间的那一层：写下任务，分配出去，看着它流转。" },
  memoryCatalog: { title: "智能体记忆目录", caption: "智能体如何归档、索引和调取记忆——让它们越用越敏锐的闭环。" },
};

const zh = {
  SITE_TITLE: "Cybernetics — 让自己赛博格化，以智能体的方式",
  SITE_DESCRIPTION: "Cybernetics 把你知道的和你做的，变成属于你自己的结构化数据——通过 MCP，随时供任何 AI 智能体使用。",
  modules: en.modules.map((m) => ({ ...m, ...MODULES[m.id] })),
  personas: en.personas.map((p) => ({ ...p, ...PERSONAS[p.login] })),
  principles: en.principles.map((p) => ({ ...p, ...PRINCIPLES[p.n] })),
  consumers: en.consumers.map((c) => {
    const { session, ...text } = CONSUMERS[c.id];
    return { ...c, ...text, session: translateSession(c.session, session) };
  }),
  screenshots: Object.fromEntries(
    Object.entries(en.screenshots).map(([id, shots]) => [id, shots.map((s) => ({ ...s, ...SHOTS[s.file] }))]),
  ) as typeof en.screenshots,
  figures: Object.fromEntries(
    Object.entries(en.figures).map(([key, f]) => [key, { ...f, ...FIGURES[key] }]),
  ) as typeof en.figures,
};

const english = {
  SITE_TITLE: en.SITE_TITLE,
  SITE_DESCRIPTION: en.SITE_DESCRIPTION,
  modules: en.modules,
  personas: en.personas,
  principles: en.principles,
  consumers: en.consumers,
  screenshots: en.screenshots,
  figures: en.figures,
};

/** The translatable parts of `content.ts` in `locale`. */
export const contentFor = (locale: Locale): typeof english => (locale === "zh" ? zh : english);
