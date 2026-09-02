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

export type ProjectKind = "professional" | "personal-project";

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
    tagline: "The system built to run a router-refurbishment production line.",
    summary:
      "A production-operations platform built for a router-refurbishment programme run by Blue Bee Technologies, covering every stage a unit passes through, from intake to delivery. Around 35,800 lines of TypeScript across ten admin modules and twenty-five API routes.",
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
          "RPOMS is an internal operations system built for a router-refurbishment programme that Blue Bee Technologies runs in partnership with ERTH and Maxis. Before RPOMS, the operation was coordinated through spreadsheets. RPOMS models the whole path a unit takes, arriving, accepted, cleaned, packed into a numbered box, and delivered with the paperwork that goes with it, as one system.",
          "It runs to roughly 35,800 lines of TypeScript, across ten admin modules, twenty-five API route handlers, a public monitoring dashboard, and a storage layer with three interchangeable backends.",
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
          "Daily Production Report: the day's figures entered once. Saving updates the public dashboard and deducts stock in the same step: routers by accepted plus retired, chargers and cables by packaging volume. Targets and batch figures carry over from the previous report, so a batch's progress is continuous rather than restarting each day.",
          "Serial Registry: every unit by serial number, with who accepted it and when. Serial format is validated against configurable detection rules stored as data, with longer prefixes tried first so a specific rule beats a general one. Duplicate keys are compared case-insensitively, matching the behaviour of the spreadsheet the registry replaced.",
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
      alt: "RPOMS wordmark",
      variant: "mark",
    },
  },

  {
    slug: "researchforge",
    name: "ResearchForge",
    fullName: "ResearchForge: AI research paper assistant",
    tagline: "An AI research assistant built to say when the paper doesn't support the answer.",
    summary:
      "Upload an academic PDF and get a structured summary, a research-gap analysis where every gap carries the evidence it rests on, and a literature review scoped to the prior work the paper itself discusses. A Python/FastAPI backend and a Next.js frontend deployed as one project behind a single origin.",
    role: "Designer & developer",
    period: "2026",
    affiliation: "Independent project",
    confidential: false,
    kind: "personal-project",
    tech: [
      "Python 3.12",
      "FastAPI",
      "Pydantic",
      "Next.js 16 (App Router)",
      "React 19",
      "TypeScript",
      "Google Gemini",
      "Anthropic",
      "pypdf",
      "pytest",
    ],
    techGroups: [
      {
        label: "Backend",
        items: ["Python 3.12", "FastAPI", "Pydantic", "pydantic-settings", "uvicorn"],
      },
      {
        label: "Frontend",
        items: ["Next.js 16 (App Router)", "React 19", "TypeScript (strict)", "Plain CSS"],
      },
      {
        label: "AI",
        items: ["Google Gemini", "Anthropic", "Schema-constrained structured output"],
      },
      {
        label: "Documents",
        items: ["pypdf", "Conditional chunking", "Signature and encryption checks"],
      },
      {
        label: "Quality & platform",
        items: ["pytest", "ruff", "mypy config", "Vercel (multi-service, one origin)"],
      },
    ],
    highlights: [
      "Every claim must be grounded in the uploaded paper, enforced in the prompt, the response schema, and the interface",
      "A provider abstraction over Gemini and Anthropic, so switching vendors is one environment variable",
      "186 offline tests: model calls are replaced by a fake provider, so no test touches the network or spends a token",
      "Two runtimes behind one origin, so the custom domain and every preview URL work from the same build",
      "The model tier was chosen to fit a 300-second function ceiling, not from a benchmark table",
      "What it cannot do is published on the site, not buried in a README",
    ],
    workflow: [
      "Upload a PDF",
      "Validate and extract",
      "Analyse",
      "Read the structured result",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "ResearchForge reads an academic PDF and produces three things: a structured summary covering the research problem, methodology, key findings and conclusion; a research-gap analysis where each gap is shown alongside the wording in the paper that supports calling it a gap; and a literature review of the prior work the paper itself discusses.",
          "It is deployed on its own subdomain as a single Vercel project running two services behind one origin.",
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
          "This is an independent project, built to work through a problem properly rather than to serve a client: what does it actually take to ship an LLM feature that behaves honestly under real platform constraints?",
          "That framing shaped the scope. It stores nothing, has no accounts, and says so on screen. Those are defensible for a stateless analysis tool and would not be for a product.",
        ],
      },
      {
        heading: "Engineering Approach",
        body: [
          "The founding principle is that every claim must be grounded in the uploaded paper, and it is enforced in three separate places rather than requested once in a prompt. The system prompt states it. The response schema carries fields the model uses to decline, a list naming any section the paper did not support, and a boolean plus explanation where a whole analysis cannot be grounded. The interface prints those fields rather than hiding them.",
          "Structured output is the mechanism, not a convenience. Each response model is converted to a JSON Schema and handed to the model as the required output format, with additional properties forbidden. Every reply is validated on return, and a truncated or malformed answer is refused outright rather than partially rendered.",
          "The three analyses run as three separate model calls. They are different tasks with different evidence rules, so separating them means a failure in one does not corrupt the others, and each can be improved on its own. They run sequentially on purpose: running them in parallel would multiply the peak rate-limit burden for a latency win that does not matter on a single upload.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "One Vercel project runs two services. A Next.js frontend serves everything except the API, and a FastAPI backend serves /health and /api/*, with routing declared in the project configuration. Because both share one origin, the frontend calls the API with a relative path, which is what makes the custom domain, the .vercel.app domain and every preview URL work from the same build.",
          "Generation sits behind a provider interface. The analysis service depends on that interface and never on a vendor SDK, each vendor's SDK is imported only inside its own provider module, and the concrete provider is built by a factory with a local import so adding one never forces every caller to import every SDK. Switching vendors is one environment variable; adding one is a single new file.",
          "Vendor errors are wrapped in project-owned exception types, with a missing API key separated out from the rest because it is a deployment problem rather than a user's fault and maps to a different status code. Status codes are chosen so the frontend can tell the cases apart without parsing message text: too large, unusable PDF, unusable model reply, no credentials configured. Nothing expected returns a 500.",
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
          "186 offline tests, run with pytest. The suite never touches the network and never spends a token: the model provider is replaced by an offline fake through FastAPI's dependency-override mechanism, which is the practical reason the endpoint takes its provider as a dependency rather than constructing one.",
          "Coverage spans the analysis pipeline, both LLM providers, the library schemas, the repository implementation against a mock, the embedding request construction, and the backend foundation. Linting is ruff; a mypy configuration is present.",
        ],
      },
      {
        heading: "Technical Decisions",
        body: [
          "The model tier was chosen against a platform constraint rather than a benchmark. A Vercel function has a 300-second ceiling, and three sequential schema-constrained calls have to complete inside it. A deeper-reasoning model is one environment variable away with no code change.",
          "pypdf was chosen over faster alternatives on licensing. The fastest option ships native binaries and is AGPL, which is incompatible with an MIT repository intended to be read publicly. Only one function touches the library, so swapping it later is a one-function change.",
          "The application is stateless by choice, and that choice is what makes the absence of authentication and rate limiting defensible rather than negligent: there is nothing stored to protect.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "A working, deployed application that does what it says and states what it does not do. The analysis path is complete and in use; the persistence and retrieval layers are written and tested but not connected, and both the interface and the documentation say so rather than implying otherwise.",
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
        label: "Provider abstraction (Gemini, Anthropic)",
        state: "implemented",
        detail: "Both providers implemented behind one interface. Gemini is the configured default.",
      },
      {
        label: "Conditional chunking for long papers",
        state: "implemented",
        detail: "Whole-document by default; map-reduce only above a configured character threshold.",
      },
      {
        label: "Research library and cross-paper review",
        state: "available",
        detail:
          "Pages, API routes, repository, schemas and prompt are written and tested. Without a connected database every route answers 503 rather than pretending the library is empty.",
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
      {
        label: "Database (Supabase / pgvector)",
        state: "not-connected",
        detail:
          "Migrations, a storage-independent repository and a Supabase implementation exist and are tested against a mock. No project is connected and nothing is persisted.",
      },
    ],
    limitations: [
      "Nothing is saved. Reloading the tab discards the analysis.",
      "No OCR, so scanned papers with no text layer are rejected rather than processed.",
      "The literature review covers only the prior work one paper discusses. It does not search a corpus.",
      "No authentication and no rate limiting. Acceptable only while the application stores nothing.",
      "Papers are identified by filename: bibliographic metadata extraction is not implemented.",
    ],
    links: [
      { label: "Live application", href: "https://researchforge.rukon.dev", external: true },
    ],
  },

  {
    slug: "erth",
    name: "ERTH",
    fullName: "ERTH: homepage requirements, SEO and GEO implementation",
    tagline: "Meeting a page of SEO requirements without redesigning the page.",
    summary:
      "Homepage development for ERTH, a Malaysian e-waste collection and rewards service, worked from a supplied requirements document. A content, technical-SEO and AI-search-readability update delivered on the existing production design rather than a redesign.",
    role: "UI/UX and Web Developer: design prototyping, requirements implementation, technical SEO",
    period: "2026",
    affiliation: "ERTH",
    confidential: false,
    kind: "professional",
    tech: [
      "Figma",
      "HTML5",
      "CSS3",
      "JavaScript",
      "Semantic HTML",
      "Schema.org JSON-LD",
      "Open Graph",
      "Responsive CSS",
    ],
    techGroups: [
      {
        label: "Design & prototyping",
        items: ["Figma", "Interactive prototype", "Component vocabulary"],
      },
      {
        label: "Implementation",
        items: ["HTML5", "CSS3", "JavaScript", "Semantic HTML", "Responsive CSS"],
      },
      {
        label: "Search & structured data",
        items: [
          "Schema.org JSON-LD",
          "Organization / RecyclingCenter",
          "FAQPage",
          "Open Graph",
          "Twitter cards",
          "Canonical URLs",
        ],
      },
      {
        label: "Method",
        items: [
          "Requirements compliance matrix",
          "Contradiction register",
          "Scoped change levels",
          "Answerability testing",
        ],
      },
    ],
    highlights: [
      "Interface prototyped in Figma, then translated into the production build",
      "Worked from a supplied requirements document rather than an open brief",
      "Audited the live page against every requirement before changing a line of markup",
      "Raised six content contradictions with the client instead of resolving them unilaterally",
      "Scoped every change by impact level so the existing visual system stayed locked",
      "Head block went from no canonical, no Open Graph and no structured data to a full set",
      "Zero new sections and zero new components: every gap was met inside what already existed",
    ],
    workflow: [
      "Read the requirements",
      "Audit the live page against them",
      "Raise contradictions",
      "Implement by change level",
      "Re-audit",
    ],
    sections: [
      {
        heading: "Overview",
        body: [
          "ERTH is a Malaysian e-waste collection and rewards service: doorstep pickup, free shipping through Pos Malaysia, a 24/7 drop-off point in Cyberjaya, and cashless rewards. The homepage engagement was a requirements-compliance, content and technical-SEO update, explicitly not a redesign.",
          "The work was carried out against a supplied requirements document that specified the content, the customer questions the page had to answer, and the SEO and structured-data expectations.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "A recycling and trade-in service depends on people trusting it enough to hand over a device and the data on it. The page has to make the process, the pricing, the eligibility rules and the handling of personal data legible before someone commits to anything.",
          "The existing page was visually finished and functionally sound, but incomplete against the requirements: several customer questions had no direct answer, some answers contradicted each other, and the head block carried no canonical, no social metadata and no structured data at all.",
        ],
      },
      {
        heading: "Context",
        body: [
          "The requirements positioned this as a compliance, content and functionality update on an approved design baseline. The instruction was explicit: preserve the visual design, section structure and order, navigation, typography, colours, components and responsive behaviour; integrate anything missing into the most appropriate existing section rather than adding new ones.",
          "That constraint is the interesting part of the engagement. Meeting a long list of content and search requirements is straightforward if you are allowed to add sections. Meeting them inside a locked design is a different problem.",
        ],
      },
      {
        heading: "My Role",
        body: [
          "Two phases, and they are different kinds of work. The interface was worked out as an interactive Figma prototype (ERTH V2.3) before implementation, covering the page structure, the visual direction and the user flow from choosing a device through to payout. Translating that prototype into the production build is the design-to-code half of the engagement.",
          "The second phase, described below, came later and against a design baseline that already existed: development against a supplied requirements document: auditing the live page, producing the compliance assessment, raising the items that needed a client decision, implementing the changes, and re-checking the result against the same matrix.",
          "The SEO and content strategy came from the requirements document. What I owned there was the implementation side, turning it into markup, structure and copy on a live page without breaking the design it had to live inside.",
        ],
        note:
          "The Figma prototype is a shared working file rather than a solo artefact, so this describes design and prototyping involvement and the translation into production, not sole authorship of the design.",
      },
      {
        heading: "Engineering Approach",
        body: [
          "The first step was not to change anything. The existing page was documented first: twenty-one sections catalogued by id and role, the visual language recorded precisely (backgrounds, accent values, type scale, card treatment, button geometry, motion, section rhythm), and the reusable component vocabulary named. That record is what a design lock actually is; without it, 'do not redesign' is a hope rather than a constraint.",
          "With the page documented, every requirement was scored against it as fulfilled, partially fulfilled, missing, or needing factual verification. The finding that shaped the rest of the work was that every gap mapped to copy inside an existing component, an extra card in a grid that already auto-fits, or the document head. No new section was required.",
          "Changes were then scoped by impact. Text-node swaps inside existing elements. Additions inside existing components. Extra cards in existing grids. Sorting the work this way is what kept a content update from turning into a redesign by accretion.",
          "Layout risk was assessed before implementation rather than discovered after it: each planned change was listed against the way it could break at a given width, and the mitigation, so that longer compliance copy would not quietly break a card, a button row or the hero.",
        ],
      },
      {
        heading: "Content accuracy",
        body: [
          "A consistency pass across the whole page found six contradictions and unsupported claims. These were raised for a client decision rather than resolved unilaterally, because picking one reading of a business rule is not a developer's call to make.",
          "One was a headline figure that appeared to confuse two different units: a large number presented as currency where the cited source reported it as a weight. Catching that before publication mattered more than any markup change in the engagement.",
          "The working stance throughout was to verify, soften, or omit. No award, statistic, certification, testimonial or coverage claim was introduced that the source material did not support, and absolute claims about data handling were kept conditional because nothing in the source supported stating them absolutely.",
        ],
        note:
          "One item raised in that pass, a free-pickup eligibility rule stated two different ways, remains a client decision and is still reflected inconsistently on the page. It is recorded as open rather than presented as resolved.",
      },
      {
        heading: "Technical SEO",
        body: [
          "The head block was built out from nothing: the specified title and meta description, a canonical URL, a full Open Graph set with the locale declared as Malaysian English, and a large-image Twitter card.",
          "Two JSON-LD blocks were added. An Organization node also typed as a recycling centre, carrying the alternate name, legal name, logo, contact details, a full postal address for the Cyberjaya premises, the areas served, and a verified social profile. And an FAQPage node mirroring the questions visible on the page.",
          "Structure was treated as information architecture rather than decoration: one h1, section-level h2s, card-level h3s, descriptive alt text, and an internal-linking pass that found several sections were unreachable from the navigation despite being on the page.",
        ],
      },
      {
        heading: "GEO / AI-search readability",
        body: [
          "The requirements asked for content an AI system could read and answer from directly, which is a different target from ranking a page. The approach was to test it rather than assert it: nine questions a visitor actually asks, what is collected, whether broken electronics are accepted, what qualifies for free pickup, where the service operates, how pickup works, how to book, what happens after collection, how data-bearing devices are handled, whether businesses are served, each checked for whether the page answers it self-containedly.",
          "Where a section needed to survive being extracted on its own, it was written to do so. The block explaining the difference between disposal and recycling defines both terms, states the distinction and says why it matters, so that an answer engine quoting only that block still produces something correct.",
          "Recognition claims were restructured to carry who recognised the achievement, when, and where it can be verified, because for an AI system, an unattributed claim and an invented one look the same.",
          "The FAQ was expanded from the questions customers actually raise as objections rather than from a keyword list, and the structured data mirrors exactly what a reader sees. That ordering matters: the markup is a machine-readable copy of real content, not a substitute for it.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "An updated homepage that is recognisably the same website. The difference is in completeness, accuracy, information structure and search readability rather than appearance: zero new sections, zero new components, no change to section order, palette, type, spacing or motion.",
          "The head block went from carrying no canonical, no social metadata and no structured data to carrying all three, including service-area information for six Malaysian locations and a sixteen-question FAQPage.",
        ],
      },
    ],
    status: [
      {
        label: "Title, meta description, canonical",
        state: "implemented",
        detail: "All three present in the shipped page; none existed before.",
      },
      {
        label: "Open Graph and Twitter card",
        state: "implemented",
        detail: "Full Open Graph set with Malaysian English locale, and a large-image Twitter card.",
      },
      {
        label: "Organization / RecyclingCenter JSON-LD",
        state: "implemented",
        detail: "Full postal address, contact details, areas served and a verified social profile.",
      },
      {
        label: "FAQPage JSON-LD",
        state: "implemented",
        detail: "Sixteen question-and-answer pairs mirroring the visible FAQ.",
      },
      {
        label: "Semantic landmarks",
        state: "available",
        detail:
          "The navigation is wrapped in a nav landmark. Wrapping the body sections in a main landmark was identified and is not yet applied.",
      },
      {
        label: "Free-pickup eligibility wording",
        state: "not-connected",
        detail:
          "Raised as a contradiction and awaiting a client ruling. Both readings currently appear on the page, so it is recorded here as open rather than described as resolved.",
      },
    ],
    limitations: [
      "The SEO and content strategy was supplied by the client. This engagement was the implementation and the compliance assessment, not the strategy.",
      "Several external links and image slots were left as placeholders pending client-supplied URLs and photography.",
      "One eligibility rule remains contradictory on the page and requires a client decision.",
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

export function getOtherProjects(slug: string) {
  return projects.filter((p) => p.slug !== slug);
}
