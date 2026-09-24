import type { BlogPost } from "../types";

export const post: BlogPost = {
    slug: "rebuilding-a-design-prototype-as-a-production-website",
    title: "Rebuilding a Design-Tool Prototype as a Production Website",
    description:
      "An approved design arrived as a self-extracting bundle running React from a CDN. Shipping it meant removing almost everything and keeping the part that was actually the specification.",
    date: "2026-08-28",
    category: "Full-Stack Development",
    tags: ["HTML", "CSS", "JavaScript", "Vite", "Performance", "Design to Code"],
    contentType: "Experience-led",
    searchIntent: "problem-aware",
    relatedProjects: ["erth"],
    relatedPosts: [
      "verifying-a-static-site-you-built-by-hand",
      "from-figma-design-to-production-website",
    ],
    sections: [
      {
        heading: "What actually arrived",
        body: [
          "The design for the ERTH homepage was approved as a single file, and every earlier revision was declared superseded. That is a good brief to receive. It removes the usual argument about which version is current, and it replaces 'build something like this' with 'ship exactly this, correctly'.",
          "What the file was, though, was not a website. It was a self-extracting design-tool bundle: fonts, images and markup encoded as base64 inside script blocks, unpacked in the browser at runtime, with React and Babel pulled from a CDN and a runtime that re-rendered inline styles on every state change. It rendered the design faithfully. It also spent a quarter of a megabyte of JavaScript and a full render pass before anything appeared.",
          "There is a real temptation at this point to keep the machinery. It works, after all, and keeping it is less thinking than replacing it. But the page is one static document. Nothing on it needs a component tree, a compiler in the browser, or a style engine that recomputes on state change.",
        ],
      },
      {
        heading: "The decision was to remove, not add",
        body: [
          "The rebuild shipped static HTML, CSS and vanilla JavaScript bundled by Vite. Roughly 250 kB of prototype JavaScript came out. What went back in was 3.7 kB that does nothing but handle interaction: menus, disclosures, two dialogs.",
          "That ratio is worth sitting with. The visible behaviour of the page did not change at all. Every menu still opens, every dialog still traps focus, every disclosure still expands. The entire difference was framework and runtime that the page never needed, carried along because it came in the box.",
          "The other half of the removal was network. Every font and image is self-hosted, so the production page makes no third-party requests whatsoever. A page that reaches out to a CDN is a page whose first paint depends on somebody else's uptime and somebody else's TLS handshake.",
        ],
      },
      {
        heading: "Keeping the inline styles on purpose",
        body: [
          "The one thing I did not touch was the thousand-odd inline style attributes, and that surprises people.",
          "In this file the inline styles are the design specification. Every dimension, every colour, every clamp() lives there. There is no separate stylesheet that says what the design is. Rewriting all of them into semantic class names would have been a large, mechanical, entirely untestable transformation whose only possible outcomes were 'identical' and 'subtly wrong'.",
          "So the markup was preserved verbatim, and only the parts a static file genuinely cannot express were moved out. That is a smaller, more honest change, and it is one you can verify section by section against the approved design rather than hoping.",
          "The general form of this: when a generated artefact is the source of truth for something, converting it to a nicer representation is not a refactor. It is a re-specification, and it needs the same review the original got.",
        ],
      },
      {
        heading: "Three things that had to move",
        body: [
          "Hover states. The prototype expressed them as custom attributes its runtime read and applied. A static page has no runtime, so those became real CSS hover rules. They need !important, because the elements they target carry inline styles, and the prototype's own generated stylesheet did exactly the same thing for exactly the same reason.",
          "Open and closed state. The prototype toggled inline display values from JavaScript. That became the hidden attribute plus aria-expanded and a class, with CSS deciding appearance. This is a straight upgrade: the state is now in the accessibility tree instead of only in a style property, so a screen reader can tell a collapsed section from an expanded one.",
          "The responsive split. The prototype computed desktop versus mobile in JavaScript from window.innerWidth and rendered accordingly. That became a media query at the same breakpoint. The behaviour is identical and the experience is not: the correct layout is now painted on the first frame, rather than the wrong one being painted and then corrected once JavaScript runs.",
          "All three follow the same pattern. Each one takes a decision the prototype made at runtime, in JavaScript, and moves it into a declaration the browser can act on before any script executes.",
        ],
      },
      {
        heading: "A rebuild finds the bugs a demo hides",
        body: [
          "Going through an approved design element by element is the most thorough review it will ever get. Four defects turned up that nobody had noticed in months of looking at the prototype.",
          "The page wrapper closed early, part-way down the document. Every section after that point never inherited the light text colour, so one heading rendered black on a near-black background. Invisible in the design tool, which applied colours its own way; plainly broken in a browser.",
          "A dialog contained an iframe whose source was an unresolved template binding, so every single page load fetched a URL that did not exist. Six links pointed at the section they were already inside. And two grid definitions forced horizontal scrolling below 400px.",
          "None of these were introduced by the rebuild. All of them were in the thing that had been signed off. That is not a criticism of the review, it is the nature of reviewing a prototype: you check whether it looks right, and it did.",
        ],
      },
      {
        heading: "What I would tell someone facing the same file",
        body: [
          "Work out what part of the artefact is the specification and what part is the delivery mechanism. Keep the first exactly. Replace the second freely.",
          "Do not treat 'it already works' as a reason to ship the runtime. A prototype's job is to be convincing quickly; a production page's job is to be cheap and correct for every visitor, forever. Those are different jobs with different right answers.",
          "Expect to find defects, and raise them rather than quietly fixing them into something else. Every one of the four here was reported as a fix with a reason, not absorbed into a redesign.",
        ],
      },
    ],
    related: [{ label: "ERTH case study", href: "/work/erth" }],
  };
