import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "why-internal-software-needs-good-ux",
    title: "Why Internal Software Needs Good UX",
    description:
      "Internal tools get less design attention than public products, even though the people using them have no choice but to use them.",
    date: "2026-08-21",
    updated: "2026-11-27",
    category: "UI/UX & Product",
    tags: ["UI/UX", "Software Engineering", "Admin Systems"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["how-admin-panels-help-manage-operational-data"],
    sections: [
      {
        heading: "What does good UX mean for internal software?",
        body: [
          "This is about applying real UX thinking, clear layout, sensible defaults, obvious error states, to internal tools, not just to public-facing products.",
        ],
      },
      {
        heading: "Why does internal software need good UX?",
        body: [
          "Internal software users can't switch to a competitor if the tool is confusing. That's usually treated as a reason to under-invest in its design, when it should be the opposite: they'll be in it every day, so friction compounds fast.",
        ],
      },
      {
        heading: "How this works in RPOMS",
        body: [
          "Each admin screen in RPOMS is scoped to one specific job on the floor (packing, delivery, registry) instead of being one generic form, because the people using it are doing that one job repeatedly, and the interface should match the task, not a database schema.",
          "Scanning stations answer every scan with a sound for success, duplicate and error, so an operator can keep their eyes on the router and the scanner instead of checking the screen after each one.",
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
  };
