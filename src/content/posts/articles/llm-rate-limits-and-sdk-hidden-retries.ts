import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "llm-rate-limits-and-sdk-hidden-retries",
  title: "The Retries You Didn't Write: LLM Rate Limits and SDK Hidden Retries",
  description:
    "A client library's default retries turned one rate-limited analysis into twelve requests against a free tier of twenty. Removing requests, telling limits apart, and returning 429 with Retry-After.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["LLM", "Rate Limits", "Retry-After", "FastAPI", "CORS", "Python"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "LLM 429s, Hidden SDK Retries and Retry-After",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "making-an-invalid-config-state-unrepresentable-in-postgres",
    "when-not-to-fall-back-to-another-ai-provider",
    "free-tier-token-limit-smaller-than-one-request",
    "evaluating-an-llm-app-when-your-own-system-hides-the-result",
  ],
  sections: [
    {
      heading: "The problem: a rate limit that reported itself as a bug",
      body: [
        "This is for anyone calling a hosted model on a small quota and seeing rate-limit errors more often than their traffic can explain. In [ResearchForge](/work/researchforge), a university project that analyses research papers with three model calls per upload, the first symptom was a production error reading \"Unexpected generation failure: Error code: 429\". It looked like a defect in the application rather than a quota an operator could act on.",
        "At that point the provider was Google Gemini, which has since been retired from ResearchForge in favour of Anthropic and Groq. The mechanism is general, though, and so is the fix.",
      ],
    },
    {
      heading: "Two causes, neither in my code",
      body: [
        "The first cause was error recognition. The Gemini client used for these calls raised errors from a private module whose `APIError` class was a different class from the public one the code matched on. No error from that path was ever recognised, including a rejected API key, which would have been reported as a generic 502 instead of the 503 reserved for \"an operator must fix the deployment\". Importing the private class would have fixed the symptom until the next SDK release. Instead, errors are identified by what they are, their HTTP status, which both class hierarchies expose, with connection failures matched along the exception's `__cause__` chain.",
        "The second cause was worse: retries already existed, and they were the problem. That client layer retried 408, 409, 429 and 5xx responses by default, up to three times. An analysis is three sequential calls, so a single rate-limited analysis could fire twelve requests against a free tier of twenty, converting a passing limit into an exhausted one. And the retries were blind: they read the `Retry-After` header but not the retry delay the API actually put in the body of its 429, so the client slept half a second when the API had asked for forty-four.",
      ],
    },
    {
      heading: "The fix removed requests instead of adding them",
      body: [
        {
          type: "list",
          items: [
            "429 was taken out of the SDK's retryable set entirely. 5xx kept one retry, because a transient server error mid-analysis is real, recoverable, and costs no quota when it succeeds.",
            "A rate limit is retried at most once, and only with positive grounds: the provider stated a delay, the delay fits a 60-second cap, and the analysis's waiting budget can still afford it. The code has two send calls and no loop, so \"at most once\" is the shape of the code rather than a counter someone can get wrong.",
            "An exhausted quota is never retried. A per-day quota, or a delay too long to sit out, is treated as spent, because a second request against a spent allowance cannot succeed.",
            "A 429 with no stated delay is reported as a rate limit of unknown duration. The retry delay stays empty rather than becoming a guess the interface would count down from.",
          ],
        },
        "Worst case per rate-limited pass became two requests, against the SDK default's four. Whether other client libraries retry by default is worth checking for every provider you use; the Anthropic provider in ResearchForge, for example, leaves that SDK's own bounded retrying in place, and its code says so.",
      ],
    },
    {
      heading: "A vendor-neutral rate-limit error",
      body: [
        "The provider layer raises one project-owned exception for every vendor, carrying the two facts that lead to different advice:",
        {
          type: "code",
          lang: "python",
          code: `class LLMRateLimitError(LLMError):
    def __init__(self, message, *, retry_after_seconds=None, quota_exhausted=False):
        super().__init__(message)
        # None means "the provider gave no timing", NOT "wait zero".
        self.retry_after_seconds = retry_after_seconds
        # True only on POSITIVE evidence of a long allowance being spent.
        self.quota_exhausted = quota_exhausted`,
          caption: "Simplified from src/rag/llm/base.py.",
        },
        "The Groq provider fills it from the `retry-after` header, or from Groq's `x-ratelimit-reset-*` headers written like `2m59.56s`, and marks the quota exhausted only when the delay is over two minutes or the message mentions a daily limit. The distinction matters because telling someone to retry in a minute when their daily free tier is gone wastes the little quota that remains.",
        "A rate limit is also not a reason to switch vendors blindly; the separate rule for that is in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider).",
      ],
    },
    {
      heading: "429, not 502, and headers the browser can actually read",
      body: [
        "The API now answers a rate limit with 429 rather than 502. A 502 says the upstream is broken; it is not, and only one of those two is worth retrying. Two headers carry the detail, set only from what the provider said:",
        {
          type: "code",
          lang: "python",
          code: `if exc.retry_after_seconds is not None:
    # Whole seconds, rounded up, so the client never retries early.
    headers["Retry-After"] = str(max(1, math.ceil(exc.retry_after_seconds)))
if exc.quota_exhausted:
    headers["X-Quota-Exhausted"] = "true"`,
          caption: "From src/api/analyze.py.",
        },
        "One easy-to-miss detail: a browser hides every response header outside a short CORS safelist from JavaScript, so both headers were added to the FastAPI CORS middleware's `expose_headers`. Without that, a cross-origin frontend would receive a 429 with no way to read how long to wait.",
      ],
    },
    {
      heading: "What the user sees",
      body: [
        "The frontend has a separate \"rate limited\" error kind, so the wording is no longer \"this is a problem with the AI service\". A temporary limit shows the countdown the provider asked for and holds the Analyse button until it expires. An exhausted quota says so plainly and offers no retry. With no stated delay the button stays live and the notice asks for one attempt, because disabling it indefinitely would strand the user. The staged PDF survives every failure, so nothing has to be re-uploaded.",
        "The analyse action also gained an in-flight guard held in a React ref. The button unmounts while working, but that is a rendering consequence; two clicks in one React batch would both have passed a state flag, and every duplicate costs three model calls.",
        "Later, the evaluation found a limit that no retry policy could have helped, because a single request was larger than the whole per-minute allowance. That case is described in the [ResearchForge case study](/work/researchforge/case-study) and in [When a Per-Minute Token Limit Is Smaller Than One Request](/blog/free-tier-token-limit-smaller-than-one-request).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
