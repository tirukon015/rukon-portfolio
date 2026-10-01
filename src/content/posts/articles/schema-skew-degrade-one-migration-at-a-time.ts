import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "schema-skew-degrade-one-migration-at-a-time",
  title: "When the Code Ships Before the Migration: Degrading One Schema Level at a Time",
  description:
    "Selecting a column that a pending migration adds made PostgREST fail every library read. The fix degrades one migration tier at a time, so deploy order stops mattering.",
  date: "2026-11-04",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "PostgREST", "Supabase", "Migrations", "Deployment", "Python"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Schema Skew: Code Deployed Ahead of Migrations",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "calling-postgrest-from-python-what-mocks-miss",
    "why-system-maintenance-matters-after-deployment",
    "caching-llm-results-by-content-hash-without-leaking-uploaders",
  ],
  sections: [
    {
      heading: "The problem: code and schema do not change at the same moment",
      body: [
        "Every application with a database has a window where the code and the schema disagree. The migration runs before the deploy, or after it, or someone forgets it for a day. This article is for anyone reading from PostgreSQL through PostgREST, including Supabase, where that window can take a whole feature down. It is a regression I shipped to production in [ResearchForge](/work/researchforge) and the two fixes it took.",
      ],
    },
    {
      heading: "What broke: one missing column failed every read",
      body: [
        "Migration 004 added four provenance columns to the `analyses` table: `model_provider`, `fallback_used`, `fallback_provider` and `processing_time_ms`. The code that reads the research library was updated to select them in its embedded `analyses(...)` resource, and deployed. The migration had not been run yet.",
        "PostgREST does not omit a column it cannot find. A select naming a missing column fails the whole request with PostgreSQL error 42703, `undefined_column`. So every read of the library returned an error, the backend mapped it to 502, and My Papers went blank for every user. Four metadata fields had taken the entire library offline. It was found in production immediately after deploying, not in review.",
      ],
    },
    {
      heading: "First fix: detect 42703 and ask for less",
      body: [
        "The repository now recognises exactly that error and raises an internal `_SchemaBehindError`. The read paths, listing papers, fetching one paper and fetching papers for a review, retry with the older column list. Saving drops the new keys and writes the analysis anyway, because the analysis matters more than the metadata about it.",
        "Two details keep the fix from becoming a new problem. Only 42703 triggers the retry: an unrelated 400 still fails, otherwise a genuine query bug would be retried and reported as healthy forever. And the discovery is remembered in a module-level variable, so it costs one extra round trip per warm serverless process rather than one per request. It only ever steps down, since a column cannot un-exist, and a cold start re-learns it, so deploying after the migration picks the columns up with no intervention.",
      ],
    },
    {
      heading: "Second bug: the fallback was all or nothing",
      body: [
        "A few hours later, migration 005 was about to add one more column, `cache_hit`. Checking whether that change was safe to deploy before 005 had been run showed a flaw in the first fix: it dropped every provenance column the moment any one was missing.",
        "Production was in exactly the state that exposed it, with 004 applied and 005 not. The first read would fail on `cache_hit`, and the retry would give up 004's four columns as well, columns the database had perfectly. Every entry in My Papers would have lost its provider badge until 005 ran. It was caught before it shipped.",
      ],
    },
    {
      heading: "The design that stuck: tiers that map to migrations",
      body: [
        "The optional columns are grouped by the migration that introduced them, and a failure steps down exactly one tier:",
        {
          type: "code",
          lang: "python",
          code: `_PROVENANCE_TIERS = (
    "model_provider,fallback_used,fallback_provider,processing_time_ms",  # migration 004
    "cache_hit",                                                          # migration 005
)

async def _with_schema_fallback(self, attempt):
    global _PROVENANCE_TIER
    while True:
        try:
            return await attempt()
        except _SchemaBehindError:
            if _PROVENANCE_TIER <= 0:
                raise  # nothing optional left: a real error
            _PROVENANCE_TIER -= 1`,
          caption: "Simplified from src/db/supabase.py. The embed asks for the base columns plus the tiers up to the current level.",
        },
        {
          type: "table",
          head: ["Tier", "Columns requested", "Database state it serves"],
          rows: [
            ["2", "Base, 004's provenance, 005's cache_hit", "Fully migrated"],
            ["1", "Base and 004's provenance", "004 applied, 005 not"],
            ["0", "Base columns only", "Neither applied"],
          ],
        },
        "Writes follow the same rule. A tier the database lacks is omitted from the insert rather than sent as NULL, because PostgREST also rejects an INSERT that names a column that does not exist, and one missing column would fail the whole write. Reads already use `.get()` for these fields, so their absence is harmless once they are not requested.",
        "The regression test is named `test_only_the_MISSING_tier_is_dropped`. It asserts that with only `cache_hit` missing, `model_provider` is still requested, and it fails against the first implementation.",
      ],
    },
    {
      heading: "The property worth having",
      body: [
        "With tiers in place, code can ship before or after a migration and neither order loses anything the database actually has. That is the goal to design for, rather than a deploy checklist that says \"run the migration first\" and relies on a person remembering. Additive migrations help too: the ResearchForge migrations add tables and columns rather than dropping them, so older code keeps working against a newer schema, and this fallback covers the opposite direction.",
        "It is also a small example of why maintenance is where a lot of the real engineering happens, which is the argument of [Why System Maintenance Matters After Deployment](/blog/why-system-maintenance-matters-after-deployment). The cache that migration 005 introduced is described in [Caching LLM Analyses by Content Hash](/blog/caching-llm-results-by-content-hash-without-leaking-uploaders).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
