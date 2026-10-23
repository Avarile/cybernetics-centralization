---
title: "Claude Code"
seoTitle: "Connect Claude Code to your Data Base, projects and CRM"
description: "Add all three MCP servers to Claude Code in one go, with token headers for the Data Base and Project Management and OAuth for the CRM."
time: "5 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: false
---

Claude Code adds remote MCP servers from the terminal and sends any header you give it.

## Before you start

- Claude Code installed and signed in.
- The two tokens in environment variables: see [Create access tokens](/docs/connect/access-tokens).

## Add the servers

```bash
claude mcp add --transport http --scope user cybernetics-data \
  https://cybernetics.avarile.com/api/mcp \
  --header "Authorization: Bearer $CYBERNETICS_DATA_TOKEN"

claude mcp add --transport http --scope user cybernetics-projects \
  https://projects.avarile.com/api/mcp \
  --header "Authorization: Bearer $CYBERNETICS_PROJECTS_TOKEN"

claude mcp add --transport http --scope user cybernetics-crm \
  https://crm.avarile.com/mcp
```

`--scope user` makes the servers available in every project. Leave it out to add them to the current project only.

:::note The token is stored, not referenced
Your shell expands `$CYBERNETICS_DATA_TOKEN` when you run the command, so Claude Code saves the token's value. If you rotate a token, remove the server and add it again.
:::

## Sign in to the CRM

Start Claude Code and run `/mcp`. Pick `cybernetics-crm` and choose to authenticate. A browser window opens; sign in to the CRM and approve.

## Check it worked

```bash
claude mcp list
```

All three should show as connected. Then ask something only your data can answer:

> What are my active goals, and what's planned under each one?

If the answer lists your own goals and projects, you're connected.

## Remove or update a server

```bash
claude mcp remove cybernetics-data --scope user
```

Then add it again with the new token.
