import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "immutable-reference-data-postgres-triggers-and-hash-pinning",
  title: "Reference Data Nobody Can Edit: Postgres Triggers, Hash Pinning and Append-Only History",
  description:
    "Protecting the examples an AI system is measured against: a trigger that refuses UPDATE and DELETE, SHA-256 hashes checked by tests, append-only history, and what these do not stop.",
  date: "2026-11-15",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Triggers", "Data Integrity", "Append-only", "Vitest", "PGlite"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Immutable Rows in Postgres With Triggers",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "qualification-gate-computing-what-a-model-is-allowed-to-decide",
    "schema-setup-on-cold-start-without-a-race",
    "evaluating-a-vision-model-with-only-thirteen-examples",
  ],
  sections: [
    {
      heading: "Why some rows must never change",
      body: [
        "This is for anyone whose system measures itself against a fixed set of records: a test oracle, a reference set, a price list a contract was signed against. If those records can be edited, every measurement made against them becomes unverifiable.",
        "In [RPOMS AI](/work/rpoms-ai) the fixed point is thirteen reference photos, each with the client's own verdict. They are the entire written foundation of the acceptance criteria, and every model is [qualified](/blog/qualification-gate-computing-what-a-model-is-allowed-to-decide) against them. If anything could quietly change one verdict, a model could be made to look better without the model changing at all. So they are protected in layers, and each layer covers a different way things go wrong.",
      ],
    },
    {
      heading: "Layer one: a trigger that refuses UPDATE and DELETE",
      body: [
        "The references live in a table with a `protected` flag. A row-level trigger refuses any update or delete of a protected row:",
        {
          type: "code",
          lang: "sql",
          code: `CREATE OR REPLACE FUNCTION erth_references_guard() RETURNS trigger AS $$
BEGIN
  IF OLD.protected THEN
    RAISE EXCEPTION 'ERTH reference % is protected and cannot be modified', OLD.item;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_erth_references_guard
  BEFORE UPDATE OR DELETE ON erth_references
  FOR EACH ROW EXECUTE FUNCTION erth_references_guard();`,
          caption: "From db/migrations/003_surface_checker.sql.",
        },
        "The check reads `OLD.protected`, not `NEW`. That closes the obvious escape: you cannot first update a row to `protected = false` and then edit it, because the first update is itself an update of a protected row. Unprotected rows, meaning draft additions for a possible future reference set, stay editable. The seed insert uses `ON CONFLICT (item) DO NOTHING`, so re-running the migration never overwrites anything.",
        "The same pattern, in its simplest form, guards two more tables. Dataset snapshots, which are frozen lists of verified examples used for evaluation, and the knowledge-change history both have triggers that raise on any update or delete, with no condition at all. For those tables, append-only is the whole rule.",
      ],
    },
    {
      heading: "Layer two: hashes pinned in code and checked from disk",
      body: [
        "A database trigger protects the rows, but the images themselves live in the repository. Each original's SHA-256 is pinned in `gold-reference.ts`, and the test suite reads every image file off disk and hashes it. The test's own comment explains why: a reference set that can be swapped without anyone noticing is not a reference set, and a comment saying \"immutable\" protects nothing.",
        "The tests also check the structure around the images: exactly thirteen examples, numbered 1 to 13 with no gaps, three accepted and ten rejected, and each source-spreadsheet row mapped exactly once. A duplicated row is how a mis-extraction hides. The administrator's References page re-verifies the hashes live on every load, so a changed file is visible in the running system and not only in CI.",
        "The originals have annotations drawn into the pixels, so evaluation uses derived copies with the annotations painted out. Those copies are hash-pinned too. The derivation is a script that can be re-run, but its output has to match the pinned hashes. Nobody can quietly regenerate \"slightly better\" evaluation images.",
      ],
    },
    {
      heading: "Layer three: no code path writes the verdict",
      body: [
        "The strongest protection is an absence. The expected verdict is the client's answer, and there is deliberately no function anywhere in the codebase that writes it. No AI prediction, reviewer action or ruleset change can alter it. Review results go into a separate append-only review history, and the AI's own result on a check is never overwritten either.",
        "The same thinking applied when two source documents existed: the original workbook and an HTML export of it. Both are recorded, with an explicit reconciliation. All thirteen verdicts agreed, and the notes agreed once whitespace was normalised. The conflicts list is empty because they agree, not because nobody checked. It exists so that a future disagreement is surfaced for the client to decide. Nothing in the code picks a winner.",
      ],
    },
    {
      heading: "Testing triggers against a real Postgres engine",
      body: [
        "Triggers are easy to get subtly wrong and invisible when missing, so they are tested against a real PostgreSQL engine: PGlite, Postgres compiled to WebAssembly, running inside Vitest. The database tests seed the references and then assert that an UPDATE changing a verdict and a DELETE both fail with the \"protected\" message. They also assert that updating or deleting a dataset snapshot fails with \"immutable\", and that knowledge history is append-only. The general setup is in [Testing Postgres in Vitest With PGlite](/blog/testing-postgres-in-vitest-with-pglite-and-postgres-js).",
        "Migrations apply automatically on first database use. They are tracked in a `schema_migrations` table and serialised with `pg_advisory_xact_lock`, so two instances starting together cannot both apply the same file. That problem is covered in [Schema Setup on Cold Start Without a Race](/blog/schema-setup-on-cold-start-without-a-race).",
      ],
    },
    {
      heading: "What this does not protect against",
      body: [
        "These are guards against application bugs and careless edits, not against a determined database owner. The application connects as the table owner, and an owner can drop a trigger. In PostgreSQL, row-level triggers also do not fire on `TRUNCATE`, and the migrations add no separate guard for it. The hash tests are the backstop there: a changed or missing reference fails the suite and shows up on the References page. But they detect tampering. They do not prevent it.",
        "For a small internal system that trade-off is reasonable. The goal was that the numbers a model is judged by cannot drift without someone noticing. It was not tamper-proofing against the people who run the database. RPOMS AI is deployed, but no model is active in production and it has not been used on real line photos. These protections guard the evaluation foundation, which is the part in use today.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
