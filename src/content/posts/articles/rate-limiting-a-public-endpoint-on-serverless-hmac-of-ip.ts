import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip",
  title: "Rate Limiting a Public Endpoint on Serverless, Keyed by an HMAC of the Address",
  description:
    "Two layers for an anonymous upload endpoint on Vercel: an honest in-memory burst limiter, and a durable hourly count in Postgres keyed by an HMAC so the address is never stored.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Rate Limiting", "Serverless", "Vercel", "PostgreSQL", "HMAC", "Privacy"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Serverless Rate Limiting Keyed by HMAC of IP",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding",
    "hmac-signed-session-cookies-without-a-library",
    "gating-a-cv-download-behind-a-server-signed-grant",
    "storing-uploaded-photos-in-postgres-bytea-admin-only",
  ],
  sections: [
    {
      heading: "Rate limiting without Redis, and without storing addresses",
      body: [
        "This is for anyone with a public endpoint on a serverless platform who wants to slow down abuse without adding a datastore and without keeping a log of visitors' IP addresses. The [RPOMS AI](/work/rpoms-ai) photo checker needs no account, decodes every upload and may call a vision model, which made it the endpoint most worth protecting on the site.",
        "It uses two layers, because the obvious single layer, a counter in memory, does not mean what it appears to mean on serverless. The upload validation around these limits is in [Hardening a Public Photo Upload](/blog/hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding).",
      ],
    },
    {
      heading: "Layer one: an in-memory sliding window that admits its limits",
      body: [
        "The first check is a sliding-window limiter held in a `Map` in the function's memory. By default it allows 12 checks per address in any 5 minutes, configurable through an environment variable. Its header comment is the most useful part, because it says plainly what it is. On a serverless platform the window lives in one warm instance's memory, so there is one counter per instance, not one per deployment. A client spread across many cold starts sees a higher effective limit.",
        "It is still worth having. It stops the common case, a single client hammering one endpoint, without a network call in the request path. And the interface does not change if a shared counter replaces it later. Two design details are easy to miss:",
        {
          type: "list",
          items: [
            "A refused attempt is not recorded. If it were, a client that kept hammering would push its own window forward for ever, and the lockout would never lift while the attack continued. That also punishes a legitimate user sharing the address, and hands an attacker a way to keep them locked out.",
            "Memory is bounded. An attacker who varies the key could otherwise grow the map without limit, turning the throttle into a way to exhaust the instance. The map is capped at 10,000 keys. Because a `Map` keeps insertion order and each allowed request re-inserts its key, the oldest idle keys are evicted first. Past the cap, the limiter forgets. The process does not die.",
          ],
        },
        {
          type: "code",
          lang: "ts",
          code: `recent.push(now);
// Re-inserting moves the key to the end of iteration order, so keys in
// active use are the last to be evicted.
hits.delete(key);
hits.set(key, recent);

while (hits.size > maxKeys) {
  const oldest = hits.keys().next().value;
  if (oldest === undefined) break;
  hits.delete(oldest);
}`,
          caption: "From src/lib/rate-limit.ts.",
        },
      ],
    },
    {
      heading: "Layer two: a durable hourly count in the database",
      body: [
        "The real limit lives in Postgres. Every check is already saved as a row, so the durable limit is just a count of recent rows for this client: 40 per hour by default, again configurable. There is no separate counter table to keep in sync.",
        {
          type: "code",
          lang: "sql",
          code: `SELECT count(*)::int AS n FROM checks
WHERE client_hash = $1 AND created_at > now() - make_interval(secs => 3600);`,
          caption: "The query behind countRecentChecks (parameters simplified), backed by an index on (client_hash, created_at DESC).",
        },
        "Because it counts rows across all instances, it holds no matter how many cold starts an attacker triggers. It costs one indexed query per request, which the endpoint makes anyway because it is about to write the check.",
      ],
    },
    {
      heading: "Keyed by an HMAC, never the address",
      body: [
        "The durable layer needs a stable per-client key stored in the database. Storing the IP address would create a log of who used the checker. Instead the key is an HMAC-SHA256 of the address under the server's session secret, truncated to 32 hex characters:",
        {
          type: "code",
          lang: "ts",
          code: `const clientHash = createHmac("sha256", sessionSecret())
  .update("client:" + ip)
  .digest("hex")
  .slice(0, 32);`,
          caption: "From src/app/api/check/route.ts (template string written as concatenation).",
        },
        "A plain SHA-256 of an IPv4 address would not be enough, because there are only about four billion addresses and every one can be hashed in advance. A keyed HMAC cannot be reversed that way without the secret. The `client:` prefix separates this use of the secret from its others, such as signing sessions. The same primitive, used for signing rather than pseudonymising, appears in [HMAC-Signed Session Cookies Without a Library](/blog/hmac-signed-session-cookies-without-a-library).",
        "The address itself comes from `X-Forwarded-For`. That header is forgeable in general, but on Vercel the platform sets it and the left-most entry is the real client. With no such header, the key falls back to a single constant. An unproxied deployment therefore throttles everyone together rather than no one, which is the conservative failure.",
      ],
    },
    {
      heading: "Failure modes, stated plainly",
      body: [
        {
          type: "table",
          head: ["Situation", "Behaviour"],
          rows: [
            ["Burst limit exceeded", "429 with Retry-After, before the body is read"],
            ["Hourly limit exceeded", "429 with a plain message"],
            ["Database unreachable for the count", "The check still runs, but nothing is saved and no id is returned"],
            ["Many cold starts from one client", "Burst limit weakens; hourly limit still holds (while the database is up)"],
          ],
        },
        "The third row is a deliberate trade-off. When the database is down, the endpoint neither fails closed nor saves anything. The durable limit is off in that window, and only the in-memory limit protects the endpoint. For a tool with no model active in production and no real line use yet, keeping the page working was judged more useful than refusing every request. A system with real traffic might choose differently. A rate limit is also not spend protection: capping cost would need its own durable counter, and none is enforced today.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
