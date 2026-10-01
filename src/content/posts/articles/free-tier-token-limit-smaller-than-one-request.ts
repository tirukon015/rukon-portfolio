import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "free-tier-token-limit-smaller-than-one-request",
  title: "When a Per-Minute Token Limit Is Smaller Than One Request",
  description:
    "A free-tier limit of 7,000 input tokens per minute, and research papers needing 7,920 to 20,362 tokens per call. Why waiting cannot fix that, and how a working fallback hid it.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["LLM", "Groq", "Rate Limits", "Free Tier", "AI Engineering"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Free-Tier Token Limit Smaller Than One Request",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "evaluating-an-llm-app-when-your-own-system-hides-the-result",
    "when-not-to-fall-back-to-another-ai-provider",
    "llm-rate-limits-and-sdk-hidden-retries",
    "whole-document-context-instead-of-rag-for-paper-analysis",
  ],
  sections: [
    {
      heading: "The error: request too large for tokens per minute",
      body: [
        "If you are sending whole documents to a hosted model on a free or entry tier and seeing errors that mention input tokens per minute, this is for you. The limit may not be a pacing problem at all. In [ResearchForge](/work/researchforge), a university project that analyses research papers, it turned out that no amount of waiting could make a single request fit.",
        "The configured primary provider was Groq running qwen3.6-27b. With the fallback provider switched off, every paper in the evaluation failed, and Groq's own error text gave the reason: the request was too large for the model on the organisation's on-demand tier, against a limit on input tokens per minute of 7,000.",
      ],
    },
    {
      heading: "The numbers",
      body: [
        "ResearchForge sends the whole paper as context rather than retrieved fragments, so every call carries the full text. The token counts below are what Groq reported as requested for one call on each paper:",
        {
          type: "table",
          head: ["Paper (arXiv id)", "Pages", "Input tokens requested", "Limit per minute", "Over by"],
          rows: [
            ["1903.10676", "6", "7,920", "7,000", "1.1x"],
            ["1706.03762", "15", "11,745", "7,000", "1.7x"],
            ["2004.04228", "13", "12,661", "7,000", "1.8x"],
            ["1810.04805", "16", "18,498", "7,000", "2.6x"],
            ["2005.11401", "19", "20,362", "7,000", "2.9x"],
          ],
          caption: "From the ResearchForge evaluation, run against the deployed system.",
        },
        "Even the shortest paper, six pages, was over. One caveat on that row: its figure comes from the diagnostic run that first identified the ceiling, made directly against the application origin. Later attempts to re-measure it returned a plain rate-limit response, because the repeated probing had itself spent the per-minute budget, so the original figure is kept rather than re-measured.",
      ],
    },
    {
      heading: "Why this is not a pacing problem",
      body: [
        "A per-minute allowance is normally something you satisfy by waiting: spread the calls out, honour the retry delay, and the budget refills. That reasoning assumes each request fits inside the budget on its own. A single request of 7,920 tokens can never fit inside a 7,000-token-per-minute allowance, however long the system waits, because the allowance is checked against that one request.",
        "That changes what the right response is. Retrying is pointless and spends time. Backing off is pointless. The only fixes are a smaller request, which for ResearchForge would mean giving up whole-paper context and the cross-section reasoning it exists for, or a tier or provider whose limit accepts a whole paper. It also means the error should not be treated like an ordinary 429 that invites the user to try again in a minute.",
      ],
    },
    {
      heading: "How a working fallback hid it",
      body: [
        "With both providers enabled and Groq as primary, all five papers completed. Every one was written by the fallback, Anthropic's claude-opus-5, and the interface showed nothing wrong. The primary had not produced a single analysis, and nobody would have known from using the product.",
        "It was visible only because each stored analysis records which provider actually produced it and whether the fallback was used, and the results were grouped by that record. The full account of how that evaluation was run, including a CDN that hid the error text and a cache that interfered with measurement, is in [Evaluating an LLM App When Your Own System Hides the Result](/blog/evaluating-an-llm-app-when-your-own-system-hides-the-result).",
      ],
    },
    {
      heading: "What I did with the finding",
      body: [
        "I did not chunk papers to squeeze under the limit, because that would trade away the reason the architecture exists to rescue a provider on its free tier. Instead the result is stated where people will read it. The project page lists ResearchForge as effectively single-provider: the two-provider design works and the fallback is verified live, but genuine redundancy is not achieved until a primary is configured whose limits accept a whole paper. That is on the roadmap as a configuration change, not a code change, since switching the primary is an owner setting.",
        "The broader check is cheap to run before building anything: take your largest realistic input, count its tokens, and compare it with the per-request and per-minute limits of the tier you plan to use. If one request does not fit, no retry policy will save it.",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
