import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "why-developers-should-understand-the-physical-process",
    title: "Why Software Developers Should Understand the Physical Process",
    description:
      "Building software for a real operation goes better when the developer understands the physical process it supports, not just the data model.",
    date: "2026-07-07",
    category: "Building Real Systems",
    tags: ["IT Systems", "Operations", "Software Engineering"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-is-a-production-management-system", "why-internal-software-needs-good-ux"],
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
  };
