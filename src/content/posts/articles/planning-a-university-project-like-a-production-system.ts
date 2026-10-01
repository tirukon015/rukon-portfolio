import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "planning-a-university-project-like-a-production-system",
  title: "Planning a University Project Like a Real One: Milestones, Risks and a Decision Log",
  description:
    "The first commit of ResearchForge had no code: a plan with milestones, a risk register, a definition of done and numbered decisions. What that structure caught, and where the plan was wrong.",
  date: "2026-12-20",
  category: "Developer Journey",
  tags: ["Project Planning", "University Project", "Decision Log", "Risk Management", "Documentation"],
  contentType: "Experience-led",
  searchIntent: "informational",
  seoTitle: "Planning a Uni Software Project Like Production",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "whole-document-context-instead-of-rag-for-paper-analysis",
    "choosing-an-embedding-model-under-pgvectors-2000-dimension-limit",
    "why-system-maintenance-matters-after-deployment",
    "evaluating-an-llm-app-when-your-own-system-hides-the-result",
  ],
  sections: [
    {
      heading: "Who this is for",
      body: [
        "If you are starting a final-year or coursework software project and want it to end as a working, deployed system rather than a demo that ran once on your laptop, the planning habits matter more than the framework. [ResearchForge](/work/researchforge) was my project for BIT4543 Artificial Intelligence at the University of Cyberjaya: an AI assistant that analyses research papers, which I took from an empty repository to a deployed application with accounts and stored user data. This is what the planning looked like, including the parts the plan got wrong.",
      ],
    },
    {
      heading: "The first commit had no code",
      body: [
        "The first commit, on 11 August 2026, created the folder structure the course required, a working-rules file, a README, an environment-variable template with placeholders only, a `.gitignore` checked to exclude secrets and PDFs, a planned dependency list with nothing pinned yet, an MIT licence, and `PROJECT_PLAN.md`. Its message ends: no application code, no AI provider, no database, and no fake data.",
        "The plan is organised in four parts, which is the structure I would reuse:",
        {
          type: "table",
          head: ["Sections", "Answers"],
          rows: [
            ["A to D", "What is being built: overview, university requirements, core features, optional features"],
            ["E to K", "How: architecture, stack, data strategy, pipeline, database, API and frontend proposals"],
            ["L to P", "How it is proved and shipped: testing, AI evaluation, security, deployment, GitHub strategy"],
            ["Q to S", "Order of work and what can go wrong: roadmap, risks, definition of done"],
          ],
        },
        "Anything marked \"decision needed\" was explicitly open, and no code was written for it until it was decided.",
      ],
    },
    {
      heading: "Milestones that end in evidence",
      body: [
        "The roadmap had thirteen milestones, 0 to 12, from setup to evaluation. Each was defined to end with a test, a commit and a stop to review before the next one started. Milestone 1 closed the same day as the plan: Python 3.12.10 installed and verified, a FastAPI app answering `GET /health`, nine passing tests, lint clean.",
        "The useful part was what the milestone record admitted. It noted one check that was not carried out, a from-scratch reinstall into a throwaway virtual environment, so reproducibility on a second machine was recorded as unproven rather than assumed. Writing down what you did not verify is a small habit that pays for itself the first time someone else clones the repository.",
        "Every milestone also shared a global definition of done: runs from a clean checkout, actually tested with the output shown, no secrets committed, no hard-coded absolute paths, no fake data or fabricated results, docs updated, committed with a clear message, and a plain statement of what works and what does not.",
      ],
    },
    {
      heading: "A risk register you actually close",
      body: [
        "The plan listed twelve risks with likelihood, impact and mitigation. Two were closed on day one, and both are mundane, which is the point: the Python installed on the machine was too old for the AI libraries, and the project folder name contained spaces and parentheses. The folder was renamed before any virtual environment or tooling existed, so no absolute paths had to be repaired later.",
        "Others shaped the build directly. Hallucination in academic output was rated critical, and the mitigation became the grounding design. Messy PDFs, scans and two-column layouts were rated likely, and the mitigation, \"detect near-empty extraction and fail loudly\", is almost word for word what the ingestion code does. A committed secret was rated critical, with `.gitignore` in place from the first commit.",
      ],
    },
    {
      heading: "Decisions as numbered, reversible records",
      body: [
        "Technical choices were recorded as numbered decisions with the reasoning, the alternatives and what would make them reversible, rather than made silently in code. The record also shows decisions changing, which is what a decision log is for:",
        {
          type: "list",
          items: [
            "The embedding model (D6) was decided three times on the same day as costs and constraints were re-examined, ending locked on Jina at 1,024 dimensions. It is documented, and no embedding was ever produced, because retrieval was never built.",
            "The language model provider (D5) stayed open behind an interface until 2 September, was settled on Google Gemini, and was replaced two days later by Anthropic and Groq when Gemini's free-tier limits proved unworkable. Because the analysis code depended only on the interface, the pipeline, API and frontend did not change.",
            "The PDF library was left formally undecided pending a benchmark, with pypdf as the working default, chosen partly on licensing.",
          ],
        },
      ],
    },
    {
      heading: "Where the plan was wrong, and saying so",
      body: [
        "The plan was a retrieval-augmented generation design, with milestones for chunking, embeddings, retrieval and Q&A. The system that shipped sends whole papers to the model and has no retrieval step, because measured papers fit in the context window and the gap analysis needs cross-section reasoning; the reasoning is in [The Plan Said RAG. The Papers Said Send the Whole Thing.](/blog/whole-document-context-instead-of-rag-for-paper-analysis). The plan was not quietly rewritten to match. Its progress table marks retrieval, Q&A and export as not built, and a note says the production path must not be described as RAG.",
        "The same rule applied to documentation generally. The docs were rewritten from the code rather than from the plan, and later correction passes still found statements that were simply wrong: live endpoints listed as not implemented, and a database described as unconnected that was in fact live. Documentation that describes intentions as though they were features is worse than none.",
        "A plan's job is not to be right. It is to make every departure from it visible and deliberate. The deployed result, and what it still cannot do, is on the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
