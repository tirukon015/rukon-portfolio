import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "deterministic-rule-engine-for-vague-acceptance-criteria",
  title: "Encoding Vague Acceptance Criteria Without Inventing Thresholds",
  description:
    "Criteria that said long, multiple and small with no numbers: how a pure rule engine applies vague words as categories, orders checks for safety and answers UNCLEAR.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Rule Engine", "TypeScript", "Business Rules", "Pure Functions", "AI Engineering", "Versioning"],
  contentType: "Problem/Solution",
  searchIntent: "informational",
  seoTitle: "Rule Engine for Vague Criteria, No Invented Numbers",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "four-kinds-of-unclear-decision-states-for-an-ai-check",
    "qualification-gate-computing-what-a-model-is-allowed-to-decide",
    "a-vision-model-that-only-observes",
    "evaluating-a-vision-model-with-only-thirteen-examples",
  ],
  sections: [
    {
      heading: "Criteria written in words, not numbers",
      body: [
        "This is for anyone turning a client's written acceptance rules into code when those rules are qualitative. In [RPOMS AI](/work/rpoms-ai), a router-casing inspection tool, the cosmetic criteria arrived as thirteen example photos with short notes. The notes used words like long, multiple, minimal, small and visible. None of them came with a number. How long is long? How many is multiple? Nobody said.",
        "The tempting move is to pick numbers: say a scratch over some number of millimetres is long, or three marks count as multiple. I did not do that. A threshold I invented would look exactly like one the client had approved, and every verdict built on it would carry a decision nobody made. So the engine works in the client's categories, and where the examples leave a gap, it says so.",
        "The vision model supplies observations in those same categories: a kind of mark, a count, an extent of small, medium or long, and a visibility of faint or clear. It never supplies a verdict. That split is described in [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes). This article is about the other half: the code that decides.",
      ],
    },
    {
      heading: "A pure function, so it can be replayed",
      body: [
        "`decide()` takes the photo-quality result, the model's observations and the model's qualification, and returns a verdict with its reasons. It does no I/O, reads no clock and uses no randomness. That makes it testable exhaustively, and it means any stored inspection can be replayed through a new version of the rules to see what would change.",
        "Every decision records the ruleset version it was made under, such as `erth-rules-1.0.0`. When an administrator changes the knowledge base, the version gains a revision suffix like `+k3`. Two verdicts from different dates can then always be traced to the exact rules that produced them.",
      ],
    },
    {
      heading: "The order of the checks is the safety model",
      body: [
        "The engine checks every way of not actually knowing before it checks anything that could produce a verdict. In order:",
        {
          type: "list",
          ordered: true,
          items: [
            "The photo failed the quality gate: UNCLEAR, retake.",
            "No model, an unreachable model, or a model that failed: UNCLEAR, never a guess.",
            "The model says the surface is not visible or only partly visible: UNCLEAR, retake.",
            "Any finding below the confidence floor of 0.5, where the model reports confidence: UNCLEAR.",
            "Only then are the rules applied, and within them a rejection outranks an undocumented case, which outranks an acceptance.",
          ],
        },
        "That last ordering matters when a photo shows several kinds of mark. A unit with one acceptable mark and one disqualifying mark is rejected. A unit with one acceptable mark and one undocumented mark is UNCLEAR, not accepted. Acceptance is reached only when nothing argues against it.",
      ],
    },
    {
      heading: "Rules as categories, with UNDOCUMENTED as a real outcome",
      body: [
        "Each kind of mark has its own rule, and each rule can return three outcomes, not two: ACCEPTABLE, NOT_ACCEPTABLE or UNDOCUMENTED. UNDOCUMENTED is for an observation that falls between the client's examples. Simplified, the scratch rule reads like this:",
        {
          type: "code",
          lang: "ts",
          code: `case "scratch": {
  if (count >= 2 && anyClear) return reject("scratch_multiple");
  if (count >= 2) return undocumented("scratch_multiple"); // all faint: the source does not say
  const f = findings[0];
  if (f.extent === "long" && f.visibility === "clear") return reject("scratch_long");
  if (f.extent === "small") return accept("scratch_small_single");
  return undocumented(f.extent === "long" ? "scratch_long" : "scratch_small_single");
}`,
          caption: "Simplified from rule() in src/lib/erth/decide.ts.",
        },
        "Read it against the examples. The rejected examples show several clearly visible scratches, and a single long visible one. An accepted example shows one small line. So several clear scratches reject, one long clear scratch rejects, and one small scratch accepts. A medium scratch, a faint long one, or several faint ones match none of the examples. Those are not stretched to the nearest category. They are UNDOCUMENTED, and the public sees \"check manually\".",
        "The same approach runs through the other kinds. A dent or tape residue rejects on presence, because those are the only examples. Several spots reject, but a single spot has no example and is undocumented. Clearly visible staining rejects, and faint, minimal staining accepts. \"Nothing observed\" is the one derived rule: it accepts because no rejection condition applies. The code records that basis explicitly, and an administrator can switch it off.",
        "Before any rule runs, findings of the same kind are grouped and their counts totalled. For the public explanation, identical findings are merged into one line with a count. Models sometimes list the same kind of mark several times instead of once with a count, and the verdict should not depend on that phrasing.",
      ],
    },
    {
      heading: "Gaps become a list, not a guess",
      body: [
        "Every UNDOCUMENTED case corresponds to a question the source leaves open: where the line between small and long falls, how many marks count as multiple, whether faint marks count, whether two individually acceptable marks together become a rejection, whether a dent in one zone counts the same as in another. These are written down as open questions in the admin knowledge view. They are the questions to take back to the client.",
        "That is why the [decision states](/blog/four-kinds-of-unclear-decision-states-for-an-ai-check) separate ERTH_RULE_INSUFFICIENT, a gap in the written criteria, from AI_UNCERTAIN, a weak model. In the reference evaluation, two of the eleven UNCLEAR answers were rule gaps. No model can close those. Only the client can, by saying what they meant.",
      ],
    },
    {
      heading: "Changes that can only make it more cautious",
      body: [
        "Administrators can disable a criterion or attach a sourced clarification. A disabled criterion decides nothing: its cases become UNDOCUMENTED and therefore UNCLEAR. There is deliberately no switch that turns an UNCLEAR into a verdict or flips a rejection into an acceptance. Knowledge changes are append-only, versioned and audited.",
        "After the rules come the model's limits. The [qualification gate](/blog/qualification-gate-computing-what-a-model-is-allowed-to-decide) turns any verdict the model has not proved into UNCLEAR. The rules say what the observations would mean. The gate says whether this model's observations can be believed. RPOMS AI has no model active in production and has not been used on real line photos, so for now the engine has run on the reference set and in tests only.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
