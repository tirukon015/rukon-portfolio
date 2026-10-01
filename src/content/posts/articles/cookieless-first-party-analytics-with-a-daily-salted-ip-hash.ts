import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "cookieless-first-party-analytics-with-a-daily-salted-ip-hash",
  title: "First-Party Analytics Without Cookies: A Daily-Rotating Salted IP Hash",
  description:
    "Page views and link clicks recorded by the site itself, with no third-party tracker and no cookies. A salted IP hash that changes daily, beacons that survive navigation, and what is still stored.",
  date: "2027-01-06",
  category: "Full-Stack Development",
  tags: ["Analytics", "Privacy", "Next.js", "Supabase", "sendBeacon", "Vercel"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Cookieless Analytics With a Daily IP Hash",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "one-postgres-function-for-a-whole-analytics-dashboard",
    "analytics-retention-rollups-with-pg-cron",
    "keeping-contact-details-off-a-public-link-page",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "The problem: knowing what people tap, without a tracker",
      body: [
        "[rukon-link](/work/rukon-link) is the page behind my personal QR code, live at link.rukon.dev: social links, a link to my portfolio, and contact details released only on request. I wanted to know how many people open it, where they come from and which links they tap. I did not want a third-party analytics script, a cookie banner, or a table of IP addresses. This article is for anyone building small first-party analytics in Next.js and wanting to be precise about what it does and does not store.",
        "The pieces are a tiny client component that sends events, one API route that validates and stores them, and a Supabase PostgreSQL table that browsers cannot read or write directly.",
      ],
    },
    {
      heading: "What is stored, and what is not",
      body: [
        "Being honest here matters more than the implementation, so this comes first.",
        {
          type: "table",
          head: ["Stored per event", "Not stored"],
          rows: [
            ["Event type (page view, link click, contact request) and link key", "The raw IP address"],
            ["Path, referrer and a derived source such as a UTM tag or referring site", "Any cookie"],
            ["User agent, and the device type, browser and OS parsed from it", "Precise location or any browser permission"],
            ["Country and city from the hosting edge's headers", "Anything sent to a third party"],
            ["A daily-rotating salted hash of the IP", ""],
            ["A random visitor id and session id from browser storage, when available", ""],
          ],
        },
        "The last row is the one to be clear about. \"No cookies\" is true, but the page does keep identifiers in the browser: a random UUID in `localStorage` as `rl_vid`, used to count unique visitors across days, and another in `sessionStorage` as `rl_sid`, used to count visits. They are random, contain nothing about the person, and are only read by this site, but they are persistent identifiers on the visitor's device, and the site's privacy page says so: \"a random anonymous ID stored in your browser, not a cookie\". In private mode or with storage blocked, the code catches the error and sends no id, and events are still counted, just not de-duplicated.",
      ],
    },
    {
      heading: "The daily-rotating salted IP hash",
      body: [
        "The server still needs some notion of \"the same network\" for two jobs: rate limiting, and counting visitors who have no stored id. It derives a hash and never keeps the address:",
        {
          type: "code",
          lang: "ts",
          code: "export function ipHash(req: Request) {\n  const day = new Date().toISOString().slice(0, 10);\n  return createHash(\"sha256\")\n    .update(`${clientIp(req)}|${env.analyticsSalt ?? \"dev-only-salt\"}|${day}`)\n    .digest(\"hex\");\n}",
          caption: "From lib/server/request-info.ts. The client IP is the first entry of x-forwarded-for, used only to compute this.",
        },
        "Including the UTC date means the same address produces a different hash every day, so hashes cannot be linked across days. The secret salt, held only in a server environment variable, stops anyone with just the database from recomputing hashes for guessed addresses. It is worth being precise about the limit of that: whoever holds the salt could, for a given day, test candidate addresses against a stored hash, because the address space is small. The protection is that the salt and the data are kept apart, not that the hash is mathematically irreversible.",
      ],
    },
    {
      heading: "Sending events that survive navigation",
      body: [
        "A link click is recorded at the moment the visitor leaves the page, which is exactly when an ordinary `fetch` can be cancelled. The tracker uses `navigator.sendBeacon`, which the browser completes after unload, and falls back to `fetch` with `keepalive: true` if the beacon is unavailable or refused:",
        {
          type: "code",
          lang: "ts",
          code: `const body = JSON.stringify({ ...event, ...analyticsContext() });
const blob = new Blob([body], { type: "application/json" });
if (!navigator.sendBeacon?.("/api/track", blob)) {
  fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}`,
          caption: "From components/Tracker.tsx.",
        },
        "Clicks are captured with one listener on the document in the capture phase, for any element marked `data-track=\"<link key>\"`. It also listens for `auxclick` and keeps middle-button clicks, because opening a link in a new tab is still a tap on that link. One page view is sent per load.",
      ],
    },
    {
      heading: "The server side: refuse quietly, store little",
      body: [
        {
          type: "list",
          ordered: true,
          items: [
            "Requests whose `Sec-Fetch-Site` or `Origin` header shows another site get an empty 204, so a probe learns nothing. A client that sends neither header, such as a script, is not stopped by this check, which is why the next ones exist.",
            "Only two event types are accepted, and a link click must name a key from the site's own list of trackable links.",
            "Bot traffic is dropped by user-agent pattern: crawlers, link previewers such as WhatsApp and Telegram, headless browsers and command-line clients.",
            "A rate limit of 60 events per minute per IP hash.",
            "Text fields are trimmed, stripped of control characters and length-capped, and the table's CHECK constraints cap them again.",
          ],
        },
        "Country and city come from the hosting edge's `x-vercel-ip-country` and `x-vercel-ip-city` headers, so there is no geolocation lookup and no permission prompt; the country code is turned into a name with `Intl.DisplayNames`. These headers only exist once deployed, so local development shows no locations.",
        "Two limitations are stated on the project page. The analytics rate limit is an in-memory counter per server instance, so it blunts floods rather than enforcing a global limit. And user-agent bot filtering only catches clients that identify themselves.",
      ],
    },
    {
      heading: "Where the data goes next",
      body: [
        "The dashboard turns these rows into totals for a chosen date range in the site owner's time zone, with one SQL function, and old events are rolled up into daily totals and deleted after a retention period, 90 days by default. Time zones matter here as much as they did in [The Business Day Is Not the Server Day](/blog/the-business-day-is-not-the-server-day). The whole project is described on the [rukon-link project page](/work/rukon-link).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
