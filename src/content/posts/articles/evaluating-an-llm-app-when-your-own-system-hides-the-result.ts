import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "evaluating-an-llm-app-when-your-own-system-hides-the-result",
  title: "Evaluating an LLM App When Your Own System Hides the Result",
  description:
    "Evaluating a deployed LLM app with no labelled data, and the three things that produced plausible but wrong measurements: a content-keyed cache, a CDN and a fallback that worked too well.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["LLM", "Evaluation", "Caching", "Observability", "AI Engineering", "Testing"],
  contentType: "AI Engineering",
  searchIntent: "problem-aware",
  seoTitle: "Measuring an LLM App: Cache, CDN and Fallback Traps",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "free-tier-token-limit-smaller-than-one-request",
    "caching-llm-results-by-content-hash-without-leaking-uploaders",
    "when-not-to-fall-back-to-another-ai-provider",
    "testing-an-llm-app-without-calling-paid-apis",
  ],
  sections: [
    {
      heading: "The problem: measuring a system built to recover quietly",
      body: [
        "A well-built LLM application hides failure from its users. It caches results, retries, falls back to another provider and shows friendly errors. Every one of those is correct in production, and every one of them can make an evaluation lie. This article is for anyone measuring their own deployed LLM feature, and it describes three places where [ResearchForge](/work/researchforge) produced plausible, wrong numbers, and what made the real answer visible.",
        "The setting: a university project that analyses academic PDFs with two providers behind one interface, Groq's qwen3.6-27b as the configured primary and Anthropic's claude-opus-5 as the automatic fallback. The evaluation ran against the deployed system with five openly available arXiv papers under three configurations, fifteen live uploads in total.",
      ],
    },
    {
      heading: "What to measure when there is no ground truth",
      body: [
        "Accuracy, precision, recall and F1 need labelled answers. There is no single correct literature review of a paper, and the project had no labelled set of correct research gaps, so any classification metric would have been fabrication presented as rigour. None is reported.",
        "What can be observed without ground truth still says a lot: whether each run completed, which provider actually produced it, whether the fallback fired, latency, how much structure the output contained, and whether invalid output is rejected. Across the ten runs that completed, a new analysis of a full paper took a median of 98.8 seconds, from 72.6 to 115.2. Output counts were recorded too, for example a median of nine research gaps per paper, with the explicit caveat that they measure how much was produced, not whether it was right.",
        "One more honest result belongs here: none of the ten analyses reported insufficient evidence. That is expected for complete, well-structured papers, but it means the evaluation never exercised the decline path. That safeguard is verified by the automated suite, not by this corpus.",
      ],
    },
    {
      heading: "Trap one: the cache answered a question nobody asked it",
      body: [
        "ResearchForge caches analyses by a hash of the paper's extracted text, deliberately not by user or provider, so a second upload of the same paper reuses the first result. That is exactly right in production. In an evaluation that uploads the same papers under different provider configurations, it means the second configuration can be served the first configuration's results.",
        "It happened twice. Once, two papers returned successful responses under a configuration intended to exercise a different provider. Once, the cache test's own fixture was still cached from a previous run, so the \"first upload\" was not a first upload. Both produced numbers that looked fine.",
        "Neither was a defect in the cache, which behaved as designed. Both were defects in measurement, fixed by clearing the relevant cache rows before measuring. The general lesson is the one worth keeping: a correctness-preserving optimisation can invalidate an experiment silently. Every cached response carries a `cache_hit` flag, and an evaluation should check it before trusting a latency or a provider comparison.",
      ],
    },
    {
      heading: "Trap two: the CDN replaced the error that explained everything",
      body: [
        "The custom domain is served through a content delivery network that replaces an origin error body with a short generic message. Every failed analysis therefore looked the same and carried no explanation, whatever had actually gone wrong.",
        "Sending the same requests directly to the application origin returned the real provider message. That message named the limit behind the whole evaluation result: the primary's free tier allows 7,000 input tokens per minute, and every corpus paper needed more than that in a single call. Without going around the CDN, the central finding would have stayed a generic error.",
        {
          type: "callout",
          label: "Practical rule",
          text: "When errors look identical at the edge, reproduce against the origin before theorising. Your application may be telling you exactly what is wrong one hop further in.",
        },
      ],
    },
    {
      heading: "Trap three: the fallback worked so well it hid a dead provider",
      body: [
        "The three configurations only make sense read together:",
        {
          type: "table",
          head: ["Configuration", "Completed", "By the configured primary"],
          rows: [
            ["Claude primary, both enabled", "5 of 5", "5 of 5"],
            ["Groq primary, both enabled", "5 of 5", "0 of 5"],
            ["Groq only, Claude switched off", "0 of 5", "0 of 5"],
          ],
          caption: "Live evaluation of the deployed system, five papers per configuration.",
        },
        "The second row is the dangerous one. Every paper completed, the interface showed no error, and a user would have noticed nothing, but not one of those analyses was written by the provider the owner had selected. The fallback did exactly what it was designed to do, and in doing it perfectly, made a provider that could not analyse a single paper invisible. The third configuration was added during the evaluation specifically because the second had fallen back every time, which meant it had measured the fallback rather than Groq.",
        "The failure was detectable for one reason: every stored analysis records which provider and model actually produced it and whether the fallback was used, and results were grouped by that record rather than by configuration. Grouping by configuration would have reported that both providers performed comparably while measuring the same provider twice. The fallback rules themselves are in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider).",
      ],
    },
    {
      heading: "What I would do from the start next time",
      body: [
        {
          type: "list",
          items: [
            "Group every result by what the system recorded as having happened, never by what the configuration asked for.",
            "Turn off, or clear, anything that can answer from memory before measuring, and check the flag that says it did.",
            "Run one configuration with the safety net removed, so a component's own failure rate is measured rather than its rescuer's.",
            "Read errors at the origin, not through layers designed to make them polite.",
            "State the threats to validity: five English-language papers from one field, each analysed once per configuration, assessed by me rather than independently.",
          ],
        },
        "The honest summary the evaluation produced is that ResearchForge is dual-provider in architecture and single-provider in effect, and the project page says so. How the cache works is in [Caching LLM Analyses by Content Hash](/blog/caching-llm-results-by-content-hash-without-leaking-uploaders).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
