import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "theme-specific-logos-without-a-flash",
  title: "Theme-Specific Logos Without a Flash: Let CSS Pick, Not useTheme()",
  description:
    "A logo with an opaque white background became a white block on the dark theme. Swapping it in CSS on data-theme, not with useTheme(), fixed it on the first frame.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Next.js", "Dark Mode", "next-themes", "CSS", "Accessibility", "Server Components"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Dark Mode Logo Swap Without a Hydration Flash",
  relatedProjects: ["rpoms", "rpoms-print-engine"],
  relatedPosts: [
    "nextjs-opengraph-metadata-replaces-not-merges",
    "security-headers-nextjs-and-why-csp-waited",
    "one-json-ld-graph-person-referenced-by-id",
  ],
  sections: [
    {
      heading: "The problem: a logo that only works in one theme",
      body: [
        "This site has a dark and a light theme. Project wordmarks are shown on cards and project pages, and some of the supplied logo files have an opaque background rather than a transparent one. The RPOMS mark is dark artwork on white. On the light theme it looked fine. On the dark theme it rendered as a white rectangle. Nothing in the file could fix that, because the background is part of the image.",
        "The answer is a second file per theme. The interesting part is how to choose between them without the page showing the wrong one first. This note is for anyone with theme-specific images in a Next.js app using `next-themes`.",
      ],
    },
    {
      heading: "Why useTheme() is the wrong tool here",
      body: [
        "The obvious approach is a client component that reads `useTheme()` and renders one `<Image>` or the other. It has two costs. The theme is not known on the server, so the first render has to guess, and the correct image only appears after the provider mounts in the browser: a visible flash for anyone whose theme differs from the guess. And the card holding the logo has to become a client component just to make that choice.",
        "But the theme is already known before first paint. `next-themes` is configured with `attribute=\"data-theme\"`, so it sets `data-theme` on the root element from a small inline script before the page renders. Anything CSS can select on that attribute is correct on the first frame. (The same layout-level defaults problem shows up in metadata too; see [Next.js Open Graph Metadata Replaces, It Doesn't Merge](/blog/nextjs-opengraph-metadata-replaces-not-merges).)",
      ],
    },
    {
      heading: "The fix: render both, let CSS hide one",
      body: [
        "Each project's image entry can carry an optional `srcDark` next to `src`. The RPOMS and Print Engine marks use it. When it is present, `ProjectMark` renders both images with classes that say which theme they belong to:",
        {
          type: "code",
          lang: "tsx",
          code: "<Image src={src} alt={alt} width={width} height={height}\n  className={\"theme-light-only \" + className} />\n<Image src={srcDark} alt={alt} width={width} height={height}\n  className={\"theme-dark-only \" + className} />",
          caption: "Simplified from src/components/ui/project-mark.tsx.",
        },
        "The CSS treats dark as the foundation theme, so the dark variant shows by default and the light variant is opted into:",
        {
          type: "code",
          lang: "css",
          code: ".theme-light-only {\n  display: none;\n}\n\n:root[data-theme=\"light\"] .theme-light-only {\n  display: block;\n}\n\n:root[data-theme=\"light\"] .theme-dark-only {\n  display: none;\n}",
          caption: "From src/app/globals.css.",
        },
        "The component stays a server component, the right mark is painted on the first frame, and there is no hydration mismatch, because the server renders identical markup for both themes. A project without a `srcDark` renders a single image as before.",
      ],
    },
    {
      heading: "Accessibility: one logo announced, not two",
      body: [
        "Both images carry the same alt text, which would read twice if both were exposed. They are not: `display: none` removes an element from the accessibility tree as well as from the layout, so a screen reader announces exactly one wordmark in either theme. That is a reason to hide with `display: none` rather than with opacity or off-screen positioning, which would leave the hidden copy announced.",
      ],
    },
    {
      heading: "The trade-off, and when to use it",
      body: [
        "The cost is that both files are in the HTML and either may be downloaded. For small wordmarks that is trivial. For large photographs that differ by theme I would reach for a `<picture>` element with a `prefers-color-scheme` media query instead, accepting that it follows the system setting rather than a user's in-site choice.",
        "For logos and icons, the pattern is cheap and robust: if the information is already on the root element before paint, select on it in CSS instead of reading it in JavaScript after hydration. The systems behind these two marks are [RPOMS](/work/rpoms) and the [RPOMS Print Engine](/work/rpoms-print-engine).",
      ],
    },
  ],
};
