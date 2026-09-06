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
    role: "Developer, ResearchForge (university group project)",
    org: "University of Cyberjaya, BIT4543 Artificial Intelligence",
    location: "Cyberjaya, Malaysia",
    period: "2026",
    summary:
      "A five-person group project building and deploying an AI research paper assistant. Development, deployment and maintenance of the live system on my own domain and repository.",
    projects: ["researchforge"],
    bullets: [
      "Built and deployed a Python and FastAPI backend beside a Next.js frontend as one Vercel project behind a single origin.",
      "Implemented per-user data isolation in the database with PostgreSQL Row Level Security, after an application-level ownership check proved insufficient in production.",
      "Constrained model output to a declared schema, validated it on return and discarded anything that failed rather than repairing it.",
      "Backed the system with an offline test suite: 522 backend tests passing and 16 frontend tests, none of which call a paid interface.",
    ],
  },
];
