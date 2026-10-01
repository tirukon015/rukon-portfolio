import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "caching-llm-results-by-content-hash-without-leaking-uploaders",
  title: "Caching LLM Analyses by Content Hash Without Recording Who Uploaded What",
  description:
    "A shared cache for expensive LLM analyses, keyed by a hash of the extracted text. How the key is chosen, what is never cached, and why the cache table has no user column.",
  date: "2026-10-16",
  category: "AI & Automation",
  tags: ["LLM", "Caching", "SHA-256", "Supabase", "Row Level Security", "Privacy", "Python"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "Content-Hash Caching for LLM Results",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "evaluating-an-llm-app-when-your-own-system-hides-the-result",
    "extracting-text-from-academic-pdfs-with-pypdf",
    "every-policy-was-correct-and-every-policy-was-inert",
    "when-not-to-fall-back-to-another-ai-provider",
  ],
  sections: [
    {
      heading: "The problem: paying twice for the same answer",
      body: [
        "In [ResearchForge](/work/researchforge), analysing one paper costs three structured model calls and, for a full paper, around a minute and a half. When a second person uploads the same paper, or the same person uploads it again under a different name, the right behaviour is to reuse the first result. This article is for anyone adding a result cache in front of an LLM pipeline, and it is mostly about the two ways that can go wrong: serving someone an analysis of a paper they did not upload, and turning the cache into a record of who has read what.",
      ],
    },
    {
      heading: "What makes two uploads the same paper",
      body: [
        "Not the filename. One paper arrives as `attention.pdf`, `Attention Is All You Need.pdf` and `1706.03762v7 (1).pdf`, while two unrelated drafts can both be called `paper.pdf`. Not the PDF bytes either: re-saving a file, stripping its metadata or downloading it from a different mirror changes the bytes while the paper stays the same.",
        "The identity is a SHA-256 of the extracted text after a deliberately small normalisation:",
        {
          type: "code",
          lang: "python",
          code: `def normalise_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = _WHITESPACE.sub(" ", text)  # any run of whitespace -> one space
    return text.strip()

def content_hash(text: str) -> str:
    return hashlib.sha256(normalise_text(text).encode("utf-8")).hexdigest()`,
          caption: "From src/services/content_hash.py.",
        },
        "NFKC folds ligatures, full-width characters and non-breaking spaces onto their ordinary forms, which is where two exports of the same paper most often differ. Whitespace is collapsed because extractors produce it almost at random. And that is all. It does not lowercase, strip punctuation or remove numbers, because every normalisation step is a decision that two different things are the same. A missed cache hit costs one analysis. A false hit shows somebody an analysis of a paper they did not upload.",
        "The encoding is pinned to UTF-8 because development was on Windows and deployment on Linux. SHA-256 rather than a faster non-cryptographic hash, because a collision would serve one paper's analysis for another, and hashing a document once costs nothing next to three model calls.",
      ],
    },
    {
      heading: "The key includes a version, declared in one place",
      body: [
        "The cache key is the pair `(content_hash, analysis_version)`. `ANALYSIS_VERSION` sits next to the hash function and is bumped when the prompts, the schema or the pipeline change in a way that would make an old result wrong. Old rows are not deleted; they simply stop matching, so a bump is instantly reversible. A test asserts the version is declared in exactly one place, because the point of it is that one change retires every entry at once.",
        "Two more things never become keys. An extraction of fewer than 200 normalised characters is analysed but not cached, because near-empty extractions from different documents would hash to the same value. And only a complete, schema-validated analysis is written: rate limits, timeouts, provider outages, malformed replies and unreadable PDFs write nothing. A cached failure would be served to every future upload of that paper, turning one bad minute into a permanent wrong answer.",
      ],
    },
    {
      heading: "A shared cache that cannot answer who uploaded what",
      body: [
        "The rest of ResearchForge reaches PostgreSQL as the signed-in user, so Row Level Security scopes every read and write to one account; the story of getting that right is in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert). The cache is the one deliberate exception, and the reasoning runs the other way.",
        "A useful cache is shared by construction: user B benefits from user A's analysis. A per-user policy would break that. A read policy for all authenticated users would be worse, because any account could enumerate the table and read the analysis of every paper anyone had uploaded, including unpublished work. So `analysis_cache` has Row Level Security enabled with no policy at all, no browser key can touch it, and the backend reaches it with the service-role key, which never leaves the server. It is a separate, small class from the per-user repository, so the two access models cannot be confused.",
        {
          type: "list",
          items: [
            "The table has no user column, and must never gain one. The absence is the guarantee: it cannot answer \"who uploaded this\" because it never recorded it.",
            "The only operations are a lookup and a write, both keyed by a hash the caller demonstrably has. You can only get the analysis of a paper you already have.",
            "Each user still saves their own private copy to their library. Reuse happens in the cache; ownership stays in the library.",
          ],
        },
      ],
    },
    {
      heading: "Concurrency, failure and provenance",
      body: [
        "Two people uploading the same new paper at once will both miss and both analyse. Rather than holding a lock while a model runs for a minute, the table has `UNIQUE (content_hash, analysis_version)` and the write uses PostgREST's `Prefer: resolution=ignore-duplicates`, so the loser of the race is a no-op, not an error or a duplicate row.",
        "Every cache method fails soft. Unreachable, misconfigured or holding an unreadable row all become a miss, and the paper is analysed normally. A broken cache should make uploads slower, never broken.",
        "A reused result keeps the provenance of the run that produced it: the provider, the model, whether the fallback fired and the original processing time. A `cache_hit` flag distinguishes reuse from a fresh run. Reporting the cache-hit time as the processing time would misrepresent what the work costs, and naming the currently configured model would misrepresent who wrote it. Why provenance matters at all is covered in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider).",
      ],
    },
    {
      heading: "How the cache was verified on the deployed system",
      body: [
        "One short test document was uploaded three times against production: by user A, again by user A, then by user B. A fast response alone does not prove no model was called, so four signals were checked.",
        {
          type: "table",
          head: ["Request", "Latency", "cache_hit", "Model called"],
          rows: [
            ["First upload, user A", "32.4 s", "false", "Yes, three structured calls"],
            ["Same document, user A", "3.2 s", "true", "No"],
            ["Same document, user B", "2.7 s", "true", "No"],
          ],
          caption: "Controlled cache test on the live deployment.",
        },
        "Besides the flag and the latency, the stored processing time stayed at the original 29,823 ms on both hits, which a merely fast fresh run could not fake, and the row's hit counter incremented. There was still exactly one cache row, each user had their own library entry, user B could not open user A's paper by id, and nothing identifying user A appeared in user B's response.",
        "No cost saving is claimed anywhere in the project; the hit counter counts reuses and nothing is derived from it. The cache did cause one real problem, during evaluation rather than in use: because it is keyed by content rather than by configuration, it twice returned a stored result where a fresh run was being measured. The cache behaved as designed; the measurement had to be fixed by clearing the relevant rows first.",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
