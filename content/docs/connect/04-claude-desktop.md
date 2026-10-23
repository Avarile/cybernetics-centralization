---
title: "Claude Desktop"
seoTitle: "Connect Claude Desktop to your data over MCP"
description: "Add the CRM as a connector, and bridge the Data Base and Project Management with mcp-remote, because Claude's connector form can't send a token header."
time: "10 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

Claude's connector form signs in with OAuth only. The CRM supports that, so it goes in as a connector. The Data Base and Project Management need a token header, so they go into Claude Desktop's configuration file through `mcp-remote`, a small bridge that runs on your computer and adds the header for you.

## The CRM, as a connector

1. Open **Settings → Connectors → Add custom connector**.
2. Name it `cybernetics-crm` and paste `https://crm.avarile.com/mcp`.
3. Choose **Connect**, sign in to the CRM in the browser window, and approve.

## The Data Base and Project Management, through mcp-remote

You need Node.js installed, because the bridge runs with `npx`.

1. Open **Settings → Developer → Edit Config**. This opens `claude_desktop_config.json`.
2. Add both servers. Put each token in `env` rather than inside the arguments:

```json
{
  "mcpServers": {
    "cybernetics-data": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://cybernetics.avarile.com/api/mcp",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer paste-the-data-base-token" }
    },
    "cybernetics-projects": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://projects.avarile.com/api/mcp",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer plane_api_..." }
    }
  }
}
```

3. Save the file and **quit Claude Desktop completely**, then reopen it. Closing the window isn't enough.

:::tip Why the header is written that way
`Authorization:${AUTH_HEADER}` has no space after the colon, and the space lives inside the variable. Some systems split arguments on spaces, which breaks `Authorization: Bearer …` written directly in `args`.
:::

## Check it worked

Open a new chat. The tools menu should list `cybernetics-data`, `cybernetics-projects` and `cybernetics-crm`. Ask:

> What's overdue in my projects, and which notes are linked to those tasks?

## If it doesn't connect

- **Nothing appears:** check the file is valid JSON (a missing comma is the usual cause) and fully restart the app.
- **The server shows an error:** run the same `npx -y mcp-remote …` command in a terminal to see the message. A 401 means the token is wrong or revoked.
- More in [Troubleshooting](/docs/connect/troubleshooting).
