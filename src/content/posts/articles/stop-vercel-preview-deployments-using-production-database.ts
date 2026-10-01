import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "stop-vercel-preview-deployments-using-production-database",
  title: "Stopping Vercel Preview Deployments From Touching the Production Database",
  description:
    "Every preview of RPOMS carried the production connection string. A guard in code now refuses the pairing, answers 503 with the reason, and can be checked from outside.",
  date: "2026-10-29",
  category: "Full-Stack Development",
  tags: ["Vercel", "Supabase", "Environments", "Preview Deployments", "Next.js Middleware", "Security"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Stop Vercel Previews Using the Production Database",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "one-storage-interface-three-backends",
    "supabase-session-pooler-emaxconnsession-postmortem",
    "schema-setup-on-cold-start-without-a-race",
    "production-write-lock-read-only-mode-nextjs-middleware",
  ],
  sections: [
    {
      heading: "One connection string for every deployment",
      body: [
        "On 23 September 2026 I verified something I had half-known for a while. Every Vercel deployment of RPOMS, the operations system I built for a router-refurbishment line, carried the same `DATABASE_URL`: production, the preview aliases operators used, and every feature branch. The consequences were concrete. A branch's first cold start altered the production schema, because tables are created on demand. A test transfer on a preview moved real stock. Three days later, previews sharing production's connection pool were part of [an outage](/blog/supabase-session-pooler-emaxconnsession-postmortem).",
        "The first line of defence is the environment variables: Preview should point at a staging database. That is configuration, and configuration is one mistaken paste away from being wrong. This article is about the second line, in the application itself, so that a preview that is handed the production string refuses to use it. A short version appears in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends); this is the full mechanism and how I verified it.",
      ],
    },
    {
      heading: "Three facts, none of them secret",
      body: [
        "The guard is a pure function over the environment, called before the first connection is opened. It decides from three things:",
        {
          type: "list",
          items: [
            "Where the deployment is running: `VERCEL_ENV` is production, preview or development on Vercel, and absent on a laptop or self-hosted server.",
            "Which database the connection string names: a Supabase URL carries the project reference, and a variable lists which references are production, defaulting to the one production uses.",
            "What the operator says the database is: a label variable set beside the URL, for databases whose URL carries no reference.",
          ],
        },
        {
          type: "table",
          head: ["Deployment", "Database", "Verdict"],
          rows: [
            ["preview or development", "production", "refuse (one named per-branch override)"],
            ["production", "labelled staging or anything else", "refuse"],
            ["production", "names no known production reference", "allow, with a warning to register the new reference"],
            ["laptop or script", "production", "refuse (one named per-command override)"],
            ["preview", "staging", "allow"],
          ],
        },
        "Each refusal has exactly one deliberate override for the one legitimate case, set as a scoped variable, so an exception is a decision someone made rather than a default. The preview override existed for the Ecommerce build, which ran as a preview on the production database until it could become a production deployment of its own. When the override is used, the log says on every start that every write is a production write.",
      ],
    },
    {
      heading: "The reference beats the label",
      body: [
        "A label is one variable away from being wrong, and this is not hypothetical: the Preview variables were later found in exactly that state, the production connection string sitting beside a `staging` label. So the rule was tightened so that the connection string wins: a URL that names a production project reference is production, whatever the label says. The label only decides when the URL names no known production reference.",
        {
          type: "code",
          lang: "ts",
          code: `export function databaseKindOf(env: Env): string {
  const url = env.DATABASE_URL || env.POSTGRES_URL || "";
  const label = (env.RPOMS_DATABASE_ENV || "").trim().toLowerCase();
  if (!url) return "none";
  if (productionRefs(env).some((ref) => ref && url.includes(ref))) {
    return "production";
  }
  return label || "unknown";
}`,
          caption: "From the RPOMS environment guard.",
        },
        "Because the function reads an env object and returns a verdict, every combination is a unit test. The first commit had thirteen tests over the matrix, and the reference-beats-label rule got its own.",
      ],
    },
    {
      heading: "Refusing to connect was not enough",
      body: [
        "To check it, I started a production build locally as a fake preview and handed it the production reference. The guard fired and logged that it refused to open the database. And every page returned 200. Reads that have a safe default fell back to it, so the site rendered, looking merely empty. A preview that quietly shows zeros is almost as misleading as one that shows production data.",
        "So the decision moved into the middleware as well. It evaluates the same pairing once at module load, and if it is refused, every request gets a 503 with the reason: JSON for the API, a plain page otherwise. The reason names no secret.",
        {
          type: "code",
          lang: "ts",
          code: `const ENVIRONMENT = checkDatabaseEnvironment();

export function middleware(req: NextRequest) {
  if (!ENVIRONMENT.ok) return misconfigured(req); // 503 + reason
  // ...write lock, scoping, security headers
}`,
          caption: "Simplified from the RPOMS middleware.",
        },
        "The same fake preview then answered 503 on `/`, `/admin`, the Ecommerce portal, the report API and the sign-in API, with the password absent from every response and log. The same build started as production served normally.",
      ],
    },
    {
      heading: "Make the pairing verifiable from outside",
      body: [
        "Environment variables change without a code change, and a Vercel variable only reaches a deployment when it is rebuilt. So after every variable change, someone needs to be able to check each domain without signing in and without seeing a secret. An unauthenticated `/api/health` returns only kinds, never a URL or host:",
        {
          type: "code",
          lang: "json",
          code: `{"ok":true,"deployment":"production","database":"production","environmentOk":true,"store":"postgres","pooler":"transaction"}`,
          caption: "What the production health endpoint returned on 1 October 2026.",
        },
        "The connection string, host, counts and timings stay behind a super-admin diagnostics route. A small script, `npm run verify:env`, fetches the health endpoint on each domain, compares deployment and database against the expected matrix, and exits non-zero on any mismatch or refusal, so it can gate a release. A route-level test asserts the health endpoint stays open on purpose and never returns a URL or host.",
      ],
    },
    {
      heading: "What is still not done",
      body: [
        "The guard protects production from previews. It does not give previews somewhere else to go. A separate staging database is designed and its bootstrap SQL written, but creating another database project was blocked by hosting-plan limits and account permissions, so it does not exist yet. Until it does, a preview built with the guard simply refuses to serve, and the older preview aliases that predate the guard are the known exception, documented as such.",
        "The file store has a matching refusal. On Vercel, a deployment with no database variable used to accept every save into a disk that vanishes at the next cold start. It now refuses with a message, unless a variable says a throwaway demo is intended.",
        {
          type: "list",
          items: [
            "Decide in code which kinds of deployment may open which database, before the first connection.",
            "Trust the connection string over any human-written label.",
            "When the guard refuses, refuse every request visibly. A site that renders with defaults hides the problem.",
            "Expose the pairing, never the secret, on a public health endpoint, and script the check.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
