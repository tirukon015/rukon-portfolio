import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "refusing-runtime-ddl-on-production-schema-stamps-and-a-gate",
  title: "Refusing Runtime DDL on Production: Schema Stamps, a Gate, and Schema-Only Migrations",
  description:
    "RPOMS used to build its own tables on a cold start. On a shared production database that is a race and a risk, so the application now refuses to alter production schema, and a release ships as ordered, schema-only migration files with rollback blocks.",
  date: "2026-10-20",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Migrations", "Supabase", "Next.js", "Release Engineering", "Operations"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  seoTitle: "No Runtime DDL on Production: Schema Stamps, a Refusal Gate and Ordered Migrations",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "supabase-connection-pool-exhaustion-supavisor-production",
    "sharing-one-supabase-project-between-two-apps",
    "sorting-on-the-column-the-index-serves-250000-routers",
  ],
  sections: [
    {
      heading: "A convenience that became a hazard",
      body: [
        "[RPOMS](/work/rpoms) has one storage interface with three backends, and each store knows its own schema: on first use it creates its tables and indexes and writes a marker into a small table of schema stamps. For a local Postgres, for the in-process test database and for a fresh staging environment, that is exactly right; the application brings its own structure and the tests prove it.",
        "On production it is the wrong default. An earlier incident showed two deployments sharing one database racing to build schema on cold start and holding an exclusive lock while they did. More generally, a web request is the wrong place to run ALTER TABLE: the person deploying has no chance to read what will change, no backup is taken first, and a failure half-way leaves a structure nobody wrote down.",
      ],
    },
    {
      heading: "Stamps ahead of the database are refused",
      body: [
        "Every store carries a stamp, a short string such as the registry's cleaning-link version, and the database holds the stamp it was last built to. The new rule compares them on the production database only. If the code's stamp is ahead of the database, the store refuses with a message naming itself, and the page or route that needed it fails visibly instead of altering production. Staging, local Postgres and the test suite build as before, because the gate is keyed to the production project, and one explicit environment variable exists as the deliberate override.",
        "The refusal is the point. A production page whose store is behind its marker fails with a message naming the store, which tells the operator precisely which migration file has not been run. The alternative, silently creating what is missing, is how a database ends up with structure that no file in the repository describes.",
        {
          type: "callout",
          label: "Production, read-only, 20 October 2026",
          text: "Postgres 17.6; 25 public tables, all with Row Level Security on and zero policies, so RLS is the only thing keeping the REST API out; 17 schema markers present; the registry at 2,928 routers plus an 8,332-row historical archive. The release notes record this so the migration plan is checked against what is actually there.",
        },
      ],
    },
    {
      heading: "What a release ships instead",
      body: [
        "With the gate in place, a release has to carry its schema as files, and the 20 October handover package lists five of them in the order production needs them. Every file is schema-only: ALTER TABLE ADD COLUMN with constant defaults, CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS, ENABLE ROW LEVEL SECURITY, and one INSERT of the store's marker. No file updates, deletes, truncates or drops a business row. Each has a rollback block at its foot, and the runbook says to run them with ON_ERROR_STOP so a failure halts the sequence.",
        {
          type: "list",
          ordered: true,
          items: [
            "Seven cleaning columns on the router registry with empty-string defaults and a partial index that starts empty: one ALTER, an ACCESS EXCLUSIVE lock for milliseconds under a five-second lock timeout.",
            "Refining sessions and scans: new tables, four indexes, RLS on both.",
            "Print attempts: four columns on an empty table and one new table.",
            "A per-scan category column, metadata only.",
            "Accounts, account services and service settings: new tables for Google sign-in and per-service access, and optional, because password logins keep working without them.",
          ],
        },
        "The package is as explicit about what must not run. A data-rewriting normalisation of legacy delivery rows is listed as not required, because the application reads both shapes. The historical archive scripts are listed as already applied and never to be recreated, because the archive is live data. And the staging-only RLS backfill is marked harmless but unnecessary on production, which gets its policies from the table-creating files.",
      ],
    },
    {
      heading: "Nothing changed without a separate approval",
      body: [
        "The release notes open with the words staging only. Production was read twice, read-only, for the schema facts above, and changed in no way; each production step is approved separately. The deployment order follows from the gate: migrations first, then the build, because a build that serves traffic before its files have run will fail the Refining and Printing pages with the store's name until they are.",
        "That is a different kind of safety from a feature flag. The code is not hiding a capability; it is declining to take an action that belongs to a person with a backup and a terminal. 1,637 automated tests pass on the release branch, and none of them can run DDL against production either, because the test database is PostgreSQL compiled to WebAssembly and served in-process.",
      ],
    },
  ],
};
