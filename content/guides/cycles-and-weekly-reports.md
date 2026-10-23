---
title: "Run cycles and get weekly reports drafted for you"
seoTitle: "Weekly reports drafted from your project cycles"
dek: "Plan work in one- or two-week cycles, and let your AI draft the report from what actually happened in the cycle, then file it where you'll find it again."
order: 8
time: "25 min"
personas: team, founder, freelancer
modules: proj, data
packs: knowledge
updated: 2026-10-23
draft: false
---

A cycle is a fixed stretch of time with a set of work items in it. Because the cycle knows what was planned and what moved, the weekly report can be drafted from the facts rather than from five people's memories.

## What you need

- **Project Management** connected to your AI.
- Optional: the Data Base's **Knowledge** pack, to keep the reports.

## 1. Set up a cycle (5 min)

In your project, create a cycle for the next week or two and add the work items you intend to finish. Or ask:

> Create a cycle called "Week 44" from Monday to Sunday in the Website project, and add the five highest-priority open items.

## 2. Save the report recipe (5 min)

```text
Cycle-report recipe

For the current cycle in <project>:
1. List the work items: done, in progress, not started, and anything added
   after the cycle began.
2. For each finished item, one line on the outcome, using its comments.
3. For each item carried over, one line on why.
4. Note anything that happened that wasn't planned.
5. Draft the report in that order, under 300 words.
6. Ask before saving it anywhere.
```

## 3. Run it at the end of the cycle (5 min)

> Run my cycle report for the Website project.

The AI reads the cycle (`list_cycle_work_items`) and each item's comments (`list_work_item_comments`), then drafts. Correct what's wrong; it's faster than writing from scratch.

## 4. File it (5 min)

> Save the report in my Data Base as a note under a "Reports" knowledge type (create it if it doesn't exist), titled "Website, week 44", with the project and the cycle dates in its context.

A note in the Data Base can't link directly to a project in Project Management, so the title and context carry the connection. Reports kept as notes become history your AI can search: "what did we ship in October?" To show the report on a work item too, attach it with [Link records across modules](/guides/link-records-across-modules).

## 5. Carry over honestly (5 min)

> Create next week's cycle, move the unfinished items into it, and add a comment to each saying why it slipped.

That comment is what next month's review will learn from.

## Check it worked

- Every line of the report points to a real work item.
- Carried-over items say why.
- The report is saved and linked, not left in a chat.

## Next

When a project ends, close it properly: [Finish a project with a check step and a retro](/guides/close-a-project).
