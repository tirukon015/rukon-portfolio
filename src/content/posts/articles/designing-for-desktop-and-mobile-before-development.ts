import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "designing-for-desktop-and-mobile-before-development",
    title: "Designing for Desktop and Mobile Before Development",
    description:
      "Planning responsive behavior as part of the design phase, instead of leaving it as a problem for development to solve alone.",
    date: "2026-08-11",
    updated: "2026-09-24",
    category: "UI/UX & Product",
    tags: ["UI/UX", "Responsive Design"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
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
          "On ERTH, being involved in the prototype and then doing the production build meant responsive behaviour was not a separate handoff. The thinking about how the four-step flow should read on desktop carried straight into how it collapses on mobile during the build, without a document in between.",
          "It still had to be checked rather than assumed. Rebuilding the approved design found two grid definitions that forced horizontal scrolling below 400px, fixed with a minimum column size and a released column span, and the prototype's desktop-or-mobile decision, which it computed in JavaScript from the window width, became a media query at the same breakpoint so the correct layout paints on the first frame. A responsive plan made at design time is what made both of those quick to resolve; it did not make them disappear.",
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
  };
