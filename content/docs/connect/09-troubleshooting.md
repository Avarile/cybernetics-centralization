---
title: "Troubleshooting connections"
seoTitle: "Fix MCP connection errors: 401, 404, 405"
description: "What each error means, how to test an endpoint from the terminal, and the fixes for the problems people hit most."
time: "5 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: true
---

## Test an endpoint directly

This sends the first message every MCP client sends. Run it from a terminal, with the token in an environment variable:

```bash
curl -s -X POST https://cybernetics.avarile.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $CYBERNETICS_DATA_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

A working server answers with its name and capabilities. For Project Management, swap in its URL and `$CYBERNETICS_PROJECTS_TOKEN`.

:::warning Don't curl the Agentic Platform
The Agentic Platform treats scripted requests to its app routes as abuse and can lock your account and IP out for two hours. Test the three data endpoints above instead.
:::

## What the errors mean

| You see | Likely cause | Fix |
|---|---|---|
| **404** "Cannot POST /mcp" | Wrong path for the Data Base | Use `/api/mcp` |
| **405** with an HTML page | Wrong path for Project Management, or its MCP server is off | Use `/api/mcp`; self-hosters set `MCP_SERVER_ENABLED=1` |
| **404** on `crm…/api/mcp` | Wrong path for the CRM | Use `/mcp` |
| **401** Unauthorized | Missing, mistyped, expired or revoked token | Check the header reads `Authorization: Bearer <token>`, with one space; create a new token if unsure |
| **401** from the CRM | OAuth sign-in not finished | Re-run the app's sign-in (`/mcp` in Claude Code, `codex mcp login`) |
| Only read tools appear | The token has read scopes only, or the server is read-only (`MCP_READONLY`) | Add scopes to the token, or ask the admin |
| A query returns at most 500 records | The server's per-query cap | Narrow the query or page through results |

## Common problems

- **The token works in curl but not in the app.** The app saved an old value. Remove the server and add it again (Claude Code), update the environment variable and restart (Codex, Cursor), or edit the config file and fully quit and reopen (Claude Desktop).
- **Claude Desktop shows nothing.** The config file isn't valid JSON, or the app wasn't fully restarted. See [Claude Desktop](/docs/connect/claude-desktop).
- **"npx: command not found".** Install Node.js; `mcp-remote` runs with it.
- **The AI says it can't see a table.** The token's access doesn't include that space or base. Edit the token's access in the Data Base.
- **The AI answers but not from your data.** Ask it which tool it used. If it didn't call one, say "check my Data Base" explicitly, or turn the connector on for that chat.
