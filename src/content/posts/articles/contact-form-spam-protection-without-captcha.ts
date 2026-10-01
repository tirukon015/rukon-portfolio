import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "contact-form-spam-protection-without-captcha",
  title: "Contact Form Spam Protection Without a CAPTCHA, and Its Honest Limits",
  description:
    "A honeypot, a minimum fill time, a same-site check, strict validation and a database-backed rate limit on a Next.js contact form. What each layer stops, and which ones a script can walk past.",
  date: "2027-01-11",
  category: "Full-Stack Development",
  tags: ["Spam Protection", "Forms", "Rate Limiting", "Next.js", "Supabase", "Security"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Contact Form Anti-Spam Without CAPTCHA",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "keeping-contact-details-off-a-public-link-page",
    "cookieless-first-party-analytics-with-a-daily-salted-ip-hash",
    "rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip",
  ],
  sections: [
    {
      heading: "The problem: a public form on a page anyone can scan",
      body: [
        "[rukon-link](/work/rukon-link) releases my contact details to a visitor who asks through a short form, as described in [Keeping Your Email and Phone Off a Public Link Page](/blog/keeping-contact-details-off-a-public-link-page). That form is the one place where the page accepts input from strangers, so it needs spam protection. A CAPTCHA would add a third-party script and friction to a page people open from a QR code on a phone. This article walks through the cheaper layers I used instead, in the order the server applies them, and is explicit about which ones a deliberate script can bypass. Most write-ups of these techniques leave that part out.",
      ],
    },
    {
      heading: "The layers, in order",
      body: [
        {
          type: "table",
          head: ["Check", "What it stops", "Who can walk past it"],
          rows: [
            ["Same-site request (Sec-Fetch-Site, else Origin)", "Cross-site form posts from other pages", "Any client that sends neither header, such as curl"],
            ["Honeypot field named \"company\"", "Bots that fill every input", "Anything that leaves it empty"],
            ["At least 2.5 s between opening and sending", "Instant automated submissions", "Anything that sends an older timestamp, since the client supplies it"],
            ["Validation of every field", "Malformed and oversized input, links or HTML in the name", "Nothing: it is enforced on the server and again by the database"],
            ["Rate limit per hashed network: 3 per 10 minutes, 10 per day", "Volume", "Many networks, or a narrow race between parallel requests"],
          ],
          caption: "From app/api/contact-request/route.ts and lib/server/validate.ts.",
        },
      ],
    },
    {
      heading: "Same-site, honeypot and fill time",
      body: [
        "The same-site check prefers the `Sec-Fetch-Site` header, which modern browsers set themselves and page scripts cannot change; it must be `same-origin` or `same-site`. Without it, the `Origin` host must match the request host. If neither header is present, the request is allowed, so ordinary browsers and older ones keep working. That last rule is what lets a script through, and it is a deliberate trade, not an oversight.",
        "The honeypot is a text input labelled \"Company\", positioned off-screen with `tabIndex={-1}` and `autoComplete=\"off\"` so people and password managers skip it. A form-filling bot sees an input and fills it, and any value there gets a 403.",
        "The fill-time check records the moment the sheet opened and sends it with the form. A submission less than 2,500 ms later is refused with a friendly \"That was quick!\" and a 429. Because the timestamp comes from the client, a script can simply send an old one. It stops naive automation and nothing more.",
      ],
    },
    {
      heading: "Validation that cannot be bypassed",
      body: [
        "Every field is cleaned on the server: trimmed, control characters removed (newlines are kept only in the message), and cut to a maximum length. Then it is validated: a name of at least two characters with no URL or HTML tag in it, a plausible email address, an optional phone number with at least six digits, a message of at most 1,000 characters, at least one requested method, and an explicit consent flag that must be `true`.",
        "The database repeats the important limits as CHECK constraints, including that at least one contact method was requested, so even a bug in the route could not store an empty or oversized request. This is the one layer a script cannot walk past, because it is a property of the data rather than of the request.",
      ],
    },
    {
      heading: "A rate limit stored in the database",
      body: [
        "The real bound on volume is a rate limit stored in PostgreSQL, keyed by the daily-rotating salted hash of the client's network address rather than the address itself. Before inserting, the route counts that hash's requests in the last ten minutes and the last 24 hours, with two head-only count queries run in parallel:",
        {
          type: "code",
          lang: "ts",
          code: `const since = (ms: number) => new Date(Date.now() - ms).toISOString();
const [recent, today] = await Promise.all([
  db.from("link_contact_requests").select("id", { count: "exact", head: true })
    .eq("ip_hash", hash).gte("created_at", since(10 * 60_000)),
  db.from("link_contact_requests").select("id", { count: "exact", head: true })
    .eq("ip_hash", hash).gte("created_at", since(24 * 3_600_000)),
]);
if ((recent.count ?? 0) >= 3 || (today.count ?? 0) >= 10) {
  return fail("Too many requests from your network. Please try again later.", 429);
}`,
          caption: "From app/api/contact-request/route.ts (line breaks added). An index on (ip_hash, created_at) serves both counts.",
        },
        "Unlike an in-memory counter, this holds across every serverless instance, because the count is the stored data. It has two honest gaps. It is check-then-insert, so several requests fired in parallel can all pass the count before any of them is written. And because the hash rotates daily, the 24-hour window effectively resets at midnight UTC. Neither matters much for a contact form on a personal page; both would matter for anything that costs money per request. The hash itself is explained in [First-Party Analytics Without Cookies](/blog/cookieless-first-party-analytics-with-a-daily-salted-ip-hash).",
      ],
    },
    {
      heading: "Is it enough?",
      body: [
        "For this page, yes. The layers cost nothing for a real visitor, make bulk collection slow and visible, and every accepted request is a row in an admin inbox where abuse would be obvious. The order matters: cheap rejections first, the database last. If the page ever became a target, the next steps would be making the rate limit atomic inside a database function and adding a proper challenge, and the current design would not need to change to accept either. The project's stated limitations are on the [rukon-link project page](/work/rukon-link).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
