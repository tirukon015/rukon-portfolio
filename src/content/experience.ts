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
      "Software support and IT operations for the company's internal systems and infrastructure, and IT Systems & Operations Lead for RPOMS.",
    primary: true,
    projects: ["rpoms"],
    bullets: [
      "Act as IT Systems & Operations Lead for RPOMS: designed and built the system end to end: data model, three-tier access control, ten admin modules, twenty-five API routes, and a storage layer that runs on PostgreSQL, MySQL or a local file store, and remain its maintainer.",
      "Work directly with the operational side RPOMS supports: the ERTH × Maxis router-refurbishment line, the stock it consumes, and the people running it, so the system's rules come from the floor rather than from a specification.",
      "Built RPOMS to replace spreadsheet-based tracking across the full production lifecycle, from intake and serial registry through packing, delivery and workforce reporting.",
      "Provide software support and troubleshooting for internal systems, including the company's day-to-day business tracking system, and handle hardware troubleshooting, system installation and maintenance of PCs and IT equipment.",
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
];
