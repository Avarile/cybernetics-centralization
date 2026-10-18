# Live Stream Demo: Build Plan

**Companion to:** `live-demo-design.md` · **Date:** 2026-10-15 · **Status:** draft for approval

Target broadcast: **Thu 2026-11-19, 19:00 AEDT** (5 weeks from Mon 2026-10-19). All dates move together if the start date changes.
Effort is in focused ideal days (1d ≈ 5–6h). Total is about **21 days of work over 5 weeks**, solo, with about 20% buffer built into the schedule.

---

## 0. Decisions needed before Week 1

| # | Decision | Default if you don't choose |
|---|---|---|
| D1 | Broadcast date and platforms | Thu 2026-11-19 19:00 AEDT · LinkedIn Live + YouTube simulcast |
| D2 | **Twenty demo isolation**: separate workspace (needs `IS_MULTIWORKSPACE_ENABLED=true` + subdomain routing) or a second small Twenty instance | Try multi-workspace first (spike S2). Fall back to a second instance (about 1.3 GiB RAM) |
| D3 | Do live viewer registrations also go into the **real** CRM? | Yes: demo CRM for the show, mirrored to the real CRM as real leads |
| D4 | LLM provider/model for agents and the Twenty `ai-agent` step | Claude Sonnet 5.5, pinned, temperature 0.2 · Haiku 5.5 for lead scoring |
| D5 | Co-host or producer (chat, fallbacks, OBS)? | Solo, with a Stream Deck / hotkeys for fallbacks |
| D6 | Real outbound email during the show? | Only the viewer recap email is real. All demo-persona email goes to Mailpit |

### One change from the design

The design said "no new service unless forced." Two things force one:
- G4 (webhook auth + Turnstile) needs server-side verification, and a static site can't hold a secret.
- The overlay feed needs a server-side endpoint.

So this plan adds **`cybernetics-bridge`**: one small TypeScript (Hono) service in K3s, about 100 MB RAM. It handles:
- the registration proxy (Turnstile, rate limiting, auth)
- Plane webhook intake (HMAC check)
- the event feed (SSE)
- the overlay counters

Twenty workflows stay the automation engine. The bridge only does ingress and fan-out.

---

## 1. Milestones

| ID | Milestone | Date | Exit criteria |
|---|---|---|---|
| M0 | Decisions locked | Fri 2026-10-16 | D1–D6 answered |
| M1 | **Spike go/no-go** | Thu 2026-10-22 | 8/8 spike checks pass, or a partial-go plan is agreed |
| M2 | Foundations ready | Fri 2026-10-30 | demo tenants seeded, reset script works, bridge deployed, form hardened |
| M3 | Flows complete | Fri 2026-11-06 | Acts 1–6 each run end to end on their own |
| M4 | Show-ready | Fri 2026-11-13 | full E2E smoke green, OBS scenes done, rehearsal #1 done |
| M5 | **Freeze** | Mon 2026-11-17 | rehearsal #3 recorded as master fallback, no deploys after this |
| M6 | Broadcast | Thu 2026-11-19 | |
| M7 | Post-show wrap | Fri 2026-11-27 | clips, blog, lead follow-up, retro saved to Data Centre |

---

## 2. Workstreams overview

| WS | Workstream | Effort | Repos / systems |
|---|---|---|---|
| WS0 | Spike (go/no-go) | 2d | all |
| WS1 | Demo tenants, fixtures, reset | 3d | Twenty, Plane, Data Centre, new `cybernetics-demo` scripts |
| WS2 | `cybernetics-bridge` service | 2.5d | new repo `cybernetics-bridge`, K3s |
| WS3 | Registration hardening (G4) | 1d | `cybernetics-centralization`, bridge, Twenty |
| WS4 | Twenty workflows (automation layer) | 2.5d | Twenty (demo workspace) |
| WS5 | Plane template, webhooks, agent member | 1.5d | Plane (demo workspace) |
| WS6 | Agents, skills, MCP wiring | 2.5d | `cybernetics-agents` (LibreChat) |
| WS7 | Live Ops overlay | 1.5d | `cybernetics-centralization` `/live` + bridge |
| WS8 | Broadcast production (OBS, assets, fallbacks) | 2d | local machine |
| WS9 | QA: E2E smoke, rehearsals, runbook | 2.5d | all |
| WS10 | Post-show | 1d | Ghost, CRM, Data Centre |

---

## 3. Detailed tasks

Format: **ID · Task.** Steps · *Depends on* · **Done when** · effort

### WS0: Spike (Mon 10-19 → Thu 10-22)

Goal: prove every risky link with throwaway config before building anything properly.

- **S1 · Scratch tenants.** Create a Plane workspace `demo-spike` and a Data Centre space `demo-spike` with a space-scoped token. *Depends on:* none. **Done when:** both reachable by API with a demo-only token. 0.25d
- **S2 · Twenty isolation (D2).** Check `IS_MULTIWORKSPACE_ENABLED` and the subdomain setup on the `twenty` deployment. Create workspace `demo`. If it's blocked, write down what a second-instance deploy would need (manifest copy, DB, RAM). **Done when:** a `demo` workspace exists with its own API key, or a decision is recorded. 0.5d
- **S3 · Check 1, webhook → Person.** POST the v2 payload to a new demo webhook workflow. **Done when:** Person exists in under 3s. 0.1d
- **S4 · Check 2, AI scoring.** Configure the LLM key in Twenty (demo workspace). Add an `ai-agent` step with a JSON-schema output `{fitScore:1-5, fitReason:string}`. Run 20 synthetic leads. **Done when:** 20/20 return valid JSON, p95 under 10s. 0.25d
- **S5 · Check 3, Twenty → Plane.** `http-request` step: `POST /api/v1/workspaces/demo-spike/projects/`, then 5× `POST .../projects/{id}/issues/` with `X-API-Key`. **Done when:** project + 5 items are visible in the Plane UI. Record the exact payloads for WS4. 0.25d
- **S6 · Check 4, Twenty → Data Centre + attach.** `http-request` to the Teable record API (`POST /api/table/{tableId}/record`). Then attach it as a record target on the opportunity, either via the CRM GraphQL `attachDatabaseCentreRecords` or manually. **Done when:** the record card shows on the opportunity. Record whether attach can be automated; if not, the agent does it in Act 3. 0.25d
- **S7 · Check 5, Plane → Twenty.** Create a Plane webhook (`issue=true`) pointing at a Twenty webhook-trigger workflow. Move an item to Done. **Done when:** a CRM note is created. Record the Plane payload shape. *Note:* Plane only blocks `localhost`/`127.0.0.1`, so `crm.avarile.com` is allowed. Check the request reaches Twenty through ingress (hairpin NAT on the same public IP). 0.25d
- **S8 · Check 6, LibreChat + 3 MCP servers.** In local LibreChat add `mcpServers`: `cybernetics-data`, `cybernetics-pm`, `cybernetics-crm` (streamable-http, demo tokens in headers). Run a draft Act 2 prompt with approval mode on. **Done when:** the agent reads the KB, drafts an email and pauses for approval. 0.25d
- **S9 · Check 7, Plane agentic member.** Create agent `Delivery` in `demo-spike` with a 3-step workflow (step 3 `requires_approval: true`). Assign an item. In LibreChat, run `get_agent_task_brief` → work → comment. **Done when:** the agent stops at step 3 and comments a request for approval. 0.25d
- **S10 · Check 8, events.** A throwaway webhook.site URL receives events from Twenty `http-request` and Plane. **Done when:** latency is under 3s. 0.1d
- **S11 · Go/no-go review (M1).** Fill in the results table below. For any failed check, choose the fallback (run that hand-off through the agent instead). **Done when:** the decision is written into this file. 0.1d

| Check | Result | Latency | Notes / fallback |
|---|---|---|---|
| 1 webhook → Person | ☐ | | |
| 2 AI score | ☐ | | |
| 3 Twenty → Plane | ☐ | | |
| 4 Twenty → Data Centre + attach | ☐ | | |
| 5 Plane → Twenty | ☐ | | |
| 6 LibreChat + MCP | ☐ | | |
| 7 Plane agent member | ☐ | | |
| 8 events | ☐ | | |

### WS1: Demo tenants, fixtures, reset (Fri 10-23 → Wed 10-28)

- **T1 · Create permanent demo tenants.** Twenty `demo` workspace, Plane `demo` workspace, Data Centre space `demo` + base `Demo Co`, LibreChat user `demo`. Delete the spike tenants. *Depends on:* M1. **Done when:** 4 tenants exist and each has its own token. 0.25d
- **T2 · Data Centre schema.** Tables: `knowledges` (title, type, body_md, tags, source), `knowledge_type`, `clients`, `projects` (client link, status, budget_hours, crm_opportunity_id, plane_project_id), `time_budget`, `lessons` (or `knowledges` with type=Lesson, matching the real conventions), `live_events` (optional mirror). **Done when:** schema created via MCP `create_table`/`create_field` and exported to `fixtures/datacentre/schema.json`. 0.5d
- **T3 · Twenty custom fields.** On Person: `fitScore` (NUMBER), `fitReason` (TEXT), `isDemo` (BOOLEAN), plus the v2 registration fields (copy from the real workspace). On Opportunity: `planeProjectId`, `dataCentreProjectId` (TEXT). **Done when:** the fields exist in demo. 0.25d
- **T4 · Fixture content.** Write the versioned JSON fixtures:
  - Twenty: 30 people, 12 companies, 8 opportunities (2 per stage), 40 notes/tasks of history.
  - Plane: `CLIENT-TPL` template project + 2 closed client projects with activity + 1 active.
  - Data Centre: 8 service/pricing entries, 6 case studies, 3 past lessons (one deliberately relevant to "design agency" for the Act 6 callback), 3 clients, 3 projects.
  - Hero persona "Northwind Studio" (6-person design agency): person, company, website, a pain-point paragraph.
  - All dates stored as offsets ("-7d") and resolved at seed time.

  **Done when:** fixtures in `cybernetics-demo/fixtures/` are reviewed for realism and for containing no real data. 1d
- **T5 · Reset script `cybernetics-demo/scripts/reset.ts`.** For each system: delete all records in the demo tenant → seed from fixtures with resolved dates → print a summary. Guard: refuse to run unless every target ID matches an allowlist of demo tenant IDs (so it can never wipe real data). Flags: `--only=crm|pm|data`, `--dry-run`. **Done when:** a full reset finishes in under 2 min, twice in a row, with identical results. 1d
- **T6 · Mailpit.** Deploy Mailpit in K3s (`infra`, about 30 MB) or locally. Point Twenty's demo `mail-sender` / SMTP at it. **Done when:** demo emails show up in the Mailpit UI (which can also be an OBS scene). 0.25d

### WS2: `cybernetics-bridge` (Thu 10-22 → Tue 10-27, parallel with WS1)

New repo `cybergroup/cybernetics-bridge`: Hono + Node 22, Dockerfile, K3s manifest, host `bridge.avarile.com`.

- **B1 · Scaffold.** Hono app, zod validation, pino logs, `/healthz`, env config, Dockerfile, k8s Deployment/Service/Ingress (Traefik) + Secret, limits 128Mi/100m. **Done when:** deployed and `/healthz` is green over HTTPS. 0.5d
- **B2 · `POST /register`.** Verify the Turnstile token (Cloudflare siteverify) → honeypot check → per-IP rate limit (5/10min, in Redis on `infra`) → zod-validate the v2 payload → forward to the **demo** Twenty webhook (D3: also the real one) with an API key header → emit a `lead.created` event (masked). CORS allows only `avarile.com`. **Done when:** a valid submit gives 200 and the Person exists; a bot/rate-limited/invalid submit gives 4xx and nothing reaches Twenty. 0.75d
- **B3 · `POST /hooks/plane`.** Verify the Plane `X-Plane-Signature` HMAC with the webhook `secret_key` → normalise → forward to the Twenty "Plane → CRM" workflow webhook → emit a `pm.*` event. **Done when:** a forged signature gives 401; a valid one creates a CRM note. 0.5d
- **B4 · `POST /events` + `GET /events/stream` (SSE).** Twenty workflows and agents POST `{system, type, text, ts}` with a bearer token. The bridge masks PII, keeps the last 200 in Redis and broadcasts over SSE. It also keeps counters (`leads`, `agentActions`, `approvals`, `minutesSaved`, using a per-type baseline-minutes table). `POST /events/control` (pause/resume/clear) is token-protected. **Done when:** the overlay receives events in under 1s and the counters persist across a pod restart. 0.75d

### WS3: Registration hardening, G4 (Wed 10-28 → Thu 10-29)

- **R1 · Form → bridge.** In `src/components/register-form.tsx`: replace `NEXT_PUBLIC_CRM_WEBHOOK_URL` with `NEXT_PUBLIC_REGISTER_ENDPOINT=https://bridge.avarile.com/register`. Add the Turnstile widget (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), a hidden honeypot field, and loading/rate-limit error states. Add a privacy note under the submit button. **Done when:** `pnpm build` passes, the static export works, and the deployed form submits through the bridge. 0.5d
- **R2 · Lock down Twenty webhooks.** Turn on API-key auth for the real and demo registration workflows so only the bridge can call them. Rotate the old public URL by archiving v2 and activating v3. **Done when:** a direct POST to the old URL fails. 0.25d
- **R3 · First-touch UTM.** In the Twenty workflow, add a lookup of the existing Person and an `if-else` that sets the UTM fields only when they're empty. Store last-touch in `lastUtm*` fields. **Done when:** a repeat submission keeps the original `utm_campaign`. 0.25d
- **R4 · Live landing variant.** `/register?src=live` (or `/live/join`): a short 4-field form (email, first name, persona, team size). UTMs are prefilled from the QR link. **Done when:** a phone scan submits in under 20s. Small, included in R1.

### WS4: Twenty workflows (Fri 10-30 → Tue 11-03)

All in the demo workspace. Each workflow posts an event to the bridge `/events` at key steps. Each one gets exported as JSON into `cybernetics-demo/workflows/` for version control.

- **W1 · "Lead intake & score" (Act 1).** Trigger: webhook (from bridge). Steps:
  1. upsert Person (first-touch)
  2. create/link Company from email domain
  3. `ai-agent` score → update `fitScore`/`fitReason`
  4. create task "Respond within 1h", due now+1h
  5. `http-request` → bridge event `lead.scored`
  6. `if-else` score ≥ 3 → tag `sdr-queue`, otherwise → W5 nurture

  **Done when:** 10 synthetic leads produce the right scores, tasks and events. 0.75d
- **W2 · "Deal won → kickoff" (Act 3).** Trigger: Opportunity updated, stage = WON. Steps:
  1. `http-request` Plane: create project from `CLIENT-TPL` (clone the modules: Onboarding/Discovery/Build, standard states and labels)
  2. Data Centre: create `projects` + `clients` rows
  3. update the opportunity with `planeProjectId` / `dataCentreProjectId`
  4. attach the Data Centre record (from S6: automated, or left to the Kickoff agent)
  5. emit events

  Use a `code` step to map IDs. **Done when:** dragging a deal to WON gives the full kickoff in under 15s. 1d
- **W3 · "Delivery update → CRM" (Act 4).** Trigger: webhook (from bridge `/hooks/plane`). Filter: state → Done, or comment containing "awaiting approval". Find the opportunity by `planeProjectId` → create note "Milestone delivered: <item>" + a follow-up task → emit event. **Done when:** approving the delivery item in Plane updates the CRM timeline in under 5s. 0.5d
- **W4 · "Weekly client status" trigger (Act 5).** Trigger: manual button on Opportunity (cron in real use). `http-request` → LibreChat agent API (or the host clicks the agent preset; decide from S8). **Done when:** one click starts the Account agent for that client. 0.25d
- **W5 · "Livestream viewer recap" (post-show).** Trigger: cron at broadcast end + 60 min. Filter: Person `utm_medium=livestream` AND created today AND `marketingOptIn`. Send a thank-you + VOD link + "book an audit" CTA (real SMTP, D6). **Done when:** a dry run to a test address renders correctly. 0.25d (sent after the show)

### WS5: Plane setup (Mon 11-02 → Tue 11-03)

- **P1 · `CLIENT-TPL` template project.** Modules Onboarding/Discovery/Build. States Backlog/Todo/In Progress/Awaiting Approval/Done. Labels `client-facing`, `agent`, `approval`. Estimates (points). 12 template work items with relations. **Done when:** W2 clones it correctly. 0.5d
- **P2 · Webhook.** Workspace webhook → `bridge.avarile.com/hooks/plane`, events `issue` + `issue_comment`. Secret goes into a bridge Secret. 0.1d
- **P3 · Agent member "Delivery".** `profile_md`, `goal_md`, `instructions_md`. Workflow:
  1. read brief + client context from Data Centre
  2. produce the onboarding pack (Markdown into description/attachment)
  3. self-check against the acceptance criteria
  4. **request approval** (`requires_approval: true`)
  5. on approval → state Done

  Runtime hints: model per D4. Grant access to new client projects (W2 calls `grant_agent_project_access`, or the template already includes it). **Done when:** S9 behaviour is repeatable 5/5. 0.5d
- **P4 · Agent member "Kickoff Planner"** (optional, if Act 3 planning runs as a Plane agent instead of LibreChat). 0.25d
- **P5 · Plane intake** (for a future episode, out of scope now). 0d

### WS6: Agents, skills, MCP (Mon 11-02 → Thu 11-05)

In `cybernetics-agents` (local LibreChat, `localhost:3080`).

- **A1 · MCP config.** `librechat.yaml` `mcpServers`: three servers with demo tokens from `.env` (`DEMO_DATA_TOKEN`, `DEMO_PM_TOKEN`, `DEMO_CRM_TOKEN`), timeouts 60s, plus a tool allowlist per agent. Approval mode: "ask" for write tools (`docs/tool-approval-modes.md`). **Done when:** all three show as connected for user `demo`. 0.25d
- **A2 · Skills (`skill/<name>/SKILL.md`).** `demo-sdr`, `demo-kickoff`, `demo-delivery` (wraps the Plane agent context), `demo-account`, `demo-retro`. Each has: role, inputs, step list, tables/fields to use, output format, guardrails (cite KB record IDs, never invent prices, writes only to the demo tenant). **Done when:** each skill loads and each agent produces the expected output 5/5 on fixtures. 1d
- **A3 · Agents.** Create the 5 LibreChat agents, each with its skill, model (D4), temperature 0.2, its MCP tool subset and a starter "preset prompt" per act. **Done when:** a preset prompt runs its act end to end. 0.5d
- **A4 · Act 2b comparison.** Same SDR prompt in claude.ai (with these connectors pointed at demo tokens, via a separate demo Claude login or project) vs LibreChat on a second model. **Done when:** both produce comparable drafts from the same KB records. 0.25d
- **A5 · Agent → event feed.** Agents post `agent.*` events: a tiny MCP tool or skill instruction "after each write, call bridge `/events`", or the bridge infers events from Twenty/Plane webhooks. Pick the simpler one after S10. **Done when:** agent actions show on the ticker. 0.25d
- **A6 · Act 6 callback test.** Run Retro → lesson saved → new design-agency lead → the SDR draft cites the lesson (by record ID) 5/5. **Done when:** reliable. 0.25d

### WS7: Live Ops overlay (Wed 11-04 → Thu 11-05)

In `cybernetics-centralization` (static export). Route `src/app/live/overlay/page.tsx`.

- **O1 · Ticker.** Transparent background, 1920×120 band. EventSource → `bridge.avarile.com/events/stream`. Max 5 visible lines with slide-in animation, coloured system dot (CRM/PM/DATA/AGENT), timestamp. Query params `?mode=ticker|counters|both`. **Done when:** it renders correctly as an OBS Browser Source at 1080p with no flicker. 0.75d
- **O2 · Counters panel.** Leads tonight · Agent actions · Human approvals · Minutes saved (animated count-up). **Done when:** it matches the bridge counters. 0.25d
- **O3 · QR card.** A `/live/qr` page with a large QR code + short URL (`avarile.com/join`) with the UTM baked in. **Done when:** it scans from 2 m away off a monitor. 0.25d
- **O4 · Control page.** `/live/control` (token entered at runtime, never built into the bundle): pause/resume ticker, clear, test event. **Done when:** pause works within 1s. 0.25d

### WS8: Broadcast production (Thu 11-05 → Tue 11-10)

- **V1 · Hardware and network check.** Camera, mic (with noise suppression), lighting, wired Ethernet, phone hotspot backup. Test upload: at least 12 Mbps sustained for simulcast. Otherwise use Restream (one upload). 0.25d
- **V2 · Browser setup.** A new Chrome profile "Demo" with no extensions/autofill/bookmarks, only demo logins, and fixed window sizes per app (scripted with `wmctrl` or saved layouts). 0.25d
- **V3 · OBS scenes.** `00 Intro`, `01 Mission Control` (2×2), `02 Focus`, `03 Architecture`, `04 Split Compare`, `05 Fallback`, `06 Q&A`, `99 Privacy` (instant black + logo). Hotkeys or Stream Deck. Audio filters. Recording at the same time as streaming (local high-bitrate MKV). 0.75d
- **V4 · Assets.** Title card, lower thirds, animated architecture diagram (one highlight state per act), end card with CTA. Reuse branding from `docs/presentation-company`. 0.5d
- **V5 · Platform setup.** Schedule LinkedIn Live + YouTube events, thumbnails, descriptions with UTM links, announcement posts (T-7d, T-1d, T-1h). 0.25d

### WS9: QA, rehearsals, runbook (Fri 11-06 → Wed 11-18)

- **Q1 · E2E smoke script** `cybernetics-demo/scripts/smoke.ts`: reset → submit lead via bridge → assert scored Person → set opportunity WON → assert Plane project + Data Centre row → set Plane item Done → assert CRM note → assert events received. Runs in under 3 min, exits non-zero on failure. Run nightly in show week (cron on the laptop or a K3s CronJob). 1d
- **Q2 · Fallback clips.** Record each act on its own (clean run, 1080p) → `05 Fallback` media sources, one per act. 0.25d
- **Q3 · Rehearsal #1** (Fri 11-13, full, timed, private stream). Log every stumble → fix list. 0.25d
- **Q4 · Spam test.** A friend scripts 100 submits plus manual junk during rehearsal #2. **Done when:** the ticker stays clean and Twenty gets no junk. Included in Q5.
- **Q5 · Rehearsal #2** (Mon 11-16) with the spam test + one forced failure (kill the LLM key mid-Act 2) → practise the fallback switch. 0.25d
- **Q6 · Rehearsal #3** (Tue 11-17, M5) with real streaming settings to a private/unlisted event. Recording becomes the **master fallback**. Then **freeze**. 0.25d
- **Q7 · Runbook** (§5 below) printed or on a second screen. 0.25d

### WS10: Post-show (Fri 11-20 → Fri 11-27)

- **X1** Turn on W5 recap (or confirm the cron ran). Triage live leads in the **real** CRM, with agent drafts for follow-ups.
- **X2** Cut 6 clips (one per act, 60–90s) + one 30s trailer → LinkedIn/YouTube Shorts.
- **X3** Ghost blog post: "Lead to Delivery, live" with an embedded VOD, linking to `/register?utm_source=blog`.
- **X4** Retro: write lessons to the **real** Data Centre `knowledges` (link to this project), including the metrics from §8.
- **X5** Purge demo-tenant viewer PII (7 days after). Rotate demo tokens.

---

## 4. Schedule

```
Week          Mon 10-19        Mon 10-26        Mon 11-02        Mon 11-09        Mon 11-16
              ───────────────  ───────────────  ───────────────  ───────────────  ───────────────
WS0 Spike     ████ M1(Thu)
WS1 Tenants       ▓▓▓▓▓▓▓▓▓▓
WS2 Bridge        ▓▓▓▓▓▓▓
WS3 Form                ▓▓▓ M2(Fri)
WS4 Twenty                 ▓▓▓▓▓▓▓
WS5 Plane                       ▓▓▓▓
WS6 Agents                      ▓▓▓▓▓▓▓▓ M3(Fri)
WS7 Overlay                         ▓▓▓▓
WS8 Broadcast                         ▓▓▓▓▓▓▓▓▓
WS9 QA                                  ▓▓▓▓▓▓▓▓▓▓▓▓ M4(Fri) R1    R2  R3/M5 freeze
Broadcast                                                                  ★ Thu 11-19
WS10 Post                                                                      ▓▓▓▓▓▓ M7
```

**Critical path:** S2 (Twenty isolation) → T1/T3 → W1/W2 → A2/A3 → Q1 → rehearsals.
**Biggest schedule risk:** S2. If multi-workspace needs real infra work, a second Twenty instance adds about 1d (manifests, DB, ingress, RAM check).

---

## 5. Show-day runbook

| When | Action | Check |
|---|---|---|
| T-48h | Deploy freeze confirmed. No K3s CronJobs/backups scheduled 18:00–21:00 | `kubectl get cronjobs -A` |
| T-24h | Run `smoke.ts` → green. Post announcement | |
| T-3h | Reboot laptop. Close everything except OBS + Demo Chrome + LibreChat | |
| T-2h | `reset.ts` → smoke → `reset.ts` again (clean state). `kubectl top nodes` (memory < 75%) | |
| T-90m | Start local LibreChat. Check 3 MCP servers connected. Warm each agent with a throwaway prompt in a separate chat | |
| T-60m | OBS: check every scene, fallback clips load, overlay connected (send a test event, then clear the counters) | |
| T-30m | Private test stream 5 min, check audio/video on a phone. Speedtest | |
| T-15m | Go to scene `00 Intro` with the "starting soon" loop. Phone on DND. Water | |
| T-0 | Go live. Start local recording | |
| During | Run of show (design §6). Fallback rule: **if an act stalls for more than 20s, switch to `05` for that act and narrate over it** | |
| T+0 | End stream. Stop recording. Pause ticker | |
| T+60m | W5 recap email runs. Check the Mailpit/real send log | |
| T+1d | Lead triage, clip cutting starts | |

---

## 6. Config and secrets inventory

| Secret / config | Lives in | Used by |
|---|---|---|
| `TURNSTILE_SECRET` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | bridge Secret / site build env | B2, R1 |
| Twenty demo + real webhook URLs + API key | bridge Secret | B2, B3 |
| Plane webhook `secret_key` | bridge Secret | B3 |
| `BRIDGE_EVENTS_TOKEN` | bridge Secret, Twenty workflow, agent skill env | B4, W*, A5 |
| `DEMO_DATA_TOKEN` (space-scoped) | LibreChat `.env`, Twenty workflow, reset script | A1, W2, T5 |
| `DEMO_PM_TOKEN` (demo workspace) | LibreChat `.env`, Twenty workflow, reset script | A1, W2, T5 |
| `DEMO_CRM_TOKEN` | LibreChat `.env`, reset script | A1, T5 |
| LLM keys (D4) | Twenty demo AI settings, LibreChat `.env` | S4, A3 |
| Redis | `infra` redis (new DB index) | B2, B4 |

Rule: **no real-tenant token is ever loaded on the demo laptop profile during the show.**

---

## 7. Risk register

| Risk | Owner | Trigger | Response |
|---|---|---|---|
| Twenty multi-workspace not possible | you | S2 fails | second Twenty instance (+1d) or tag-based isolation (`isDemo` filter everywhere; weaker) |
| `ai-agent` step unreliable | you | S4 < 20/20 | use a `code` step calling the LLM API directly with a strict schema, or move scoring to the bridge |
| Data Centre attach can't be automated | you | S6 | Kickoff agent attaches through the CRM UI flow on screen (it's also a good visual) |
| LLM latency on air | you | p95 > 20s in rehearsal | switch the model to a faster tier for that act, shorten prompts, keep the fallback clip ready |
| Agent output drift between rehearsals | you | answers change with the fixtures | pin model version, temperature 0.2, preset prompts, reset before every run |
| K3s memory pressure | you | node > 85% | scale down non-essential pods (drawio, ghost, iframely) during the show slot |
| QR spam / abuse | bridge | > 30 req/min | rate limit + Turnstile; control page pauses the ticker |
| Private data on screen | you | anything outside the Demo profile | `99 Privacy` hotkey. Demo profile has no access to real systems |

---

## 8. Definition of done (show-ready)

- [ ] Spike 8/8 (or partial-go plan in place)
- [ ] `reset.ts` and `smoke.ts` green three times in a row
- [ ] Real registration form goes through the bridge; direct webhook POST is rejected; first-touch UTM verified
- [ ] Acts 1–6 each pass 5/5 runs; Act 6 callback cites the lesson 5/5
- [ ] Overlay: events in under 3s, masking verified, pause works
- [ ] All OBS scenes + 6 fallback clips + master fallback recording
- [ ] 3 rehearsals done; the last one under 45 min
- [ ] Runbook printed; announcements scheduled
- [ ] Metrics tracking ready: CRM view `utm_medium=livestream`, platform analytics

---

## 9. Optional tracking in Projects

Once approved, this plan can be loaded into a Plane project `LIVE`:
- **Modules** = WS0–WS10
- **Work items** = the task IDs above, with dependencies as relations
- **Cycles** = the 5 weeks
- **Estimates** = the effort values
- **Labels** = `agent` / `human` / `approval`
