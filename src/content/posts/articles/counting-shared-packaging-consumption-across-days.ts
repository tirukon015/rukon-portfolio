import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "counting-shared-packaging-consumption-across-days",
  title: "When Two Days Fill One Box: Counting Shared Consumables Without Double-Counting",
  description:
    "A packaging box filled across two days must be charged once. How RPOMS derives each day's big-box usage from a running total, and how the rule evolved.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Inventory", "Business Rules", "TypeScript", "Operations", "Data Modelling"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Counting Shared Consumables Without Double-Counting",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "derived-inventory-from-a-ledger-not-a-stored-balance",
    "one-pure-function-for-preview-and-commit",
    "blank-is-not-zero-production-report-inputs",
  ],
  sections: [
    {
      heading: "The problem: one box, two days",
      body: [
        "Some consumables map one to one onto the work. In RPOMS, the operations system I built for a router-refurbishment line, every router packed uses one charger, one LAN cable and one small carton, so a day that packs 150 routers uses 150 of each. The big packaging box, the carton that goes out on the delivery, does not. It holds several routers, and a box started on Monday afternoon may be finished on Tuesday morning.",
        "If each day's usage is worked out from that day's figure alone, the shared box is either counted twice or not at all, depending on how you round. Over weeks the stock figure drifts away from the shelf. This article is about deriving a per-day figure for a consumable that is shared across days, for anyone whose inventory has the same shape: pallets, cartons, rolls or drums filled across shifts.",
      ],
    },
    {
      heading: "The rule: one per ten, plus one once seven remain",
      body: [
        "A big box holds ten routers. A box that is nearly full has been opened, filled and sent, whatever the count says. A box with only a router or two in it will be finished by the next day's work, and charging a box for it now would charge the same box again when that day comes. So the rule is: one box per complete ten, plus one more when the remainder has reached seven.",
        {
          type: "code",
          lang: "ts",
          code: `const BIG_BOX_UNITS = 10;
const BIG_BOX_PART_THRESHOLD = 7;

export function bigBoxesFor(packedUnits: number): number {
  const units = wholeUnits(packedUnits);
  return (
    Math.floor(units / BIG_BOX_UNITS) +
    (units % BIG_BOX_UNITS >= BIG_BOX_PART_THRESHOLD ? 1 : 0)
  );
}`,
          caption: "src/lib/big-box.ts. 14 and 15 draw one box; 17 draws two.",
        },
        "It is deliberately not `Math.ceil`, which would take a box for a remainder of one, and not rounding, which would take one at five. The threshold is a judgement about when a part-filled box has actually left the shelf. It sits in a named constant with a comment explaining it, so the next person to change it knows what they are changing.",
      ],
    },
    {
      heading: "Apply it to the running total, then take the difference",
      body: [
        "The important part is where the rule is applied. It is never applied to one day on its own. It is applied to the cumulative total, and a single day's usage is how much that day moved the total:",
        {
          type: "code",
          lang: "ts",
          code: `export function bigBoxesForDay(packedOtherDays: number, packedThisDay: number): number {
  const other = wholeUnits(packedOtherDays);
  const today = wholeUnits(packedThisDay);
  return bigBoxesFor(other + today) - bigBoxesFor(other);
}`,
        },
        "Take two days of 6 and 8. On their own, 6 draws no box and 8 draws one. Cumulatively, 6 draws none and 14 draws one, so Monday is charged 0 and Tuesday is charged 1. The box both days filled is counted once, by the day that completed it. Summing the per-day figures always equals the rule applied to the total, which is the property that stops drift.",
        "`wholeUnits` floors the input and treats anything negative, missing or non-numeric as zero. Stock is read from whatever is on file, including days saved before validation existed and a figure the admin is still typing into the form. Without that guard, subtracting two totals could produce a day that returned boxes to the shelf.",
      ],
    },
    {
      heading: "One copy of the arithmetic, on both sides",
      body: [
        "Before a day's report is published, a confirmation dialog tells the admin what stock the day will draw, including big boxes, even when the answer is none. The dashboard shows the same figure after the save. If the dialog and the dashboard each had their own copy of the arithmetic, they would eventually disagree about the same day. So the rule lives in one module that is deliberately not server-only, and both the report form and the server-side stock calculation call it.",
      ],
    },
    {
      heading: "How the rule got here",
      body: [
        "The rule went through three versions between 28 July and 31 August 2026, and each earlier one failed in a way worth knowing about.",
        {
          type: "table",
          head: ["Version", "Method", "What went wrong"],
          rows: [
            ["28 Jul 2026 (first)", "Packed routers divided by a per-box figure kept in settings", "A second place holding a number the Pack screen already owned. Eight boxes closed with six routers each is eight boxes, but 48 ÷ 8 gives six."],
            ["28 Jul 2026 (same day)", "Count boxes actually closed on the Pack screen", "Correct while that screen is in use. When it is not, nothing is deducted and the figure sits still while boxes leave the building."],
            ["31 Aug 2026", "A Super Admin chooses: closed boxes, or derived from packaging (the default)", "The derived rule needed a baseline date, and the first cut read \"no baseline yet\" as \"derive nothing\", so today drew zero boxes too."],
          ],
        },
        "Both readings are derived at read time from records that already exist, the packed date on each box and the packaging figure on each report. Switching method rewrites no history, and switching back restores the previous figure exactly. Exactly one method runs: a single if/else assigns the figure, because adding the two would count every delivery box twice.",
        "The baseline exists because box stock began mid-operation with an opening count. Packing before the baseline keeps the consumption actually recorded for it. Re-billing those days under the new rule would have produced a deficit nobody saw on the floor. The last fix made a missing baseline stand in as the current day, read on the server and never accepted from the browser, and stamps it permanently the first time a report is filed. After that, today derives normally, and editing a day replaces its figure rather than adding to it: 200 packed and then corrected to 110 draws 11 boxes, not 31.",
      ],
    },
    {
      heading: "The general pattern",
      body: [
        {
          type: "list",
          items: [
            "For a consumable shared across periods, apply the rule to the running total and charge each period the difference.",
            "Choose the rounding rule on purpose. Name the threshold and write down why.",
            "Floor bad inputs before subtracting totals.",
            "Put the arithmetic in one module that both the preview and the stored figure call.",
            "When you change how something is counted mid-operation, keep the recorded history up to a baseline and apply the new rule only after it.",
          ],
        },
        "This sits on top of the derived stock model described in [Stock You Never Store](/blog/derived-inventory-from-a-ledger-not-a-stored-balance), and is part of [RPOMS](/work/rpoms). The daily report and its stock deduction are live in production; the Pack screen that records closed boxes is complete but behind the production write lock. When the derived method was made the default, the Pack screen was not in use, and a figure derived a little roughly is better than one that silently stops moving.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
