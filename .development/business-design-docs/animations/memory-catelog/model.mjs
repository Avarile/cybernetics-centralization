// The truth behind the figure: a snapshot of the agent memory on this machine
// (~/.claude/projects/<cwd>/memory/*.md) and the rules the agent follows with it.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(readFileSync(join(HERE, "memories.json"), "utf8"));

// Trays from far to near. Each memory file declares exactly one of these in its frontmatter.
export const TYPES = ["user", "feedback", "reference", "project"];

export const MEMORIES = DATA.memories.map((memory, id) => ({ id, ...memory }));
export const INDEX = DATA.index; // characters on each "- [Title](file.md) — hook" line of MEMORY.md
export const FOLDERS = DATA.folders;
export const SNAPSHOT = DATA.snapshot;

export const byType = Object.fromEntries(TYPES.map((type) => [type, MEMORIES.filter((memory) => memory.type === type)]));
export const LINKS = MEMORIES.flatMap((memory) => memory.links.filter((to) => to >= 0).map((to) => [memory.id, to]));
export const DANGLING = MEMORIES.reduce((sum, memory) => sum + memory.links.filter((to) => to < 0).length, 0);
export const RAW_LINKS = DATA.rawLinks;

// The two cards the tour handles: one updated in place, one recalled and followed through its links.
export const MANAGED = 38; // a project note with no links, at the front of its tray
export const RECALLED = 17; // a project note with links into the feedback and reference trays
export const outOf = (id) => LINKS.filter(([from]) => from === id).map(([, to]) => to);
export const into = (id) => LINKS.filter(([, to]) => to === id).map(([from]) => from);

// One new memory goes through the whole life cycle: it is a feedback note.
export const NEW_TYPE = "feedback";
