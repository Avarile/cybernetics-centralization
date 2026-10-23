---
title: "Plan a goal into projects and tasks with an agent"
seoTitle: "Plan a goal into projects and tasks with AI"
dek: "Describe what you want; your AI breaks it into a project and tasks using how you planned the last one, links the know-how each task needs, and asks before it creates anything."
order: 6
time: "20 min"
personas: founder, freelancer, team, student
modules: data, proj
packs: progress, knowledge
updated: 2026-10-23
draft: true
---

Planning stalls on the blank page. This guide starts from the last time you did something similar: your how-tos and frameworks become the plan's skeleton, and the AI does the typing.

## What you need

- The **Progress** and **Knowledge** packs, with the **Project frameworks library**.
- For team or client work, **Project Management** connected as well. For personal goals, the Data Base alone is enough.

## Where plans live

| | Data Base (Progress pack) | Project Management |
|---|---|---|
| Best for | Personal goals and side projects | Work with other people or agents, cycles and modules |
| Structure | `goals` → `projects` → `tasks` | Projects → work items, grouped in cycles and modules |
| Status and priority | Project `progress` from `backlog` to `finalized`; task `priority` from `urgent` to `can wait` | States you define per project; priorities and dates on each work item |
| Dates | Tasks record when work actually starts and finishes (`started_at`, `finished_at`); goals have a `deadline` | Start and due dates, and cycles |

## 1. Give it a framework (5 min)

The `project_frameworks` table holds reusable approaches: OKR for goals, PDCA for projects, playbooks for meetings. Starter rows include some; add your own:

> Save a project framework called "Launch checklist" of type project-management: plan the scope, list who needs to hear about it, prepare the assets, launch, check the results a week later.

## 2. Ask for the plan (5 min)

A made-up example:

> I want to run a small product launch in November. Use my "Launch checklist" framework and anything I've noted about the last launch. Propose a project and tasks with priorities, in the order I should do them. Don't create anything yet.

Read the proposal. Push back on what's wrong. Plans are cheap to change before they exist.

In the Data Base, target dates go in each task's context; it has no planned-date field. If the plan lives or dies by dates, put it in Project Management instead.

## 3. Create it (5 min)

> Looks good. Create a goal "Grow the business" with a November deadline, put the project under it with those tasks, and link each task to any note it relies on.

In the Data Base that's a `goals` row, a `projects` row linked to it (`belong_goals`), and `tasks` rows linked to the project (`belong_project`), each pointing at its notes through `refer_knowledge`. In Project Management, it's a project with work items (`create_project`, then `create_work_item` for each).

## 4. Assign the people (optional)

With the **People** pack installed, tasks get an `assigned_to` link and projects a `lead_by` link to your contacts:

> Assign the outreach tasks to Alex Demo, and make me the project lead.

(Both people need to be contacts first. Add yourself as one.)

## Check it worked

- Every task belongs to the project, and the project belongs to a goal.
- At least one task is linked to the note it needs.
- Nothing was created before you said yes.

## Next

Hand some of those tasks to an agent: [Assign work to an agent and review it](/guides/assign-work-to-an-agent).
