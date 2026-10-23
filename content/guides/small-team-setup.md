---
title: "Set up a small team"
seoTitle: "Set up a small team on one shared memory with AI"
dek: "One record the whole team can read, a key per person, shared how-tos that survive people leaving, and agents that work on the same board as everyone else."
order: 16
time: "60 min"
personas: team, founder
modules: data, proj, crm, agent
packs: progress, knowledge, people
updated: 2026-10-23
draft: false
---

The same three ideas that work for one person (one memory, any AI, closed loops) work for a team, with one addition: everyone gets their own access, so nobody shares a login and leaving is clean.

## What you need

- Admin access to the modules your team will use.
- One process that currently hurts, for example onboarding, the weekly report, or client handovers. Start there, not everywhere.

## 1. Decide what's shared (10 min)

| Shared with the team | Kept personal |
|---|---|
| How-tos, runbooks and team knowledge | Personal notes and goals |
| Team projects and cycles | Private finances |
| Clients and deals | Personal contacts |

In the Data Base, put team material in its own **space** and invite teammates there. Keep personal bases in personal spaces.

## 2. Invite people (10 min)

| Module | Where | Notes |
|---|---|---|
| Data Base | The team space's settings → collaborators | Give each person the lowest role that lets them work |
| Project Management | Workspace members | Only workspace admins can change an agent's settings |
| CRM | Workspace members and roles | Give the **Data Centre** permission only to whoever manages the integration |
| Agentic Platform | User accounts | Each person adds their own connections with their own tokens |

## 3. One key per person, per app (10 min)

Everyone creates their own tokens ([Create access tokens](/docs/connect/access-tokens)) and connects their own AI apps. An AI acting for someone can see exactly what that person can see, and no more.

The exception is a shared integration token, such as the one a project uses to browse the Data Base. Make it read-only and limited to the team space, because everyone who uses the integration browses with its permissions.

## 4. Write the team's how-tos (20 min)

Pick the process that hurts and write it down the way your best person does it, under a team knowledge type, such as "Runbooks" under "Team". Then test it with someone new:

> I'm new. How do we deploy the website?

If the answer is right, the knowledge no longer lives in one person's head.

## 5. Put agents on the board (10 min)

Create agents as members in Project Management ([Assign work to an agent](/guides/assign-work-to-an-agent)) for the repetitive parts: drafting the weekly report, preparing onboarding checklists, first-pass research. People and agents then share one board, and everything an agent finishes waits for a person to approve it.

## When someone leaves

1. Remove them from the team space, the project workspace and the CRM. Their tokens stop reaching team data at once, because a token can only see what its owner can.
2. Ask them to revoke their tokens too, or deactivate their account if it was a work account.
3. If they knew a shared integration token, replace it.
4. Reassign their open work items.

Their how-tos, notes and history stay, which is the point.

## Check it worked

- A newcomer got a correct answer from the team's how-tos without asking a person.
- Every teammate uses their own tokens. No shared logins.
- One recurring job is now drafted by an agent and approved by a person.

## Next

Run the [weekly review](/guides/weekly-review) as a team, and close projects with a [retro](/guides/close-a-project). That's how the team gets better every week, not just busier.
