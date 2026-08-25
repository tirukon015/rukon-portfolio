export type CaseStudySection = {
  heading: string;
  body: string[];
};

export type Project = {
  slug: string;
  name: string;
  fullName: string;
  tagline: string;
  summary: string;
  role: string;
  period: string;
  affiliation: string;
  confidential: boolean;
  tech: string[];
  highlights: string[];
  workflow: string[];
  sections: CaseStudySection[];
  image?: {
    src: string;
    alt: string;
    variant: "mark" | "screenshot";
  };
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "rpoms",
    name: "RPOMS",
    fullName: "Router Production Operations Management System",
    tagline: "The system that runs a router-refurbishment production line.",
    summary:
      "A production-operations platform built to replace spreadsheets for a router-refurbishment program run by Blue Bee Technologies, covering every stage a unit passes through, from intake to delivery.",
    role: "IT Systems & Operations Lead, RPOMS",
    period: "2026 (ongoing)",
    affiliation: "Blue Bee Technologies Sdn. Bhd., ERTH × Maxis program",
    confidential: true,
    tech: [
      "Next.js 15 (App Router)",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "PostgreSQL",
      "MySQL",
      "Recharts",
      "React Hook Form + Zod",
      "TanStack Table",
      "ExcelJS / jsPDF",
    ],
    highlights: [
      "Replaced manual spreadsheet tracking with one system covering the full production lifecycle",
      "Three-tier, role-based access control with HMAC-signed sessions and no default passwords",
      "One data layer that runs on Postgres, MySQL, or a local file store depending on the deployment target",
      "Serial-level tracking from intake through packing and delivery, validated against configurable rules",
      "Generates delivery paperwork from the operations team's own document template",
      "Built by someone who works both sides: the software and the physical production line it runs",
    ],
    workflow: [
      "Unit arrives",
      "Accepted into the registry (by serial number)",
      "Cleaned",
      "Packed into a numbered box",
      "Delivered to a Maxis site with matching paperwork",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "RPOMS is an internal operations system built for a router-refurbishment program that Blue Bee Technologies runs in partnership with ERTH and Maxis. Before RPOMS, the operation was tracked in spreadsheets. RPOMS replaces that with a single system covering the whole path a unit takes: arriving, accepted, cleaned, packed into a box, and delivered with the paperwork that goes with it.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A physical production line (intake, cleaning, packing, delivery) was being coordinated through spreadsheets shared across a team. That made it hard to know, at any moment, what had actually happened on the floor: what stock remained, who did what, whether a delivery matched what was scanned, or whether a report was even current.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "I work as IT Systems & Operations Lead around RPOMS, which means the role isn't just writing the software. I designed and built the system end to end (data model, access control, every module, the deployment path to production, and I remain its maintainer), and I work directly with the operational side it supports: the production line, the stock it tracks, and the people running it day to day.",
          "That combination is the point. RPOMS models a physical process (a router arriving, getting cleaned, getting packed, going out the door) closely enough to actually run it, which only works if the person building it understands that process, not just the database behind it.",
        ],
      },
      {
        heading: "IT Systems",
        body: [
          "On the systems side: application development, the data model, three-tier access control, database and storage architecture, admin functionality for every stage of the pipeline, reporting and export workflows, and ongoing maintenance as requirements change.",
          "A Daily Production Report is entered once and updates the public dashboard and deducts stock in the same step. A Serial Registry tracks every unit by serial number, with configurable detection rules so a new model doesn't require a code change. Report history, CSV import, and PDF/Excel export all sit on the same data layer.",
        ],
      },
      {
        heading: "Operations",
        body: [
          "On the operations side: the actual production workflow (intake, cleaning, packing, delivery), the inventory it consumes (routers, chargers, LAN cables), and the constraints that come from a physical floor rather than a spec document.",
          "Packing scans serials into numbered boxes and reports its own problems (an incomplete box or a duplicate serial) instead of leaving them to be discovered later. Delivery requires the scanned load to match the quantity a delivery was raised for before it can be saved, and generates the delivery paperwork directly from the operations team's own document template rather than redrawing it. Packing a router is never allowed to record the packer as its acceptor, because those are different jobs on the floor and conflating them would corrupt the daily report. Rules like that come from working with the process, not guessing at it.",
        ],
      },
      {
        heading: "Technical Implementation",
        body: [
          "Frontend: Next.js 15 (App Router) and React 19 in TypeScript, styled with Tailwind CSS v4, with data tables via TanStack Table, charts via Recharts, and forms validated with React Hook Form and Zod.",
          "Backend: a single storage interface with three interchangeable backends, PostgreSQL (via Supabase, for the Vercel deployment), MySQL (for a cPanel deployment), and a local file store for development, selected automatically by which environment variables are present, with no code change between them.",
          "Access & sessions: three access tiers, each gated by its own password. A tier with no password configured is switched off entirely rather than falling back to a default. Sessions are an HMAC-signed cookie, and the app refuses to start signing sessions in production without a configured secret.",
          "Exports: delivery orders and tracker sheets are generated to match the formats the operations team already uses, and report history exports to PDF.",
        ],
      },
      {
        heading: "Key Features",
        body: [
          "Auto-refreshing public dashboard with daily figures, batch progress, and trend comparisons against yesterday, a 7-day average, or a custom range.",
          "Serial-level registry with staged CSV import: duplicates are surfaced before anything is written, not after.",
          "Packing and delivery flows that validate against the registry and the raised quantity, rather than trusting manual entry.",
          "Per-person workforce output against targets, with case-insensitive name matching so data-entry variance doesn't fragment the numbers.",
          "A configurable demo mode: a deployment can run as a full walkthrough where only explicitly named modules actually write data, enforced at a single middleware chokepoint.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "The spreadsheet-based tracking this program previously relied on has been replaced by a single system in active use for daily production reporting, registry, packing, delivery, and workforce tracking.",
        ],
      },
    ],
    image: {
      src: "/images/rpoms-mark.png",
      alt: "RPOMS wordmark",
      variant: "mark",
    },
  },
  {
    slug: "erth",
    name: "ERTH",
    fullName: "ERTH (electronics recycling and rewards)",
    tagline: "Designed in Figma, and the website I'm building from that design.",
    summary:
      "The website for ERTH, a consumer electronics recycling and rewards service. I designed it in Figma, and I'm building the production site from that design.",
    role: "UI/UX Designer & Web Developer",
    period: "2026 (in progress)",
    affiliation: "ERTH",
    confidential: false,
    tech: ["Figma", "React", "HTML5", "CSS3", "JavaScript"],
    highlights: [
      "Full UI/UX design in Figma, then built out as a working site rather than handed off to someone else",
      "Four-step user flow from device selection to payout, with no unnecessary screen in between",
      "Pricing and process designed to be transparent and published, not hidden behind a quote form",
      "Multiple design and build iterations, refining toward the production site",
    ],
    workflow: ["Choose your device", "Get your quote", "Book collection", "Get rewarded"],
    sections: [
      {
        heading: "Overview",
        body: [
          "ERTH is a consumer electronics recycling and rewards service: pickup by an on-the-ground collection team, published pricing, and cashless payout. I designed its website in Figma and am building the production site from that design myself.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A recycling and trade-in service depends on people trusting it enough to hand over a device and their data. The website's job is to make the process, the pricing, and the handling of personal data legible before someone commits to anything, not to sell with vague claims.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "Both design and development. I designed the site in Figma (structure, visual direction, typography, layout, and the user flow), and I'm the one building it into a working website from that design, rather than implementing someone else's file.",
        ],
      },
      {
        heading: "Design",
        body: [
          "The design work centers on trust and clarity: a simple four-step flow (choose your device, get a quote, book a collection, get paid), published pricing instead of a hidden quote process, and an explicit explanation of how device data is handled before someone hands anything over. Those decisions were made and laid out in Figma before any code was written.",
        ],
      },
      {
        heading: "Development",
        body: [
          "I'm converting that Figma design into a working site myself, in React, across multiple build iterations, checking each pass against the design as it goes. Development is ongoing. Some sections are further along than others, and the site isn't yet at its final production state.",
        ],
      },
      {
        heading: "Key Features",
        body: [
          "A four-step process (device, quote, collection, payout) kept to one screen's worth of attention at a time.",
          "Transparent, published pricing instead of a lead-gated quote.",
          "Explicit messaging on device-data handling as part of the recycling flow, not an afterthought.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "The design is complete in Figma. Development is in progress: multiple build iterations exist, and the site is being refined toward its final production version.",
        ],
      },
    ],
    image: {
      src: "/images/erth-mark.png",
      alt: "ERTH mark",
      variant: "mark",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
