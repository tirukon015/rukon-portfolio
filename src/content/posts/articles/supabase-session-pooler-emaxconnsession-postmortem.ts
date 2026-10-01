import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "supabase-session-pooler-emaxconnsession-postmortem",
  title: "When the Supabase Session Pooler Ran Out: An EMAXCONNSESSION Postmortem",
  description:
    "Admin pages on a Next.js app on Vercel showed a generic error for about six minutes. The cause was Supabase's session-mode pooler hitting its 15-client limit, not the code.",
  date: "2026-10-01",
  category: "Building Real Systems",
  tags: ["Supabase", "PostgreSQL", "Vercel", "Connection Pooling", "Incident Response", "Next.js"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  seoTitle: "Supabase EMAXCONNSESSION on Vercel: A Postmortem",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "one-storage-interface-three-backends",
    "promise-race-timeout-leaks-postgres-connections",
    "stop-vercel-preview-deployments-using-production-database",
    "why-system-maintenance-matters-after-deployment",
  ],
  sections: [
    {
      heading: "The symptom: a generic error page and nothing deployed",
      body: [
        "On 26 September 2026, admin pages in RPOMS, the operations system I build and run for a router-refurbishment line, started rendering the app's error boundary instead of their content: \"Something went wrong. An error occurred while loading this page.\" The first failing request in the Vercel runtime logs is at 11:39:11 Malaysian time, and the last one at 11:44:45. For about six minutes the Daily Production Report could not be opened or filed.",
        "This is written for anyone running a Next.js app on Vercel against Supabase who sees that error and goes looking for a bug. There wasn't one. Nothing had been deployed that day, and no schema or data had changed. Every date failed, including a date with no report at all. The failure depended on how many connections were open, not on which query or row was involved.",
        "The pages that did load were not fine either. Reads that are designed to degrade rather than throw (stock consumption, box counts, settings) quietly returned empty values in the same window. In some ways that was the more dangerous half of the symptom.",
      ],
    },
    {
      heading: "The error only existed in the server log",
      body: [
        "In production, Next.js strips server error messages from what it sends to the browser. The client receives a digest, a number, and the error boundary cannot say \"database busy\" because it never learns that. The real message was in the Vercel runtime logs, identical on production and on a preview alias:",
        {
          type: "code",
          lang: "text",
          code: "readReportByDate failed: (EMAXCONNSESSION) max clients reached in session mode -\nmax clients are limited to pool_size: 15        code: 'XX000', severity: FATAL",
        },
        "Two probes isolated it. Loading `/admin` failed for every date. Loading `/admin?new=1`, which skips only the report read, rendered cleanly, and other queries in the same request succeeded. The pooler was refusing new connections at connect time, before any statement ran, so nothing was written, lost or corrupted. Signing in kept working because the session cookie is verified in memory and needs no database.",
      ],
    },
    {
      heading: "Session mode versus transaction mode",
      body: [
        "Supabase's pooler, Supavisor, serves two modes. The code and every deployment document assumed the transaction pooler on port 6543, where a client holds a server connection only for the length of one transaction, so many clients share a few server connections. The error text said the connection was being served in session mode, where each client connection pins one server connection for its whole life, idle or busy.",
        {
          type: "table",
          head: ["", "Session mode", "Transaction mode"],
          rows: [
            ["Port", "5432", "6543"],
            ["A client connection holds", "one server slot for its whole life", "a server slot for one transaction"],
            ["What limits you", "the pool size (15 here)", "the client cap (200 here) and the pool size"],
            ["Prepared statements, session SET", "work", "must not be relied on"],
          ],
        },
        "The app's Postgres client allows up to 10 connections per server instance. In session mode, one warm instance can therefore hold 10 of the 15 slots, and two warm instances can exceed them. The project's settings page confirmed a pool size of 15 and a client cap of 200.",
      ],
    },
    {
      heading: "Why a preview took production down with it",
      body: [
        "Production was not alone on that pool. A preview alias used by operators ran a different build (the stack traces referenced different server chunks), yet both hit the same 15-slot pool in the same minute. At that point every Vercel deployment of RPOMS carried the same database connection string, so previews drew on production's connection budget. The preview failed first, at 11:39:11, and production followed at 11:39:34.",
        "I could not prove exactly which clients held the 15 slots. That needs `pg_stat_activity` or the pooler's own metrics on the production database, and I did not query production during the incident. The candidates were warm production and preview instances at up to 10 connections each, plus any script or SQL editor session open against the same project. The honest record says that, rather than naming a culprit.",
        "It is also why this incident belongs next to the guard described in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends): a preview that can open the production database can do more than alter its schema. It can exhaust it.",
      ],
    },
    {
      heading: "Why the page threw instead of showing an empty form",
      body: [
        "It is tempting to make the report read return `null` on failure and let the page render. I had already removed exactly that behaviour. A failed read that looks like \"no report for this day\" opens a blank form over a day that already exists, and saving it overwrites real figures. So the report reads throw a dedicated \"report unavailable\" error, the page's `Promise.all` rejects, and Next.js renders the nearest error boundary.",
        "During the incident that choice was the right one. An ugly error screen for six minutes cost nothing. A silent overwrite of a production day would have cost a correction nobody might have noticed was needed. No application code was changed in response.",
      ],
    },
    {
      heading: "The fix was configuration, plus a way to see it",
      body: [
        "The outage cleared on its own when connections were released, which meant it could come back. The permanent fix was to point `DATABASE_URL` at the transaction pooler and redeploy, because a Vercel variable is fixed into a deployment when it is built. The variable was marked Sensitive, so nobody could read back which port it named; the mode was inferred from the error text alone.",
        "That blindness was the part I could fix in code. A small module names the pooler mode from the connection string's host and port, and returns nothing else: no host, no user, no password, no project reference.",
        {
          type: "code",
          lang: "ts",
          code: `export function poolerModeOf(url: string | undefined | null): PoolerMode {
  if (!url) return "none";
  const hp = hostAndPort(url);
  if (!hp) return "other";
  if (SUPABASE_POOLER_HOST.test(hp.host)) {
    if (hp.port === "6543") return "transaction";
    if (hp.port === "5432" || hp.port === "") return "session";
    return "other";
  }
  if (SUPABASE_DIRECT_HOST.test(hp.host)) return "direct";
  return "other";
}`,
          caption: "From the RPOMS source. hostAndPort takes whatever follows the last @ rather than using new URL().",
        },
        "It deliberately does not use `new URL()`. A password containing an unescaped `#`, `/` or `?` does not make the constructor throw; it makes it return the wrong host. On a Vercel deployment, the Postgres client logs one warning at startup when the mode is session or direct. The public health endpoint and the environment check script both report it. Connecting is unchanged either way.",
        "Today the production health endpoint reports `\"pooler\":\"transaction\"`, so the switch is done and visible from outside, which was the point.",
      ],
    },
    {
      heading: "What I would check first next time",
      body: [
        {
          type: "list",
          items: [
            "Read the server log before the code. The browser only ever gets a digest.",
            "Check the pooler mode against the port you think you configured. `EMAXCONNSESSION` means session mode, whatever your documentation says.",
            "Keep the client pool size multiplied by the expected warm instances below the limit for the mode you are actually on.",
            "Give each environment its own database, so a preview cannot spend production's connection budget.",
            "Alert on `EMAXCONNSESSION` or `XX000` in the logs, so the next occurrence is seen before someone sends a screenshot.",
          ],
        },
        "The system this came from is described in the [RPOMS case study](/work/rpoms). On the production site only the dashboard and the Daily Production Report were live at the time, with the other modules behind a write lock, which is why the main impact was one form that could not be filed for six minutes.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
