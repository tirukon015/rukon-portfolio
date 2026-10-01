import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "postgres-js-timestamptz-microseconds-lost-in-binding",
  title: "postgres.js Dropped the Microseconds From My timestamptz Parameter",
  description:
    "A revision check refused every save because a bound timestamptz went through a JavaScript Date and lost its microseconds. One extra ::text cast fixed it.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "postgres.js", "timestamptz", "Node.js", "Debugging"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "postgres.js Truncates timestamptz Microseconds",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "optimistic-concurrency-postgres-upsert-revision-409",
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "postgres-js-jsonb-double-encoding-sql-json",
  ],
  sections: [
    {
      heading: "Every save refused as \"someone else saved this day\"",
      body: [
        "In RPOMS, the operations system I built for a router-refurbishment line, saving a daily report is guarded by a revision: the row's own `updated_at`, read as text when the form loads and compared when it saves. How that guard works is in [Optimistic Concurrency for a Postgres Upsert](/blog/optimistic-concurrency-postgres-upsert-revision-409). This note is about why, once deployed, it refused every attempt, even from a single admin immediately after a reload.",
        "If you pass a timestamp string with microsecond precision to postgres.js and cast it to `timestamptz` in the query, this applies to you.",
      ],
    },
    {
      heading: "The comparison that could never be true",
      body: [
        "The predicate was:",
        {
          type: "code",
          lang: "sql",
          code: "WHERE reports.updated_at IS NOT DISTINCT FROM ${expectedRevision}::timestamptz",
          caption: "Tagged-template syntax from postgres.js; the value is a bound parameter, not interpolated text.",
        },
        "The token was `updated_at::text`, a 29-character string such as `2026-09-06 04:57:54.791364+00`. Because the parameter was cast to `timestamptz`, the driver was told to send a timestamp, and it serialised the value through a JavaScript `Date` to get there. `Date` holds milliseconds. The microseconds were gone before PostgreSQL saw the value. Measured read-only against the live database:",
        {
          type: "table",
          head: ["Parameter as", "What the server received"],
          rows: [
            ["`$1::text`", "`2026-09-06 04:57:54.791364+00` (29 characters)"],
            ["`$1::timestamptz::text`", "`2026-09-06 04:57:54.791+00` (26 characters)"],
          ],
        },
        "`.791364` is not `.791`, so the predicate was false, the upsert's update branch was skipped, `RETURNING` gave nothing, and the save was reported as a conflict. It was not one unlucky day: a freshly read revision was accepted for 0 of 64 report rows. It also failed identically with prepared statements switched on, so it was the cast, not the connection pooler.",
      ],
    },
    {
      heading: "The fix: ::text::timestamptz",
      body: [
        {
          type: "code",
          lang: "sql",
          code: "WHERE reports.updated_at IS NOT DISTINCT FROM ${expectedRevision}::text::timestamptz",
        },
        "The middle cast types the parameter as text, so the driver sends the characters untouched and PostgreSQL parses them itself, microseconds included. All 64 rows were then accepted, and a stale revision and a null revision on an existing day were still refused, both measured. Concurrency protection was not weakened; one line changed and no migration was needed.",
        "Comparing `updated_at::text` to the parameter also works, but it compares rendered text, and rendering depends on the session's `TimeZone`. Casting to `timestamptz` compares instants, and the token carries its own offset, so it holds however either side is rendered.",
      ],
    },
    {
      heading: "Why tests and my first diagnosis both missed it",
      body: [
        "Local development used the file-based store, which does not implement the guarded upsert and falls back to a plain one. Every \"save the same day twice\" test passed without this statement ever running.",
        "Before finding the cast, I blamed a NULL `updated_at` and shipped a fix for that. The live column turned out to be `NOT NULL DEFAULT now()` with no null rows, so that diagnosis was simply wrong, and the source comment now says so. What found the real cause was two small read-only scripts run against the live database: one that reproduced the save's comparison, and one that printed how a bound parameter arrives under each cast. Neither contains an `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP` or `ALTER`.",
        "Two tests now pin it. One asserts the predicate's shape and fails on the old form. The other runs the real save function against an in-process PostgreSQL through the real postgres.js driver, because the defect lives in how the driver types a bound parameter and a mock would prove nothing. Seeding that test taught the same lesson again: `${SEED}::timestamptz` stores `.791` on the way in just as readily, which is how the first draft of the test failed to reproduce the bug.",
        {
          type: "callout",
          label: "Rule of thumb",
          text: "If a value must survive to the microsecond, send it as text and cast in SQL. Anything that passes through a JavaScript Date is milliseconds at best.",
        },
        "The project behind this is the [RPOMS case study](/work/rpoms). For another way a production-only database problem can hide behind a friendly error screen, see [the EMAXCONNSESSION postmortem](/blog/supabase-session-pooler-emaxconnsession-postmortem).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
