import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-a-portfolio-like-a-production-application",
  title: "Testing a Portfolio Like a Production Application",
  description:
    "This site now runs two checks against a started production build on every push: an HTTP crawl of routes, links, metadata, structured data, the feed and private terms, and a real-browser pass over clicks, the mobile menu, ten screen widths and accessibility. What they found on the first run.",
  date: "2026-11-27",
  category: "Full-Stack Development",
  tags: ["Testing", "Next.js", "Playwright", "Accessibility", "CI"],
  contentType: "Case Study",
  searchIntent: "informational",
  relatedPosts: [
    "one-client-import-shipped-every-project-to-the-browser",
    "a-listing-page-from-2-5-seconds-to-20-ms-without-a-cache-layer",
  ],
  sections: [
    {
      heading: "Why test a portfolio at all?",
      body: [
        "A portfolio is read by the people deciding whether to hire or work with you. A project card that does nothing when clicked, a page that scrolls sideways on a phone, or a private name in a script costs more there than almost anywhere else. Typecheck, lint and a successful build say the code compiles; they say nothing about what a visitor gets.",
      ],
    },
    {
      heading: "What does the HTTP check cover?",
      body: [
        "`npm run check:site` starts from the sitemap of a running production build and fails on anything a visitor or a crawler would hit:",
        {
          type: "list",
          items: [
            "every sitemap URL answers 200, with no duplicates and no private routes",
            "every internal link and image on every page resolves, with redirect loops and chains reported",
            "every page has a unique title, a description, a canonical URL matching itself, Open Graph and Twitter tags, and exactly one h1",
            "every JSON-LD block parses, the RSS feed is well formed and every item links to a page in the sitemap",
            "robots.txt names the sitemap and excludes the private routes; unknown URLs answer 404",
            "no protected term appears in any page, the feed, the sitemap, a redirect target or a browser JavaScript chunk",
          ],
        },
        "The protected terms are read at run time from the site's own confidentiality registry, so the check adds no new copy of them to the public repository.",
      ],
    },
    {
      heading: "What does the browser check cover?",
      body: [
        "`npm run check:browser` drives an installed Chrome or Edge through `playwright-core`, so CI downloads no browser. It loads pages at desktop and phone sizes and records console errors, uncaught exceptions, hydration warnings, failed requests, broken images and horizontal overflow. It runs a ten-width viewport matrix from 320 to 1920 pixels, clicks every project link on the homepage and the work page and asserts the page it lands on, exercises the mobile menu (navigation, Escape, outside tap, browser back and forward), the work filters and refresh, runs axe-core for WCAG 2 A and AA, and measures layout shift and JavaScript weight.",
      ],
    },
    {
      heading: "What did the first run find?",
      body: [
        {
          type: "table",
          head: ["Finding", "Cause", "Fix"],
          rows: [
            ["/work took 2.3 to 3.2 seconds per request", "Article counts re-ran a text projection over every article for every project", "One pass per day, cached ([details](/blog/a-listing-page-from-2-5-seconds-to-20-ms-without-a-cache-layer))"],
            ["Tall sections could stay invisible", "The scroll reveal waited for 15 % of an element to be visible, which a section taller than about six screens never reaches", "Reveal on the first visible pixel; content also shows without JavaScript"],
            ["Mobile menu stayed open after browser back", "It closed only from a link's click handler", "Close on any route change, on an outside tap, and return focus on Escape"],
            ["Low contrast on small text", "Two colour tokens were just under 4.5:1, worse on tinted panels", "Tokens adjusted to at least 4.5:1 in both themes"],
            ["A sitemap URL redirected", "An alias redirect pointed the wrong way", "Redirects now lead only to public URLs"],
            ["Long inline code overflowed on phones", "Unbreakable tokens in prose", "Allow inline code to wrap anywhere"],
          ],
          caption: "Findings from the first runs, each fixed at its cause.",
        },
      ],
    },
    {
      heading: "What did the checks get wrong?",
      body: [
        "Several first failures were the tests, not the site, and each was fixed in the test rather than by loosening it. A comma-separated selector with an attribute filter appended only filtered its last part, so every click picked the first project. A case-insensitive match for a short acronym fired inside the word \"afterthought\". Contrast was measured while a fade-in was still running, so axe now runs with reduced motion. A browser restoring a page from its back-forward cache resolves the back action before the URL updates, so the test now waits for the URL.",
      ],
    },
    {
      heading: "Where do the checks run?",
      body: [
        "In CI on every push and pull request, after typecheck, lint, the confidentiality suite and the build, against the built site started on the runner. After a merge they run again against the live domain. The site is listed on the [work page](/work) alongside the systems it describes.",
      ],
    },
  ],
  related: [{ label: "All projects", href: "/work" }],
};
