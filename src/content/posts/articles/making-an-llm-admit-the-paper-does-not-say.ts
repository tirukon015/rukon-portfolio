import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "making-an-llm-admit-the-paper-does-not-say",
    title: "Making an LLM Admit the Paper Doesn't Say That",
    description:
      "The dangerous failure of an AI summarising tool is not a blank answer. It is a plausible one about a section that was never in the source. Enforcing groundedness in four layers instead of asking for it once.",
    date: "2026-09-05",
    category: "AI & Automation",
    tags: ["LLM", "AI Engineering", "Structured Output", "FastAPI", "Python"],
    contentType: "AI Engineering",
    searchIntent: "problem-aware",
    relatedProjects: ["researchforge"],
    relatedPosts: [
      "when-not-to-fall-back-to-another-ai-provider",
      "why-internal-software-needs-good-ux",
    ],
    sections: [
      {
        heading: "The failure that matters",
        body: [
          "ResearchForge, a university project I built for BIT4543 Artificial Intelligence, reads an academic PDF and produces a structured summary, a research-gap analysis, and a literature review of the prior work the paper discusses. The interesting engineering problem in that is not getting a good answer. Models are good at good answers.",
          "The problem is what happens on a paper that does not contain what you asked for. Hand a position paper to something that has been told to extract a methodology, and it will not return nothing. It will return a methodology: fluent, structured, appropriately hedged, and invented.",
          "For a research tool that failure is worse than no answer, because it is indistinguishable from a correct one unless the reader already knows the paper. And a reader who already knows the paper did not need the tool.",
        ],
      },
      {
        heading: "Why the prompt is not enough",
        body: [
          "The obvious response is to put it in the system prompt. Only use the paper. Say so if the paper does not support a section. That is necessary and it is nowhere near sufficient, because a prompt instruction is a preference expressed in the same channel as everything else competing for the model's attention.",
          "More to the point, a prompt gives the model no shape in which to decline. If the response format has a methodology field and no way to say 'absent', then the least-cost path to a valid answer is to fill it. You have built a structure where honesty has no representation.",
          "So the rule is enforced in four layers rather than requested once: the prompt, the schema, validation on return, and discarding anything that fails.",
        ],
      },
      {
        heading: "The schema has somewhere to put 'no'",
        body: [
          "Each response model carries explicit fields for declining. There is a list naming any section the paper did not support, and a boolean plus explanation for the case where the whole analysis cannot be grounded at all.",
          "That is the actual mechanism. Not the instruction, the affordance. Given a structured slot that means 'this paper has no methodology section', a model will use it, because it is now the cheapest valid answer rather than an invalid one.",
          "The response models are converted to JSON Schema and handed to the model as the required output format, with additional properties forbidden. Every reply is validated on return, and a truncated or malformed answer is refused outright rather than partially rendered. A half-parsed analysis shown as though it were complete is the same class of lie as an invented one.",
        ],
      },
      {
        heading: "Validate, then discard rather than repair",
        body: [
          "Every reply is validated against the declared schema on return. The layer that makes that matter is what happens next: output that fails validation is rejected outright, not patched into something renderable. A partially valid analysis the system repaired would be an invented analysis, which is exactly what the grounding claim forbids.",
          "The last layer is the one easiest to skip and hardest to justify skipping. The interface renders the decline fields.",
          "If the model says a section was unsupported, the reader sees that the section was unsupported. The field is not swallowed, not rendered as an empty state that looks like a loading failure, not tucked behind a disclosure. It is the answer.",
          "A schema field nobody displays is a schema field nobody can rely on, and it is also a quiet invitation to stop populating it correctly. Displaying it closes the loop between what the model was asked to do and what the user actually gets.",
        ],
      },
      {
        heading: "Three calls, not one",
        body: [
          "The summary, the gap analysis and the literature review run as three separate model calls rather than one call returning three objects.",
          "They are different tasks with different evidence rules. Separating them means a failure in one does not corrupt the others, and each prompt can be improved without regression-testing the other two.",
          "They run sequentially rather than in parallel, on purpose. Parallelising them would multiply the peak rate-limit burden three times over to win latency that nobody notices on a single upload. That is a bad trade, and it is one that gets made by default a lot.",
        ],
      },
      {
        heading: "Evidence beside every claim",
        body: [
          "For the gap analysis specifically, each identified gap is returned with the wording in the paper that supports calling it a gap, and displayed that way.",
          "This is the same idea one level up. A gap with its evidence attached is checkable in about four seconds: read the quote, decide whether it means what the tool says it means. A gap without evidence is something you either trust or do not, with no third option.",
          "That distinction, between an output you can verify and an output you must trust, is most of what separates an AI feature that survives contact with a sceptical user from one that gets used twice.",
        ],
      },
    ],
    related: [{ label: "ResearchForge case study", href: "/work/researchforge" }],
  };
