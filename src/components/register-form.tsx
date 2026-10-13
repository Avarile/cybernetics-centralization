"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { modules, personas, tone, type ModuleId } from "@/lib/content";
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
const TEAM_SIZES = [
  ["SOLO", "just me"],
  ["TEAM_2_10", "2–10"],
  ["TEAM_11_50", "11–50"],
  ["TEAM_51_PLUS", "51+"],
] as const;
const REFERRALS = [
  ["SEARCH", "search"],
  ["SOCIAL", "social media"],
  ["WORD_OF_MOUTH", "a friend or colleague"],
  ["BLOG", "blog / newsletter"],
  ["GITHUB", "github"],
  ["OTHER", "other"],
] as const;
const USE_CASE_MAX = 500;
const REQUIRED = ["firstName", "lastName", "email", "persona", "teamSize", "modules", "privacy"] as const;

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

function validate(form: FormData) {
  const errors: Partial<Record<string, string>> = {};
  if (!str(form, "firstName")) errors.firstName = "required";
  if (!str(form, "lastName")) errors.lastName = "required";
  const email = str(form, "email");
  if (!email) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "not a valid email address";
  if (!form.get("persona")) errors.persona = "pick the one closest to you";
  if (!form.get("teamSize")) errors.teamSize = "required";
  if (!form.getAll("modules").length) errors.modules = "pick at least one";
  if (!form.get("privacy")) errors.privacy = "required to register";
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
  return (
    <div>
      <label htmlFor={id} className="text-[13px] text-dim">
        {label}
        {optional && <span className="opacity-60"> (optional)</span>}
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

export function RegisterForm() {
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
    if (submitted.current) setErrors(validate(form));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitted.current = true;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const found = validate(form);
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
      if (!WEBHOOK_URL) throw new Error("registration isn't configured (NEXT_PUBLIC_CRM_WEBHOOK_URL is empty).");
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`the server answered ${res.status}.`);
      setStatus({ kind: "ok", email: payload.email, firstName: payload.firstName });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof TypeError ? "couldn't reach the server — check your connection." : String((err as Error).message),
      });
    }
  }

  if (status.kind === "ok") {
    return (
      <div role="status" className="term border border-line bg-bg p-5 text-[13px] sm:text-sm">
        <p>
          <span className="text-dim">$</span> useradd --cyborg {status.email}
        </p>
        <p className="mt-1 text-proj">✓ welcome aboard, {status.firstName || "cyborg"}.</p>
        <p className="mt-4 text-dim"># what happens next</p>
        <ol className="mt-1 space-y-1">
          <li>
            <span className="text-accent">1.</span> we read every registration — expect a personal email within a few days.
          </li>
          <li>
            <span className="text-accent">2.</span> you get access to the modules you picked, with a short setup guide.
          </li>
          <li>
            <span className="text-accent">3.</span> connect your agent over MCP and start cyborgizing.
          </li>
        </ol>
        <p className="mt-4 text-dim"># while you wait</p>
        <p className="mt-1">
          your 4-week migration checklist and starter template are ready:{" "}
          <a href="/start" className="text-accent underline decoration-line underline-offset-4 hover:decoration-accent">
            /start
          </a>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TuiButton href="/start" label="open the checklist" primary />
          <TuiButton href="/" label="← back home" />
          <TuiButton href="/exocortex" label="the big idea" />
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
          {filled}/{REQUIRED.length} required
        </span>
      </div>

      <Group n="01" title="whoami">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="first name" id="firstName" error={err("firstName")}>
            <input id="firstName" name="firstName" autoComplete="given-name" className={input} {...describe("firstName")} />
          </Field>
          <Field label="last name" id="lastName" error={err("lastName")}>
            <input id="lastName" name="lastName" autoComplete="family-name" className={input} {...describe("lastName")} />
          </Field>
        </div>
        <Field label="email" id="email" error={err("email")}>
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
          <Field label="job title" optional id="jobTitle">
            <input id="jobTitle" name="jobTitle" autoComplete="organization-title" className={input} />
          </Field>
          <Field label="company" optional id="company">
            <input id="company" name="company" autoComplete="organization" className={input} />
          </Field>
        </div>
      </Group>

      <Group n="02" title="finger you" hint="So we can tailor setup to how you work.">
        <div role="radiogroup" aria-label="Which describes you best?" {...describe("persona")}>
          <p className="mb-2 text-[13px] text-dim">which describes you best?</p>
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

        <div role="radiogroup" aria-label="Team size" {...describe("teamSize")}>
          <p className="mb-2 text-[13px] text-dim">team size</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map(([value, label]) => (
              <label
                key={value}
                className="cursor-pointer border border-line px-3 py-1 transition-colors hover:border-dim has-checked:border-accent has-checked:bg-accent has-checked:text-accent-fg has-focus-visible:outline-2 has-focus-visible:outline-accent"
              >
                <input type="radio" name="teamSize" value={value} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-1">
            <ErrorLine id="teamSize" error={err("teamSize")} />
          </div>
        </div>
      </Group>

      <Group n="03" title="apt install" hint="Which modules do you want first? Everything else plugs in later.">
        <div role="group" aria-label="Modules" {...describe("modules")}>
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
        <Field label="what would you hand to an agent first?" optional id="useCase">
          <textarea
            id="useCase"
            name="useCase"
            rows={4}
            maxLength={USE_CASE_MAX}
            onInput={(e) => setUseCaseLength(e.currentTarget.value.length)}
            placeholder="e.g. keep my client notes and project tasks in sync, and draft weekly updates"
            className={`${input} resize-y`}
          />
          <p className="mt-1 text-right text-xs text-dim">
            {useCaseLength}/{USE_CASE_MAX}
          </p>
        </Field>
        <Field label="how did you hear about us?" optional id="referral">
          <select id="referral" name="referral" defaultValue="" className={input}>
            <option value="">—</option>
            {REFERRALS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          <span>I agree that Cybernetics stores these details to contact me about my registration.</span>
        </label>
        <ErrorLine id="privacy" error={err("privacy")} />
        <label className="flex cursor-pointer gap-2 text-dim">
          <input type="checkbox" name="updates" className="mt-1 accent-(--accent)" />
          <span>Send me occasional product updates. Unsubscribe any time.</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="bg-accent px-1 py-0.5 text-accent-fg transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          [&nbsp;{status.kind === "sending" ? "registering…" : "register"}&nbsp;]
        </button>
        {status.kind === "sending" && <Spinner />}
        {Object.keys(errors).length > 0 && (
          <span className="text-xs text-red">{Object.keys(errors).length} field(s) need attention</span>
        )}
      </div>

      {status.kind === "error" && (
        <p role="alert" className="text-red">
          ✗ registration failed: {status.message} please try again.
        </p>
      )}
    </form>
  );
}
