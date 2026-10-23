# Docs, self-hosting tutorials and use-case guides: analysis and design

Status: proposal, 2026-10-23. Nothing here is built yet. Sections 1–2 are the analysis; 3–9 the design; 10 the decisions needed before work starts.

Sources reviewed: the four module repos (partial clones at HEAD: `Cybernetic-agents@master`, `cybernetics-project@dev`, `cybernetics-data@dev`, `cybernetics-crm@dev`), their custom commits, the k3s runbooks, compose files, licenses, MCP implementations, schema packs, and this site.

---

## 1. What the four modules are

| Module (site name) | Repo | Upstream | License | Your custom layer (from commit history) |
|---|---|---|---|---|
| Data Base | `cybernetics-data` | Teable | AGPL-3.0 for `apps/*`, MIT for `packages/*`, **plus a §7 "brand protection" term** (see 2.4) | MCP server at `/api/mcp` (personal access token; `MCP_ENABLED`, `MCP_READONLY`, per-call caps); 4 onboarding **schema packs** (Progress, People, Knowledge, Finance) with cross-pack "bridges" and seed data; knowledge graph (2D/3D); read-only, user-scoped AI chat (Mastra) with audit log and rate limits; email 2FA; new theme and email templates; rebrand |
| Project Management | `cybernetics-project` | Plane | AGPL-3.0 | MCP server at `/api/mcp`, 85 tools over the public API (Plane API token as `Bearer` or `X-Api-Key`); **agentic members** (agents as assignees, with their own MCP tools/prompt); email 2FA; theme and rebrand |
| CRM | `cybernetics-crm` | Twenty | AGPL-3.0, **some files under Twenty's commercial license** | **Data Centre integration**: "Database" tab on records, attach Data Base records, Settings → Data Centre (URL + encrypted token), hourly refresh, new permission, upgrade commands; rebrand. MCP at `/mcp` with OAuth discovery (upstream) |
| Agentic Platform | `Cybernetic-agents` | LibreChat | MIT | Rebrand; 52 seeded marketing skill agents (from the MIT "marketingskills" pack by Corey Haines) with evals; "Work my queue" for agents mirrored in Plane; bulk "change model" for agents; "MCP optional" agents; Vercel AI Gateway; agent page; memory caps per container |

How they connect today (your server): one k3s node (12 CPU / 15 GiB, Debian 13), Caddy on the host for TLS behind Cloudflare, shared infra namespace (Mongo, Redis, Meilisearch, MinIO, pgvector), one subdomain per app, plus `storage.avarile.com` for the Data Base's MinIO.

## 2. Self-host readiness: what blocks a tutorial today

These are facts from the repos, ordered by severity. Tutorials can't be written honestly until 2.1 and 2.2 are solved.

### 2.1 There are no Cybernetics images anyone else can pull (blocker)

Every runbook says "no registry": images are built locally and side-loaded into the node's containerd (`imagePullPolicy: Never`). The compose files in the repos point at upstream images: `makeplane/plane-*`, `twentycrm/twenty`, `registry.librechat.ai/...librechat`, and a local `teable:develop`. A self-hoster following them gets stock Plane, Twenty and LibreChat **without** the MCP servers, agent members, CRM integration, schema packs or branding.

Needed: CI that publishes versioned images (e.g. `ghcr.io/avarile/cybernetics-data:<version>`) for every module. LibreChat's `docker-publish.yml` / `tag-images.yml` workflows are already in the agents repo and can be adapted.

### 2.2 There is no single stack to install (blocker)

Each app expects its own Postgres/Redis/object storage; your server shares one infra namespace. Your deploy docs are operator runbooks for *your* node (SSH alias, sudo containerd import, NodePorts, manifests in a private dev-ops repo), not something a user can follow.

Needed: a reference stack, ideally a new public repo `cybernetics-selfhost`, containing one `docker-compose.yml` (shared Postgres with pgvector, Redis/Valkey, MinIO, Mongo, Meilisearch, RabbitMQ for Plane, Caddy), `.env.example`, init jobs (databases, buckets), health checks, and a `Caddyfile` with one subdomain per app. Every self-host page is written and verified against this.

### 2.3 Security issues in the public repos (fix before linking them from docs)

- **Leaked API keys.** `cybernetics-data` history contains two ElevenLabs API keys committed to `apps/nextjs-app/.env` (commits `c88bb51`, `61fa3de`). The repo is public, so treat them as compromised: **rotate them in ElevenLabs** regardless of whether they're still at HEAD. Optionally purge history.
- **Infrastructure details.** `Cybernetic-agents/.development/deploy/k3s_deployment_doc/how_to_deploy_K3s-server` publishes the server's public IP, SSH user and key filename, internal IP, and known weak spots (code interpreter in `LOCAL_MODE` with no auth, MinIO not public, Cloudflare client-IP issue). Move runbooks to the private dev-ops repo; publish only sanitised versions as docs.
- Committed `.env` files in `cybernetics-data` (`apps/nextjs-app/.env`, `.env.development`, `dockers/.env`) carry custom edits. Review them; upstream ships defaults there, but yours shouldn't carry real values.

### 2.4 Licensing (needs a decision, possibly legal advice; this is not legal advice)

- **Teable brand term.** Teable's LICENSE adds a §7(e) "brand protection" term: you may not modify, replace or remove Teable brand assets. The data repo has several rebrand commits. Whether that term is enforceable under AGPL §7 is debated, but it's a risk for both running the rebranded app publicly and distributing images. Get an opinion before publishing images or a self-host guide for the Data Base.
- **AGPL network clause** (Plane, Teable, Twenty): users of a modified version over a network must be offered its source. Your repos are public, so this is satisfied if each app and the site link to the exact source. Add a `/open-source` page and a "Source" link in each app.
- **Twenty commercial files**: some files carry Twenty's commercial license. Confirm none of those features are enabled or redistributed, or document it.
- **Attribution**: LibreChat (MIT) and marketingskills (MIT) need their copyright notices kept; credit all four upstreams on `/open-source`.

### 2.5 MCP sign-in is inconsistent

Data Base and Projects accept bearer tokens only; only the CRM has OAuth discovery. So the "paste a URL into ChatGPT / Claude connectors" flow shown on the home page works for the CRM only. Either add OAuth to Data Base and Projects, or the Connect docs must show the token-header method per client (Claude Code `--header`, Codex/Cursor config headers) and say which clients can't do headers.

### 2.6 Operational gotchas the docs must cover (from your runbooks)

Agentic: non-browser ban (`NON_BROWSER_VIOLATION_SCORE` = `BAN_INTERVAL` bans curl users for 2h), `TRUST_PROXY` vs Cloudflare client IPs, MinIO presigned URLs not browser-reachable, registration closed by default, email off (no password reset), Meilisearch sync trusting Mongo flags after restores, RAG API start order, memory limit (2.5 GiB). Projects: migrator job on backend releases, `Recreate` downtime. Data Base: entrypoint mode, MinIO public endpoint (`storage.` subdomain), env secrets for AI. CRM: feature flag + upgrade commands + permission + cron for the Data Centre integration.

### 2.7 Sizing (what we know)

All four plus shared infra run on 12 CPU / 15 GiB. Known per-app limits: Data Base 0.5–2 CPU, 1–4 GiB; Agentic 2 CPU, 1–2.5 GiB; Plane runs 8+ services (api, worker, beat, web, space, admin, live, proxy). Recommend **16 GB RAM / 4–8 vCPU / 80 GB SSD** for the full stack and **4 GB** for Data Base alone, to be confirmed on the reference stack (2.2).

---

## 3. Design goals

1. **Two audiences, two tracks.** Most people will use a hosted instance and only need to *connect an AI* and *learn the workflows*. A smaller, technical group will self-host. Keep these apart so neither has to wade through the other.
2. **Start with the Data Base.** It's the foundation and works alone. Every other module is an optional add-on, and the docs say so at every step.
3. **Every tutorial is verified.** Each self-host page names the stack version it was verified against, and is re-run on a fresh VM before release.
4. **Guides use demo data only**: the `demo-centre` conventions from the messaging kit (made-up goals, "Alex Demo", the router fix). Never real records.
5. **Same look and tooling as the site.** TUI style, Markdown in `content/`, static export, no new hosting.

## 4. Information architecture

```
/docs                         Docs home: two doors ("Use it" / "Host it") + module map
  /docs/start                 What Cybernetics is, the four modules, how they connect
  /docs/connect/*             Connect your AI (hosted and self-hosted users)
  /docs/self-host/*           Self-hosting track (ordered)
  /docs/modules/*             Reference per module: concepts, MCP tools, settings
  /docs/troubleshooting       Collected problems and fixes
/guides                       Use-case guides hub, filter by persona / module
  /guides/<slug>              One guide per job-to-be-done
/platforms/<module>           Marketing page per module (SEO, from the earlier gap list)
/open-source                  Upstreams, licenses, source links (AGPL)
/faq · /changelog · /security · /terms
```

Navigation: add `docs` and `guides` to the title bar and footer, and to the `:` command palette, which should also search docs and guides titles.

## 5. Track A: Connect your AI (`/docs/connect`), ~9 pages

Useful immediately for early-access users on your hosted instance. Doesn't depend on 2.1/2.2, only on the 2.5 decision.

| # | Page | Content |
|---|---|---|
| A0 | Overview | What MCP is (link the blog explainer), the three endpoints, keys you can take back |
| A1 | Create access tokens | Data Base personal access token, Projects API token, CRM (OAuth or API key); scope, expiry, revoke |
| A2 | Claude Code | `claude mcp add --transport http …` with header for token servers; verify with a first question |
| A3 | Claude desktop / Cowork | Connectors UI; which modules work (OAuth) and the workaround for token ones |
| A4 | ChatGPT | Connectors / developer mode; same caveat |
| A5 | Codex | `~/.codex/config.toml` with headers |
| A6 | Cursor and other MCP clients | `mcp.json`; generic streamable-HTTP settings |
| A7 | Agentic Platform | Adding the three servers as app connections (per your note: not in `librechat.yaml`), per-user tokens |
| A8 | Troubleshooting connections | 401 vs 404 vs 405, wrong path (`/api/mcp` vs `/mcp`), read-only mode, rate limits |

The home page's MCP section and these pages should share one source (`src/lib/content.ts` `mcpServers`) so the endpoints can't drift again.

## 6. Track B: Self-hosting (`/docs/self-host`), ~14 pages

Written against the reference stack (2.2). Each page uses the tutorial template (section 8).

| # | Page | Content | Source material |
|---|---|---|---|
| B0 | Overview and architecture | Diagram: browser → Caddy → four apps → shared infra; what's required vs optional; hosted vs self-host | runbook topologies |
| B1 | Plan your install | Sizing (2.7), domains (one subdomain per app + storage), DNS/TLS, SMTP (needed for 2FA and invites), AI provider keys, ports | runbooks §2/§7 |
| B2 | Quick start (all-in-one) | Clone `cybernetics-selfhost`, fill `.env`, `docker compose up -d`, create the first admin in each app; ~30 min | new |
| B3 | Data Base | Env reference, storage public endpoint, first admin, enable MCP (`MCP_ENABLED`, `MCP_READONLY`, caps), install schema packs, AI chat keys | data runbook, `mcp.config.ts`, schema-pack |
| B4 | Project Management | Services, migrator, admin (`/god-mode`), API token, MCP endpoint, agentic members | project runbook, `plane/mcp` |
| B5 | CRM | Server + worker, first workspace, MCP/OAuth, the Data Centre integration (flag, upgrade commands, permission, cron) | crm `current-progress` |
| B6 | Agentic Platform | `.env` + `librechat.yaml`, model providers / AI Gateway, MCP app connections, RAG API, code interpreter (with auth), seeding agents, registration and email | agents runbook §2–§8 |
| B7 | Reverse proxy, TLS and Cloudflare | Caddyfile, `trusted_proxies` + `CF-Connecting-IP`, `TRUST_PROXY`, upload limits (Cloudflare 100 MB), public storage route for presigned URLs | agents runbook §8 |
| B8 | Connect the modules | CRM ↔ Data Base, Agentic ↔ all three, Projects agent members ↔ Agentic "Work my queue" | crm progress, agents commits |
| B9 | Security checklist | 2FA, closed registration, one token per client, read-only MCP, rotate secrets, no secrets in git, code-interpreter auth, backups encrypted | 2.3, runbooks |
| B10 | Backups and restore | Postgres dumps, Mongo archives (14-day retention), MinIO mirror, Meilisearch reindex after restore, test restores | agents runbook §6 |
| B11 | Upgrades and rollback | Pinned versions, release notes, migrations, downtime expectations, rollback | all runbooks §rollback |
| B12 | Troubleshooting | Gotchas from 2.6 as symptom → cause → fix | runbooks §8 |
| B13 | Advanced: single-node k3s | A sanitised version of your runbooks for homelab users, with a registry instead of side-loading | runbooks |

## 7. Use-case guides (`/guides`), ~16 guides

Each guide is a job-to-be-done, not a feature tour. Filterable by persona (the five in `content.ts`: freelancer, founder, researcher, student, small team) and by module. Each maps to an existing schema pack, skill or blog post, so most material already exists.

| # | Guide | Modules / pack | Built from |
|---|---|---|---|
| **Start here** | | | |
| G1 | Your first 30 minutes: install a pack, connect an AI, ask your first question | Data Base · Progress + Knowledge packs | `/start` checklist, blog #2–3 |
| G2 | Capture anything with one sentence (the "remember this" recipe) | Data Base | blog #3 |
| G3 | Your weekly review, from the record | Data Base + Projects | blog #5, `weekly-report` |
| **Knowledge** | | | |
| G4 | Build a how-to library your agents follow | Knowledge pack | home "Codex" session, blog #7 |
| G5 | See how your knowledge connects (knowledge graph) | Data Base | knowledge-graph feature |
| **Work** | | | |
| G6 | Plan a goal into projects and tasks with an agent | Projects + Progress pack | home "Q4 launch" session |
| G7 | Assign work to an agent and review it | Projects agentic members | blog field note #9 |
| G8 | Run cycles and auto-drafted weekly reports | Projects | home "Cowork week 42" session |
| G9 | Close a project properly (the check step and the retro) | Projects + Data Base | blog #5, `pdca-retro` |
| **People** | | | |
| G10 | Meeting prep and follow-ups that come back to you | CRM + People pack | blog field note #10 |
| G11 | Link CRM records to your Data Base | CRM Data Centre integration | crm `current-progress` |
| **Money** | | | |
| G12 | Import bank statements and let an agent categorise them | Finance pack | `statement-sorter`, finance figure |
| G13 | Budgets and the money questions you avoid | Finance pack | blog #4 |
| **Agents** | | | |
| G14 | Build a custom agent with skills | Agentic Platform | agent page, skills |
| G15 | Put the marketing agents to work ("Work my queue") | Agentic + Projects | 52 skill agents |
| **Teams** | | | |
| G16 | Set up a small team: per-person keys, shared how-tos, onboarding | All | blog field note #11 |

Persona paths on `/guides`, for example "Freelancer: G1 → G2 → G10 → G12 → G3".

## 8. Page templates

**Tutorial (self-host and connect):** title · one-line goal · time · difficulty · "Verified with: stack vX.Y on <date>" · prerequisites (with links) · numbered steps, each with copy-paste commands and the expected output · "Check it worked" · troubleshooting for this step · next page.

**Guide (use case):** who it's for · the outcome in one sentence · what you need (modules, pack, AI client) · set up (≤10 min) · the recipe or skill text, copyable · a worked example with demo data (what you say → what happens) · close the loop (how it improves over time) · variations · related guides and blog posts.

**Module reference:** what it's for · concepts · MCP tools (generated from the server's tool list where possible) · settings and env vars · limits · links to guides.

## 9. Implementation design (this site)

Content:

```
content/docs/<section>/<nn>-<slug>.md      front matter: title, description, section, order,
                                           modules[], time, level, verified, updated, draft
content/guides/<slug>.md                   front matter: title, dek, personas[], modules[], packs[],
                                           clients[], time, order, draft
```

Routes (all static, `generateStaticParams`, `dynamicParams = false`): `/docs`, `/docs/[...slug]`, `/guides`, `/guides/[slug]`. Persona/module filtering on `/guides` is client-side over a static list.

Components: `DocsLayout` (sidebar from the content tree, "on this page" contents, prev/next), `CodeBlock` with copy button, `Callout` (note / warning / tip), `Steps`, `ModuleBadge` (uses the module colours), `VerifiedBadge`.

Markdown: extend `src/lib/markdown.tsx` rather than add a library. It needs fenced code blocks (with a language label, no highlighting: monochrome fits the TUI look), `:::note` / `:::warning` / `:::tip` callouts, `####` headings, heading anchors (`id`s for deep links and the contents list), and images with captions. Keep the existing draft and `[YOU: …]` placeholder rules.

SEO: `TechArticle` structured data and breadcrumbs per page, all published pages in the sitemap, `seoTitle` support, canonical URLs, OG cards via `ogCard` with the module colour. A build-time JSON index for palette search.

Quality gates: a link checker over `out/` in the build; every self-host page re-verified on a fresh VM per stack release; screenshots only from `demo-centre`.

## 10. Phasing and size

| Phase | Scope | Pages | Depends on |
|---|---|---|---|
| 0. Unblock | Rotate leaked keys; move runbooks private; licensing decision (2.4); MCP auth decision (2.5); publish images (2.1); reference stack (2.2) | none | you |
| 1. Foundation | Markdown extensions, docs layout, `/docs` home, `/docs/start`, Track A (connect), G1–G3, `/open-source` | ~15 | 2.5 decision |
| 2. Self-host core | B0–B8 against the reference stack, each verified | 9 | phase 0 images + stack |
| 3. Guides and reference | G4–G16, 4 module reference pages, 4 `/platforms` pages, persona paths, FAQ | ~26 | phase 1 |
| 4. Operations | B9–B13, troubleshooting, changelog, palette search | ~7 | phase 2 |

Total: about **57 pages** (docs ~29, guides ~17 including the hub, product and legal ~11).

## 11. Decisions (made 2026-10-23)

| # | Question | Decision | Consequence |
|---|---|---|---|
| 1 | Who self-hosting is for | Technical individuals, community support | Track B is Docker Compose first; k3s stays an "advanced" page; no SLA language |
| 2 | Publish images | Yes, later | Track B waits for phase 0 images and the reference stack |
| 3 | Teable brand term | Keep Teable branding in the Data Base | Restore Teable's name and logo in the app; `/open-source` says so (draft until confirmed) |
| 4 | MCP auth | Document token headers | Connect docs show headers per client; ChatGPT and Claude's connector form are CRM-only; Claude Desktop uses `mcp-remote` |
| 5 | What `/register` offers | Both hosted access and self-host help | Docs home has two doors, "Use it" and "Host it" |
| 6 | Where docs live | `<domain>/docs` in this site | Built here, as below |

## 12. Phase 1 status

Built: Markdown extensions (fenced code with copy, callouts, `####`, heading anchors, ordered lists that keep counting), `/docs` and `/docs/[section]/[slug]` with sidebar, "on this page" and pager, `/guides` with a persona filter, `/guides/[slug]`, `/open-source`, docs OG card, TechArticle/Article JSON-LD, sitemap entries, footer links that appear once something is published. Home-page MCP snippets now send token headers.

Written as drafts (`pnpm dev` lists them): `/docs/start/what-is-cybernetics`, nine Connect pages (A0–A8), guides G1–G3, `/open-source`. To publish one: follow every step on a real client, fill any `[YOU: …]` line, set `verified:` (app and version, date), then `draft: false`.

Open `[YOU]` items: Claude Cowork and Desktop config servers; the Agentic Platform's menu path for app connections; Teable branding visible in the app; Twenty commercial-file features.

Guides G4–G16 written as drafts (2026-10-23), grounded in the module repos: schema-pack tables and statuses, Projects agent members and MCP tool names, the Projects and CRM Data Base integrations, the Agentic Platform's skills, memory and marketing-agent design.

Not yet: command-palette search over docs (phase 4), Track B (waits on images and the reference stack).

## 13. Original decision list

1. **Who is self-hosting for?** Technical solo users and homelabs (Docker Compose, community support), or small teams expecting an official, supported path? This sets how much of Track B to write and support.
2. **Publish images publicly?** Required for any real self-hosting. Tied to decision 3.
3. **Teable brand term.** Get advice before distributing the rebranded Data Base. The options are roughly: keep Teable attribution visible in the Data Base ("Cybernetics Data Base, built on Teable"), seek permission from Teable, or accept the risk with advice.
4. **MCP auth.** Add OAuth to Data Base and Projects, or document token headers per client.
5. **Hosted vs self-host positioning.** What does `/register` sell: hosted early access, help self-hosting, or both? This changes the docs home's first door.
6. **Where docs live.** Recommended: `avarile.com/docs` in this site (same build, SEO, palette). The alternative is a separate docs site.
