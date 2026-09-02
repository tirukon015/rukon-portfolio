export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Questions written to be answerable on their own.
 *
 * These back the FAQPage structured data, so each answer has to stand up
 * without the rest of the page around it, and the markup has to mirror what a
 * reader actually sees. Nothing here is a keyword container: the questions are
 * the ones a recruiter, a client or an answer engine would genuinely ask.
 */
export const faqs: FaqItem[] = [
  {
    question: "What does Touhidul Islam Rukon build?",
    answer:
      "Operational and business systems, AI applications, and production websites. The main three are RPOMS, a production-operations platform for a router-refurbishment line; ResearchForge, an AI research assistant that analyses academic PDFs; and homepage development for ERTH, a Malaysian e-waste collection service. Based in Cyberjaya, Selangor, Malaysia.",
  },
  {
    question: "What is RPOMS?",
    answer:
      "RPOMS is a Router Production Operations Management System built for a refurbishment programme run by Blue Bee Technologies. It covers the full path a unit takes, from intake and serial registry through cleaning, packing into numbered boxes, and delivery with matching paperwork, across ten admin modules and twenty-five API routes in TypeScript, with a storage layer that runs on PostgreSQL, MySQL or a local file store. I designed and built it and remain its maintainer.",
  },
  {
    question: "What is ResearchForge?",
    answer:
      "ResearchForge is an AI research assistant. Upload an academic PDF and it returns a structured summary, a research-gap analysis where each gap carries the evidence in the paper that supports it, and a literature review of the prior work that paper discusses. It runs a Python and FastAPI backend beside a Next.js frontend as one deployment behind a single origin, with 186 offline tests.",
  },
  {
    question: "Does ResearchForge use RAG or retrieval?",
    answer:
      "No. The analysis path sends the document itself to the model rather than retrieved passages, so it is not a retrieval-augmented system. The retrieval layer (an embedding provider interface, a storage-independent repository, and pgvector migrations) is written and unit-tested, but the embedding network call is deliberately not implemented and no database is connected. The application states this rather than implying otherwise.",
  },
  {
    question: "What was your role on the ERTH website?",
    answer:
      "Two phases. The interface was prototyped in Figma before implementation, and translating that prototype into the production build is the design-to-code half of the work. The second phase was development against a supplied requirements document: a content, technical-SEO and AI-search-readability update on the existing design, not a redesign, auditing the live page against every requirement, raising content contradictions for the client to rule on, and implementing the changes inside the existing components. The page went from having no canonical, no Open Graph and no structured data to a full set, with zero new sections added.",
  },
  {
    question: "What kind of systems do you work on?",
    answer:
      "Mostly internal business and operational systems such as production tracking, inventory, and admin and reporting tools, alongside AI applications and customer-facing websites. The common thread is software that has to stay in step with a real process rather than software that only has to manage records.",
  },
  {
    question: "Do you build full-stack applications?",
    answer:
      "Yes. Frontend, backend, database and deployment. RPOMS is built and run that way end to end in TypeScript, and ResearchForge pairs a Python and FastAPI backend with a Next.js frontend.",
  },
  {
    question: "Do you do technical SEO work?",
    answer:
      "Yes, at the implementation level: metadata, canonical URLs, Open Graph and Twitter cards, Schema.org JSON-LD, heading hierarchy, semantic HTML, internal linking, and structuring content so an answer engine can quote a single section and still be correct. On the ERTH homepage this was delivered against a supplied requirements document without changing the established design.",
  },
  {
    question: "Where are you based?",
    answer:
      "Cyberjaya, Selangor, Malaysia. I work with businesses across the Klang Valley and remotely.",
  },
  {
    question: "Are you available for software or web development opportunities?",
    answer:
      "Yes. I'm open to software engineering roles, internship or full-time, and I'm reachable by email or WhatsApp.",
  },
];
