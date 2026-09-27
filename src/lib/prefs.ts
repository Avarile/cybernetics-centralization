"use client";

import { useSyncExternalStore } from "react";

/** Reads a `data-*` attribute on <html> reactively (theme, crt). */
export function useHtmlData(name: "theme" | "crt", serverValue: string | undefined) {
  return useSyncExternalStore(
    (cb) => {
      const mo = new MutationObserver(cb);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: [`data-${name}`] });
      return () => mo.disconnect();
    },
    () => document.documentElement.dataset[name],
    () => serverValue,
  );
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function toggleTheme(to?: "dark" | "light") {
  const d = document.documentElement;
  const next = to ?? (d.dataset.theme === "dark" ? "light" : "dark");
  d.dataset.theme = next;
  save("theme", next);
}

export function toggleCrt(to?: "on" | "off") {
  const d = document.documentElement;
  const next = to ?? (d.dataset.crt === "off" ? "on" : "off");
  if (next === "off") d.dataset.crt = "off";
  else delete d.dataset.crt;
  save("crt", next);
}

export const THEME_LABEL: Record<string, string> = { dark: "phosphor", light: "paper" };

/** Resolves once the startup screen (if any) has finished. */
export function whenBooted(): Promise<void> {
  if (!document.documentElement.dataset.boot) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener("cyber:booted", () => resolve(), { once: true }));
}

export function openPalette() {
  window.dispatchEvent(new Event("cyber:palette"));
}

export function gotoSection(id: string) {
  document.getElementById(id)?.scrollIntoView();
}
