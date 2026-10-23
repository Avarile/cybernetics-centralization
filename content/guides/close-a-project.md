---
title: "Finish a project properly: the check step and the retro"
seoTitle: "Close projects with a review step and a retrospective"
dek: "Nothing goes straight from doing to done. Add a check, run a short retro from the record, and make each lesson change a note, a template or a recipe."
order: 9
time: "20 min"
personas: founder, team, freelancer, researcher
modules: data, proj
packs: progress, knowledge
updated: 2026-10-23
draft: false
---

Most projects end by being forgotten. This guide gives them a proper ending: a check that the thing worked, a short look back built from the record, and one lesson that changes how the next project runs.

## What you need

- A project that's nearly finished, in the Data Base's **Progress** pack or in Project Management.
- The **Project frameworks library** (from the Progress pack's extra tables).

In Project Management, use a review state (for example **In review**) the same way as the check stages below.

## The check stages

The Progress pack's project `progress` field already has the check built in:

| Stage | Meaning |
|---|---|
| `in-progress` | Being worked on |
| `finished-reviewing` | Done, being reviewed: is it what was asked for? |
| `finished-validating` | Checked against reality: does it actually work? |
| `finished-testing` | Tested where testing applies |
| `finalized` | Closed, with its lessons saved |

Tasks have `finished_reviewing` and `finished_validating` before `closed`. Use as many check stages as the work needs; for most personal projects, reviewing alone is enough.

## 1. Move it to review, not done (2 min)

> The Wi-Fi project is finished. Move it to finished-reviewing.

## 2. Run the retro from the record (10 min)

Save a retro framework once:

> Save a project framework called "Retro" of type project-management: what we planned, what actually happened, how long it took against the plan, what went wrong, what to keep doing, what to change.

Then, for each project:

> Run my Retro framework on the Wi-Fi project. Use its tasks, when they started and finished, any comments, and linked notes. Ask before saving anything.

## 3. Make the lessons stick (5 min)

| The lesson is about… | It changes… | Example (made up) |
|---|---|---|
| How to do something | A how-to note | "Turn off router auto-updates after any reset" |
| How you work | A framework | Add "check in a week after finishing" to your Launch checklist framework |
| The AI getting something wrong | A recipe or agent instructions | The capture recipe stops filing receipts as tasks |

## 4. Finalise (2 min)

> Save the retro as a note, link it to the project, then move the project to finalized.

(In the Data Base the link is the project's `refer_knowledge` field.)

## Check it worked

- The project went through at least one check stage before `finalized`.
- The retro is saved and linked to the project.
- One note, framework or recipe changed because of it.

## Next

[Your weekly review](/guides/weekly-review) picks up retros automatically, because they're records like everything else.
