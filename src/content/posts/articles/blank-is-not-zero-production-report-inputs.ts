import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "blank-is-not-zero-production-report-inputs",
  title: "Blank Is Not Zero: Small Input Decisions That Decide Whether a Report Is Right",
  description:
    "Three bugs from RPOMS's daily report: a target of 0 read as unset, a running output collapsed into one number, and one worker split by capitalisation.",
  date: "2026-12-03",
  category: "UI/UX & Product",
  tags: ["Forms", "Data Entry", "Validation", "TypeScript", "Operations"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Blank vs Zero and Other Report Form Decisions",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "comparison-baselines-for-an-operations-dashboard",
    "derived-inventory-from-a-ledger-not-a-stored-balance",
    "optimistic-concurrency-postgres-upsert-revision-409",
    "why-internal-software-needs-good-ux",
  ],
  sections: [
    {
      heading: "The problem: forms that lose meaning on the way in",
      body: [
        "The Daily Production Report in RPOMS, the operations system I built for a router-refurbishment line, is filled in every working day. It records, per person, how many routers they accepted, cleaned and packaged, and saving it deducts stock in the same step. It is live in production, and the workforce figures are how people's output is judged against their targets.",
        "Most of the bugs that mattered in this form were not crashes. They were places where the form accepted what someone meant and then stored something slightly different. This article walks through three of them and the general rule each one taught. It is for anyone building data-entry screens whose numbers are later used to judge people or move stock.",
      ],
    },
    {
      heading: "A target of 0 is not a missing target",
      body: [
        "Each department has a per-person daily target, and a row can override it for one person on one day, for example someone moved to other work and given no target. The code that applied the override read:",
        {
          type: "code",
          lang: "ts",
          code: `const target = own > 0 ? own : departmentTarget; // the bug`,
        },
        "The parser reads an empty field and \"0\" both as 0, so after parsing nothing could tell \"nobody set a target\" from \"the target is nothing\". A worker deliberately given no target was judged against the department's figure and shown as failing by exactly the amount nobody had asked of them. The department totals were wrong by the same amount.",
        "The fix makes the decision on the text, before it is parsed:",
        {
          type: "code",
          lang: "ts",
          code: `function resolvedTarget(row: WorkforceRow): number {
  const ownText = (row.target ?? "").trim();
  const own = ownText === "" ? null : parseOutput(ownText);
  return own === null ? targetPerPerson : Math.max(own, 0);
}`,
          caption: "src/lib/dashboard.ts. Blank falls back; 0 stands; a negative is floored at 0.",
        },
        "The rule: if blank and zero mean different things to the user, keep them different until the last possible moment. Parsing to a number is where that distinction usually dies.",
      ],
    },
    {
      heading: "Store the working, not just the answer",
      body: [
        "A worker's output builds up through the day: 56 in the morning, 10 after lunch, 5 at the end. The Output field always accepted `56+10+5` and read it as 71. But every path collapsed the sum as soon as it could. A + button appended a number and wrote back the total. Fixing that on screen was not enough: saving ran every output through the evaluator and stored only the total, so `56+13+5` was filed as `74`. The terms survived typing and died at the one moment they had to last.",
        "Once collapsed, a wrong entry could only be argued about, never found. Now the terms are stored as they stand, normalised only for spacing, and each row has a History control that lists the terms with the total beneath. Any entry can be corrected or removed, and the total follows.",
        "No column, table or migration was needed, because the terms are the string that was always stored. Every reader downstream still goes through the same evaluator and sees one number, so the dashboard and the employee figures could not tell the difference. The term-editing logic is a pure module with no React in it, because a running total people are judged on should be testable without clicking. A zero or unreadable amount appends nothing, so a stray Enter cannot add a phantom entry, and an edit to an entry that no longer exists does nothing rather than appending.",
      ],
    },
    {
      heading: "One person, however their name is typed",
      body: [
        "The same worker is written \"ALEX\" one day and \"Alex\" the next. Treated as two names, one person's output is split across two lines of the ranking and neither looks right. Every place that groups, matches or lists a name now goes through one module: the comparison key trims, lower-cases and collapses spaces, and the spelling shown is the one the worker is recorded under most often, so the screen uses a name the office already uses rather than an invented capitalisation. That module is shared by the server and the admin screens, so both group people the same way.",
        "Matching by name is still a compromise. Linking workforce rows to employees by id is on the backlog. Until then, one normalisation function used everywhere is the next best thing.",
      ],
    },
    {
      heading: "Zero is also not \"first day\"",
      body: [
        "The same distinction showed up in batch progress. Completed is the batch's total so far plus today's packaging, and routers finished beyond a batch's target carry into the next batch. Whether today is the first day of its batch is decided by whether an earlier report exists in that batch, not by whether its figure happened to be zero. A batch that missed its target hands over nothing, not a debt.",
        {
          type: "code",
          lang: "ts",
          code: `const own = completedEarlierInBatch(prior, batchNumber, date); // null = first day
if (own !== null) return own;
return carryOverFromPreviousBatch(prior, batchNumber, date);   // overflow, never negative`,
        },
      ],
    },
    {
      heading: "Rules for data-entry forms that matter",
      body: [
        {
          type: "list",
          items: [
            "Represent \"not set\" explicitly. Do not let a parser turn blank into zero before the logic that cares has run.",
            "Keep the user's working when it fits in the value you already store. It costs nothing and makes every figure checkable.",
            "Find every path that rewrites a value (blur, submit, save, import) and test the round trip, not just the input.",
            "Normalise identities like names in one shared function, and display the most-used spelling.",
            "Decide \"first\" by whether something exists, not by whether a number is zero.",
          ],
        },
        "The server also enforces limits on what a plain admin can change. Batch and target are frozen, only the two most recent days can be reopened, existing outputs can only grow, notes are write-once, and the retired figure can be corrected at most twice. Concurrent saves are refused when stale, as described in [optimistic concurrency with a revision check](/blog/optimistic-concurrency-postgres-upsert-revision-409). How the saved figures become stock is in [Stock You Never Store](/blog/derived-inventory-from-a-ledger-not-a-stored-balance). The report is part of [RPOMS](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
