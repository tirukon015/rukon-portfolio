export const about = {
  profileTitle: "IT Systems & Operations Lead · Web Developer · Software Specialist",
  profileTags: [
    "IT Systems & Operations",
    "Web Development",
    "Software Development",
    "IT Support",
    "Business Workflows",
  ],
  /**
   * The homepage version: three paragraphs, chosen from `paragraphs` below,
   * that say who I am rather than re-listing the projects the page has
   * already shown. The full set is kept for the CV and About routes.
   */
  short: [
    "I'm a hands-on technology professional in Cyberjaya, Malaysia. My work sits where three things meet: the operational problem a business actually has, the system built to solve it, and the day-to-day support that keeps it working once people depend on it.",
    "That means I'm rarely doing only one of those jobs. I write the software, but I also gather the requirement from the floor rather than a specification, deploy it, support the users, troubleshoot the hardware and software around it, and keep improving it after launch. The technical work and the operational work are the same job.",
    "I'm completing a B.Sc. in Information Technology at the University of Cyberjaya. My TypeScript and newer platform work is something I'm deliberately still deepening rather than treating as finished. I'm open to roles across IT systems and operations, web development and software.",
  ],
  paragraphs: [
    "I'm a hands-on technology professional in Cyberjaya, Malaysia. My work sits where three things meet: the operational problem a business actually has, the system built to solve it, and the day-to-day support that keeps it working once people depend on it.",
    "That means I'm rarely doing only one of those jobs. I write the software, but I also gather the requirement from the floor rather than a specification, deploy it, support the users, troubleshoot the hardware and software around it, and keep improving it after launch. The technical work and the operational work are the same job.",
    "The Router Production Operations Management System (RPOMS) is the clearest example. It's an enterprise operations platform I designed, built and deployed for a live router-refurbishment programme at an established Malaysian technology company, and still maintain: serial-level asset tracking, inventory deduction, packing, delivery tracking with mobile electronic proof of delivery (ePOD), real-time Control Center monitoring with an append-only production ledger, workforce output, operational dashboards, and an Ecommerce stock-request portal. Over 65,000 lines of TypeScript across 96 compiled routes, with 2,388 automated tests, replacing the spreadsheets the operation used to run on.",
    "On the web side, I built the production homepage for Malaysia's No. 1 E-Waste Recycling Company from the client-approved design: static HTML, CSS and vanilla JavaScript on Vite, with the technical SEO, structured data, performance and accessibility work in the same pass. Alongside that I maintain the company's web properties, including WordPress, Elementor and WooCommerce work.",
    "ResearchForge is where the software-engineering side goes deepest: a university project for BIT4543 Artificial Intelligence that I took from planning documents through to a deployed, maintained AI research assistant, with a Python and FastAPI backend, a Next.js frontend, per-user data isolation enforced by PostgreSQL Row Level Security, and a test suite that never calls a paid AI interface.",
    "I'm completing a B.Sc. in Information Technology at the University of Cyberjaya. My TypeScript and newer platform work is something I'm deliberately still deepening rather than treating as finished. I'm open to roles across IT systems and operations, web development and software.",
  ],
  facts: [
    { label: "Location", value: "Cyberjaya, Selangor, Malaysia" },
    { label: "Degree", value: "B.Sc. Information Technology (in progress)" },
    { label: "Status", value: "Open to opportunities" },
    { label: "Languages", value: "English, Bengali, Hindi, Urdu" },
  ],
} as const;
