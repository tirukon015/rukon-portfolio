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
    plan: "expand",
    planNote:
      "Promoted from merge target to cluster pillar (2026-09-02) now the ERTH Figma prototype is evidenced. Two outstanding edits: the body claims the design was created solely by the author, which the prototype alone does not establish; and the 'still in progress' statement is stale, contradicted by the shipped v13/v14 builds.",
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
          "I'm currently building the ERTH website from a Figma design I created myself, across multiple build iterations, checking each one against the design as it goes. Development is still in progress, some sections are further along than others, which is a normal part of this process, not a shortcut being skipped.",
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
