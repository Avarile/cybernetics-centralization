import { personas } from "@/lib/content";
import { TuiSection } from "../tui/tui-section";

export function Who() {
  return (
    <TuiSection
      id="who"
      title="Anyone whose work lives in their head."
      command="finger @cybernetics"
      intro="If you keep knowledge and have things to do, you already run a system. Cybernetics makes it one your agents can use."
    >
      <p className="mb-6 text-[13px] text-dim">[cybernetics.avarile.com] · {personas.length} users on since forever</p>
      <div className="grid gap-x-10 gap-y-8 text-[13px] md:grid-cols-2 lg:grid-cols-3">
        {personas.map((p) => (
          <article key={p.login} className="border-l border-line pl-4 transition-colors hover:border-accent">
            <h3 className="flex flex-wrap gap-x-4">
              <span>
                <span className="text-dim">Login: </span>
                <span className="text-accent">{p.login}</span>
              </span>
              <span>
                <span className="text-dim">Name: </span>
                <span className="font-semibold">{p.name}</span>
              </span>
            </h3>
            <p className="mt-2">
              <span className="text-dim">Pain: </span>
              <span className="text-dim">{p.pain}</span>
            </p>
            <p className="mt-1">
              <span className="text-dim">Plan: </span>
              {p.plan}
            </p>
          </article>
        ))}
      </div>
    </TuiSection>
  );
}
