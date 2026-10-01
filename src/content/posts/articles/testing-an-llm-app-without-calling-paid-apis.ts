import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-an-llm-app-without-calling-paid-apis",
  title: "Testing an LLM App Without Calling a Paid API",
  description:
    "538 tests for an LLM application, none of which call a paid model. FastAPI dependency overrides, a fake provider, generated PDFs, opt-in live tests, and where fakes stop telling the truth.",
  date: "2026-12-15",
  category: "AI & Automation",
  tags: ["Testing", "pytest", "FastAPI", "LLM", "Dependency Injection", "Python"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Testing FastAPI LLM Apps Offline With Fakes",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "every-policy-was-correct-and-every-policy-was-inert",
    "calling-postgrest-from-python-what-mocks-miss",
    "one-pydantic-schema-two-llm-vendors-structured-output",
    "testing-without-paid-apis-or-hardware-and-where-fakes-lie",
  ],
  sections: [
    {
      heading: "The problem: every test run should not cost money",
      body: [
        "An LLM application that calls a paid API from its test suite has three problems: the suite costs money, it is slow, and it is not deterministic, so a failure might be your code or might be the model having a different day. [ResearchForge](/work/researchforge), a university project that analyses research papers with two model providers, ended with 538 passing tests, 522 backend with pytest and 16 frontend with Vitest, and not one of them calls a paid interface. This is how that was structured, and where it stopped being enough.",
      ],
    },
    {
      heading: "Make the expensive thing a dependency",
      body: [
        "The analysis endpoint does not construct its model provider. It receives it, along with its settings and the signed-in user, through FastAPI's dependency injection:",
        {
          type: "code",
          lang: "python",
          code: `async def analyze(
    user: AuthUser = Depends(require_user),
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    provider: LLMProvider = Depends(get_provider),
) -> AnalysisResponse:`,
          caption: "The signature of POST /api/analyze in src/api/analyze.py.",
        },
        "That is the practical reason the provider is a parameter. FastAPI's `app.dependency_overrides` can then replace any of those dependencies for the duration of a test, and the endpoint runs its real code against a fake:",
        {
          type: "code",
          lang: "python",
          code: `@pytest.fixture
def client():
    fake = FakeLLMProvider()
    sign_in_as(USER_A)
    app.dependency_overrides[get_provider] = lambda: fake
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)
    test_client = TestClient(app)
    test_client.fake = fake
    yield test_client
    app.dependency_overrides.clear()`,
          caption: "From tests/test_analysis.py. Settings(_env_file=None) keeps a developer's real .env out of the tests.",
        },
        "`sign_in_as` overrides `require_user` the same way, so pipeline tests do not have to forge tokens, while the authentication tests remove the override and assert that every private route refuses an anonymous request.",
      ],
    },
    {
      heading: "A fake that records what it was asked",
      body: [
        "`FakeLLMProvider` implements the same interface as the real providers. It returns valid instances of the requested Pydantic model, records which models it was asked for, and can be told to raise any error. That makes it possible to assert behaviour, not just output: that exactly three structured calls were made in order, that a long paper triggers the chunk-digest calls, that a rate-limit error becomes a 429 with the right headers, and that a validation failure becomes a 502 with nothing cached.",
        "Inputs are generated too. Rather than committing real papers or adding a PDF-authoring library as a dependency, a small test module emits minimal but valid PDF bytes: text PDFs, a PDF with an empty text layer to stand in for a scan, and long multi-page PDFs for the chunking path. They are synthetic fixtures, never presented as research data.",
        "The database layer gets the same treatment at its own boundary: endpoint tests run against an in-memory repository satisfying the storage interface, and the PostgREST implementation is tested with `httpx.MockTransport`, described in [Calling Supabase's PostgREST Directly From FastAPI](/blog/calling-postgrest-from-python-what-mocks-miss).",
      ],
    },
    {
      heading: "Where the tests went, on purpose",
      body: [
        {
          type: "table",
          head: ["Module", "Tests", "Protects"],
          rows: [
            ["Authentication", "61", "Token verification, expiry, bad credentials"],
            ["LLM providers", "49", "Provider behaviour, error translation, validation"],
            ["Repository", "48", "Every database access path"],
            ["Rate limiting", "42", "Rate-limit recognition and retry discipline"],
            ["Provider router", "36", "Primary and fallback routing, retryable whitelist"],
          ],
          caption: "The five largest backend test modules.",
        },
        "The distribution is not even, and it was not meant to be. Authentication is the largest module on the judgement that a silent failure there costs the most. The suite grew from 9 tests at the first commit, and the count was recorded in each commit message, which made it easy to see when a change arrived without tests.",
      ],
    },
    {
      heading: "Live tests, opt-in only",
      body: [
        "Fakes cannot tell you whether the configured API keys are valid or whether a model name still exists. Five live provider tests cover that, and they are skipped unless `RESEARCHFORGE_LIVE_PROVIDER_TEST=1` is set and the relevant key is present, so they cannot run by accident in CI. Each is one tiny round trip through the structured-output path, which is where a model most often fails even when a plain call works. The structured-output side is in [One Pydantic Schema, Two LLM Vendors](/blog/one-pydantic-schema-two-llm-vendors-structured-output).",
      ],
    },
    {
      heading: "Where fakes stop telling the truth",
      body: [
        "The most important ResearchForge defect passed every one of these tests. The ownership tests modelled Row Level Security with a stub, and the real backend was connecting with a key that bypassed it, so the stub agreed with a belief that was wrong. It was found by signing in as a second real account, and the story is in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert).",
        "So the suite is one of three levels, kept separate because each can pass while another fails: unit tests against fakes, live scripts that run scenarios as two real accounts against the deployed system, and a small set of opt-in provider calls. Offline tests make the code cheap to change. They do not make a guarantee true when the guarantee lives in a system the tests replace.",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
