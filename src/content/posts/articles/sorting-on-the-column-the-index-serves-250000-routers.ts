import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "sorting-on-the-column-the-index-serves-250000-routers",
  title: "Sorting on the Column the Index Serves: 160 ms to Under 1 ms at 250,000 Routers",
  description:
    "The RPOMS Registry page sorted on a text copy of the timestamp it selected, so the index on the real column was never used. Measured on an isolated 250,000-row copy, the fix is one ORDER BY and a read deadline that keeps the page honest when a query is slow anyway.",
  date: "2026-10-20",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "Indexes", "Query Performance", "EXPLAIN", "Pagination", "Next.js"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "ORDER BY the Indexed Column, Not Its Text Copy: A 250,000-Row Registry Page Fix",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "supabase-connection-pool-exhaustion-supavisor-production",
    "refusing-runtime-ddl-on-production-schema-stamps-and-a-gate",
    "one-live-record-per-router-per-session-partial-unique-index",
  ],
  sections: [
    {
      heading: "A registry built for 2,928 rows, planned for 250,000",
      body: [
        "The Registry in [RPOMS](/work/rpoms) lists every accepted router with its model, box and dates. Production holds 2,928 routers in the live table and 8,332 in a historical archive; the programme's archive of KAON and Huawei units runs to 250,000, and the import tooling for it was built and measured head-to-head on an isolated copy in mid October. Before that import could ever run, the page that would list the result had to be known to scale, and two incidents in the same week said it did not.",
        "On 12 October the Registry page timed out behind slow configuration badges, and on 18 October its list, totals and names reads overran again. Both were fixed by bounding the reads under the page's eight-second deadline, so the page says it could not load a part instead of hanging. That is the right behaviour for a slow query, but it is not a fast query.",
      ],
    },
    {
      heading: "The sort that threw the index away",
      body: [
        "The list query selected the router's creation timestamp twice: once as the column, and once formatted as text for display. The ORDER BY used the text alias. PostgreSQL cannot serve an ORDER BY on a computed text value from a B-tree index on the underlying timestamp, so the planner read the matching rows, formatted them, and sorted the result in memory before taking the first page. At 2,928 rows that costs little. At 250,000 rows on an isolated copy it cost 160 to 200 ms for the first page, every time.",
        "The fix is one clause: sort on the table's created_at column, the one idx_routers_created already covers. The planner now walks the index in order and stops after the page size, which is why the first page's query falls to under a millisecond on the same 250,000-row copy. The rows come back in the same order as before; a sort on the formatted text and a sort on the timestamp agree for an ISO-shaped format, and the tests check that they do.",
        {
          type: "flow",
          steps: [
            "SELECT created_at, to_char(created_at) AS created_text ... ORDER BY created_text",
            "Planner: index unusable for the sort; sequential read, in-memory sort, then LIMIT",
            "ORDER BY created_at instead",
            "Planner: index scan in order, stops at LIMIT",
            "160 to 200 ms becomes under 1 ms at 250,000 rows on an isolated copy",
          ],
          caption: "The change is in the ORDER BY, not in the index.",
        },
      ],
    },
    {
      heading: "Measuring on a copy, not on production",
      body: [
        "None of this was measured against production. The 250,000-row figures come from an isolated copy built for the historical import benchmark, where two designs, a shared table with a membership filter and a separate database, were compared head-to-head with the same queries. The same rig produced the registry timings before and after the ORDER BY change, which is what makes the two numbers comparable.",
        "The read deadline stays. A bounded read that reports which part did not load is the correct answer to the question of what happens when an unexpected query is slow, and the index fix is the answer to a different question, why an expected query was slow. The release that carried the fix also made the application refuse to create or alter schema on production, so the index that serves the page is one that a migration file created on purpose, not one the application added on a cold start.",
        {
          type: "list",
          items: [
            "Sort on the column the index covers; an alias computed from it is a different expression to the planner.",
            "Measure on a copy with the target row count, not the current one.",
            "Keep the deadline: a fast query and an honest timeout are separate guarantees.",
          ],
        },
      ],
    },
  ],
};
