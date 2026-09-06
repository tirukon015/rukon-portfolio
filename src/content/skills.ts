export type Capability = {
  title: string;
  description: string;
  /** Project slugs that back this capability. Rendered as links. */
  evidence?: string[];
};

/**
 * What I do, grouped by the kind of problem rather than by technology.
 *
 * Every entry names the project it comes from, because a capability without
 * evidence behind it is a claim, and a reader has no way to check a claim.
 */
export const capabilities: Capability[] = [
  {
    title: "IT Systems & Operations",
    description:
      "Running the systems a business depends on daily, including the ones I build: deployment and environment configuration, secret management, production issue resolution, user and technical support, hardware diagnosis and repair, system installation, and keeping it all working as requirements change.",
    evidence: ["rpoms"],
  },
  {
    title: "WMS / ERP-style Operational Systems",
    description:
      "Turning a physical operation into one system: asset and serial tracking, inventory and consumable deduction, production stages, delivery, workforce output and operational reporting, all reading from a single data model so a dashboard figure traces back to the event behind it.",
    evidence: ["rpoms"],
  },
  {
    title: "Web Development",
    description:
      "Building the actual website: semantic HTML, CSS that holds up from 320px, and only the JavaScript a page needs. A production homepage shipped as static files with no third-party requests, application interfaces in React and Next.js, and WordPress, Elementor and WooCommerce maintenance on company web properties.",
    evidence: ["erth", "rpoms", "researchforge"],
  },
  {
    title: "Business Requirements to Working System",
    description:
      "Taking a requirement from the people doing the work rather than from a specification, deciding what the system has to model, building it, putting it into use, and correcting it once real use exposes what the requirement left out.",
    evidence: ["rpoms", "erth"],
  },
  {
    title: "Full-Stack Web Development",
    description:
      "End to end in TypeScript and Python: interfaces, API routes, data models, and the deployment path to production. Next.js App Router on the front, Next.js route handlers or FastAPI behind it.",
    evidence: ["rpoms", "researchforge"],
  },
  {
    title: "AI & LLM Engineering",
    description:
      "Shipping an LLM feature that behaves: groundedness enforced in four layers rather than requested in a prompt, output validated against a declared schema and discarded rather than repaired when it fails, and a provider abstraction with a narrow, whitelisted automatic fallback.",
    evidence: ["researchforge"],
  },
  {
    title: "UI/UX & Design-to-Code",
    description:
      "Working an interface out as a Figma prototype before implementation (structure, visual direction and user flow), then translating that prototype into a production build without losing the intent.",
    evidence: ["erth"],
  },
  {
    title: "Technical SEO & GEO Implementation",
    description:
      "Implementing search requirements at the code level: metadata, canonicals, structured data, heading hierarchy, semantic HTML, and content structured so an answer engine can quote a section and still be right.",
    evidence: ["erth"],
  },
  {
    title: "Web Performance & Accessibility",
    description:
      "Making a page cheap and usable: self-hosted fonts, images re-encoded and sized so nothing shifts, landmarks and focus management, keyboard-operable dialogs, and reduced-motion honoured rather than assumed away.",
    evidence: ["erth"],
  },
  {
    title: "Data & Database Systems",
    description:
      "Schema design in PostgreSQL and MySQL, a storage interface with interchangeable backends, row-level access control, and deriving figures from a full history rather than storing totals that cannot be traced.",
    evidence: ["rpoms", "researchforge"],
  },
  {
    title: "System Architecture",
    description:
      "Choosing where a decision lives: one chokepoint rather than a check per route, one interface rather than a vendor dependency, one copy of a rule rather than two that can disagree.",
    evidence: ["rpoms", "researchforge"],
  },
  {
    title: "Document Processing",
    description:
      "Ingesting real files rather than clean ones: signature verification, encryption handling, conservative text cleaning, and generating documents that match a format someone's process already depends on.",
    evidence: ["researchforge", "rpoms"],
  },
  {
    title: "Business Process Automation",
    description:
      "Turning manual, error-prone repetition into software: one entry that updates everything downstream, staged imports that surface problems before they are written, and paperwork generated rather than retyped.",
    evidence: ["rpoms"],
  },
];

/**
 * How well-established a technology is in my own work.
 *
 * Deliberately tiered rather than presented as one flat list. Appearing in a
 * dependency file is not the same as having built something substantial with
 * it, and a reader deserves to be able to tell the difference. The last tier
 * is the one most portfolios leave out: what is genuinely still in progress.
 */
export type StackTier =
  | "Primary"
  | "Working"
  | "Project-specific"
  | "Supporting"
  | "Learning";

export type StackCategory = {
  category: string;
  tier: StackTier;
  /** One line explaining what this tier means. */
  note: string;
  items: string[];
};

export const stack: StackCategory[] = [
  {
    category: "Primary",
    tier: "Primary",
    note: "What I reach for by default, and have built and shipped production systems with.",
    items: [
      "TypeScript",
      "React",
      "Next.js (App Router)",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Node.js",
    ],
  },
  {
    category: "Working",
    tier: "Working",
    note: "Used substantially across more than one project.",
    items: [
      "Python",
      "FastAPI",
      "Pydantic",
      "PostgreSQL",
      "MySQL",
      "Tailwind CSS",
      "Zod",
      "REST APIs",
      "Git / GitHub",
      "Vite",
      "Vercel",
    ],
  },
  {
    category: "Project-specific",
    tier: "Project-specific",
    note: "Chosen for a particular problem, and used properly for it.",
    items: [
      "Figma",
      "Groq API",
      "Anthropic API",
      "Supabase (Auth, Postgres, RLS)",
      "pypdf",
      "pytest",
      "Vitest",
      "ruff",
      "TanStack Table",
      "Recharts",
      "React Hook Form",
      "ExcelJS",
      "jsPDF",
      "JSZip",
      "Papa Parse",
      "Schema.org JSON-LD",
      "axe-core",
    ],
  },
  {
    category: "Supporting",
    tier: "Supporting",
    note: "Part of the work, at a maintenance, operational or foundational level.",
    items: [
      "cPanel",
      "Resend",
      "WordPress",
      "Elementor",
      "WooCommerce",
      "Windows / hardware support",
      "C",
      "C++",
    ],
  },
  {
    category: "Learning",
    tier: "Learning",
    note: "Genuinely in progress. Listed because it is honest, not because it is finished: I use these, and I am still deepening them.",
    items: [
      "Advanced TypeScript types",
      "Automated testing in TypeScript",
      "pgvector / embeddings",
      "Retrieval-augmented generation",
    ],
  },
];
