import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "optimistic-concurrency-postgres-upsert-revision-409",
  title: "Optimistic Concurrency for a Postgres Upsert, Using the Row's Own updated_at",
  description:
    "Two admins saving the same day meant the second silently replaced the first. One guarded INSERT ... ON CONFLICT statement and a 409 fixed it, and two bugs followed.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "Concurrency", "Optimistic Locking", "postgres.js", "Next.js", "API Design"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Optimistic Locking on a Postgres Upsert (HTTP 409)",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "postgres-js-timestamptz-microseconds-lost-in-binding",
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "remediating-a-code-audit-with-p0-findings",
    "one-storage-interface-three-backends",
  ],
  sections: [
    {
      heading: "The lost update nobody saw",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, keeps one Daily Production Report per date. Saving it was an upsert keyed on the date with no precondition. Two admins could open the same day, each compute their figures from what they had read, and each write. The second write replaced the first outright. There was no error, no warning and nothing in any log. One admin's afternoon was simply not there, and for a super admin, who is not bound by the add-only rules on workforce rows, the whole row went.",
        "A read-only audit of the codebase in September 2026 listed it as finding CONC-01. This article is for anyone with a \"save this record\" endpoint that two people can hit at once, and a database that will happily accept both.",
      ],
    },
    {
      heading: "Use a revision the row already has",
      body: [
        "The report table already had an `updated_at timestamptz` column. It was written on every save and never read. That makes it a free concurrency token: when the form loads a report, it also receives `updated_at` as text, and it sends that value back as `revision` when it saves.",
        "The save then writes only if that value is still the one in the row. If somebody else saved in between, `updated_at` has moved and the write does nothing. A missing revision means \"I saw no report for this day\", so two admins creating the same new day also conflict rather than race.",
        {
          type: "flow",
          steps: [
            "Load the day, including updated_at as the revision",
            "Admin edits",
            "POST with the revision",
            "Upsert only if updated_at still equals the revision",
            "Row returned: saved. No row: 409, reload",
          ],
        },
      ],
    },
    {
      heading: "One statement: INSERT ... ON CONFLICT DO UPDATE ... WHERE",
      body: [
        "PostgreSQL lets an upsert's update branch carry its own `WHERE`. If the condition is false, the conflicting row is left alone and `RETURNING` returns nothing. That gives a precondition and a write in a single statement, which is atomic without an explicit transaction:",
        {
          type: "code",
          lang: "sql",
          code: `INSERT INTO reports (report_date, ..., updated_at)
VALUES ($date, ..., now())
ON CONFLICT (report_date) DO UPDATE SET
  ...,
  updated_at = now()
WHERE reports.updated_at IS NOT DISTINCT FROM $revision::text::timestamptz
RETURNING report_date`,
          caption: "Simplified from the RPOMS store. Zero rows back means the precondition failed.",
        },
        "Both halves matter. On a brand-new date there is no conflict, so the `INSERT` runs and the `WHERE` is never evaluated. On an existing date, the update runs only when the revision still matches. The store reports `saved` when a row came back and `conflict` when none did.",
        "I considered wrapping this in a transaction together with two related settings writes (a batch baseline stamp and a target override) and decided against it. Both already tolerate failing on their own. Threading a transaction handle through the settings module would hold a connection, from a pool of ten behind a transaction-mode pooler, across three round trips to protect a state nothing reads as inconsistent.",
      ],
    },
    {
      heading: "Answer with 409 and tell the person what to do",
      body: [
        "A conflict is not a server failure, and retrying the same payload would only overwrite the same work again. The route answers 409 with a message the form shows as it is:",
        {
          type: "code",
          lang: "ts",
          code: `return NextResponse.json(
  {
    ok: false,
    error:
      "Someone else saved this day while you were working on it. " +
      "Reload the page to see their figures, then re-enter yours.",
  },
  { status: 409 },
);`,
        },
        "It is deliberately not 503. A 503 means \"something is broken, try again\", and that is a separate path: when a check the save depends on could not be read at all, the route refuses with 503 instead of guessing.",
      ],
    },
    {
      heading: "Bug one: a NULL updated_at made a day unsaveable",
      body: [
        "The guard shipped with `=` in the predicate, and the deployed save started failing with a conflict on every attempt after the first. The logs showed one success and then six consecutive failures, spanning a logout, a fresh login and fresh page loads, so it was not a stale browser tab.",
        "My diagnosis at the time was that some rows had a NULL `updated_at`, and `= NULL` is never true, so the guard could never match. I changed the comparison to `IS NOT DISTINCT FROM`, made both upserts set `updated_at` explicitly on insert instead of trusting a column default, and fixed an inner `catch` that had been flattening the 409 and 503 into a generic 500 \"Could not save the report.\" That last part is why the screen said nothing useful while the log named the cause.",
        "The diagnosis was wrong. The live column was already `NOT NULL DEFAULT now()`, and zero rows were null. The `IS NOT DISTINCT FROM` change was still worth keeping, but the saves kept failing, and the real cause was the cast.",
      ],
    },
    {
      heading: "Bug two: the revision lost its microseconds",
      body: [
        "The revision token is `updated_at::text`, for example `2026-09-06 04:57:54.791364+00`. Bound as `$1::timestamptz`, the driver serialised it through a JavaScript `Date`, which holds milliseconds, so the database compared against `.791` instead of `.791364`. Measured read-only against the live database, a freshly read revision was accepted for 0 of 64 report rows. The fix is the middle cast, `::text::timestamptz`, which sends the characters untouched and lets PostgreSQL parse them.",
        "Neither bug showed up in local tests, because the file-based store used in development has no guarded upsert and falls back to a plain one. The guard now runs against a real PostgreSQL in tests, and a stale revision and a null revision on an existing day are both asserted to be refused.",
        {
          type: "callout",
          label: "The general lesson",
          text: "A concurrency guard that never fires and one that always fires look the same in a unit test with a fake store. Test the predicate against the real database engine and the real driver, and assert both directions: a fresh revision saves, a stale one is refused.",
        },
        "The system is described in the [RPOMS case study](/work/rpoms). The same audit's other findings, and how the pool size shaped this choice, are covered in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
