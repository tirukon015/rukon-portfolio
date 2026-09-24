import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "why-system-maintenance-matters-after-deployment",
    title: "Why System Maintenance Matters After Deployment",
    description:
      "Shipping an operational system is the start of the work, not the end. What ongoing maintenance actually involves.",
    date: "2026-07-14",
    category: "Full-Stack Development",
    tags: ["Software Engineering", "Maintenance"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["what-an-it-systems-role-actually-involves"],
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
  };
