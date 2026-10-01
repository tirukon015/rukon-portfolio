import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "four-kinds-of-unclear-decision-states-for-an-ai-check",
  title: "\"Unclear\" Is Not One Answer: Five Decision States for an AI Inspection",
  description:
    "An AI check that cannot decide can fail for four very different reasons. How RPOMS AI records which one, maps it to what the public sees, and makes a missing mapping a type error.",
  date: "2026-10-24",
  category: "AI & Automation",
  tags: ["AI Engineering", "TypeScript", "Human in the Loop", "UX", "Error States", "Decision Engine"],
  contentType: "Explainer",
  searchIntent: "informational",
  seoTitle: "Designing Decision States for an AI Check",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "a-vision-model-that-only-observes",
    "photo-quality-gate-blur-glare-exposure-before-a-vision-model",
    "qualification-gate-computing-what-a-model-is-allowed-to-decide",
    "deterministic-rule-engine-for-vague-acceptance-criteria",
  ],
  sections: [
    {
      heading: "One word covering four different failures",
      body: [
        "This is for anyone designing the output of an AI-assisted check where \"I don't know\" is a legitimate answer. [RPOMS AI](/work/rpoms-ai) looks at a photo of a router casing and answers ACCEPTABLE, NOT ACCEPTABLE or UNCLEAR. Most answers are UNCLEAR, and by design. The weak open model is only allowed to decide what it has proved it can decide, as explained in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes).",
        "UNCLEAR on its own turned out to be a poor answer, because it was covering four situations that need different responses. The photo might be unusable, which needs a retake. The model might be unreachable, which is our problem and not the user's. The model might have answered but not be trusted on that question. Or the model might have seen something clearly that the written criteria never cover. The last two look identical on screen and mean opposite things about what to fix.",
      ],
    },
    {
      heading: "The five states",
      body: [
        "Since 22 September 2026, every decision carries one of five states:",
        {
          type: "table",
          head: ["State", "Meaning", "Who can fix it"],
          rows: [
            ["DECISION_READY", "The rules reached ACCEPTABLE or NOT ACCEPTABLE", "Nobody needs to"],
            ["PHOTO_QUALITY_FAILED", "The photo cannot be judged", "The person taking the photo"],
            ["AI_UNAVAILABLE", "The model could not be asked, gave nothing usable, or none is active", "The operator"],
            ["AI_UNCERTAIN", "The model answered, but is not trusted to decide this", "A better model"],
            ["ERTH_RULE_INSUFFICIENT", "The observation is clear, but the client's written criteria do not cover it", "Only the client, by clarifying the criteria"],
          ],
        },
        "The last two must not be run together. AI_UNCERTAIN is a weakness of the model, and it improves when the model improves. ERTH_RULE_INSUFFICIENT is a gap in the source. The acceptance criteria describe their categories in words, not numbers, so a mark that falls between a documented \"small\" and a documented \"long\" has no answer. No model can close that gap. Recording the two separately tells you whether to spend effort on the model or on a conversation with the client.",
      ],
    },
    {
      heading: "Deriving the state so it cannot disagree",
      body: [
        "The decision engine already produced a reason code for every path: `quality_failed`, `surface_partial`, `analysis_unavailable`, `model_not_qualified`, `undocumented_case` and so on. The state is derived from the reason in exactly one table. It is a `Record`, not a `switch` with a default:",
        {
          type: "code",
          lang: "ts",
          code: `export const DECISION_STATE: Record<ReasonCode, DecisionState> = {
  rule_accepted: "DECISION_READY",
  rule_rejected: "DECISION_READY",
  no_defect: "DECISION_READY",
  quality_failed: "PHOTO_QUALITY_FAILED",
  surface_not_visible: "PHOTO_QUALITY_FAILED",
  surface_partial: "PHOTO_QUALITY_FAILED",
  analysis_unavailable: "AI_UNAVAILABLE",
  analysis_failed: "AI_UNAVAILABLE",
  no_qualified_model: "AI_UNAVAILABLE",
  low_confidence: "AI_UNCERTAIN",
  model_not_qualified: "AI_UNCERTAIN",
  undocumented_case: "ERTH_RULE_INSUFFICIENT",
};`,
          caption: "From src/lib/erth/decide.ts. Adding a reason code without choosing its state fails to compile.",
        },
        "Two details make this robust. First, `decide()` is the only exit from the rules, and it attaches the state from this table on every path, so the stored state and the stored reason cannot disagree. Second, decisions saved before the state field existed still have a reason code, so reading them back derives their state from the same table. No data migration was needed.",
      ],
    },
    {
      heading: "A coarser mapping for the public",
      body: [
        "A member of the public does not need five states. They need to know what to do next. A second table collapses the five into four public states, and the page styles those:",
        {
          type: "table",
          head: ["Decision state", "Public state", "What the screen says"],
          rows: [
            ["DECISION_READY", "decided", "ACCEPTABLE or NOT ACCEPTABLE"],
            ["PHOTO_QUALITY_FAILED", "retake", "RETAKE PHOTO, with specific tips"],
            ["AI_UNAVAILABLE", "service_unavailable", "AI CHECK UNAVAILABLE"],
            ["AI_UNCERTAIN, ERTH_RULE_INSUFFICIENT", "needs_human", "CHECK MANUALLY"],
          ],
        },
        "The distinction that must survive into the public view is the outage. Before 20 September, three situations arrived as UNCLEAR in the same amber box. That meant a service outage looked like a bad photo, and someone would be told to retake a photo that was fine. An outage now says whose problem it is.",
      ],
    },
    {
      heading: "A wording change that mattered",
      body: [
        "One behaviour change came with this. With no active model, the public used to see \"needs a human check\". That wording implied the automatic check had looked and failed to decide, when it had not looked at all. It now shows AI CHECK UNAVAILABLE, the message for a problem on our side where the photo is fine.",
        "This is not hypothetical. RPOMS AI has no model activated in production, so every live photo that passes the [quality gate](/blog/photo-quality-gate-blur-glare-exposure-before-a-vision-model) currently takes exactly this path. It has also never been used on real line photos.",
      ],
    },
    {
      heading: "What the states showed in evaluation",
      body: [
        "On the thirteen reference photos, under the qualification gate, eleven answers were UNCLEAR. The states split them: eight AI_UNCERTAIN, two ERTH_RULE_INSUFFICIENT and one PHOTO_QUALITY_FAILED, where the model judged the surface only partly visible. Without states, those were just \"eleven unclears\", and the natural reaction is to loosen something. With states, the eight point at the model and the two at the written criteria. Neither points at the rules engine. The same principle of letting a system say it cannot answer, and why, runs through [Making an LLM Admit the Paper Doesn't Say That](/blog/making-an-llm-admit-the-paper-does-not-say).",
      ],
    },
  ],
  related: [
    { label: "RPOMS AI project", href: "/work/rpoms-ai" },
    { label: "A Vision Model That Only Observes", href: "/blog/a-vision-model-that-only-observes" },
  ],
};
