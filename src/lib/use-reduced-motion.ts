"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hydration-safe reduced-motion preference: renders `false` during hydration
 * (matching the server), then re-renders with the real value. Motion's own
 * hook reads matchMedia on the first client render, which mismatches SSR.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia(QUERY).matches,
    () => false,
  );
}
