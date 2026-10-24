import { SiteFooter } from "@/components/chrome/site-footer";
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
    palette: (key: React.ReactNode) => <>在任意位置按 {key} 打开命令面板</>,
    closed: "与 avarile.com 的连接已关闭。",
    stats: (modules: number, servers: number) => `${modules} 个模块 · ${servers} 个 mcp 服务器 · 1 个你`,
  },
} satisfies Copy<unknown>;

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

      <SiteFooter locale={locale} className="mt-20">
        <p className="mt-8 text-dim">{t.palette(<kbd className="text-accent">:</kbd>)}</p>
        <div className="mt-14 text-dim">
          <p>
            <span className="text-accent">you@cybernetics</span>:~$ logout
          </p>
          <p>{t.closed}</p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} cybernetics · {t.stats(modules.length, modules.filter((m) => m.mcpUrl).length)}
          </p>
        </div>
      </SiteFooter>
    </TuiSection>
  );
}
