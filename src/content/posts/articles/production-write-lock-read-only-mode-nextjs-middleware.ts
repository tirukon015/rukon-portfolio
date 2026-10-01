import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "production-write-lock-read-only-mode-nextjs-middleware",
  title: "A Production Write Lock That Fails Safe: Only Named Modules May Write",
  description:
    "How RPOMS keeps finished modules from writing in production until sign-off: a middleware lock that is on by default in production and an allowlist matched by path segment.",
  date: "2026-11-05",
  category: "Full-Stack Development",
  tags: ["Next.js", "Middleware", "Feature Flags", "Read-Only Mode", "Security", "Vercel"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "A Fail-Safe Production Write Lock in Next.js",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "stop-vercel-preview-deployments-using-production-database",
    "testing-every-nextjs-api-route-refuses-without-session",
    "hmac-signed-session-cookies-without-a-library",
  ],
  sections: [
    {
      heading: "Finished is not the same as approved",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, has more modules than the programme has signed off. The dashboard and the Daily Production Report are live in production: figures are entered for real and stock is deducted for real. The serial registry, packing, delivery, workforce and inventory modules are complete, but the programme is still working through sign-off, so in production they must not write.",
        "Keeping them on a branch would have meant maintaining two versions of the system. Instead, one build runs everywhere and a deployment-level write lock decides which modules may change data. This is for anyone who needs a read-only or partially read-only mode in a Next.js app that cannot be switched on by accident.",
      ],
    },
    {
      heading: "The default depends on where the code runs",
      body: [
        "The lock is controlled by one variable, `DEMO_MODE`, obeyed in both directions wherever it is set: `0` unlocks, anything else locks. The interesting part is what happens when it is not set at all:",
        {
          type: "code",
          lang: "ts",
          code: `function demoDefault(): boolean {
  // VERCEL_ENV is "production" | "preview" | "development" on Vercel, and
  // absent elsewhere - a self-hosted deployment is judged by NODE_ENV instead.
  const vercel = process.env.VERCEL_ENV;
  if (vercel) return vercel === "production";
  return process.env.NODE_ENV === "production";
}

export const DEMO_MODE =
  process.env.DEMO_MODE === undefined || process.env.DEMO_MODE === ""
    ? demoDefault()
    : process.env.DEMO_MODE !== "0";`,
          caption: "From the RPOMS source.",
        },
        "Production locks itself, because forgetting a variable there must leave the system harmless rather than silently live. Preview and local deployments do not lock by default, because they are where the work is done, and a lock that has to be switched off before anything can be tested is a lock people learn to switch off everywhere.",
      ],
    },
    {
      heading: "An allowlist, matched by whole path segment",
      body: [
        "The lock names what is live, not what is locked. A module added later is locked until someone adds it to the list, rather than going live because nobody remembered to block it.",
        {
          type: "code",
          lang: "ts",
          code: `const LIVE_MODULES = ["/api/auth", "/api/report", "/api/ecommerce"];
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(base + "/");
}

export function isBlockedWrite(pathname: string, method: string): boolean {
  if (!DEMO_MODE) return false;
  if (!WRITE_METHODS.has(method.toUpperCase())) return false;
  if (!pathname.startsWith("/api/")) return false;
  return !LIVE_MODULES.some((base) => isUnder(pathname, base));
}`,
          caption: "Condensed from the RPOMS source; the real list carries a comment per entry.",
        },
        "Segment matching matters. A plain `startsWith(\"/api/report\")` would also unlock a different endpoint that merely begins with the same letters. Sign-in and sign-out are on the list because they change a cookie, not production data, and without them nothing could be shown at all. The Ecommerce module is on it because its requests and transfers are real work for a real team; its safety comes from role checks on every route and a transaction around each transfer, not from this list.",
      ],
    },
    {
      heading: "One chokepoint in the middleware",
      body: [
        "Every request passes through one middleware, so that is where the lock is applied, after the database-environment guard:",
        {
          type: "code",
          lang: "ts",
          code: `if (isBlockedWrite(req.nextUrl.pathname, req.method)) {
  // 200 with ok:false, so the screens report it the way they report any
  // other refusal instead of looking broken.
  return NextResponse.json({ ok: false, error: DEMO_MESSAGE, demo: true });
}`,
        },
        "The response is a 200 with `ok: false` on purpose. The screens already know how to show a refusal in that shape, so a blocked save shows a message instead of an error state. The message is worded as work in progress (\"this module is still under development and will be available in the next release\") because that is what it is, rather than something being withheld.",
        "Locked pages go one step further. On a locked deployment, the page for a locked module returns an \"under development\" screen before it reads anything, so the module's figures are never fetched and cannot appear in the page or in the source behind it. A lock on writes alone would still let someone read data the programme has not approved for that audience.",
      ],
    },
    {
      heading: "What the lock is not",
      body: [
        "It is defence in depth, not the access control. Role checks still run in every page and route underneath it, and the lock deliberately knows nothing about roles. It also blocks writes only. It does not protect reads, and treating it as if it did would be a mistake: a later check of the built app found several API reads with no session check at all, which the lock had never covered. Those were closed with session checks, and a test now calls every API route without a session and expects a refusal.",
        {
          type: "table",
          head: ["Control", "Decides", "Where"],
          rows: [
            ["Environment guard", "whether this deployment may open this database", "before the first connection, and middleware"],
            ["Write lock", "whether this module may write on this deployment", "middleware"],
            ["Role checks", "whether this person may do this", "every page and route"],
          ],
        },
        "Making a module live is one line in the allowlist and a redeploy, or `DEMO_MODE=0` for the whole deployment. Nothing else changes: the same code runs for real. The system and its current module status are in the [RPOMS case study](/work/rpoms), and the environment guard that runs before the lock is described in [Stopping Vercel Preview Deployments From Touching the Production Database](/blog/stop-vercel-preview-deployments-using-production-database).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
