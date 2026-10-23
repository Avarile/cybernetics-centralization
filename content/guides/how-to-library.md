---
title: "Build a how-to library your agents follow"
seoTitle: "Build a how-to library your AI agents follow"
dek: "Turn the things you've figured out into a tree of how-tos that you, Claude Code or Codex can look up, follow step by step, and improve each time."
order: 4
time: "30 min"
personas: freelancer, founder, researcher, team
modules: data
packs: knowledge
updated: 2026-10-23
draft: true
---

Every fix you've figured out once is worth writing down: the router reset, the deploy steps, the tax form. Written down in the right shape, an agent can find it, follow it, and tell you when it's out of date.

## What you need

- The **Knowledge** pack in your Data Base (see [Your first 30 minutes](/guides/first-30-minutes)).
- An AI connected to it. For technical how-tos, a coding agent such as [Claude Code](/docs/connect/claude-code) or [Codex](/docs/connect/codex) can follow them directly.

## How the Knowledge pack is shaped

| Table | What it holds | Useful fields |
|---|---|---|
| `knowledges` | One note or how-to per row | `title`, `context`, `knowledge_type`, `knowledge_parent` (a note can sit under another), `related_knowledge` (linked both ways) |
| `knowledge_type` | Your categories, nestable | `title`, `parent_type` |

With the **Progress** pack installed too, goals, projects and tasks can link to the notes they rely on.

## 1. Set up a few types (5 min)

Keep it small. You can always split a type later. A made-up example:

| Type | Under |
|---|---|
| How-to | (top level) |
| Home | How-to |
| Work | How-to |
| Deploy | Work |
| Reference | (top level) |

Ask your AI to create them:

> Create these knowledge types: How-to, with Home and Work under it, Deploy under Work, and Reference at the top level.

## 2. Write how-tos an agent can follow (15 min)

A how-to works for an agent when it says when it applies, the exact steps, and how to know it worked. Ask for that shape:

> Save a how-to under Deploy called "Deploy the website". When: after merging to main. Steps: run the tests, build, upload the out folder to the server, check the home page loads. Done when: the new version shows in the footer. Gotcha: the server needs the build folder, not the source.

Then link related notes, so one leads to the next:

> Link "Deploy the website" to "Roll back a bad deploy" as related knowledge.

## 3. Let an agent follow one (5 min)

In a coding agent, inside the right project:

> Find my how-to for deploying the website and follow it. Stop and ask me before uploading anything.

The agent looks it up (`query_records`), reads the linked notes (`get_record_neighbors`), and works through the steps, pausing where you told it to.

## 4. Keep it alive (ongoing)

How-tos rot. The fix is to update them at the moment you notice:

> That step was wrong: the server wants the folder copied, not synced. Update the deploy how-to and add the reason as a gotcha.

:::tip The lesson goes in the note, not the chat
When a fix teaches you something, it belongs in the how-to. Next time, you or any agent starts from the corrected version.
:::

## Check it worked

- Asking "how do I deploy the website?" returns your note, not a generic answer.
- Opening a how-to shows its type, its parent, and its related notes.
- One how-to has been corrected after real use.

## Next

See how all of it connects: [Explore your knowledge graph](/guides/knowledge-graph).
