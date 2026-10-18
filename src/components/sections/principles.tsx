import { principles, tone } from "@/lib/content";
import { Box } from "../tui/box";
import { TuiSection } from "../tui/tui-section";

export function Principles() {
  return (
    <TuiSection
      id="principles"
      title="Three principles. Everything else follows."
      command="cat PRINCIPLES.md"
      intro="Becoming AI-native is a migration, not a tool purchase. You move pieces of how you think into durable systems you own, one at a time."
    >
      <div className="grid gap-8 md:grid-cols-3">
        {principles.map((p) => (
          <Box
            key={p.n}
            tone={tone[p.tone]}
            title={`principle/${p.n}`}
            className="h-full"
            bodyClassName="flex h-full flex-col p-5 text-[13px]"
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: tone[p.tone] }}
            >
              <span className="text-dim">{p.n} </span>
              {p.name}
            </h3>
            <p className="mt-2 font-semibold text-pretty">{p.line}</p>
            <p className="mt-3 text-dim text-pretty">{p.body}</p>
          </Box>
        ))}
      </div>
      <ul className="mt-12 max-w-[72ch] space-y-3 text-[13px]">
        <li className="text-fg">Lean by design.</li>
        <li className="text-dim">
          - Only an LLM and your database. No extra repos, apps or governance layers
          to run.
        </li>
        <li className="text-dim">
          - Skills extend it quickly; typing or talking to your agent does the
          daily work.
        </li>
        <li className="text-dim">
          - Access by personal token: least exposure, easy to share, easy to
          revoke.
        </li>
      </ul>
    </TuiSection>
  );
}
