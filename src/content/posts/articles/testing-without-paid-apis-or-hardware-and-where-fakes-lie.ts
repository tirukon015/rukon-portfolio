import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-without-paid-apis-or-hardware-and-where-fakes-lie",
  title: "Testing Without Paid APIs or Hardware, and the Places Fakes Lied",
  description:
    "Fake LLM providers, a simulated label printer and an in-process Postgres keep my test suites free and offline. What each proved, and three places a fake fell short.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Testing", "Test Doubles", "PGlite", "LLM", "Web Bluetooth", "Supabase"],
  contentType: "Experience-led",
  searchIntent: "informational",
  seoTitle: "Fakes for LLMs, Printers and Databases: Their Limits",
  relatedProjects: ["researchforge", "rpoms-print-engine", "rpoms-ai", "spendrop"],
  relatedPosts: [
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "calling-postgrest-from-python-what-mocks-miss",
    "every-policy-was-correct-and-every-policy-was-inert",
    "testing-an-llm-app-without-calling-paid-apis",
  ],
  sections: [
    {
      heading: "The constraint: no API bill, no hardware on the desk",
      body: [
        "Several of my projects depend on things a test suite should not touch. ResearchForge calls two paid LLM providers. The RPOMS Print Engine drives a NIIMBOT label printer over Bluetooth. RPOMS AI stores everything in PostgreSQL. SpenDrop backs up to Supabase. Running the real thing on every test run would cost money, need a printer within Bluetooth range, or need a live database I could damage.",
        "So each project has fakes. This article is for developers building the same kind of test double. It describes what each one is, what it genuinely proved, and, more usefully, the specific places where a passing suite still left me wrong.",
      ],
    },
    {
      heading: "Fake LLM providers that fail on command",
      body: [
        "ResearchForge runs on two LLM providers. The owner picks one as primary and the other becomes the fallback. The rules that make that safe are easy to get subtly wrong: fall back only for retryable failures, fall back at most once per analysis and stay switched afterwards, and record the provider that actually produced the result rather than the one that was configured. That last rule matters for academic honesty: a stored analysis that credits one model when another wrote it is a fabricated provenance record.",
        "The router tests use no network and no API keys. Both providers are fakes:",
        {
          type: "code",
          lang: "python",
          code: "class FakeProvider(LLMProvider):\n    \"\"\"A provider that answers, or fails with whatever it was given.\"\"\"\n\n    def __init__(self, name, *, fail_with=None, fail_times=0):\n        self._name = name\n        self.fail_with = fail_with\n        # fail_times = 0 with a fail_with means \"fail every time\".\n        self.fail_times = fail_times\n        self.calls = 0",
          caption: "From ResearchForge's tests/test_router.py, type hints removed.",
        },
        "Because the fake can raise exactly the error class the router has to classify (a rate limit, a credential error, a malformed response) a given number of times, every branch of the fallback logic is reachable on demand. A real provider would make most of those branches impossible to trigger deliberately. This is the kind of fake that works well: the thing being tested is my routing logic, and the fake only has to be a faithful source of the inputs that logic sees.",
      ],
    },
    {
      heading: "A simulated printer that rebuilds every page",
      body: [
        "The Print Engine's simulated printer goes much further. `FakeB1Pro` implements the same Bluetooth transport interface as the real connection and speaks the printer protocol as the project documents it. It parses every frame the engine sends and rebuilds each page into a bitmap, so a test can compare what was printed with what was rendered. Options let a test make it misbehave in specific ways: report an error right after a page ends, never advance its printed-page counter, or drop the link after a page.",
        "Against it, the suite checks identification, rejection of the wrong model, exact bytes, error codes, power-off and reconnect, one transaction at a time, connection reuse across five labels with one connect, multi-page jobs and retry flags. A fake clock tests the minimum spacing between writes without waiting for real time. The backend's integration tests use an in-memory store and a fake Google identity provider in the same spirit.",
        "The project's own testing notes state the limit in one line: the simulated printer proves our side is consistent; only real hardware proves the printer agrees. That is the first place a fake cannot help. The engine was verified on the real printer once: connection, identification and one router label with every acknowledgement. Runs of 10, 25, 50 and 100 labels go end to end against the simulator; on the physical printer they are the next validation step, not a result. The [Print Engine case study](/work/rpoms-print-engine/case-study) records it that way.",
      ],
    },
    {
      heading: "A real Postgres engine instead of a fake database",
      body: [
        "For the database, the better move was to stop faking. RPOMS AI's integration tests start PGlite, a PostgreSQL engine compiled to run in-process, expose it on a local socket, and point the application's normal `DATABASE_URL` at it. The tests then run through the same postgres.js driver and the same migrations production uses.",
        {
          type: "code",
          lang: "ts",
          code: "pg = await PGlite.create();\nserver = new PGLiteSocketServer({ db: pg, port: PORT, host: \"127.0.0.1\" });\nawait server.start();\nprocess.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:` + PORT + `/postgres`;",
          caption: "Simplified from RPOMS AI's src/lib/db/db.test.ts.",
        },
        "This catches what an in-memory mock cannot: a migration that does not apply, a constraint that rejects a row, SQL that a real parser refuses, and type behaviour at the driver boundary. A full walkthrough of the technique is in [Testing Postgres in Vitest With PGlite and postgres.js](/blog/testing-postgres-in-vitest-with-pglite-and-postgres-js).",
      ],
    },
    {
      heading: "Where the fakes lied",
      body: [
        "The second place a fake failed me is the one I think about most. ResearchForge's ownership tests modelled Row Level Security with a stub. Every test passed. In production, the backend connected with a privileged key that bypasses RLS, so every policy was correct and none of them was enforced. The stub encoded what I believed the database did, which is exactly the thing that was wrong. It took live scripts, run as two different people against the deployed system, to show it. The full account is in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert), and the way an HTTP mock hides PostgREST behaviour is in [Calling PostgREST From Python: What Mocks Miss](/blog/calling-postgrest-from-python-what-mocks-miss).",
        "The third is SpenDrop's optional cloud backup. Its sign-in, upload and Row Level Security policies were tested against a simulated server. They have not yet been run against a live Supabase project, and the project status says so in those words. Until they are, the honest claim is that the client behaves correctly against my model of the server.",
        {
          type: "table",
          head: ["Fake", "Proves", "Does not prove"],
          rows: [
            ["Fake LLM providers", "Routing, fallback and provenance logic", "That real providers return the errors the fakes imitate"],
            ["Simulated B1 Pro", "The engine's protocol handling is consistent", "That the physical printer agrees, at volume"],
            ["PGlite", "Migrations, SQL and driver behaviour on a real engine", "Hosted-platform behaviour such as roles, keys and RLS context"],
            ["RLS stub", "Nothing about the database", "Anything about isolation in production"],
            ["Simulated backup server", "Client request flow", "Live Supabase policies"],
          ],
        },
      ],
    },
    {
      heading: "Rules I now apply",
      body: [
        "A fake is safe when it stands in for inputs to logic I own, like the LLM fakes. It is risky when it stands in for a security or correctness guarantee owned by someone else, like the RLS stub. For the risky kind, prefer the real engine in-process where it exists, as with PGlite, and otherwise write down which claims the fake can support and which it cannot, and keep that line in the project's status table rather than in my head.",
        "The second rule is about wording. \"Tested\" without a qualifier invites the reader to assume real conditions. \"Tested against the simulated printer\" or \"tested against a simulated server\" costs three words and keeps the claim true.",
      ],
    },
  ],
};
