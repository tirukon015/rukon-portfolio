import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-client-import-shipped-every-project-to-the-browser",
  title: "One Client Import Shipped Every Project to the Browser",
  seoTitle: "How One Client Import Shipped a Whole Dataset to the Browser",
  description:
    "A client component on this site imported one small value from a content module, and the bundler shipped the whole module, every project included, to every visitor. How it was found, why render-time hiding did not help, and the server-only boundary that now makes it a build error.",
  date: "2026-11-27",
  category: "Full-Stack Development",
  tags: ["Next.js", "React Server Components", "Security", "Bundling", "TypeScript"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  relatedPosts: [
    "enforcing-architecture-boundaries-with-a-test-in-nextjs",
    "testing-a-portfolio-like-a-production-application",
  ],
  sections: [
    {
      heading: "What went wrong?",
      body: [
        "The `/work` page on this portfolio has a category filter. The filter is a client component, because it holds state. It needed the list of categories, and the categories lived in `content/projects.ts`, next to the full data for every project. So the filter imported one value from that module: `import { projectCategories } from \"@/content/projects\"`.",
        "That one value brought the whole module with it. The module also builds the public project list at import time, so the bundler could not drop the rest as unused. The browser chunk for `/work` contained every project in full: the long-form case-study text, the original names that the site otherwise replaces with public descriptions, and a project that is deliberately hidden from the site.",
      ],
    },
    {
      heading: "Why did the existing safeguards miss it?",
      body: [
        "The site already had a confidentiality layer: a projection step that rewrites each project into its public form before rendering, and a test suite that checks the rendered output. Both worked as designed. The rendered pages were clean.",
        "The leak was not in the rendering. It was in the JavaScript that ships to the browser, which nobody reads unless they look for it. Render-time sanitising is a presentation rule, not a security boundary: anything the browser downloads is public, whether or not a page displays it.",
      ],
    },
    {
      heading: "How was it found?",
      body: [
        "By crawling the live site the way a visitor's browser would, not by reading the source. The audit downloaded every page in the sitemap and every JavaScript chunk those pages reference, then searched all of it for the terms the site is supposed to keep private. The pages came back clean; one chunk did not. The chunk was referenced only from `/work`, and its contents pointed straight at the project module.",
      ],
    },
    {
      heading: "What was the fix?",
      body: [
        "Two changes: one removes the cause, the other makes it impossible to repeat silently.",
        {
          type: "list",
          ordered: true,
          items: [
            "Move the categories into their own small module, `content/project-categories.ts`, which holds no project data. The client filter imports from there.",
            "Mark every module that holds full project or article data as server-only, with `import \"server-only\"` at the top. A client component that imports a value from one of them now fails the build instead of shipping the data.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          caption: "The first line of each data module after the fix.",
          code: 'import "server-only";\nimport { projectProject } from "@/lib/confidentiality/projector";\nimport { projectCategories } from "./project-categories";',
        },
        "Type-only imports are still fine in client components, because `import type` is erased before bundling. The filter keeps its types and loses the data.",
      ],
    },
    {
      heading: "What changed after the fix?",
      body: [
        "The filter later stopped receiving project objects at all. The `/work` cards are now rendered on the server, and the filter gets only each card's slug, its categories and the finished markup. Scanning the production build's browser chunks after deployment found no project data and no private term in any of them.",
        "Scripts that import these modules outside Next.js, such as the confidentiality test suite, now need the `react-server` export condition (`tsx --conditions=react-server …`), because `server-only` throws anywhere else. That is the guard working, not a problem with it.",
      ],
    },
    {
      heading: "What is the general lesson?",
      body: [
        "In the App Router, \"server component by default\" protects you only until the first `\"use client\"` file imports a value. From that point the module and everything it imports is a candidate for the browser. If a module holds data that must never reach a visitor, say so in the code with `server-only`, and verify the shipped JavaScript, not just the rendered HTML.",
        "The site's own audit trail for this change is summarised on the [work page](/work); the checks that now run on every push are described in [Testing a Portfolio Like a Production Application](/blog/testing-a-portfolio-like-a-production-application).",
      ],
    },
  ],
  related: [{ label: "All projects", href: "/work" }],
};
