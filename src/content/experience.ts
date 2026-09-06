export type ExperienceEntry = {
  role: string;
  org: string;
  location: string;
  period: string;
  summary: string;
  bullets: string[];
  primary?: boolean;
  /** Project slugs this role produced. Rendered as links to the case studies. */
  projects?: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "IT Systems & Operations Lead · Web Developer · Software Specialist",
    org: "Blue Bee Technologies Sdn. Bhd.",
    location: "Cyberjaya, Malaysia",
    period: "2024 - Present",
    summary:
      "One role covering the whole chain: operational requirement, system design, web and software implementation, deployment, daily support, and ongoing maintenance. Lead for RPOMS, the ERP-style operational system running the company's router-refurbishment programme.",
    primary: true,
    projects: ["rpoms", "erth"],
    bullets: [
      "Lead RPOMS end to end: gathered the requirement from the production floor, designed the data model and three-tier access control, built ten admin modules and twenty-five API routes, took it to production, and remain its maintainer.",
      "Built RPOMS as a real operational system rather than a reporting tool: serial-level asset tracking, inventory and consumable deduction tied to valid business events, packing and delivery validation, generated delivery paperwork, workforce output, and operational dashboards.",
      "Work directly with the operation the system serves, the ERTH x Maxis refurbishment line, its stock and the people running it, so the software's rules come from how the floor actually works rather than from an assumed process.",
      "Built the ERTH production homepage: prototyped in Figma, then implemented from the approved design as static HTML, CSS and vanilla JavaScript, with technical SEO, structured data, performance and accessibility delivered in the same pass.",
      "Maintain company web properties, including WordPress development, Elementor page design and WooCommerce setup, from requirement through to deployment and ongoing upkeep.",
      "Provide day-to-day IT support and operations: troubleshooting the internal business tracking system and other software, hardware diagnosis and repair, system installation, and maintenance of PCs and IT equipment.",
      "Handle deployment and environment work across Vercel, Supabase and cPanel hosting, including configuration, environment and secret management, and resolving production issues as they surface.",
    ],
  },
  {
    role: "Technical Lead",
    org: "University of Cyberjaya IT Society",
    location: "Cyberjaya, Malaysia",
    period: "2024 - Present",
    summary: "Technical planning and on-site support for IT Society events.",
    bullets: [
      "Coordinate technical planning for IT Society events and provide on-site support to keep them running smoothly.",
      "Assist with organizing and managing IT-related events, working across teams to deliver programs.",
    ],
  },
  {
    role: "Developer, ResearchForge (University Project)",
    org: "University of Cyberjaya, BIT4543 Artificial Intelligence",
    location: "Cyberjaya, Malaysia",
    period: "2026",
    summary:
      "A university project developed as part of BIT4543 Artificial Intelligence, taken end to end: initial documentation and planning, system specification and architecture, development, AI integration, database and security engineering, testing, deployment, debugging and ongoing maintenance. The result is a live AI research paper assistant on my own domain and repository.",
    projects: ["researchforge"],
    bullets: [
      "Started with documentation rather than code: the first commit is the project structure, working rules, a project plan with milestones and risks, numbered technical decisions and the environment contract. Milestones and risks were tracked and closed in the repository as the project ran.",
      "Designed the system: two services in one Vercel project behind a single origin, a provider interface keeping vendor SDKs out of the analysis code, the PostgreSQL schema and its migrations, and the API surface with its error semantics.",
      "Built both sides: a Python and FastAPI backend with the analysis pipeline, PDF ingestion, caching and owner configuration, and a Next.js frontend covering the landing page, authentication flows, analysis workspace, research library and cross-paper review.",
      "Moved per-user data isolation out of application code and into PostgreSQL Row Level Security, after finding that a privileged database key had left every correctly written policy inert while all tests still passed.",
      "Constrained model output to a declared schema, validated it on return, and discarded anything that failed rather than repairing it, so the application never renders a partially valid analysis as though it were complete.",
      "Wrote the test suite: 522 backend tests passing with pytest and 16 frontend tests with Vitest, none of which call a paid AI interface, plus live scripts for the isolation guarantee a stubbed test cannot verify.",
      "Deployed and maintained it: production and environment configuration, then debugging real failures, including a CDN that replaced provider error bodies with a generic message and hid the finding behind the whole evaluation, and a schema change that broke every library read until the queries were made to degrade one migration level at a time.",
    ],
  },
];
