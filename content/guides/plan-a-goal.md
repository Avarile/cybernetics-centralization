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
| Status | Project `progress` from `backlog` to `finalized`; task `priority` from `urgent` to `can wait` | States you define per project |

## 1. Give it a framework (5 min)

The `project_frameworks` table holds reusable approaches: OKR for goals, PDCA for projects, playbooks for meetings. Starter rows include some; add your own:

> Save a project framework called "Launch checklist" of type project-management: plan the scope, list who needs to hear about it, prepare the assets, launch, check the results a week later.

## 2. Ask for the plan (5 min)

A made-up example:

> I want to run a small product launch in November. Use my "Launch checklist" framework and anything I've noted about the last launch. Propose a project and tasks with priorities and rough dates. Don't create anything yet.

Read the proposal. Push back on what's wrong. Plans are cheap to change before they exist.

## 3. Create it (5 min)

> Looks good. Create the project under my "Grow the business" goal, with those tasks. Link each task to any note it relies on.

In the Data Base that's one `projects` row linked to the goal, and `tasks` rows linked to the project. In Project Management, it's a project with work items (`create_project`, then `create_work_item` for each).

## 4. Assign the people (optional)

With the **People** pack installed, tasks get an `assigned_to` link and projects a `lead_by` link to your contacts:

> Assign the outreach tasks to Alex Demo, and make me the project lead.

## Check it worked

- Every task belongs to the project, and the project belongs to a goal.
- At least one task is linked to the note it needs.
- Nothing was created before you said yes.

## Next

Hand some of those tasks to an agent: [Assign work to an agent and review it](/guides/assign-work-to-an-agent).
