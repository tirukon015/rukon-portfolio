import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "when-not-to-fall-back-to-another-ai-provider",
    title: "When Not to Fall Back to Another AI Provider",
    description:
      "Automatic failover between model vendors is easy to build and easy to build wrong. Most errors should never trigger it.",
    date: "2026-09-06",
    category: "AI & Automation",
    tags: ["LLM", "AI Engineering", "Architecture", "Reliability", "Python"],
    contentType: "AI Engineering",
    searchIntent: "problem-aware",
    relatedProjects: ["researchforge"],
    relatedPosts: [
      "making-an-llm-admit-the-paper-does-not-say",
      "why-system-maintenance-matters-after-deployment",
    ],
    sections: [
      {
        heading: "The abstraction first",
        body: [
          "ResearchForge, the university project this comes from, generates through a provider interface rather than a vendor SDK. The analysis service depends on the interface and never on a vendor, each vendor's SDK is imported only inside its own provider module, and the concrete provider is built by a factory using a local import, so adding a vendor never forces every caller to import every SDK.",
          "The practical payoff is small and constant: switching the primary vendor is one environment variable, and adding a vendor is one new file. The larger payoff is that the rest of the codebase never learns which model it is talking to, so no vendor quirk can leak into the analysis logic and quietly become load-bearing.",
        ],
      },
      {
        heading: "Fallback is the easy part to get wrong",
        body: [
          "With two providers behind one interface, automatic failover is about fifteen lines. Catch the error, try the other one, return whichever answers. That version is worse than having no fallback at all.",
          "The reason is that most errors are not vendor-specific. A PDF that fails validation will fail validation on the other vendor. A response that fails schema validation will very likely fail it again. A missing API key is a deployment problem, and trying the second vendor turns a clear configuration error into a confusing one.",
          "In every one of those cases a blind fallback spends a second vendor's quota, doubles the user's wait, and produces the same error at the end. It converts a fast, clear failure into a slow, muddled one.",
        ],
      },
      {
        heading: "The rule that survived",
        body: [
          "The fallback fires once per analysis, and only for a rate limit or a temporary provider failure.",
          "Those two are the entire legitimate category: conditions that are genuinely about that vendor at that moment, and where a different vendor plausibly gives a different outcome. Everything else fails immediately with the real reason.",
          "Once per analysis matters too. Not once per model call, once per analysis. Three sequential calls each allowed their own fallback is a request that can bounce between vendors five times before failing, and there is a 300-second function ceiling to fit inside.",
        ],
      },
      {
        heading: "Errors have to be distinguishable to be handled",
        body: [
          "None of the above is expressible unless the error types are distinguishable in the first place, which is why vendor exceptions get wrapped in project-owned types at the provider boundary.",
          "A missing API key is separated out from other failures specifically because it is an operator problem rather than a user's fault, and it maps to a different status code. Status codes are chosen so the frontend can tell cases apart without parsing message text: too large, unusable PDF, unusable model reply, no credentials configured. Nothing expected returns a 500.",
          "Parsing vendor error strings to decide control flow is the thing to avoid here. Those strings are not an API, they change without notice, and a fallback rule built on substring matching fails open in the worst possible way, at the moment the vendor is already having a bad day.",
        ],
      },
      {
        heading: "Record what actually answered",
        body: [
          "Every stored analysis records which provider and model actually produced it, whether the fallback was used, and how long the call took.",
          "This turns out to be the feature I would least want to remove. Without it, an output that looks off has no explanation attached to it, and 'which model wrote this one?' becomes unanswerable a week later. With it, the question is a column.",
          "It also makes the fallback observable rather than invisible. A silent failover is indistinguishable from no failover right up until the bill arrives, or until quality shifts for a week and nobody can say why.",
        ],
      },
      {
        heading: "The general shape",
        body: [
          "Retry the conditions that are about the vendor. Fail fast on the conditions that are about the request. Wrap vendor errors in your own types so you can tell the two apart. Bound the retry at the level of the user's operation, not the individual call. Record what answered.",
          "None of that is specific to language models. It is ordinary reliability engineering, and the only reason it is worth saying about LLM providers is that the cost of an unnecessary retry is unusually high and unusually easy to miss.",
        ],
      },
    ],
    related: [{ label: "ResearchForge case study", href: "/work/researchforge" }],
  };
