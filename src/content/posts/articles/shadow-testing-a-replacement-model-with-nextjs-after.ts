import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "shadow-testing-a-replacement-model-with-nextjs-after",
  title: "Shadow-Testing a Replacement Model With Next.js after(), Without the User Waiting",
  description:
    "How RPOMS AI is built to run a candidate model on real requests after the response is sent, record whether it agreed, and never show it. The lifecycle around it, and its limits.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["Next.js", "after()", "Shadow Testing", "MLOps", "Model Lifecycle", "PostgreSQL"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Shadow Testing an AI Model With Next.js after()",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "qualification-gate-computing-what-a-model-is-allowed-to-decide",
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
    "a-vision-model-that-only-observes",
    "evaluating-a-vision-model-with-only-thirteen-examples",
  ],
  sections: [
    {
      heading: "Judging a new model on real traffic before it decides anything",
      body: [
        "This is for anyone who needs to replace a model in a live system and wants evidence first. A fixed reference set tells you how a model does on the examples you had. It says nothing about the photos people actually send. The standard answer is a shadow test: the candidate runs on real requests beside the production model, its answer is recorded, and nobody sees it.",
        "[RPOMS AI](/work/rpoms-ai) has this built in. One thing needs saying up front: it has never run on real traffic. There is no model active in production, and the system has not been used on real line photos. What follows is the design and code as built and tested, not results.",
      ],
    },
    {
      heading: "The lifecycle a shadow sits in",
      body: [
        {
          type: "flow",
          steps: ["CANDIDATE", "EVALUATION", "SHADOW", "APPROVED", "PRODUCTION", "RETIRED"],
          caption: "Nothing moves on its own. Every transition is an administrator action.",
        },
        "A model is registered as a CANDIDATE by name, with nothing measured. Running it over the reference set moves it to EVALUATION, and that stores the evaluation and the [qualification](/blog/qualification-gate-computing-what-a-model-is-allowed-to-decide) computed from it. Only an evaluated model can become SHADOW, APPROVED or PRODUCTION. The allowed transitions are a table checked inside a database transaction with the model's row locked:",
        {
          type: "code",
          lang: "ts",
          code: `const allowed: Record<ModelStatus, ModelStatus[]> = {
  CANDIDATE: ["RETIRED"],
  EVALUATION: ["SHADOW", "APPROVED", "RETIRED"],
  SHADOW: ["APPROVED", "EVALUATION", "RETIRED"],
  APPROVED: ["PRODUCTION", "SHADOW", "RETIRED"],
  PRODUCTION: ["APPROVED"],
  RETIRED: ["EVALUATION"],
};`,
          caption: "From setModelStatus in src/lib/db/repo.ts. A candidate cannot skip evaluation, and a test proves it.",
        },
        "Two uniqueness rules are enforced in the same transaction. Activating a model demotes the current PRODUCTION model to APPROVED. Making a model SHADOW moves any other shadow back to EVALUATION. One shadow at a time means every comparison has one meaning.",
      ],
    },
    {
      heading: "Running the shadow with after()",
      body: [
        "The public check endpoint does its real work, saves the result and builds the response. Before returning, it schedules the shadow run with `after()` from `next/server`. That callback runs after the response has been sent, so the user never waits for it.",
        {
          type: "code",
          lang: "ts",
          code: `if (id && result.quality.usable) {
  const checkId = id;
  after(async () => {
    const shadow = await resolveShadow();
    if (!shadow) return;
    try {
      const r = await runPipeline(bytes, shadow.provider, shadow.model.evaluation!.qualification, knowledge);
      await recordShadow({
        checkId,
        productionModelId: vision.model?.id ?? null,
        shadowModelId: shadow.model.id,
        productionVerdict: d.verdict,
        shadowVerdict: r.decision.verdict,
      });
    } catch (e) {
      log({ requestId, checkId, shadowError: e instanceof Error ? e.name : "error" });
    }
  });
}`,
          caption: "Simplified from src/app/api/check/route.ts.",
        },
        "A few choices in there are deliberate. The shadow only runs when the check was saved, because a comparison needs a row to attach to, and when the photo passed the quality gate, because there is no point spending inference on a photo nobody could judge. It goes through the same `runPipeline` as production, under the shadow model's own qualification, so the comparison is between two complete decisions and not two raw model outputs. A shadow failure is logged by error name and swallowed. It can never affect the response, which has already gone.",
      ],
    },
    {
      heading: "What gets recorded",
      body: [
        "Each run writes one row to `shadow_comparisons`: the check, both model ids, both verdicts, and whether they agreed. The admin statistics compare the shadow two ways: against production, and against later human reviews, excluding reviews that were themselves UNCLEAR. The second comparison is the one that matters. Agreeing with a weak production model is not evidence of quality. Agreeing with a person who looked at the unit is.",
        "The public response never mentions the shadow. The check endpoint's response body is tested to contain no trace, model identity, storage id or client hash.",
      ],
    },
    {
      heading: "Rollback, and a correction to my own documentation",
      body: [
        "Rolling back is a status change, not a deploy: move the PRODUCTION model to APPROVED. The lifecycle document says the public then falls back to the previous model. The test suite says something different. After activating model B, which demotes A to APPROVED, rolling B back leaves no active model at all. The public then sees \"AI check unavailable\" until someone re-activates A. That is safe, but it is a manual second step, and the test is the accurate description.",
      ],
    },
    {
      heading: "Costs to think about before switching it on",
      body: [
        "Scheduling work with `after()` is not free. On Vercel it still runs inside the invocation, bounded by the function's duration limit. The public check already spends most of its 60 seconds on a model call that takes a median of 41 seconds on the current host.",
        "The bigger issue is the inference host. The [gateway in front of Ollama](/blog/exposing-local-ollama-to-vercel-through-a-token-gateway) runs one analysis at a time. A shadow analysis on the same laptop would occupy that single slot for another 40-odd seconds, and the next public check would queue behind it. On this host, a shadow model would cost real users time even though they never see it. That has not been measured, because it has never run. A realistic shadow test needs either a second inference host or a queue that runs shadows only when the host is idle.",
        "Improvement comes only from examples an administrator has verified. Nothing is learned automatically, and no path turns a public upload into a production model. The shadow mechanism fits that rule: it collects evidence and decides nothing.",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "A Vision Model That Only Observes", href: "/blog/a-vision-model-that-only-observes" },
  ],
};
