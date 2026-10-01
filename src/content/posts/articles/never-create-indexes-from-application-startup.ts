import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "never-create-indexes-from-application-startup",
  title: "Why My App No Longer Creates Indexes When It Deploys",
  description:
    "A plain CREATE INDEX in a cold-start schema build locks a busy table as a side effect of shipping code. Moving indexes to CONCURRENTLY migrations, and what the app still does.",
  date: "2026-10-22",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Indexes", "Migrations", "Locking", "Deployment"],
  contentType: "Problem/Solution",
  searchIntent: "informational",
  seoTitle: "Don't Let Your App Create Indexes on Deploy",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "schema-setup-on-cold-start-without-a-race",
    "data-preservation-check-before-production-release",
    "stop-vercel-preview-deployments-using-production-database",
  ],
  sections: [
    {
      heading: "A preview I declined to deploy",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, builds its own PostgreSQL schema on a cold start, claimed once across instances as described in [Schema Setup on Cold Start](/blog/schema-setup-on-cold-start-without-a-race). In September 2026 a remediation branch added two indexes the queries were already asking for: a functional index on `lower(trim(person))` for the person filter, and a partial index on the packed-date column of the boxes table, which had none despite being read on three pages.",
        "The natural place to put them was the cold-start build, next to the tables. Before deploying a preview, I checked the environment variables and found one database connection string covering both Preview and Production. A preview would have connected to the live database and applied those changes on its first request, at whatever hour that landed, while the warehouse was working. So the preview was not deployed. Thinking through why showed the problem reached well past the preview.",
      ],
    },
    {
      heading: "What CREATE INDEX actually locks",
      body: [
        "A plain `CREATE INDEX` blocks writes to the table for as long as the build takes. On a small table that is milliseconds. On the router registry, with tens of thousands of rows possible, it is long enough for every scan on the packing screen to queue behind it. And in a cold-start build it happens as an unannounced side effect of deploying code, on the eventual production deployment just as much as on a preview.",
        "`CREATE INDEX CONCURRENTLY` builds without holding writes out, at the cost of two passes over the table and one rule: it cannot run inside a transaction block. That makes it a poor fit for application startup code and a good fit for a migration an operator runs deliberately.",
      ],
    },
    {
      heading: "Indexes move to migrations; the app keeps one ADD COLUMN",
      body: [
        "The change was simple in code and strict in effect. The two indexes left the cold-start build and now exist only in a migration file that creates, and does nothing else:",
        {
          type: "code",
          lang: "sql",
          code: `-- THIS MIGRATION CREATES ONLY. Safe to run while the warehouse is working,
-- and safe to run twice. Run against the DIRECT connection, not the pooler.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routers_person_norm
  ON registry_routers (lower(trim(person)));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boxes_packed_date
  ON registry_boxes (packed_date) WHERE packed_date <> '';`,
          caption: "Condensed from the RPOMS migration header and statements.",
        },
        "The file says to run it against the direct connection rather than the transaction pooler, because a transaction-mode pooler wraps statements in ways that can defeat `CONCURRENTLY`. For a fresh or empty database, where locking nothing costs nothing, an opt-in variable lets the app build them itself. It must not be set on the shared database.",
        "The application still does one thing on startup: it adds a new `delivered_at` column with a constant default. Since PostgreSQL 11, `ADD COLUMN ... DEFAULT` with a constant is a metadata-only change, with no table rewrite and a lock measured in microseconds. Having the app do it guarantees the column exists before the code that writes to it runs.",
      ],
    },
    {
      heading: "A migration that could not have run as written",
      body: [
        "Restructuring found a real error. The delivered-state migration had its index as a plain `CREATE INDEX` inside the `BEGIN ... COMMIT` block, where `CONCURRENTLY` is not even legal. The column and the backfill are now the transaction, and the index is built concurrently after the `COMMIT`.",
        {
          type: "flow",
          steps: [
            "BEGIN",
            "ADD COLUMN IF NOT EXISTS (metadata only)",
            "Backfill, guarded to fill blanks only",
            "COMMIT",
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS",
            "Read-only verification queries",
          ],
        },
        "The same file carries a constraint that is written out and deliberately not applied. The audit had found nothing stopping the same box appearing on two delivery orders, and a unique index is the right fix. But if the live data already contains such a pair, adding it fails, and forcing it through would mean deleting one of two real delivery records. So the file has a read-only check query first, and the constraint commented out, to be applied only if the check returns no rows.",
      ],
    },
    {
      heading: "The side benefit: stamps stopped fighting",
      body: [
        "The registry's schema stamp had been raised for the two indexes. With them gone, the build was exactly what the previous stamp already described, so the stamp went back down. That removed any reason for a branch deployment and a production deployment to keep rebuilding over each other while both were running. The delivery stamp did move, because that build genuinely changed; on a database already at the old stamp, the rerun is a handful of `IF NOT EXISTS` no-ops plus the one metadata-only column.",
        "Net effect: deploying that branch performed exactly one schema change. Nothing else touched the database until an operator ran a migration on purpose.",
      ],
    },
    {
      heading: "Where the line sits now",
      body: [
        "This is a rule about large, busy tables, not a ban on the word `INDEX` in startup code. Later additive steps do create indexes on cold start, on small configuration tables such as router models and serial rules, where the build is instantaneous. The release plan for those steps lists every statement a first cold start will run against production, and which existing rows, if any, it writes.",
        {
          type: "list",
          items: [
            "Never build an index on a large, live table from application startup. Put it in a migration with `CONCURRENTLY`.",
            "Run concurrent index builds on a direct connection, outside any transaction block.",
            "Metadata-only `ADD COLUMN` with a constant default is safe to ship with the code.",
            "Write a constraint the data might violate as a check query plus a commented-out statement, not as a blind `ALTER`.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
