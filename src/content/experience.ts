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
    role: "Software Specialist / IT Support Technician",
    org: "Blue Bee Technologies Sdn. Bhd.",
    location: "Cyberjaya, Malaysia",
    period: "2024 - Present",
    summary:
      "Web development and IT operations for the company's internal systems, infrastructure and web properties, and IT Systems & Operations Lead for RPOMS.",
    primary: true,
    projects: ["rpoms", "erth"],
    bullets: [
      "Act as IT Systems & Operations Lead for RPOMS: designed and built the system end to end: data model, three-tier access control, ten admin modules, twenty-five API routes, and a storage layer that runs on PostgreSQL, MySQL or a local file store, and remain its maintainer.",
      "Work directly with the operational side RPOMS supports: the ERTH x Maxis router-refurbishment line, the stock it consumes, and the people running it, so the system's rules come from the floor rather than from a specification.",
      "Built RPOMS to replace spreadsheet-based tracking across the full production lifecycle, from intake and serial registry through packing, delivery and workforce reporting.",
      "Delivered the ERTH production homepage: prototyped in Figma, then built from the approved design as static HTML, CSS and vanilla JavaScript with technical SEO, structured data, performance and accessibility work in the same pass.",
      "Run IT operations for internal systems: software support and troubleshooting for the company's day-to-day business tracking system, hardware troubleshooting, system installation, and maintenance of PCs and IT equipment.",
      "Manage website maintenance and technical support for company web properties, including WordPress development, Elementor page design and WooCommerce setup.",
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
    role: "Developer (independent project)",
    org: "ResearchForge",
    location: "Cyberjaya, Malaysia",
    period: "2026",
    summary:
      "An AI research assistant built end to end and deployed on its own subdomain, taken as a way to work through LLM engineering properly rather than to serve a client.",
    projects: ["researchforge"],
    bullets: [
      "Built and deployed a Python and FastAPI backend beside a Next.js frontend as one Vercel project behind a single origin.",
      "Enforced evidence grounding in three places, the prompt, the response schema and the interface, so the tool declines rather than inventing a section the paper does not support.",
      "Added accounts and a private per-account research library, with ownership enforced by Postgres Row Level Security rather than by an interface check.",
      "Wrote 446 tests that run entirely offline against a fake model provider, so the suite spends no tokens and needs no network.",
    ],
  },
];
