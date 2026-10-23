---
title: "Put the marketing agents to work"
seoTitle: "52 AI marketing agents that use your own business data"
dek: "Fifty-two specialist marketing agents, from SEO audits to pricing to launch plans. They learn your business once, read your data, and track the work they commit to in your projects."
order: 15
time: "45 min"
personas: founder, freelancer, team
modules: agent, data, proj
packs:
updated: 2026-10-23
draft: false
---

The Agentic Platform ships with 52 marketing agents, one per specialist skill: positioning, copywriting, SEO, paid media, email, pricing, launches and more. Each works the way its skill prescribes, using **your** business context, and turns committed work into tracked work items.

## What you need

- An Agentic Platform account with the `cybernetics-data` and `cybernetics-projects` connections, named exactly that ([Agentic Platform](/docs/connect/agentic-platform)).
- A project in Project Management for your marketing work. The agents reuse an existing one, with its labels, if you have it.
- Without the connections, the agents still answer, but keep context in the chat and give you a checklist instead of work items.

## How they're organised

In the Agent Hub, the agents sit in eight categories: Marketing Strategy, Conversion & Pricing, Content & Creative, SEO & AI Search, Paid & Measurement, Lifecycle & Retention, Social, PR & Launch, and Sales.

Six are featured as good starting points: **Marketing Director**, **Product Marketing Strategist**, **Conversion Copywriter**, **SEO Auditor**, **Paid Media Manager** and **Lifecycle Email Strategist**.

## 1. Teach them your business once (15 min)

Open **Product Marketing Strategist** and use a starter. It asks about your product, audience, problems, competitors, differentiation, objections, voice and goals, then saves the answers as one memory called `product_marketing`, after you confirm.

Every marketing agent reads that same memory, so you never explain your business twice. You can read and edit it yourself under **Settings → Personalization**.

:::note Memory must be on
Agents can only keep `product_marketing` if memory is enabled on the platform. If it isn't, they'll ask for your context in each chat.
:::

## 2. Ask a specialist (10 min)

Open an agent and use one of its starters, or ask directly. Made-up examples:

> **SEO Auditor:** Audit the homepage at <url> for technical SEO and content gaps.

> **Conversion Copywriter:** Rewrite the hero section for founders who've never heard of us.

Every answer separates **facts** from **hypotheses**, and lists what's **missing**. When numbers are needed, the agent asks for an export (a CSV from your analytics, for example) rather than connecting to third-party tools.

## 3. Let them track what they commit to (5 min)

When a conversation turns into work, the agent asks: *Track these N actions?* Say yes, and it searches your marketing project for duplicates, then creates the work items. Nothing is created without asking.

## 4. Use an orchestrator for bigger jobs (10 min)

Three agents coordinate others:

| Orchestrator | Use it for |
|---|---|
| **Marketing Director** | A marketing plan; delegates to strategy, content, SEO, paid and launch specialists |
| **Marketing Ops** | Recurring marketing loops and experiments |
| **Launch Manager** | A launch, end to end |

The other agents hand off: when a job belongs to another specialist, they say which one and give you a link with a short brief.

## 5. Work the queue (5 min)

To give a marketing agent a queue, create an agent in Project Management with the same handle, for example `mkt-seo-audit` for the SEO Auditor, and add it to your marketing project. Assign it work items, then use the agent's **Work my queue** starter: the agent pulls its assigned items, does them, reports on each item, and stops at any step marked for approval. See [Assign work to an agent](/guides/assign-work-to-an-agent).

## Check it worked

- `product_marketing` exists and a second agent used it without asking again.
- One conversation turned into work items in your marketing project, after you said yes.
- A queue run stopped at its approval step.

## Next

Bring your team in: [Set up a small team](/guides/small-team-setup).
