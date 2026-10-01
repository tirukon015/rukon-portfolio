import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "choosing-an-embedding-model-under-pgvectors-2000-dimension-limit",
  title: "Choosing an Embedding Model Under pgvector's 2,000-Dimension Index Limit",
  description:
    "A decision record: how ResearchForge picked an embedding model and dimension around pgvector's index limit, cost and reversibility. The choice was made and wired up; no embedding was ever produced.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["pgvector", "Embeddings", "PostgreSQL", "Supabase", "Decision Log", "AI Engineering"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "pgvector 2,000-Dimension Limit and Embedding Choice",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "planning-a-university-project-like-a-production-system",
    "whole-document-context-instead-of-rag-for-paper-analysis",
    "testing-an-llm-app-without-calling-paid-apis",
  ],
  sections: [
    {
      heading: "What this is, and what it is not",
      body: [
        "This is a decision record from [ResearchForge](/work/researchforge), a university project that analyses research papers. Its original plan included retrieval over a stored library of papers, which needs embeddings, so the embedding model had to be chosen before the database schema was written. The decision was made, the schema and a provider interface were built around it, and then the production path went a different way: papers are analysed whole, with no retrieval step.",
        {
          type: "callout",
          label: "Status",
          text: "No embedding has ever been produced. The embedding provider builds requests and is unit-tested offline, but the HTTP call is deliberately not implemented, and nothing writes to or reads from the vector table. What follows is the reasoning, not a measured result.",
        },
        "It is still worth writing down, because the constraint that shaped it is one anyone putting vectors in PostgreSQL will hit.",
      ],
    },
    {
      heading: "The constraint: you can only index up to 2,000 dimensions",
      body: [
        "pgvector's `vector` type can store more dimensions than it can index. Its HNSW and IVFFlat indexes support vectors of up to 2,000 dimensions. Several popular embedding models default to 3,072. Pick one of those at its default size and the column works, but the table cannot have an approximate-nearest-neighbour index, and similarity search degrades to scanning every row.",
        "So the dimension is not a detail to tune later. It is fixed by the column type when the table is created, and it has to sit under the index ceiling from the start.",
      ],
    },
    {
      heading: "Three decisions in one day",
      body: [
        "The embedding decision, numbered D6 in the plan, was made three times on 11 August 2026, each time recorded with its reasoning and then superseded:",
        {
          type: "table",
          head: ["Choice", "Dimensions", "Why it was chosen", "Why it was replaced"],
          rows: [
            ["Google gemini-embedding-2", "768", "Free tier; normalises truncated dimensions automatically; 768 indexes and halves storage", "Free-tier limits judged too uncertain to plan a semester around"],
            ["OpenAI text-embedding-3-small", "1,536", "Best documented; 1,536 indexes natively", "No free tier; cost was the owner's first priority"],
            ["Jina jina-embeddings-v3", "1,024", "Free allocation with no card; separate passage and query modes for asymmetric retrieval; 8,192-token input", "Final, locked"],
          ],
          caption: "From the commit history and section F of PROJECT_PLAN.md.",
        },
        "The first choice also records a quieter trap: the older Gemini embedding model required manual normalisation when its output was truncated below the full size, and skipping that step produces silently wrong similarity scores with no error. Silent wrongness was the recurring theme in every rejection.",
        "Models that default to 3,072 dimensions were rejected on the index limit alone. A local model was rejected because the plan recorded that it would not fit a free hosting tier's memory, and because its short input limit would silently truncate chunks.",
      ],
    },
    {
      heading: "Designing for the decision to change",
      body: [
        "Given how quickly the choice had changed, the schema and code were built so it could change again without corrupting data:",
        {
          type: "list",
          items: [
            "Every chunk row stores `embedding_model` and `embedding_dimensions` beside the vector, so a partial migration can never silently mix vectors from two models.",
            "A provider-independent `EmbeddingProvider` interface, with Jina's task names confined to one file, so switching providers is a configuration change plus a re-index.",
            "An HNSW index with cosine distance on `vector(1024)`, created idempotently in the first migration.",
            "A test that fails if the migration's column dimension and the configured dimension ever disagree.",
            "29 offline tests covering the interface, the passage and query modes, dimension validation, batching and API-key redaction, with no network call.",
          ],
        },
      ],
    },
    {
      heading: "Why it was never used",
      body: [
        "When the analysis feature was built, measured papers turned out to fit whole in the model's context window, and the gap analysis depends on reasoning across sections that retrieval would split apart. So the analysis path sends the whole document and the retrieval milestones were not built. The plan and the project page both say so, and the code is described as scaffolding rather than a feature. The reasoning is in [The Plan Said RAG. The Papers Said Send the Whole Thing.](/blog/whole-document-context-instead-of-rag-for-paper-analysis), and how decisions were recorded is in [Planning a University Project Like a Real One](/blog/planning-a-university-project-like-a-production-system).",
        "If retrieval is built, for the planned grounded question answering across papers, the first job will be to make the real API call and measure retrieval quality, because nothing above has been tested against a real query.",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
