"use client";

import { useEffect, useState } from "react";

const LINES: [string, string?][] = [
  ["CYBERNETICS BIOS v1.0 · (c) 2026 avarile"],
  ["cpu0: human cortex, 1 core, variable clock", "ok"],
  ["memory test: 4 modules", "ok"],
  ["  data-centre · projects · crm · agents"],
  ["loading kernel you.ko", "ok"],
  ["mounting /home/you/knowledge", "ok"],
  ["mounting /home/you/projects", "ok"],
  ["starting mcp daemons [3/3]", "ok"],
  ["boot complete."],
];

const STEP_MS = 120;
const HOLD_MS = 450;

/**
 * Once-per-session POST screen. Visible only while <html data-boot> is set (by the
 * head script), so returning visitors never see a flash of it. Any key, click or
 * tap skips it.
 */
export function BootScreen() {
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

    LINES.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), (i + 1) * STEP_MS)));
    timers.push(setTimeout(finish, LINES.length * STEP_MS + HOLD_MS));

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
      aria-label="Starting Cybernetics"
      className={`boot-screen term glow fixed inset-0 z-[80] flex-col justify-between bg-bg p-5 text-[13px] transition-opacity duration-200 sm:p-8 ${
        leaving ? "opacity-0" : ""
      }`}
    >
      <div className="max-w-[72ch]">
        {LINES.slice(0, shown).map(([text, status], i) => (
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
      <p className="text-dim">press any key to skip</p>
    </div>
  );
}
