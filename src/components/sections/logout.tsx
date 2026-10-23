import Link from "next/link";
import { pageHref } from "@/lib/blog";
import { readingLinks } from "@/lib/docs";
import { host, tone } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { localePath, type Copy, type Locale } from "@/lib/i18n";
import { TuiButton } from "../tui/tui-button";
import { TuiSection } from "../tui/tui-section";

const COPY = {
  en: {
    title: "Become legible to your agents.",
    password: "[sudo] password for you: ••••••••",
    welcome: "welcome, cyborg. start with your knowledge and your projects — everything else plugs in when you're ready.",
    register: "Register for early access",
    blog: "Read the blog",
    modules: "# modules",
    more: "# more",
    blogLink: "blog — cyborg migration",
    mcp: "mcp integration",
    exocortex: "exocortex — the big idea",
    pages: { about: "about — who builds this", "open-source": "open source — credits and code", privacy: "privacy policy" },
    palette: (key: React.ReactNode) => (
      <>
        press {key} anywhere for the command palette
      </>
    ),
    closed: "Connection to avarile.com closed.",
    stats: (modules: number, servers: number) => `${modules} modules · ${servers} mcp servers · 1 you`,
  },
  zh: {
    title: "让你的智能体读懂你。",
    password: "[sudo] you 的密码：••••••••",
    welcome: "欢迎你，赛博格。从你的知识和项目开始——其余的一切，等你准备好再接入。",
    register: "注册抢先体验",
    blog: "阅读博客",
    modules: "# 模块",
    more: "# 更多",
    blogLink: "博客 — 赛博格迁移",
    mcp: "mcp 集成",
    exocortex: "外脑 — 核心理念",
    pages: { about: "关于 — 谁在做这个", "open-source": "开源 — 致谢与代码", privacy: "隐私政策" },
    palette: (key: React.ReactNode) => <>在任意位置按 {key} 打开命令面板</>,
    closed: "与 avarile.com 的连接已关闭。",
    stats: (modules: number, servers: number) => `${modules} 个模块 · ${servers} 个 mcp 服务器 · 1 个你`,
  },
} satisfies Copy<unknown>;

/** Footer links to docs and standalone pages; drafts stay unlinked until published. */
const pageLinks = (locale: Locale) => [
  ...readingLinks(locale)
    .filter((l) => l.href !== localePath(locale, "/blog"))
    .map((l) => ({ href: l.href, label: `${l.label} — ${l.hint}` })),
  ...(["about", "open-source", "privacy"] as const).flatMap((name) => {
    const href = pageHref(name, locale);
    return href ? [{ href, label: COPY[locale].pages[name] }] : [];
  }),
];

export function Logout({ locale = "en" }: { locale?: Locale }) {
  const { modules } = contentFor(locale);
  const t = COPY[locale];
  return (
    <TuiSection id="logout" title={t.title} command="sudo cyborgize --me">
      <div className="text-[13px] sm:text-sm">
        <p className="text-dim">{t.password}</p>
        <p className="mt-1">
          <span className="text-proj">✓</span> {t.welcome}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TuiButton href={localePath(locale, "/register")} label={t.register} primary />
          <TuiButton href={localePath(locale, "/blog")} label={t.blog} />
        </div>
      </div>

      <footer className="mt-20 text-[13px]">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-dim">{t.modules}</p>
            <ul className="mt-2 space-y-1">
              {modules.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <span style={{ color: tone[m.id] }}>●</span>{" "}
                    {m.name.toLowerCase()}{" "}
                    <span className="text-dim underline decoration-line underline-offset-4 group-hover:text-accent">
                      {host(m.url)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-dim">{t.more}</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href={localePath(locale, "/blog")}
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  {t.blogLink}
                </Link>
              </li>
              <li>
                <a
                  href="#mcp"
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  {t.mcp}
                </a>
              </li>
              <li>
                <a
                  href={localePath(locale, "/exocortex")}
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  {t.exocortex}
                </a>
              </li>
              {pageLinks(locale).map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="underline decoration-line underline-offset-4 hover:text-accent"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
              <li className="text-dim">{t.palette(<kbd className="text-accent">:</kbd>)}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 text-dim">
          <p>
            <span className="text-accent">you@cybernetics</span>:~$ logout
          </p>
          <p>{t.closed}</p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} cybernetics · {t.stats(modules.length, modules.filter((m) => m.mcpUrl).length)}
          </p>
        </div>
      </footer>
    </TuiSection>
  );
}
