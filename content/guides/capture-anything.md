---
title: "Capture anything with one sentence"
seoTitle: "Capture anything into your Data Base with one sentence"
dek: "Save a short 'remember this' recipe in your AI, and every rambling message becomes tidy, linked records in the right place."
order: 2
time: "15 min"
personas: freelancer, founder, researcher, student, team
modules: data
packs: progress, knowledge
updated: 2026-10-23
draft: true
---

Capture fails when it takes decisions: which app, which folder, which tag. This guide moves those decisions to the AI. You say one sentence; it decides where things go, links them, and tells you what it saved.

## What you need

- The Data Base with the **Progress** and **Knowledge** packs, connected to your AI: [Your first 30 minutes](/guides/first-30-minutes).

## 1. Save the recipe (5 min)

A recipe is a short written instruction your AI follows every time. Officially it's called a skill. Where to save it depends on the app: a project's custom instructions, a saved prompt, or a skill file.

```text
Remember-this recipe

When I tell you something to remember:
1. Decide what it is: a goal, a project, a task, a note or how-to, or (if I have
   the People pack) a person.
2. Find where it belongs. Look for an existing goal, project or note it relates to.
   If you can't tell which project a task belongs to, ask me; don't guess.
3. Write it with a short title and a few lines of context: what, and why.
   Put any deadline in the context, for example "by Saturday".
4. Link it to anything related that already exists. Never create a duplicate;
   update the existing record instead.
5. Tell me in one line what you saved and where.
```

## 2. Use it (5 min)

Say things the way you'd say them out loud. A made-up example:

> Finally fixed the Wi-Fi dropping: the router was auto-updating at 3am and failing. Turned that off. Also remind me to call the internet company this weekend about the speed.

What should come out:

| Record | Where | Linked to |
|---|---|---|
| How-to: "Wi-Fi drops: router auto-update at 3am, turn it off" | Knowledge | The existing "How I reset the router" note |
| Task: "Call internet company about speed", with "by Saturday" in its context | Progress | The "Fix home Wi-Fi for good" project, or it asks you which project |

Two things worth knowing:

- The how-to links to the router note you saved in [Your first 30 minutes](/guides/first-30-minutes). If you don't have a Wi-Fi project yet, the recipe makes the AI ask where the task belongs rather than invent a project.
- Tasks have no due-date field. They record when work actually starts and finishes (`started_at`, `finished_at`), so deadlines go in the context, and your AI reads them from there.

## 3. Tune it after a week (5 min)

Read what got saved. Wherever it filed something wrong, add one line to the recipe that would have prevented it, for example "Receipts and bills are notes under the Money type, not tasks". The recipe gets better because you fix it, not because you explain yourself again in every chat.

## Check it worked

- No duplicates: say the same fact twice and the second time should update, not add.
- Links: open a new how-to and you should see what it's linked to.
- When it wasn't sure, it asked you instead of guessing.

## Next

Once you've captured for a week, look back at it honestly: [Your weekly review, from the record](/guides/weekly-review).
