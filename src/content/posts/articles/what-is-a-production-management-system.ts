import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "what-is-a-production-management-system",
    title: "What Is a Production Management System?",
    description:
      "A plain explanation of what production management software actually does, and why it's a different problem from a generic business app.",
    date: "2026-06-02",
    category: "Building Real Systems",
    tags: ["Production Systems", "Operations"],
    contentType: "Explainer",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["common-problems-manual-production-tracking", "reporting-from-operational-data"],
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
  };
