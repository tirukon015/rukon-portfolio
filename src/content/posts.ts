export type PostCategory =
  | "IT Systems"
  | "Software Engineering"
  | "Web Development"
  | "Business Automation"
  | "Operations"
  | "UI/UX";

export type PostSection = {
  heading: string;
  body: string[];
};

export type RelatedLink = {
  label: string;
  href: string;
};

/** What kind of article this is. Drives structure, not styling. */
export type PostContentType =
  | "Experience-led"
  | "Case Study"
  | "Technical Guide"
  | "Problem/Solution"
  | "Comparison"
  | "Explainer"
  | "Industry Analysis"
  | "Career"
  | "Local/Malaysia"
  | "SEO/GEO"
  | "AI Engineering"
  | "Business Systems";

/** The query shape an article is written to answer. */
export type SearchIntent =
  | "informational"
  | "problem-aware"
  | "commercial-adjacent"
  | "navigational";

/**
 * Editorial state, recorded from the content audit.
 *
 * This is planning metadata, not display metadata: nothing here renders. It
 * exists so that a later editing pass knows what was already decided about an
 * article, and so no article is quietly deleted because the reasoning was lost.
 */
export type EditorialPlan = "keep" | "update" | "expand" | "merge" | "retire";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  /** Set when an article is materially revised. Feeds dateModified. */
  updated?: string;
  category: PostCategory;
  tags: string[];
  sections: PostSection[];

  /** Hand-picked outbound links rendered in the article's Related panel. */
  related?: RelatedLink[];
  /** Project slugs this article draws its authority from. */
  relatedProjects?: string[];
  /** Post slugs worth reading alongside this one, beyond same-category matches. */
  relatedPosts?: string[];

  /** Defaults to `description` when unset. */
  excerpt?: string;
  /** Defaults to `title` when unset. */
  seoTitle?: string;
  /** Defaults to `description` when unset. */
  seoDescription?: string;
  /** Set only when an article must point somewhere other than its own URL. */
  canonical?: string;
  image?: { src: string; alt: string };

  contentType?: PostContentType;
  searchIntent?: SearchIntent;
  /** Only set where an article has genuine local context. */
  location?: string;

  /** Planning metadata from the content audit. Not rendered. */
  plan?: EditorialPlan;
  planNote?: string;
  /** For `plan: "merge"`, the slug this article should fold into. */
  mergeInto?: string;
};

export const categories: PostCategory[] = [
  "IT Systems",
  "Software Engineering",
  "Web Development",
  "Business Automation",
  "Operations",
  "UI/UX",
];

export const posts: BlogPost[] = [
  {
    slug: "what-is-a-production-management-system",
    title: "What Is a Production Management System?",
    description:
      "A plain explanation of what production management software actually does, and why it's a different problem from a generic business app.",
    date: "2026-06-02",
    category: "Operations",
    tags: ["Production Systems", "Operations"],
    contentType: "Explainer",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["common-problems-manual-production-tracking", "reporting-from-operational-data"],
    plan: "expand",
    planNote:
      "Best keyword fit in the set. Definitional pillar for the Operations cluster; needs mechanism-level depth.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "A production management system tracks a physical process as it happens: units coming in, moving through stages, and going back out, with the data staying in sync with what's actually true on the floor. It's not a generic CRUD app with extra fields. It's software modeled directly on a sequence of real, physical steps.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "Most business software manages records. A production system has to manage state that changes constantly and physically, stock going up and down, units moving between stages, people doing different jobs at different points. If the software's model of the process doesn't match the real process, the data quietly stops being trustworthy, and nobody notices until a report doesn't add up.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "I designed and built RPOMS to run a router-refurbishment production line: intake, cleaning, packing, and delivery. The system's structure follows those stages directly, not a generic template, because a generic template would have missed the constraints that actually matter on that floor (see the RPOMS case study for specifics).",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "The stages in the software should match the stages in reality, not an idealized version of them.",
          "Data entered once should update everything downstream (stock, reports, dashboards) rather than needing to be re-entered.",
          "The system should catch problems (a mismatched count, a duplicate scan) at the point they happen, not weeks later in a report.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "A production management system earns its keep by being an accurate, current model of a physical process, not by having more fields than a spreadsheet.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "why-production-operations-need-digital-systems",
    title: "Why Production Operations Need Digital Systems",
    description:
      "Spreadsheets work until a production line grows past what one shared file can honestly track. Here's where that line usually gets crossed.",
    date: "2026-06-09",
    category: "Operations",
    tags: ["Production Systems", "Operations", "Automation"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["common-problems-manual-production-tracking"],
    plan: "merge",
    mergeInto: "common-problems-manual-production-tracking",
    planNote:
      "~70% overlap with common-problems-manual-production-tracking. Salvage the private-copies-of-a-shared-sheet signal.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is about the point where a manual, spreadsheet-based process stops being reliable for running a physical operation, and needs to become a proper system instead.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A shared spreadsheet works fine when one or two people update it carefully. It stops working once there are multiple people, multiple stages, and real consequences for the numbers being wrong: stock that doesn't match what's on the shelf, a delivery that doesn't match what was scanned, a report that was already stale by the time someone read it.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "Before RPOMS, the router-refurbishment program I work on ran on spreadsheets. The system replaced that with something that updates stock and dashboards in the same step data is entered, so the numbers reflect what's actually happening rather than what was last typed in.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Watch for the moment when people start keeping their own private copies of a shared sheet to be safe. That's usually the sign.",
          "A digital system doesn't need to be complex to be worth it. It needs to remove the specific failure modes a spreadsheet has: no validation, no single source of truth, no audit trail.",
          "Migrating off a spreadsheet only works if the new system fits how the operation actually runs, not the other way around.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "The decision to move off spreadsheets is less about scale and more about whether the numbers can still be trusted.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "common-problems-manual-production-tracking",
    title: "Common Problems in Manual Production Tracking With Spreadsheets",
    description:
      "The specific ways spreadsheet-based production tracking breaks down in practice, beyond the general advice to use better software.",
    date: "2026-06-16",
    category: "Operations",
    tags: ["Production Systems", "Operations"],
    contentType: "Problem/Solution",
    searchIntent: "problem-aware",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-is-a-production-management-system", "why-production-operations-need-digital-systems"],
    plan: "merge",
    planNote:
      "Merge target. Keeps its slug and absorbs why-production-operations-need-digital-systems.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "A rundown of the concrete failure modes that show up when a spreadsheet is used to track a live production process, rather than a static record.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "These problems are easy to dismiss individually. A duplicate entry here, a stale copy there. But they compound, and by the time they're visible, the operation has usually already made a decision based on wrong numbers.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "The system I built to replace spreadsheet tracking on a router-refurbishment line, RPOMS, is deliberately designed around these exact failure modes: it stages CSV imports so duplicates are caught before anything is written, and it won't let a delivery save unless the scanned load matches the quantity it was raised for.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "No validation: a spreadsheet accepts whatever is typed into it, including numbers that don't reflect what happened.",
          "No single source of truth: multiple copies drift apart, and nobody's sure which one is current.",
          "No audit trail: it's rarely clear who changed what, or when, once something looks wrong.",
          "Delayed visibility: problems surface in a weekly review, long after they happened on the floor.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "These aren't reasons to dislike spreadsheets in general. They're reasons a live, physical process usually outgrows one.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "how-admin-panels-help-manage-operational-data",
    title: "How Admin Panels Help Manage Operational Data",
    description:
      "What a well-designed admin panel actually needs to do for a production or operations system, beyond CRUD screens.",
    date: "2026-06-23",
    category: "Software Engineering",
    tags: ["Admin Systems", "Software Engineering", "Data"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["why-internal-software-needs-good-ux", "reporting-from-operational-data"],
    plan: "expand",
    planNote:
      "Eleven admin routes and a three-tier permission model are available as worked examples and currently unused.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "An admin panel for an operational system is the interface staff use to enter, correct, and review the data a physical process produces: reports, registries, stock, deliveries.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "For an internal, operational tool, the admin panel isn't a secondary feature, it's most of the product. Whoever uses it every day will judge the whole system by how well it fits their actual workflow, not by how the dashboard looks.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "In RPOMS, the admin side covers daily production reports, a serial registry, packing, delivery, workforce, inventory, and report history. Each one is scoped to a specific job on the floor rather than being one generic data-entry screen, because the jobs themselves are different.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Design each admin screen around a specific real task, not a generic table-and-form pattern.",
          "Validate against reality where possible. A packing screen can check a serial against the registry instead of trusting a manual entry.",
          "Make mistakes visible early. Staging an import so duplicates surface before anything is written beats catching them after.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "A good admin panel is judged by how little friction it adds to work that already has to happen, not by how much it can technically do.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "from-manual-workflow-to-digital-workflow",
    title: "From Manual Workflow to Digital Workflow",
    description:
      "What actually changes when a manual, paper-or-spreadsheet process becomes software, and what shouldn't change.",
    date: "2026-06-30",
    category: "Business Automation",
    tags: ["Automation", "Digital Transformation"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["replacing-repetitive-manual-work-with-software"],
    plan: "update",
    planNote:
      "Re-anchor on a manual distinction that had to survive digitisation. Also needs a factual correction: the module sequence described is the build order, not a completed production rollout.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is about the practical shift from a manual process (spreadsheets, paper forms, verbal handoffs) to a digital one, and what that transition actually requires to succeed.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "Digitizing a workflow badly is worse than leaving it manual: it adds a system people have to fight instead of a process they understand. The goal isn't to digitize for its own sake, it's to remove specific, real friction.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "The router-refurbishment operation I support moved from spreadsheets to RPOMS one module at a time (registry, then packing, then delivery), rather than all at once, so each piece could be checked against how the floor actually works before the next one shipped.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Digitize the process as it actually runs first. Improve it after, once the software reflects reality.",
          "Roll out in stages where possible. A production line can't stop to adopt a system all at once.",
          "Keep the parts of the manual process that worked. The goal is removing friction, not replacing everything by default.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "A successful digital workflow looks like the manual one it replaced, minus the specific problems that made it unreliable.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "why-developers-should-understand-the-physical-process",
    title: "Why Software Developers Should Understand the Physical Process",
    description:
      "Building software for a real operation goes better when the developer understands the physical process it supports, not just the data model.",
    date: "2026-07-07",
    category: "IT Systems",
    tags: ["IT Systems", "Operations", "Software Engineering"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-is-a-production-management-system", "why-internal-software-needs-good-ux"],
    plan: "expand",
    planNote:
      "Flagship essay. Several further floor-derived rules are verified in source and unused here.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is about the gap between building software from a spec someone else wrote about a process, and building it while directly involved in that process.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A spec describes a process. It rarely captures the exceptions: what happens when a box is one unit short, what happens when two people are on the same station on different shifts. Those exceptions are exactly what breaks software that was designed from a document instead of the floor.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "I work as IT Systems & Operations Lead on RPOMS, which puts me on both sides: I write the software, and I'm involved in the operational process it supports. Rules like never letting a packer be recorded as a router's acceptor came directly from knowing those are different jobs on the floor, not from a requirements document.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Ask what happens in the edge cases before writing the happy path.",
          "Spend time with the people actually doing the process, if you can, rather than only with whoever wrote the requirements.",
          "Treat exceptions the operation has already dealt with informally as real requirements, not as noise.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Understanding the physical process doesn't replace good engineering. It's what tells you which engineering decisions actually matter.",
        ],
      },
    ],
    related: [
      { label: "RPOMS case study", href: "/work/rpoms" },
      { label: "My experience at Blue Bee Technologies", href: "/#experience" },
    ],
  },
  {
    slug: "why-system-maintenance-matters-after-deployment",
    title: "Why System Maintenance Matters After Deployment",
    description:
      "Shipping an operational system is the start of the work, not the end. What ongoing maintenance actually involves.",
    date: "2026-07-14",
    category: "Software Engineering",
    tags: ["Software Engineering", "Maintenance"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-an-it-systems-role-actually-involves"],
    plan: "expand",
    planNote:
      "A dated changelog spanning several months is available as evidence. Do not publish the open credential-rotation item.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "Maintenance here means everything that keeps a live, in-use system correct and useful after its first deployment: fixing what breaks, adjusting to new requirements, and documenting what changed.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "An operational system doesn't get to be finished. The business it supports keeps changing (new product variants, new rules, new edge cases), and the software has to keep up or it starts costing the operation instead of helping it.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "RPOMS has gone through multiple rounds of changes after its first release: new modules, a rewritten sign-in flow, documentation that didn't exist yet, security notes recorded honestly rather than quietly fixed and forgotten. That's normal for software that's actually in daily use.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Keep a real changelog. Knowing what changed and why matters as much as the change itself.",
          "Treat a documented gap or known issue as more valuable than a silently patched one. Silent fixes lose the lesson.",
          "Budget time for maintenance from the start. It's not a sign something went wrong.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "A system that's still being maintained a year after launch isn't a system with problems. It's a system that's still in use.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "designing-a-website-in-figma-before-development",
    title: "Designing a Website in Figma Before Development",
    description:
      "Why doing the design work in Figma first, rather than designing in the browser, changes how the build goes.",
    date: "2026-07-21",
    category: "UI/UX",
    tags: ["Figma", "UI/UX", "Design"],
    contentType: "Explainer",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
    plan: "update",
    planNote:
      "RETIREMENT WITHDRAWN (2026-09-02). The ERTH Figma prototype (ERTH V2.3) was supplied as evidence, so the design-first premise is supported and the article stays. One outstanding edit: the body claims sole design authorship, which the prototype alone does not establish, soften to design and prototyping involvement. Also still the shortest article in the set at 174 words.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "Designing in Figma before writing any code means the layout, typography, components, and user flow are all worked out and reviewable before development starts.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "Designing directly in code tends to lock in early decisions just because they're already built. Working in Figma first keeps everything easy to change, laid out and typography, spacing, entire flows, before any of it is expensive to touch.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "I designed the ERTH website in Figma before building it: the structure, the visual direction, the four-step user flow from choosing a device to getting paid. That groundwork is what the actual build is now being built from.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Work through the full user flow in Figma, not just individual screens in isolation.",
          "Decide on type, spacing, and color as a system early, so development isn't guessing at consistency later.",
          "Treat the Figma file as the source of truth during the build, and keep it in sync as decisions change.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Design-first isn't slower. It moves the expensive decisions earlier, where they're still cheap to change.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "from-figma-design-to-production-website",
    title: "From Figma Design to Production Website",
    description:
      "What actually happens between a finished Figma design and a working, deployed website.",
    date: "2026-07-28",
    category: "Web Development",
    tags: ["Figma", "Web Development", "Frontend"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["translating-figma-components-into-reusable-code", "designing-for-desktop-and-mobile-before-development"],
    plan: "keep",
    planNote:
      "Both outstanding edits applied (2026-09-06): sole authorship of the design is no longer claimed, and the stale 'still in progress' statement is replaced now the production build has shipped.",
    updated: "2026-09-06",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is the process of taking a completed design file and turning it into real, working markup, styling, and behavior in a browser, then into a deployed site.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A design file isn't a website. Responsive behavior, real content lengths, interactive states, and performance all have to be built and decided during development, and a design that looks finished can still be a long way from a finished site.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "I took the ERTH homepage through this whole path. The interface was worked out as an interactive Figma prototype first, and the production website was then built from the approved design file: static HTML, CSS and vanilla JavaScript bundled by Vite. That build is finished and deployed.",
          "The gap between the two was larger than the design suggested. Rebuilding element by element surfaced four defects nobody had noticed in the prototype, including a wrapper that closed early and left one heading rendering black on a near-black background. A design file can look complete and still be some distance from a page a browser handles correctly.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Build against real content where possible, not lorem ipsum, since real text and images are what actually break a layout.",
          "Treat responsive breakpoints as design decisions, not an afterthought handled purely in code.",
          "Expect iteration. The first build rarely matches the design exactly, and that gap is where the real refinement happens.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Going from Figma to production is its own skill, separate from designing and separate from writing code. It's where the two have to agree.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "translating-figma-components-into-reusable-code",
    title: "Translating Figma Components Into Reusable Code",
    description:
      "How design components in Figma map to reusable UI components in code, and where that mapping gets harder than it looks.",
    date: "2026-08-04",
    category: "Web Development",
    tags: ["Figma", "Web Development", "Components"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
    plan: "update",
    planNote:
      "MERGE WITHDRAWN (2026-09-02). Component translation is a genuinely distinct topic, now evidenced by the ERTH Figma prototype plus the documented ten-component vocabulary. One outstanding edit: the body claims sole design authorship, which the prototype alone does not establish. Residual overlap with from-figma-design-to-production-website should be handled by differentiating the angle, not by merging.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "Figma components (a button, a card, a form field) and code components look similar on the surface, but turning one into the other cleanly takes real decisions about variants, states, and structure.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A one-to-one, screen-by-screen build produces duplicated, inconsistent code. Recognizing which pieces are genuinely the same component in different states, versus which only look similar, is what keeps a codebase maintainable as a site grows.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "Building the ERTH site from my own Figma file means I already know the intent behind each component, since I designed it, which makes it easier to decide what should be one reusable component with variants versus two genuinely different ones.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Look for repeated patterns across screens before building each screen separately.",
          "Keep a component's states (default, hover, disabled, error) as variants of one thing, not separate one-off elements.",
          "Name components consistently between the design file and the codebase, so the two stay easy to cross-reference.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "The goal isn't matching Figma pixel for pixel. It's building a component system that holds together as the site grows past its first version.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "designing-for-desktop-and-mobile-before-development",
    title: "Designing for Desktop and Mobile Before Development",
    description:
      "Planning responsive behavior as part of the design phase, instead of leaving it as a problem for development to solve alone.",
    date: "2026-08-11",
    category: "UI/UX",
    tags: ["UI/UX", "Responsive Design"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
    plan: "update",
    planNote:
      "MERGE WITHDRAWN (2026-09-02). Planning responsive behaviour at design time is supported by the ERTH Figma prototype, and the documented pre-implementation responsive risk register gives it concrete evidence. One outstanding edit: the body claims sole design authorship, which the prototype alone does not establish.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "Deciding how a layout, its type scale, and its interactions should change across screen sizes, as part of the design work, rather than only reacting to breakpoints once the site is being built.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A design that only exists as a single desktop frame leaves every mobile decision to whoever builds it, under time pressure, without the context the designer had. Planning responsive behavior up front keeps that intent intact.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "Designing the ERTH website myself means responsive behavior isn't a separate handoff. The same person who decided how the four-step flow should read on desktop is the one deciding how it collapses on mobile during the build.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Decide early which elements are core to the experience at every size, and which are desktop enhancements.",
          "Test type and spacing at the smallest realistic width, not just the most common one.",
          "Keep the core user flow (the actual steps someone takes) identical across sizes, even when the layout around it changes.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Responsive design done well is invisible: the site simply makes sense at whatever size someone is using.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "what-an-it-systems-role-actually-involves",
    title: "What an IT Systems Role Actually Involves",
    description:
      "A grounded look at what IT systems work covers day to day, beyond the narrow idea of fixing computers.",
    date: "2026-08-15",
    category: "IT Systems",
    tags: ["IT Systems", "IT Support"],
    contentType: "Career",
    searchIntent: "informational",
    relatedPosts: ["why-system-maintenance-matters-after-deployment", "why-developers-should-understand-the-physical-process"],
    plan: "expand",
    planNote:
      "Real local search demand. Expand across the full span of the role, from end-user support to owning a production system.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "IT systems work spans hardware support, software troubleshooting, system configuration, and increasingly, building or maintaining the internal tools a business actually runs on.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "The role gets flattened in most descriptions to 'fixes computers,' which misses most of what it actually is: understanding how a business's systems, hardware, software, and data fit together, and keeping that whole picture working.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "My own work covers hardware troubleshooting and installation, website and system maintenance, and designing and building RPOMS, the operational system a production line depends on. Those aren't separate jobs, they're one role covering the full stack of a business's IT needs.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Hardware and software issues are often connected. Diagnosing one well usually means understanding both.",
          "Building internal tools is IT systems work too, not a separate category from support and maintenance.",
          "Documentation and clear communication matter as much as the technical fix, since most issues involve someone who isn't technical.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "IT systems work is broader and more constructive than its reputation suggests. It's as much about building and maintaining as it is about fixing.",
        ],
      },
    ],
    related: [{ label: "My experience at Blue Bee Technologies", href: "/#experience" }],
  },
  {
    slug: "replacing-repetitive-manual-work-with-software",
    title: "Replacing Repetitive Manual Work With Software",
    description:
      "How to tell whether a repetitive manual task is actually worth automating, and what to check before building anything.",
    date: "2026-08-18",
    category: "Business Automation",
    tags: ["Automation", "Business Systems"],
    contentType: "Problem/Solution",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["from-manual-workflow-to-digital-workflow"],
    plan: "update",
    planNote:
      "Both named examples, document generation from a template and automatic stock deduction, are verified in source. Keep them and go deeper.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is about identifying manual, repetitive work (re-typing the same data, reconciling two sheets by hand, generating the same document over and over) and deciding whether software should take it over.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "Not every repetitive task is worth automating. The ones worth it are the ones where manual repetition is also where mistakes happen: transcription errors, missed steps, inconsistent formatting. Those are the tasks where software adds real reliability, not just speed.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "RPOMS automates exactly this kind of repetition: generating delivery paperwork from a template instead of redrawing it by hand each time, and deducting stock automatically from a report instead of updating a separate sheet afterward.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Automate tasks where manual repetition is also where errors creep in, not just tasks that are merely tedious.",
          "Keep the automated version doing exactly what the manual version did, unless there's a clear reason to change it.",
          "Leave a way to see what the software did and why, so a wrong output can actually be traced.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "The best automation targets are boring and error-prone at the same time. That combination is where software earns its keep.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "why-internal-software-needs-good-ux",
    title: "Why Internal Software Needs Good UX",
    description:
      "Internal tools get less design attention than public products, even though the people using them have no choice but to use them.",
    date: "2026-08-21",
    category: "Software Engineering",
    tags: ["UI/UX", "Software Engineering", "Admin Systems"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["how-admin-panels-help-manage-operational-data"],
    plan: "expand",
    planNote:
      "Several concrete mechanisms are verified and unused: components that report their own problems, imports that surface duplicates before writing, add-only controls.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "This is about applying real UX thinking, clear layout, sensible defaults, obvious error states, to internal tools, not just to public-facing products.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "Internal software users can't switch to a competitor if the tool is confusing. That's usually treated as a reason to under-invest in its design, when it should be the opposite: they'll be in it every day, so friction compounds fast.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "Each admin screen in RPOMS is scoped to one specific job on the floor (packing, delivery, registry) instead of being one generic form, because the people using it are doing that one job repeatedly, and the interface should match the task, not a database schema.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Design each screen around the task someone is actually doing, not around the underlying data structure.",
          "Surface errors at the moment they happen, in language the user understands, not as a generic failure message.",
          "Watch how the tool is actually used day to day. Real usage reveals friction a spec never will.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Good UX in internal tools isn't a nice-to-have. It's the difference between a tool people fight and one they don't think about.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "reporting-from-operational-data",
    title: "Reporting From Operational Data",
    description:
      "What makes operational reporting actually useful for decisions, instead of just being a record of what happened.",
    date: "2026-08-24",
    category: "IT Systems",
    tags: ["Data", "Reporting", "Operations"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-is-a-production-management-system", "how-admin-panels-help-manage-operational-data"],
    plan: "expand",
    planNote:
      "Four comparison modes and batch carry-over are verified. Expand into the mechanics rather than the principle alone.",
    sections: [
      {
        heading: "What is it?",
        body: [
          "Operational reporting turns the data a system collects, production counts, stock levels, workforce output, into something someone can actually use to make a decision.",
        ],
      },
      {
        heading: "Why does it matter?",
        body: [
          "A report that's just a data dump isn't useful. Useful reporting answers a specific question: are we ahead of or behind target, is this week different from last week, is one part of the process slower than the rest.",
        ],
      },
      {
        heading: "Real-world perspective",
        body: [
          "RPOMS's dashboard compares each day against yesterday, a 7-day average, or a custom range, and tracks batch progress against target, because those are the comparisons that actually inform a decision on the floor, not just the raw daily numbers on their own.",
        ],
      },
      {
        heading: "Key considerations",
        body: [
          "Design reports around the decisions they need to support, not around whatever fields happen to be in the database.",
          "Comparisons (against a target, a prior period, an average) are usually more useful than a single raw number.",
          "Keep reporting close to the data it summarizes, so a number that looks wrong can be traced back to its source.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Reporting is only as useful as the decisions it enables. That's the test worth designing around.",
        ],
      },
    ],
    related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
  },
  {
    slug: "rebuilding-a-design-prototype-as-a-production-website",
    title: "Rebuilding a Design-Tool Prototype as a Production Website",
    description:
      "An approved design arrived as a self-extracting bundle running React from a CDN. Shipping it meant removing almost everything and keeping the part that was actually the specification.",
    date: "2026-08-28",
    category: "Web Development",
    tags: ["HTML", "CSS", "JavaScript", "Vite", "Performance", "Design to Code"],
    contentType: "Experience-led",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "verifying-a-static-site-you-built-by-hand",
      "from-figma-design-to-production-website",
    ],
    sections: [
      {
        heading: "What actually arrived",
        body: [
          "The design for the ERTH homepage was approved as a single file, and every earlier revision was declared superseded. That is a good brief to receive. It removes the usual argument about which version is current, and it replaces 'build something like this' with 'ship exactly this, correctly'.",
          "What the file was, though, was not a website. It was a self-extracting design-tool bundle: fonts, images and markup encoded as base64 inside script blocks, unpacked in the browser at runtime, with React and Babel pulled from a CDN and a runtime that re-rendered inline styles on every state change. It rendered the design faithfully. It also spent a quarter of a megabyte of JavaScript and a full render pass before anything appeared.",
          "There is a real temptation at this point to keep the machinery. It works, after all, and keeping it is less thinking than replacing it. But the page is one static document. Nothing on it needs a component tree, a compiler in the browser, or a style engine that recomputes on state change.",
        ],
      },
      {
        heading: "The decision was to remove, not add",
        body: [
          "The rebuild shipped static HTML, CSS and vanilla JavaScript bundled by Vite. Roughly 250 kB of prototype JavaScript came out. What went back in was 3.7 kB that does nothing but handle interaction: menus, disclosures, two dialogs.",
          "That ratio is worth sitting with. The visible behaviour of the page did not change at all. Every menu still opens, every dialog still traps focus, every disclosure still expands. The entire difference was framework and runtime that the page never needed, carried along because it came in the box.",
          "The other half of the removal was network. Every font and image is self-hosted, so the production page makes no third-party requests whatsoever. A page that reaches out to a CDN is a page whose first paint depends on somebody else's uptime and somebody else's TLS handshake.",
        ],
      },
      {
        heading: "Keeping the inline styles on purpose",
        body: [
          "The one thing I did not touch was the thousand-odd inline style attributes, and that surprises people.",
          "In this file the inline styles are the design specification. Every dimension, every colour, every clamp() lives there. There is no separate stylesheet that says what the design is. Rewriting all of them into semantic class names would have been a large, mechanical, entirely untestable transformation whose only possible outcomes were 'identical' and 'subtly wrong'.",
          "So the markup was preserved verbatim, and only the parts a static file genuinely cannot express were moved out. That is a smaller, more honest change, and it is one you can verify section by section against the approved design rather than hoping.",
          "The general form of this: when a generated artefact is the source of truth for something, converting it to a nicer representation is not a refactor. It is a re-specification, and it needs the same review the original got.",
        ],
      },
      {
        heading: "Three things that had to move",
        body: [
          "Hover states. The prototype expressed them as custom attributes its runtime read and applied. A static page has no runtime, so those became real CSS hover rules. They need !important, because the elements they target carry inline styles, and the prototype's own generated stylesheet did exactly the same thing for exactly the same reason.",
          "Open and closed state. The prototype toggled inline display values from JavaScript. That became the hidden attribute plus aria-expanded and a class, with CSS deciding appearance. This is a straight upgrade: the state is now in the accessibility tree instead of only in a style property, so a screen reader can tell a collapsed section from an expanded one.",
          "The responsive split. The prototype computed desktop versus mobile in JavaScript from window.innerWidth and rendered accordingly. That became a media query at the same breakpoint. The behaviour is identical and the experience is not: the correct layout is now painted on the first frame, rather than the wrong one being painted and then corrected once JavaScript runs.",
          "All three follow the same pattern. Each one takes a decision the prototype made at runtime, in JavaScript, and moves it into a declaration the browser can act on before any script executes.",
        ],
      },
      {
        heading: "A rebuild finds the bugs a demo hides",
        body: [
          "Going through an approved design element by element is the most thorough review it will ever get. Four defects turned up that nobody had noticed in months of looking at the prototype.",
          "The page wrapper closed early, part-way down the document. Every section after that point never inherited the light text colour, so one heading rendered black on a near-black background. Invisible in the design tool, which applied colours its own way; plainly broken in a browser.",
          "A dialog contained an iframe whose source was an unresolved template binding, so every single page load fetched a URL that did not exist. Six links pointed at the section they were already inside. And two grid definitions forced horizontal scrolling below 400px.",
          "None of these were introduced by the rebuild. All of them were in the thing that had been signed off. That is not a criticism of the review, it is the nature of reviewing a prototype: you check whether it looks right, and it did.",
        ],
      },
      {
        heading: "What I would tell someone facing the same file",
        body: [
          "Work out what part of the artefact is the specification and what part is the delivery mechanism. Keep the first exactly. Replace the second freely.",
          "Do not treat 'it already works' as a reason to ship the runtime. A prototype's job is to be convincing quickly; a production page's job is to be cheap and correct for every visitor, forever. Those are different jobs with different right answers.",
          "Expect to find defects, and raise them rather than quietly fixing them into something else. Every one of the four here was reported as a fix with a reason, not absorbed into a redesign.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "verifying-a-static-site-you-built-by-hand",
    title: "Verifying a Static Site You Built by Hand",
    description:
      "Hand-written HTML has no type checker and no test runner. On a production build I wrote the guarantees instead, as a post-build script that fails the build.",
    date: "2026-08-31",
    category: "Software Engineering",
    tags: ["HTML", "Build Tooling", "Quality", "Accessibility", "SEO"],
    contentType: "Technical Guide",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "rebuilding-a-design-prototype-as-a-production-website",
      "why-system-maintenance-matters-after-deployment",
    ],
    sections: [
      {
        heading: "The gap nobody mentions",
        body: [
          "Choosing static HTML, CSS and vanilla JavaScript for a single page is usually the right call. It is fast, it has no dependency surface worth attacking, and it will still build in five years.",
          "What you give up is not usually stated out loud: every safety net. There is no type checker to tell you a reference is wrong. No component test to catch a broken prop. No framework to notice that the thing you linked to does not exist. A typo in an href is just a string that happens to be wrong, and nothing in the toolchain has an opinion about it.",
          "On a page of a thousand lines of markup with dozens of internal anchors, that is not a theoretical risk. So on the ERTH homepage the guarantees got written by hand, as a script that runs as part of every build and fails it.",
        ],
      },
      {
        heading: "What it refuses to ship",
        body: [
          "A referenced asset that is not in the build output. The commonest failure in a static build is a path that was right in the source tree and wrong after bundling, and it produces a broken image rather than an error.",
          "An in-page link or an aria-controls attribute pointing at an id that does not exist. These two are the same class of bug and both are silent: the link does nothing, or the control announces a relationship to an element that is not there.",
          "A required head tag that is absent. Canonical, description, Open Graph, viewport. Easy to add, easy to lose in an edit, and invisible until something downstream is already wrong.",
          "JSON-LD that does not parse. Structured data is the one part of a page whose only consumer is a machine, which means a human will never notice it is broken. Parsing it at build time costs nothing and closes that gap completely.",
          "An image with no alt attribute or no intrinsic width and height. The first is an accessibility failure, the second is a layout shift, and both are things a busy edit drops.",
          "More or fewer than exactly one h1.",
        ],
      },
      {
        heading: "The check that mattered most",
        body: [
          "The last rule is the one I would keep if I could only keep one: the build fails if any prototype artefact survives into the output. An unresolved template binding, a generated class name from the design tool, a raw internal identifier.",
          "This matters specifically because the page was rebuilt from a design-tool export. Artefacts from that kind of source do not look like errors. They look like content. A stray binding renders as literal braces in the middle of a sentence, and if it lands in a section nobody scrolls to during review, it ships and stays shipped.",
          "It is worth naming the general rule: the checks worth automating are the ones that fail invisibly. A broken layout gets found in five minutes by the first person who looks. A missing canonical tag, an unparseable schema block, a leaked template binding in section eighteen — those can live in production indefinitely, because nothing about the page announces them.",
        ],
      },
      {
        heading: "Why it runs in the build, not in CI",
        body: [
          "The check is wired into the build command itself rather than sitting in a separate pipeline step. That is deliberate. A verification you can forget to run is a verification you will eventually forget to run, and the moment you most want it is the moment you are in a hurry.",
          "Attaching it to the build also means it protects the local preview and the deployment equally, without any configuration in the hosting platform. There is one command, it either produces a deployable directory or it fails with a reason, and there is no state in between.",
        ],
      },
      {
        heading: "Scaling this down",
        body: [
          "This is maybe a couple of hundred lines of Node. It is not a framework and it does not want to be one. It parses the built HTML, walks a handful of assertions, and exits non-zero with a message naming the element that failed.",
          "If you are shipping a hand-built page, start with three checks: every internal anchor resolves, every image has alt text, and every JSON-LD block parses. Those three cover the majority of what actually goes wrong and they take an afternoon.",
          "The point is not the specific list. It is that on a project with no type system, the invariants you care about still exist. They are just unwritten, and unwritten invariants are the ones that break.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "cutting-a-page-image-payload-from-12mb-to-under-3mb",
    title: "Cutting a Page's Image Payload From 12 MB to Under 3 MB",
    description:
      "The performance and accessibility pass on a production homepage: what was actually slow, what fixed it, and why most of it was not clever.",
    date: "2026-09-03",
    category: "Web Development",
    tags: ["Performance", "Accessibility", "Images", "Fonts", "Core Web Vitals"],
    contentType: "Problem/Solution",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "rebuilding-a-design-prototype-as-a-production-website",
      "designing-for-desktop-and-mobile-before-development",
    ],
    sections: [
      {
        heading: "Where the weight was",
        body: [
          "The ERTH homepage is a single long page with a lot of photography: devices, collection scenes, an award plaque, press logos. As it came out of the design tool the image payload was 12.0 MB.",
          "That number is not unusual and it is not anybody's fault. Design tools export at the fidelity the designer was working at, because that is the correct default for design. It just is not the correct default for a phone on mobile data in Malaysia.",
          "After the pass it is 2.7 MB. Nothing in the design changed. No image was dropped, cropped or replaced.",
        ],
      },
      {
        heading: "What actually did it",
        body: [
          "Re-encoding to WebP did most of the work. Photographic and illustrative assets converted at a sensible quality, which for this page was visually indistinguishable at every size the design uses.",
          "srcset on the largest images did the rest. The hero backdrop and the collection-centre photograph are the two assets that dominate on a big screen and are wildly oversized on a small one, so those got width variants and a browser that picks.",
          "That is the entire image strategy. Two techniques, both older than most of the frameworks people reach for, applied to the assets that actually mattered rather than uniformly to everything.",
        ],
      },
      {
        heading: "Stopping the page from moving",
        body: [
          "Payload is only half of it. The other half is whether the page holds still while it loads, and that is a separate fix with a separate mechanism.",
          "Every image carries intrinsic width and height attributes. The browser can then reserve the correct box before the bytes arrive, so text does not jump down the page as photographs appear. This costs two attributes per image and it is the single highest-value accessibility and usability fix in the whole pass, because a page that moves under your finger while you are reading is genuinely hostile.",
          "Below-the-fold images are lazy, and the hero backdrop is explicitly marked high priority so the lazy default does not deprioritise the one image that is on screen immediately.",
        ],
      },
      {
        heading: "Fonts, self-hosted and subset",
        body: [
          "The fonts are self-hosted as WOFF2 subsets rather than pulled from a font service. Combined with self-hosting the images, that takes the page to zero third-party requests.",
          "There are two reasons and only one of them is speed. The first is that a third-party font request is a dependency on someone else's availability and TLS handshake, sitting directly in the path of your first paint. The second is that it is a request to another party's server carrying your visitor's IP address, which for a Malaysian consumer service handling people's old devices and personal data is a conversation worth not having at all.",
          "The two Latin subsets that the page actually renders in are preloaded. The rest are declared and fetched only if a visitor's content needs them.",
        ],
      },
      {
        heading: "Accessibility in the same pass",
        body: [
          "Performance and accessibility got done together, because on a static rebuild they touch the same markup and splitting them means editing everything twice.",
          "What went in: a skip link, main, nav, footer and aside landmarks, accessible names on the sections that carry no heading, a visible focus ring on every interactive element, aria-expanded and aria-controls on all disclosures and dropdowns, Escape and focus trapping in both dialogs with focus returned to whatever opened them, keyboard-operable navigation dropdowns, underlines on inline links that colour alone did not distinguish, and prefers-reduced-motion honoured.",
          "axe-core reports zero violations across five states: default, mobile, menu open, dialog open, disclosure open. Testing the states matters more than testing the page. Almost every accessibility bug I have found in an interactive component lives in a state the automated pass never opened.",
        ],
      },
      {
        heading: "The unglamorous conclusion",
        body: [
          "None of this was clever. WebP, srcset, width and height attributes, lazy loading, self-hosted subset fonts, landmarks and focus management. All of it is a decade old or more and all of it is in every guide.",
          "The reason it is worth writing down anyway is that a 12 MB page is not usually the result of someone not knowing about WebP. It is the result of a handoff where the performance pass was nobody's explicit job. On this build it was written into the definition of done, alongside a build check that fails if an image loses its alt text or its dimensions, which is the part that keeps it true after the next edit.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  },
  {
    slug: "making-an-llm-admit-the-paper-does-not-say",
    title: "Making an LLM Admit the Paper Doesn't Say That",
    description:
      "The dangerous failure of an AI summarising tool is not a blank answer. It is a plausible one about a section that was never in the source. Enforcing that in three places.",
    date: "2026-09-05",
    category: "Software Engineering",
    tags: ["LLM", "AI Engineering", "Structured Output", "FastAPI", "Python"],
    contentType: "AI Engineering",
    searchIntent: "problem-aware",
    relatedProjects: ["researchforge"],
    relatedPosts: [
      "when-not-to-fall-back-to-another-ai-provider",
      "why-internal-software-needs-good-ux",
    ],
    sections: [
      {
        heading: "The failure that matters",
        body: [
          "ResearchForge reads an academic PDF and produces a structured summary, a research-gap analysis, and a literature review of the prior work the paper discusses. The interesting engineering problem in that is not getting a good answer. Models are good at good answers.",
          "The problem is what happens on a paper that does not contain what you asked for. Hand a position paper to something that has been told to extract a methodology, and it will not return nothing. It will return a methodology: fluent, structured, appropriately hedged, and invented.",
          "For a research tool that failure is worse than no answer, because it is indistinguishable from a correct one unless the reader already knows the paper. And a reader who already knows the paper did not need the tool.",
        ],
      },
      {
        heading: "Why the prompt is not enough",
        body: [
          "The obvious response is to put it in the system prompt. Only use the paper. Say so if the paper does not support a section. That is necessary and it is nowhere near sufficient, because a prompt instruction is a preference expressed in the same channel as everything else competing for the model's attention.",
          "More to the point, a prompt gives the model no shape in which to decline. If the response format has a methodology field and no way to say 'absent', then the least-cost path to a valid answer is to fill it. You have built a structure where honesty has no representation.",
          "So the rule is enforced in three places rather than requested once.",
        ],
      },
      {
        heading: "One: the schema has somewhere to put 'no'",
        body: [
          "Each response model carries explicit fields for declining. There is a list naming any section the paper did not support, and a boolean plus explanation for the case where the whole analysis cannot be grounded at all.",
          "That is the actual mechanism. Not the instruction, the affordance. Given a structured slot that means 'this paper has no methodology section', a model will use it, because it is now the cheapest valid answer rather than an invalid one.",
          "The response models are converted to JSON Schema and handed to the model as the required output format, with additional properties forbidden. Every reply is validated on return, and a truncated or malformed answer is refused outright rather than partially rendered. A half-parsed analysis shown as though it were complete is the same class of lie as an invented one.",
        ],
      },
      {
        heading: "Two: the interface prints it",
        body: [
          "The third enforcement point is the one that is easiest to skip and hardest to justify skipping. The interface renders those fields.",
          "If the model says a section was unsupported, the reader sees that the section was unsupported. The field is not swallowed, not rendered as an empty state that looks like a loading failure, not tucked behind a disclosure. It is the answer.",
          "A schema field nobody displays is a schema field nobody can rely on, and it is also a quiet invitation to stop populating it correctly. Displaying it closes the loop between what the model was asked to do and what the user actually gets.",
        ],
      },
      {
        heading: "Three calls, not one",
        body: [
          "The summary, the gap analysis and the literature review run as three separate model calls rather than one call returning three objects.",
          "They are different tasks with different evidence rules. Separating them means a failure in one does not corrupt the others, and each prompt can be improved without regression-testing the other two.",
          "They run sequentially rather than in parallel, on purpose. Parallelising them would multiply the peak rate-limit burden three times over to win latency that nobody notices on a single upload. That is a bad trade, and it is one that gets made by default a lot.",
        ],
      },
      {
        heading: "Evidence beside every claim",
        body: [
          "For the gap analysis specifically, each identified gap is returned with the wording in the paper that supports calling it a gap, and displayed that way.",
          "This is the same idea one level up. A gap with its evidence attached is checkable in about four seconds: read the quote, decide whether it means what the tool says it means. A gap without evidence is something you either trust or do not, with no third option.",
          "That distinction, between an output you can verify and an output you must trust, is most of what separates an AI feature that survives contact with a sceptical user from one that gets used twice.",
        ],
      },
    ],
    related: [{ label: "ResearchForge case study", href: "/work/researchforge" }],
  },
  {
    slug: "when-not-to-fall-back-to-another-ai-provider",
    title: "When Not to Fall Back to Another AI Provider",
    description:
      "Automatic failover between model vendors is easy to build and easy to build wrong. Most errors should never trigger it.",
    date: "2026-09-06",
    category: "Software Engineering",
    tags: ["LLM", "AI Engineering", "Architecture", "Reliability", "Python"],
    contentType: "AI Engineering",
    searchIntent: "problem-aware",
    relatedProjects: ["researchforge"],
    relatedPosts: [
      "making-an-llm-admit-the-paper-does-not-say",
      "why-system-maintenance-matters-after-deployment",
    ],
    sections: [
      {
        heading: "The abstraction first",
        body: [
          "ResearchForge generates through a provider interface rather than a vendor SDK. The analysis service depends on the interface and never on a vendor, each vendor's SDK is imported only inside its own provider module, and the concrete provider is built by a factory using a local import, so adding a vendor never forces every caller to import every SDK.",
          "The practical payoff is small and constant: switching the primary vendor is one environment variable, and adding a vendor is one new file. The larger payoff is that the rest of the codebase never learns which model it is talking to, so no vendor quirk can leak into the analysis logic and quietly become load-bearing.",
        ],
      },
      {
        heading: "Fallback is the easy part to get wrong",
        body: [
          "With two providers behind one interface, automatic failover is about fifteen lines. Catch the error, try the other one, return whichever answers. That version is worse than having no fallback at all.",
          "The reason is that most errors are not vendor-specific. A PDF that fails validation will fail validation on the other vendor. A response that fails schema validation will very likely fail it again. A missing API key is a deployment problem, and trying the second vendor turns a clear configuration error into a confusing one.",
          "In every one of those cases a blind fallback spends a second vendor's quota, doubles the user's wait, and produces the same error at the end. It converts a fast, clear failure into a slow, muddled one.",
        ],
      },
      {
        heading: "The rule that survived",
        body: [
          "The fallback fires once per analysis, and only for a rate limit or a temporary provider failure.",
          "Those two are the entire legitimate category: conditions that are genuinely about that vendor at that moment, and where a different vendor plausibly gives a different outcome. Everything else fails immediately with the real reason.",
          "Once per analysis matters too. Not once per model call, once per analysis. Three sequential calls each allowed their own fallback is a request that can bounce between vendors five times before failing, and there is a 300-second function ceiling to fit inside.",
        ],
      },
      {
        heading: "Errors have to be distinguishable to be handled",
        body: [
          "None of the above is expressible unless the error types are distinguishable in the first place, which is why vendor exceptions get wrapped in project-owned types at the provider boundary.",
          "A missing API key is separated out from other failures specifically because it is an operator problem rather than a user's fault, and it maps to a different status code. Status codes are chosen so the frontend can tell cases apart without parsing message text: too large, unusable PDF, unusable model reply, no credentials configured. Nothing expected returns a 500.",
          "Parsing vendor error strings to decide control flow is the thing to avoid here. Those strings are not an API, they change without notice, and a fallback rule built on substring matching fails open in the worst possible way, at the moment the vendor is already having a bad day.",
        ],
      },
      {
        heading: "Record what actually answered",
        body: [
          "Every stored analysis records which provider and model actually produced it, whether the fallback was used, and how long the call took.",
          "This turns out to be the feature I would least want to remove. Without it, an output that looks off has no explanation attached to it, and 'which model wrote this one?' becomes unanswerable a week later. With it, the question is a column.",
          "It also makes the fallback observable rather than invisible. A silent failover is indistinguishable from no failover right up until the bill arrives, or until quality shifts for a week and nobody can say why.",
        ],
      },
      {
        heading: "The general shape",
        body: [
          "Retry the conditions that are about the vendor. Fail fast on the conditions that are about the request. Wrap vendor errors in your own types so you can tell the two apart. Bound the retry at the level of the user's operation, not the individual call. Record what answered.",
          "None of that is specific to language models. It is ordinary reliability engineering, and the only reason it is worth saying about LLM providers is that the cost of an unnecessary retry is unusually high and unusually easy to miss.",
        ],
      },
    ],
    related: [{ label: "ResearchForge case study", href: "/work/researchforge" }],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: PostCategory) {
  return sortedPosts().filter((p) => p.category === category);
}

/** Categories that actually have at least one post. */
export function usedCategories(): PostCategory[] {
  return categories.filter((c) => posts.some((p) => p.category === c));
}

/**
 * Related reading for an article.
 *
 * Hand-picked `relatedPosts` come first, because a curated pair is always
 * better than a category match. Same-category posts fill any remaining slots,
 * which is what keeps this useful as the library grows past the point where
 * "same category" means anything on its own.
 */
export function getRelatedPosts(post: BlogPost, limit = 3) {
  const picked = (post.relatedPosts ?? [])
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p) && p!.slug !== post.slug);

  const seen = new Set(picked.map((p) => p.slug));
  const sameCategory = sortedPosts().filter(
    (p) => p.slug !== post.slug && p.category === post.category && !seen.has(p.slug)
  );

  return [...picked, ...sameCategory].slice(0, limit);
}

/**
 * Articles that draw on a given project.
 *
 * Reads the structured `relatedProjects` field, and falls back to the older
 * hand-written `related` links so no existing relationship is lost.
 */
export function getPostsForProject(projectSlug: string) {
  const href = `/work/${projectSlug}`;
  return sortedPosts().filter(
    (p) =>
      p.relatedProjects?.includes(projectSlug) ||
      p.related?.some((link) => link.href === href)
  );
}

/** Newest first. */
export function sortedPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Falls back to `description` so every card and meta tag has copy. */
export function postExcerpt(post: BlogPost) {
  return post.excerpt ?? post.description;
}
