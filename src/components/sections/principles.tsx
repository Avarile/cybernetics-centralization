import { tone } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import type { Copy, Locale } from "@/lib/i18n";
import { Box } from "../tui/box";
import { TuiSection } from "../tui/tui-section";

const COPY: Copy<{ title: string; intro: string; lean: string; points: string[] }> = {
  en: {
    title: "Three principles. Everything else follows.",
    intro:
      "Becoming AI-native is a migration, not a tool purchase. You move pieces of how you think into durable systems you own, one at a time.",
    lean: "Lean by design.",
    points: [
      "Only an LLM and your database. No extra repos, apps or governance layers to run.",
      "Skills extend it quickly; typing or talking to your agent does the daily work.",
      "Access by personal token: least exposure, easy to share, easy to revoke.",
    ],
  },
  zh: {
    title: "三条原则。其余的一切由此而来。",
    intro: "成为 AI 原生是一场迁移，而不是买一个工具。你把自己思考方式的一部分，一块一块地搬进属于你、经得起时间的系统里。",
    lean: "生来精简。",
    points: [
      "只需要一个大模型和你的数据库。不用额外运行任何代码库、应用或治理层。",
      "技能让它快速扩展；日常工作只需对智能体打字或说话。",
      "凭个人令牌访问：暴露面最小，易于分享，也易于撤销。",
    ],
  },
};

export function Principles({ locale = "en" }: { locale?: Locale }) {
  const { principles } = contentFor(locale);
  const t = COPY[locale];
  return (
    <TuiSection id="principles" title={t.title} command="cat PRINCIPLES.md" intro={t.intro}>
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
        <li className="text-fg">{t.lean}</li>
        {t.points.map((p) => (
          <li key={p} className="text-dim">
            - {p}
          </li>
        ))}
      </ul>
    </TuiSection>
  );
}
