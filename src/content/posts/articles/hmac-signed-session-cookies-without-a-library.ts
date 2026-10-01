import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "hmac-signed-session-cookies-without-a-library",
  title: "From a Constant Per-Role Cookie to HMAC-Signed, Expiring Sessions",
  description:
    "RPOMS's session cookie was the same bytes for every admin, forever. Replacing it with a signed payload carrying issue time and session id, plus a login throttle that needs no Redis.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Authentication", "Sessions", "HMAC", "Node.js crypto", "Rate Limiting", "Next.js"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "HMAC-Signed Session Cookies Without a Library",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "audit-log-with-before-snapshots-for-destructive-actions",
    "testing-every-nextjs-api-route-refuses-without-session",
    "production-write-lock-read-only-mode-nextjs-middleware",
    "rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip",
  ],
  sections: [
    {
      heading: "A cookie that was the same for every session",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, has four roles: viewer, Ecommerce, admin and super admin. Each role signs in with its own credentials, and a role whose password is not configured is switched off entirely rather than falling back to a default. Until September 2026 the session cookie looked like this: `<role>.<hmac(\"rpoms-<role>-v1\")>`.",
        "The HMAC covered a constant. Every admin session that had ever existed carried the same bytes, which had three consequences. A cookie read once over someone's shoulder was an admin credential for as long as the secret stayed the same. `Max-Age` was the only expiry, and the browser is what honours it, so a value copied out of the cookie jar never expired. And no single session could be ended. A code audit rated it a security finding, SEC-01. This article is for anyone signing their own session cookies in Node, with or without a library.",
      ],
    },
    {
      heading: "Sign what makes a session a session",
      body: [
        "The new cookie carries a version, the role, when it was issued, and a random id, and the HMAC covers all four:",
        {
          type: "code",
          lang: "ts",
          code: `const SESSION_VERSION = "v2";

function sign(payload: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function sessionValue(role: Role, now = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const sid = crypto.randomBytes(16).toString("hex");
  const payload = [SESSION_VERSION, role, issuedAt, sid].join(".");
  return payload + "." + sign(payload);
}`,
          caption: "Condensed from the RPOMS auth module.",
        },
        "The issue time is what the server measures age against, where the client cannot reach it. The session id makes every cookie distinct, which is what a revocation list would key on and what an audit log can attribute actions to. The cookie itself is httpOnly, sameSite, and secure in production, and a missing `SESSION_SECRET` stops the application in production rather than signing with something guessable.",
      ],
    },
    {
      heading: "Verify the signature first, then the age",
      body: [
        {
          type: "code",
          lang: "ts",
          code: `const parts = value.split(".");
if (parts.length !== 5) return null;
const [version, role, issuedAtRaw, sid, mac] = parts;
if (version !== SESSION_VERSION) return null;
if (!ROLE_LIST.includes(role)) return null;
if (!/^\\d{1,15}$/.test(issuedAtRaw)) return null;
if (!/^[0-9a-f]{32}$/.test(sid)) return null;

const payload = [version, role, issuedAtRaw, sid].join(".");
if (!safeEqual(mac, sign(payload))) return null;

const ageSeconds = Math.floor(now / 1000) - Number(issuedAtRaw);
if (ageSeconds < -CLOCK_SKEW_SECONDS) return null;   // 60 s tolerance
if (ageSeconds > sessionMaxAge(role)) return null;
return role;`,
        },
        "The order matters. A cookie with a bad signature is turned away as forged before its age is consulted, so nothing leaks about which field was wrong. The comparison uses `crypto.timingSafeEqual` behind a length check, since it throws on buffers of different lengths. A viewer's session lapses after twenty-four hours and staff sessions after seven days, enforced on the server. A minute of clock-skew tolerance stops a session issued a moment ago being read as issued in the future.",
      ],
    },
    {
      heading: "The cost: everyone signs in once",
      body: [
        "A cookie in the old two-part format fails the shape check, so the deploy that ships the new format signs every session out once. That was deliberate and written into the deployment checklist, because an old cookie is not merely stale; it is a credential nobody can revoke. Raising the version string does the same in future.",
        "Revoking every session at once is rotating `SESSION_SECRET` and redeploying. The same applies to credentials generally: earlier revisions of the auth module had carried fallback passwords in source before that mechanism was removed. They are gone from the current code but still readable in the repository's history, so the documented fix is to treat them as public and rotate, not to rewrite the history of a repository that is already cloned and deployed.",
      ],
    },
    {
      heading: "A login throttle without Redis",
      body: [
        "The same audit found no limit on sign-in attempts (SEC-03). The fix is ten attempts per address per five minutes, in memory, reset on a successful sign-in:",
        {
          type: "list",
          items: [
            "Each key holds a list of attempt times; times older than the window are pruned on the next check.",
            "When the limit is reached, the refused attempt is not recorded. An attacker who keeps trying cannot keep extending a real user's lockout.",
            "The map is bounded (10,000 keys by default) and evicts the oldest key first, so a forged `X-Forwarded-For` on every request cannot grow it until the instance runs out of memory.",
            "The key is the left-most `X-Forwarded-For` entry, which the platform sets on Vercel. With no such header it falls back to one shared key, so an unproxied deployment throttles everyone together rather than nobody.",
          ],
        },
        {
          type: "callout",
          label: "Stated honestly in the code",
          text: "The window lives in one warm instance's memory. On Vercel that is one counter per instance, not per deployment, so an attacker spread across many cold starts sees a higher limit. It removes the cheap case, one client hammering one endpoint, without adding a datastore to the request path. A shared counter can replace it later behind the same interface.",
        },
      ],
    },
    {
      heading: "What it made possible, and how it is tested",
      body: [
        "The session id turned out to matter beyond security. Two roles share one password each, so the role alone cannot tell two admins apart, but the per-session id can. That is what later let an audit log record who did what from the signed cookie rather than from anything the request body claims.",
        "Tests assert that two sessions for the same role are different strings, that the signature covers every field, that the old format is rejected, and that expiry is enforced server-side per role. The limiter's tests check that a refused attempt does not extend the lockout and that the key map stays bounded.",
        "The system is described in the [RPOMS case study](/work/rpoms). The write lock that sits in front of these routes is covered in [A Production Write Lock That Fails Safe](/blog/production-write-lock-read-only-mode-nextjs-middleware).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
