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
      "Websites and the internal systems a business runs on, plus the IT operations around them. The main three are RPOMS, a production-operations platform for a router-refurbishment line; the completed production homepage for ERTH, a Malaysian e-waste collection service; and ResearchForge, an AI research assistant that analyses academic PDFs. Based in Cyberjaya, Selangor, Malaysia.",
  },
  {
    question: "What is RPOMS?",
    answer:
      "RPOMS is a Router Production Operations Management System built for a refurbishment programme run by Blue Bee Technologies. It covers the full path a unit takes, from intake and serial registry through cleaning, packing into numbered boxes, and delivery with matching paperwork, across ten admin modules and twenty-five API routes in TypeScript, with a storage layer that runs on PostgreSQL, MySQL or a local file store. I designed and built it and remain its maintainer.",
  },
  {
    question: "What is ResearchForge?",
    answer:
      "ResearchForge is an AI research assistant. Upload an academic PDF and it returns a structured summary, a research-gap analysis where each gap carries the evidence in the paper that supports it, and a literature review of the prior work that paper discusses. It runs a Python and FastAPI backend beside a Next.js frontend as one deployment behind a single origin, with accounts, a private per-user library, and 446 tests that run entirely offline.",
  },
  {
    question: "Does ResearchForge use RAG or retrieval?",
    answer:
      "No. The analysis path sends the document itself to the model rather than retrieved passages, so it is not a retrieval-augmented system. A database is connected and analyses are stored in a per-account library, but the retrieval layer is not: the embedding provider interface and request construction are written and unit-tested, while the embedding network call is deliberately not implemented, so no embedding is ever produced and nothing is retrieved. The application states this rather than implying otherwise.",
  },
  {
    question: "What was your role on the ERTH website?",
    answer:
      "Two phases, and the work is complete. The interface was prototyped in Figma before implementation. The production homepage was then built from the client-approved design as static HTML, CSS and vanilla JavaScript bundled by Vite, which replaced roughly 250 kB of prototype JavaScript with 3.7 kB, cut the image payload from 12.0 MB to 2.7 MB, and fixed four real defects the prototype carried. Technical SEO, structured data, performance and accessibility were implemented in the same pass: the head block went from no canonical, no Open Graph and no structured data to all three, with three JSON-LD blocks, and axe-core reports zero violations across five interaction states.",
  },
  {
    question: "Is Touhidul Islam Rukon a web developer or an IT operations lead?",
    answer:
      "Both, and the two sides feed each other. The web development side is production websites and application interfaces in HTML, CSS, JavaScript, TypeScript, React and Next.js. The IT operations side is running the systems a business depends on day to day: deployment, configuration, troubleshooting, hardware and equipment, and web property maintenance. On RPOMS the roles are the same job, because the system models a physical production line and its rules come from the floor rather than a specification.",
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
      "Yes, at the implementation level: metadata, canonical URLs, Open Graph and Twitter cards, Schema.org JSON-LD, heading hierarchy, semantic HTML, internal linking, and structuring content so an answer engine can quote a single section and still be correct. On the ERTH homepage this was delivered as part of the production build, against a supplied requirements document and without changing the approved design.",
  },
  {
    question: "Where are you based?",
    answer:
      "Cyberjaya, Selangor, Malaysia. I work with businesses across the Klang Valley and remotely.",
  },
  {
    question: "Are you available for software or web development opportunities?",
    answer:
      "Yes. I'm open to web development and IT operations roles, internship or full-time, and I'm reachable by email or WhatsApp.",
  },
];
