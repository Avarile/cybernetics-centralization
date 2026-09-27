"use client";

import { useEffect, useState } from "react";
import { sections, type SectionId } from "@/lib/content";

/** Scrollspy: the section crossing the middle of the viewport. */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("top");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return active;
}
