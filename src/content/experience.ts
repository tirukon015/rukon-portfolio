export type ExperienceEntry = {
  role: string;
  org: string;
  location: string;
  period: string;
  summary: string;
  bullets: string[];
  primary?: boolean;
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
    bullets: [
      "Act as IT Systems & Operations Lead for RPOMS, working across both the software and the physical production line it runs: designed and built the system, and remain its maintainer, while working directly with the operational side it supports (the ERTH × Maxis router-refurbishment line, replacing spreadsheet-based tracking end to end).",
      "Provide software support and troubleshooting for internal systems, including the company's day-to-day business tracking system.",
      "Handle hardware troubleshooting, system installation, and maintenance of PCs and IT equipment.",
      "Manage website maintenance and technical support for company web properties, including WordPress development, Elementor page design, and WooCommerce setup.",
      "Resolve software and application-level issues and provide end-user technical support in a live business environment.",
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
