import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "schema-setup-on-cold-start-without-a-race",
  title: "Schema Setup on Cold Start: One Statement, One Winner, and a Building Sentinel",
  description:
    "Serverless instances that create tables on first use race each other and hold exclusive locks. How RPOMS claims the schema build with one SQL statement, and the bug in the first version.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Serverless", "Schema Migrations", "Vercel", "Concurrency", "Supabase"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Running Schema Setup Once Across Serverless Instances",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "never-create-indexes-from-application-startup",
    "one-storage-interface-three-backends",
    "stop-vercel-preview-deployments-using-production-database",
    "supabase-session-pooler-emaxconnsession-postmortem",
  ],
  sections: [
    {
      heading: "Why cold starts made the site hang",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, creates its PostgreSQL tables on first use rather than through a separate migration step. The trade-offs of that choice are in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends). This article is about one consequence that bites any serverless app doing the same thing.",
        "Originally every cold start re-ran the whole setup: around forty-five statements, each a round trip, several of them `ALTER TABLE`, which takes an exclusive lock. Two visitors arriving at an idle site start two instances, both run the same locking statements, and they wait on each other. Opening a page in two tabs was slower than opening it in one. If you run `CREATE TABLE IF NOT EXISTS` and friends at startup on Vercel or any platform that scales instances, this is for you.",
      ],
    },
    {
      heading: "A stamp per store",
      body: [
        "The first fix was to remember what had been built. A small table, `rpoms_schema`, holds one row per store with a stamp. Raise the stamp whenever the setup statements change (and include a fingerprint of any seed data, so a data change is noticed without anyone remembering to bump a number). A cold start against a database already at the current stamp is then a single `SELECT`, and the locking work happens only when the schema genuinely changed.",
        "That was not enough. When a stamp changes, every instance that cold-starts before the first one finishes decides the setup is out of date and runs it too. The second waits on the first's locks, the third on the second's.",
      ],
    },
    {
      heading: "Claim the build with one statement",
      body: [
        "So the right to build is claimed first, in one statement only one caller can win. The marker is moved only if it is not already current, and only the caller whose statement returns a row does the work:",
        {
          type: "code",
          lang: "sql",
          code: `INSERT INTO rpoms_schema (store, stamp) VALUES ($store, $building)
ON CONFLICT (store) DO UPDATE SET stamp = $building, updated_at = now()
  WHERE rpoms_schema.stamp <> $stamp
    AND (
      rpoms_schema.stamp <> $building
      OR rpoms_schema.updated_at < now() - interval '2 minutes'
    )
RETURNING store`,
          caption: "From the RPOMS schema marker. $building is the stamp plus a \" :building\" suffix.",
        },
        "Why not an advisory lock, the textbook answer? Production connects through a transaction-mode pooler. Anything held across statements, an advisory lock or a session variable, may land on a different backend connection and quietly not hold at all. A single statement is atomic whichever connection it runs on.",
      ],
    },
    {
      heading: "The bug: the claim said \"built\" before it was",
      body: [
        "The first version of the claim moved the marker straight to the new stamp and then ran the build. Every other instance asks whether the marker equals the current stamp, so from the instant the winner claimed, everyone else was told the schema was ready while its `ALTER`s were still running. The wait loop meant to hold them back could never fire, because its first check passed. A deployment that raised a stamp had every instance but one querying columns that did not exist yet.",
        "A code audit in September 2026 listed this as DB-05, and the fix needed no new column or extra statement. The claim writes a sentinel, the stamp plus \" :building\", which is deliberately not the stamp. Everyone else keeps seeing \"not current\" until the winner finishes and writes the real value:",
        {
          type: "flow",
          steps: [
            "Marker is current? Return",
            "Try to claim: marker becomes \"stamp :building\"",
            "Won: run the build, then write the real stamp",
            "Build threw: clear the marker, rethrow",
            "Lost: poll every 150 ms, up to 20 times, then carry on",
          ],
        },
      ],
    },
    {
      heading: "Surviving a process killed mid-build",
      body: [
        "The failure path clears the marker so the next cold start tries again. But a process killed outright, such as a function frozen and reclaimed mid-build, never reaches that path. It would leave the sentinel on file with nobody able to claim it. That is what the age condition in the claim is for: after two minutes, a building claim is treated as abandoned and can be taken over. Two minutes is far longer than a build of about forty-five statements and short enough that a deploy recovers without anyone intervening.",
        "The losers wait, but not forever. Waiting briefly is right because a column the build adds may be one their query is about to use. Waiting indefinitely is wrong because a failed build would take every page down with it. So they poll for about three seconds and then carry on.",
      ],
    },
    {
      heading: "The rule this leaves you with",
      body: [
        "Stamps make one more thing visible: two versions of the code with different stamps, pointed at one database, will keep rebuilding over each other. RPOMS once had production, a preview alias and a separate Ecommerce build all on the same database, and a stamp bump on a branch changed production's schema on its first request. Two changes came out of that. Indexes are no longer built by the application at all, because a plain `CREATE INDEX` at cold start is the same lock problem at a larger scale, and previews are refused the production database.",
        {
          type: "list",
          items: [
            "Record what has been built, per store, and make a cold start against a current database cost one read.",
            "Claim the build in a single conditional statement; avoid session-scoped locks behind a transaction pooler.",
            "Write a building sentinel, not the final stamp, until the build returns.",
            "Let an abandoned claim expire, and let waiters give up rather than hang.",
            "Never run two branches with different stamps against one database.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
