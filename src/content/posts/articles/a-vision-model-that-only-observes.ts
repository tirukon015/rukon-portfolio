import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "a-vision-model-that-only-observes",
  title: "A Vision Model That Only Observes: Building RPOMS AI Without Letting the Model Decide",
  description:
    "A router surface inspector where the vision model reports what it sees and a deterministic rule engine decides. Why the split, what a 7B open model actually scored, the blank-image control that changed the prompt, and a safety gate that turns most answers into \"check manually\".",
  date: "2026-09-24",
  category: "AI & Automation",
  tags: ["Computer Vision", "LLM", "Ollama", "Qwen2.5-VL", "Next.js", "Evaluation"],
  contentType: "AI Engineering",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms", "researchforge"],
  relatedPosts: [
    "making-an-llm-admit-the-paper-does-not-say",
    "when-not-to-fall-back-to-another-ai-provider",
    "building-software-in-cyberjaya-the-development-environment",
  ],
  sections: [
    {
      heading: "The task and the constraint",
      body: [
        "RPOMS AI is a related system in the RPOMS ecosystem, built for the same router-refurbishment programme but kept completely separate from RPOMS itself: it never touches the RPOMS code, database or deployment. Someone photographs one face of a router casing, and the system checks it against the programme's written cosmetic acceptance criteria and answers ACCEPTABLE, NOT ACCEPTABLE or UNCLEAR with a short explanation.",
        "The constraint was that the mandatory AI cost had to be zero: no paid API, no rented GPU. That rules out the obvious hosted vision APIs and rules in a free, open-source model running on a machine we control. Vercel functions cannot hold a multi-gigabyte model, so the site calls out to it. More on that below.",
      ],
    },
    {
      heading: "The separation that matters",
      body: [
        "The vision model observes. Its output schema has fields for the kind of mark, count, extent and visibility, and no field in which to write a verdict. A deterministic rule engine decides, applying the programme's categories as written, versioned, pure, and unit tested. Between them sits a qualification gate: the active model may only issue the verdicts it has proved on a reference set, and everything else becomes UNCLEAR, which the public sees as \"check manually\".",
        {
          type: "flow",
          steps: ["Photo", "Quality gate", "Vision model (observations only)", "Rule engine (decides)", "Qualification gate", "Verdict"],
          caption: "One function implements this flow, used by the public endpoint and by the regression run alike, so what is tested is what runs.",
        },
        "This is not a style preference. A model that can be talked into an answer must never be the thing that produces the answer. The same principle runs through [ResearchForge](/blog/making-an-llm-admit-the-paper-does-not-say), where the schema gives the model a way to decline; here it goes one step further and takes the decision away from the model entirely.",
        "The quality gate runs first and calls no model. Resolution, blur, darkness, over-exposure, glare, whether a router is present and large enough, whether a plain surface is visible. A failed photo is answered with retake tips, and the deterministic controls caught every blurred, glared, dark and blank test image.",
      ],
    },
    {
      heading: "Thirteen references, and no invented thresholds",
      body: [
        "The programme's acceptance criteria exist as thirteen photographed examples in a spreadsheet, each with a note and a yes-or-no verdict. Those thirteen are the whole written foundation. They are pinned by hash, protected by a database trigger that refuses updates and deletes, and treated as adjudicated fact.",
        "Two honest complications. Every reference image has red circles and arrows drawn into its pixels, so the originals are not usable for evaluating a model; annotation-free copies are derived from them, also hash-pinned. And the notes use words like \"long\", \"multiple\", \"minimal\" and \"small\" with no numeric thresholds. None were invented. Those are kept as the programme's categories, the boundaries between them are recorded as undocumented, and anything that falls between documented examples is UNCLEAR by design.",
      ],
    },
    {
      heading: "What the model actually scored",
      body: [
        "The model is Qwen2.5-VL 7B under Ollama, Apache-2.0 licensed. Measured on the thirteen references with annotations removed, the shipped prompt scores 3 correct, 6 false accepts, 1 false reject and 3 unclear. An earlier prompt on an Apple M4 scored 4 correct and 5 false accepts. The difference is inside the noise of thirteen examples, and neither is good. Across three prompts the model reported \"scratch\" eighteen times and never once reported a dent or tape residue. That is a perception limit, and no change to the rules can fix it.",
        {
          type: "table",
          head: ["Experiment", "Outcome"],
          rows: [
            ["Deterministic mark detection (bright marks, vent and print suppression)", "About a fifth of detected marks fall inside the circled defects. Kept for the quality gate and as admin-only evidence, never for verdicts."],
            ["Leave-one-out few-shot with eight labelled examples", "Rejected all three accepted references, 30 to 160 s per photo. Not adopted."],
            ["Per-category checklist prompt", "Returned dents, multiple scratches and white stains as undamaged. Stopped after five references."],
            ["Cropping the photo to the router first", "No change on ten of thirteen; on one it cut off the top edge where the dents were. Not adopted."],
          ],
          caption: "Everything tried is recorded, including what did not work, because the next person will otherwise try it again.",
        },
        "So no free model is currently fit to accept a unit, and the qualification gate encodes exactly that: this model may answer ACCEPTABLE never, and NOT ACCEPTABLE only for the two criteria it applied without error, multiple visible scratches and a long visible scratch. Under that gate its behaviour on the references is 3 correct rejections, 10 UNCLEAR and 0 wrong verdicts. Those ten are not the system being timid. Removing the gate would turn eight of them into six damaged routers passed, to gain one correct acceptance.",
      ],
    },
    {
      heading: "The control that changed the prompt",
      body: [
        "The reference scores hid the more useful measurement. Given a plain grey image with no router in it at all, the earlier prompt answered that the surface was fully visible with one small, clearly visible scratch, and without the JSON grammar it invented six defects with locations. The same model, simply asked to describe the image, called it blank, and read the brand name off a real photo. The model could see. The prompt was leading it: it opened by asking for damage you can see, spent its length describing kinds of damage, and allowed an empty answer in a trailing clause.",
        "The shipped prompt states first that most routers are undamaged and that an empty list is correct, requires a mark to be pointed at before it is reported, and names the product features that are not damage. On the blank control it now reports nothing. It did not improve the thirteen-reference score, and the documentation says so. What it removed is a specific and dangerous failure, reporting damage that is not there, which matters most on the photos the references do not cover: a wrong object, a lens cap, a dark frame.",
      ],
    },
    {
      heading: "Running a 7B model for free, and what it costs instead",
      body: [
        "The model runs under Ollama on a machine we control, currently a Windows laptop with an 11th-generation Intel Core i5 and Iris Xe integrated graphics. The site reaches it through a token-protected gateway behind a free Cloudflare quick tunnel. The gateway refuses every request without the token, forwards only chat and model-list calls for allowed models, and serves one analysis at a time. Ollama's own port is never exposed, because Ollama has no authentication of its own. When the machine or tunnel is off, the site keeps working: photos are quality-checked, stored for review and answered \"needs a human check\".",
        "The cost that replaced money is time. Ollama drops integrated GPUs by default, which left the model on the CPU at 119 seconds per photo. Enabling the integrated GPU through Vulkan brought a new photo to a median of 41 seconds, range 38 to 82, of which about 28 seconds is encoding the image. Sampled every second across ten photos, the GPU was over half busy in 198 of 200 seconds. The public check runs inside a 60-second function limit with 50 seconds allowed for the model, so this is close to the edge, and a full-size phone photo used to exceed it entirely until the pipeline capped what the model sees at 896 px on the long edge, the scale it was evaluated at.",
        {
          type: "callout",
          label: "A number that was wrong",
          text: "An earlier figure of 21 seconds per photo came from sending the same image twice, which let Ollama skip the encoding. No real inspection repeats an image, so that figure never applied to one. It is recorded as a correction rather than deleted.",
        },
      ],
    },
    {
      heading: "Provenance and the lifecycle",
      body: [
        "Every stored inspection carries the model id, the prompt version, the ruleset version, the reference-set version and the analyzer version, so a verdict can always be traced to the exact code and criteria that produced it. Models move through a lifecycle, candidate, evaluation, shadow, approved, production, retired, and a shadow model runs after each public check with its verdict recorded and never shown. Improvement comes only from examples an administrator has verified by hand; nothing is learned automatically.",
        "Where it stands: the infrastructure works and inspection quality does not. No model is active in production, and the honest status document says exactly that. What the project produced is a system that will not lie about a router, a measured record of what a free model can and cannot see, and a place to put better models when they exist. For an internal tool that decides whether equipment is fit to ship, that is the right order to build in.",
        "The programme it serves is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
