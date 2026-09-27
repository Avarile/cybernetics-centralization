import { diffLines } from "@/lib/content";
import { Box } from "../tui/box";
import { TuiSection } from "../tui/tui-section";

export function Diff() {
  return (
    <TuiSection
      id="diff"
      title="You are the only system that knows how you work."
      command="git diff analog-you cyborg-you"
      intro="And that system has no API. AI agents are powerful — but without your context, they're strangers."
    >
      <Box title="diff --git a/analog-you b/cyborg-you" bodyClassName="py-3 text-[13px] sm:text-sm">
        <p className="px-4 text-dim">--- a/analog-you</p>
        <p className="px-4 text-dim">+++ b/cyborg-you</p>
        <p className="px-4 text-data">@@ -1,3 +1,3 @@ you</p>
        {diffLines.map((d) => (
          <div key={d.minus} className="mt-1">
            <p className="flex gap-3 bg-[color-mix(in_oklab,var(--red)_10%,transparent)] px-4 text-red">
              <span aria-hidden>-</span>
              <span className="sr-only">Before:</span>
              <span>{d.minus}</span>
            </p>
            <p className="flex gap-3 bg-[color-mix(in_oklab,var(--proj)_12%,transparent)] px-4 text-proj">
              <span aria-hidden>+</span>
              <span className="sr-only">After:</span>
              <span>{d.plus}</span>
            </p>
          </div>
        ))}
      </Box>
      <p className="mt-3 text-xs text-dim">3 files changed, 3 insertions(+), 3 deletions(-)</p>
    </TuiSection>
  );
}
