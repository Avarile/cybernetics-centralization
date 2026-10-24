import type { Metadata } from "next";
import { SiteNav } from "@/components/chrome/site-nav";
import { RegisterForm } from "@/components/register-form";
import { pageHref } from "@/lib/blog";
import { tone } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { localePath, type Copy, type Locale } from "@/lib/i18n";
import { alternates, baseOpenGraph } from "@/lib/seo";

const COPY: Copy<{
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  label: string;
  heading: string;
  intro: string;
  get: string;
  how: string;
  steps: string[];
  data: string;
  dataLine: string;
  privacy: string;
}> = {
  en: {
    title: "Register for early access",
    description:
      "Register for early access to Cybernetics: your knowledge, projects and relationships, ready for any AI agent over MCP.",
    ogTitle: "Start your 4-week Cyborg Migration",
    ogDescription: "One memory you own, any AI plugged into it, and a weekly loop that learns. No tech skills needed.",
    label: "register",
    heading: "Get early access.",
    intro: "Turn what you know and what you do into structured data you own, ready for any AI agent over MCP.",
    get: "# what you get",
    how: "# how it goes",
    steps: [
      "register — about two minutes",
      "we reach out personally to set you up",
      "start with the modules you picked",
      "connect any MCP agent to your data",
    ],
    data: "# your data",
    dataLine:
      "We only use these details to set up your access and to contact you about it. Product updates are opt-in. Ask us to delete your details at any time.",
    privacy: "Read the privacy policy.",
  },
  zh: {
    title: "注册抢先体验",
    description: "注册抢先体验 Cybernetics：你的知识、项目和人际关系，通过 MCP 随时供任何 AI 智能体使用。",
    ogTitle: "开始你的 4 周赛博格迁移",
    ogDescription: "一份属于你的记忆，任何 AI 都能接入，再加上一个会学习的每周闭环。无需任何技术背景。",
    label: "注册",
    heading: "获取抢先体验资格。",
    intro: "把你知道的和你做的，变成属于你自己的结构化数据，通过 MCP 随时供任何 AI 智能体使用。",
    get: "# 你将获得",
    how: "# 流程",
    steps: ["注册——大约两分钟", "我们会亲自联系你，帮你完成设置", "从你选择的模块开始", "把任何 MCP 智能体连接到你的数据"],
    data: "# 你的数据",
    dataLine: "我们只会用这些信息为你开通访问权限，并就此与你联系。产品动态需你主动订阅。你可以随时要求我们删除你的信息。",
    privacy: "阅读隐私政策。",
  },
};

export function registerMetadata(locale: Locale): Metadata {
  const t = COPY[locale];
  return {
    title: t.title,
    description: t.description,
    alternates: alternates("/register", locale),
    openGraph: {
      ...baseOpenGraph(locale),
      url: localePath(locale, "/register"),
      title: t.ogTitle,
      description: t.ogDescription,
      // The share card has no CJK font, so both languages use the English one.
      ...(locale !== "en" && {
        images: [{ url: "/register/opengraph-image", width: 1200, height: 630, alt: "Start your 4-week Cyborg Migration" }],
      }),
    },
    twitter: { card: "summary_large_image" },
  };
}

export function Register({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const { modules } = contentFor(locale);
  const privacyHref = pageHref("privacy", locale);
  return (
    <main className="mx-auto max-w-[110ch] px-4 py-10 sm:px-6 md:py-16">
      <SiteNav locale={locale} current="/register" />

      <div aria-hidden className="mt-10 mb-8 flex items-center gap-2 text-xs text-dim">
        <span>
          ──[ <span className="text-accent">{t.label}</span> ]
        </span>
        <span className="flex-1 border-t border-dashed border-line" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <aside className="space-y-10 text-[13px]">
          <div>
            <h1 className="glow text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
              <span aria-hidden className="text-dim">
                #{" "}
              </span>
              {t.heading}
            </h1>
            <p className="mt-4 text-sm text-dim">{t.intro}</p>
          </div>

          <section>
            <h2 className="text-dim">{t.get}</h2>
            <ul className="mt-2 space-y-2">
              {modules.map((m) => (
                <li key={m.id} className="border-l border-line pl-3">
                  <span style={{ color: tone[m.id] }}>●</span> {m.name}{" "}
                  <span className="text-dim">— {m.role.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-dim">{t.how}</h2>
            <ol className="mt-2 space-y-1">
              {t.steps.map((s, i) => (
                <li key={s}>
                  <span className="text-accent">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-dim">{t.data}</h2>
            <p className="mt-2 text-dim">
              {t.dataLine}
              {privacyHref && (
                <>
                  {" "}
                  <a href={privacyHref} className="underline decoration-line underline-offset-4 hover:text-accent">
                    {t.privacy}
                  </a>
                </>
              )}
            </p>
          </section>
        </aside>

        <div className="lg:border-l lg:border-line lg:pl-12">
          <RegisterForm privacyHref={privacyHref} />
        </div>
      </div>
    </main>
  );
}
