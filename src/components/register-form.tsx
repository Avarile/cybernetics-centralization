"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { tone, type ModuleId } from "@/lib/content";
import { contentFor } from "@/lib/content-i18n";
import { localePath, type Copy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { Bar, Spinner } from "./tui/bits";
import { TuiButton } from "./tui/tui-button";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

// Twenty workflow webhook (public, no auth). Inlined at build time — never put the CRM API key here.
const WEBHOOK_URL = process.env.NEXT_PUBLIC_CRM_WEBHOOK_URL ?? "";

// Values are the CRM's select-option codes (Person fields persona, teamSize, interestedModules, referralSource).
const PERSONA_CODE: Record<string, string> = {
  freelancer: "FREELANCER",
  founder: "FOUNDER",
  researcher: "RESEARCHER",
  student: "STUDENT",
  team: "SMALL_TEAM",
};
const MODULE_CODE: Record<ModuleId, string> = { data: "DATA_CENTRE", proj: "PROJECTS", crm: "CRM", agent: "AGENTS" };
const TEAM_SIZES = ["SOLO", "TEAM_2_10", "TEAM_11_50", "TEAM_51_PLUS"] as const;
const REFERRALS = ["SEARCH", "SOCIAL", "WORD_OF_MOUTH", "BLOG", "GITHUB", "OTHER"] as const;
const USE_CASE_MAX = 500;
const REQUIRED = ["firstName", "lastName", "email", "persona", "teamSize", "modules", "privacy"] as const;

const COPY = {
  en: {
    teamSizes: { SOLO: "just me", TEAM_2_10: "2–10", TEAM_11_50: "11–50", TEAM_51_PLUS: "51+" },
    referrals: {
      SEARCH: "search",
      SOCIAL: "social media",
      WORD_OF_MOUTH: "a friend or colleague",
      BLOG: "blog / newsletter",
      GITHUB: "github",
      OTHER: "other",
    },
    errors: {
      required: "required",
      email: "not a valid email address",
      persona: "pick the one closest to you",
      modules: "pick at least one",
      privacy: "required to register",
    },
    optional: "(optional)",
    welcome: (name: string) => `✓ welcome aboard, ${name || "cyborg"}.`,
    nextTitle: "# what happens next",
    next: [
      "we read every registration — expect a personal email within a few days.",
      "you get access to the modules you picked, with a short setup guide.",
      "connect your agent over MCP and start cyborgizing.",
    ],
    waitTitle: "# while you wait",
    wait: "your 4-week migration checklist and starter template are ready:",
    openChecklist: "open the checklist",
    home: "← back home",
    bigIdea: "the big idea",
    required: "required",
    whoami: "whoami",
    firstName: "first name",
    lastName: "last name",
    email: "email",
    jobTitle: "job title",
    company: "company",
    fingerHint: "So we can tailor setup to how you work.",
    describes: "which describes you best?",
    describesLabel: "Which describes you best?",
    teamSize: "team size",
    teamSizeLabel: "Team size",
    aptHint: "Which modules do you want first? Everything else plugs in later.",
    modulesLabel: "Modules",
    firstTask: "what would you hand to an agent first?",
    firstTaskPlaceholder: "e.g. keep my client notes and project tasks in sync, and draft weekly updates",
    heard: "how did you hear about us?",
    agree: "I agree that Cybernetics stores these details to contact me about my registration",
    privacy: "privacy policy",
    stop: ".",
    updates: "Send me occasional product updates. Unsubscribe any time.",
    sending: "registering…",
    submit: "register",
    attention: (n: number) => `${n} field(s) need attention`,
    failed: (message: string) => `✗ registration failed: ${message} please try again.`,
    notConfigured: "registration isn't configured (NEXT_PUBLIC_CRM_WEBHOOK_URL is empty).",
    status: (code: number) => `the server answered ${code}.`,
    offline: "couldn't reach the server — check your connection.",
  },
  zh: {
    teamSizes: { SOLO: "只有我", TEAM_2_10: "2–10 人", TEAM_11_50: "11–50 人", TEAM_51_PLUS: "51 人以上" },
    referrals: {
      SEARCH: "搜索引擎",
      SOCIAL: "社交媒体",
      WORD_OF_MOUTH: "朋友或同事",
      BLOG: "博客 / 邮件订阅",
      GITHUB: "github",
      OTHER: "其他",
    },
    errors: {
      required: "必填",
      email: "不是有效的邮箱地址",
      persona: "选一个最接近你的",
      modules: "至少选一个",
      privacy: "注册需要勾选此项",
    },
    optional: "（选填）",
    welcome: (name: string) => `✓ 欢迎加入，${name || "赛博格"}。`,
    nextTitle: "# 接下来会发生什么",
    next: [
      "我们会阅读每一份注册——几天内你会收到一封亲笔邮件。",
      "你将获得所选模块的访问权限，以及一份简短的设置指南。",
      "通过 MCP 连接你的智能体，开始赛博格化。",
    ],
    waitTitle: "# 等待期间",
    wait: "你的 4 周迁移检查清单和入门模板已经准备好了：",
    openChecklist: "打开检查清单",
    home: "← 返回首页",
    bigIdea: "核心理念",
    required: "项必填",
    whoami: "whoami",
    firstName: "名",
    lastName: "姓",
    email: "邮箱",
    jobTitle: "职位",
    company: "公司",
    fingerHint: "以便我们按你的工作方式定制设置。",
    describes: "哪一项最符合你？",
    describesLabel: "哪一项最符合你？",
    teamSize: "团队规模",
    teamSizeLabel: "团队规模",
    aptHint: "你最想先用哪些模块？其余的以后再接入。",
    modulesLabel: "模块",
    firstTask: "你最想先交给智能体做什么？",
    firstTaskPlaceholder: "例如：让我的客户笔记和项目任务保持同步，并起草每周进展",
    heard: "你是从哪里知道我们的？",
    agree: "我同意 Cybernetics 保存这些信息，用于就我的注册与我联系",
    privacy: "隐私政策",
    stop: "。",
    updates: "偶尔给我发送产品动态。可随时退订。",
    sending: "注册中…",
    submit: "注册",
    attention: (n: number) => `有 ${n} 个字段需要处理`,
    failed: (message: string) => `✗ 注册失败：${message}请重试。`,
    notConfigured: "注册功能尚未配置（NEXT_PUBLIC_CRM_WEBHOOK_URL 为空）。",
    status: (code: number) => `服务器返回了 ${code}。`,
    offline: "无法连接服务器——请检查网络连接。",
  },
} satisfies Copy<unknown>;

type Errors = (typeof COPY)["en"]["errors"];

/**
 * First-touch UTM attribution: params from the landing URL are stored once and reused on later
 * visits, so a lead who comes back directly still carries the campaign that brought them.
 */
function readUtm(): string {
  const fromUrl: Utm = {};
  const params = new URLSearchParams(window.location.search);
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) fromUrl[k] = v;
  }
  try {
    const stored = localStorage.getItem("utm");
    if (stored) return stored;
    if (Object.keys(fromUrl).length) localStorage.setItem("utm", JSON.stringify(fromUrl));
  } catch {}
  return JSON.stringify(fromUrl);
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function validate(form: FormData, msg: Errors) {
  const errors: Partial<Record<string, string>> = {};
  if (!str(form, "firstName")) errors.firstName = msg.required;
  if (!str(form, "lastName")) errors.lastName = msg.required;
  const email = str(form, "email");
  if (!email) errors.email = msg.required;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = msg.email;
  if (!form.get("persona")) errors.persona = msg.persona;
  if (!form.get("teamSize")) errors.teamSize = msg.required;
  if (!form.getAll("modules").length) errors.modules = msg.modules;
  if (!form.get("privacy")) errors.privacy = msg.privacy;
  return errors;
}

function filledCount(form: FormData) {
  return REQUIRED.filter((k) => (k === "modules" ? form.getAll(k).length > 0 : str(form, k))).length;
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "ok"; email: string; firstName: string }
  | { kind: "error"; message: string };

const input =
  "mt-1 w-full border border-line bg-bg-alt px-2 py-1.5 text-sm text-fg outline-none placeholder:text-dim/60 focus:border-accent aria-invalid:border-red";

function Group({ n, title, hint, children }: { n: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-dashed border-line pt-5">
      <legend className="pr-2 text-xs text-dim">
        <span className="text-accent">{n}</span> · {title}
      </legend>
      {hint && <p className="mb-4 text-[13px] text-dim">{hint}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  optional,
  error,
  id,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  id: string;
  children: ReactNode;
}) {
  const t = COPY[useLocale()];
  return (
    <div>
      <label htmlFor={id} className="text-[13px] text-dim">
        {label}
        {optional && <span className="opacity-60"> {t.optional}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red">
          ✗ {error}
        </p>
      )}
    </div>
  );
}

function ErrorLine({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="text-xs text-red">
      ✗ {error}
    </p>
  );
}

export function RegisterForm({ privacyHref }: { privacyHref?: string }) {
  const locale = useLocale();
  const t = COPY[locale];
  const { modules, personas } = contentFor(locale);
  const utm = JSON.parse(useSyncExternalStore(() => () => {}, readUtm, () => "{}")) as Utm;
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [filled, setFilled] = useState(0);
  const [useCaseLength, setUseCaseLength] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const submitted = useRef(false);

  function onChange() {
    const form = new FormData(formRef.current!);
    setFilled(filledCount(form));
    // Once the visitor has tried to submit, keep errors in step with what they fix.
    if (submitted.current) setErrors(validate(form, t.errors));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitted.current = true;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const found = validate(form, t.errors);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formEl.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // Honeypot: real people never see this field, bots fill it in.
    if (form.get("company_website")) {
      return setStatus({ kind: "ok", email: str(form, "email"), firstName: str(form, "firstName") });
    }

    const payload = {
      email: str(form, "email").toLowerCase(),
      firstName: str(form, "firstName"),
      lastName: str(form, "lastName"),
      jobTitle: str(form, "jobTitle"),
      company: str(form, "company"),
      persona: str(form, "persona"),
      teamSize: str(form, "teamSize"),
      interestedModules: form.getAll("modules").map(String),
      useCase: str(form, "useCase"),
      // Optional select: left out when unanswered, since "" isn't a valid option in the CRM.
      ...(str(form, "referral") && { referralSource: str(form, "referral") }),
      marketingOptIn: Boolean(form.get("updates")),
      landingPage: window.location.pathname,
      referrer: document.referrer,
      ...utm,
    };

    setStatus({ kind: "sending" });
    try {
      if (!WEBHOOK_URL) throw new Error(t.notConfigured);
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t.status(res.status));
      setStatus({ kind: "ok", email: payload.email, firstName: payload.firstName });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof TypeError ? t.offline : String((err as Error).message),
      });
    }
  }

  const start = localePath(locale, "/start");

  if (status.kind === "ok") {
    return (
      <div role="status" className="term border border-line bg-bg p-5 text-[13px] sm:text-sm">
        <p>
          <span className="text-dim">$</span> useradd --cyborg {status.email}
        </p>
        <p className="mt-1 text-proj">{t.welcome(status.firstName)}</p>
        <p className="mt-4 text-dim">{t.nextTitle}</p>
        <ol className="mt-1 space-y-1">
          {t.next.map((line, i) => (
            <li key={line}>
              <span className="text-accent">{i + 1}.</span> {line}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-dim">{t.waitTitle}</p>
        <p className="mt-1">
          {t.wait}{" "}
          <a href={start} className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent">
            {start}
          </a>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TuiButton href={start} label={t.openChecklist} primary />
          <TuiButton href={localePath(locale, "/")} label={t.home} />
          <TuiButton href={localePath(locale, "/exocortex")} label={t.bigIdea} />
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const describe = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <form ref={formRef} onSubmit={onSubmit} onChange={onChange} noValidate className="space-y-8 text-sm">
      <div aria-hidden className="flex items-center gap-3 text-xs text-dim">
        <Bar fill={filled} cells={REQUIRED.length} tone="var(--accent)" />
        <span>
          {filled}/{REQUIRED.length} {t.required}
        </span>
      </div>

      <Group n="01" title={t.whoami}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.firstName} id="firstName" error={err("firstName")}>
            <input id="firstName" name="firstName" autoComplete="given-name" className={input} {...describe("firstName")} />
          </Field>
          <Field label={t.lastName} id="lastName" error={err("lastName")}>
            <input id="lastName" name="lastName" autoComplete="family-name" className={input} {...describe("lastName")} />
          </Field>
        </div>
        <Field label={t.email} id="email" error={err("email")}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={input}
            {...describe("email")}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.jobTitle} optional id="jobTitle">
            <input id="jobTitle" name="jobTitle" autoComplete="organization-title" className={input} />
          </Field>
          <Field label={t.company} optional id="company">
            <input id="company" name="company" autoComplete="organization" className={input} />
          </Field>
        </div>
      </Group>

      <Group n="02" title="finger you" hint={t.fingerHint}>
        <div role="radiogroup" aria-label={t.describesLabel} {...describe("persona")}>
          <p className="mb-2 text-[13px] text-dim">{t.describes}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {personas.map((p) => (
              <label
                key={p.login}
                className="group flex cursor-pointer gap-3 border border-line p-3 transition-colors hover:border-dim has-checked:border-accent has-checked:bg-bg-alt has-focus-visible:outline-2 has-focus-visible:outline-accent"
              >
                <input type="radio" name="persona" value={PERSONA_CODE[p.login]} className="sr-only" />
                <span aria-hidden className="text-dim group-has-checked:text-accent">
                  (<span className="opacity-0 group-has-checked:opacity-100">•</span>)
                </span>
                <span>
                  <span className="block">{p.name}</span>
                  <span className="block text-xs text-dim">{p.plan}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-1">
            <ErrorLine id="persona" error={err("persona")} />
          </div>
        </div>

        <div role="radiogroup" aria-label={t.teamSizeLabel} {...describe("teamSize")}>
          <p className="mb-2 text-[13px] text-dim">{t.teamSize}</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map((value) => (
              <label
                key={value}
                className="cursor-pointer border border-line px-3 py-1 transition-colors hover:border-dim has-checked:border-accent has-checked:bg-accent has-checked:text-accent-fg has-focus-visible:outline-2 has-focus-visible:outline-accent"
              >
                <input type="radio" name="teamSize" value={value} className="sr-only" />
                {t.teamSizes[value]}
              </label>
            ))}
          </div>
          <div className="mt-1">
            <ErrorLine id="teamSize" error={err("teamSize")} />
          </div>
        </div>
      </Group>

      <Group n="03" title="apt install" hint={t.aptHint}>
        <div role="group" aria-label={t.modulesLabel} {...describe("modules")}>
          <div className="grid gap-2 sm:grid-cols-2">
            {modules.map((m) => (
              <label
                key={m.id}
                style={{ "--tone": tone[m.id] } as React.CSSProperties}
                className="group flex cursor-pointer gap-3 border border-line p-3 transition-colors hover:border-dim has-checked:border-(--tone) has-checked:bg-bg-alt has-focus-visible:outline-2 has-focus-visible:outline-accent"
              >
                <input type="checkbox" name="modules" value={MODULE_CODE[m.id]} className="sr-only" />
                <span aria-hidden className="text-dim group-has-checked:text-(--tone)">
                  [<span className="opacity-0 group-has-checked:opacity-100">x</span>]
                </span>
                <span>
                  <span className="block" style={{ color: tone[m.id] }}>
                    {m.name}
                  </span>
                  <span className="block text-xs text-dim">{m.tagline}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-1">
            <ErrorLine id="modules" error={err("modules")} />
          </div>
        </div>
      </Group>

      <Group n="04" title="cat motivation.txt">
        <Field label={t.firstTask} optional id="useCase">
          <textarea
            id="useCase"
            name="useCase"
            rows={4}
            maxLength={USE_CASE_MAX}
            onInput={(e) => setUseCaseLength(e.currentTarget.value.length)}
            placeholder={t.firstTaskPlaceholder}
            className={`${input} resize-y`}
          />
          <p className="mt-1 text-right text-xs text-dim">
            {useCaseLength}/{USE_CASE_MAX}
          </p>
        </Field>
        <Field label={t.heard} optional id="referral">
          <select id="referral" name="referral" defaultValue="" className={input}>
            <option value="">—</option>
            {REFERRALS.map((value) => (
              <option key={value} value={value}>
                {t.referrals[value]}
              </option>
            ))}
          </select>
        </Field>
      </Group>

      <input
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div className="space-y-2 border-t border-dashed border-line pt-5 text-[13px]">
        <label className="flex cursor-pointer gap-2">
          <input type="checkbox" name="privacy" className="mt-1 accent-(--accent)" {...describe("privacy")} />
          <span>
            {t.agree}
            {privacyHref ? (
              <>
                {" "}
                (
                <a href={privacyHref} target="_blank" className="underline decoration-line underline-offset-4 hover:text-accent">
                  {t.privacy}
                </a>
                ){t.stop}
              </>
            ) : (
              t.stop
            )}
          </span>
        </label>
        <ErrorLine id="privacy" error={err("privacy")} />
        <label className="flex cursor-pointer gap-2 text-dim">
          <input type="checkbox" name="updates" className="mt-1 accent-(--accent)" />
          <span>{t.updates}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="bg-accent px-1 py-0.5 text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          [&nbsp;{status.kind === "sending" ? t.sending : t.submit}&nbsp;]
        </button>
        {status.kind === "sending" && <Spinner />}
        {Object.keys(errors).length > 0 && (
          <span className="text-xs text-red">{t.attention(Object.keys(errors).length)}</span>
        )}
      </div>

      {status.kind === "error" && (
        <p role="alert" className="text-red">
          {t.failed(status.message)}
        </p>
      )}
    </form>
  );
}
