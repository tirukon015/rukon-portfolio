import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "remediating-a-code-audit-with-p0-findings",
  title: "Working Through a 44-Finding Code Audit, Six of Them P0, Without Losing Data",
  description:
    "How I worked through a forensic audit of a live operations system: the four root causes behind 44 findings, a second pass that caught my own regressions, and what I chose not to change.",
  date: "2026-11-25",
  category: "Developer Journey",
  tags: ["Code Audit", "Remediation", "PostgreSQL", "Security", "Technical Debt", "Next.js"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "Remediating a Code Audit With Six P0 Findings",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "optimistic-concurrency-postgres-upsert-revision-409",
    "testing-every-nextjs-api-route-refuses-without-session",
    "data-preservation-check-before-production-release",
    "schema-setup-on-cold-start-without-a-race",
  ],
  sections: [
    {
      heading: "An audit of a system people were using",
      body: [
        "On 3 September 2026, a read-only forensic audit of RPOMS, the operations system I built for a router-refurbishment line, recorded 44 findings across 14 areas: 6 rated P0, 14 P1, 15 P2 and 9 P3. Its opening line was fair: the system was carefully built, and what was missing was not care but atomicity, a delivered state, and a save that did not cost thirty round trips. A second, launch-readiness audit followed on 23 September.",
        "This is not a list of fixes. It is how I worked through them on a system whose Daily Production Report was in daily use, where the one rule above all others was that no business data could be lost. If you have just received an audit and are deciding where to start, this is the approach that worked.",
      ],
    },
    {
      heading: "Group findings by root cause, not by section",
      body: [
        "Forty-four findings read like forty-four jobs. Grouped by cause, nearly all of them were four patterns, and each pattern had one kind of fix:",
        {
          type: "table",
          head: ["Pattern", "Example", "Kind of fix"],
          rows: [
            ["The client was trusted to describe its own request", "a flag in the request body switched off two write protections", "the server decides, from evidence it checks itself"],
            ["Absence and failure were the same value", "a timed-out read returned `[]`, and a published figure collapsed to today's alone", "a failed read raises or returns a distinct value"],
            ["One operation was several unbound statements", "packing a box could assign the routers and never record the date", "short transactions, or a single statement"],
            ["Work was measured in rows fetched", "fetching up to 20,000 rows to return one count", "ask the database the question: an aggregate"],
          ],
        },
        "Seeing the patterns changed the work. Instead of patching the one place the audit named, I searched for every other place with the same shape. It also made the reasoning reviewable: each fix could be judged against a principle, not just against a symptom.",
      ],
    },
    {
      heading: "Security and integrity first, then concurrency",
      body: [
        "The first commit took the four P0s of one shape: something the client said was believed, or something that could not be checked was waved through. A worksheet flag in the save payload no longer grants anything unless the server finds the sheet itself. The session cookie stopped being a constant per role. A failed read stopped being published as a wrong batch total. And the schema-build claim stopped announcing itself finished before it started.",
        "Concurrency came next. Two admins on the same day had silently overwritten each other; each save now carries the row's revision and a stale one gets a 409, described in [Optimistic Concurrency for a Postgres Upsert](/blog/optimistic-concurrency-postgres-upsert-revision-409). The one destructive statement in the codebase, a box rename that deleted the destination row after checking only that it held no routers, became a transaction that refuses a destination carrying any information of its own. Transactions were kept deliberately short, two statements against keyed rows, because the pool is ten connections behind a transaction-mode pooler and a held connection is a held slot.",
      ],
    },
    {
      heading: "Counted, not timed",
      body: [
        "There was no database connection string in the environment where the remediation was done, so the app ran on its file store. A stopwatch against a file store measures nothing that matters, so the performance work was reported as counts from the code, with the procedure to turn them into timings on a real deployment written beside them:",
        {
          type: "table",
          head: ["Path", "Before", "After"],
          rows: [
            ["Save a report: server renders of `/admin`", "2", "1"],
            ["Close a 200-serial box with issues: round trips", "up to 402", "3"],
            ["Next box number: rows fetched", "every box ever used", "1"],
            ["Import 20,000 routers", "fails (bind-parameter ceiling)", "10 chunked statements"],
          ],
        },
        "The honest limitation went in the report in plain words: nothing in that first pass had been executed against a real PostgreSQL. The SQL was reviewed and type-checked, but the transactions and the guarded upsert's conflict branch had not been run. That limitation later bit, in the form of a timestamp-precision bug in the guard, and it is why the project now tests SQL against an in-process PostgreSQL.",
      ],
    },
    {
      heading: "Review your own remediation as hard as the original",
      body: [
        "After the first pass, I reviewed the branch as if it were someone else's. It found six things, three of them mine:",
        {
          type: "list",
          items: [
            "An incomplete fix: packing was made atomic in the interactive screen and left as two separate statements in the bulk import path, which does the same thing.",
            "A regression of the exact class the branch existed to remove: a worksheet dated for a different day was refused, and the route carried on and reported success, with the admin looking at one set of figures and having stored another.",
            "A second regression: moving a settings merge into SQL removed an old `try/catch` that had quietly repaired an unparseable value. It now falls back to exactly what the old path produced, and logs it.",
          ],
        },
        "Later, a manual probe of the built app found five API reads open to anyone, one of them mine from two commits earlier. None of these would have been found by re-reading the diff with the intent of approving it.",
      ],
    },
    {
      heading: "What I deliberately did not change",
      body: [
        "The audit ended with a list of things that must not change, and the most useful part of remediation was respecting it. Stock is derived from history rather than stored as a balance, so editing or deleting a day needs no reversal. A report read raises rather than returning null, so a blank form can never be saved over a real day. The production write lock defaults to on. These looked like candidates for simplification and were load-bearing.",
        "Two findings were handed back as business decisions rather than engineering ones. Whether \"Ready for Delivery\" should come down when a delivery leaves depends on which warehouse the delivered stock came from, which nothing recorded; guessing would move three published figures at once. And two hand counts of the same stock disagreed; settling that needs a re-count, not a code change. Other items were left open and named, such as a box-number allocation that is still check-then-act, each with the reason it was left.",
        {
          type: "callout",
          label: "How it ended",
          text: "The remediation, the second audit's fixes, the test suite, CI and later features were released to production on 28 September 2026 as one verified branch, with 958 tests passing, a whole-database preservation test and a written release plan.",
        },
        "The system is in the [RPOMS case study](/work/rpoms). The test that now guards every route came out of this work: [The Test That Calls Every Next.js API Route With No Session](/blog/testing-every-nextjs-api-route-refuses-without-session).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
