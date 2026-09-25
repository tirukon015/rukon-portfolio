/**
 * A screenshot or diagram placed under a section's copy.
 *
 * Used only where a picture shows something the paragraphs cannot: a layout,
 * a state, a piece of tooling. A confidential project may carry figures only
 * when they were captured on synthetic demo data (see `confidentialNotice`).
 * The caption says what the reader is looking at; the alt text is written
 * for someone who cannot see it.
 */
export type CaseStudyFigure = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  /**
   * Break out of the reading column to the page width on larger screens.
   * For diagrams whose labels are unreadable at column width.
   */
  wide?: boolean;
};

export type CaseStudySection = {
  heading: string;
  body: string[];
  /**
   * Optional caveat rendered beneath the section. Used to keep a claim
   * honest in place rather than qualifying it in a footnote nobody reads.
   */
  note?: string;
  figures?: CaseStudyFigure[];
};

/** Grouped technology list, so a case study can show layers rather than a bag of chips. */
export type TechGroup = {
  label: string;
  items: string[];
};

/**
 * Where a capability actually stands. Kept explicit because "it exists in the
 * repository" and "it runs in production" are different claims, and conflating
 * them is the fastest way to lose a technical reader's trust.
 */
export type CapabilityState = "implemented" | "available" | "not-connected";

export type ProjectStatusItem = {
  label: string;
  state: CapabilityState;
  detail: string;
};

export type ProjectKind = "professional" | "university-project" | "personal-project";

/**
 * Where a project sits in the portfolio's hierarchy.
 *
 * Not every project is an equal card. One flagship gets the large treatment,
 * featured work gets a full block, and the rest read as an editorial list.
 */
export type ProjectTier = "flagship" | "featured" | "secondary";

/**
 * A system that belongs to a larger platform.
 *
 * `summary` is optional on purpose: a subsystem can be named before its
 * write-up exists, and the homepage says so rather than inventing one.
 */
export type RelatedSystem = {
  name: string;
  /** How it relates to the parent, in a few words. */
  relation: string;
  summary?: string;
  /** A case-study slug once one exists. */
  slug?: string;
  /** Somewhere to read more before a case study exists, such as an article. */
  href?: string;
};

export type ProjectCategory =
  | "Systems / ERP / WMS"
  | "Web Apps / Software"
  | "Websites"
  | "iOS / Mobile"
  | "Other";

export type ProjectCategorySlug =
  | "systems"
  | "web-apps"
  | "websites"
  | "ios-mobile"
  | "other";

export type ProjectRole = "Sole Developer" | string;

export type HROverview = {
  /** One-line value proposition / hook */
  valueProposition: string;
  /** Actual professional / engineering role */
  role: ProjectRole;
  /** Specific scope of responsibility */
  roleScope?: string;
  /** Organization, client, or business context */
  context: string;
  /** Eye-catching scannable highlights emphasizing operational impact, architecture, automation */
  highlights: string[];
  /** Scannable technologies line */
  technologies: string[];
};

export type Project = {
  slug: string;
  name: string;
  fullName: string;
  tagline: string;
  summary: string;
  category: ProjectCategory;
  categorySlug: ProjectCategorySlug;
  categories: ProjectCategory[];
  hrOverview: HROverview;
  role: ProjectRole;
  roleScope?: string;
  period: string;
  affiliation: string;
  confidential: boolean;
  kind: ProjectKind;
  tier: ProjectTier;
  /** Set on a platform that has connected subsystems. */
  ecosystem?: {
    label: string;
    systems: RelatedSystem[];
  };
  /** Short list shown as chips on cards and the case-study header. */
  tech: string[];
  /** Full, grouped stack shown in the case-study body. */
  techGroups?: TechGroup[];
  highlights: string[];
  workflow: string[];
  sections: CaseStudySection[];
  /** Implemented / available / not connected. Rendered as a status table. */
  status?: ProjectStatusItem[];
  /** Stated plainly rather than omitted. */
  limitations?: string[];
  /** What comes next, in the order the project's own backlog gives it. */
  roadmap?: string[];
  /**
   * Replaces the default confidentiality notice on the case study, for a
   * confidential project whose figures were captured on synthetic data.
   */
  confidentialNotice?: string;
  /** Social preview for the project's pages (1200 x 630), instead of the site default. */
  shareImage?: { src: string; width: number; height: number; alt: string };
  /** One screenshot shown on the project overview, under the summary. */
  previewFigure?: CaseStudyFigure;
  /**
   * A few checkable figures shown on the homepage card, each backed by the
   * case study or the repository. Never an outcome metric nobody measured.
   */
  facts?: { value: string; label: string }[];
  image?: {
    src: string;
    /**
     * Variant for the dark theme. Only needed where a mark ships with an
     * opaque background, which makes one file wrong in one of the two themes.
     */
    srcDark?: string;
    alt: string;
    variant: "mark" | "screenshot";
  };
  links?: { label: string; href: string; external?: boolean }[];
};

export const projects: Project[] = [
  {
    slug: "rpoms",
    name: "RPOMS",
    fullName: "Router Production Operations Management System",
    tagline: "An operations system, WMS/ERP-like in shape, used on a live router-refurbishment line.",
    summary:
      "The operations system that replaced the spreadsheets running a router-refurbishment line: a daily production report that deducts stock as it saves, serial-level tracking from acceptance into numbered boxes and out on deliveries, delivery paperwork generated from the office's own template, workforce output, and a stock-request portal for the Ecommerce team. Designed, built and maintained by me alone: about 59,600 lines of TypeScript, 16 pages, 41 API route files and 895 automated tests.",
    category: "Systems / ERP / WMS",
    categorySlug: "systems",
    categories: ["Systems / ERP / WMS", "Web Apps / Software"],
    hrOverview: {
      valueProposition:
        "One system for a live router-refurbishment line: the day's production entered once, stock that follows from it, and every router traceable by serial from acceptance to delivery.",
      role: "Sole Developer",
      roleScope: "End-to-End Architecture, Full-Stack Build, Database, Security & Deployment",
      context: "Blue Bee Technologies × ERTH × Maxis programme (Cyberjaya, Malaysia)",
      highlights: [
        "Replaced spreadsheets with one system covering stock intake, acceptance, packing, delivery and daily reporting",
        "Stock of routers, chargers, LAN cables and boxes derived from the daily report and a ledger, never kept as a hand-edited balance",
        "Serial-level traceability from the acceptance scan to a numbered box, a delivery, and the Delivery Order generated for it",
        "Dashboard with comparisons and trends, in English and Arabic (right to left), light and dark",
        "One storage interface over PostgreSQL (Supabase), MySQL and local files, selected by environment",
        "Four roles, signed sessions, a production write lock, and a guard that stops preview deployments touching production data",
        "895 automated tests, including real SQL against in-process PostgreSQL, run in CI on every push",
      ],
      technologies: ["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Supabase", "Tailwind CSS v4", "Zod", "Vitest"],
    },
    role: "Sole Developer",
    roleScope: "End-to-End Architecture, Full-Stack Build, Database, Security & Deployment",
    period: "July 2026 – present",
    affiliation: "Blue Bee Technologies Sdn. Bhd., ERTH × Maxis programme",
    confidential: true,
    kind: "professional",
    tier: "flagship",
    /*
     * Two related systems, described from their own repositories. RPOMS AI is
     * a separate application for the same programme and shares no code or
     * data with RPOMS; the print engine is built standalone with an explicit
     * integration boundary and is intended to sit inside RPOMS once validated.
     */
    ecosystem: {
      label: "RPOMS ecosystem",
      systems: [
        {
          name: "RPOMS AI",
          relation: "Related system, same programme",
          summary:
            "A router surface inspector: photo, quality gate, a vision model that only observes, and a deterministic rule engine that decides. Own repository and database; it never connects to RPOMS.",
          href: "/blog/a-vision-model-that-only-observes",
        },
        {
          name: "RPOMS Print Engine",
          relation: "Subsystem, integration pending",
          summary:
            "Scan-to-label printing to a NIIMBOT B1 Pro straight from the browser over Web Bluetooth, built as an offline-first workstation with its own case study. Standalone until it is validated on the line and wired into RPOMS.",
          slug: "rpoms-print-engine",
        },
      ],
    },
    tech: [
      "Next.js 15 (App Router)",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "PostgreSQL / Supabase",
      "Zod",
      "Vitest + PGlite",
      "Recharts",
      "ExcelJS / JSZip / jsPDF",
    ],
    techGroups: [
      {
        label: "Application",
        items: ["Next.js 15 (App Router)", "React 19", "TypeScript", "Tailwind CSS v4", "Base UI / shadcn"],
      },
      {
        label: "Data & persistence",
        items: ["PostgreSQL (Supabase)", "postgres.js", "MySQL (report store)", "Local JSON file store", "Zod"],
      },
      {
        label: "Interface & reporting",
        items: ["Recharts", "next-themes", "Typed i18n (en / ar, RTL)", "sonner"],
      },
      {
        label: "Documents & import/export",
        items: ["JSZip (DOCX template fill)", "ExcelJS", "jsPDF", "Papa Parse", "qrcode"],
      },
      {
        label: "Quality & platform",
        items: ["Vitest", "PGlite", "ESLint", "GitHub Actions", "Vercel", "Node.js"],
      },
    ],
    highlights: [
      "Covers the operational chain end to end: stock intake, acceptance, packing, delivery and daily reporting, in one system",
      "Serial-level traceability from acceptance through packing to a delivered box, so any unit can be accounted for after the fact",
      "Consumable stock deducts from the production figures entered once, rather than being counted a second time by hand",
      "One storage interface with three interchangeable backends, chosen by which environment variables are present",
      "Four roles with server-side enforcement, signed sessions and no default passwords",
      "Delivery paperwork generated from the operations team's own Word document rather than redrawn",
      "895 automated tests and CI, with two audits' findings worked through in the code",
    ],
    workflow: [
      "Stock booked in by model",
      "Accept scan into the registry",
      "Cleaned (daily count)",
      "Packed into a numbered box",
      "Delivered against the scanned load",
      "Delivery Order and tracker generated",
    ],
    previewFigure: {
      src: "/images/rpoms/dashboard-overview.png",
      alt: "The RPOMS dashboard: accepted, retired, cleaned and packaged today with the change from yesterday, batch progress at 92 percent, and each worker's output against a per-person target.",
      width: 1440,
      height: 900,
      caption: "The dashboard, running locally on synthetic demo data. Every name and figure is fictional.",
    },
    sections: [
      {
        heading: "Overview",
        body: [
          "RPOMS is the operations system for a router-refurbishment programme that Blue Bee Technologies runs with ERTH and Maxis. It records each day's production, tracks every router by serial number from acceptance into a numbered box and out on a delivery, keeps the stock of routers, chargers, cables and boxes, and produces the delivery paperwork the office already uses. A second, locked-down build of the same code gives the Ecommerce team a portal for requesting stock.",
          "The comparison to a warehouse or resource-planning system is about shape rather than scale. It is not a commercial ERP suite and does not try to be one: there is no finance, procurement or HR module. What it shares with that category is the structure, a single operational data model that inventory, production, delivery, workforce and reporting all read from, so a figure on a dashboard traces back to the event that produced it.",
          "It is one Next.js 15 application: about 59,600 lines of TypeScript across 16 pages and 41 API route files, with 895 automated tests. Every screenshot on this page was taken from that application running locally on synthetic data.",
        ],
        figures: [
          {
            src: "/images/rpoms/dashboard-overview.png",
            alt: "The RPOMS dashboard showing today's accepted, retired, cleaned and packaged counts with the change from yesterday, today's notes, batch progress of 2,206 of 2,400, and the workforce assignment by department against per-person targets.",
            width: 1440,
            height: 900,
            caption: "The read-only dashboard. Today's four figures against yesterday, batch progress, and each person's output against their per-person target.",
            wide: true,
          },
        ],
      },
      {
        heading: "Problem",
        body: [
          "A physical production line (intake, acceptance, cleaning, packing, delivery) was being coordinated through spreadsheets shared across a team. That made it hard to know, at any moment, what had actually happened on the floor: what stock remained, who did what, which box a serial went into, whether a delivery matched what was scanned, or whether a report was still current.",
          "Spreadsheets do not validate. They have no single source of truth once someone keeps a private copy to be safe, and no audit trail once a number looks wrong. The spreadsheet is still visible in the code: the model-detection rules were seeded from the team's Excel formula, and a registry row is described as the web equivalent of a row in the Excel ACCEPTED list.",
        ],
      },
      {
        heading: "Context",
        body: [
          "The programme refurbishes used routers in batches, each with a target. That is a different problem from manufacturing: units arrive in unknown condition and unpredictable quantities, and each one carries a serial number the system does not get to choose.",
          "The operation runs on a physical floor in Malaysia, with a small team, a shared set of consumables, two warehouse sites, and delivery paperwork a customer already expects in a particular format. Those constraints shaped the software more than any specification did.",
        ],
      },
      {
        heading: "Approach",
        body: [
          "The first rule was that the software should fail in the safe direction. A missing password disables that login rather than falling back to a known value. A missing session secret stops the application in production. A missing deployment flag leaves production write-locked rather than silently live. A preview deployment pointed at the production database refuses to start serving.",
          "The second rule was that a number should be traceable. Stock is derived from the full history of adjustments and consumption rather than stored as a running total, so a figure that looks wrong can be walked back to the day that produced it.",
          "The third rule was that business rules belong in one place. The arithmetic that decides how many packaging boxes a day's output consumes lives in a single module that the report form, the inventory and the Ecommerce planner all call, so they cannot disagree about the same day.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "I am the only developer on RPOMS. Of 284 commits on the current line, every one except an uploaded copyright file and a bot branch is mine: the data model, every module, authentication and access control, the storage layer, the tests and CI, the remediation of two code audits, and the deployment and staging runbooks.",
          "I work as IT Systems & Operations Lead around RPOMS, so I also work directly with the side it supports: the production line, the stock it consumes, and the people running it day to day. RPOMS models a physical process closely enough to run it, which only works if the person building it understands the process and not just the schema behind it.",
        ],
      },
      {
        heading: "How the work flows",
        body: [
          "Two things are tracked in parallel. The Daily Production Report records how many routers each person accepted, cleaned and packaged that day, and stock is deducted from those figures. Separately, the Registry, Pack and Delivery screens follow individual routers by serial number into boxes and onto deliveries.",
          "Cleaning is recorded only as a daily count per person. There is no per-serial cleaning state, and the system does not pretend there is. Alongside the main line, the Ecommerce team requests stock, an admin approves it, stages the exact routers, and transfers them, and only that transfer deducts anything.",
        ],
        figures: [
          {
            src: "/images/rpoms/diagram-workflow.png",
            alt: "Workflow diagram. Per-serial path: router arrives, accept scan, pack into a box, warehouse, delivery, paperwork. Below it the Daily Production Report feeding the dashboard and workforce reports, and an Ecommerce side flow: request, decision, stage routers, transfer, void or edit.",
            width: 2100,
            height: 1290,
            caption: "The operational workflow as implemented. Only stages that exist in the code are drawn.",
            wide: true,
          },
        ],
      },
      {
        heading: "Daily Production Report",
        body: [
          "The day's figures are entered once. Saving updates the dashboard and deducts stock in the same step: routers by accepted plus retired, chargers and cables by packaging. Batch and target carry over from the previous report, and Completed is the batch so far plus today's packaging, so progress is continuous rather than restarting each day.",
          "For a plain admin, the server does not trust the totals it is sent. It recomputes Accepted, Cleaned, Packaged and Completed from the workforce rows, freezes batch and target, and only lets an existing output grow. Two admins saving the same day no longer overwrite each other: each save carries the row's revision, and a stale one is refused with a message to reload.",
        ],
        figures: [
          {
            src: "/images/rpoms/daily-production-report.png",
            alt: "The Daily Production Report form: date, batch number BATCH-07, target 2,400, and Completed marked Auto at 2,206 with the note 2,012 earlier in this batch plus 194 packaged today.",
            width: 1440,
            height: 900,
            caption: "The report form. Completed is worked out from the batch so far plus today's packaging.",
            wide: true,
          },
          {
            src: "/images/rpoms/daily-report-workforce-rows.png",
            alt: "Workforce rows on the daily report: task, person, output, a plus button to add to the output, an optional target and notes, for accepting, cleaning and packaging staff.",
            width: 1440,
            height: 900,
            caption: "Workforce rows. The day's totals are summed from these; a plain admin can add to an output but not rewrite it.",
            wide: true,
          },
        ],
      },
      {
        heading: "Serial Registry and Packing",
        body: [
          "Every router is recorded by serial number, model, who accepted it and when. The model is detected from rules stored as data (a prefix and an optional length, longest prefix first), so a new model needs a rule rather than a release. A serial no rule recognises is kept, flagged and shown at the top of the list.",
          "Packing scans serials into a numbered box. A serial that is unknown, not accepted or already in another box is flagged, and the box will not close around it unless the close is forced deliberately. A box closed short of its capacity says so on the list, and each box prints a label with a QR code of its number.",
        ],
        figures: [
          {
            src: "/images/rpoms/serial-registry.png",
            alt: "The Router Registry list of accepted routers with serial, model, person, date and box columns. Two rows with unrecognised serials are highlighted and marked Invalid, with a badge reading 2 need attention.",
            width: 1440,
            height: 900,
            caption: "The Serial Registry. The two serials no rule recognises are flagged rather than dropped.",
            wide: true,
          },
          {
            src: "/images/rpoms/packing-scan-into-box.png",
            alt: "Packing a box: three scanned routers marked as Kaon AR2140 and two marked Not accepted, with a warning to remove the flagged rows or tick Close with issues.",
            width: 1440,
            height: 900,
            caption: "Packing. Two of five scans are flagged, and the box will not close until they are dealt with.",
            wide: true,
          },
          {
            src: "/images/rpoms/packed-boxes.png",
            alt: "The packed boxes list: box numbers with model, packed date, units, warehouse ERTH and a print button. The top box shows 7/10 incomplete.",
            width: 1440,
            height: 900,
            caption: "Packed boxes. A box closed short reports itself; each one carries its warehouse and a printable label.",
            wide: true,
          },
        ],
      },
      {
        heading: "Delivery and paperwork",
        body: [
          "A delivery is built by scanning box numbers. The serials inside come from the registry and are never typed. The delivery cannot be saved until the scanned load matches the quantity it was raised for; the server enforces the same rule, and only a Super Admin can accept a short load. Saving writes the delivery, its boxes and each router's delivered state in one transaction.",
          "The Delivery Order is generated from the office's own Word document with the details filled in, not redrawn. Word splits a line of text across several runs, so a placeholder can be broken in one place and intact in another; the generator does two passes for exactly that reason. The tracker exports to Excel in the column layout the customer's sheet expects.",
        ],
        figures: [
          {
            src: "/images/rpoms/delivery-scan-boxes.png",
            alt: "Building a delivery to a demo customer: the customer and ship-to blocks filled from stored details, two scanned boxes of 10 Kaon AR2140 routers, a status of 20 of 250 routers, 230 short, and the Save delivery button disabled.",
            width: 1440,
            height: 900,
            caption: "Building a delivery. Save stays disabled until the load matches the quantity; here it is 230 short.",
            wide: true,
          },
          {
            src: "/images/rpoms/delivery-history.png",
            alt: "Delivery history with four demo deliveries; the oldest is expanded to show its boxes and the serial numbers inside each, with DO and Tracker download buttons.",
            width: 1440,
            height: 900,
            caption: "Delivery history. Each delivery opens to its boxes and serials, with the Delivery Order and tracker one click away.",
            wide: true,
          },
        ],
      },
      {
        heading: "Inventory and workforce",
        body: [
          "Stock is never stored as a balance. Remaining is always what was booked in minus what was consumed, worked out when it is read, per item and per model, so editing or deleting a report cannot leave a stale figure behind. Every movement, including those written by an Ecommerce transfer, appears in one ledger.",
          "Workforce output is measured against per-person targets that can be set by department, by day, or for one person on one day. Names are matched case-insensitively, and the spelling shown is the one a worker is recorded under most often.",
        ],
        figures: [
          {
            src: "/images/rpoms/inventory-ledger.png",
            alt: "The Inventory page: cards for routers, chargers, LAN cables, small boxes and big packaging boxes, each with remaining, added and consumed, above a manual adjustment form and an adjustment history including two rows written by an Ecommerce transfer.",
            width: 1440,
            height: 900,
            caption: "Inventory. Remaining is added minus consumed; the ledger includes the rows an Ecommerce transfer wrote.",
            wide: true,
          },
          {
            src: "/images/rpoms/workforce-performance.png",
            alt: "The Workforce page: department cards with output against target, a top performer card, an employee ranking by total output, and recent report activity.",
            width: 1440,
            height: 900,
            caption: "Workforce. Assignment against per-person targets, and a ranking built from every saved report.",
            wide: true,
          },
        ],
      },
      {
        heading: "Ecommerce stock requests",
        body: [
          "The Ecommerce team asks for routers or sealed boxes through a portal that shows them their own requests and nothing else: no stock levels, no admin screens. Each request gets a number of the form ECR/YYMM/R/CODE/NN from a per-month counter, and a network retry returns the request the first attempt created instead of raising a second one.",
          "An admin approves or rejects it, stages the exact routers by serial or by box (each one checked against the registry), and transfers them from loose stock or a storeroom. The client never sends a charger or box quantity; the server derives them. The same deduction plan drives both the preview and the commit, and a void reverses a transfer.",
        ],
        figures: [
          {
            src: "/images/rpoms/ecommerce-request-portal.png",
            alt: "The Ecommerce portal: a Router Stock Request header with a three-step request, review, transfer strip, summary cards, a new request form, and a request history table with pending, approved, rejected and transferred demo requests.",
            width: 1440,
            height: 900,
            caption: "The Ecommerce portal, a separate build of the same code limited to this one job.",
            wide: true,
          },
          {
            src: "/images/rpoms/ecommerce-transferred-request.png",
            alt: "An admin view of a transferred request: 20 routers requested, approved and transferred with 0 outstanding, 20 chargers and 20 small boxes derived, and a processing timeline of raised, approved and transferred.",
            width: 1440,
            height: 900,
            caption: "A transferred request: the routers, the chargers and boxes the server derived from them, and who did what, when.",
            wide: true,
          },
        ],
      },
      {
        heading: "Dashboard and reporting",
        body: [
          "The dashboard answers how today went: the four figures against yesterday, batch progress, today's workforce against target, a trend, and a comparison against yesterday, a seven-day average, last week, this month or a custom range, because a comparison supports a decision and a raw count does not. It refreshes itself, and switches to Arabic with the whole layout mirrored right to left.",
          "Report history is searchable by date and batch and exports to PDF.",
        ],
        figures: [
          {
            src: "/images/rpoms/dashboard-trend-comparison.png",
            alt: "Production trend chart over seven days for accepted, retired, cleaned and packaged, above a comparison table of today against yesterday with differences.",
            width: 834,
            height: 753,
            caption: "Trend and comparison, cropped from the dashboard.",
          },
          {
            src: "/images/rpoms/dashboard-arabic-rtl.png",
            alt: "The dashboard in Arabic with the layout mirrored right to left: KPI cards, workforce assignment, today's notes and batch progress.",
            width: 1440,
            height: 900,
            caption: "The same dashboard in Arabic. The layout mirrors; names and figures stay as entered.",
            wide: true,
          },
        ],
      },
      {
        heading: "Architecture",
        body: [
          "One Next.js application with no separate backend service. Pages are server components that read the store directly; writes go through route handlers that check the role and validate every body with Zod. A single middleware sits in front of every request: it refuses a preview or laptop pointed at the production database, applies the production write lock, scopes the Ecommerce build, and sets security headers. Authentication is deliberately decided in each page and route, not there.",
          "One storage interface, three backends, selected by which environment variables are present: PostgreSQL on Supabase in production, MySQL for an earlier cPanel path (report store only), and atomic JSON files for local work. Postgres tables are created on demand behind per-store schema stamps, and only one cold-starting instance wins the build, which matters when several deployments share a database. Every read runs under a deadline, and where a fallback would be dishonest the caller gets a distinct 'could not read' value instead of an empty result.",
        ],
        figures: [
          {
            src: "/images/rpoms/diagram-architecture.png",
            alt: "Architecture diagram: four roles, then the middleware chokepoint, then pages and 41 API route handlers, then domain logic modules, then one storage interface over PostgreSQL, MySQL and a local file store, with Vercel, CI and a planned staging database at the bottom.",
            width: 2100,
            height: 1470,
            caption: "System architecture. Green is in the code today; dashed amber is planned; dotted blue is external.",
            wide: true,
          },
          {
            src: "/images/rpoms/diagram-data-flow.png",
            alt: "Data flow diagram: daily report saves, the inventory ledger and Ecommerce transfers feed the consumption rules, which produce remaining stock read by the dashboard and inventory; below, the serial chain from registry to box to delivery to delivery order.",
            width: 2100,
            height: 1230,
            caption: "How a saved day becomes stock, and how a scan becomes a delivery.",
            wide: true,
          },
        ],
      },
      {
        heading: "Technical Decisions",
        body: [
          "Four roles (viewer, Ecommerce, admin, super admin), each with its own credentials. A role whose password is not configured is switched off entirely. Sessions are an HMAC-SHA256-signed cookie carrying the role, when it was issued and a session id, compared with a timing-safe function, httpOnly, sameSite and secure in production. A viewer's session lapses after twenty-four hours; staff sessions last seven days. Sign-in attempts are throttled per address.",
          "Big packaging boxes are not calculated with a ceiling function. One box per ten packaged units, plus one more once the remainder reaches seven, because a box near enough to full has already been opened and sent, while a smaller remainder will be finished by the next day's work and would otherwise be counted twice.",
          "The business day is resolved in Asia/Kuala_Lumpur rather than from the server clock. A deployed server keeps UTC, which would not turn the day over until eight in the morning locally, long enough for early packing to file itself under the previous day.",
          "Translations are typed against English as the source, so a string added in English fails the build until every other dictionary supplies it.",
        ],
      },
      {
        heading: "Engineering challenges",
        body: [
          "Most of these came out of two read-only audits of the codebase, the first of which recorded 44 findings, six of them rated P0.",
          "Silent overwrites: two admins saving the same day meant the second replaced the first with no trace. Each save now carries the row's revision, and a stale save is refused with a 409.",
          "A client-sent 'this came from a CSV' flag relaxed the add-only rules. The server now re-parses the attached worksheet and decides for itself which sections it supplied, and refuses a worksheet dated for a different day.",
          "Every preview deployment was configured with the production database. A guard now makes a preview refuse the production database with a 503, work flows through a staging branch, and a one-way refresh script copies production to staging with names anonymised.",
          "Deployments sharing one database raced to build schema on cold start, holding an exclusive lock. The build is now claimed with a single statement and a sentinel, and new columns sit behind their own marker keys so two versions of the code cannot keep undoing each other.",
          "Box stock started mid-operation, with thousands of routers already packed. Counting them would have produced a deficit no correct booking-in could explain, so box stock starts from an opening figure on a fixed date and only later packing is counted.",
        ],
      },
      {
        heading: "Testing and verification",
        body: [
          "895 automated tests in 60 files, written with Vitest. Sixteen of those files run real SQL against PGlite, PostgreSQL compiled to WebAssembly and served in-process, so transactions, locking, concurrency and schema setup are tested with the production driver and no database server. CI runs typecheck, lint, the tests, a production build and a dependency audit on every push.",
          "For this write-up the production build was run locally on synthetic data, every screen was exercised, and a Delivery Order and the Excel exports were generated. Typecheck and lint passed. The full test run passed 59 of 60 files; the remaining file hit a ten-second hook timeout under machine load and passed when run on its own.",
        ],
        note: "There is no browser end-to-end suite yet; a Playwright smoke test per role is on the backlog.",
      },
      {
        heading: "Deployment and environments",
        body: [
          "The project deploys to Vercel from Git: pushing the main branch deploys production, and every other branch builds a preview. Production data lives in Supabase PostgreSQL. Work now flows from feature branches into a staging branch and then to main, and a data-preservation check compares every table's row count before and after a release.",
          "A separate staging database is designed and its bootstrap SQL written, but it is blocked on hosting limits, so previews are protected by refusing the production database rather than by having their own. The current plan has no managed backups; a read-only JSON export is the backup path until that changes.",
        ],
        figures: [
          {
            src: "/images/rpoms/diagram-deployment.png",
            alt: "Environments diagram: feature branches to staging to main, with an Ecommerce build from its own branch; a production database in use and a planned staging database; and the guards in code: environment guard, demo write lock and a data-preservation gate.",
            width: 2100,
            height: 960,
            caption: "Environments and release path. The staging database is planned, not live.",
            wide: true,
          },
        ],
      },
      {
        heading: "Current result",
        body: [
          "In production, the dashboard and the Daily Production Report are live: the day's figures are entered for real, stock is deducted for real, and the dashboard reads back what was saved. The Ecommerce portal runs as its own build of the same code.",
          "The registry, packing, delivery and paperwork, workforce and inventory modules are complete and render live data, but they sit behind a deployment-level write lock while the programme works through sign-off. The lock is enforced at one middleware chokepoint, is on by default in production, and names the modules allowed to write, so a module goes live by being named rather than by accident.",
          "The newest work (the remediation of both audits, the audit log, the environment guard, the login throttle, the test suite and CI) is built and tested on the staging branch and has not yet been released: production deploys from main, which is 68 commits behind.",
        ],
        figures: [
          {
            src: "/images/rpoms/diagram-ecosystem.png",
            alt: "Ecosystem diagram: staff, the Ecommerce team and stakeholders use RPOMS, which produces Delivery Orders, tracker exports, report PDFs and box labels; below, two separate projects, RPOMS Print Engine with integration planned and RPOMS AI which is not connected.",
            width: 2100,
            height: 1080,
            caption: "RPOMS, what it produces, and the two related projects kept separate from it.",
            wide: true,
          },
        ],
      },
    ],
    status: [
      {
        label: "Dashboard (English / Arabic)",
        state: "implemented",
        detail: "Live in production. Reading is never blocked, so every figure and chart renders from real data.",
      },
      {
        label: "Daily Production Report",
        state: "implemented",
        detail: "Live in production. Writes report data and deducts stock in the same step.",
      },
      {
        label: "Ecommerce request portal",
        state: "implemented",
        detail:
          "Runs as a separate build of the same code from its own branch. The newest Ecommerce features (registering unknown routers on transfer, stored model codes) are on staging and not yet in that build.",
      },
      {
        label: "Serial registry, packing, delivery and paperwork, workforce, inventory",
        state: "available",
        detail:
          "Complete and rendering live data, held behind a deployment-level write lock pending programme sign-off.",
      },
      {
        label: "Audit remediation, audit log, environment guard, login throttle",
        state: "available",
        detail:
          "Built and tested on the staging branch. Production deploys from main, which does not include them yet.",
      },
      {
        label: "Separate staging database and managed backups",
        state: "not-connected",
        detail:
          "Designed and scripted, blocked on hosting limits. Previews refuse the production database instead; backups are a manual read-only export.",
      },
      {
        label: "RPOMS Print Engine integration",
        state: "not-connected",
        detail: "The print engine is a separate, standalone project. Box labels in RPOMS print through the browser for now.",
      },
    ],
    limitations: [
      "Accounts are shared per role, so the audit trail records a role and a session, not a named person.",
      "The login throttle is per server instance, and sessions cannot be revoked individually; both need shared tables that are designed but not written.",
      "Some programme-wide baselines are still constants in code rather than settings.",
      "Employees and workforce rows are matched by name rather than linked by ID.",
      "Only the dashboard is translated; the admin panel is English-only.",
      "The content security policy still allows inline scripts, and the daily report form is one very large component.",
      "Navigation still differs by role, which reveals that a higher role exists. Blocked actions themselves never name it.",
    ],
    roadmap: [
      "Release the staging line to production after the data-preservation check, starting with the session check on four read endpoints.",
      "Back up the production database and prove a restore; move to a plan with managed backups.",
      "Give previews and staging their own database.",
      "Shared login throttle and server-side session revocation, then per-user accounts.",
      "Foreign key from routers to boxes and a join table for Delivery Orders.",
      "A Playwright smoke test for each role.",
      "Integrate the RPOMS Print Engine once it is validated on the line.",
    ],
    facts: [
      { value: "895", label: "automated tests" },
      { value: "41", label: "API route files" },
      { value: "4", label: "access roles" },
      { value: "3", label: "storage backends" },
    ],
    confidentialNotice:
      "RPOMS is proprietary software built for a live operation. The screenshots on this page were captured from the real application running locally on synthetic demo data: every name, serial, customer and figure in them is fictional, and the dashboard's programme-wide totals are left out. No production data, customer details or credentials appear.",
    shareImage: {
      src: "/images/rpoms/og-rpoms.png",
      width: 1200,
      height: 630,
      alt: "The RPOMS dashboard on synthetic demo data",
    },
    links: [
      {
        label: "GitHub profile (RPOMS repository is private)",
        href: "https://github.com/tirukon015",
        external: true,
      },
    ],
    image: {
      src: "/images/rpoms-mark.png",
      srcDark: "/images/rpoms-mark-dark.png",
      alt: "RPOMS wordmark",
      variant: "mark",
    },
  },

  {
    slug: "rpoms-print-engine",
    name: "RPOMS Print Engine",
    fullName: "Offline-first label printing workstation for the RPOMS refurbishment line",
    tagline: "Scan a router, and the right label prints: a browser app that drives a Bluetooth thermal printer with no server in the loop.",
    summary:
      "A TypeScript and React Progressive Web App that turns any PC with Chrome and Bluetooth into a label station for a NIIMBOT B1 Pro. A USB scanner reads a router serial, a prefix-and-length rule names the model, a fixed 50 by 30 mm template is rendered to the printer's raster and printed over one persistent Web Bluetooth session. The print path never touches the network, the app boots offline from cache and IndexedDB, and an optional backend adds Google sign-in, device provisioning and sync. 170 automated tests; one verified print session on the real printer.",
    category: "Systems / ERP / WMS",
    categorySlug: "systems",
    categories: ["Systems / ERP / WMS", "Web Apps / Software"],
    hrOverview: {
      valueProposition: "Offline-first browser workstation that drives a thermal Bluetooth printer with zero server latency on the production line.",
      role: "Sole Developer",
      roleScope: "Hardware Protocol Driver, Canvas 2D Renderer, Offline PWA & Backend",
      context: "Blue Bee Technologies × ERTH × Maxis programme (Hardware workstation)",
      highlights: [
        "Eliminated manual phone apps and spreadsheets with a single-scan-to-print browser workstation",
        "Deterministic model identification from barcode serial prefix and length without network calls",
        "Offline-by-construction PWA architecture booting and printing from service worker and IndexedDB",
        "Continuous Web Bluetooth session management eliminating paper rewind and feed jitter between labels",
        "Canvas-first template editor with automated raster hash freezing to guarantee physical label alignment",
        "Rigorous verification: 170 automated tests with a simulated printer and headless Chrome validation",
      ],
      technologies: ["TypeScript", "React 19", "Web Bluetooth", "Canvas 2D", "IndexedDB", "Vite 8", "Workbox", "Vitest"],
    },
    role: "Sole Developer",
    roleScope: "Hardware Protocol Driver, Canvas 2D Renderer, Offline PWA & Backend",
    period: "2026 (software complete; hardware validation in progress)",
    affiliation: "Blue Bee Technologies Sdn. Bhd., ERTH × Maxis programme",
    confidential: false,
    kind: "professional",
    tier: "featured",
    tech: [
      "TypeScript",
      "React 19",
      "Vite 8",
      "Web Bluetooth",
      "Canvas 2D",
      "IndexedDB",
      "Service worker (Workbox)",
      "Node.js 24",
      "PostgreSQL",
      "Google OpenID Connect",
      "Vitest",
    ],
    techGroups: [
      {
        label: "Workstation app",
        items: ["TypeScript", "React 19", "Vite 8", "Tailwind CSS v4", "Lucide icons"],
      },
      {
        label: "Print engine (framework-free core)",
        items: ["Web Bluetooth", "NIIMBOT B1 Pro protocol", "Canvas 2D rendering", "Code 128 encoder", "qrcode", "Print queue", "Structured tracing"],
      },
      {
        label: "Offline & storage",
        items: ["IndexedDB", "Service worker (vite-plugin-pwa / Workbox)", "Web app manifest"],
      },
      {
        label: "Backend (optional)",
        items: ["Node.js 24 http", "PostgreSQL (pg)", "Google OIDC with PKCE", "HMAC-signed sessions", "Device tokens"],
      },
      {
        label: "Verification",
        items: ["Vitest", "fake-indexeddb", "Simulated printer", "Headless Chrome (DevTools protocol)", "GitHub Actions"],
      },
    ],
    highlights: [
      "One scan prints one label: Enter completes the scan, there is no second click, no preview in Fast mode and no lookup of the serial anywhere",
      "Model detection is prefix plus length with the longest prefix winning; an unknown serial says so and nothing prints",
      "One Bluetooth session for the whole shift: queued labels go out as one continuous printer job and each is marked complete as the printer's page counter passes it",
      "A job the printer accepted but did not confirm is marked Uncertain and left to a person; nothing is ever reprinted automatically",
      "The four shipped label templates are frozen by a test that hashes their JSON and rendered raster; a design change fails the build",
      "A guard test fails if anything in scan → print makes a network request",
      "Boots and renders from cache with the network unplugged, proven by an automated headless-Chrome test that cuts the connection and reloads",
      "Google is the identity provider, RPOMS the authority: users start pending, administrators activate them, workstations are provisioned with revocable hashed device tokens",
    ],
    workflow: [
      "Scan the router",
      "Detect the model from the serial",
      "Resolve and render the frozen template",
      "Queue behind whatever is printing",
      "Print over the open Bluetooth session",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "On the refurbishment line that RPOMS runs, every processed router gets a sticker with its model name and its serial number as a barcode, and every packed box gets one with its number as a QR code. The printer is a NIIMBOT B1 Pro, a small Bluetooth thermal printer for 50 by 30 mm labels. The Print Engine is the workstation that produces those labels: a Progressive Web App that runs in Chrome or Edge, talks to the printer over Web Bluetooth, and keeps working when the internet does not.",
          "It is built standalone, with an explicit boundary for RPOMS to supply data later, so the printer protocol, the label rendering and the queue could be tested and validated without touching a system in daily use.",
        ],
        figures: [
          {
            src: "/images/rpoms-print-engine/router-fast-print.png",
            alt: "The Router page of the RPOMS Print Engine: a large scan field, a status card reading NIIMBOT B1 Pro Not connected with a Connect button, and an empty print queue beside it.",
            width: 1440,
            height: 900,
            caption: "The worker's whole screen: a scan field, the printer state, the queue. Nothing technical.",
          },
        ],
      },
      {
        heading: "Problem",
        body: [
          "The vendor's route to this printer is its own phone app, fed in practice by a spreadsheet that worked out the model from the serial. That is one interaction per label, on a phone, with the model logic living in a formula. It does not follow a worker who scans one router after another, and it puts the correctness of every label on transcription.",
          "The requirement was blunt: scan a serial with the USB scanner, and the correct label comes out. Continuously, on an ordinary PC, without a vendor app, a spreadsheet or a server between the scan and the printer.",
        ],
      },
      {
        heading: "Constraints that shaped it",
        body: [
          "Web Bluetooth is the only way to reach a Bluetooth printer from a browser without an installer, and it comes with limits: Chromium browsers on desktop only, HTTPS or localhost, and a native device chooser that the page cannot style or open on its own. The app is designed around those limits rather than against them: the chooser is Chrome's, and everything before and after it is the app's.",
          "The label design was locked from the start. The owner had a template that matched the labels already in use, and the brief for every later change was that the physical output must not move. That constraint became a test: the JSON and the rendered raster of each shipped template are hashed against a baseline, and any difference fails the suite.",
          "Printing had to be independent of everything else. The line cannot stop because a server is down or the internet is out, so the critical path from scan to printer is local by construction, and a test proves it makes no network request.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "A scanner service bound to one input field completes a scan on Enter, Tab, whitespace, an inserted line break or a short pause after machine-speed characters, so scanners with different suffix settings all work and a person typing is never auto-submitted. The workflow detects the model, resolves the template and renders it in a promise chain, so scans made while a label is printing are processed in order rather than lost.",
          "Detection is a rule table: a serial prefix and an exact length name a model, and the longest matching prefix wins. There is no lookup of the serial in a database, deliberately; the line prints for any router that matches a rule, and an unknown serial produces the message “No matching detection rule.” and nothing else.",
          "The queue keeps one printer session open. Labels waiting while the printer is busy are sent as one continuous printer job with two pages of look-ahead, which is what stops the paper feeding out and pulling back between labels. The driver polls the printer's page counter and reports it; the queue marks each label complete as the counter passes it. If a link drops after the printer accepted a job, the labels the counter did not reach are marked Uncertain and wait for a person to choose Reprint or Discard.",
        ],
        figures: [
          {
            src: "/images/rpoms-print-engine/detection-rules.png",
            alt: "The Detection rules page: a form to add a rule with prefix, length and model name, a test field showing a serial matched to Kaon AR2140 with its prefix and length, and a table of the current rules.",
            width: 1440,
            height: 900,
            caption: "Detection rules: prefix plus length, longest prefix wins. The test field shows what a scan would resolve to, without printing.",
          },
        ],
      },
      {
        heading: "Template editor",
        body: [
          "Administrators edit templates in a canvas-first editor: the label fills the screen, a floating icon toolbar adds text, images, barcodes, QR codes, lines and rectangles, and layers and properties live in drawers that stay closed until asked for. A contextual toolbar above the selected element shows only that element's controls. Fields appear as human-readable chips, Serial number and Model, with the template's own syntax kept under Advanced.",
          "The editor changes the administrator's draft only. The shipped templates cannot change unnoticed, because the freeze test compares their rendered raster with the accepted baseline on every run.",
        ],
        figures: [
          {
            src: "/images/rpoms-print-engine/templates-editor-canvas.png",
            alt: "The template editor with the router label filling the canvas: Maxis logo, divider, model text, Code 128 barcode and serial text. A floating toolbar sits above the label and a zoom control below it.",
            width: 1440,
            height: 900,
            caption: "The editor with nothing selected: the label is the product, the tools float.",
          },
          {
            src: "/images/rpoms-print-engine/ui-drawers-open.png",
            alt: "The template editor with the model text selected: a contextual toolbar with font, size, bold and alignment controls, the layers drawer open on the left, and the properties drawer open on the right showing the Model field as a chip.",
            width: 1440,
            height: 813,
            caption: "Selecting the model text: a contextual toolbar, the layers drawer and the inspector with field chips rather than template syntax.",
          },
        ],
      },
      {
        heading: "Offline by construction",
        body: [
          "The first online visit installs a service worker that caches the whole build, including the fonts and the logo the templates need. Templates, detection rules, settings, print history and pending changes live in the workstation's IndexedDB. After that, the employee opens the app and works; with the network unplugged, the app boots from cache, detects, renders and prints from local data.",
          "An automated test proves it: headless Chrome loads the built app online, waits for the worker, cuts the network at the protocol level, reloads, and checks that the Router page boots, the template renders from cache and the diagnostics panel reports Offline Ready.",
        ],
        figures: [
          {
            src: "/images/rpoms-print-engine/system-offline-ready.png",
            alt: "The administrator's System panel showing Offline Ready: YES, with rows for cached assets, service worker, local database, detection rules, templates, Bluetooth, pending sync and last sync, and an Offline indicator in the header.",
            width: 1440,
            height: 900,
            caption: "The administrator's readiness check, captured with the network cut: everything the print path needs is local.",
          },
        ],
      },
      {
        heading: "Identity, provisioning and sync",
        body: [
          "For a fleet of stations, an optional backend on the company's own Ubuntu server provides Google sign-in, RPOMS authorisation, device provisioning and synchronisation. Google is the identity provider; RPOMS decides who may print. A new user starts pending unless allow-listed, an administrator activates them, and the first active login silently provisions the workstation with a device identity and a revocable, hashed token. The local session then keeps the station usable offline for thirty days after its last online check.",
          "Sync is local-first and runs on its own timer, never on the print path: local writes happen first, the engine pushes print history and edits, then pulls configuration when the server has a newer version. The conflict policy is written down: templates last-writer-wins by timestamp with the losing local edit kept beside the winner, rules server-wins with a local backup, settings never synced. Without a backend URL the app runs standalone, which is how the hardware work is done.",
        ],
        note:
          "The backend is implemented and tested against a fake identity provider and an in-memory store. It has not yet been run against real Google credentials or a live PostgreSQL, and no production deployment exists; the deployment path is documented, not verified.",
      },
      {
        heading: "Things that went wrong, and what they taught",
        body: [
          "The printer fed the paper out and pulled it back between labels. The cause was one printer job per label; the fix was multi-page jobs with look-ahead, and continuous printing became the default. Matching the device's own session model mattered more than any timing tweak.",
          "A scanner did not send Enter, so six serials arrived as one value and were rejected. A scanner-test panel that records raw key events showed what the device actually sent, and the scan service now ends a scan on any of the suffixes scanners use.",
          "The offline build cached nothing, silently. The worker was active, the cache was empty, and the reload showed Chrome's error page. Attaching to the service worker over the DevTools protocol exposed a Workbox error about a duplicate precache entry for the logo, listed once by a glob and once explicitly. Verify what the worker cached, not whether it registered.",
          "A performance gate flagged regressions on metrics of a few milliseconds for identical code. Single runs of that size are timer jitter; the gate now compares medians of three runs and ignores anything under a ten-millisecond floor.",
        ],
      },
      {
        heading: "Testing and verification",
        body: [
          "170 automated tests run without a printer: a simulated B1 Pro speaks the documented protocol, so framing, identification, the print sequence, error codes, disconnect recovery, the queue, both workflows, storage, offline readiness, auth, sync and the backend are all exercised in Node. The template freeze test and the no-network guard run with them, and a GitHub Actions workflow fails if the freeze baseline changes.",
          "Two headless-Chrome scripts check what unit tests cannot: the offline boot, and the editor's behaviour at desktop, tablet and phone widths. A benchmark tool runs the pipeline at the pre-build baseline and at the current tree and fails on regressions.",
          "On the real printer, the B1 Pro connected, identified itself as model 4097 with a 576-dot head, and printed a router label with every acknowledgement in a session on 24 September 2026. The multi-label, scanner and offline runs on hardware are the next validation step, and the app records the timings for them itself.",
        ],
        figures: [
          {
            src: "/images/rpoms-print-engine/ui-desktop-collapsed.png",
            alt: "The template editor with the template list collapsed to a narrow icon rail on the left, giving the label canvas the full width.",
            width: 1440,
            height: 900,
            caption: "One of the states the headless UI check verifies: the template list collapsed to an icon-only rail, with the canvas reclaiming the width.",
          },
        ],
      },
    ],
    status: [
      {
        label: "Scan-to-print, detection, queue, templates, editor",
        state: "implemented",
        detail:
          "Complete and covered by the automated suite. Verified on the real printer once: connection, identification and one router label with every acknowledgement.",
      },
      {
        label: "Continuous printing on the physical printer",
        state: "available",
        detail:
          "Implemented and tested against the simulated printer. The 10, 25, 50 and 100-label runs and the scanner-order runs on the B1 Pro are the next validation step; the Hardware test page records their timings.",
      },
      {
        label: "Offline boot and printing",
        state: "available",
        detail:
          "Boot from cache and IndexedDB is proven by the automated headless test. The same run with the printer connected has not been recorded yet.",
      },
      {
        label: "Google sign-in, provisioning and sync",
        state: "available",
        detail:
          "Implemented and tested in software with a fake identity provider and an in-memory store. Not yet validated against real Google credentials or a live PostgreSQL.",
      },
      {
        label: "Production deployment on the ERTH server",
        state: "not-connected",
        detail:
          "The nginx, systemd and PostgreSQL deployment is documented; nothing is deployed. The workstation runs standalone today.",
      },
      {
        label: "Integration into RPOMS",
        state: "not-connected",
        detail:
          "The data-provider interfaces exist; RPOMS does not yet supply router or box data to the engine.",
      },
    ],
    limitations: [
      "Web Bluetooth means Chrome or Edge on desktop or Android; no Firefox and no iPhone.",
      "The print engine has printed one real label so far; throughput on the physical printer is measured by the app but not yet recorded for a full run.",
      "A device token in the workstation's IndexedDB can be read by anyone with local access to that PC; the mitigation is OS login and server-side revocation.",
      "The admin pages are not role-gated in the app itself; only published changes are gated on the server.",
      "Rate limiting on the sign-in routes and an administrator audit log are documented as open items.",
      "The repository is private. Access can be granted on request.",
    ],
    image: {
      src: "/images/rpoms-print-engine-mark.png",
      srcDark: "/images/rpoms-print-engine-mark-dark.png",
      alt: "RPOMS Print Engine wordmark",
      variant: "mark",
    },
    links: [
      {
        label: "GitHub profile (Print Engine repository is private)",
        href: "https://github.com/tirukon015",
        external: true,
      },
      {
        label: "Read the article",
        href: "/blog/printing-labels-from-the-browser-over-web-bluetooth",
      },
    ],
  },
  {
    slug: "erth",
    name: "ERTH",
    fullName: "ERTH: production homepage, technical SEO and GEO implementation",
    tagline: "A design-tool prototype rebuilt as a production website that ships 3.7 kB of JavaScript.",
    summary:
      "The production website for ERTH, Malaysia's #1 e-waste collection service certified by Jabatan Alam Sekitar (JAS). As Website Designer and Developer collaborating with the engineering team, I designed the experience in Figma, built the high-performance production frontend (reducing JS from 250 kB to 3.7 kB and media assets by 75%), implemented comprehensive technical SEO and structured data, and am currently scaling the codebase with TypeScript.",
    category: "Websites",
    categorySlug: "websites",
    categories: ["Websites"],
    hrOverview: {
      valueProposition: "High-performance production website for Malaysia's #1 JAS-certified e-waste collector, designed in Figma, built with zero bloat, and scaling with TypeScript.",
      role: "Website Designer & Developer",
      roleScope: "Website Design (Figma), Production Frontend Build & TypeScript Migration (Team-based)",
      context: "ERTH — Malaysia's #1 E-Waste Collector & Jabatan Alam Sekitar (JAS) Certified",
      highlights: [
        "Website designer and frontend builder for Malaysia's #1 e-waste collector, certified by Jabatan Alam Sekitar (JAS)",
        "Prototyped the entire user interface and component vocabulary in Figma from client brand requirements",
        "Rebuilt the approved design into pure semantic HTML, CSS, and vanilla JS, eliminating 250 kB of prototype framework runtime",
        "Optimized media payload by more than 75%: reduced 12.0 MB image assets to 2.7 MB using WebP and responsive srcset variants",
        "Engineered comprehensive structured data: Organization/RecyclingCenter, FAQPage (16 Q&As), and WebSite Schema.org JSON-LD",
        "Collaborating within the engineering team to migrate and scale the web properties using modern TypeScript",
      ],
      technologies: ["TypeScript", "HTML5", "CSS3", "JavaScript", "Vite 7", "Figma", "Schema.org JSON-LD", "WebP", "axe-core"],
    },
    role: "Website Designer & Developer",
    roleScope: "Website Design (Figma), Production Frontend Build & TypeScript Migration (Team-based)",
    period: "2026 (completed, ongoing TypeScript migration)",
    affiliation: "ERTH (Malaysia's #1 E-Waste Collector, Jabatan Alam Sekitar Certified)",
    confidential: false,
    kind: "professional",
    tier: "featured",
    tech: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Vite 7",
      "Figma",
      "Schema.org JSON-LD",
      "WebP / srcset",
      "Responsive CSS",
    ],
    techGroups: [
      {
        label: "Design & prototyping",
        items: ["Figma", "Interactive prototype", "Component vocabulary"],
      },
      {
        label: "Implementation",
        items: ["TypeScript", "HTML5", "CSS3", "Vanilla JavaScript", "Semantic HTML", "Responsive CSS", "Vite 7"],
      },
      {
        label: "Search & structured data",
        items: [
          "Schema.org JSON-LD",
          "Organization / RecyclingCenter",
          "FAQPage",
          "WebSite",
          "Open Graph",
          "Twitter cards",
          "Canonical URLs",
          "robots.txt / sitemap.xml",
        ],
      },
      {
        label: "Performance & accessibility",
        items: [
          "Self-hosted WOFF2 subsets",
          "WebP re-encoding",
          "srcset",
          "axe-core",
          "prefers-reduced-motion",
          "Focus management",
        ],
      },
      {
        label: "Quality & platform",
        items: ["ESLint 9", "sharp", "Post-build verification script", "Vercel"],
      },
    ],
    highlights: [
      "Prototype runtime removed: roughly 250 kB of CDN React and design-tool JavaScript replaced by 3.7 kB that only handles interaction",
      "Image payload cut from 12.0 MB to 2.7 MB by re-encoding to WebP and adding srcset variants",
      "A post-build script fails the build on a missing asset, a dead in-page link, an image without alt text, or a JSON-LD block that does not parse",
      "axe-core reports zero violations across the default, mobile, menu-open, dialog-open and disclosure-open states",
      "Head block went from no canonical, no social metadata and no structured data to all three, with three JSON-LD blocks",
      "Four real prototype defects found and fixed, including a wrapper element that closed early and rendered a heading black on near-black",
      "Zero third-party requests: every font and image is self-hosted",
    ],
    workflow: [
      "Prototype in Figma",
      "Audit the approved design",
      "Rebuild as static HTML/CSS/JS",
      "Verify the build",
      "Deploy",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "ERTH is Malaysia's #1 e-waste collection and recycling service, officially certified by Jabatan Alam Sekitar (JAS) Malaysia and operated in partnership with Blue Bee Technologies: doorstep pickup, free shipping through Pos Malaysia, a 24/7 drop-off point in Cyberjaya, and cashless rewards. The site is a comprehensive single-page digital gateway covering residential and corporate e-waste pickups, real-time device pricing, accepted electronics catalogs, enterprise recycling compliance, and JAS-certified environmental standards.",
          "As Website Designer and Developer working alongside our engineering team, I handled the project across its lifecycle: prototyping the complete interface and interaction design in Figma, engineering the approved design into a fast, zero-bloat production website (1,076 lines of markup, 534 lines of CSS and 228 lines of JavaScript bundled by Vite), and currently scaling the frontend architecture with TypeScript.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A recycling and trade-in service depends on people trusting it enough to hand over a device and the data on it. As Malaysia's #1 collector certified by Jabatan Alam Sekitar, the page has to make the process, the pricing, the eligibility rules and the handling of personal data legible before someone commits to anything.",
          "The approved design existed only as a self-extracting design-tool bundle: fonts, images and markup encoded as base64 inside script blocks, unpacked in the browser at runtime, with React and Babel pulled from a CDN and a runtime that re-rendered inline styles on every state change. It demonstrated the design. It was not a website anyone should ship.",
        ],
      },
      {
        heading: "Context",
        body: [
          "The client's decision was that one design file was final and every earlier revision was superseded. That made the brief unusually precise: not build something like this, but ship exactly this, correctly.",
          "A locked design is the interesting constraint. Meeting a long list of content, search and accessibility requirements is straightforward if you are allowed to add sections. Meeting them inside a design nobody may change is a different problem, and it is the one this build was.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "I served as the Website Designer and Developer for ERTH within our engineering team. ERTH is Malaysia's #1 e-waste collector certified by Jabatan Alam Sekitar (JAS), demanding high institutional trust, full accessibility compliance, and lightning-fast mobile responsiveness.",
          "In the first phase, I designed the interface and worked it out as an interactive Figma prototype before implementation, establishing the visual system, layout structure, and the user flow from selecting an electronic device through to collection booking and payout.",
          "In the second phase, I built the production website: extracting assets from the approved bundle, rebuilding the page into clean semantic code, eliminating 250 kB of framework runtime, and implementing full technical SEO and Schema.org structured data. Alongside our engineering team, I am now modernizing and scaling the codebase with TypeScript.",
        ],
        note:
          "Team project: I served as the website designer and frontend builder, and continue to develop features with TypeScript alongside our team for Malaysia's #1 JAS-certified e-waste recycler.",
      },
      {
        heading: "Engineering Approach",
        body: [
          "The stack decision was to remove rather than add. A single static page does not need React, Babel, a CDN dependency or a render pass before first paint. Dropping all of it took roughly 250 kB of JavaScript out of the page and left 3.7 kB that does nothing but handle interaction.",
          "The inline styles were deliberately kept. In the approved file the inline style attributes are the design specification: every dimension, colour and clamp() lives there. Rewriting a thousand of them into class names would have introduced visual drift for no functional gain, so the markup was preserved and only the parts a static file cannot express moved into CSS.",
          "Three things had to move. Hover attributes the prototype's runtime interpreted became real hover rules. Open and closed state the prototype expressed by rewriting inline display became hidden, aria-expanded and a class, with CSS deciding appearance. And the desktop and mobile split the prototype computed from window.innerWidth in JavaScript became a media query at the same breakpoint, so the correct layout is painted on the first frame instead of after hydration.",
        ],
      },
      {
        heading: "Fixing the prototype",
        body: [
          "Rebuilding a design file section by section surfaces defects that a demo hides. Four were real enough to fix.",
          "The page wrapper closed early, part-way down the document, so every section after it never inherited the light text colour. One heading rendered black on a near-black background. The colours now live on the body element.",
          "A dialog contained an iframe whose source was an unresolved template binding, so every page load fetched a URL that did not exist. No booking form was configured, so the iframe is gone and the contact-channel list the design already provided is the dialog body.",
          "Six links pointed at the section they were already inside. They now resolve to the action they describe. And two grid definitions forced horizontal scrolling below 400px, which a minmax floor and a released column span fixed.",
        ],
      },
      {
        heading: "Verifying the build",
        body: [
          "A hand-built static page has no type checker, so the guarantees had to be written. A post-build script runs as part of every build and fails it on a referenced asset missing from the output, an in-page link or aria-controls pointing at an id that does not exist, an absent required head tag, JSON-LD that does not parse, an image with no alt text or no intrinsic size, more or fewer than one h1, or any prototype artefact surviving into the output.",
          "That last check is the one that matters most on a project like this. A template binding or a generated class name that leaks into production is invisible in review and obvious to a visitor, and it is exactly the kind of thing a rebuild leaves behind.",
        ],
      },
      {
        heading: "Technical SEO",
        body: [
          "The head block was built out from nothing: the specified title and meta description, a canonical URL, robots directives, a full Open Graph set with the locale declared as Malaysian English, and a large-image Twitter card, plus robots.txt, sitemap.xml, a web manifest and a full favicon set.",
          "Three JSON-LD blocks ship. An Organization node also typed as a recycling centre, carrying the alternate name, legal name, logo, contact details, a full postal address for the Cyberjaya premises, the areas served and a verified social profile. An FAQPage node mirroring the sixteen questions visible on the page. And a WebSite node stating the site name and alternate name.",
          "Structure was treated as information architecture rather than decoration: one h1, section-level h2s, card-level h3s, descriptive alt text, and an internal-linking pass that found several sections were unreachable from the navigation despite being on the page. All page content is in the static HTML; nothing depends on JavaScript to be crawlable.",
        ],
      },
      {
        heading: "GEO / AI-search readability",
        body: [
          "Content an AI system can read and answer from directly is a different target from ranking a page. The approach was to test it rather than assert it: nine questions a visitor actually asks, each checked for whether the page answers it self-containedly.",
          "Where a section needed to survive being extracted on its own, it was written to do so. The block explaining the difference between disposal and recycling defines both terms, states the distinction and says why it matters, so an answer engine quoting only that block still produces something correct.",
          "Recognition claims were restructured to carry who recognised the achievement, when, and where it can be verified, because for an AI system an unattributed claim and an invented one look the same. The FAQ was expanded from the objections customers actually raise rather than from a keyword list, and the structured data mirrors exactly what a reader sees.",
        ],
      },
      {
        heading: "Content accuracy",
        body: [
          "A consistency pass across the page found six contradictions and unsupported claims. These were raised for a client decision rather than resolved unilaterally, because picking one reading of a business rule is not a developer's call to make.",
          "One was a headline figure that appeared to confuse two different units: a large number presented as currency where the cited source reported it as a weight. Catching that before publication mattered more than any markup change in the engagement.",
          "The working stance throughout was to verify, soften, or omit. No award, statistic, certification, testimonial or coverage claim was introduced that the source material did not support.",
        ],
      },
      {
        heading: "Performance and accessibility",
        body: [
          "Every font and image is self-hosted, so the page makes no third-party requests at all. Photographic and illustrative assets were re-encoded to WebP and the largest ones given srcset variants, taking the image payload from 12.0 MB to 2.7 MB. Every image carries intrinsic width and height so nothing shifts as they arrive, below-the-fold images are lazy, the hero backdrop is marked high priority, and the two Latin font subsets are preloaded.",
          "On accessibility: a skip link, main, nav, footer and aside landmarks, accessible names on sections carrying no heading, a visible focus ring on every interactive element, aria-expanded and aria-controls on all disclosures and dropdowns, Escape and focus trapping in both dialogs with focus restored to the opener, keyboard-operable navigation dropdowns, underlines on inline links that colour alone did not distinguish, and prefers-reduced-motion honoured. axe-core reports zero violations in the default, mobile, menu-open, dialog-open and disclosure-open states.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "The website development is complete. The production homepage is built, verified and deployed on Vercel, serving the approved design as static files with no third-party requests, a passing post-build check, and a head block carrying full metadata and three structured-data blocks where previously there were none.",
          "It is recognisably the same design the client approved. What changed is everything underneath it: a quarter of a megabyte of prototype JavaScript gone, an image payload cut by more than three quarters, four real defects fixed, and a build that refuses to ship if any of that regresses.",
        ],
      },
    ],
    status: [
      {
        label: "Production homepage build",
        state: "implemented",
        detail: "Complete and deployed. Static HTML, CSS and vanilla JavaScript bundled by Vite 7.",
      },
      {
        label: "Title, meta description, canonical, robots",
        state: "implemented",
        detail: "All present in the shipped page; none existed before.",
      },
      {
        label: "Open Graph and Twitter card",
        state: "implemented",
        detail: "Full Open Graph set with Malaysian English locale, and a large-image Twitter card.",
      },
      {
        label: "Structured data",
        state: "implemented",
        detail:
          "Three JSON-LD blocks: Organization / RecyclingCenter, a sixteen-question FAQPage, and WebSite.",
      },
      {
        label: "Semantic landmarks and accessibility",
        state: "implemented",
        detail:
          "Skip link, main / nav / footer / aside landmarks, focus management in both dialogs. axe-core reports zero violations across five interaction states.",
      },
      {
        label: "Performance pass",
        state: "implemented",
        detail:
          "Self-hosted fonts and images, WebP with srcset, intrinsic sizing, lazy loading. Image payload 12.0 MB to 2.7 MB.",
      },
      {
        label: "Post-build verification",
        state: "implemented",
        detail:
          "Runs on every build and fails it on a missing asset, dead in-page link, missing head tag, unparseable JSON-LD, image without alt or intrinsic size, or a surviving prototype artefact.",
      },
      {
        label: "Free-pickup eligibility wording",
        state: "not-connected",
        detail:
          "A content question, not a build one. Two readings of the eligibility rule appear in the client-approved copy; it was raised for a ruling and both are carried through as supplied rather than silently picked between.",
      },
      {
        label: "Gallery and press-outlet imagery",
        state: "available",
        detail:
          "Intentional placeholders in the approved design, labelled as awaiting photography and carried through as-is.",
      },
    ],
    limitations: [
      "The content and SEO strategy was supplied by the client. This engagement was the design prototyping, the production build and the compliance implementation, not the strategy.",
      "Two sections are placeholders in the approved design pending client-supplied photography, and are carried through rather than invented.",
      "One eligibility rule is stated two ways in the approved copy and remains a client content decision.",
    ],
    image: {
      src: "/images/erth-mark.png",
      alt: "ERTH mark",
      variant: "mark",
    },
    links: [{ label: "Live website", href: "https://erth.app", external: true }],
  },

  {
    slug: "researchforge",
    name: "ResearchForge",
    fullName: "ResearchForge: AI research paper assistant",
    tagline: "An AI research assistant built to say when the paper doesn't support the answer.",
    summary:
      "A university AI research-paper assistant, live on its own domain. Upload a paper and get a summary, a gap analysis carrying its own evidence, and a literature review, with the system declining rather than inventing where the paper does not support a section. Built end to end: planning documents through architecture, Next.js and FastAPI, PostgreSQL Row Level Security, 538 tests, deployment and maintenance.",
    category: "Web Apps / Software",
    categorySlug: "web-apps",
    categories: ["Web Apps / Software"],
    hrOverview: {
      valueProposition: "Full-stack AI research assistant engineered with schema validation to decline unsupported queries rather than hallucinate.",
      role: "Sole Developer",
      roleScope: "End-to-End Planning, Dual-Service Architecture, AI Pipeline & Automated Tests",
      context: "University of Cyberjaya (BIT4543 AI) — live application deployed on custom domain",
      highlights: [
        "Architected dual-service system on Vercel: FastAPI Python backend paired with Next.js frontend behind a single origin",
        "Enforced 4-layer groundedness: explicit model decline paths, strict schema validation, and immediate discard of invalid outputs",
        "Designed provider abstraction with automatic failover: Groq (qwen3.6-27b) primary with Anthropic (claude-opus-5) fallback",
        "Implemented database-level data isolation via PostgreSQL Row Level Security (RLS) ensuring strict per-user boundaries",
        "Engineered 538 automated tests (522 backend with pytest, 16 frontend with Vitest) running offline without API consumption",
      ],
      technologies: ["Python 3.14", "FastAPI", "Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Supabase Auth & RLS", "Groq", "Anthropic", "pytest"],
    },
    role: "Sole Developer",
    roleScope: "End-to-End Planning, Dual-Service Architecture, AI Pipeline & Automated Tests",
    period: "2026",
    affiliation: "University of Cyberjaya, BIT4543 Artificial Intelligence",
    confidential: false,
    kind: "university-project",
    tier: "featured",
    image: {
      src: "/images/researchforge-mark.png",
      alt: "ResearchForge mark",
      variant: "mark",
    },
    previewFigure: {
      src: "/images/researchforge/04_analysis_result_provenance.png",
      alt: "A ResearchForge analysis of a fictional demonstration paper on the live site: the file name, page and character counts, provenance badges reading Claude, Fallback used and claude-opus-5, and tabs for Summary, Research Gaps, Literature Review and Paper Information above the summary text.",
      width: 1398,
      height: 631,
      caption: "A real analysis on the live deployment, run on a clearly fictional demo paper. The badges record which provider actually wrote it and that the fallback was used.",
    },
    facts: [
      { value: "538", label: "automated tests, none calling a paid API" },
      { value: "3", label: "schema-validated model passes per paper" },
      { value: "98.8 s", label: "median new analysis, 5-paper evaluation" },
    ],
    shareImage: {
      src: "/images/researchforge/01_landing_hero.png",
      width: 1440,
      height: 900,
      alt: "The ResearchForge landing page: Understand research faster with AI, with a preview of the summary, research gaps and literature review panels.",
    },
    tech: [
      "Python 3.14",
      "FastAPI",
      "Pydantic",
      "Next.js 16 (App Router)",
      "React 19",
      "TypeScript",
      "Supabase / PostgreSQL",
      "Groq",
      "Anthropic",
      "pytest",
    ],
    techGroups: [
      {
        label: "Backend",
        items: ["Python 3.14", "FastAPI", "Pydantic", "pydantic-settings", "uvicorn"],
      },
      {
        label: "Frontend",
        items: ["Next.js 16 (App Router)", "React 19", "TypeScript (strict)", "Plain CSS"],
      },
      {
        label: "AI",
        items: [
          "Groq (qwen3.6-27b, primary)",
          "Anthropic (claude-opus-5, fallback)",
          "Schema-constrained structured output",
          "Automatic provider fallback",
        ],
      },
      {
        label: "Data & auth",
        items: [
          "Supabase Postgres",
          "Supabase Auth",
          "Row Level Security",
          "SQL migrations",
          "Content-hash analysis cache",
        ],
      },
      {
        label: "Documents",
        items: ["pypdf", "Conditional chunking", "Signature and encryption checks"],
      },
      {
        label: "Quality & platform",
        items: ["pytest", "Vitest", "ruff", "Vercel (multi-service, one origin)"],
      },
    ],
    highlights: [
      "Taken end to end: project plan, milestones, risks and numbered decisions committed before the first feature, through to a deployed system still being maintained",
      "A data-isolation defect that every automated test passed: the backend held a privileged key that bypassed Row Level Security, so every policy was present and every policy was inert",
      "Every claim must be grounded in the uploaded paper, enforced in the prompt, the response schema, and the interface",
      "Two providers behind one interface: Groq qwen3.6-27b as configured primary, Anthropic claude-opus-5 as automatic fallback",
      "Fallback fires only for rate limits and temporary provider failures, never for a bad PDF or a validation error that would fail identically on either vendor",
      "Every analysis records which provider and model actually produced it, whether the fallback was used, and how long it took",
      "Per-user isolation moved out of application code and into Postgres Row Level Security, after an application-level check proved insufficient in production",
      "538 passing tests, 522 backend and 16 frontend, none of which call a paid interface",
      "The model tier was chosen to fit a 300-second function ceiling, not from a benchmark table",
      "What it cannot do is published on the site, not buried in a README",
    ],
    workflow: [
      "Sign in",
      "Upload a PDF",
      "Validate and extract",
      "Analyse",
      "Read and keep the result",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "ResearchForge reads an academic PDF and produces three things: a structured summary covering the research problem, methodology, key findings and conclusion; a research-gap analysis where each gap is shown alongside the wording in the paper that supports calling it a gap; and a literature review of the prior work the paper itself discusses.",
          "It is deployed on its own subdomain as a single Vercel project running two services behind one origin, with email and Google sign-in and a research library private to each account.",
        ],
        figures: [
          {
            src: "/images/researchforge/01_landing_hero.png",
            alt: "The public ResearchForge landing page. The headline reads Understand research faster with AI, with Get Started and See How It Works buttons, three promises (private to your account, grounded in your paper, says when it cannot tell) and an illustrative panel of summary, research gaps and literature review.",
            width: 1440,
            height: 900,
            caption: "The public landing page at researchforge.rukon.dev. Everything past it requires an account.",
          },
        ],
        note:
          "Every screenshot on this page was captured from the live deployment on 25 September 2026, using two short demonstration papers written for the purpose and labelled fictional on their first line. The analyses shown are the model's real output for those papers. The account name in the header is blurred.",
      },
      {
        heading: "Problem",
        body: [
          "The failure mode of an AI summarising tool is not that it produces nothing. It is that it produces something plausible for a section the source never covered: an invented methodology for a position paper, a confidently stated gap with nothing behind it.",
          "For a tool meant to help with research, that failure is worse than no answer at all, because it is indistinguishable from a correct one unless the reader already knows the paper.",
        ],
      },
      {
        heading: "Context",
        body: [
          "ResearchForge was developed as part of BIT4543 Artificial Intelligence at the University of Cyberjaya. It is a university project, but it was not built as a classroom prototype: it is deployed on its own subdomain, has accounts and stored user data, and the reported results come from running the deployed system rather than from estimates.",
          "It began as a stateless tool with no accounts, which kept the first version defensible while there was nothing stored to protect. Adding a library meant that stopped being true, so authentication, per-user ownership and database-level access control went in together rather than being retrofitted around a feature that had already shipped.",
        ],
      },
      {
        heading: "My Work",
        body: [
          "I took this from an empty repository to a deployed system that is still maintained, and the order matters: the first commit is the project structure, the working rules, a project plan with milestones, risks and numbered decisions, the environment contract and the documentation skeleton. Features came after that, not before it.",
          "Planning and specification. Milestones were tracked and closed in the repository (M1 complete, risk R1 resolved), and technical choices were recorded as numbered decisions rather than made silently, including one that was locked, revisited and re-locked when a better option was found. Requirements were derived from the objectives and refined during development as defects exposed expectations nobody had written down.",
          "Architecture and design. Two services in one Vercel project behind a single origin, a provider interface that keeps vendor SDKs out of the analysis code, a storage-independent repository, the database schema and its migrations, and the decision to enforce ownership in PostgreSQL rather than in application code.",
          "Implementation, both sides. The Python and FastAPI backend, its API endpoints and error semantics, PDF ingestion and text normalisation, the three-pass analysis pipeline, prompt and structured-output handling, schema validation, the content-hash cache, authentication and owner configuration. On the frontend, the Next.js application: the landing page, sign-in and account flows, the analysis workspace, the research library, paper detail and cross-paper review, themes, and the responsive layout.",
          "Then the parts that only exist once something is real: production configuration and environment management, deployment, debugging live failures, refactoring, the test suite, and maintenance after the system was already working.",
        ],
      },
      {
        heading: "How it works",
        body: [
          "A signed-in user drops a PDF on the dashboard. The browser checks type, emptiness and size, then posts it to POST /api/analyze. The backend validates it again, extracts and cleans the text, checks whether that exact text has been analysed before, and if not makes three structured model calls: summary, research gaps, literature review. The result comes back as one validated JSON response and renders in tabs.",
          "Nothing is stored until the user chooses Save to library. Saved papers can then be selected together in the Workspace to produce one literature review across several of them. That second step reads the stored analyses rather than re-reading the PDFs.",
          "A new analysis takes one to three minutes; the interface says so and lists the steps the request performs, without pretending to know which one is running, because the backend does not report progress.",
        ],
        figures: [
          {
            src: "/images/researchforge/diagram-workflow.png",
            alt: "Workflow diagram. Row one: sign in, upload a PDF, analyse, read the result, save to library. Beneath Analyse, three outcomes: rejected upload (422 or 413), same text seen before (cache hit, no model call) and provider problem (429, 502, 503). Row two: My Papers, select two or more, cross-paper review, read and copy. An owner-only settings box chooses the primary AI provider.",
            width: 1600,
            height: 1000,
            caption: "The verified user workflow, traced from the Next.js routes and API calls. Search inside papers, notes, citation export and collaboration are not in the product.",
            wide: true,
          },
          {
            src: "/images/researchforge/03_analysis_in_progress.png",
            alt: "The dashboard while a paper is being analysed: an Analysing paper progress bar with elapsed time, a note that analysis normally takes one to three minutes and that the backend does not report which step is running, and a list of five steps from uploading to preparing the literature review.",
            width: 1398,
            height: 713,
            caption: "Analysis in progress. The steps are listed but none is marked complete, because the backend does not report which one is running.",
          },
        ],
      },
      {
        heading: "Engineering Approach",
        body: [
          "The founding principle is that every claim must be grounded in the uploaded paper, and it is enforced in four layers rather than requested once in a prompt. The prompt requires it, and the prompts live in version-controlled files rather than scattered through the code. The response schema carries explicit insufficient-evidence fields, giving the model a way to decline that is as easy as complying. Every reply is validated against that schema on return. And output that fails validation is discarded rather than repaired, which is the rule that makes the other three mean anything: a partially valid analysis that the system patched up would be an invented analysis.",
          "Structured output is the mechanism, not a convenience. Each response model is converted to a JSON Schema and handed to the model as the required output format, with additional properties forbidden. Every reply is validated on return, and a truncated or malformed answer is refused outright rather than partially rendered.",
          "The three analyses run as three separate model calls. They are different tasks with different evidence rules, so separating them means a failure in one does not corrupt the others, and each can be improved on its own. They run sequentially on purpose: running them in parallel would multiply the peak rate-limit burden for a latency win that does not matter on a single upload.",
        ],
        figures: [
          {
            src: "/images/researchforge/05_research_gaps_evidence.png",
            alt: "The Research Gaps tab of a saved paper. Limitations stated by the authors are listed, followed by identified gap 1: no individual-level randomisation or clustering-adjusted analysis. Under it, why it matters, and an evidence block quoting the paper's own sentence about tutorial-section assignment.",
            width: 1398,
            height: 675,
            caption: "Each gap carries the paper's own wording as evidence. Evidence is a required field in the response schema, so a gap returned without it fails validation.",
          },
          {
            src: "/images/researchforge/06_single_paper_literature_review.png",
            alt: "The Literature Review tab. A blue scope notice says the review covers only prior work discussed within the uploaded paper, which it identifies as a fictional demonstration paper, and that the cited works were not consulted. Below are major themes and relevant findings attributed to the authors the paper cites.",
            width: 1398,
            height: 698,
            caption: "The single-paper review states its own scope: only the prior work this paper discusses, with the cited works not consulted. The model also noticed, unprompted, that the paper declares itself fictional.",
          },
        ],
      },
      {
        heading: "Architecture",
        body: [
          "One Vercel project runs two services. A Next.js frontend serves everything except the API, and a FastAPI backend serves /health and /api/*, with routing declared in the project configuration. Because both share one origin, the frontend calls the API with a relative path, which is what makes the custom domain, the .vercel.app domain and every preview URL work from the same build.",
          "Generation sits behind a provider interface. The analysis service depends on that interface and never on a vendor SDK, each vendor's SDK is imported only inside its own provider module, and the concrete provider is built by a factory with a local import so adding one never forces every caller to import every SDK. An earlier version used Google Gemini; it is a historical provider only and produces none of the current analyses.",
          "Vendor errors are wrapped in project-owned exception types, with a missing API key separated out from the rest because it is a deployment problem rather than a user's fault and maps to a different status code. Status codes are chosen so the frontend can tell the cases apart without parsing message text: too large, unusable PDF, unusable model reply, no credentials configured. Nothing expected returns a 500.",
        ],
        figures: [
          {
            src: "/images/researchforge/diagram-architecture.png",
            alt: "System architecture diagram. The browser reaches one Vercel project at researchforge.rukon.dev, where vercel.json routes /api and /health to a FastAPI backend and everything else to a Next.js 16 frontend. The backend calls Supabase Auth to verify tokens, Supabase Postgres with the user's own token so Row Level Security applies, and the Anthropic and Groq APIs. Dashed boxes mark Jina embeddings and pgvector retrieval as planned scaffolding that nothing calls, and Google Gemini as retired.",
            width: 1600,
            height: 1080,
            caption: "System architecture. Solid boxes run in production; dashed boxes are scaffolding nothing calls; Gemini is retired and kept only for historical rows.",
            wide: true,
          },
          {
            src: "/images/researchforge/diagram-data-flow.png",
            alt: "Data flow diagram of one analysis: PDF bytes, validation, extraction and cleaning with pypdf, a SHA-256 content hash checked against the analysis cache, a 400,000-character decision between whole-document context and map-reduce digests, three structured model calls through the routed provider to Anthropic or Groq, Pydantic validation, and the response to the browser. The cache is written only on success, and the library is written only when the user saves.",
            width: 1600,
            height: 1270,
            caption: "One analysis, end to end. There is no retrieval step: the whole paper is the context. The PDF itself is never stored.",
            wide: true,
          },
        ],
      },
      {
        heading: "Providers and fallback",
        body: [
          "The owner picks which of the two providers is primary, and the other automatically becomes the fallback. Groq running qwen3.6-27b is the configured primary and Anthropic claude-opus-5 the fallback, as the live owner settings showed on 25 September 2026. There is no per-user model picker: the choice is an operational one, made once, and the interface does not pretend otherwise.",
          "Availability is enforced when the router is constructed rather than checked at call time, so a provider that has been switched off is never built and no code path can reach it.",
          "Fallback is deliberately narrow. It fires once per analysis, and only for a rate limit or a temporary provider failure, checked against a whitelist so a new error type does not become retryable by default. It does not fire for a malformed PDF, a schema validation failure or a missing key, because those fail identically on either vendor and retrying them just spends a second vendor's quota to produce the same error more slowly.",
          "One switch per analysis, not per call. An analysis makes at least three calls, and allowing each to fail over independently would let different sections be written by different models, which makes the recorded model identity meaningless.",
          "Every stored analysis records which provider and model actually produced it, whether the fallback was used, and how long the call took. Without that, a result whose quality looks off has no explanation attached to it, and 'which model wrote this' becomes unanswerable a week later.",
          "The screenshots below show that working rather than asserted. Both demonstration papers were analysed with Groq as primary, and both records say Claude produced them with the fallback used. That is the behaviour the evaluation predicted, since the primary's free tier is smaller than one call over a whole paper.",
        ],
        figures: [
          {
            src: "/images/researchforge/diagram-ai-pipeline.png",
            alt: "Provider routing flowchart. The router is built per request from the owner's primary and the enabled providers, then calls the primary. On success the primary is recorded. On error, a whitelist decides whether it is retryable: rate limits and transient errors are, credential and response errors are not. A retryable error switches to the fallback, which stays in place for the rest of the analysis. If the fallback also fails, one error names both vendors and there is no third attempt.",
            width: 1600,
            height: 820,
            caption: "Routing and fallback, as implemented in src/rag/llm/router.py.",
            wide: true,
          },
          {
            src: "/images/researchforge/04_analysis_result_provenance.png",
            alt: "The recent-analysis card on the dashboard for the second demonstration paper, with badges reading Claude, Fallback used and claude-opus-5, a Save to library button, and the summary tab open.",
            width: 1398,
            height: 631,
            caption: "Provenance on a real result: Groq was primary, Claude wrote it, and the record says so.",
          },
          {
            src: "/images/researchforge/10_owner_ai_settings.png",
            alt: "The owner-only AI configuration panel in Settings. Primary AI model is set to Groq Qwen 3.6 27B, the fallback shows Claude (automatic), and an availability list shows Claude claude-opus-5 and Groq qwen/qwen3.6-27b both enabled, with Groq marked Primary.",
            width: 1399,
            height: 518,
            caption: "The owner-only control. Choosing a primary makes the other provider the fallback; switching one off removes it from routing entirely. API keys are never stored or shown here.",
          },
        ],
      },
      {
        heading: "Accounts and data ownership",
        body: [
          "Authentication is Supabase Auth: email and password with sign-up, sign-in, forgot-password and reset flows, plus Google sign-in completing at a dedicated callback route. Passwords never reach the ResearchForge database.",
          "Every paper, analysis and review belongs to exactly one account. Application-level ownership checks alone proved insufficient for reliable isolation in production, so the guarantee was moved into the database: PostgreSQL Row Level Security enforces per-user access at the data layer.",
          "The mechanism is which credential the backend uses to reach the database. Requests are made as the signed-in user, so PostgreSQL resolves the authenticated identity and applies every policy automatically. A forgotten ownership filter then returns nothing rather than everything, which is the opposite of how that mistake usually fails. Ownership columns default to the authenticated identity, so a row cannot be inserted without an owner even if the application code omits it.",
          "Records created before authentication existed remain unowned. They were deliberately neither deleted nor assigned to an owner that could not be established, and they are unreachable because a null owner never matches an authenticated identity.",
          "Re-uploading a paper that has already been analysed reuses the stored analysis instead of paying for it again. Identity is a content hash of the extracted text, not the filename, so the same paper saved under a different name still matches.",
        ],
        figures: [
          {
            src: "/images/researchforge/diagram-database.png",
            alt: "Database relationship diagram. Supabase auth.users owns papers, analyses and literature_reviews, each with user_id defaulting to auth.uid() and a Row Level Security policy. Analyses reference papers with cascade delete; literature_review_papers links reviews to papers and restricts deleting a reviewed paper. An analysis_cache table is keyed by content hash and analysis version. system_settings and app_owners hold the owner's AI configuration. A dashed chunks table with a 1024-dimension pgvector column is marked planned: nothing writes or reads it.",
            width: 1600,
            height: 960,
            caption: "The schema built by six additive migrations. Every table has RLS enabled; the chunks table is scaffolding for retrieval that was never built.",
            wide: true,
          },
        ],
      },
      {
        heading: "Library and cross-paper review",
        body: [
          "A saved paper keeps its analysis, and the library can be searched by title or filename, filtered by status and sorted. Opening one shows the same four tabs as a fresh analysis, plus the document facts that were measured rather than generated: pages, characters extracted, file size, whether it was analysed whole, and the model recorded for it.",
          "Selecting two or more saved papers in the Workspace builds one literature review across them. It deliberately reads each paper's stored summary, findings, limitations and themes rather than re-extracting the PDFs, which keeps the combined prompt inside the context window and avoids paying for the same reading twice. The trade-off is stated in the code: the cross-paper review cannot surface anything the original analyses missed.",
          "Every paper in a review must still exist and carry a stored analysis, or the request is refused: 404 for a paper that is missing or belongs to someone else, 422 naming any paper with no stored analysis. A review that quietly covered four of the five papers the user picked would be worse than an error, because the interface would still say five.",
        ],
        figures: [
          {
            src: "/images/researchforge/08_workspace_selection.png",
            alt: "The Research Workspace. The library is filtered to the two demonstration papers, both ticked. A Selected papers panel lists them in order with remove buttons and a Generate literature review button.",
            width: 1399,
            height: 620,
            caption: "Choosing papers for a cross-paper review. The panel refuses to continue with fewer than two.",
          },
          {
            src: "/images/researchforge/09_cross_paper_review.png",
            alt: "A generated cross-paper review titled Review of 2 papers, 25 Sep 2026, based on 2 selected papers. It lists the papers included, a scope notice saying the review covers only the two supplied papers, both labelled fictional, and major themes that attribute each point to the paper it came from.",
            width: 1399,
            height: 695,
            caption: "The cross-paper review names the papers it was built from and attributes each theme to its source paper.",
          },
          {
            src: "/images/researchforge/07_paper_details_provenance.png",
            alt: "A saved paper's Paper Details tab showing filename, 3 pages, 7,393 characters extracted, 6 KB file size, analysed as a single document, model claude-opus-5, saved date, and content truncated: No.",
            width: 1398,
            height: 600,
            caption: "Measured document facts, kept apart from anything a model generated.",
          },
        ],
        note:
          "Saved cross-paper reviews are stored and counted on the dashboard, but no screen lists or reopens them yet. The API route exists; the interface does not call it.",
      },
      {
        heading: "Interface",
        body: [
          "The frontend is Next.js 16 with React 19, TypeScript in strict mode and plain CSS rather than a component library. Light and dark themes follow a stored preference or the operating system, the navigation collapses to a menu on narrow screens, and empty and error states are written to say what happened, for example distinguishing an empty library from one that is not connected.",
        ],
        figures: [
          {
            src: "/images/researchforge/11_dark_mode_research_gaps.png",
            alt: "The saved paper view in the dark theme, with the Research Gaps tab open showing seven limitations stated by the authors.",
            width: 1399,
            height: 713,
            caption: "Dark theme. The limitations the authors state are listed separately from the gaps the analysis identifies.",
          },
          {
            src: "/images/researchforge/13_mobile_landing_and_sign_in.png",
            alt: "Two mobile screenshots side by side. Left: the landing page with the headline, full-width Get Started and See How It Works buttons, and three promises. Right: the sign-in screen with email and password fields, Sign In, Continue with Google, and a link to create an account.",
            width: 1556,
            height: 1120,
            caption: "Landing and sign-in at mobile width. Google sign-in uses the PKCE flow, so no token ever appears in a URL.",
          },
        ],
      },
      {
        heading: "Document ingestion",
        body: [
          "An upload is validated twice. The browser checks type, emptiness and size; the backend re-checks the real byte count and verifies the file actually begins with a PDF signature, so a renamed file cannot get through on its content type alone.",
          "Encrypted files get an empty-password decrypt attempt, which covers the common printing-restricted case, and are rejected otherwise rather than guessed at. A file whose extraction yields almost no text is a scanned image with no text layer; it is rejected with an explanation instead of returning an empty result.",
          "Extracted text is cleaned conservatively: ligatures normalised, words rejoined across hyphenated line breaks, runs of spaces collapsed but never across newlines, because paragraph structure is a real signal about where sections begin. Nothing in the cleaning removes content.",
          "Chunking is deliberately conditional. A paper that fits is sent whole, because cross-section reasoning is exactly what gap analysis depends on and chunking would destroy it. Only a genuinely oversized document takes the map step, and its boundaries are chosen at paragraph breaks where possible, falling back to sentence ends and only then to a hard offset.",
        ],
      },
      {
        heading: "Testing",
        body: [
          "538 passing tests: 522 backend with pytest and 16 frontend with Vitest, plus 5 live-provider tests skipped by design. No test in the suite calls a paid interface. Every provider is replaced by a fake through FastAPI's dependency-override mechanism, which is the practical reason the endpoint takes its provider as a dependency rather than constructing one.",
          "The distribution is deliberate rather than even. Authentication is the largest module at 61 tests, on the judgement that a silent failure there costs most. Then the LLM providers at 49, every database access path at 48, rate-limit recognition and retry discipline at 42, and the provider router at 36.",
          "Automated tests were not sufficient on their own. The isolation defect described above passed every one of them while being wrong in production, because the ownership tests modelled Row Level Security with a stub. Verifying it needed live scripts running a scenario as two different people against the deployed system. That is the argument for keeping unit, integration and live testing as separate levels: each can pass while another fails.",
        ],
      },
      {
        heading: "Technical Decisions",
        body: [
          "The model tier was chosen against a platform constraint rather than a benchmark. A Vercel function has a 300-second ceiling, and three sequential schema-constrained calls have to complete inside it. A deeper-reasoning model is one environment variable away with no code change.",
          "pypdf was chosen over faster alternatives on licensing. The fastest option ships native binaries and is AGPL, which is incompatible with an MIT repository intended to be read publicly. Only one function touches the library, so swapping it later is a one-function change.",
          "Provenance columns degrade per migration rather than all at once: a database that has not yet run a later migration loses only the fields that migration added, instead of the whole write failing. A schema change should not be able to take the feature down while it is rolling out.",
        ],
      },
      {
        heading: "Deployment",
        body: [
          "This did not stop at localhost. One Vercel project runs both services behind a single origin: a Next.js frontend serving everything except the API, and a FastAPI backend serving /health and /api/*, with the routing declared in the project configuration and a 300-second function ceiling the analysis has to fit inside.",
          "Single-origin is the decision that makes the rest work. Because both services answer on the same origin, the frontend calls the API with a relative path, so the custom domain, the .vercel.app domain and every preview URL all work from one build with no per-environment base URL to get wrong.",
          "Production configuration is its own body of work: environment and secret management across the application, the database and two model providers, a guard that refuses a publishable key in a slot that requires a private one rather than silently showing an empty library, and a health endpoint that reports whether auth and the library are actually wired rather than just that the process is up.",
        ],
      },
      {
        heading: "Production debugging",
        body: [
          "The most instructive defect was in data isolation, and it is instructive precisely because nothing caught it. An earlier version of the backend connected to the database with a privileged key, the kind designed to bypass Row Level Security. Every policy was present. Every policy was correctly written. Every policy was inert. The application worked, every feature behaved correctly, and the whole automated suite passed, because at the unit level nothing was wrong.",
          "It was found by signing in as a second real account and checking whether the first account's papers were visible. The fix was to connect as the signed-in user so PostgreSQL resolves the caller identity itself. That is the episode that turned isolation from something every query has to remember into something the database enforces.",
          "A content delivery network hid the real errors. The custom domain is served through a CDN that replaces an origin error body with a short generic message, so every failed analysis looked identical and carried no explanation. Addressing the application origin directly returned the real provider message, which is how the free-tier token limit behind the whole evaluation was identified. Without that step the central finding would have stayed invisible.",
          "A schema change broke every library read. Queries were selecting new provenance and cache columns before the matching migration had been applied, and the database rejected the entire request rather than the missing columns, so all reads failed at once. The fix retries and degrades one migration level at a time, returning the columns that do exist instead of failing completely.",
          "Rate limiting arrived disguised as generic server errors. Handling was rewritten to be vendor-neutral: rate limits are recognised as such, retry information is passed through, an exhausted quota is distinguished from temporary throttling, and the hidden retries inside client libraries were switched off because they multiply cost without telling the caller.",
          "Sign-out, sign-in and same-origin routing each needed their own fix: pinning the PKCE flow and deriving every redirect from the running origin, making logout take effect promptly, and calling the backend same-origin so the custom domain and every preview URL work from one build.",
        ],
      },
      {
        heading: "Maintenance",
        body: [
          "Work did not stop at the first working version. After the analysis path was live, the system gained authentication and private libraries, Google sign-in, a second provider with owner-controlled availability, account settings, analysis reuse, and provenance recording, each of which meant revisiting code that already worked.",
          "Some of that was correcting earlier decisions rather than adding to them. The provider architecture was rebuilt when the original vendor's rate limits proved unworkable, the frontend was rebuilt as a research dashboard, and provenance columns were changed to degrade per migration after the schema-skew failure rather than being left to fail as a unit.",
          "A caching subtlety is recorded rather than quietly fixed: because the cache is keyed by content rather than by user or provider, a cached result can be returned where a fresh analysis was expected. That affected measurement twice during evaluation. Neither was a defect in the cache, which behaved as designed; both were defects in measurement, resolved by clearing the relevant rows before measuring. It is worth stating because a correctness-preserving optimisation invalidating an experiment silently is a general risk, not a one-off.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "A working, deployed application with accounts, a private research library and recorded provenance, that does what it says and states what it does not do. The analysis and library paths are complete and in production; retrieval over a stored corpus is written only as far as the embedding request construction, and both the interface and the documentation say so rather than implying otherwise.",
          "Measured on the deployed system: a new analysis of a full paper takes a median of 98.8 seconds, ranging from 72.6 to 115.2 across the evaluation corpus, because three separate passes are made over the whole document. A cache hit returns in 2.7 to 3.2 seconds.",
          "The evaluation also produced a negative result worth stating. The intended comparison between the two providers could not be completed: with the fallback removed, the configured primary refused every request, because its free tier allows 7,000 input tokens per minute and every corpus paper needed more than that in a single call. The architecture supports two providers and the fallback is verified, but the system is effectively single-provider until a primary that can accept a whole paper is configured.",
        ],
      },
    ],
    status: [
      {
        label: "PDF upload, validation and extraction",
        state: "implemented",
        detail: "Live. Double validation, signature check, encryption and scanned-file rejection.",
      },
      {
        label: "Summary, gap analysis, literature review",
        state: "implemented",
        detail: "Live. Three schema-constrained model calls, each validated on return.",
      },
      {
        label: "Accounts and authentication",
        state: "implemented",
        detail:
          "Live. Supabase Auth with email and password, plus Google sign-in. The deployed /health endpoint reports auth enabled.",
      },
      {
        label: "Private research library",
        state: "implemented",
        detail:
          "Live and database-backed. Papers, analyses and reviews are scoped to one account by Postgres Row Level Security.",
      },
      {
        label: "Provider abstraction and automatic fallback",
        state: "implemented",
        detail:
          "Groq qwen3.6-27b is the configured primary and Anthropic claude-opus-5 the fallback. Availability is enforced when the router is constructed, so a disabled provider is never built.",
      },
      {
        label: "Recorded provenance",
        state: "implemented",
        detail:
          "Each analysis stores the provider and model that produced it, whether the fallback was used, and the elapsed time.",
      },
      {
        label: "Analysis reuse",
        state: "implemented",
        detail:
          "A paper already analysed is matched by a content hash of its extracted text and its stored analysis reused.",
      },
      {
        label: "Conditional chunking for long papers",
        state: "implemented",
        detail: "Whole-document by default; map-reduce only above a configured character threshold.",
      },
      {
        label: "Cross-paper literature review",
        state: "implemented",
        detail:
          "Live. Built from the stored analyses of two or more saved papers in one model call, and saved with links to the papers it covers.",
      },
      {
        label: "Reopening saved cross-paper reviews",
        state: "available",
        detail:
          "Reviews are stored and an API route lists them, but no screen reads that route yet, so a saved review cannot be reopened from the interface.",
      },
      {
        label: "Grounded Q&A chat and export",
        state: "not-connected",
        detail:
          "Planned in the project plan (F8, F10). Not built. Results can be copied section by section; there is no file export.",
      },
      {
        label: "Embedding provider",
        state: "not-connected",
        detail:
          "The provider interface and request construction are written and unit-tested offline. The HTTP call is deliberately not implemented, so no embedding is ever produced.",
      },
      {
        label: "Retrieval / vector search",
        state: "not-connected",
        detail:
          "Not implemented. The analysis path performs no retrieval: it sends the document, not retrieved passages. This is not a RAG system.",
      },
    ],
    limitations: [
      "Effectively single-provider. The two-provider architecture works and the fallback is tested, but the configured primary's free tier cannot accept a full paper, so genuine redundancy is not achieved today.",
      "Grounded is not the same as accurate. Output is constrained to the supplied document and non-conforming output is discarded, but nothing establishes that a summary is correct. Generated content needs checking before it is relied on or cited.",
      "No labelled benchmark, so no accuracy figure is reported. The evaluation measures completion, fallback behaviour, provenance, latency and cost avoidance instead.",
      "The evaluation covers five English-language papers from one discipline, analysed once per configuration and assessed by the project team rather than independently.",
      "A revoked session stays valid for up to about five seconds, a deliberate trade against contacting the auth service on every request.",
      "No OCR, so scanned papers with no text layer are rejected rather than processed.",
      "The literature review covers only the prior work one paper discusses. It does not search a corpus.",
      "Upstream provider rate limits are handled and surfaced with a retry hint, but the application does not rate-limit its own users.",
      "Papers are identified by filename and content hash: bibliographic metadata extraction is not implemented.",
      "Retrieval over a stored corpus is planned, not built.",
      "The dashboard's How ResearchForge works panel still says the paper goes to Gemini, which is out of date since Gemini was retired from routing. A copy fix, not yet made.",
    ],
    roadmap: [
      "Show saved cross-paper reviews in the interface, using the list and fetch routes that already exist.",
      "Correct the stale Gemini wording on the dashboard.",
      "Configure a primary provider whose limits accept a whole paper, so the fallback is redundancy rather than the normal path.",
      "Planned in the project plan, not started: embeddings and retrieval over a stored library (F3), grounded question answering across papers (F8), page-level citations (F9) and Markdown or PDF export (F10).",
    ],
    links: [
      { label: "Live application", href: "https://researchforge.rukon.dev", external: true },
      { label: "Source on GitHub", href: "https://github.com/tirukon015/researchforge", external: true },
    ],
  },

  {
    slug: "drivekeep",
    name: "DriveKeep",
    fullName: "DriveKeep: photo-first fuel, mileage and maintenance log for iOS and the web",
    tagline: "Log a refill from two photos, and never mistake a guess for a measurement.",
    summary:
      "A personal log for running a car and a motorcycle. A refill starts with a receipt photo and an odometer photo; extraction fills in the form and the owner confirms. Economy is only reported when it was measured between two full tanks, estimates are labelled as estimates, and a vehicle with nothing to measure from shows \"Not available\" rather than a default. One repository: a SwiftUI iOS app with on-device extraction and opt-in Supabase sync, a Next.js web app with server-side OCR, and a standalone Express backend. Personal project, not deployed.",
    category: "iOS / Mobile",
    categorySlug: "ios-mobile",
    categories: ["iOS / Mobile", "Web Apps / Software"],
    hrOverview: {
      valueProposition:
        "A vehicle log where a refill starts with two photos and every number is labelled as measured or estimated, built as an iOS app, a web app and an API.",
      role: "Sole Developer",
      roleScope: "Product, iOS App, Web App, Backend API, Database & Security, Tests",
      context: "Personal project, built for the author's own car and motorcycle",
      highlights: [
        "iOS extraction on the device with Apple Vision, and Apple's Foundation Models returning structured results on iOS 27+",
        "Google sign-in through Supabase without the Google SDK; credentials in the Keychain; sync to row-level-secured tables, off by default",
        "Economy only from full tanks, estimates labelled, and \"Not available\" instead of any default figure",
        "Next.js web app with server-side OCR (sharp + Tesseract.js) and guards for backwards odometers and duplicate refills",
        "Express 5 API over PGlite with JWT auth, versioned migrations, sync tombstones and backup tooling",
        "64 backend checks (database, API, security) and 21 engine checks passing on the latest commit",
      ],
      technologies: ["Swift", "SwiftUI", "Apple Vision", "Foundation Models", "Supabase", "Next.js 16", "TypeScript", "Express 5", "PostgreSQL"],
    },
    role: "Sole Developer",
    roleScope: "Product, iOS App, Web App, Backend API, Database & Security, Tests",
    period: "September 2026 (not deployed)",
    affiliation: "Personal project",
    confidential: false,
    kind: "personal-project",
    tier: "secondary",
    facts: [
      { value: "64 / 64", label: "backend checks passing" },
      { value: "21 / 21", label: "calculation engine checks" },
    ],
    tech: ["Swift", "SwiftUI", "Apple Vision", "Foundation Models", "Supabase", "Next.js 16", "React 19", "TypeScript", "Tesseract.js", "Express 5", "PGlite", "Prisma"],
    techGroups: [
      { label: "iOS app", items: ["Swift", "SwiftUI", "Apple Vision", "Foundation Models (iOS 27+)", "AuthenticationServices", "Keychain", "UserNotifications"] },
      { label: "Cloud (opt-in)", items: ["Supabase Auth (Google)", "PostgreSQL with row-level security", "PostgREST", "Supabase Storage"] },
      { label: "Web app", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Recharts", "Prisma", "Tesseract.js", "sharp"] },
      { label: "Backend (standalone)", items: ["Express 5", "PGlite", "HS256 JWT", "SQL migrations", "OpenAPI"] },
      { label: "Verification", items: ["Engine test script", "Database, API and security suites", "ESLint", "tsc"] },
    ],
    highlights: [
      "A refill is two photos and a confirmation; extraction is a suggestion in an editable form, never saved on its own",
      "Economy is stored only for a full tank with no missed refill, so a top-up can never produce a false figure",
      "Without a full-tank refill, tank level, range and the refill target read \"Not available\" instead of a default",
      "On iOS, receipts are read on the phone; an image quality gate runs first and odometers pass consensus and plausibility checks",
      "Sign-in and sync exist but sync is off by default, and every synced row is restricted to its owner by RLS",
      "Car and motorcycle are isolated, each with its own tank, units and service intervals",
    ],
    workflow: [
      "Photograph the receipt",
      "Photograph the odometer",
      "Extraction fills the form",
      "Check and confirm",
      "Validate and compute",
      "Dashboard recalculates",
    ],
    shareImage: {
      src: "/images/drivekeep/og.png",
      width: 1200,
      height: 630,
      alt: "DriveKeep: log a refill from two photos, and never mistake a guess for a measurement. Dashboard and refill review screenshots.",
    },
    previewFigure: {
      src: "/images/drivekeep/dashboards.png",
      alt: "Three phone screenshots of the DriveKeep web app: the car dashboard with odometer, estimated range and tank level; the motorcycle dashboard with its own 12 litre tank; and the vehicle spending card split into fuel, service and other costs.",
      width: 1600,
      height: 1200,
      caption: "The web app's dashboards for the car and the motorcycle, and total cost of ownership. Real app, synthetic demo data.",
    },
    sections: [
      {
        heading: "Overview",
        body: [
          "DriveKeep is a log for the running costs of a car and a motorcycle: fuel, mileage, servicing and everything else a vehicle costs. It started from a spreadsheet of refills and repairs, and it is built around one rule the spreadsheet could not enforce: a number that was measured and a number that was estimated must never look the same, and a number that cannot be worked out is not shown at all.",
          "The repository holds three parts. The iOS app is the most developed: extraction on the phone, local data by default, and Google sign-in with opt-in sync to Supabase. The Next.js web app applies the same rules with OCR on the server, and it is the part shown in the screenshots below. A standalone Express backend with its own database and tests is built but not yet connected to either app. Nothing is deployed.",
        ],
        figures: [
          {
            src: "/images/drivekeep/dashboards.png",
            alt: "Three phone screenshots of the DriveKeep web app: the car dashboard with odometer 53,134 km, estimated range 451 km and tank level 79 percent; the motorcycle dashboard with a 12 litre tank; and the vehicle spending card showing fuel, service and other costs for both vehicles.",
            width: 1600,
            height: 1200,
            caption: "Web app: car, motorcycle and total cost of ownership. Built from the latest commit, run locally with synthetic demo data.",
          },
        ],
      },
      {
        heading: "Problem",
        body: [
          "Tracking fuel by hand fails in predictable ways. The odometer is not written down at the pump, a top-up gets treated as a full tank and the economy figure jumps, one mistyped reading makes every later distance wrong, and a second vehicle ends up in the same sheet. A spreadsheet also cannot say how much fuel is probably left or when a service is due.",
        ],
      },
      {
        heading: "Logging a refill from two photos",
        body: [
          "Add Refill asks for the receipt, then the odometer. On iOS both are read on the phone: an image check first rejects a photo that is not a receipt or an odometer, Apple's Vision framework reads the text, and on iOS 27 and later Apple's on-device Foundation Models return the litres, price and total as a structured result. Odometers go through their own path: the display is cropped, several readings are compared, and a reading has to be plausible against the previous one.",
          "In the web app the photos go to the server, where sharp produces three or four preprocessed variants, Tesseract.js reads each, and the variant that parses into the most fields with the highest confidence wins. Either way nothing is saved from extraction alone: the values land in an editable form and only Confirm & Save sends them on. The web server then rejects an odometer lower than the last reading and flags a refill that looks like a duplicate.",
        ],
        figures: [
          {
            src: "/images/drivekeep/refill-flow.png",
            alt: "Three phone screenshots of the web app: step 1 of the refill flow with a Choose from Gallery fallback; the review form after OCR with odometer 53261, fuel 22.45 litres, total RM 46.02 and price RM 2.05 filled in from a sample receipt and odometer image; and the refill history listing each refill with trip distance, cost and an ACTUAL km per litre badge.",
            width: 1600,
            height: 1200,
            caption: "Web app: camera step with the gallery fallback, the review form after real OCR of a synthetic receipt and odometer, and the resulting history.",
          },
          {
            src: "/images/drivekeep/refill-workflow.png",
            alt: "Workflow diagram of the web app: receipt photo, odometer photo, server OCR, then a human review step; on save the server rejects a backwards odometer with 400 and flags duplicates with 409, computes distance and full-tank efficiency, and the dashboard recalculates ACTUAL and ESTIMATED figures.",
            width: 1600,
            height: 880,
            caption: "The web refill path as implemented, including the server rules applied on save.",
            wide: true,
          },
        ],
      },
      {
        heading: "Measured, estimated, or not available",
        body: [
          "Fuel economy is stored only for a full tank with no missed refill before it; a partial fill makes distance divided by litres meaningless. The fuel probably in the tank is carried forward refill by refill (previous estimate, plus litres added, minus distance over average economy, clamped to the tank size) and range follows from it. Both are labelled ESTIMATED.",
          "The last change to the project removed every default that stood in for missing data. Earlier, a new vehicle showed a 75% tank and a 10 or 25 km/L economy it had never measured, and those numbers flowed into range and the refill target. Now the engine returns nothing, the card says \"Not available\", and the app asks for a refill instead.",
        ],
      },
      {
        heading: "Accounts and sync on iOS",
        body: [
          "The iOS app works on local data with no account. Sign-in is Google through Supabase, run in the system's authentication session so no Google SDK or client secret ships in the app; tokens and the Supabase configuration are kept in the Keychain only. An earlier build derived a user id from the email address on the phone. That id existed in no database, so every row-level security policy would have rejected it, and it was replaced with the real Supabase identity.",
          "Cloud sync is off by default, so sign-in can be checked without pushing a single record. When it is switched on, records go to Supabase tables whose policies limit every row to its owner, deletes travel as tombstones so a record removed offline does not come back, photos are uploaded once, and changes queue while the phone is offline.",
        ],
        note: "The iOS app could not be built or run for this write-up (the audit machine runs Windows), and the project has no automated iOS tests. The behaviour described here is from the source code.",
      },
      {
        heading: "Architecture",
        body: [
          "The three parts do not share a live data path yet. The iOS app keeps its data on the phone and optionally syncs to Supabase. The web app calls ten REST routes backed by Prisma and PostgreSQL when a database is configured, or an in-memory store otherwise. The Express backend is an API on its own PostgreSQL, run in-process with PGlite so it needs no database server, with JWT auth, versioned migrations, an audit log, sync tombstones, and backup, restore and backup-verification scripts.",
        ],
        figures: [
          {
            src: "/images/drivekeep/architecture.png",
            alt: "Architecture diagram: a native iOS app with SwiftUI views, a local data store, on-device extraction and an auth and sync manager that optionally talks to Supabase Auth, PostgreSQL with row-level security and Storage; a Next.js web app with REST routes and server-side OCR; and a standalone Express and PGlite backend marked built and tested but not connected to either client.",
            width: 1600,
            height: 1090,
            caption: "What each part does, what is optional, and what is not connected yet.",
            wide: true,
          },
          {
            src: "/images/drivekeep/data-model.png",
            alt: "Data model diagram of the web app: a Vehicle has many Refills, OdometerChecks, Expenses and Maintenance items, all deleted with the vehicle.",
            width: 1600,
            height: 760,
            caption: "The web app's five models. Range, fuel balance and due status are computed, not stored.",
            wide: true,
          },
        ],
      },
      {
        heading: "Servicing and reports",
        body: [
          "Each vehicle has its own service items with an interval in kilometres, in months, or both; an item is overdue when either limit is passed, so tyres can be overdue by time while still well inside their distance. Reports show monthly fuel against other spending and the economy trend, and the web app exports refills, expenses and the service schedule to CSV.",
        ],
        figures: [
          {
            src: "/images/drivekeep/maintenance-reports.png",
            alt: "Two phone screenshots of the web app: the maintenance schedule with an engine oil change overdue by 34 km and a tyre rotation overdue by date; and the reports page for the motorcycle with a monthly spending bar chart and a fuel efficiency line chart.",
            width: 1600,
            height: 1200,
            caption: "Web app: service items due by distance or by date, and reports for the motorcycle.",
          },
        ],
      },
      {
        heading: "What went wrong, and what it taught",
        body: [
          "Defaults are claims. A 75% tank and a 10 km/L economy looked harmless as placeholders, but on screen they read as measurements and fed every estimate after them. Removing them made new vehicles look emptier and the app more honest.",
          "Odometer digits confuse OCR. In a test of the web pipeline on a synthetic odometer display, the digits-only pass read 053261 as 953261. The plausibility check against the previous reading discarded it and 53,261 was used. Reading more than once and letting domain knowledge choose is what made the result usable.",
          "Tests that depend on state are fragile. The backend's API and security suites pass 64 of 64, but only after the database has been migrated and seeded; on a fresh checkout they fail. The next step is for the suite to create its own database.",
        ],
      },
      {
        heading: "Testing and verification",
        body: [
          "On a fresh clone of the latest commit: the web calculation engine's test script passes 21 of 21 (12 scenarios and 9 regression checks); TypeScript, ESLint on the web source and the production build pass; the backend passes 12 database, 35 API and 17 security checks after migrate and seed. The security checks cover missing, forged and expired tokens, access to another user's records, SQL injection in paths and bodies, malformed JSON and invalid identifiers. The web screens here come from a local production build of that commit, including a real OCR call on a synthetic receipt.",
          "Not verified: the iOS app (no macOS machine and no XCTest target), the Supabase sign-in and row-level security in a live project, and ESLint across the whole repository, which reports 30 errors in the backend's CommonJS scripts because the root configuration does not exclude them.",
        ],
      },
    ],
    status: [
      {
        label: "Web app: photo-first refill, OCR, engine, guards, maintenance, reports",
        state: "available",
        detail: "Working in a local production build of the latest commit and covered by the engine tests. Not deployed.",
      },
      {
        label: "iOS app with on-device extraction",
        state: "available",
        detail: "Source complete for the main screens; not built or run during this audit, and no automated iOS tests.",
      },
      {
        label: "iOS sign-in and cloud sync (Supabase, RLS)",
        state: "available",
        detail: "Implemented and off by default. Not verified against a live Supabase project here.",
      },
      {
        label: "Express backend with PGlite",
        state: "available",
        detail: "64 of 64 checks pass after migrate and seed. Not connected to either app.",
      },
      {
        label: "Web sign-in, one shared backend, deployment",
        state: "not-connected",
        detail: "Not built yet.",
      },
    ],
    limitations: [
      "Nothing is deployed.",
      "The web app has no sign-in; its API is open to anyone who can reach it.",
      "The three parts keep separate data: the iOS app uses Supabase, the web app its own database, and the backend is not used by either.",
      "No automated iOS tests, and the iOS app was not built for this write-up.",
      "The backend's tests need a migrated and seeded database.",
      "Web: refills and expenses cannot be edited or deleted, and the Reports total leaves out servicing while the dashboard includes it.",
      "The repository is private. Access can be granted on request.",
    ],
    roadmap: [
      "One backend for both apps",
      "Sign-in for the web app",
      "Unit tests for the iOS calculation engine and extraction",
      "Backend tests that create their own database",
      "Edit and delete for refills and expenses",
      "Deployment",
    ],
    links: [
      {
        label: "GitHub profile (DriveKeep repository is private)",
        href: "https://github.com/tirukon015",
        external: true,
      },
    ],
  },

  {
    slug: "spendrop",
    name: "SpenDrop",
    fullName: "SpenDrop: on-device expense capture from Malaysian payment screenshots",
    tagline: "Share a payment screenshot, get an expense. Read on the phone, never sent anywhere.",
    summary:
      "A native iOS expense tracker for Malaysian daily spending. Share a payment confirmation from Touch 'n Go, a bank app or Apple Pay, or pick a receipt photo, and SpenDrop reads the amount, merchant, provider, category, date and reference on the phone with Apple's Vision framework and a rule-based parser, then asks you to confirm. A Share Extension and the app share one on-device store; there is no server, no network code and no third-party package. Personal project, run on the simulator and the developer's iPhone; not on the App Store.",
    category: "iOS / Mobile",
    categorySlug: "ios-mobile",
    categories: ["iOS / Mobile"],
    hrOverview: {
      valueProposition:
        "An iOS expense tracker that turns a shared payment screenshot into a checked expense, entirely on the phone.",
      role: "Sole Developer",
      roleScope: "Product, iOS App & Share Extension, OCR Parser, Data Model, Tests",
      context: "Personal project, built for everyday Malaysian payments",
      highlights: [
        "Share Extension: any payment screenshot goes from the iOS share sheet to a filled-in review form",
        "On-device OCR with Apple Vision and a Malaysian transaction parser covering 16 payment providers",
        "Every RM value is classified (total, fee, balance, cashback, advertisement) so an advert's price is never chosen as the payment",
        "Duplicate protection by transaction reference, or same merchant and amount on the same day",
        "App and extension share one SwiftData store through an App Group",
        "No server, no network calls and no third-party packages: Apple frameworks only",
      ],
      technologies: ["Swift", "SwiftUI", "SwiftData", "Apple Vision", "Share Extension", "App Groups", "Swift Charts"],
    },
    role: "Sole Developer",
    roleScope: "Product, iOS App & Share Extension, OCR Parser, Data Model, Tests",
    period: "September 2026 (not published)",
    affiliation: "Personal project",
    confidential: false,
    kind: "personal-project",
    tier: "secondary",
    facts: [
      { value: "48 / 48", label: "in-app parser and persistence tests" },
      { value: "0", label: "network calls or third-party packages" },
    ],
    tech: ["Swift", "SwiftUI", "SwiftData", "Apple Vision", "Share Extension", "App Groups", "Swift Charts"],
    techGroups: [
      { label: "App", items: ["Swift", "SwiftUI", "SwiftData", "Swift Charts", "PhotosUI"] },
      { label: "Capture", items: ["Share Extension (UIKit host + SwiftUI)", "App Group shared container", "Apple Vision (VNRecognizeTextRequest)"] },
      { label: "Parsing", items: ["Rule-based Malaysian transaction parser", "Monetary candidate classification", "Provider, merchant and category detection", "Duplicate detector"] },
      { label: "Verification", items: ["48-case in-app test runner", "Image pipeline diagnostics", "Simulator builds with xcodebuild"] },
    ],
    highlights: [
      "Sharing a screenshot to SpenDrop opens a review form already filled in: amount, merchant, provider, category, date and reference",
      "Receipts are read on the phone with Apple Vision; the app contains no networking code at all",
      "Each RM value gets a label, and advertisement, balance, fee and cashback amounts are excluded from the payment",
      "Sender and recipient banks are told apart in interbank transfers, and Apple Pay is linked to the underlying bank",
      "The same screenshot shared twice is caught before it is saved, with an explicit Add Anyway",
      "PayBook keeps frequent transfer payees with their account numbers masked",
    ],
    workflow: [
      "Share a payment screenshot",
      "OCR on the phone",
      "Classify amounts and detect provider",
      "Check for duplicates",
      "Confirm on the review form",
      "Save to the shared store",
    ],
    shareImage: {
      src: "/images/spendrop/og.png",
      width: 1200,
      height: 630,
      alt: "SpenDrop: share a payment screenshot, get an expense, read on the phone. Share Extension review and in-app review screenshots.",
    },
    previewFigure: {
      src: "/images/spendrop/share-flow.png",
      alt: "Three iPhone screenshots of SpenDrop: the dashboard with today, week and month totals; the iOS share sheet with SpenDrop in the app row; and the Share Extension's review form showing Payment Detected, RM 18.50, McDonald's, Food, Touch 'n Go.",
      width: 1600,
      height: 1200,
      caption: "Dashboard, the share sheet, and the extension's filled-in review. iPhone 17 simulator, synthetic data.",
    },
    sections: [
      {
        heading: "Overview",
        body: [
          "Most everyday payments in Malaysia now end with a confirmation screen: Touch 'n Go, a bank app, DuitNow QR, Apple Pay. SpenDrop turns that screen into an expense. Take a screenshot, share it to SpenDrop, check the form it fills in, and save. Cash spending goes in by hand with Quick Cash.",
          "It is a native iOS app with a Share Extension, written in Swift and SwiftUI with SwiftData for storage and Apple's Vision framework for OCR. Everything runs on the phone: there is no server, no networking code and no third-party package. It runs on the simulator and on the developer's iPhone; it is not on the App Store.",
        ],
        figures: [
          {
            src: "/images/spendrop/share-flow.png",
            alt: "Three iPhone screenshots of SpenDrop: the dashboard with today, week and month totals and provider-tagged rows; the iOS share sheet with SpenDrop in the app row; and the Share Extension review form showing Payment Detected, RM 18.50, paid to McDonald's, category Food, payment Touch 'n Go, 16 September 2026.",
            width: 1600,
            height: 1200,
            caption: "From dashboard to share sheet to a filled-in expense. Real app on an iPhone 17 simulator; the shared screenshot is synthetic.",
          },
        ],
      },
      {
        heading: "Problem",
        body: [
          "Expense apps ask you to type what your phone already shows you. The payment screen has the amount, the merchant, the provider and a reference number, but copying them by hand is slow enough that most people stop doing it. And a payment confirmation is financial data: sending it to a server to be read is a poor trade for convenience.",
        ],
      },
      {
        heading: "From screenshot to expense",
        body: [
          "The Share Extension receives the image from any app's share sheet. Vision reads the text on the phone, on an image downsampled to 1280 pixels to stay inside the extension's memory limit, and the lines are sorted into rows. A rule-based parser then works out what the screen is: which provider, which merchant, which category, the date and time, and the reference number. The extension shows the result as a review form; nothing is saved until the user confirms.",
          "The app and the extension are two separate processes, so they share one SwiftData store through an App Group. An expense saved from the share sheet is on the dashboard the next time the app opens, and the duplicate check in the extension can see everything the app has saved.",
        ],
        figures: [
          {
            src: "/images/spendrop/architecture.png",
            alt: "Architecture diagram: the Share Extension and the app both feed a shared on-device engine of Vision OCR, amount candidate classification, provider and merchant detection, a duplicate detector and a review screen, which saves to an App Group SwiftData store read by the dashboard, analytics and PayBook.",
            width: 1600,
            height: 900,
            caption: "Two targets compile the same engine and share one store. No server and no network calls.",
            wide: true,
          },
        ],
      },
      {
        heading: "Choosing the right amount",
        body: [
          "A payment screen rarely has one number on it. A Touch 'n Go confirmation can carry an advert for an RM 450 air conditioner under an RM 18.50 payment; a receipt lists a subtotal, a service charge and a total; a bank screen shows the balance. The parser labels every RM value it finds (total, fee, balance, cashback, discount, advertisement) and chooses from the valid candidates only. When several remain, the review form shows them as one-tap alternatives; when one remains, the row is hidden.",
          "Screens that are not payments at all, such as a balance, a credit limit or reward points, are recognised and are not saved as expenses, or are flagged for review. Sharing the same screenshot twice is caught by its reference number, or by the same merchant and amount on the same day within a 48-hour window, and the user decides whether to add it anyway.",
        ],
        figures: [
          {
            src: "/images/spendrop/parsing.png",
            alt: "Three iPhone screenshots: a receipt review with RM 19.08 selected as the total and other amounts offered as possible amounts; the Touch 'n Go review with RM 18.50 chosen and no advertisement price offered; and a Possible Duplicate Expense alert for the same transaction reference with Cancel and Add Anyway.",
            width: 1600,
            height: 1200,
            caption: "The total wins and the alternatives stay one tap away; the advert's RM 450 is never offered; a repeated share is caught.",
          },
        ],
      },
      {
        heading: "The rest of the app",
        body: [
          "Around capture sits a small expense app: a dashboard with today, week and month totals, a searchable and filterable history with edit and delete, analytics by category and payment source built with Swift Charts, and PayBook, a list of frequent bank-transfer payees with account numbers masked by default and a one-tap copy. A settings screen includes a self-test runner that executes the app's 48 parser and persistence checks on the device.",
        ],
        figures: [
          {
            src: "/images/spendrop/app.png",
            alt: "Three iPhone screenshots: analytics with a category donut chart and top category and payment source; the in-app test runner reporting All Tests Passed 48 of 48; and PayBook listing payees with masked account numbers.",
            width: 1600,
            height: 1200,
            caption: "Analytics, the in-app test run (48 of 48), and PayBook with masked account numbers.",
          },
        ],
      },
      {
        heading: "What went wrong, and what it taught",
        body: [
          "Adverts looked like payments. A Touch 'n Go confirmation can show an RM 450 air-conditioner banner under an RM 22.00 transfer, and any pattern for an RM amount matches both. The fix gives every amount a meaning before any is chosen: advertisement keywords, the words on neighbouring lines, and position, using Vision's bounding boxes, since adverts sit in the bottom of the screen. Layout turned out to be a stronger signal than the text alone.",
          "Interbank transfers name two banks. A CIMB to Maybank receipt mentions both, and the expense belongs to CIMB. Keyword matching alone was ambiguous, so the parser now reads the screen as a document: it collects the banks named after a recipient label first, then reads the from-block, and never attributes a payment to a bank that only appears as the recipient. Apple Pay is treated the same way, as a wrapper around the bank behind it.",
          "Column-aligned receipts still break it. On a synthetic receipt with the label and the amount far apart, Vision returned \"TOTAL\" and \"RM 19.08\" as separate observations, the total lost its label, and a line item won. The review screen correctly downgraded to \"Possible Expense Detected\", and the case is recorded as a known limitation rather than hidden.",
        ],
      },
      {
        heading: "Testing and verification",
        body: [
          "The app carries its own test runner: 48 cases covering provider and merchant parsing, amount selection, false positives, duplicates and persistence, provider detection, ten reference screenshots from real layouts, and PayBook. The repository records a run on 25 September 2026 on an iPhone 17 simulator with iOS 27: both targets built and 48 of 48 passed. The suite feeds synthetic OCR text, so it tests the parser, not Vision's recognition quality.",
          "For this write-up the source was checked directly: 42 Swift files, two targets (app and extension), 48 registered test cases, and no networking code. The tests were not re-run here because the machine used runs Windows. There is no XCTest target and no CI.",
        ],
        note: "Every screenshot on this page is from the real app on a simulator. The payment screenshot and the receipt it reads are synthetic images made for testing; PayBook shows the app's built-in sample payees.",
      },
    ],
    status: [
      {
        label: "Capture, parsing, review, duplicates, history, analytics, PayBook",
        state: "available",
        detail: "Working on the simulator and, per the repository, on the developer's iPhone. Not published on the App Store or TestFlight.",
      },
      {
        label: "In-app test suite",
        state: "available",
        detail: "48 of 48 recorded on 25 September 2026; not re-run for this write-up.",
      },
      {
        label: "Camera capture, currency setting, CI",
        state: "not-connected",
        detail: "Not implemented yet: capture is from screenshots and Photos, and all amounts are in RM.",
      },
    ],
    limitations: [
      "The parser is keyword-driven: an unfamiliar layout falls back to \"Unknown\" with low confidence.",
      "Column-aligned paper receipts can lose the label on the total, so a line item may be proposed instead.",
      "One synthetic screenshot read 9:42 PM as 9:42 AM.",
      "Save errors are swallowed rather than shown, and deleting an expense leaves its receipt image on disk.",
      "The extension's diagnostic log is not size-capped and contains transaction details.",
      "iPhone only, portrait only, English only; no XCTest target and no CI.",
      "The repository is private. Access can be granted on request.",
    ],
    roadmap: [
      "Report save errors instead of swallowing them",
      "Cap the diagnostic log and keep it to debug builds",
      "An XCTest target around the parser suite, run in CI",
      "Camera capture and the currency setting",
      "Delete receipt images with their expenses",
    ],
    links: [
      {
        label: "GitHub profile (SpenDrop repository is private)",
        href: "https://github.com/tirukon015",
        external: true,
      },
    ],
  },
];

/**
 * Work that has a name but no case study yet.
 *
 * These are listed after the projects with write-ups so the hierarchy is
 * visible now and each one can be promoted to a full `Project` entry later.
 * Nothing here is described beyond its name until there is verified content
 * to describe it with.
 */
export type WorkListItem = {
  name: string;
  summary?: string;
  meta?: string;
  href?: string;
  external?: boolean;
};

export type UpcomingProject = {
  slug: string;
  name: string;
  category: ProjectCategory;
  categorySlug: ProjectCategorySlug;
  categories: ProjectCategory[];
  valueProposition: string;
  role: string;
  context: string;
  highlights: string[];
  technologies: string[];
  status: "In Progress" | "Planned";
};

export const upcomingProjects: UpcomingProject[] = [
];

export const upcomingWork: WorkListItem[] = [
];

export type ProjectCategoryInfo = {
  name: ProjectCategory;
  slug: ProjectCategorySlug | "all";
  label: string;
  description: string;
};

export const projectCategories: ProjectCategoryInfo[] = [
  {
    name: "Systems / ERP / WMS",
    slug: "systems",
    label: "Systems / ERP / WMS",
    description: "Operational platforms, warehouse & manufacturing logic, automation, and real-world workflow systems.",
  },
  {
    name: "Web Apps / Software",
    slug: "web-apps",
    label: "Web Apps / Software",
    description: "Full-stack software applications, API integrations, data isolation, and AI-assisted workflows.",
  },
  {
    name: "Websites",
    slug: "websites",
    label: "Websites",
    description: "High-performance production websites, design-to-code implementations, and technical SEO.",
  },
  {
    name: "iOS / Mobile",
    slug: "ios-mobile",
    label: "iOS / Mobile",
    description: "Native mobile applications, on-device intelligence, and offline-first mobile tools.",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByTier(tier: ProjectTier) {
  return projects.filter((p) => p.tier === tier);
}

export function getOtherProjects(slug: string) {
  return projects.filter((p) => p.slug !== slug);
}

export function getProjectsByCategory(categorySlug: string) {
  if (!categorySlug || categorySlug === "all") return projects;
  const cat = projectCategories.find((c) => c.slug === categorySlug);
  if (!cat) return projects;
  return projects.filter((p) => p.categorySlug === categorySlug || p.categories.includes(cat.name));
}

export function getUpcomingProjectsByCategory(categorySlug: string) {
  if (!categorySlug || categorySlug === "all") return upcomingProjects;
  const cat = projectCategories.find((c) => c.slug === categorySlug);
  if (!cat) return upcomingProjects;
  return upcomingProjects.filter((p) => p.categorySlug === categorySlug || p.categories.includes(cat.name));
}

