export type Capability = {
  title: string;
  description: string;
  /** Project slugs that back this capability. Rendered as links. */
  evidence?: string[];
};

/**
 * What I build, in four areas rather than a wall of twelve.
 *
 * Each area folds together the narrower capabilities it replaced, and keeps
 * the same rule: every entry names the project it comes from, because a
 * capability without evidence behind it is a claim a reader cannot check.
 */
export const capabilities: Capability[] = [
  {
    title: "Product & full-stack development",
    description:
      "End to end in TypeScript and Python: interfaces, API routes, data models, access control and the deployment path to production. Next.js App Router on the front, Next.js route handlers or FastAPI behind it, PostgreSQL or MySQL underneath, deployed on Vercel, Supabase and cPanel and kept running afterwards.",
    evidence: ["rpoms", "rpoms-print-engine", "researchforge"],
  },
  {
    title: "Systems & internal tools",
    description:
      "Turning a physical operation into one system: serial and asset tracking, inventory and consumable deduction, production stages, delivery paperwork, workforce output and reporting, all reading from a single data model so a dashboard figure traces back to the event behind it. Requirements gathered from the floor, not from a specification.",
    evidence: ["rpoms"],
  },
  {
    title: "AI & automation",
    description:
      "LLM features that behave: groundedness enforced in layers rather than requested in a prompt, output validated against a declared schema and discarded rather than repaired, and a provider abstraction with a narrow automatic fallback. And the plainer automation that matters more often: one entry that updates everything downstream, staged imports that surface problems before anything is written, paperwork generated rather than retyped.",
    evidence: ["researchforge", "rpoms"],
  },
  {
    title: "UI/UX engineering",
    description:
      "From a Figma prototype to a production build without losing the intent: semantic HTML, CSS that holds from 320px, only the JavaScript a page needs, technical SEO and structured data implemented in the same pass, and accessibility checked with axe rather than assumed.",
    evidence: ["erth"],
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
      "Web Bluetooth",
      "IndexedDB",
      "Service workers (Workbox)",
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
