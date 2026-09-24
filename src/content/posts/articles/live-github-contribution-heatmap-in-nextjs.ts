import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "live-github-contribution-heatmap-in-nextjs",
  title: "A Live GitHub Contribution Heatmap in Next.js, Without a Token in the Browser",
  description:
    "How this site's homepage renders real GitHub contribution data: a server-fetched calendar cached for an hour, a documented API with an undocumented fallback, and one small client island for the tooltip.",
  date: "2026-09-24",
  category: "Full-Stack Development",
  tags: ["Next.js", "GitHub API", "ISR", "React Server Components", "Accessibility"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  relatedPosts: [
    "gating-a-cv-download-behind-a-server-signed-grant",
    "building-software-in-cyberjaya-the-development-environment",
  ],
  sections: [
    {
      heading: "What it had to be, and what it must not become",
      body: [
        "The brief for the homepage was one specific thing: a real GitHub contribution heatmap, the 53 by 7 grid, updated from GitHub rather than maintained by hand, with a hover showing the real date and count. Not a dashboard. No repository list, no follower count, no language chart. One calendar, integrated into the page rather than embedded as someone else's widget.",
        "Two constraints followed from that. The data has to come from the server, so no token is ever shipped to a browser. And the homepage must not make a GitHub request per visitor, because a personal site does not need a rate-limit problem.",
      ],
    },
    {
      heading: "Two sources, chosen by an environment variable",
      body: [
        "The documented path is GitHub's GraphQL API. The `contributionsCollection` field carries a `contributionCalendar` with a total and a list of weeks, and each day has a date, a count, a weekday, GitHub's own colour and a level from `NONE` to `FOURTH_QUARTILE`. It needs an authenticated request, but a fine-grained personal access token with no repository permissions at all is enough. Querying `viewer`, the token's own account, is what lets private activity count toward the total when the profile setting to show it is on; the calendar is still only dates and counts, so nothing about a private repository can come back with it.",
        {
          type: "code",
          lang: "graphql",
          code: `query ContributionCalendar {
  viewer {
    login
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel color weekday }
        }
      }
    }
  }
}`,
          caption: "The login is read back and compared with the configured account, so a token for the wrong account renders nothing rather than someone else's year.",
        },
        "The fallback is the HTML fragment GitHub renders for the profile calendar itself. It is public, needs no token, and it is undocumented: a table of `td` cells carrying `data-date` and `data-level`, with a separate `tool-tip` element per cell holding the human-readable count. Parsing it is a few regular expressions and a join on the cell id. It exists so the section works in development with no setup and degrades rather than disappears if the token is ever missing in production. I would not build on it alone, because GitHub can change that markup without telling anyone.",
        "The selection is the same pattern the rest of my work uses: if `GITHUB_TOKEN` is set, use the API; otherwise use the fragment. Both fail soft. Any error returns `null` and the section renders nothing, which is better than an empty frame with a spinner in it.",
      ],
    },
    {
      heading: "Caching, and a fetch option that quietly disables it",
      body: [
        "In Next.js 16, `fetch` requests are not cached by default. Left alone, a server component would ask GitHub on every render. The fix is one option:",
        {
          type: "code",
          lang: "ts",
          code: `const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: \`Bearer \${token}\` },
  body: JSON.stringify({ query, variables: { login } }),
  next: { revalidate: 3600, tags: ["github-contributions"] },
});`,
        },
        "With that, the homepage moves from fully static to incremental static regeneration with a one-hour window: at most one GitHub request per hour per deployment, whatever the traffic. The tag is there so a future route handler could invalidate it on demand.",
        {
          type: "callout",
          label: "The one that caught me",
          text: "I had added an `AbortSignal.timeout()` to the request, as I would to any outbound call. The Next.js fetch reference states that passing a signal opts the request out of the data cache. That would have turned one request an hour into one per render, silently. The signal came out. The deadline is now a `Promise.race` around the call: if GitHub has not answered in eight seconds the section renders nothing for that render, while the fetch itself is left to finish and fill the cache for the next one.",
        },
        "This project does not enable Cache Components, so this is the previous caching model rather than `use cache`. Switching the whole app to Cache Components for one component is a larger change than the feature warrants, and the documentation covers both.",
      ],
    },
    {
      heading: "Rendering the grid on the server",
      body: [
        "The calendar is a server component. It fetches, builds the month labels (one label over the first week of each new month, skipping any that would sit within two columns of the previous one), and renders a CSS grid: one column per week, seven rows plus a header row, 11px cells with 3px gaps. There is no chart library and no client-side data fetching.",
        "Colour is five levels mapped onto the site's accent with `color-mix`, so the calendar reads as part of the page in both themes rather than as a GitHub-green embed:",
        {
          type: "code",
          lang: "css",
          code: `.heat   { background: var(--color-bg-elevated-2); }
.heat-1 { background: color-mix(in oklab, var(--color-accent) 30%, var(--color-bg-elevated-2)); }
.heat-2 { background: color-mix(in oklab, var(--color-accent) 55%, var(--color-bg-elevated-2)); }
.heat-3 { background: color-mix(in oklab, var(--color-accent) 80%, var(--color-bg-elevated-2)); }
.heat-4 { background: var(--color-accent-strong); }`,
        },
        "Each cell carries `data-date` and a `data-label` such as \"305 contributions on 22 September 2026\". That label is the only thing the tooltip needs, and it is computed once on the server.",
      ],
    },
    {
      heading: "One client island, for the hover",
      body: [
        "The tooltip is the single piece that needs JavaScript. Rather than 371 cells each with a handler, one wrapper listens for `pointerover` and `pointerout` and reads the label off whichever cell the event came from. One element is positioned above the cell; nothing is rendered until something is hovered. The same wrapper scrolls the calendar to its right-hand end on mount, because on a phone the grid overflows sideways and the recent weeks are the interesting ones.",
        "That keeps the client bundle for the feature to a few hundred bytes of behaviour. A grep of the built client chunks for `api.github.com`, the token name or the fragment URL returns nothing, which is the check I would suggest anyone run after wiring a server-only data source.",
      ],
    },
    {
      heading: "Accessibility without 371 tab stops",
      body: [
        "Making every cell focusable would give a keyboard user a year of tab presses. Instead the grid is one `role=\"img\"` with a full-sentence `aria-label`: the total, and the first and last dates. The total, the date range and a legend are also real text beside the grid. Hover detail is a pointer affordance; the summary is the accessible one.",
        "Reduced motion needs nothing special here. Cells have a small scale on hover and no animation otherwise, and the site-wide reduced-motion rule already shortens transitions to nothing.",
      ],
    },
    {
      heading: "What I would change with more time",
      body: [
        {
          type: "list",
          items: [
            "A revalidation route that invalidates the tag from a GitHub webhook, so a push shows up in minutes rather than within the hour. It is the reason the tag exists.",
            "Weekday and month labels that adapt below 400px. Today the grid scrolls; a compact half-year view would be nicer on the smallest phones.",
            "Private contribution counts. The API only includes them when the profile setting to show private contributions is on, and that is a GitHub setting rather than a code change.",
          ],
        },
        "The implementation is on the [homepage](/#activity). If your site is on the same stack, the whole thing is a data function, a server component and a forty-line client wrapper.",
      ],
    },
  ],
  related: [{ label: "The calendar on the homepage", href: "/#activity" }],
};
