/**
 * The public CV.
 *
 * Everything a visitor may read without asking. The three protected fields
 * (email, phone, address) are deliberately absent from this file, because this
 * file is imported by a client component and therefore ships in the JavaScript
 * bundle. They are served by `/api/cv/contact` after an access grant instead.
 */

export type CVSection = {
  heading: string;
  items: string[];
};

export type CVRole = {
  title: string;
  org?: string;
  meta?: string;
  body: string;
};

export type CVQualification = {
  institution: string;
  location: string;
  award: string;
  meta: string;
};

export const cv = {
  name: "Touhidul Islam Rukon",
  title: "IT Systems & Operations Lead · Web Developer · Software Specialist",
  /** Public links only. These are already published elsewhere on the site. */
  links: [
    { label: "LinkedIn", value: "linkedin.com/in/tirukon015", href: "https://linkedin.com/in/tirukon015" },
    { label: "Portfolio", value: "rukon.dev", href: "https://www.rukon.dev" },
    { label: "GitHub", value: "github.com/tirukon015", href: "https://github.com/tirukon015" },
  ],

  summary: [
    "IT Systems & Operations Lead · Web Developer · Software Specialist with hands-on experience across business IT operations, software systems, web development, and technical support.",
    "Experienced in supporting internal business systems, troubleshooting hardware and software issues, configuring systems, maintaining IT equipment, and resolving day-to-day operational problems.",
    "Experienced in business web development and maintenance, including WordPress, Elementor, WooCommerce, responsive interfaces, updates, and technical troubleshooting.",
    "Built practical software around real operational workflows, including RPOMS, a WMS/ERP-like operational system for inventory, device, delivery, usage, and related business processes.",
    "Developed ResearchForge as a University Project for BIT4543 Artificial Intelligence, handling documentation, planning, architecture, development, testing, deployment, debugging, and maintenance.",
    "Hands-on with Python, FastAPI, Next.js, PostgreSQL, Row Level Security, structured AI output validation, testing, deployment, and production problem solving.",
    "Certified in Google IT Support and C/C++ Specialization through Coursera, with continued development across software, web, systems, and AI technologies.",
  ],

  proficiencies: [
    {
      heading: "IT Systems & Operations",
      items: [
        "Business system support, monitoring, maintenance, troubleshooting, deployment and operational issue resolution",
      ],
    },
    {
      heading: "Software & Web Development",
      items: [
        "Application logic, business workflows, dashboards, responsive interfaces, WordPress, Elementor and WooCommerce",
      ],
    },
    {
      heading: "Frontend & Backend",
      items: ["Next.js, Python, FastAPI, APIs and frontend/backend integration"],
    },
    {
      heading: "Database & Security",
      items: ["PostgreSQL, Row Level Security (RLS), authorization and per-user data isolation"],
    },
    {
      heading: "AI, Testing & Deployment",
      items: [
        "Research-paper processing, structured output and schema validation, backend and frontend testing, offline testing and Vercel deployment",
      ],
    },
    {
      heading: "Technical Support",
      items: [
        "Hardware and software troubleshooting, system installation, PC and peripheral support, configuration and user assistance",
      ],
    },
    {
      heading: "Hardware & Software Technician",
      items: [
        "Mac and Windows PC/laptop diagnostics, OS installation, software setup, hardware repair, component replacement, peripherals, networking, system configuration, maintenance and troubleshooting",
      ],
    },
  ] satisfies CVSection[],

  experience: [
    {
      title: "IT Systems & Operations Lead · Web Developer · Software Specialist",
      org: "Blue Bee Technologies Sdn. Bhd., Cyberjaya",
      body: "Support and maintain internal business systems and day-to-day IT operations; handle software and hardware troubleshooting, system configuration, deployment, maintenance, user support, and web-related technical operations.",
    },
    {
      title: "RPOMS: WMS/ERP-like Operational System",
      body: "Designed and developed a real-world WMS/ERP-like operational system for a major Malaysian telecommunications and technology company through ERTH, covering system architecture, inventory and asset management, router and device workflows, charger deductions, delivery and usage tracking, dashboards, data relationships, and operational logic.",
    },
    {
      title: "ERTH: Business Web Development",
      body: "Developed and maintained business web solutions for ERTH under the wider Blue Bee environment, covering responsive frontend implementation, WordPress/CMS, Elementor, WooCommerce and e-commerce, integrations, deployment, updates, and technical maintenance.",
    },
    {
      title: "BBTech: IT & Operations",
      body: "Handled Mac and Windows hardware and software support, troubleshooting, OS and software installation, system configuration, maintenance, and peripheral and networking issues. Managed day-to-day operational workflows including quality control, inventory management, product listing, order preparation, packaging, and stock handling. Built and maintained an internal Microsoft Excel tracking system for operational data and workflow management, later followed by development of a separate web-based system.",
    },
    {
      title: "ResearchForge: Developer, University Project",
      meta: "University of Cyberjaya · BIT4543 Artificial Intelligence · 2026",
      body: "Designed and implemented the system end to end, covering architecture, Next.js frontend, Python/FastAPI backend, PostgreSQL, AI integration, RLS-based data isolation, schema validation, automated testing, Vercel deployment, debugging, and maintenance.",
    },
    {
      title: "Technical Management, UoC IT Society",
      org: "University of Cyberjaya",
      body: "Assisted with technical planning, coordination, and on-site IT support for university events.",
    },
  ] satisfies CVRole[],

  education: [
    {
      institution: "University of Cyberjaya",
      location: "Cyberjaya, Selangor, MY",
      award: "Bachelor's in Information Technology (IT)",
      meta: "Expected graduation 2027",
    },
    {
      institution: "Daffodil International University",
      location: "Savar, Dhaka, BD",
      award: "Bachelor's in Computer Science & Engineering (CSE)",
      meta: "Fall 2024, completed 1 semester",
    },
    {
      institution: "Milestone College",
      location: "Uttara, Dhaka, BD",
      award: "Higher Secondary, Science",
      meta: "2023",
    },
  ] satisfies CVQualification[],

  training: [
    {
      heading: "Google IT Support Specialization — Coursera",
      items: ["Networking, system administration, IT security, troubleshooting, and technical support fundamentals."],
    },
    {
      heading: "Coding for Everyone: C and C++ Specialization — Coursera",
      items: ["Programming fundamentals, syntax, problem solving, and logic building using C and C++."],
    },
  ] satisfies CVSection[],

  volunteer: [
    {
      heading: "E-Waste Collection Volunteer — UOC Sustainable Week 2024 and 2025",
      items: [
        "Participated in electronic-waste collection and awareness activities focused on responsible e-waste management.",
      ],
    },
    {
      heading: "Flood Relief Volunteer — Sherpur, Mymensingh, Bangladesh (2024)",
      items: [
        "Led fundraising efforts supporting 90 families and created community-focused content to encourage aid.",
      ],
    },
  ] satisfies CVSection[],

  professionalDevelopment: [
    "Actively participated in IT-focused seminars, workshops, and professional events covering cybersecurity, AI, cloud computing, and related technology topics.",
  ],

  softSkills: [
    "Teamwork",
    "Communication",
    "Leadership",
    "Negotiation",
    "Problem-Solving",
    "Adaptability",
    "Organization",
  ],

  computerSkills: ["Microsoft Word, Excel & PowerPoint", "General technical and computer skills"],

  languages: ["English", "Bengali", "Hindi", "Urdu"],
} as const;

/** The three fields that never appear in this bundle. Labels only. */
export const protectedContactFields = [
  { key: "email", label: "Email Address", placeholderWidth: "11rem" },
  { key: "phone", label: "Phone Number", placeholderWidth: "9rem" },
  { key: "address", label: "Address", placeholderWidth: "15rem" },
] as const;

export type ProtectedContactKey = (typeof protectedContactFields)[number]["key"];
