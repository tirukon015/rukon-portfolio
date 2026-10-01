import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "calling-postgrest-from-python-what-mocks-miss",
  title: "Calling Supabase's PostgREST Directly From FastAPI: The Details a Mock Won't Tell You",
  description:
    "A Python backend talking to Supabase's PostgREST over plain httpx. Embedded ordering, counts in headers, deletes that return 200, reserved characters, and what mock tests can and cannot prove.",
  date: "2026-11-09",
  category: "Full-Stack Development",
  tags: ["PostgREST", "Supabase", "Python", "httpx", "FastAPI", "Testing"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "PostgREST From Python: Gotchas and Tests",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "schema-skew-degrade-one-migration-at-a-time",
    "wrong-supabase-key-returns-200-and-zero-rows",
    "testing-an-llm-app-without-calling-paid-apis",
  ],
  sections: [
    {
      heading: "Why talk to PostgREST directly",
      body: [
        "Supabase exposes PostgreSQL through PostgREST, a REST API generated from the schema. The official client libraries wrap it, but in [ResearchForge](/work/researchforge) the FastAPI backend calls it with plain `httpx`, which was already a dependency, behind a storage-independent repository interface. That keeps the data layer small and explicit, and it means every PostgREST convention is something the code has to get right itself. This is a list of the ones that mattered, for anyone doing the same from Python or any other language.",
        "Requests are made as the signed-in user: the project's anon key in the `apikey` header and that person's access token in `Authorization`, so Row Level Security applies to every query. The key and token never appear in an error message.",
      ],
    },
    {
      heading: "Ordering and limiting an embedded resource",
      body: [
        "The library lists papers with each paper's most recent analysis embedded. The first version put the ordering inside the select:",
        {
          type: "code",
          lang: "text",
          code: `select=...,analyses(...,created_at.desc.limit.1)   -> 400 PGRST100 "failed to parse select parameter"`,
        },
        "PostgREST orders and limits an embedded resource with separate query parameters, prefixed with the resource name, never inside the select parentheses. The select was rejected, the repository mapped the generic failure to 502 exactly as designed, and My Papers, the workspace and part of saving all failed in production. The fix:",
        {
          type: "code",
          lang: "python",
          code: `# Most recent analysis per paper. \`limit\` on an embedded resource applies
# per parent row, so this is one analysis each, not one across the page.
_ANALYSIS_PARAMS = {
    "analyses.order": "created_at.desc",
    "analyses.limit": 1,
}`,
          caption: "From src/db/supabase.py, applied at all three call sites that embed an analysis.",
        },
        "The corrected form was checked against the live PostgREST instance as well as in tests: the old select returns 400 PGRST100 and the new one returns 200. Three regression tests assert the parameter shape directly, because a mock cannot reject bad syntax, and this one had already reached production once.",
      ],
    },
    {
      heading: "Conventions that are easy to get wrong",
      body: [
        {
          type: "table",
          head: ["Behaviour", "What the repository does"],
          rows: [
            ["A total count is not in the body", "Send `Prefer: count=exact` and read the total from the `Content-Range` header, so \"12 of 40\" cannot under-report by counting the page"],
            ["A DELETE that matches nothing returns 200 with an empty list, not 404", "Treat an empty result as not-found, so deleting someone else's paper reads as \"not in your library\""],
            [", . : ( ) are reserved inside filter values", "Strip them from search input, so \"et al., 2019\" is a search rather than a syntax error or an injected filter"],
            ["A foreign-key violation arrives as 23503", "Map it to a conflict: this is the `ON DELETE RESTRICT` that stops deleting a paper a saved review depends on"],
            ["A missing column fails the whole request with 42703", "Step down one schema tier and retry, only for that code"],
          ],
        },
        "The last row has its own article, [When the Code Ships Before the Migration](/blog/schema-skew-degrade-one-migration-at-a-time), because it took two attempts to get right.",
      ],
    },
    {
      heading: "Two writes are not a transaction",
      body: [
        "Saving a paper writes a `papers` row and then an `analyses` row, and saving a cross-paper review writes the review and then its links to papers. Over REST those are separate requests. If the second fails, the first has already succeeded, and the user sees a broken library entry: a paper with no analysis, or a review that names no papers.",
        "So the repository compensates. When the second write fails, it deletes the first and re-raises, so the save either happened or did not. It is honest to call this what it is: a best-effort rollback, not a transaction. If the compensating delete itself fails, it is logged as an error. For a single-user library entry that trade is acceptable; for money it would not be, and the work would belong in a database function instead.",
      ],
    },
    {
      heading: "What 37 mock tests prove, and what they do not",
      body: [
        "For a while the Supabase layer had never executed. The endpoint tests ran against an in-memory repository that satisfied the same interface, which proved the API and its status codes but said nothing about whether this layer built correct requests or read the replies properly.",
        "37 tests closed that gap using `httpx.MockTransport`, returning replies shaped as PostgREST documents them. They assert the things above: both auth headers set and never leaked, the count read from `Content-Range`, reserved characters stripped, the rollback on a failed second write, 23503 becoming a conflict, an empty delete becoming not-found, and a review's papers returned in the user's selection order with a missing id failing the whole request.",
        {
          type: "callout",
          label: "The limit of a mock",
          text: "These tests prove that, given PostgREST's documented behaviour, the code is right. They do not prove the live database behaves that way. The embedded-ordering bug is the proof: it reached production after these tests existed, because a mock returns whatever it is told to and cannot reject syntax the real server rejects.",
        },
        "That gap between a faithful fake and the real system is the same one behind [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert), where tests stubbed Row Level Security and so could not see that it was being bypassed. Unit tests against documented behaviour, plus a short live check of anything a fake has to imitate, is the combination that held up.",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
