---
title: "Meeting prep and follow-ups that come back to you"
seoTitle: "AI meeting prep and follow-ups from your own contacts"
dek: "Keep who's who, what you talked about and what you promised in one place, get a prep sheet before every meeting, and have your promises come back before they're late."
order: 10
time: "15 min"
personas: freelancer, founder, team
modules: data, crm
packs: people, progress
updated: 2026-10-23
draft: true
---

Most of what goes wrong between people is a dropped follow-up. This guide keeps the details of your relationships next to the work they're part of, so your AI can prepare you and remind you.

## What you need

- The Data Base's **People** pack, with the **Interaction log** extra table turned on when you install it. With **Progress** as well, people link to projects and tasks.
- Running a business with a sales pipeline? Use the **CRM** for clients and deals; the steps are the same, and [Link records across modules](/guides/link-records-across-modules) connects it to your Data Base.

## How the People pack is shaped

| Table | What it holds |
|---|---|
| `contacts` | First and last name, email, mobile, plus `contact_type`, `contact_profession` and `contact_company` links |
| `companies` | Organisations, with the people in them |
| `contact_type`, `contact_profession` | Your own categories: friend, client, supplier; designer, accountant |
| `auditlog` (Interaction log) | One row per conversation or promise, linked to the contact (`generated_by_contact`) |

With Progress installed, projects get a `lead_by` contact and tasks an `assigned_to` contact.

## 1. Add the people you owe something to (10 min)

Start with the five who matter this month, not your whole address book. Made-up examples:

> Add Alex Demo as a contact: a friend helping plan Mum's birthday. Add Sam Demo, a client at Demo Studio; I owe Sam a quote by Thursday.

What should come out: two contacts, a company (Demo Studio) with Sam in it, and a task "Send Sam the quote" with "by Thursday" in its context.

:::note Deadlines live in the context
Tasks record when work starts and finishes, not when it's due. Say the deadline in words ("by Thursday") and the AI keeps it in the task's context, where it can find it again.
:::

## 2. Log after every conversation (1 min)

> Great catch-up with Alex. They'll book the restaurant by Friday. I said I'd sort out the cake.

What should come out: an Interaction log entry on Alex, a task "Check Alex booked the restaurant" with "Friday" in its context, and a task for the cake. Both tasks go under your birthday project (made up here); if you don't have one, the AI should ask.

## 3. Prep before every meeting (2 min)

> I'm meeting Alex at 3:30 about Mum's birthday. Prep me.

A good prep sheet has what's already decided, what's still open, what each of you promised last time, any related notes it finds (a gift-ideas note, say), and three questions to settle today.

## 4. Let promises come back (2 min a day)

> What did I promise people that's due in the next three days? And who hasn't heard from me in two weeks but has something open?

Put that question in your morning routine, or in a saved recipe your AI runs first thing.

## Boundaries worth keeping

- Record commitments, not gossip: what was decided and promised.
- Nothing told in confidence goes in.
- Tokens are limited by space and base, not by table. If you'd rather some AI apps never see phone numbers, keep contacts in a base of their own and leave it out of those tokens.
- In a business, the people you keep records on have rights over that data. Treat their records the way you'd want yours treated.

## Check it worked

- The prep sheet mentioned something you'd have forgotten.
- A promise came back to you before it was late.

## Next

Connect your CRM and projects to your Data Base: [Link records across modules](/guides/link-records-across-modules).
