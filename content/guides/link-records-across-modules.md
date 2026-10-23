---
title: "Link records across modules"
seoTitle: "Attach Data Base records to CRM contacts and work items"
dek: "Attach the right notes and records to a client in the CRM or a work item in Project Management, so the context travels with the work."
order: 11
time: "20 min"
personas: founder, team, freelancer
modules: data, proj, crm
packs: knowledge
updated: 2026-10-23
draft: true
---

Your how-tos and records live in the Data Base. The work happens in Project Management and the CRM. These two integrations let you attach Data Base records to work items, people, companies and deals, so nobody has to go looking.

## What you need

- A Data Base with the records you want to share.
- Admin rights in the project (for Project Management) or the **Data Centre** permission (for the CRM).
- A Data Base **personal access token with read scopes**, ideally from a dedicated account limited to the spaces you want to share. Data Base tokens start with `cybernetics_`.

:::warning One token, everyone's view
Everyone who can open the project or CRM workspace browses the Data Base with this token's permissions. Give it read scopes only, limited to the spaces you mean to share.
:::

## Project Management → Data Base

1. Open **Project settings → Cybernetics Data**.
2. Fill in **CYBERNETICS_DATA_URL** (your Data Base address, without `/api`, e.g. `https://cybernetics.avarile.com`) and **CYBERNETICS_APITOKEN**. The token needs read scopes for space, base (including read all), table, field, view and record.
3. Choose **Test connection**, then **Save**, and make sure **Enabled** is on.
4. In any work item, choose **Database**, pick a database and table, search or filter the records, select them and attach.

Attached records show as **Database records** on the work item, with **View**, **Refresh**, **Copy link** and **Open in Cybernetics Data**. If the connection is later turned off, the work item keeps a saved snapshot.

## CRM → Data Base

1. Open **Settings → Data Centre**. (You need a role with the **Data Centre** permission.)
2. Enter the Data Base URL and the read-only token, turn it on, and choose **Test connection**. Only the token's last four characters are shown afterwards.
3. Open a person, company or opportunity, go to the **Database** tab and choose **Attach**. Pick a database and table on the left and the records on the right. Up to 10 records can be attached per CRM record.

Previews refresh every hour. If a record is deleted in the Data Base, or the token loses access to it, the attachment is flagged rather than silently disappearing.

## What to attach

| Where | Attach | Why |
|---|---|---|
| A work item | The how-to it should follow | The person or agent doing it starts with the method |
| A client (CRM) | Their project notes and agreements | Prep and follow-ups start from facts |
| A deal (CRM) | The proposal and pricing notes | Anyone picking it up sees what was offered |

## Check it worked

- A work item shows its how-to under **Database records**.
- A CRM contact's **Database** tab shows the attached notes, with a fresh preview.

## Self-hosting?

On a self-hosted CRM, an admin first turns the integration on for the workspace. The self-hosting docs cover it.
