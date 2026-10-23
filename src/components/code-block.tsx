"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

/** A fenced code block from Markdown: language label, the code, and a copy button. */
export function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const zh = useLocale() === "zh";

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span>{lang || "text"}</span>
        <button type="button" onClick={copy} className="hover:text-fg" aria-label={zh ? "复制代码" : "Copy code"}>
          {copied ? (zh ? "已复制 ✓" : "copied ✓") : zh ? "复制" : "copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
