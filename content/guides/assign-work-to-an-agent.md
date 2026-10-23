---
title: "Assign work to an agent and review it"
seoTitle: "Assign work items to AI agents in Project Management"
dek: "Create an agent as a member of your project, assign it work items like a colleague, let it work through its queue, and approve the result before anything is done."
order: 7
time: "30 min"
personas: founder, team, freelancer
modules: proj, agent
packs:
updated: 2026-10-23
draft: true
---

In Project Management, an agent can be a member: it has a profile, a goal and a workflow, it can be assigned work items, and it works through them in any AI app that connects over MCP. You stay the reviewer.

## What you need

- **Project Management**, with an AI app connected to it ([Connect your AI](/docs/connect/overview)).
- A workspace account. Changing an agent's settings (pausing, archiving, deleting) needs a workspace admin.
- A review state in the project, such as **In review**, for the agent to move finished items into.

## 1. Create the agent (10 min)

Open the **Agents** page in your workspace and choose **New agent**.

| Field | What to write | Example (made up) |
|---|---|---|
| **Name**, **Handle** | A name, and a short id for API and MCP use | Research Assistant, `research-assistant` |
| **Role**, **Summary** | One line each; the summary helps AI apps pick the right agent | "Gathers sources and drafts briefs" |
| **Goal** | What it optimises for and how success is measured | "Briefs a person can act on without re-reading the sources" |
| **How it works** | Approach, boundaries, constraints | "Cites every claim. Never contacts anyone." |
| **Instructions** | What the AI follows, like a system prompt | See below |
| **Owner** | The person accountable for it | You |

Example instructions:

```text
Only work on items assigned to you. Before starting, read the item, its
project and any linked notes. If something you need is missing, comment and
stop. When done, comment with what you did and what you relied on, then move
the item to review. Never mark anything done.
```

:::warning No secrets in the definition
The definition is shared with AI apps through the API and MCP. Never put passwords or tokens in it.
:::

## 2. Add a workflow with an approval step (5 min)

Under **Workflow**, add the steps in order, for example: read the brief, gather sources, draft, **wait for approval**, finalise. Tick **Needs approval** on the step where a person must sign off. The agent stops there.

## 3. Give it a project and assign work (5 min)

Under **Projects**, choose **Add to project**. An agent can only be assigned work items in projects it can access. Then assign it work items like any member.

## 4. Run its queue (5 min)

Open the agent's **Context** tab. Under **Use this agent in an LLM platform** there's an example prompt with the agent's handle and your workspace filled in. Paste it into your AI app (Claude Code, Codex or the Agentic Platform). It reads roughly:

> Load the Cybernetics agent @research-assistant in workspace demo with get_agent_context and act as it. Then work through its queue.

The app loads the agent's definition (`get_agent_context`), lists its items (`list_agent_work_items`), takes each brief (`get_agent_task_brief`), does the work, and comments on the item. It stops at any step marked **Needs approval**.

The agent's **Work items** tab has **Copy task brief** for each item, if you'd rather paste a single task into a chat.

## 5. Review (5 min)

Read the comment and the result. Then either move the item on, or comment what needs changing and send it back. Corrections that will come up again belong in the agent's instructions or the linked how-to, so the next run starts better.

## Managing agents

| Setting | Effect |
|---|---|
| **Accept new assignments** off | Keeps current items, takes no new ones |
| **Pause** | No new assignments; the definition stays available |
| **Archive** | Removed from its projects; assignments stay for history |

Every save creates a new definition version, and **Context** shows exactly what AI apps receive.

## Check it worked

- The agent commented on its item with what it did and what it used.
- It stopped at the approval step.
- You, not the agent, moved the item to done.

## Next

Bring the week's work together: [Cycles and weekly reports](/guides/cycles-and-weekly-reports).
