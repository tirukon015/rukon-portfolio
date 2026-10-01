import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-pure-function-for-preview-and-commit",
  title: "Preview and Commit From the Same Plan: Stock Transfers You Can Reverse Exactly",
  description:
    "In RPOMS one pure function plans a stock transfer: the preview shows it, the commit re-runs it, and a void inverts the frozen executed plan exactly.",
  date: "2026-10-29",
  category: "Building Real Systems",
  tags: ["Inventory", "Pure Functions", "Transactions", "TypeScript", "Business Rules"],
  contentType: "Problem/Solution",
  searchIntent: "informational",
  seoTitle: "Same Plan for Preview and Commit, and an Exact Reversal",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "stock-request-workflow-with-a-state-machine-and-event-log",
    "derived-inventory-from-a-ledger-not-a-stored-balance",
    "gapless-monthly-request-numbers-in-postgres",
    "counting-shared-packaging-consumption-across-days",
  ],
  sections: [
    {
      heading: "The problem: a preview that lies, and an undo that guesses",
      body: [
        "In RPOMS, the operations system I built for a router-refurbishment line, the Ecommerce team requests stock and an admin transfers it to them. Before confirming, the admin sees a preview: how many routers, chargers and small boxes will leave, and which stock figures will move. Later, a transfer may be voided, and the stock has to come back.",
        "Both steps have a classic failure. If the preview and the commit are computed by different code, sooner or later the screen promises one thing and the database does another. If the reversal is computed from today's rules instead of from what actually happened, a rule change between transfer and void restores the wrong amounts. This article describes the structure that removes both problems, for anyone building an operation that previews a change and later undoes it.",
      ],
    },
    {
      heading: "One pure function produces the plan",
      body: [
        "`planDeduction(request, source, stock)` takes the request, the stock source the admin picked and a snapshot of stock, and returns a `DeductionPlan`. The plan contains the signed changes to raw inventory, the per-model writes, the change to each packed-stock figure, whether the transfer is possible, and, if not, the reasons in words. The function reads nothing and writes nothing.",
        {
          type: "flow",
          steps: ["Snapshot stock", "planDeduction()", "Preview renders the plan", "Admin confirms", "Transaction takes its own snapshot", "planDeduction() again", "Execute the plan", "Freeze the executed plan in the event row"],
          caption: "The same function runs twice. The browser's copy is never trusted.",
        },
        "The preview renders the plan. The commit does not accept the plan the browser was shown. Inside the transaction it takes its own snapshot and calls the same function again, so the preview is a display, never a reservation. If stock moved in between, the commit sees it and refuses with the plan's own problem messages. Because both calls use the same pure function, they cannot use different arithmetic.",
        "The client also never sends accessory quantities. A request states a type (routers, or boxes of ten) and a quantity. The server derives the router count and one charger and one small box per router from that.",
      ],
    },
    {
      heading: "The business rule is the shape of the code",
      body: [
        "Stock can come from three places, and the difference between them is the whole double-counting rule:",
        {
          type: "table",
          head: ["Source", "What it is", "What the plan moves"],
          rows: [
            ["ERTH Inventory", "Unpacked routers not in any box", "Chargers and small boxes off raw stock. No routers: they were already consumed when they were accepted."],
            ["ERTH Storeroom", "Packed stock at ERTH", "The packed-stock figures only. Raw deltas are all zero."],
            ["BBTech Storeroom", "Packed stock at BBTech", "As above, for BBTech."],
          ],
        },
        "Routers leave raw stock when the daily report records them as accepted. Chargers and small boxes leave when routers are packed. So an unpacked router transferred from ERTH Inventory takes its accessories with it for the first time, while packed stock already paid for everything when it was packed. Taking any of it off raw stock again would count the same physical unit twice.",
        "The code expresses that as three arms, and the storeroom arms simply have no raw deltas: `raw` is all zeroes and `variantWrites` is empty. The executor has nothing to skip and no condition to get the wrong way round, because the absence is in the plan itself.",
        {
          type: "code",
          lang: "ts",
          code: `if (source === "ERTH_INVENTORY") {
  return { ...base, raw: { router: 0, charger: -n, smallBox: -n }, /* ... */ };
}
// Both storerooms: consumed when packed, so no raw movement at all.
return {
  ...base,
  raw: { router: 0, charger: 0, smallBox: 0 },
  variantWrites: [],
  erthStoreroom: source === "ERTH_STOREROOM" ? -n : 0,
  bbtechStoreroom: source === "BBTECH_STOREROOM" ? -n : 0,
  // ...
};`,
          caption: "Simplified from planDeduction() in src/lib/ecommerce.ts.",
        },
        "Each source also has a short explanation shown on screen next to it, because picking the wrong source is the one mistake the code cannot catch. The planner checks what it can: enough chargers and small boxes for ERTH Inventory, and for a storeroom, enough routers of that model as well as in total. It will not attribute a charger to a particular variant when more than one could apply, because nothing in RPOMS maps a charger rating to a router model. Instead it reduces the item total and leaves the breakdown alone, the same rule the daily report uses in [Stock You Never Store](/blog/derived-inventory-from-a-ledger-not-a-stored-balance).",
      ],
    },
    {
      heading: "Freeze what was executed, then invert it",
      body: [
        "When the transfer commits, the executed plan is stored on the TRANSFERRED event row. A void builds its reversal from that frozen copy, never by recomputing from the current rules:",
        {
          type: "code",
          lang: "ts",
          code: `export function reversePlan(executed: EcommerceEventDetail): DeductionPlan {
  const raw = executed.raw ?? { router: 0, charger: 0, smallBox: 0 };
  const flip = (n: number | undefined) => (n ? -n : 0);
  return {
    // ...
    raw: { router: flip(raw.router), charger: flip(raw.charger), smallBox: flip(raw.smallBox) },
    variantWrites: (executed.variantWrites ?? []).map((w) => ({ ...w, delta: -w.delta })),
    erthStoreroom: flip(executed.erthStoreroom),
    // ...
  };
}`,
        },
        "That is what makes a reversal restore exactly what the transfer took and nothing else. A storeroom transfer wrote no raw movement, so its reversal writes none either. An ERTH Inventory transfer took chargers and small boxes, so exactly those come back, as ledger rows labelled with the request number and the word reversal. If the rules for what a transfer deducts change next month, voids of older transfers still undo what those transfers actually did.",
      ],
    },
    {
      heading: "What keeps it honest under concurrency",
      body: [
        "Two admins transferring against the same storeroom could each read the same availability and both commit. Every transfer therefore first locks one shared row, `lock:transfer`, with `SELECT … FOR UPDATE`, so transfers run one at a time. RPOMS runs behind a transaction pooler, where session-level advisory locks are not available, which is why the lock is an ordinary row. Locking only the request being transferred would not work, because two different requests draw on the same stock. Transfers happen a handful of times a week, so serialising them costs nothing noticeable. The same row-lock idiom issues request numbers, described in [Monthly Request Numbers That Never Skip](/blog/gapless-monthly-request-numbers-in-postgres).",
      ],
    },
    {
      heading: "The pattern",
      body: [
        {
          type: "list",
          items: [
            "Compute the change as data with a pure function, and render the preview from it.",
            "Re-run that function inside the commit against the transaction's own snapshot. The preview is not a reservation.",
            "Let the structure of the plan encode the rule. A case that must not move a figure should have no delta for it, not a flag telling the executor to skip it.",
            "Store the executed plan, and build reversals by inverting that stored plan, never from current rules.",
            "Derive quantities on the server from what the user actually decides.",
          ],
        },
        "This is part of the Ecommerce module of [RPOMS](/work/rpoms), which the Ecommerce team has been using for real requests since September 2026.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
