---
title: "Cursor, VS Code and other clients"
seoTitle: "Connect Cursor or VS Code to your data over MCP"
description: "Configure Cursor and VS Code with token headers, or point any Streamable HTTP MCP client at the three endpoints."
time: "5 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

## Cursor

Project Management's **Profile settings → MCP server** page has an **Add to Cursor** button that does this for that server in one click. For all three, add them to `~/.cursor/mcp.json` (every project) or `.cursor/mcp.json` (one project):

```json
{
  "mcpServers": {
    "cybernetics-data": {
      "url": "https://cybernetics.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${env:CYBERNETICS_DATA_TOKEN}" }
    },
    "cybernetics-projects": {
      "url": "https://projects.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${env:CYBERNETICS_PROJECTS_TOKEN}" }
    },
    "cybernetics-crm": {
      "url": "https://crm.avarile.com/mcp"
    }
  }
}
```

`${env:…}` reads the token from your environment, as set up in [Create access tokens](/docs/connect/access-tokens). Restart Cursor after setting the variables. The CRM asks you to sign in the first time it's used.

Check the status under **Cursor Settings → MCP**: each server should show a green dot and its tools.

## VS Code

Project Management's MCP page also has an **Add to VS Code** button. To add all three, create `.vscode/mcp.json`. VS Code can prompt for a token once and store it securely:

```json
{
  "inputs": [
    { "type": "promptString", "id": "data-token", "description": "Data Base token", "password": true },
    { "type": "promptString", "id": "projects-token", "description": "Project Management token", "password": true }
  ],
  "servers": {
    "cybernetics-data": {
      "type": "http",
      "url": "https://cybernetics.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${input:data-token}" }
    },
    "cybernetics-projects": {
      "type": "http",
      "url": "https://projects.avarile.com/api/mcp",
      "headers": { "Authorization": "Bearer ${input:projects-token}" }
    },
    "cybernetics-crm": {
      "type": "http",
      "url": "https://crm.avarile.com/mcp"
    }
  }
}
```

## Any other client

Any client that supports **Streamable HTTP** works:

| Setting | Data Base | Project Management | CRM |
|---|---|---|---|
| URL | `https://cybernetics.avarile.com/api/mcp` | `https://projects.avarile.com/api/mcp` | `https://crm.avarile.com/mcp` |
| Auth | `Authorization: Bearer <token>` | `Authorization: Bearer <token>` (or `X-Api-Key: <token>`) | OAuth |

If a client only supports local (stdio) servers, bridge it with `mcp-remote` as shown for [Claude Desktop](/docs/connect/claude-desktop).
