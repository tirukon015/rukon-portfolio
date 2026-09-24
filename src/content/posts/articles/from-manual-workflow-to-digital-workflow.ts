import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "from-manual-workflow-to-digital-workflow",
    title: "From Manual Workflow to Digital Workflow",
    description:
      "What actually changes when a manual, paper-or-spreadsheet process becomes software, and what shouldn't change.",
    date: "2026-06-30",
    updated: "2026-09-24",
    category: "Building Real Systems",
    tags: ["Automation", "Digital Transformation"],
    contentType: "Experience-led",
    searchIntent: "informational",
    relatedProjects: ["rpoms"],
    relatedPosts: ["replacing-repetitive-manual-work-with-software"],
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
          "RPOMS was built for the router-refurbishment operation I support one module at a time, registry, then packing, then delivery, so each piece could be checked against how the floor actually works before the next was started. The rollout is staged the same way but is not the same thing as the build order: today the Daily Production Report is the module in daily use, while the registry, packing, delivery, workforce and inventory modules are complete and render live data but sit behind a deployment-level write lock until the programme signs them off. A module goes live by being named, not by accident.",
          "One manual distinction had to survive digitisation intact. On the floor, accepting a router and packing it are different jobs done by different people, so the system never records the packer as a router's acceptor, however convenient a single field would have been. Preserving that distinction is the difference between a system that models the process and one that flattens it.",
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
  };
