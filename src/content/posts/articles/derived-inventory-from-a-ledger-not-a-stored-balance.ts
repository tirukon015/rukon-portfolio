import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "derived-inventory-from-a-ledger-not-a-stored-balance",
  title: "Stock You Never Store: Deriving Inventory From a Ledger and the Day's Report",
  description:
    "Why RPOMS never stores a stock balance: remaining is worked out at read time from a ledger and the daily report, so edits need no reversal and a figure can be traced.",
  date: "2026-10-01",
  category: "Building Real Systems",
  tags: ["Inventory", "Ledger", "Data Modelling", "TypeScript", "Operations"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Derived Inventory From a Ledger, Not a Stored Balance",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "counting-shared-packaging-consumption-across-days",
    "common-problems-manual-production-tracking",
    "one-pure-function-for-preview-and-commit",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "The problem with a stored balance",
      body: [
        "The obvious way to track stock is a column called `balance` that you subtract from whenever something is used. It works until someone edits yesterday's report, deletes a report entered twice, or saves the same day again with a corrected figure. Each of those needs a matching reversal of the balance, and the day one reversal is missed, the number is wrong and nothing records why. That is exactly how the spreadsheets RPOMS replaced drifted.",
        "RPOMS is the operations system I built for a router-refurbishment line. It keeps stock of routers, chargers, LAN cables and two sizes of box, and it never stores any of them as a balance. This article explains how that works, for anyone designing inventory for an operation where the people entering figures will correct them after the fact.",
      ],
    },
    {
      heading: "remaining = booked in − consumed, computed when it is read",
      body: [
        "There are two kinds of record. The ledger holds everything that added stock or corrected it: a batch booked in against a model, opening stock, a manual adjustment, and the rows an Ecommerce transfer writes. The daily production report holds what the line did that day. Remaining stock is worked out from the two every time it is read.",
        {
          type: "table",
          head: ["Item", "Consumed by a day's report"],
          rows: [
            ["Routers", "accepted + retired"],
            ["Chargers", "packaged"],
            ["LAN cables", "packaged"],
            ["Small boxes (the router's own carton)", "packaged, counted from the day box tracking began"],
            ["Big packaging boxes", "one method chosen by a Super Admin (see below)"],
          ],
          caption: "The consumption rules, as in WORKFLOWS.md and src/lib/inventory.ts.",
        },
        {
          type: "code",
          lang: "ts",
          code: `export function consumedByReport(report) {
  const packed = report.packaging ?? 0;
  return {
    router: (report.accepted ?? 0) + (report.rejected ?? 0),
    charger: packed,
    lan: packed,
    smallBox: 0, // settled across all reports, from a start date
    bigBox: 0,   // settled by the chosen method
  };
}`,
          caption: "Per-report consumption. The stored field for retired routers is still called rejected.",
        },
        "The rule applies at the model level too. Booking a batch in raises that model's received total and writes a ledger row in the same transaction. What each report drew from each model is subtracted when the figure is read. Nothing is written back when a report is saved. So re-saving a day, correcting a figure or deleting a report needs no reversal: the arithmetic simply runs again on what the reports now say.",
      ],
    },
    {
      heading: "Always the whole history, and never a silent zero",
      body: [
        "Two rules keep the derivation honest.",
        "First, it always reads every report ever filed. Reading only the last 30 or 90 days looks like an obvious optimisation, but it drops the consumption that fell outside the window and leaves remaining stock reading high. Nothing on screen would say which days were counted. The code comment on `getConsumption()` states this rule so nobody adds a window later.",
        "Second, \"nothing there\" and \"could not read\" are different answers. The admin screens can fall back to an empty list, but the published dashboard uses separate reads that return an explicit `UNREAD` value. A ledger that did not answer in time must never render as a stock figure of zero, because zero is a believable number and people would act on it.",
      ],
    },
    {
      heading: "Attributing a day to a model without asking",
      body: [
        "Item totals and per-model totals have to agree. At first a day's usage came off a model only if whoever filed the report ticked which model it was. One evening nobody did. The router total fell by that day's 92 units while the model they came from stayed where it was, so the item figure and the model figure disagreed, with nothing on screen to show it.",
        "The fix was not a stricter form. If only one model of an item has stock left, the day must have come from that model, so the server attributes it without asking. With two or more models in stock there is no way to know how the day divided between them, and a guess would put a number in the record that nobody entered, so the report still has to state the split and the form says so when it has not. Anything the report did name is kept exactly as given: this only fills silence, it never overrules a choice. If the attribution cannot run, the report is still filed, because an unattributed day can be corrected and a day that would not save cannot.",
        {
          type: "code",
          lang: "ts",
          code: `const stocked = variantLevels.filter(
  (l) => l.variant.item === item && l.remaining > 0,
);
if (stocked.length !== 1) continue; // two or more: do not guess`,
          caption: "The core of autoAttributeAssets().",
        },
      ],
    },
    {
      heading: "Starting mid-operation: opening figures and start dates",
      body: [
        "Box stock was added to the system after thousands of routers had already been packed. Counting all of that history against boxes would have shown an enormous deficit on the first day. So box stock has an opening figure on a start date, 28 July 2026, and only packing from that date on draws boxes down. It is the same derived model with a lower limit: the history before the start date is still there and simply not counted for that item.",
        "Big packaging boxes needed more than that, because a big box is shared by several days' output. Counting those without charging the same box to two days needed a separate rule, applied to the running total rather than to each day on its own.",
      ],
    },
    {
      heading: "What derived stock costs, and why it is worth it",
      body: [
        "The cost is read-time work: every stock read walks every report. An operation that files one report per day adds one row a day, and each row is reduced to the few figures consumption needs, so the cost grows slowly. The benefit is that every figure can be explained. When a number looks wrong, you can list the ledger rows and the reports that produced it and find the day where it happened, which is the whole point of replacing a spreadsheet.",
        {
          type: "list",
          items: [
            "Store events, not totals. Receipts and corrections go in a ledger, and usage comes from the record of the work itself.",
            "Derive at read time and write nothing back, so corrections need no reversal.",
            "Read the full history, and make a failed read visible rather than zero.",
            "Fill in only what can be known for certain, and never invent a split.",
            "Use a start date and an opening figure when you begin tracking something mid-operation.",
          ],
        },
        "The inventory and daily-report modules are part of the [RPOMS case study](/work/rpoms). The daily report and its stock deduction are live in production. The inventory management screens are complete but held behind the production write lock. The earlier article on [manual production tracking](/blog/common-problems-manual-production-tracking) describes the spreadsheet failure modes this design removes.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
