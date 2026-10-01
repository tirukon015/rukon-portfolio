import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "qualification-gate-computing-what-a-model-is-allowed-to-decide",
  title: "A Qualification Gate: Computing What a Model Is Allowed to Decide From Its Own Results",
  description:
    "Instead of trusting a model or not, RPOMS AI computes per verdict and per criterion what the model has earned the right to say, from a reference run. The policy, the code and the trade-off.",
  date: "2026-11-02",
  category: "AI & Automation",
  tags: ["AI Engineering", "Model Evaluation", "AI Safety", "TypeScript", "Vision Models", "Qwen2.5-VL"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "A Qualification Gate for AI Model Verdicts",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "four-kinds-of-unclear-decision-states-for-an-ai-check",
    "a-vision-model-that-only-observes",
    "shadow-testing-a-replacement-model-with-nextjs-after",
    "evaluating-a-vision-model-with-only-thirteen-examples",
  ],
  sections: [
    {
      heading: "Trust is not a single switch",
      body: [
        "This is for anyone deploying a model whose accuracy differs by class, which is most models. The usual choices are to trust it or not trust it, with maybe a confidence threshold in between. [RPOMS AI](/work/rpoms-ai) needed something finer. Its vision model was reliable at spotting a couple of kinds of damage and unreliable, in a dangerous direction, about whether a router was clean.",
        "The answer was a qualification gate. From a run over the reference set, the system computes what this particular model, with this particular prompt, is allowed to decide. Whatever it has not earned becomes UNCLEAR, and the public sees \"check manually\". The overall architecture and scores are in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes). This article is about how the gate itself works.",
      ],
    },
    {
      heading: "Two different bars for two different verdicts",
      body: [
        "The two verdicts carry different risks, so they get different rules. Wrongly passing a damaged unit is the expensive mistake. Wrongly failing a clean one costs a second look.",
        {
          type: "list",
          items: [
            "ACCEPTABLE is permitted only if the model made zero false accepts on the ten rejected references and got at least two of the three accepted references right. It is one bar for the whole verdict.",
            "NOT ACCEPTABLE is permitted per rejection criterion. A criterion is allowed only if the model applied it to at least one of that criterion's own rejected references and never applied it to an accepted reference.",
          ],
        },
        "The per-criterion rule matters. \"The model rejects correctly\" is not enough, because a model can reach the right verdict for the wrong reason. In one earlier run, a dented reference was rejected correctly because the model reported scratches on it. Tying each permission to that criterion's own examples means a lucky hit through a different criterion does not qualify anything.",
      ],
    },
    {
      heading: "The code",
      body: [
        "Every reference is first decided with no limits, as `UNRESTRICTED`, and each result is classified as correct, false accept, false reject or unclear. The permissions are then read off those rows:",
        {
          type: "code",
          lang: "ts",
          code: `const rejectCriteria = ERTH_CRITERIA
  .filter((c) => c.outcome === "NOT_ACCEPTABLE")
  .map((c) => c.id)
  .filter((id) => {
    const fired = rows.filter((r) => r.raw === "NOT_ACCEPTABLE" && r.criteria.includes(id));
    const wrong = fired.some((r) => r.expected === "ACCEPTABLE");
    const ownHit = fired.some(
      (r) => r.expected === "NOT_ACCEPTABLE" && ERTH_CRITERIA.find((c) => c.id === id)!.items.includes(r.item),
    );
    return !wrong && ownHit;
  });

const canAccept = rows.length === GOLD_REFERENCE.length && falseAccepts === 0 && correctAccepts >= 2;`,
          caption: "Simplified from src/lib/erth/qualification.ts (policy version qualification-1).",
        },
        "`rows.length === GOLD_REFERENCE.length` is a small guard with a large effect. A partial run cannot unlock ACCEPTABLE. If one reference failed to run, the model has not been measured on it, and the gate treats that as not proved.",
        "The decision engine then applies the result. A rejection whose criterion is not in `rejectCriteria` becomes UNCLEAR with the reason `model_not_qualified`. An acceptance when `canAccept` is false becomes UNCLEAR the same way. Both surface as AI_UNCERTAIN, one of the [five decision states](/blog/four-kinds-of-unclear-decision-states-for-an-ai-check), so the record shows the model was stopped, not that the rules failed.",
      ],
    },
    {
      heading: "Computed, stored and tied to the prompt",
      body: [
        "Nobody chooses a qualification. It is computed from a server-side run and stored with the model's evaluation record. The browser that triggers an evaluation only says which reference to run next. It never supplies a result. A model with no stored evaluation cannot be approved, shadowed or activated, and until it is evaluated it has the empty qualification: no ACCEPTABLE and no rejection criteria.",
        "The prompt is part of the model's identity. The model id recorded on every inspection is `ollama:qwen2.5vl:7b:prompt-3`. Change the prompt and it is a different model that must be re-qualified before it can decide anything. That is why cosmetic edits to the prompt file are not made casually: any edit invalidates the evaluation.",
      ],
    },
    {
      heading: "What the gate did to this model",
      body: [
        "For Qwen2.5-VL 7B with the shipped prompt, the computed qualification is `canAccept: false`, with `rejectCriteria` limited to multiple visible scratches and a single long visible scratch. Those were the two criteria it applied without error. It may never say ACCEPTABLE.",
        {
          type: "table",
          head: ["On the 13 references (22 Sep 2026)", "Correct", "Wrong", "Unclear"],
          rows: [
            ["Raw: rules applied, no gate", "3", "7 (6 false accepts, 1 false reject)", "3"],
            ["Gated: what the public would see", "2", "0", "11"],
          ],
        },
        "The obvious objection is that eleven of thirteen UNCLEAR is useless. The evaluation answers it directly. Eight of those eleven are cases the gate stopped. Removing the gate would turn them into six false accepts, meaning six damaged routers passed, plus one false reject and one correct acceptance. So removing the gate buys one right answer at the cost of six damaged units passing. The UNCLEARs are not caution for its own sake. Each marks an observation that is wrong.",
      ],
    },
    {
      heading: "Limits I would not hide",
      body: [
        "Thirteen examples is far too few for statistics. The code comment calls it \"a floor, not a certification\", and no accuracy figure is claimed. The gate's job is narrower: to stop a model that has visibly failed the client's own examples from speaking for the client. Passing it proves little. Failing it proves a lot.",
        "The gate also inherits the reference set's gaps. There is no verified photo of a clean router and no borderline case, so real-world behaviour is unknown in either direction. RPOMS AI has no model active in production and has never been used on real line photos. The next step is real, verified inspection photos to evaluate against, not a looser gate. When those exist, the same gate runs on them unchanged.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
