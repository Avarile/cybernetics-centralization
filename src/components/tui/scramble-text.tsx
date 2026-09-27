"use client";

import { useEffect } from "react";
import { useScramble } from "use-scramble";

/**
 * Decrypts into `text` from random glyphs. Re-scrambles when `text` changes, and
 * replays whenever `replayKey` changes. The hook writes straight to the DOM;
 * `text` is also rendered as children so it is present before hydration.
 */
export function ScrambleText({
  text,
  className,
  replayKey,
  speed = 0.55,
}: {
  text: string;
  className?: string;
  replayKey?: unknown;
  speed?: number;
}) {
  const { ref, replay } = useScramble({
    text,
    speed,
    tick: 1,
    step: 1,
    scramble: 8,
    seed: 3,
    range: [33, 126],
    overdrive: false,
  });

  useEffect(() => {
    if (replayKey !== undefined && replayKey !== false) replay();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- replay only when the key changes
  }, [replayKey]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
