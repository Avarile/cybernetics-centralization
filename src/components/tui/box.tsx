import type { CSSProperties, ReactNode } from "react";

/**
 * A box-drawn panel: 1px border with its title set into the top edge, like
 * `┌─ title ─────┐`. `term` makes it an always-dark terminal window.
 */
export function Box({
  title,
  right,
  tone,
  term = false,
  className = "",
  bodyClassName = "p-4 sm:p-5",
  children,
}: {
  title?: ReactNode;
  right?: ReactNode;
  tone?: string;
  term?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const style = {
    borderColor: tone ? `color-mix(in oklab, ${tone} 55%, var(--line))` : undefined,
    "--tone": tone ?? "var(--dim)",
  } as CSSProperties;

  return (
    <div style={style} className={`relative min-w-0 border border-line ${term ? "term bg-bg" : ""} ${className}`}>
      {title && (
        <div className="absolute -top-[0.8em] left-3 max-w-[calc(100%-1.5rem)] truncate bg-bg px-1.5 text-xs leading-[1.6] text-[var(--tone)]">
          {title}
        </div>
      )}
      {right && (
        <div className="absolute -top-[0.8em] right-3 bg-bg px-1.5 text-xs leading-[1.6]">{right}</div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
