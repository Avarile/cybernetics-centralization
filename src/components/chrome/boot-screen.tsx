"use client";

import { useEffect, useState } from "react";
import type { Copy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

const EN: [string, string?][] = [
  ["CYBERNETICS BIOS v1.0 · (c) 2026 avarile"],
  ["cpu0: human cortex, 1 core, variable clock", "ok"],
  ["memory test: 4 platforms", "ok"],
  ["  data base · project management · crm · agentic"],
  ["loading kernel you.ko", "ok"],
  ["mounting /home/you/knowledge", "ok"],
  ["mounting /home/you/projects", "ok"],
  ["starting mcp daemons [3/3]", "ok"],
  ["boot complete."],
];

const ZH: [string, string?][] = [
  ["CYBERNETICS BIOS v1.0 · (c) 2026 avarile"],
  ["cpu0：人类大脑皮层，单核，可变主频", "ok"],
  ["内存检测：4 个平台", "ok"],
  ["  数据库 · 项目管理 · crm · 智能体"],
  ["加载内核 you.ko", "ok"],
  ["挂载 /home/you/knowledge", "ok"],
  ["挂载 /home/you/projects", "ok"],
  ["启动 mcp 守护进程 [3/3]", "ok"],
  ["启动完成。"],
];

const LINES: Copy<[string, string?][]> = { en: EN, zh: ZH };
const SKIP: Copy<string> = { en: "press any key to skip", zh: "按任意键跳过" };

const STEP_MS = 120;
const HOLD_MS = 450;

/**
 * Once-per-session POST screen. Visible only while <html data-boot> is set (by the
 * head script), so returning visitors never see a flash of it. Any key, click or
 * tap skips it.
 */
export function BootScreen() {
  const locale = useLocale();
  const lines = LINES[locale];
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const d = document.documentElement;
    if (!d.dataset.boot) return;

    let done = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      if (done) return;
      done = true;
      setLeaving(true);
      timers.push(
        setTimeout(() => {
          delete d.dataset.boot;
          try {
            sessionStorage.setItem("booted", "1");
          } catch {}
          window.dispatchEvent(new Event("cyber:booted"));
        }, 250),
      );
    };

    // Both languages have the same number of lines.
    EN.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), (i + 1) * STEP_MS)));
    timers.push(setTimeout(finish, EN.length * STEP_MS + HOLD_MS));

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  return (
    <div
      role="status"
      aria-label={locale === "zh" ? "正在启动 Cybernetics" : "Starting Cybernetics"}
      className={`boot-screen fixed inset-0 z-[80] flex-col justify-between bg-bg bg-none p-5 text-[13px] transition-opacity duration-200 sm:p-8 ${
        leaving ? "opacity-0" : ""
      }`}
    >
      <div className="max-w-[72ch]">
        {lines.slice(0, shown).map(([text, status], i) => (
          <p key={i} className="flex gap-2">
            <span className={i === 0 ? "text-accent" : ""}>{text}</span>
            {status && (
              <>
                <span aria-hidden className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-dim">
                  {".".repeat(80)}
                </span>
                <span className="text-proj">[ {status} ]</span>
              </>
            )}
          </p>
        ))}
        <span className="cursor-block" />
      </div>
      <p className="text-dim">{SKIP[locale]}</p>
    </div>
  );
}
