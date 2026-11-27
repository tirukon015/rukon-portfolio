import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "a-listing-page-from-2-5-seconds-to-20-ms-without-a-cache-layer",
  title: "A Listing Page From 2.5 Seconds to 20 ms Without a Cache Layer",
  description:
    "The work page on this site spent 2.3 to 3.2 seconds per request recomputing the same article projection fourteen times. Counting in one pass, computing the published list once per day, and rendering the cards on the server brought it to about 20 ms.",
  date: "2026-11-27",
  category: "Full-Stack Development",
  tags: ["Next.js", "Performance", "React Server Components", "TypeScript"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  relatedPosts: [
    "testing-a-portfolio-like-a-production-application",
    "one-client-import-shipped-every-project-to-the-browser",
  ],
  sections: [
    {
      heading: "Where did the time go?",
      body: [
        "Each project card on `/work` shows how many articles draw on that project. The page computed the counts with a loop: for each project, ask for that project's articles. Asking for a project's articles meant asking for every published article in its public form, and producing the public form runs a set of text replacements over every field of every article. With fourteen projects and 173 articles, every request ran that projection about fourteen times over the whole library.",
        "The page renders on each request, so the cost was paid by every visitor: 2.3 to 3.2 seconds before the first byte, measured on the production build running locally.",
      ],
    },
    {
      heading: "Why not just add a cache?",
      body: [
        "A cache in front of slow code hides it until the cache is cold, invalidated or bypassed, and here the slow part was not expensive work worth keeping; it was the same work repeated. Removing the repetition is simpler and also fixes every other caller of the same function.",
      ],
    },
    {
      heading: "What changed?",
      body: [
        {
          type: "list",
          ordered: true,
          items: [
            "Count in one pass. A new `getPostCountsByProject(slugs)` takes the published list once and counts for every project from it.",
            "Compute the published list once per day. Which articles are published changes only when the date does, because articles are released on a schedule. The public list is computed on the first call of a Malaysian calendar day and reused until the next; callers get a copy, so nothing can mutate the shared list.",
            "Render the cards on the server. The client-side filter now receives each card's slug, categories and finished markup, instead of full project objects it then rendered itself.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          caption: "The published list, computed once per day per server instance.",
          code: 'export function publishedPosts(isAuthorized = false): BlogPost[] {\n  const today = todayInMalaysia();\n  const cache = isAuthorized ? authorizedCache : publicCache;\n  if (cache.day !== today) {\n    const raw = allPosts.filter((p) => p.date <= today);\n    cache.posts = isAuthorized ? raw : raw.map((p) => projectBlogPost(p, false));\n    cache.sorted = [...cache.posts].sort((a, b) => (a.date < b.date ? 1 : -1));\n    cache.day = today;\n  }\n  return [...cache.posts];\n}',
        },
      ],
    },
    {
      heading: "What was the result?",
      body: [
        {
          type: "table",
          head: ["Measure", "Before", "After"],
          rows: [
            ["/work time to first byte (local production build)", "2.3–3.2 s", "about 20 ms"],
            ["/work HTML document (uncompressed)", "416 KB", "294 KB"],
            ["Article page time to first byte", "about 200 ms", "about 18 ms"],
          ],
          caption: "Repeated requests against the same local production build.",
        },
        "The same change made the site ready for a larger library: the blog index is now paginated at 40 articles a page, so its size stays flat as articles are added, and listing pages no longer do work proportional to projects times articles.",
      ],
    },
    {
      heading: "How is a regression caught next time?",
      body: [
        "The browser check that runs in CI records time to first byte, largest contentful paint, layout shift and JavaScript weight for the main pages, and the [testing write-up](/blog/testing-a-portfolio-like-a-production-application) describes how. The page itself is the [work index](/work).",
      ],
    },
  ],
  related: [{ label: "All projects", href: "/work" }],
};
