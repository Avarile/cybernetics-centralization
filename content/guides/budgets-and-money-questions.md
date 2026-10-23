---
title: "Budgets and the money questions you avoid"
seoTitle: "Monthly budgets and money questions answered by AI"
dek: "Set a monthly budget per category, let the table work out what's spent and what's left, and ask your money questions out loud instead of opening a spreadsheet."
order: 13
time: "20 min"
personas: freelancer, student, founder
modules: data
packs: finance
updated: 2026-10-23
draft: false
---

Once your transactions are categorised, money questions take one sentence. Budgets turn "am I spending too much?" into a number.

## What you need

- The **Finance** pack with the **Budgets** extra table, and at least one month of categorised transactions: [Import bank statements](/guides/categorise-bank-statements).

## How budgets work

Each `finance_Budgets` row is one category for one month: `Month`, `Planned Amount` and `Category` (`Scope` comes from the category). The table calculates the rest from the transactions **linked to that budget** through their `Budget` field:

| Field | Meaning |
|---|---|
| `Actual Spent` | The total of the transactions linked to this budget |
| `Variance` | Planned minus actual. Negative means over |
| `% Used` | How much of the plan is gone |

## 1. Set two budgets, not twenty (5 min)

Start with the categories you actually worry about. Made-up example:

> Create budgets for November: Eating out 300, Groceries 600. Then link November's existing transactions in those categories to their budget.

:::warning A budget only counts what's linked to it
`Actual Spent` adds up the transactions whose `Budget` field points at that budget row. Unlinked transactions don't count, so a new budget shows 0 until you link them. The statement-sorter recipe in the [previous guide](/guides/categorise-bank-statements) links new ones as it goes.
:::

## 2. Ask the questions (10 min)

> How much did I spend on eating out in the last six months, month by month? Which months went over budget?

> What are my five biggest payees this quarter?

> Which subscriptions did I pay for in October, and what do they add up to over a year?

> How does this month compare with last month, by category?

The answers come from your transactions, not estimates. Ask "which transactions is that?" if a number surprises you.

## 3. Make it a habit (5 min)

Add one line to your [weekly review](/guides/weekly-review) recipe:

```text
Include each budget's % Used for this month, and flag any category over 80%.
```

At the end of each month, copy the budgets forward and adjust:

> Copy November's budgets to December. Raise Eating out to 350; I was over three months in a row.

December's transactions then link to December's budgets as they're sorted.

## Check it worked

- Each budget shows a real `Actual Spent`, not 0.
- You got a month-by-month answer without opening a spreadsheet.
- The weekly review now flags categories that are running hot.

## Next

Put an agent on the recurring work: [Build a custom agent with skills](/guides/build-a-custom-agent).
