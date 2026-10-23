---
title: "Agentic Platform"
seoTitle: "Connect the Agentic Platform to your data"
description: "Give your custom agents access to the Data Base, Project Management and CRM, each with your own token, on whichever model you choose."
time: "10 min"
modules: agent, data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

The Agentic Platform is where custom agents and skills run. The three MCP servers are added as **app connections**: each user connects with their own credentials, so an agent only ever sees what that user can see.

## Add the connections

Add each server once, with your own credentials:

1. Choose **Add MCP Server**. If you don't see it, ask your admin to turn on **Allow users to create MCP servers**.
2. Fill in **Title**, **MCP Server URL** and **Transport** (Streamable HTTP) from the table below.
3. For the Data Base and Project Management, set **Authentication Type** to **API Key**, **Header Format** to **Bearer**, and paste your token.
4. For the CRM, leave **Authentication Type** on **None (Auto-detect)**. The server is detected as needing OAuth.
5. Save. A server that needs a sign-in shows **Needs Auth**: choose **Authenticate**, sign in to the CRM in the window that opens, and approve.

Use these settings:

| Connection | URL | Credential |
|---|---|---|
| `cybernetics-data` | `https://cybernetics.avarile.com/api/mcp` | Header `Authorization: Bearer <your Data Base token>` |
| `cybernetics-projects` | `https://projects.avarile.com/api/mcp` | Header `Authorization: Bearer <your plane_api_ token>` |
| `cybernetics-crm` | `https://crm.avarile.com/mcp` | OAuth: sign in when prompted |

Create the tokens first: [Create access tokens](/docs/connect/access-tokens).

:::warning Use these names exactly
The built-in agents look for connections named exactly `cybernetics-data` and `cybernetics-projects`. With any other name they won't find your data, and they'll fall back to asking you in the chat.
:::

## Give an agent the tools

1. Open the agent in the **Agent Hub** and add the connections it needs. A weekly-report agent needs Project Management and the Data Base; a meeting-prep agent needs the CRM.
2. Agents marked **MCP optional** still run when a connection is missing. They just can't use those tools. Use this for agents that are useful with or without your data.
3. Start a chat with the agent and ask it something only your data can answer.

## Agents that pick up work

Agents set up as members in Project Management can **Work my queue**: they take the work items assigned to them, do the work, and move each item on for you to review. See the guide on assigning work to agents.

## Changing models

Every agent can run on a different model. To switch many at once, use **Change model** in the Agent Hub. Your connections and data don't change when the model does.
