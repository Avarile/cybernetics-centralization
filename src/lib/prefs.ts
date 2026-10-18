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
