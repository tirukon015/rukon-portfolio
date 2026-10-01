import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "literature-review-across-papers-from-stored-analyses",
  title: "A Cross-Paper Literature Review Built From Stored Analyses, Not PDFs",
  description:
    "Building one LLM literature review across several saved papers by reading their stored analyses instead of re-sending every PDF. The trade-off, the size guards, and why partial results are refused.",
  date: "2026-12-24",
  category: "AI & Automation",
  tags: ["LLM", "Literature Review", "Context Window", "API Design", "FastAPI"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "Multi-Paper LLM Review From Stored Summaries",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "whole-document-context-instead-of-rag-for-paper-analysis",
    "caching-llm-results-by-content-hash-without-leaking-uploaders",
    "making-an-llm-admit-the-paper-does-not-say",
  ],
  sections: [
    {
      heading: "The problem: several papers will not fit, and were already paid for",
      body: [
        "In [ResearchForge](/work/researchforge), each uploaded paper gets its own summary, research-gap analysis and literature review, and a signed-in user can save papers to a private library. The natural next feature is a review across papers: pick several saved papers and get one synthesis. This article is for anyone building a multi-document LLM feature on top of per-document results, and it is mostly about one decision, what to send the model.",
        "The obvious implementation re-extracts every selected PDF and sends the full text of all of them. That is wrong twice. The combined text of a dozen papers overruns the context window, which a single paper deliberately does not, as described in [The Plan Said RAG. The Papers Said Send the Whole Thing.](/blog/whole-document-context-instead-of-rag-for-paper-analysis). And every one of those papers has already been analysed once, so re-reading them pays for the same work again. The PDFs are not stored anyway; only the analyses are.",
      ],
    },
    {
      heading: "Each paper contributes its analysis, not its text",
      body: [
        "The cross-paper prompt is assembled from what each paper's stored analysis already contains: the research problem, the methodology, the key findings, the limitations the authors stated, and the themes from its single-paper literature review. Those are the parts a literature review draws on, they are already grounded in the source, and they fit comfortably together.",
        {
          type: "flow",
          steps: [
            "User selects two or more saved papers",
            "Load each paper with its stored analysis",
            "Build one block per paper: problem, method, findings, limitations, themes",
            "One structured call returning a LiteratureReview",
            "Save the review with links to the papers it covers",
          ],
          caption: "The cross-paper path; src/services/cross_review.py and src/api/reviews.py.",
        },
        "Two guards stop one paper from crowding out the others. Any single text section is clipped at 4,000 characters, marked as truncated if it hits the limit; a section should be a paragraph, not a chapter. Lists are capped at twelve items of up to 500 characters each. An empty field is written into the prompt as \"not available from this paper\" or \"none reported\", rather than left blank for the model to fill.",
        "Limitations and themes are only included when the original analysis did not flag that section as having insufficient evidence. A section the first pass declined to write does not become material for the second.",
      ],
    },
    {
      heading: "The trade-off, stated in the code",
      body: [
        "This review is built on the analyses, not on a fresh reading. It cannot surface something the original analysis missed, and it inherits whatever the first pass got wrong. The module's documentation says that in so many words, because it is the honest cost of the design, and it is the kind of limitation that gets forgotten if it is only in someone's head.",
        "The output uses the same `LiteratureReview` schema, grounding system prompt and validation as the single-paper review, so its errors map to the same status codes and the frontend needs no new error handling. The generated review names the papers it was built from and attributes each theme to its source paper.",
      ],
    },
    {
      heading: "All the papers, or an error",
      body: [
        "A review that silently covered four of the five papers a user picked would be worse than an error, because the interface would still say five. So the request is all or nothing:",
        {
          type: "table",
          head: ["Situation", "Response"],
          rows: [
            ["A selected paper does not exist, or belongs to another account", "404, saying how many selected papers are no longer in the library; under Row Level Security another account's paper is indistinguishable from a missing one"],
            ["A selected paper has no stored analysis", "422, naming the paper"],
            ["Deleting a paper that a saved review was built from", "409; the database's ON DELETE RESTRICT refuses it rather than cascading"],
          ],
        },
        "The last rule is the same reasoning applied later: cascading the delete would leave a review claiming more sources than it can still name. The user deletes the review first, and the message says so. The papers are returned in the order the user selected them, so the review's numbering matches what they chose.",
      ],
    },
    {
      heading: "What is not finished",
      body: [
        "Saved cross-paper reviews are stored and counted on the dashboard, and an API route lists and fetches them, but no screen calls that route yet. A saved review cannot be reopened from the interface. It is listed on the project page as available in the API but not connected, and showing those reviews is the first item on the roadmap. The rest of the system is in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
