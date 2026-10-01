import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "wrong-supabase-key-returns-200-and-zero-rows",
  title: "The Wrong Supabase Key Doesn't Fail. It Returns 200 and Zero Rows.",
  description:
    "A publishable Supabase key in a server slot meant for a secret one: every read succeeded with no rows, the dashboard showed confident zeros, and the health check said all was well.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Supabase", "Row Level Security", "Configuration", "Health Checks", "Python"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Supabase Publishable Key Returns Empty Results",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "when-production-breaks-and-nothing-changed-paused-free-tier-database",
    "every-policy-was-correct-and-every-policy-was-inert",
    "calling-postgrest-from-python-what-mocks-miss",
    "sharing-one-supabase-project-between-two-apps",
  ],
  sections: [
    {
      heading: "Symptom: an empty library that was not empty",
      body: [
        "If your Supabase-backed server returns HTTP 200 with an empty array for tables you know contain rows, and inserts fail with 401, check which key is in which environment variable before you check anything else. This is a short note on how that happened in [ResearchForge](/work/researchforge), a university project with a FastAPI backend, and why the fix was a code change rather than only a new key.",
        "The deployed dashboard read \"Papers Analysed: 0, Research Gaps: 0, Saved Papers: 0\". The health endpoint reported the library as connected. It looked like a new deployment with no data. It survived two working sessions that way, because nobody investigates a number that looks plausible.",
      ],
    },
    {
      heading: "Cause: a browser key in a server slot",
      body: [
        "The environment variable was named `SUPABASE_SERVICE_ROLE_KEY`, and it held a key beginning `sb_publishable_`: Supabase's public, browser-safe key. The name said service role; the value was the opposite of one.",
        "It did not fail, and that is the whole problem. The tables had Row Level Security policies of the form `user_id = auth.uid()`. With a publishable key and no user token, `auth.uid()` is NULL, so no row matches. PostgREST therefore answered every SELECT with 200 and zero rows, and refused every INSERT with 401. The reads are the dangerous half: nothing errors, so the interface renders \"0\" as though it were a measured fact about an empty library, when the truth was that the server could not see its own data.",
        {
          type: "callout",
          label: "The mirror image",
          text: "The ResearchForge defect fixed the following day was the opposite: with a genuine service-role key in place, every policy was bypassed and users could see too much. That story is in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert). Here the policies worked and the key could see nothing. Both are the same lesson: which credential you connect with decides what your policies mean.",
        },
      ],
    },
    {
      heading: "Fix: check the key type before making any request",
      body: [
        "Replacing the key was a dashboard action. The code change made the failure impossible to mistake for data:",
        {
          type: "code",
          lang: "python",
          code: `@property
def supabase_key_is_publishable(self) -> bool:
    return self.supabase_service_role_key.strip().startswith("sb_publishable_")

@property
def has_database(self) -> bool:
    if self.supabase_key_is_publishable:
        return False
    return bool(self.supabase_url.strip() and self.supabase_service_role_key.strip())`,
          caption: "Simplified from src/config.py.",
        },
        "With `has_database` false, `/health` reports the library as not connected, the library routes answer 503 naming the kind of key required, and the dashboard's existing \"Not connected\" state appears instead of zeros. No interface change was needed; the interface already knew how to say \"not connected\". It had simply been told the wrong thing.",
        "The check rejects one known-wrong prefix. It is deliberately not a whitelist of accepted formats: projects created before Supabase's newer key format still hold a legacy `service_role` JWT, and breaking those to fix this would trade one outage for another. 22 tests cover it, including that the statistics endpoint returns 503 rather than a substantiated-looking zero, and that neither the key nor the project host appears in any message shown to a user.",
      ],
    },
    {
      heading: "Two general rules",
      body: [
        "A health check should report whether the dependency is usable, not whether a variable is set. \"Library: true\" next to a server that could read nothing was worse than no health check, because it pointed investigation away from the cause.",
        "And an empty result is a claim. \"You have no papers\" states something about the world; a deployment that cannot see its data has no right to say it. ResearchForge answers 503 when storage is unavailable, and shows \"Not connected\" rather than 0, for exactly that reason. The backend was later changed to reach user data as the signed-in user rather than with a server key at all, which is described on the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
