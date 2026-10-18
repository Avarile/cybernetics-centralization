import type { ReactNode } from "react";

/**
 * Small Markdown renderer for our own blog posts (trusted content, no raw HTML).
 * Blocks: ## / ### headings, paragraphs, - and 1. lists (`- [ ] ` items are checkboxes), > quotes, | tables |,
 * ---, and `:::cta` lines.
 * Inline: **bold**, *italic*, `code`, [text](url).
 */
export type Slots = { cta: (text: string, key: number) => ReactNode };

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
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
    } else if (/^#{2,3} /.test(line)) {
      i++;
      const text = line.replace(/^#{2,3} /, "");
      out.push(line.startsWith("### ") ? <h3 key={key}>{inline(text)}</h3> : <h2 key={key}>{inline(text)}</h2>);
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
      const items = take((l) => /^(- |\d+\. )/.test(l)).map((l) => l.replace(/^(- |\d+\. )/, ""));
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={key}>
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
      const para = take((l) => !!l.trim() && !/^(#{2,3} |>|\||- |\d+\. |:::|-{3,}\s*$)/.test(l));
      out.push(<p key={key}>{inline(para.join(" "))}</p>);
    }
  }
  return out;
}
