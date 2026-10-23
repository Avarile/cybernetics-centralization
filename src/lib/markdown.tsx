import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";

/**
 * Small Markdown renderer for our own blog posts (trusted content, no raw HTML).
 * Blocks: ## / ### / #### headings (with ids for deep links), paragraphs, - and 1. lists (`- [ ] ` items are
 * checkboxes; an ordered list keeps counting after a code block), > quotes, | tables |, ---, ``` fenced code
 * ```, `:::cta` lines, and `:::note|tip|warning [title]` … `:::` callouts.
 * Inline: **bold**, *italic*, `code`, [text](url), and `[YOU: …]` placeholders (highlighted for review).
 */
export type Slots = { cta: (text: string, key: number) => ReactNode };

const INLINE = /(\[YOU:[^\]]*\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("[YOU:"))
      return (
        <mark key={i} className="border border-dashed border-red bg-transparent px-1 text-red">
          {part}
        </mark>
      );
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <a key={i} href={link[2]} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {link[1]}
        </a>
      );
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/** "Create a token (Data Base)" → "create-a-token-data-base"; the docs' "on this page" list uses the same ids. */
export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[*`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CALLOUT = /^:::(note|tip|warning)\b\s*(.*)$/;

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

export function renderMarkdown(src: string, slots: Slots): ReactNode[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  const take = (test: (l: string) => boolean) => {
    const block: string[] = [];
    while (i < lines.length && test(lines[i])) block.push(lines[i++]);
    return block;
  };

  while (i < lines.length) {
    const line = lines[i];
    const key = out.length;
    if (!line.trim()) {
      i++;
    } else if (line.startsWith(":::cta")) {
      i++;
      out.push(slots.cta(line.slice(6).trim(), key));
    } else if (CALLOUT.test(line)) {
      const [, kind, title] = CALLOUT.exec(line)!;
      i++;
      const inner = take((l) => l.trim() !== ":::");
      i++; // closing :::
      out.push(
        <aside key={key} className={`callout callout-${kind}`}>
          <p className="callout-title">{title || kind}</p>
          {renderMarkdown(inner.join("\n"), slots)}
        </aside>,
      );
    } else if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      i++;
      const code = take((l) => !l.startsWith("```"));
      i++; // closing fence
      out.push(<CodeBlock key={key} lang={lang} code={code.join("\n")} />);
    } else if (/^#{2,4} /.test(line)) {
      i++;
      const level = line.indexOf(" ");
      const text = line.slice(level + 1);
      const Tag = (["h2", "h3", "h4"] as const)[level - 2];
      out.push(
        <Tag key={key} id={headingId(text)}>
          {inline(text)}
        </Tag>,
      );
    } else if (/^-{3,}\s*$/.test(line)) {
      i++;
      out.push(<hr key={key} />);
    } else if (line.startsWith(">")) {
      const block = take((l) => l.startsWith(">")).map((l) => l.replace(/^>\s?/, ""));
      out.push(
        <blockquote key={key}>
          <p>{inline(block.join(" "))}</p>
        </blockquote>,
      );
    } else if (line.startsWith("|")) {
      const [head, , ...rows] = take((l) => l.startsWith("|"));
      out.push(
        <div key={key} className="table-wrap">
          <table>
            <thead>
              <tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, j) => (
                <tr key={j}>{cells(r).map((c, k) => <td key={k}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const start = ordered ? Number(/^\d+/.exec(line)![0]) : undefined;
      const items = take((l) => /^(- |\d+\. )/.test(l)).map((l) => l.replace(/^(- |\d+\. )/, ""));
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={key} start={start !== 1 ? start : undefined}>
          {items.map((t, j) =>
            t.startsWith("[ ] ") ? (
              <li key={j} className="task">
                {inline(t.slice(4))}
              </li>
            ) : (
              <li key={j}>{inline(t)}</li>
            ),
          )}
        </List>,
      );
    } else {
      const para = take((l) => !!l.trim() && !/^(#{2,4} |>|\||- |\d+\. |:::|```|-{3,}\s*$)/.test(l));
      out.push(<p key={key}>{inline(para.join(" "))}</p>);
    }
  }
  return out;
}
