---
title: "Create access tokens"
seoTitle: "Create MCP access tokens for each module"
description: "Make a token for the Data Base and for Project Management, choose what it can reach, and revoke it when you're done. The CRM signs in with OAuth instead."
time: "5 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

Create one token per AI app, per module. Name it after the app ("Claude Code on laptop") so you know which one to revoke later.

## Data Base

1. Open **Settings → Personal access tokens** and choose **Create new token**.
2. Fill in the form (see the table below).
3. Create it, then **copy the token immediately**. It's shown once.

| Field | What to put |
|---|---|
| **Name**, **Description** | Which app and machine it's for |
| **Scopes** | What the token can do. For a read-only assistant, pick only read scopes |
| **Access** | The spaces and bases it can reach. Pick a whole space to include bases you add later |
| **Expiration** | A number of days, a date, or permanent. Shorter is safer |

The **Settings → MCP Server** page shows the endpoint, the tools a client can use (each with the scopes it needs), and this instance's limits.

:::note What an AI can't do through MCP
It can't delete fields or tables, and it can't convert field types, because those can't be undone. Records it deletes can be restored from the table's **Trash**.
:::

## Project Management

1. Open your **Profile settings → MCP server**.
2. Under **1. Add a token**, choose **Generate token**, or **Use an existing token** and paste one that starts with `plane_api_`.
3. Choose **Test connection**. It should say *Connected* and show how many tools are available.
4. **2. Connect your assistant** shows ready-made setup for Claude Code, Cursor, VS Code, Claude Desktop and others, with your endpoint and token already filled in.

The assistant signs in as you, with your permissions. Revoke tokens any time under **Profile settings → Personal Access Tokens**.

## CRM

No token is needed. The CRM uses OAuth: the first time an AI app connects, a browser window opens, you sign in to the CRM and approve access.

For an app that can't do OAuth, create an API key in the CRM under **Settings → APIs & Webhooks** and send it as `Authorization: Bearer <key>`.

## Keep tokens out of chats and files

Store tokens in environment variables, so configuration files can refer to them without containing them:

```bash
# ~/.zshrc or ~/.bashrc
export CYBERNETICS_DATA_TOKEN="paste-the-data-base-token"
export CYBERNETICS_PROJECTS_TOKEN="plane_api_..."
```

Open a new terminal afterwards, or run `source ~/.zshrc`. The setup pages that follow use these two names.

:::warning If a token leaks
Revoke it right away (Data Base: **Settings → Personal access tokens**; Project Management: **Profile settings → Personal Access Tokens**), then create a new one. Never paste a token into an AI chat, a screenshot or a git repository.
:::
