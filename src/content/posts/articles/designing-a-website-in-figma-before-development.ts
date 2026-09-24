import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "designing-a-website-in-figma-before-development",
    title: "Designing a Website in Figma Before Development",
    description:
      "Why doing the design work in Figma first, rather than designing in the browser, changes how the build goes.",
    date: "2026-07-21",
    updated: "2026-09-24",
    category: "UI/UX & Product",
    tags: ["Figma", "UI/UX", "Design"],
    contentType: "Explainer",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
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
          "The ERTH homepage was worked out as an interactive Figma prototype before any of it was built, and I was part of that work: the page structure, the visual direction, and the user flow from choosing a device through to payout. The prototype was a shared working file rather than a solo artefact, so this is design and prototyping involvement, not sole authorship.",
          "That groundwork is what the production build was then made from. The client approved one design file as final, and the site was built from it as static HTML, CSS and vanilla JavaScript. Working through the approved design element by element surfaced four defects the prototype had carried unnoticed, including a wrapper element that closed early and left a heading black on a near-black background. Design-first did not prevent those; it did mean every one of them was found against a reference everyone had already agreed on, rather than argued about.",
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
  };
