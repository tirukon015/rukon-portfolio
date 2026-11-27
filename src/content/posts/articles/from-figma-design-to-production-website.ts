import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "from-figma-design-to-production-website",
    title: "From Figma Design to Production Website",
    description:
      "What actually happens between a finished Figma design and a working, deployed website.",
    date: "2026-07-28",
    category: "UI/UX & Product",
    tags: ["Figma", "Web Development", "Frontend"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["translating-figma-components-into-reusable-code", "designing-for-desktop-and-mobile-before-development"],
    updated: "2026-10-01",
    sections: [
      {
        heading: "What is the path from a Figma design to a production website?",
        body: [
          "This is the process of taking a completed design file and turning it into real, working markup, styling, and behavior in a browser, then into a deployed site.",
        ],
      },
      {
        heading: "Why does the handover from design to production matter?",
        body: [
          "A design file isn't a website. Responsive behavior, real content lengths, interactive states, and performance all have to be built and decided during development, and a design that looks finished can still be a long way from a finished site.",
        ],
      },
      {
        heading: "How this worked on a production homepage",
        body: [
          "On ERTH I did the second half of this path. The client approved a design file as final, and I built the production website from it: static HTML, CSS and vanilla JavaScript bundled by Vite. That build is finished and deployed on Vercel.",
          "The result was a static page of semantic HTML, CSS and vanilla JavaScript: about 3.7 kB of JavaScript where the design bundle carried roughly 250 kB, and 2.7 MB of images where the source assets were 12.0 MB.",
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
  };
