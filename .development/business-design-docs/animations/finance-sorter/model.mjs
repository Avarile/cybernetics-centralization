// The truth behind the figure: the finance-management skill's rules (references/metrics.md, D-1..D-4),
// run on a sample statement. Pure: the build and the live page use the same functions.

// The real ledger at the snapshot (fin.py breakdown all --by category, 2026-10-18): row counts only.
export const LEDGER = {
  snapshot: "2026-10-18",
  rows: 1102,
  expense: 979,
  income: 51,
  transfer: 72,
  categories: 24,
  payees: 127,
  firstDate: "2025-10-30",
  lastDate: "2026-09-18",
};

// Pockets left to right. `cost` is +1 for expense rows, -1 for refunds (D-2), 0 for the rest (D-1).
export const POCKETS = [
  { key: "income", name: "Income", cost: 0, rows: 44, categories: ["Business Income", "Client Payments", "Rental Income", "Insurance Payout"] },
  { key: "refunds", name: "Refunds", cost: -1, rows: 7, categories: ["Refunds"] },
  { key: "food", name: "Food and dining", cost: 1, rows: 684, categories: ["Food", "Dining & Takeaway"] },
  { key: "home", name: "Home and bills", cost: 1, rows: 130, categories: ["Rent & Housing", "Utilities", "Insurance", "Council & Government", "Subscriptions & Software", "Education & Childcare"] },
  { key: "goods", name: "Shopping and transport", cost: 1, rows: 132, categories: ["Shopping", "Transport", "Vehicle & Rego", "Travel & Accommodation"] },
  { key: "other", name: "People and other", cost: 1, rows: 33, categories: ["Personal Transfers", "Cash Withdrawal", "Business Expenses", "Health & Wellness", "Entertainment", "Donations"] },
  { key: "transfer", name: "Transfers", cost: 0, rows: 72, categories: [] },
  { key: "reject", name: "Uncategorised", cost: 1, rows: 0, categories: [] },
];
export const pocketOf = (key) => POCKETS.findIndex((pocket) => pocket.key === key);

// Sample payees and the Default Category each one was taught (`fin payee-default`). One has none yet.
export const PAYEES = [
  { key: "woolies", category: "Food", pocket: "food" },
  { key: "coles", category: "Food", pocket: "food" },
  { key: "ubereats", category: "Dining & Takeaway", pocket: "food" },
  { key: "landlord", category: "Rent & Housing", pocket: "home" },
  { key: "agl", category: "Utilities", pocket: "home" },
  { key: "allianz", category: "Insurance", pocket: "home" },
  { key: "cloud", category: "Subscriptions & Software", pocket: "home" },
  { key: "kmart", category: "Shopping", pocket: "goods" },
  { key: "myki", category: "Transport", pocket: "goods" },
  { key: "vicroads", category: "Vehicle & Rego", pocket: "goods" },
  { key: "family", category: "Personal Transfers", pocket: "other" },
  { key: "employer", category: "Business Income", pocket: "income" },
  { key: "client", category: "Client Payments", pocket: "income" },
  { key: "tenant", category: "Rental Income", pocket: "income" },
  { key: "newshop", category: null, pocket: null },
];
export const payeeIndex = (key) => PAYEES.findIndex((payee) => payee.key === key);

// One sample statement, in date order: [date, Type, payee or null, Amount]. Amount is always positive (schema.md).
const ROWS = [
  ["2025-10-30", "Expense", "woolies", 84.2],
  ["2025-11-03", "Income", "employer", 5200],
  ["2025-11-14", "Expense", "landlord", 603],
  ["2025-11-28", "Transfer", null, 2000],
  ["2025-12-05", "Expense", "agl", 146.5],
  ["2025-12-19", "Expense", "kmart", 64],
  ["2026-01-09", "Income", "client", 3475],
  ["2026-01-22", "Expense", "coles", 92.35],
  ["2026-02-02", "Expense", "allianz", 96.52],
  ["2026-02-17", "Expense", "family", 1500],
  ["2026-03-03", "Expense", "ubereats", 34.1],
  ["2026-03-20", "Income", "tenant", 1665.57],
  ["2026-04-07", "Expense", "myki", 50],
  ["2026-04-24", "Expense", "woolies", 118.4],
  ["2026-05-06", "Expense", "cloud", 21.84],
  ["2026-05-15", "Income", "kmart", 32],
  ["2026-05-29", "Transfer", null, 1500],
  ["2026-06-10", "Expense", "vicroads", 841],
  ["2026-06-26", "Income", "employer", 5200],
  ["2026-07-03", "Expense", "woolies", 76.9],
  ["2026-07-14", "Expense", "agl", 132.8],
  ["2026-07-25", "Expense", "newshop", 45],
  ["2026-08-01", "Income", "client", 3475],
  ["2026-08-08", "Expense", "ubereats", 27.6],
  ["2026-08-19", "Expense", "coles", 103.15],
  ["2026-08-28", "Transfer", null, 2500],
  ["2026-09-02", "Expense", "landlord", 603],
  ["2026-09-09", "Expense", "allianz", 96.52],
  ["2026-09-12", "Income", "kmart", 18.95],
  ["2026-09-18", "Expense", "woolies", 88.7],
];

// The read head: Type first, then the payee's Default Category (metrics.md, "Row roles").
export function route(type, payee) {
  if (type === "Transfer") return pocketOf("transfer"); // no category; never cost or income
  const taught = payee ? PAYEES[payeeIndex(payee)].pocket : null;
  if (type === "Income") return taught === "income" ? pocketOf("income") : pocketOf("refunds"); // income from a shop is a refund
  return taught ? pocketOf(taught) : pocketOf("reject"); // an expense with no default waits for `fin categorize`
}

export const CARDS = ROWS.map(([date, type, payee, amount], id) => ({ id, date, type, payee, amount, pocket: route(type, payee) }));

// Windows on the knob (D-3): trailing complete calendar months; MTD on its own.
export const TODAY = "2026-10-18";
const monthStart = (date, back) => {
  const [y, m] = date.split("-").map(Number);
  const index = y * 12 + (m - 1) - back;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}-01`;
};
export const WINDOWS = [
  { key: "mtd", label: "MTD", months: 0, from: monthStart(TODAY, 0), to: "2026-10-19" },
  { key: "last-month", label: "1m", months: 1, from: monthStart(TODAY, 1), to: monthStart(TODAY, 0) },
  { key: "3m", label: "3m", months: 3, from: monthStart(TODAY, 3), to: monthStart(TODAY, 0) },
  { key: "6m", label: "6m", months: 6, from: monthStart(TODAY, 6), to: monthStart(TODAY, 0) },
  { key: "12m", label: "12m", months: 12, from: monthStart(TODAY, 12), to: monthStart(TODAY, 0) },
];

const DAY = 86400000;
const days = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);

// The report: what `fin summary` / `fin cost` print for the rows sorted so far.
export function report(sorted, windowIndex) {
  const win = WINDOWS[windowIndex];
  const rows = sorted.filter((card) => card.date >= win.from && card.date < win.to);
  const byPocket = POCKETS.map(() => 0);
  for (const card of rows) byPocket[card.pocket] += card.amount;
  const expense = POCKETS.reduce((sum, pocket, index) => sum + (pocket.cost > 0 ? byPocket[index] : 0), 0);
  const refunds = byPocket[pocketOf("refunds")];
  const income = byPocket[pocketOf("income")];
  const net = expense - refunds;
  const span = win.months || days(win.from, win.to) / 30.4375;
  const last = sorted.length ? sorted[sorted.length - 1].date : null;
  const lastDay = new Date(Date.parse(win.to) - DAY).toISOString().slice(0, 10);
  return {
    window: win,
    rows: rows.length,
    byPocket,
    expense,
    refunds,
    income,
    transfers: byPocket[pocketOf("transfer")],
    net,
    perMonth: net / span,
    savings: income > 0 ? ((income - net) / income) * 100 : null,
    last,
    partial: !last || last < lastDay, // the period runs past the last transaction: understated (rule 2)
  };
}

export const money = (value) => "$" + value.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const shortDate = (date) => (date ? `${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]}` : "none");
