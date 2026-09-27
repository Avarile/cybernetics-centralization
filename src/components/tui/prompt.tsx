/** `you@cybernetics:~$` — the shell prompt used across the site. */
export function Prompt({ user = "you", path = "~" }: { user?: string; path?: string }) {
  return (
    <span className="shrink-0 select-none">
      <span className="text-accent">{user}@cybernetics</span>
      <span className="text-dim">:</span>
      <span className="text-data">{path}</span>
      <span className="text-dim">$</span>
    </span>
  );
}
