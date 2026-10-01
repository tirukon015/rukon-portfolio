import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "whole-document-context-instead-of-rag-for-paper-analysis",
  title: "The Plan Said RAG. The Papers Said Send the Whole Thing.",
  description:
    "ResearchForge was planned as a retrieval pipeline. Measured papers fit whole in the context window, so it sends the full text and only chunks a genuinely oversized document.",
  date: "2026-10-03",
  category: "AI & Automation",
  tags: ["LLM", "RAG", "Chunking", "Long Context", "Python", "AI Engineering"],
  contentType: "AI Engineering",
  searchIntent: "problem-aware",
  seoTitle: "When Not to Chunk: Whole-Paper LLM Context",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "making-an-llm-admit-the-paper-does-not-say",
    "fastapi-and-nextjs-as-two-services-on-one-vercel-origin",
    "extracting-text-from-academic-pdfs-with-pypdf",
    "literature-review-across-papers-from-stored-analyses",
  ],
  sections: [
    {
      heading: "Should you chunk a paper before asking a model about it?",
      body: [
        "If you are building an LLM feature over documents, the default advice is to split them into chunks, embed the chunks and retrieve the relevant ones. That is retrieval-augmented generation, and it is the right answer for a large corpus. For analysing one document at a time it can be the wrong answer, and an expensive one. This is how I reached that conclusion on [ResearchForge](/work/researchforge), a university project that reads an academic paper and writes a summary, a research-gap analysis and a literature review.",
        "The project plan, written in August 2026 before any feature existed, was a RAG plan. It had milestones for chunking and embedding, retrieval and Q&A, and a database table for vector chunks. The system that shipped does none of that for analysis. It sends the whole paper. The plan now carries a note saying the production path is full-document grounded generation and must not be described as RAG, because that is what it is.",
      ],
    },
    {
      heading: "What gap analysis actually needs",
      body: [
        "A research gap is often a relationship between two distant parts of a paper: a limitation admitted in section six that undercuts a claim made in section three. A retriever that returns the five chunks most similar to a question will not reliably put both of those in front of the model, because neither chunk resembles the question on its own. Cross-section reasoning is exactly what chunking destroys, and it is the thing the gap analysis depends on.",
        "The model configured as the fallback, Anthropic's claude-opus-5, has a 1,000,000-token context window. A typical paper is a small fraction of that. So the working assumption became: if the paper fits, send all of it.",
      ],
    },
    {
      heading: "The measurement that settled it",
      body: [
        "The five-paper evaluation corpus used on the deployed system gave the numbers. Every paper was analysed as a single piece, with nothing truncated:",
        {
          type: "table",
          head: ["Paper (arXiv id)", "Pages", "Characters extracted", "Chunks"],
          rows: [
            ["1903.10676", "6", "23,767", "1"],
            ["1706.03762", "15", "39,489", "1"],
            ["2004.04228", "13", "46,601", "1"],
            ["1810.04805", "16", "63,578", "1"],
            ["2005.11401", "19", "69,097", "1"],
          ],
          caption: "Extraction results from the ResearchForge evaluation corpus: five openly available papers.",
        },
        "The largest was under 70,000 characters. The switch to chunking is set at 400,000 characters, roughly 100,000 tokens at the usual four characters per token, which is a deliberately conservative fraction of the window. Characters rather than tokens, because counting characters needs no tokenizer dependency.",
        "Whole-paper context has a real cost of its own, and it showed up in the same evaluation: every call carries the full paper, which is what put each request over one provider's per-minute token allowance. That is a capacity problem, not a reason to lose the cross-section reasoning, and it is recorded as a limitation rather than solved by chunking.",
      ],
    },
    {
      heading: "Conditional chunking for the document that really does not fit",
      body: [
        "Chunking still exists, as a map step that only runs above the threshold. Each chunk is digested separately and the digests are concatenated in place of the paper, then the same three analysis calls run over that. The common path is untouched: `chunk_text` returns the text unchanged when it fits, so the caller never special-cases it.",
        {
          type: "flow",
          steps: [
            "Extract and clean the text",
            "Longer than 400,000 characters?",
            "No: analyse the whole paper",
            "Yes: split into 40,000-character chunks with 2,000 overlap",
            "Digest each chunk",
            "Analyse the joined digests",
          ],
          caption: "The long-paper path in src/services/analysis.py.",
        },
        "Where a chunk ends matters more than its size. Cutting a sentence in half at a fixed offset is how chunking corrupts meaning, so the boundary search looks backwards from the ideal end, within the last 20 percent of the chunk, for a paragraph break first, then a sentence end, and only then accepts the hard offset:",
        {
          type: "code",
          lang: "python",
          code: `window = max(1, int((ideal_end - start) * _BOUNDARY_SEARCH_FRACTION))
floor = max(start + 1, ideal_end - window)

paragraph = text.rfind("\\n\\n", floor, ideal_end)
if paragraph != -1:
    return paragraph + 2

sentence = text.rfind(". ", floor, ideal_end)
if sentence != -1:
    return sentence + 2

return ideal_end`,
          caption: "From src/ingestion/chunking.py.",
        },
        "The next chunk starts at the actual cut minus the overlap, not at the planned one, so the overlap stays real when the boundary moved backwards. An overlap equal to or larger than the chunk size is rejected outright, because every step forward would then be zero or negative and the loop would never end.",
      ],
    },
    {
      heading: "A naming detail that prevented hundreds of calls",
      body: [
        "The plan's retrieval design had its own chunking settings, `CHUNK_SIZE` and `CHUNK_OVERLAP`, sized for embeddings at around a thousand characters. The analysis settings are deliberately named `long_paper_chunk_size` and `long_paper_chunk_overlap` instead. If one setting had driven both chunkers, a thousand-character analysis chunk would have fired hundreds of model calls for a single upload. Two different jobs, two different names.",
      ],
    },
    {
      heading: "What was not built, stated plainly",
      body: [
        "The retrieval scaffolding from the plan is still in the repository: an embedding provider interface, a Jina implementation that builds requests but deliberately makes no HTTP call, and a vector chunks table. Nothing calls any of it, and the case study and the interface both say so. Grounded question answering across papers, which is where retrieval would genuinely earn its place, is planned and not started.",
        "The general point is not that RAG is wrong. It is that the decision should come from the size of the documents you actually have and the kind of reasoning the task needs, measured, rather than from the architecture diagram everyone draws first. How the three calls stay grounded once the model has the whole paper is in [Making an LLM Admit the Paper Doesn't Say That](/blog/making-an-llm-admit-the-paper-does-not-say), and the deployment they run inside is in [Running FastAPI and Next.js as Two Services Behind One Vercel Origin](/blog/fastapi-and-nextjs-as-two-services-on-one-vercel-origin).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
