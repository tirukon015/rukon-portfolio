import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "data-preservation-check-before-production-release",
  title: "Proving a Release Deleted Nothing: Row-Count Gates and a Whole-Database Preservation Test",
  description:
    "How RPOMS checks that a release or migration lost no business data: a row-count gate that fails on any decrease, read-only scripts, and a test that compares every row of every table.",
  date: "2026-12-02",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Migrations", "Data Integrity", "Release Engineering", "PGlite", "Node.js"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Proving a Release Didn't Lose Production Data",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "never-create-indexes-from-application-startup",
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "remediating-a-code-audit-with-p0-findings",
    "supabase-free-plan-backup-json-export-restore",
  ],
  sections: [
    {
      heading: "\"No data was lost\" should be evidence, not a sentence",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, holds the only copy of the programme's production records. When I worked through a code audit in September 2026, the brief was that no business data could be deleted, moved, reset or overwritten. Writing \"no data was lost\" in a report is easy. This article is about the checks that let me state it with evidence, before and after a release, and in a test that runs on every push.",
        "It is for anyone shipping schema changes to a small production database without a DBA, a staging copy, or managed backups to fall back on.",
      ],
    },
    {
      heading: "Static evidence first: grep the added lines",
      body: [
        "Before running anything, the remediation branch was diffed and every added line checked against the statements that destroy data: `TRUNCATE`, `DROP TABLE`, `DROP COLUMN`, `DROP DATABASE`, `DROP SCHEMA`, and any `ALTER` of an existing column. None appeared. The branch introduced exactly one `DELETE` against business data, and it was strictly narrower than the statement it replaced.",
        "The pre-existing deletes in the codebase were audited too. All were single-record, user-initiated operations behind authorisation, such as a super admin deleting a report. None was a cleanup job and none ran unprompted. Every schema change was additive: a new column with a constant default, new indexes built concurrently in migrations, and a marker row.",
      ],
    },
    {
      heading: "The gate: no business count may decrease",
      body: [
        "The runtime check is a script that records the row count of every business table plus the critical totals: completed, accepted, packaging and retired figures, routers boxed, deliveries, and the net stock adjustment. Tables are discovered from the catalog rather than a hard-coded list, so a table added later is included automatically.",
        {
          type: "code",
          lang: "bash",
          code: `npm run db:counts -- --save docs/db-baseline-before.json
# ...run the migration, deploy, let the floor work...
npm run db:counts -- --compare docs/db-baseline-before.json`,
        },
        "The rule is asymmetric on purpose. A count that goes up is ordinary operation, the warehouse working. A count that goes down, or a measure that disappears, fails the comparison with a non-zero exit, naming what went down and by how much, so a deployment step can stop on it. The deployment checklist calls it the gate: on a non-zero exit, stop, investigate, and do not promote.",
        "A companion script prints every table, column, index and constraint, so the before and after pictures can be diffed; the only differences should be the column and indexes the release meant to add.",
      ],
    },
    {
      heading: "A whole-database preservation test for each schema change",
      body: [
        "The counts prove that nothing disappeared. They do not prove that nothing changed. For the router-model configuration release, a test does the stronger thing against an in-process PostgreSQL:",
        {
          type: "flow",
          steps: [
            "Build the base schema, then every table the app creates for itself",
            "Remove the new feature with the migration's own rollback block",
            "Fill every table, including the awkward cases",
            "Photograph every row of every table",
            "Apply the change by the hand-run migration and by the app's cold start",
            "Assert every table holds exactly the rows it held, value for value",
          ],
        },
        "The awkward cases were the ones the change could get wrong: two detection rules for one model, a model name spelled two ways, a rule naming a model that does not exist. The only allowed differences are the change itself: the new columns (the rule link filled only where a rule names exactly one model), two indexes, one foreign key and three schema markers. Before the release, the test was also shown to fail when a stock write was deliberately injected, so a passing run means something.",
        "How the in-process database works is in [Testing Real PostgreSQL SQL in Vitest With PGlite](/blog/testing-postgres-in-vitest-with-pglite-and-postgres-js).",
      ],
    },
    {
      heading: "Operator scripts that cannot write, and say where they point",
      body: [
        "The scripts that touch production are only safe if they are obviously safe, so they follow three rules.",
        {
          type: "list",
          items: [
            "Read-only at the server. They contain no `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP` or `ALTER`, and they also open the connection with `default_transaction_read_only = on`, so PostgreSQL itself would refuse a write even if one were added later.",
            "Say which database is about to be touched. Every script prints `Database: host:port/db` before connecting, and never the password, so a credential does not end up in a terminal, a screenshot or a log.",
            "Load configuration like the app, minus the dangerous file. A twenty-line loader reads `.env.local` then `.env` with Next.js's precedence, where a variable already in the real environment wins. `.env.production` is deliberately not read, so a script run by hand cannot silently reach production because of a filename.",
          ],
        },
        "The loader is twenty lines rather than the dotenv package, for a reason that applies widely: a dependency that reads secrets is one worth not having. The restore script, the one script that writes, goes further and refuses any target that names the production project.",
      ],
    },
    {
      heading: "What this does not prove",
      body: [
        "When the remediation report was written, no connection string was available in that environment, so the count scripts had been reviewed and syntax-checked but not yet run against the live database. The report said so, and made running them steps one and nine of the deployment checklist. A gate that has never run against real data is a plan.",
        "Counts and a preservation test also cannot catch a value that a correct-looking feature changes for the wrong reason in production. They are a floor, to sit alongside a tested backup and an audit log of destructive actions. The release these checks supported is described in the [RPOMS case study](/work/rpoms), and the index decisions behind it in [Why My App No Longer Creates Indexes When It Deploys](/blog/never-create-indexes-from-application-startup).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
