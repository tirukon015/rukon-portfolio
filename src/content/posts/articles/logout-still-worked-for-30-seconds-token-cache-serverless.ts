import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "logout-still-worked-for-30-seconds-token-cache-serverless",
  title: "Logout Still Worked for 30 Seconds: Token Caches on Serverless",
  description:
    "A token verification cache meant a signed-out session kept working for up to 30 seconds. Why evicting on sign-out does not fix it on serverless, and why the answer was a small measured bound.",
  date: "2026-12-27",
  category: "Full-Stack Development",
  tags: ["Authentication", "Caching", "Serverless", "Supabase Auth", "FastAPI", "Security"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Token Verification Cache and Logout Delay",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "supabase-google-sign-in-redirects-to-localhost-with-token",
    "testing-an-llm-app-without-calling-paid-apis",
    "every-policy-was-correct-and-every-policy-was-inert",
  ],
  sections: [
    {
      heading: "The problem: a request after logout still succeeded",
      body: [
        "If your API caches the result of verifying an access token, sign-out does not take effect until that cache entry expires. This is a short note on finding that in [ResearchForge](/work/researchforge), a university project whose FastAPI backend verifies Supabase access tokens, and on why the fix was a number rather than a mechanism.",
        "Each private request verifies the caller's token with Supabase Auth. One page load fires several API calls within about a second, so the backend kept a small in-memory cache of verified tokens to collapse that burst into one check. The window was 30 seconds. A live logout test against production showed what that meant: sign out, make a request with the old token, and the request succeeded. On a shared computer, \"log out\" has to mean it.",
        "The comment above the constant had claimed revocation was effectively immediate. It was not, and a comment the value contradicts is worse than no comment.",
      ],
    },
    {
      heading: "Why evicting on sign-out does not fix it",
      body: [
        "The tempting fix is to delete the token from the cache when the user signs out. On a single long-running server that would work. The API runs as serverless functions, so there may be several warm instances at once, each with its own in-memory cache. Evicting on the instance that handled the sign-out leaves the others still holding the token. That fix looks complete in a code review and is racy in production.",
        "Dropping the cache entirely would make revocation immediate, at the cost of a round trip to the auth service for every call in every page load. A shared cache would need a new piece of infrastructure for a university project's login. Neither was worth it for this.",
      ],
    },
    {
      heading: "The fix: a small, measured, documented bound",
      body: [
        "The time-to-live went from 30 seconds to 5. That still covers a page load's burst of calls, and bounds post-logout validity to roughly the time it takes to close the tab. The cache is also capped at 512 entries and cleared when full, because it is a latency optimisation and never a source of truth.",
        {
          type: "code",
          lang: "python",
          code: `# It cannot be driven to zero without giving up the cache entirely, and it
# cannot be fixed by evicting on sign-out either: the API runs as several
# serverless instances ...
_CACHE_TTL_SECONDS = 5.0
_CACHE_MAX_ENTRIES = 512`,
          caption: "From src/api/auth.py.",
        },
        "The bound is asserted in a test so it cannot quietly grow again, and it is listed as a known limitation on the project page: a revoked session stays valid for up to about five seconds.",
      ],
    },
    {
      heading: "Measuring it on the deployed system",
      body: [
        "A live script signed in, confirmed a library request returned 200, signed out, and kept sampling with the old token:",
        {
          type: "table",
          head: ["Time after sign-out", "Response"],
          rows: [
            ["1.6 s", "200, still accepted"],
            ["3.9 s", "200, still accepted"],
            ["6.1 s", "401, refused"],
            ["8.0 s to 20.7 s", "401 on every sample"],
          ],
          caption: "From the ResearchForge evaluation evidence.",
        },
        "One detail from the evaluation is worth repeating: an earlier version of this live test asserted that the token was refused immediately after sign-out, and it failed. The assertion was wrong, not the system, because the system was documented to allow up to five seconds. A test should check the guarantee you actually made. The rest of the testing approach is in [Testing an LLM App Without Calling a Paid API](/blog/testing-an-llm-app-without-calling-paid-apis), and the account flows are in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
