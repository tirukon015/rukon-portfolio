import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "postgres-bulk-insert-bind-parameter-limit-unnest",
  title: "Bulk Inserts Past PostgreSQL's 65,535 Bind-Parameter Limit: unnest and Chunks",
  description:
    "A multi-row VALUES insert with six parameters per row failed outright above 10,922 rows. Replacing it with unnest over array parameters, chunked, and why the import is not one transaction.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "postgres.js", "Bulk Insert", "CSV Import", "Performance"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Postgres Bulk Insert: Beating the Parameter Limit",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "staged-csv-import-for-operational-data",
    "promise-race-timeout-leaks-postgres-connections",
    "remediating-a-code-audit-with-p0-findings",
  ],
  sections: [
    {
      heading: "An import documented as unlimited, with a hard ceiling",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, imports the office's router registry from a spreadsheet saved as CSV. How rows are validated and staged before anything is written is in [Staged CSV Import](/blog/staged-csv-import-for-operational-data). This note is about the database end: the statement that writes the rows.",
        "It built one multi-row `VALUES` list with six placeholders per row: serial key, serial, model, person, date and status. PostgreSQL's wire protocol allows at most 65,535 bind parameters in one statement. Divide by six and the import had a hard ceiling at 10,922 rows. Above it, a large import did not import slowly; it failed outright with a protocol error an operator could do nothing with. The registry holds tens of thousands of serials and the import was documented as unlimited, so the ceiling was reachable. A code audit in September 2026 listed it as DB-04.",
      ],
    },
    {
      heading: "Six array parameters instead of six per row",
      body: [
        "The fix is to send each column as one array and let PostgreSQL turn the arrays back into rows with `unnest`. Six parameters carry any number of rows:",
        {
          type: "code",
          lang: "ts",
          code: "const done = await sql`\n  INSERT INTO registry_routers\n    (serial_key, serial, model, person, reg_date, status)\n  SELECT * FROM unnest(\n    ${keys}::text[], ${serials}::text[], ${models}::text[],\n    ${people}::text[], ${dates}::text[], ${statuses}::text[]\n  )\n  ON CONFLICT (serial_key) DO NOTHING\n  RETURNING serial_key`;\ninserted += done.length;",
          caption: "Simplified from the RPOMS registry store (postgres.js tagged template). Each ${...} is one bound array.",
        },
        "`unnest` with several arrays zips them by position, so the arrays must be the same length and in the same order, which they are when they are all mapped from one list of rows. The explicit `::text[]` casts tell the server what it is receiving.",
        "`ON CONFLICT (serial_key) DO NOTHING` is unchanged. Re-importing the same sheet stays idempotent, and a serial already in the registry is a reported outcome, counted from `RETURNING`, rather than an error. Rows are de-duplicated by serial key before the insert, so the same serial twice in one sheet cannot fight itself.",
      ],
    },
    {
      heading: "Still chunk, for a different reason",
      body: [
        "With `unnest` there is no parameter ceiling, so why chunk at all? Because a single statement for an enormous sheet is one enormous request: one payload, one long round trip, and nothing to show until it finishes. The insert loops over chunks of 2,000 rows (configurable by an environment variable), so a very large sheet makes steady progress in bounded steps. A 20,000-row import that used to fail is ten statements.",
        {
          type: "flow",
          steps: [
            "Parse and validate the sheet",
            "De-duplicate by serial key",
            "Slice into chunks of 2,000",
            "One unnest INSERT per chunk",
            "Sum the RETURNING rows",
          ],
        },
        "The same technique fixed the update path. Re-importing a sheet to correct existing rows unnests the whole batch into one `UPDATE ... FROM` instead of one statement per row.",
      ],
    },
    {
      heading: "Why the whole import is not one transaction",
      body: [
        "The audit also asked for an import that could be rolled back (IMP-02). Wrapping the whole file in one transaction was considered and not taken. Production connects through a transaction-mode pooler with a client pool of ten, and a long transaction holds one of those connections for the length of the file. That trades a rare partial import for a common stall.",
        "Instead the unit of work is smaller and the operator is told the truth. When the import assigns routers to boxes, each box lands completely or not at all. Re-running the sheet is safe, because already-imported serials are skipped and only accepted, unboxed routers are moved. What had been missing was saying so: a bare 500 left people re-running a file with no idea what had gone in. The failure response now names how many boxes completed and says re-running is safe.",
        {
          type: "list",
          items: [
            "Count your parameters per row and divide 65,535 by it. That is your silent ceiling.",
            "For bulk inserts, bind one array per column and `unnest` them.",
            "Chunk anyway, to bound payloads and round trips, not to dodge the limit.",
            "Make re-running safe with `ON CONFLICT`, and tell the operator exactly how far a failed run got.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
