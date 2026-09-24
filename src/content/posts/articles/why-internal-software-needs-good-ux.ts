import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "why-internal-software-needs-good-ux",
    title: "Why Internal Software Needs Good UX",
    description:
      "Internal tools get less design attention than public products, even though the people using them have no choice but to use them.",
    date: "2026-08-21",
    category: "UI/UX & Product",
    tags: ["UI/UX", "Software Engineering", "Admin Systems"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["how-admin-panels-help-manage-operational-data"],
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
  };
