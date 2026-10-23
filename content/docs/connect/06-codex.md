---
title: "Codex"
seoTitle: "Connect Codex to your Data Base, projects and CRM"
description: "Add the three servers to Codex's config.toml. Codex reads the tokens from environment variables, so the file never contains them."
time: "5 min"
modules: data, proj, crm
verified:
updated: 2026-10-23
draft: true
---

## Before you start

The two tokens in environment variables, as in [Create access tokens](/docs/connect/access-tokens).

## Add the servers

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.cybernetics-data]
url = "https://cybernetics.avarile.com/api/mcp"
bearer_token_env_var = "CYBERNETICS_DATA_TOKEN"

[mcp_servers.cybernetics-projects]
url = "https://projects.avarile.com/api/mcp"
bearer_token_env_var = "CYBERNETICS_PROJECTS_TOKEN"

[mcp_servers.cybernetics-crm]
url = "https://crm.avarile.com/mcp"
```

`bearer_token_env_var` names the variable Codex reads the token from and sends as `Authorization: Bearer …`. Rotating a token means updating the variable, not this file.

## Sign in to the CRM

Codex opens the CRM's sign-in page the first time it sees the server. If no browser window appears, run:

```bash
codex mcp login cybernetics-crm
```

Open the sign-in link once only. Opening it twice creates two competing sign-ins.

## Check it worked

```bash
codex mcp list
```

Then try it on a real task:

> Find my how-to on deploying to production and follow it for this repo.
