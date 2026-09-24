import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "translating-figma-components-into-reusable-code",
    title: "Translating Figma Components Into Reusable Code",
    description:
      "How design components in Figma map to reusable UI components in code, and where that mapping gets harder than it looks.",
    date: "2026-08-04",
    updated: "2026-09-24",
    category: "UI/UX & Product",
    tags: ["Figma", "Web Development", "Components"],
    contentType: "Technical Guide",
    searchIntent: "informational",
    relatedProjects: ["erth"],
    relatedPosts: ["from-figma-design-to-production-website"],
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
          "Having been part of the ERTH prototype work before building the site meant the intent behind each component was already familiar, which makes it easier to decide what should be one reusable component with variants versus two genuinely different ones. That is the practical argument for keeping design and build close, whoever holds the pen in Figma: the person translating a component into code should know why it looks the way it does.",
          "On ERTH the translation was unusual, because the approved design shipped with its own inline styles as the specification. Rather than rewrite a thousand style attributes into a class system and risk drift, the markup was preserved and only what a static page cannot express moved into CSS: hover states, open and closed state, and the desktop and mobile split. The component thinking still applied. It decided which repeated patterns got one rule and which only looked alike.",
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
  };
