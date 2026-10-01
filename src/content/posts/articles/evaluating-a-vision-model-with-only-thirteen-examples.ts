import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "evaluating-a-vision-model-with-only-thirteen-examples",
  title: "Evaluating a Vision Model When You Only Have Thirteen Examples",
  description:
    "Thirteen labelled photos are not a test set, but they can still be an honest evaluation. Separating what is known from what is assumed, removing leaked annotations, and controls built on purpose.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["Model Evaluation", "Vision Models", "AI Engineering", "Data Leakage", "Qwen2.5-VL", "Testing"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "Evaluating a Vision Model on a Tiny Dataset",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "immutable-reference-data-postgres-triggers-and-hash-pinning",
    "qualification-gate-computing-what-a-model-is-allowed-to-decide",
    "benchmarking-ollama-vision-models-the-cached-image-trap",
    "a-vision-model-that-only-observes",
    "evaluating-an-llm-app-when-your-own-system-hides-the-result",
  ],
  sections: [
    {
      heading: "The data you have is the data you have",
      body: [
        "This is for anyone who has to evaluate a model before real labelled data exists, which is common in internal tools. For [RPOMS AI](/work/rpoms-ai), a router-casing inspection tool, the client's acceptance criteria came as thirteen example photos in a spreadsheet, each with a short note and a yes-or-no verdict. Three were accepted and ten rejected. There was no verified photo of a clean router and no borderline case.",
        "Thirteen examples cannot support an accuracy figure, and none is claimed. They can still support an honest evaluation, if you are strict about what each example actually tells you. The scores themselves are in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes). This article is about the method.",
      ],
    },
    {
      heading: "Four kinds of knowledge, kept apart",
      body: [
        "The evaluation set in `evaluation.ts` gives every case an explicit expectation, and expectations come in four strengths. They are never mixed together.",
        {
          type: "table",
          head: ["Kind", "What it is", "What it can claim"],
          rows: [
            ["Client verdict", "One of the thirteen references", "The right answer, because the client wrote it"],
            ["Verified photo", "A real photo supplied with a verdict and the name of the person who gave it", "The right answer, on that person's authority"],
            ["Degradation", "A reference damaged on purpose: blurred, darkened, glare painted over", "Only that it must not be ACCEPTED, because we hid the evidence ourselves"],
            ["None", "A category with no verified image at all", "Nothing. It is listed so the gap is visible, and never run with an invented label"],
          ],
        },
        "The third row is the useful trick. You often cannot know the right verdict for a degraded image, but you can know which answer would be wrong. A rejected router with glare painted over its scratches must not come back ACCEPTABLE, so the expectation is \"no accept\" and nothing stronger. The fourth row keeps the report honest. The categories \"clearly acceptable\" and \"ambiguous or borderline\" appear in every report as \"not run\", so nobody reads the results as covering them.",
        "Nothing in the set is a label anyone made up. Where the truth is not known, the case says so.",
      ],
    },
    {
      heading: "The references leaked the answer",
      body: [
        "Every reference image had red circles and arrows drawn into its pixels, marking the defect. A model shown those originals is being told where to look. Any score on them would measure whether the model notices red ink.",
        "So the evaluation uses derived copies with the annotations painted out. A short Python script finds strongly red pixels, dilates the mask, and fills it from neighbouring pixels iteratively, so a model under test has to find the defect itself. The originals are never modified. The copies are hash-pinned like the originals and treated as evaluation inputs only: not training data, and never shown as the client's images. The same reasoning ruled the originals out as training data. A model trained on them learns that a red circle means a defect.",
      ],
    },
    {
      heading: "Controls you build yourself",
      body: [
        "The most informative case in the whole project was not a reference at all. It was a plain grey frame with no router in it. One prompt version reported a clearly visible scratch on a fully visible surface for that frame. That single control showed the prompt was leading the model better than thirteen references did. The story is in the earlier article. The method point is that a control with an unambiguous answer catches failures a small labelled set cannot.",
        "The repeatable evaluation now includes four degraded controls: glare over a rejected reference's scratches, heavy blur, an accepted reference at 7% brightness, and a blank frame. There is also a case for an accepted reference upscaled to the 1600 px the public page sends, which checks that the production size path works end to end. All four degraded controls were stopped by the quality gate on 22 September 2026.",
      ],
    },
    {
      heading: "Run the production path, and make it repeatable",
      body: [
        "Every case goes through the same `runPipeline` function the public endpoint uses: quality gate, size cap, model, rules. An evaluation of a different code path would be an evaluation of something that does not run. One command, `npm run evaluate`, runs the whole set against any Ollama endpoint and writes a report.",
        "Each case is scored twice from the same observation. Raw is what the rules conclude with no limits. Gated is what the public would see under the qualification computed from those same references. Reporting only gated numbers would hide how weak the model is. Reporting only raw numbers would hide that the system is safe anyway.",
        "Determinism makes small numbers repeatable. At temperature 0 with a fixed seed, the thirteen raw verdicts on 22 September matched the run of 20 September exactly. Thirteen examples are still noisy as a sample of the world. But a difference between two runs on the same machine is then a real change, not sampling noise.",
        {
          type: "callout",
          label: "Hardware is part of the setup",
          text: "The same model and prompt scored differently on an Apple M4 and on an Intel Iris Xe under Vulkan. An evaluation result belongs to a model, a prompt and a machine. Moving to new hardware means re-running it.",
        },
      ],
    },
    {
      heading: "Report what went wrong, including in the report",
      body: [
        "Two habits made the results trustworthy to read. The first: when the 22 September report's timing column turned out to be distorted, by cached images and a lint run competing for the CPU, the report was kept as generated with a \"read this first\" note on top, as described in [the cached-image benchmark note](/blog/benchmarking-ollama-vision-models-the-cached-image-trap). The second: every rejected experiment is recorded with its result. That covers a few-shot prompt, a per-category checklist, cropping to the router, and a larger model that was too slow. Otherwise the next person tries them again.",
        "What thirteen examples can do is set a floor. The [qualification gate](/blog/qualification-gate-computing-what-a-model-is-allowed-to-decide) uses them to stop a model that visibly fails the client's own examples from speaking for the client. What they cannot do is say how the model behaves on real inspection photos. RPOMS AI has no model active in production and has never been used on real line photos. The planned next step is to collect real photos, have a trained reviewer give each a verdict, and evaluate against those. The same evaluation code already accepts such a folder.",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "Evaluating an LLM App When Your Own System Hides the Result", href: "/blog/evaluating-an-llm-app-when-your-own-system-hides-the-result" },
  ],
};
