import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "extracting-text-from-academic-pdfs-with-pypdf",
  title: "Getting Usable Text Out of Academic PDFs: Signatures, Encryption, Scans and Ligatures",
  description:
    "The PDF ingestion path behind ResearchForge: checking the real file signature, opening print-restricted files, rejecting scans with no text layer, and cleaning text without removing content.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PDF", "Python", "pypdf", "Text Extraction", "FastAPI", "Licensing"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Extracting Text From Academic PDFs in Python",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "whole-document-context-instead-of-rag-for-paper-analysis",
    "caching-llm-results-by-content-hash-without-leaking-uploaders",
    "making-an-llm-admit-the-paper-does-not-say",
  ],
  sections: [
    {
      heading: "Every upload is untrusted, and most PDFs are messier than they look",
      body: [
        "[ResearchForge](/work/researchforge) takes an academic PDF from a signed-in user and sends its text to a language model. Everything downstream depends on that text being real, complete and readable, so the ingestion step is where most of the defensive work sits. This is a walk through that step, for anyone writing a Python upload path for documents: what gets checked, in what order, and why each check exists.",
        "The whole thing is one function, `extract_document`, that takes bytes and either returns cleaned text with page counts or raises `PdfExtractionError`. That exception subclasses `ValueError` on purpose: every cause is a bad input rather than a bug, so the API layer turns it into a 4xx with a message written for the person who uploaded the file, never a 500.",
      ],
    },
    {
      heading: "Check the bytes, not the file name or the content type",
      body: [
        "The browser checks type, emptiness and size before posting, but that is a courtesy, not a control. The backend reads the upload once and checks its size against the real byte count, not the client-supplied Content-Length, with a 25 MB limit that returns 413. The declared content type is logged and otherwise ignored. What decides whether the file is a PDF is its first five bytes:",
        {
          type: "code",
          lang: "python",
          code: `# Every PDF begins with this signature. Checking the bytes rather than trusting
# the browser-supplied content-type means a renamed .exe cannot get through.
PDF_MAGIC = b"%PDF-"

def looks_like_pdf(data: bytes) -> bool:
    return data.startswith(PDF_MAGIC)`,
          caption: "From src/ingestion/pdf.py.",
        },
      ],
    },
    {
      heading: "Encrypted PDFs: try the empty password, then stop",
      body: [
        "A surprising number of papers arrive encrypted without having a password at all. Publishers use encryption to set permissions such as \"no printing\", with an empty user password, so the document opens in any viewer. pypdf reports these as encrypted, and a naive extractor either fails or returns nothing.",
        "So an encrypted file gets exactly one attempt, `reader.decrypt(\"\")`. If that succeeds, extraction continues normally. If it returns zero, the file really is password-protected and the user is asked for an unprotected copy. A real password is something the system cannot and should not guess.",
        "Pages are then extracted one at a time, and a page that throws is logged and replaced with an empty string. One malformed page should not lose the other forty.",
      ],
    },
    {
      heading: "Scanned papers: detect the missing text layer instead of returning nothing",
      body: [
        "A scanned paper is a stack of images. pypdf opens it without complaint and extracts almost no text, and if nothing checks for that, the model receives an empty document and the user receives an analysis of nothing, or worse, an invented one.",
        "The check is blunt and effective: after cleaning, fewer than 200 characters in the whole document means extraction failed. The error says what was found, how many characters from how many pages, and that the file is most likely a scan needing OCR, which ResearchForge does not perform. It is listed as a limitation on the project page rather than hidden.",
        {
          type: "callout",
          label: "Why 200",
          text: "About a paragraph: far below any real paper, and far above the stray characters a scanned cover page produces. The same threshold is reused later to decide whether an extraction is substantial enough to key a cache on.",
        },
      ],
    },
    {
      heading: "Cleaning text without removing content",
      body: [
        "Extraction artefacts waste context and make quoted evidence stop matching the source, so the text is cleaned. Every rule is conservative, because a dropped sentence could be the one finding that mattered:",
        {
          type: "code",
          lang: "python",
          code: `text = raw.replace("\\x00", "")

# PDFs encode ligatures as single glyphs.
for ligature, plain in (("\\ufb01", "fi"), ("\\ufb02", "fl"), ("\\ufb00", "ff")):
    text = text.replace(ligature, plain)

# Words split across a line break by hyphenation: "hyphen-\\nation".
text = re.sub(r"(\\w)-\\n(\\w)", r"\\1\\2", text)

# Collapse runs of spaces/tabs, but never across newlines.
text = re.sub(r"[ \\t]+", " ", text)

# Three or more blank lines carry no more meaning than two.
text = re.sub(r"\\n{3,}", "\\n\\n", text)`,
          caption: "Simplified from clean_text in src/ingestion/pdf.py (the source writes the ligature glyphs literally).",
        },
        "Ligatures are normalised so that a gap's quoted evidence reads \"significant\" rather than a string with an invisible glyph in it. Hyphenated line breaks are rejoined. Whitespace is collapsed, but never across a newline, because paragraph structure is a real signal about where sections begin and end, and the long-paper chunker later prefers to cut at exactly those paragraph breaks.",
        "On the evaluation corpus, five openly available papers of 6 to 19 pages, extraction yielded between 2,632 and 3,973 characters per page, consistent across two-column layouts, with nothing truncated.",
      ],
    },
    {
      heading: "Choosing pypdf, and keeping the choice reversible",
      body: [
        "The faster and more accurate option in Python is PyMuPDF. It was ruled out on licensing, not convenience: it is AGPL, and ResearchForge is an MIT-licensed repository meant to be read publicly. pypdf is pure Python and BSD-3 licensed, runs identically on Windows, macOS and Linux with no system dependencies, and produces reading-order text, which is all this task needs. There is no layout reconstruction or table parsing in the requirements.",
        "The plan originally left the PDF library formally undecided pending a benchmark on real papers, and that benchmark was never run as a separate exercise, so pypdf is honestly described in the code as the working default rather than a measured winner. What makes that acceptable is containment: only one private function, `_read_pages`, touches pypdf. Everything else, the signature check, the scan detection and the cleaning, is library-agnostic, so moving to pdfplumber or anything else is a one-function change.",
        "What happens to the text next is in [The Plan Said RAG. The Papers Said Send the Whole Thing.](/blog/whole-document-context-instead-of-rag-for-paper-analysis), and the wider system is in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
