---
title: "Build a custom agent with skills"
seoTitle: "Build a custom AI agent with skills and your own data"
dek: "Create an agent in the Agentic Platform for one recurring job, give it your data through MCP and a skill that holds the method, and run it on whichever model you like."
order: 14
time: "40 min"
personas: founder, team, researcher
modules: agent, data, proj
packs:
updated: 2026-10-23
draft: true
---

An agent is a named helper for one job: instructions, a model, the tools it may use, and skills for the harder parts. This guide builds a made-up "Meeting prep" agent. Swap in your own recurring job.

## What you need

- An Agentic Platform account, with the `cybernetics-data` connection set up ([Agentic Platform](/docs/connect/agentic-platform)). Add `cybernetics-projects` or `cybernetics-crm` if the job needs them.

## The parts of an agent

| Part | What it's for |
|---|---|
| **Instructions** | Who the agent is and how it behaves, like a system prompt |
| **Model** | Any model the platform offers. You can change it later without touching anything else |
| **MCP Servers** | Which connections, and which of their tools, it may use |
| **Skills** | The method for a job, in Markdown, loaded when needed |
| **Capabilities** | Built-ins such as web search, code execution, file search and memory |
| **Conversation starters** | Up to four one-click prompts |

## 1. Write the skill first (10 min)

A skill holds the *how*, separately from the agent, so several agents can share it and you can improve it in one place. Create one under **Skills → Create skill**:

```text
Meeting prep

When: the user names a person and a meeting.
1. Find the person (contacts or CRM). Read the last interactions and any
   promises either side made.
2. Find projects and tasks linked to them, and notes linked to those.
3. Write a prep sheet: what's decided, what's open, what each side promised,
   three questions to settle, and the outcome to aim for.
4. Keep it under 200 words. Cite the records you used.
Never contact anyone. Never change records without asking.
```

Be specific in the skill's description about when it applies; that's how the agent knows to load it. Turn on **Available to agent**.

## 2. Create the agent (10 min)

Open the **Agent Builder** and fill in:

- **Agent name:** Meeting prep
- **Instructions:** "You prepare the user for meetings using their own records. Load the Meeting prep skill before answering. If a record you need is missing, say so instead of guessing."
- **Model:** a fast, inexpensive one is fine for this job.
- **MCP Servers:** choose **Add MCP**, add `cybernetics-data` and allow only its read tools (`query_records`, `get_record`, `get_record_neighbors`). Add `cybernetics-crm` if your clients live there.
- **Skills:** select Meeting prep.
- **Conversation starters:** "Prep me for my next meeting", "What did I promise <person>?"

## 3. Try it on a real meeting (10 min)

> I'm meeting Alex at 3:30 about Mum's birthday. Prep me.

Check every fact against the records it cites. Where it's wrong or vague, fix the **skill**, not the chat.

## 4. Change the model when you like (2 min)

Because your data lives in the Data Base and the method lives in the skill, switching the model changes nothing else. To move many agents at once, use **Change model** in the Agent Hub.

## 5. Optional: give it a queue (10 min)

Mirror the agent as a member in Project Management, so work can be assigned to it: [Assign work to an agent](/guides/assign-work-to-an-agent).

## Check it worked

- The agent loaded the skill and cited real records.
- It only had the tools it needed: read-only, for this job.
- You improved the skill once after a real run.

## Next

See what a full team of agents looks like: [Put the marketing agents to work](/guides/marketing-agents).
