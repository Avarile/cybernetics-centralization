---
title: "Import bank statements and let an agent categorise them"
seoTitle: "Categorise bank transactions with AI from a CSV export"
dek: "Export a statement, drop it into an inbox table, and let your AI sort each line into accounts, categories and payees, learning your rules as it goes."
order: 12
time: "40 min"
personas: freelancer, founder, student
modules: data
packs: finance
updated: 2026-10-23
draft: false
---

Raw statements go in; categorised, queryable transactions come out. Your bank login never goes anywhere near an AI: you export a file, and the AI only sees what's in it.

## What you need

- The Data Base's **Finance** pack, with your currency set when you install it. Add the **Budgets** and **Tags** extra tables if you want them.
- Ideally in **a base of its own**. Tokens are limited by space and base, not by table, so a separate base is what lets you keep money away from AI apps that don't need it.
- A CSV export from your bank, for one account and one month to start with.

## How the Finance pack is shaped

| Table | Holds | Worth knowing |
|---|---|---|
| `finance_Accounts` | Checking, savings, credit cards… | `Current Balance` is calculated from the opening balance and transactions |
| `finance_Categories` | Income and expense categories, nestable | `Full Path` shows e.g. "Food > Eating out" |
| `finance_Payees` | Who you paid or who paid you | A `Default Category` per payee |
| `finance_Transactions` | One row per transaction | `Amount` is always positive; `Type` (Income, Expense or Transfer) decides the sign in `Signed Amount`. `Budget` links the transaction to a budget |
| `finance_Budgets` | Monthly plan per category | See [Budgets and money questions](/guides/budgets-and-money-questions) |

## 1. Set up accounts and categories (10 min)

> Create my accounts: Everyday (checking, personal, opening balance 1,200 on 1 October) and Credit card (personal, opening balance 0). Then create expense categories: Groceries, Eating out, Transport, Subscriptions, Home, and an income category Salary.

(Made-up numbers. Use your own.)

## 2. Import the statement into an inbox (5 min)

Import your bank's CSV as a new table called **Statement inbox**, as it is: date, description, amount. Don't map anything yet. The inbox is just the raw file. Add one checkbox field, **Processed**, so the AI can tick off what it has handled.

## 3. Let the AI sort it (10 min)

```text
Statement-sorter recipe

For each row in Statement inbox that hasn't been processed:
1. Find or create the payee from the description. Use the payee's default
   category if it has one.
2. Pick the category. If you're not sure, leave it empty and list it for me.
3. Create a transaction in finance_Transactions with the date, description,
   type, account, payee and category. Amount is always positive: the bank's
   minus sign becomes Type = Expense.
4. If a budget exists for that category and month, link the transaction to it
   (the Budget field). Budgets only count linked transactions.
5. Mark the inbox row as processed.
Never guess a transfer: ask me which account it went to.
At the end, show me what you couldn't categorise.
```

> Run the statement-sorter on the Everyday account for October.

## 4. Teach it your rules (10 min)

Answer its questions once, and make each answer permanent:

> "DEMO MART 0423" is my supermarket: make Demo Mart a payee with default category Groceries.

Next month, those lines categorise themselves.

## 5. Check the balance (5 min)

> What's the current balance of Everyday? Does it match my bank's closing balance of 1,846.20?

(A made-up figure: use your statement's.) If it doesn't match, something was missed, doubled, or entered with the wrong sign. Ask the AI to find it.

:::warning Keep money to the apps that need it
Give your finance base its own token, and only add that token to the AI apps you use for money questions. Other tokens leave the base out.
:::

## Check it worked

- Every inbox row became a transaction, or is on the "couldn't categorise" list.
- The account balance matches your bank's.
- At least three payees now have default categories.
- Expenses in budgeted categories are linked to their budget.

## Next

Now ask the questions you've been avoiding: [Budgets and money questions](/guides/budgets-and-money-questions).
