import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-postgres-in-vitest-with-pglite-and-postgres-js",
  title: "Testing Real PostgreSQL SQL in Vitest With PGlite and the Real Driver",
  description:
    "No Postgres server, no Docker, and production off limits. PGlite behind a loopback socket let the real postgres.js driver run real SQL in Vitest and in CI.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PGlite", "Vitest", "PostgreSQL", "postgres.js", "Testing", "CI"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Test Real Postgres SQL in Vitest With PGlite",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "postgres-js-timestamptz-microseconds-lost-in-binding",
    "optimistic-concurrency-postgres-upsert-revision-409",
    "data-preservation-check-before-production-release",
    "express-5-pglite-api-jwt-security-tests",
  ],
  sections: [
    {
      heading: "The bug a mock could not have caught",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, runs on PostgreSQL in production, but for a long time its tests never touched PostgreSQL. Local development used a file-based store, and the tests ran against that. Then a revision check in the report save refused every attempt in production while every local test passed, because the file store simply did not implement the guarded statement. The cause turned out to be [how postgres.js binds a timestamptz parameter](/blog/postgres-js-timestamptz-microseconds-lost-in-binding).",
        "A mock would have proved nothing: the defect lived in how the driver types a bound parameter and how the server parses it. I needed a real engine and the real driver. There was no PostgreSQL on the machine and no Docker, and testing against production was not acceptable. This article is for anyone in the same position who wants integration tests of real SQL without running a database server.",
      ],
    },
    {
      heading: "PGlite behind a loopback socket",
      body: [
        "PGlite is PostgreSQL compiled to WebAssembly, running in-process and in memory. On its own it has its own query API, which would mean testing a different client than production uses. The companion `@electric-sql/pglite-socket` package serves a PGlite instance over the PostgreSQL wire protocol on a local port, so the genuine postgres.js client connects to it exactly as it connects to Supabase.",
        {
          type: "code",
          lang: "ts",
          code: `const { PGlite } = await import("@electric-sql/pglite");
const { PGLiteSocketServer } = await import("@electric-sql/pglite-socket");

db = await PGlite.create();
const port = await freePort(); // listen on 0, read the port, close
server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
await server.start();

const url = \`postgres://postgres@127.0.0.1:\` + port + \`/postgres\`;
// prepare:false, exactly as production uses behind the pooler
sql = postgres(url, { max: 2, prepare: false, idle_timeout: 5 });`,
          caption: "Simplified from the RPOMS test setup. No password, no TLS, no route anywhere but loopback.",
        },
        "The only option that differs from production is `ssl`, omitted because the loopback socket has none. `prepare: false` stays, because production connects through a transaction-mode pooler and I wanted the tests to use the same driver settings.",
      ],
    },
    {
      heading: "Handing the test database to the application code",
      body: [
        "The application gets its client from a single module. In a test, that module is replaced with one that hands back the PGlite-backed client, so the real store functions run unchanged:",
        {
          type: "code",
          lang: "ts",
          code: `const holder = vi.hoisted(() => ({ sql: null as unknown as Sql }));
vi.mock("@/lib/pg", () => ({
  getSql: () => holder.sql,
  isPostgresConfigured: () => true,
}));`,
        },
        "`vi.hoisted` matters because `vi.mock` is hoisted above the imports. The holder exists before the mock factory runs, and `beforeAll` fills it once the socket server is up. The application's own cold-start schema code then builds its tables in the test database the same way it would on a fresh deployment.",
      ],
    },
    {
      heading: "Isolation is asserted, not assumed",
      body: [
        "A test harness that could be pointed at production by a stray environment variable is worse than none. So the setup asserts the URL it built: it must contain `127.0.0.1` and must not contain words like `supabase` or `pooler`. There is also a standalone script with a second implementation of the save-guard checks that refuses to start if `DATABASE_URL` is set, and rejects any host that is not loopback.",
        "The other habit worth copying is pinning the test to the shipped code. The save-guard test reads the store's source file, slices out the function body, and asserts it contains the fixed predicate and not the broken one. The test cannot pass while the application says something else, which is the exact failure that let the original bug ship.",
      ],
    },
    {
      heading: "What it made testable",
      body: [
        "Across the project, 17 test files now run real SQL against PGlite, out of 958 tests in total. They cover the kinds of behaviour a fake store cannot represent:",
        {
          type: "list",
          items: [
            "the optimistic-concurrency upsert: fresh revision saves, stale revision and null revision on an existing day are refused",
            "transactions that must leave nothing behind, including a forced ledger failure that leaves the stock balance untouched",
            "a delivery delete that runs as one transaction",
            "settings merged inside a single statement with jsonb `||`",
            "request numbering and reuse rules, run through both stores from one table of cases",
            "query changes made for speed, proven to return exactly what they returned before",
            "a whole-database preservation test for a schema change",
          ],
        },
        "The last one builds a production-shaped database, fills every table, applies a change by both the hand-run migration and the application's own cold start, and asserts every existing value is identical afterwards.",
      ],
    },
    {
      heading: "Running it in CI without a database",
      body: [
        "Because PGlite is an npm dependency, the GitHub Actions workflow needs no service container. It runs `npm ci`, typecheck, lint, the tests, a production build and `npm audit --audit-level=high` on every push, and its header says it plainly: no database is needed; the Postgres-backed tests run on PGlite, in-process.",
        "The PostgreSQL tests skip rather than fail when PGlite cannot be imported. That started as a practical choice (PGlite was first installed without being saved to `package.json`) and it still means a machine without it runs the rest of the suite. It is now a declared dev dependency, so CI always runs them.",
        {
          type: "callout",
          label: "Limits",
          text: "PGlite is single-connection PostgreSQL in WebAssembly. It is the real engine and the real SQL, but it is not Supavisor, so pooler behaviour, connection limits and startup parameters like statement_timeout still have to be checked on a real deployment.",
        },
        "The project is described in the [RPOMS case study](/work/rpoms). The concurrency guard these tests protect is explained in [Optimistic Concurrency for a Postgres Upsert](/blog/optimistic-concurrency-postgres-upsert-revision-409).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
