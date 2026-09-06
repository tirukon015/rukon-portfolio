export type CaseStudySection = {
  heading: string;
  body: string[];
  /**
   * Optional caveat rendered beneath the section. Used to keep a claim
   * honest in place rather than qualifying it in a footnote nobody reads.
   */
  note?: string;
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

export type ProjectKind = "professional" | "personal-project" | "group-project";

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
  kind: ProjectKind;
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
    tagline: "A real-world WMS/ERP-like operational system running a live production line.",
    summary:
      "A WMS/ERP-style operational system that replaced the spreadsheets running a router-refurbishment line. Serial-level asset tracking, inventory deduction, packing, delivery and generated paperwork, workforce output and dashboards. Designed, built and maintained by me: 35,800 lines of TypeScript, ten admin modules, twenty-five API routes.",
    role: "IT Systems & Operations Lead, RPOMS",
    period: "2026 (ongoing)",
    affiliation: "Blue Bee Technologies Sdn. Bhd., ERTH × Maxis programme",
    confidential: true,
    kind: "professional",
    tech: [
      "Next.js 15 (App Router)",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "PostgreSQL / Supabase",
      "MySQL",
      "Zod",
      "TanStack Table",
      "Recharts",
      "ExcelJS / jsPDF",
    ],
    techGroups: [
      {
        label: "Application",
        items: ["Next.js 15 (App Router)", "React 19", "TypeScript", "Tailwind CSS v4"],
      },
      {
        label: "Data & persistence",
        items: ["PostgreSQL (Supabase)", "MySQL", "Local file store", "Zod"],
      },
      {
        label: "Interface & reporting",
        items: ["TanStack Table", "Recharts", "React Hook Form", "date-fns"],
      },
      {
        label: "Documents & import/export",
        items: ["ExcelJS", "JSZip", "jsPDF", "Papa Parse"],
      },
      {
        label: "Platform",
        items: ["Vercel", "cPanel", "Node.js", "Custom i18n (en / ar, RTL)"],
      },
    ],
    highlights: [
      "Covers the operational chain end to end: asset intake, inventory, production stages, packing, delivery and reporting, in one system",
      "Serial-level traceability from intake through packing to a delivered box, so any unit can be accounted for after the fact",
      "Consumable stock (chargers, LAN cables, packaging) deducts from the production figures entered once, rather than being counted a second time by hand",
      "One storage interface with three interchangeable backends, chosen by which environment variables are present",
      "Three access tiers with server-side enforcement, HMAC-signed sessions, and no default passwords",
      "Serial-level registry with configurable detection rules, so a new router model does not need a release",
      "Delivery paperwork generated from the operations team's own Word document rather than redrawn",
      "A day boundary resolved in Malaysian time, so a morning delivery cannot file itself under yesterday",
      "Built and maintained by the same person who works with the production line it supports",
    ],
    workflow: [
      "Unit arrives",
      "Accepted into the registry (by serial number)",
      "Cleaned",
      "Packed into a numbered box",
      "Delivered with matching paperwork",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "RPOMS is an internal WMS/ERP-style operational system built for a router-refurbishment programme that Blue Bee Technologies runs in partnership with ERTH and Maxis. Before RPOMS, the operation was coordinated through spreadsheets. RPOMS models the whole path a unit takes, arriving, accepted, cleaned, packed into a numbered box, and delivered with the paperwork that goes with it, as one system.",
          "The comparison to a warehouse or resource-planning system is about shape rather than scale. It is not a commercial ERP suite and does not try to be one: there is no finance, procurement or HR module. What it shares with that category is the structure, a single operational data model that inventory, production, delivery, workforce and reporting all read from, so a figure on a dashboard traces back to the event that produced it.",
          "It runs to roughly 35,800 lines of TypeScript, across ten admin modules, twenty-five API route handlers, a viewer-gated monitoring dashboard, and a storage layer with three interchangeable backends.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A physical production line (intake, cleaning, packing, delivery) was being coordinated through spreadsheets shared across a team. That made it hard to know, at any moment, what had actually happened on the floor: what stock remained, who did what, whether a delivery matched what was scanned, or whether a report was still current.",
          "Spreadsheets do not validate. They have no single source of truth once someone keeps a private copy to be safe, and no audit trail once a number looks wrong. On a line where the count on the shelf has to match the count in the file, those are not inconveniences.",
        ],
      },
      {
        heading: "Context",
        body: [
          "The programme refurbishes routers returned from the field and returns them to service. That is a different problem from manufacturing: the units arrive in unknown condition, in unpredictable quantities, and each one has a serial number the system does not get to choose.",
          "The operation runs on a physical floor in Malaysia, with a small team, a shared set of consumables, and delivery paperwork a customer already expects in a particular format. Those constraints shaped the software more than any specification did.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "I work as IT Systems & Operations Lead around RPOMS, which means the role is not only writing the software. I designed and built the system end to end: the data model, access control, every module, and the deployment path to production. I remain its maintainer.",
          "I also work directly with the operational side it supports: the production line, the stock it consumes, and the people running it day to day. That combination is the point. RPOMS models a physical process closely enough to run it, which only works if the person building it understands the process and not just the schema behind it.",
        ],
      },
      {
        heading: "Engineering Approach",
        body: [
          "The rule throughout was that the software should fail in the safe direction. A missing password disables that login tier rather than falling back to a known value. A missing session secret stops the application in production rather than signing cookies with a development key. A missing deployment flag leaves production locked rather than silently live.",
          "The second rule was that a number should be traceable. Stock is derived from the full history of adjustments and consumption rather than stored as a running total, so a figure that looks wrong can be walked back to the day that produced it. Reporting compares against a target, a prior day, an average or a custom range, because a comparison supports a decision and a raw count does not.",
          "The third rule was that business rules belong in one place. The arithmetic that decides how many packaging boxes a day's output consumes lives in a single module that both the confirmation dialog and the dashboard call, specifically so the two can never disagree about the same day.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "One storage interface, three backends, selected automatically by which environment variables are present: PostgreSQL via Supabase when a connection string is set, MySQL when the cPanel database variables are set, and a local file store otherwise. Nothing in the interface or the API changes between them, and a fresh deployment needs no migration step because tables and indexes are created on demand.",
          "The Postgres client connects through the Supabase transaction pooler, which means prepared statements are disabled, because PgBouncer transaction pooling does not support them. The connection pool is sized against pages that ask several questions at once rather than against a single query.",
          "Every read runs under a deadline. A query that blocks on a lock or a closed connection used to hold the page on its loading state indefinitely; reads now give up and let the page render without them. Where a fallback would be dishonest, an empty report meaning 'no report exists for that day' rather than 'the read failed', the caller receives a distinct value instead and decides for itself what an unanswered read means.",
          "A single middleware sits in front of every request. It applies baseline security headers, and while the deployment lock is on it turns away anything that would write. That is one chokepoint rather than a check per route, so an endpoint added later is covered the moment it exists. Authentication is deliberately enforced separately, in the route, so the sign-in gate stays the single source of truth.",
        ],
      },
      {
        heading: "Key Features",
        body: [
          "Daily Production Report: the day's figures entered once. Saving updates the monitoring dashboard and deducts stock in the same step: routers by accepted plus retired, chargers and cables by packaging volume. Targets and batch figures carry over from the previous report, so a batch's progress is continuous rather than restarting each day.",
          "Serial Registry: every unit by serial number, with who accepted it and when. Serial format is validated against configurable detection rules stored as data, with longer prefixes tried first so a specific rule beats a general one. Duplicate keys are compared case-insensitively, matching the behaviour of the spreadsheet the registry replaced.",
          "Staged CSV import: both the registry and the daily report can be populated from a file, and the file is parsed and previewed before anything is written. Duplicates are surfaced for a row-by-row decision rather than discovered afterwards, which is the difference between an import someone trusts and one they re-check by hand.",
          "Packing and Delivery: serials are scanned into numbered boxes, and a box reports its own problems rather than leaving them to be discovered later. A delivery cannot be saved unless the scanned load matches the quantity it was raised for.",
          "Delivery Orders: generated from the office's own Word document with the details filled in, not redrawn. Word distributes a line of text across several runs, so a placeholder can be split in one place and intact in another; the generator does two passes for exactly that reason. Tracker lists export to Excel in the format the customer's sheet expects.",
          "Workforce: per-person output against per-person targets. Names are matched case-insensitively, and the spelling displayed is the one the office uses most often rather than an invented capitalisation.",
          "Dashboard: auto-refreshing daily figures, batch progress, inventory balance, a production trend chart, and comparison against yesterday, a seven-day average, last week or a custom range. Published in English and Arabic, with Arabic rendered right to left.",
        ],
      },
      {
        heading: "Technical Decisions",
        body: [
          "Three access tiers, each with its own credentials. A tier whose password is not configured is switched off entirely: the login cannot succeed by any value. Sessions are a cookie carrying the role and an HMAC-SHA256 signature over it, compared with a timing-safe function, marked httpOnly and sameSite, and secure in production. An NDA viewer's session lapses after twenty-four hours; an admin's lasts seven days.",
          "Consumable packaging is not calculated with a ceiling function. One big box per ten packaged units, plus one more once the remainder reaches seven, because a box near enough to full has already been opened and sent, while a smaller remainder will be finished by the next day's work and would otherwise be counted twice.",
          "The business day is resolved in Asia/Kuala_Lumpur rather than from the server clock. A deployed server keeps UTC, which would not turn the day over until eight in the morning locally, long enough for a morning delivery to file itself under the previous day.",
          "Translations are typed against English as the source, so a string added in English fails the build until every other dictionary supplies it. A language cannot go half-translated without anyone noticing.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "The Daily Production Report is live and in daily use: the day's figures are entered for real, stock is deducted for real, and the monitoring dashboard reads back what was saved.",
          "The registry, packing, delivery, workforce and inventory modules are complete and render live data, but they sit behind a deployment-level write lock while the programme works through sign-off. That was a deliberate choice: the lock is enforced at one middleware chokepoint, defaults to on in production, and names the modules that are allowed to write, so a module goes live by being named rather than by accident.",
        ],
      },
    ],
    status: [
      {
        label: "Daily Production Report",
        state: "implemented",
        detail: "Live in production. Writes report data and deducts stock in the same step.",
      },
      {
        label: "Monitoring dashboard",
        state: "implemented",
        detail: "Live. Reading is never blocked, so every figure and chart renders from real data.",
      },
      {
        label: "Serial registry, packing, delivery, workforce, inventory",
        state: "available",
        detail:
          "Complete and rendering live data, held behind a deployment-level write lock pending programme sign-off.",
      },
      {
        label: "Automated test suite",
        state: "not-connected",
        detail:
          "No test suite exists for RPOMS. Correctness is currently gated by build, typecheck and lint on each change, recorded per milestone. Tests are on the project's own backlog.",
      },
    ],
    limitations: [
      "No automated tests. Verification is a manual build, typecheck and lint gate recorded per milestone.",
      "Only the dashboard is translated; the admin panel is English-only.",
      "Employees and workforce rows are matched by name rather than linked by ID.",
      "Navigation still differs by access tier, which reveals that a higher tier exists. Blocked actions themselves never name it.",
    ],
    image: {
      src: "/images/rpoms-mark.png",
      srcDark: "/images/rpoms-mark-dark.png",
      alt: "RPOMS wordmark",
      variant: "mark",
    },
  },

  {
    slug: "erth",
    name: "ERTH",
    fullName: "ERTH: production homepage, technical SEO and GEO implementation",
    tagline: "A design-tool prototype rebuilt as a production website that ships 3.7 kB of JavaScript.",
    summary:
      "The production website for a Malaysian e-waste collection service. Prototyped in Figma, then built from the approved design as static HTML, CSS and vanilla JavaScript: 250 kB of prototype JavaScript down to 3.7 kB, images 12.0 MB down to 2.7 MB, full technical SEO and structured data added. Complete and deployed.",
    role: "UI/UX and Web Developer: design prototyping, production build, technical SEO",
    period: "2026 (completed)",
    affiliation: "ERTH",
    confidential: false,
    kind: "professional",
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
        items: ["HTML5", "CSS3", "Vanilla JavaScript", "Semantic HTML", "Responsive CSS", "Vite 7"],
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
          "ERTH is a Malaysian e-waste collection and rewards service operated by Blue Bee Technologies: doorstep pickup, free shipping through Pos Malaysia, a 24/7 drop-off point in Cyberjaya, and cashless rewards. The site is a single long-form homepage covering pickup, rewards and pricing, what ERTH accepts, business services, service areas, drop-off options, the recycling process, press coverage, FAQ and contact.",
          "The engagement ran in two phases. First, the interface was worked out as an interactive Figma prototype. Then the client approved a design file as final, and the production website was built from it: 1,076 lines of markup, 534 lines of CSS and 228 lines of JavaScript, bundled by Vite and deployed on Vercel. That build is complete and live.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A recycling and trade-in service depends on people trusting it enough to hand over a device and the data on it. The page has to make the process, the pricing, the eligibility rules and the handling of personal data legible before someone commits to anything.",
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
          "Both phases, and they are different kinds of work. The interface was worked out as an interactive Figma prototype before implementation, covering page structure, visual direction and the user flow from choosing a device through to payout.",
          "The second phase is the production build: extracting the assets from the approved bundle, rebuilding the page as static files, fixing the defects the prototype carried, and implementing the technical SEO, structured data, performance and accessibility work. That half was mine end to end, including the deployment configuration.",
        ],
        note:
          "The Figma prototype is a shared working file rather than a solo artefact, so this describes design and prototyping involvement and the translation into production, not sole authorship of the design.",
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
      "An AI research assistant that reads an academic PDF and returns a summary, a gap analysis carrying its own evidence, and a literature review, declining rather than inventing where the paper does not support a section. Python and FastAPI behind a Next.js frontend, with accounts and per-user isolation enforced in PostgreSQL. A five-person university group project.",
    role: "Developer: backend, deployment, data isolation and testing",
    period: "2026",
    affiliation: "University of Cyberjaya, BIT4543 Artificial Intelligence (five-person group project)",
    confidential: false,
    kind: "group-project",
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
          "ResearchForge was built for BIT4543 Artificial Intelligence at the University of Cyberjaya, by a group of five. The system was designed, implemented, deployed and tested by the project group, and the report records results from running the deployed system rather than estimates.",
          "It began as a stateless tool with no accounts, which kept the first version defensible while there was nothing stored to protect. Adding a library meant that stopped being true, so authentication, per-user ownership and database-level access control went in together rather than being retrofitted around a feature that had already shipped.",
        ],
        note:
          "A five-person group project. This case study describes the work and the system rather than claiming sole authorship; the areas listed under the role above are the ones I carried, and the deployment and repository are mine.",
      },
      {
        heading: "Engineering Approach",
        body: [
          "The founding principle is that every claim must be grounded in the uploaded paper, and it is enforced in four layers rather than requested once in a prompt. The prompt requires it, and the prompts live in version-controlled files rather than scattered through the code. The response schema carries explicit insufficient-evidence fields, giving the model a way to decline that is as easy as complying. Every reply is validated against that schema on return. And output that fails validation is discarded rather than repaired, which is the rule that makes the other three mean anything: a partially valid analysis that the system patched up would be an invented analysis.",
          "Structured output is the mechanism, not a convenience. Each response model is converted to a JSON Schema and handed to the model as the required output format, with additional properties forbidden. Every reply is validated on return, and a truncated or malformed answer is refused outright rather than partially rendered.",
          "The three analyses run as three separate model calls. They are different tasks with different evidence rules, so separating them means a failure in one does not corrupt the others, and each can be improved on its own. They run sequentially on purpose: running them in parallel would multiply the peak rate-limit burden for a latency win that does not matter on a single upload.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "One Vercel project runs two services. A Next.js frontend serves everything except the API, and a FastAPI backend serves /health and /api/*, with routing declared in the project configuration. Because both share one origin, the frontend calls the API with a relative path, which is what makes the custom domain, the .vercel.app domain and every preview URL work from the same build.",
          "Generation sits behind a provider interface. The analysis service depends on that interface and never on a vendor SDK, each vendor's SDK is imported only inside its own provider module, and the concrete provider is built by a factory with a local import so adding one never forces every caller to import every SDK. An earlier version used Google Gemini; it is a historical provider only and produces none of the current analyses.",
          "Vendor errors are wrapped in project-owned exception types, with a missing API key separated out from the rest because it is a deployment problem rather than a user's fault and maps to a different status code. Status codes are chosen so the frontend can tell the cases apart without parsing message text: too large, unusable PDF, unusable model reply, no credentials configured. Nothing expected returns a 500.",
        ],
      },
      {
        heading: "Providers and fallback",
        body: [
          "The owner picks which of the two providers is primary, and the other automatically becomes the fallback. Groq running qwen3.6-27b is the configured primary; Anthropic claude-opus-5 is the fallback. There is no per-user model picker: the choice is an operational one, made once, and the interface does not pretend otherwise.",
          "Availability is enforced when the router is constructed rather than checked at call time, so a provider that has been switched off is never built and no code path can reach it.",
          "Fallback is deliberately narrow. It fires once per analysis, and only for a rate limit or a temporary provider failure, checked against a whitelist so a new error type does not become retryable by default. It does not fire for a malformed PDF, a schema validation failure or a missing key, because those fail identically on either vendor and retrying them just spends a second vendor's quota to produce the same error more slowly.",
          "One switch per analysis, not per call. An analysis makes at least three calls, and allowing each to fail over independently would let different sections be written by different models, which makes the recorded model identity meaningless.",
          "Every stored analysis records which provider and model actually produced it, whether the fallback was used, and how long the call took. Without that, a result whose quality looks off has no explanation attached to it, and 'which model wrote this' becomes unanswerable a week later.",
        ],
      },
      {
        heading: "Accounts and data ownership",
        body: [
          "Authentication is Supabase Auth: email and password with sign-up, sign-in, forgot-password and reset flows, plus Google sign-in completing at a dedicated callback route. Passwords never reach the ResearchForge database.",
          "Every paper, analysis and review belongs to exactly one account, and that is enforced by Postgres Row Level Security rather than by a filter in the API layer. The distinction matters: an interface check is a convention that the next endpoint can forget, and a row-level policy is a rule the database applies whether or not the query remembered to.",
          "Re-uploading a paper that has already been analysed reuses the stored analysis instead of paying for it again. Identity is a content hash of the extracted text, not the filename, so the same paper saved under a different name still matches.",
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
    ],
    links: [
      { label: "Live application", href: "https://researchforge.rukon.dev", external: true },
      { label: "Source on GitHub", href: "https://github.com/tirukon015/researchforge", external: true },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getOtherProjects(slug: string) {
  return projects.filter((p) => p.slug !== slug);
}
