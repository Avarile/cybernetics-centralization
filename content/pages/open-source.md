---
title: "Open source"
dek: "Cybernetics is built on four open-source projects. Here's what each module is built on, its license, and where to get the source code we run."
date: 2026-10-23
draft: true
---

Every Cybernetics module is a modified version of an open-source project. We're grateful to the people behind them. Where a license requires it, the source code of our modified versions is public and linked below.

## The modules and what they're built on

| Module | Built on | License | Our source |
|---|---|---|---|
| Data Base | [Teable](https://github.com/teableio/teable) | AGPL-3.0 (apps), MIT (packages), with Teable's additional terms | [Avarile/cybernetics-data](https://github.com/Avarile/cybernetics-data) |
| Project Management | [Plane](https://github.com/makeplane/plane) | AGPL-3.0 | [Avarile/cybernetics-project](https://github.com/Avarile/cybernetics-project) |
| CRM | [Twenty](https://github.com/twentyhq/twenty) | AGPL-3.0, with some files under Twenty's commercial license | [Avarile/cybernetics-crm](https://github.com/Avarile/cybernetics-crm) |
| Agentic Platform | [LibreChat](https://github.com/LibreChat-AI/LibreChat) | MIT | [Avarile/Cybernetic-agents](https://github.com/Avarile/Cybernetic-agents) |

## What we changed

- **Data Base:** an MCP server, schema packs for onboarding, a knowledge graph, read-only AI chat over your own data, and email two-factor sign-in.
- **Project Management:** an MCP server covering the public API, agents as project members, and email two-factor sign-in.
- **CRM:** an integration that attaches Data Base records to people, companies and deals.
- **Agentic Platform:** skill agents, bulk model changes, and agents that work through their queue in Project Management.

## Branding

The Data Base keeps Teable's branding, as Teable's license requires. "Cybernetics" names the combined product, not the upstream projects, and doesn't imply their endorsement.

[YOU: confirm the Teable name and logo are visible in the Data Base before publishing this page.]

## Third-party skills

The marketing skill agents in the Agentic Platform are adapted from [marketingskills](https://github.com/coreyhaines31/marketingskills) by Corey Haines, MIT License.

## Twenty's commercial files

[YOU: confirm which, if any, features from Twenty's commercially licensed files are enabled in the CRM, and state it here.]
