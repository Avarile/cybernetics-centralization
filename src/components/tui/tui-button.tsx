"use client";

import { useScramble } from "use-scramble";

/**
 * `[ label ]` link. `primary` is an inverted block; the label scrambles briefly on hover.
 */
export function TuiButton({
  href,
  label,
  primary = false,
  external = false,
  onClick,
}: {
  href?: string;
  label: string;
  primary?: boolean;
  external?: boolean;
  onClick?: () => void;
}) {
  const { ref, replay } = useScramble({ text: label, speed: 0.8, scramble: 3, range: [33, 126], playOnMount: false });
  const cls = `group inline-flex items-center whitespace-nowrap px-1 py-0.5 text-sm transition-colors ${
    primary
      ? "bg-accent text-accent-fg hover:bg-fg hover:text-bg"
      : "text-accent hover:bg-accent hover:text-accent-fg"
  }`;
  const inner = (
    <>
      <span aria-hidden>[&nbsp;</span>
      <span ref={ref}>{label}</span>
      {external && <span aria-hidden>&nbsp;↗</span>}
      <span aria-hidden>&nbsp;]</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onMouseEnter={replay}
        onClick={onClick}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onMouseEnter={replay} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
