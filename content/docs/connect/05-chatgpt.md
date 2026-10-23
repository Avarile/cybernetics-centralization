---
title: "ChatGPT"
seoTitle: "Connect ChatGPT to your CRM over MCP"
description: "ChatGPT connectors sign in with OAuth, so the CRM works today. The Data Base and Project Management need a token header, which ChatGPT can't send yet."
time: "5 min"
modules: crm
verified:
updated: 2026-10-23
draft: true
---

ChatGPT adds remote MCP servers as connectors. A connector signs in with OAuth and can't send a custom header. So today:

| Module | Works in ChatGPT? |
|---|---|
| CRM | Yes, through OAuth |
| Data Base | Not yet: needs a token header |
| Project Management | Not yet: needs a token header |

## Add the CRM

1. Open **Settings → Apps & Connectors**. If you don't see a way to create one, turn on developer mode under **Advanced settings**.
2. Choose **Create** and fill in the name `cybernetics-crm`, the URL `https://crm.avarile.com/mcp`, and OAuth as the authentication.
3. Sign in to the CRM in the window that opens and approve.

## Check it worked

Start a new chat, turn on the connector, and ask:

> Who haven't I spoken to in the last two weeks?

## The Data Base and Project Management

Until those two support OAuth, use them from an app that can send a header: [Claude Code](/docs/connect/claude-code), [Claude Desktop](/docs/connect/claude-desktop), [Codex](/docs/connect/codex), [Cursor](/docs/connect/cursor-and-others) or the [Agentic Platform](/docs/connect/agentic-platform), which can use any model, including OpenAI's.

:::warning Don't work around it with a public proxy
Online tools that "add a header" to an MCP server would see your token and your data. Keep tokens on machines you control.
:::
