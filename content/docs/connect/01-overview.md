---
title: "Connect your AI: overview"
seoTitle: "Connect Claude, ChatGPT, Codex or Cursor over MCP"
description: "The three MCP endpoints, how each one signs in, and which AI apps can use which module."
time: "3 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

Each module that holds data exposes an MCP endpoint. MCP (Model Context Protocol) is the standard plug AI apps use to talk to outside tools: think of it as USB for AI. Any app that speaks it can read and write your data, with a key you control.

## The endpoints

| Module | Endpoint (hosted) | Signs in with |
|---|---|---|
| Data Base | `https://cybernetics.avarile.com/api/mcp` | A personal access token, sent as a header |
| Project Management | `https://projects.avarile.com/api/mcp` | A personal access token, sent as a header |
| CRM | `https://crm.avarile.com/mcp` | OAuth: you approve access in the browser |

Self-hosting? The paths are the same on your own domains.

:::note Two ways to sign in
**Token** endpoints need an `Authorization: Bearer <token>` header on every request. Create the token first: see [Create access tokens](/docs/connect/access-tokens).

**OAuth** endpoints need nothing up front. The first time your AI app connects, it opens a browser window where you sign in and approve access.
:::

## Which app can use which module

Some apps can send a token header and some can only do OAuth. That decides what works where.

| AI app | Data Base | Project Management | CRM |
|---|---|---|---|
| [Claude Code](/docs/connect/claude-code) | ✓ | ✓ | ✓ |
| [Claude Desktop](/docs/connect/claude-desktop) | ✓ via a small bridge | ✓ via a small bridge | ✓ |
| [ChatGPT](/docs/connect/chatgpt) | ✗ for now | ✗ for now | ✓ |
| [Codex](/docs/connect/codex) | ✓ | ✓ | ✓ |
| [Cursor, VS Code and others](/docs/connect/cursor-and-others) | ✓ | ✓ | ✓ |
| [Agentic Platform](/docs/connect/agentic-platform) | ✓ | ✓ | ✓ |

## The rules that keep this safe

- **One token per app.** If you stop using an app, revoke its token and nothing else breaks.
- **Only the access it needs.** Data Base tokens can be limited to certain spaces and bases, and to read-only scopes.
- **The AI acts as you.** A token carries its owner's permissions. It can't see more than you can.
- **Tokens are shown once.** Paste them straight into your app's configuration or an environment variable. Never into a chat.
