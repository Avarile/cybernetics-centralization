---
title: "Security"
seoTitle: "Security: how your data and your AI's access are protected"
dek: "Where your data lives, how AI apps get in, how you take that access back, and what an AI provider sees when it reads your records."
date: 2026-10-23
draft: true
---

Cybernetics is built on one idea: your memory belongs to you, not to an AI company. This page explains what that means in practice.

## Where your data lives

Each module runs on servers we operate ourselves, not on an AI provider's platform. [YOU: the hosting provider and the country or region the servers are in.]

[YOU: how data is protected at rest and in transit, e.g. disk encryption and HTTPS everywhere, and how often it's backed up and where the backups are kept.]

## How AI apps get in

An AI app can only reach a module you've connected it to, and only as you:

- **Data Base and Project Management** use personal access tokens. You create one per AI app, choose what it can reach, and revoke it at any time in your profile settings. See [access tokens](/docs/connect/access-tokens).
- **The CRM** uses OAuth: you sign in in the browser and approve the app, without handing over a password or a token.
- An AI app signs in with your permissions, so it can't see anything you can't.

The Data Base and Project Management also support email two-factor sign-in for your own account.

## What an AI provider sees

Your data is stored with us, not with the AI provider. But when you ask an AI app a question and it reads your records to answer, **those records are sent to that provider** as part of the conversation, the same as anything you paste into a chat. The provider's own terms then apply to that conversation.

So:

- Connect only the modules an app needs, with tokens scoped to what it should reach.
- Keep passwords, ID numbers and sensitive financial details out of what an AI can read, or behind a separate token you don't give to AI apps.
- If an answer sounds confident but isn't from your records, ask the AI where it got it from.

## Open source

Every module is a modified version of an open-source project, and the source code of what we run is public, so anyone can check how it handles data. See [open source](/open-source).

## Reporting a problem

If you find a security issue, email [YOU: a security contact address]. [YOU: how quickly you'll respond, and whether you have a disclosure policy.]
