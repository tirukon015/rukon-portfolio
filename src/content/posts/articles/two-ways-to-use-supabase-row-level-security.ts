import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "two-ways-to-use-supabase-row-level-security",
  title: "Two Ways I Use Supabase Row Level Security: Deny-All Behind a Server, or Per-Owner Policies",
  description:
    "Across five projects, RLS does one of two jobs: close the Data API while a trusted server does the work, or let Postgres enforce who owns each row. When to pick which.",
  date: "2026-11-04",
  category: "Full-Stack Development",
  tags: ["Supabase", "Row Level Security", "PostgreSQL", "Security", "Next.js", "FastAPI"],
  contentType: "Comparison",
  searchIntent: "informational",
  seoTitle: "Supabase RLS: Deny-All vs Per-User Policies",
  relatedProjects: ["rukon-link", "rpoms-ai", "researchforge", "drivekeep", "spendrop"],
  relatedPosts: [
    "every-policy-was-correct-and-every-policy-was-inert",
    "wrong-supabase-key-returns-200-and-zero-rows",
    "sharing-one-supabase-project-between-two-apps",
    "append-only-cloud-backup-supabase-storage-rls",
  ],
  sections: [
    {
      heading: "Why RLS matters even when no browser talks to your database",
      body: [
        "Supabase publishes the `public` schema through its Data API. A table there without Row Level Security can be read and written by anyone holding the project's public anon key, and that key is designed to be public. So every table needs RLS enabled, whether or not your app ever uses the Data API. What differs is what RLS is for.",
        "In the projects I have built on Supabase, it does one of two jobs. Either it closes the Data API completely and a trusted server does all the reading and writing, or it is the mechanism that decides which rows belong to which signed-in user. This article compares the two using the actual migrations, for developers deciding which one their app needs.",
      ],
    },
    {
      heading: "Pattern A: RLS on, no policies, a server does everything",
      body: [
        "rukon-link, my link page with contact requests and an admin dashboard, is the clearest example. Its migration states the model at the top: RLS enabled on every table with no policies, and all privileges revoked from `anon` and `authenticated`. Browsers cannot read or write these tables at all. The Next.js server validates each request, then uses the service-role key.",
        {
          type: "code",
          lang: "sql",
          code: "alter table public.link_analytics_events enable row level security;\nalter table public.link_contact_requests enable row level security;\nalter table public.link_settings        enable row level security;\nalter table public.link_daily_stats     enable row level security;\n\nrevoke all on public.link_analytics_events, public.link_contact_requests,\n              public.link_settings, public.link_daily_stats from anon, authenticated;\n\nrevoke all on function public.link_dashboard(date, date, text) from public, anon, authenticated;\ngrant execute on function public.link_dashboard(date, date, text) to service_role;",
          caption: "From the rukon-link migration, abridged.",
        },
        "Revoking privileges as well as enabling RLS is belt and braces: even a policy added by mistake later would find no table privilege to act on. The database functions get the same treatment, callable only by `service_role`. On the application side, the service-role client lives in a module that imports `server-only`, so a build fails if a client component ever imports it.",
        "RPOMS AI does the same thing a different way. The app connects to Postgres directly as the table owner through a connection string, which RLS does not restrict. It never uses the Data API. So one migration loops over every table in `public` and enables RLS with no policies, closing the API path without affecting the application. Its comment says exactly that: a table without RLS is readable and writable by anyone with the anon key, and this app never uses that API.",
        "Pattern A fits when there is no per-user data in the browser's hands: a public page with an admin area, an internal tool whose server authenticates people itself, or anything where the server is the only client. Its weakness is that isolation between users, if you have users, lives entirely in application code.",
      ],
    },
    {
      heading: "Pattern B: per-owner policies, with the user's own token",
      body: [
        "ResearchForge, an AI research-paper assistant with private libraries, needed the opposite. Every paper, analysis and review belongs to exactly one account, and \"remember to filter by owner\" is not a guarantee. So the rule moved into the database:",
        {
          type: "code",
          lang: "sql",
          code: "CREATE POLICY papers_owner_all ON papers\n    FOR ALL USING (user_id = auth.uid())\n    WITH CHECK (user_id = auth.uid());",
          caption: "From ResearchForge's migrations. The same policy shape covers analyses and literature reviews.",
        },
        "`USING` decides which rows a query can see; `WITH CHECK` stops anyone writing a row they would not own. The part that makes it work is which credential the backend uses. The FastAPI backend calls PostgREST with two headers: `apikey` carries the public key, which only routes the request to the project, and `Authorization` carries that user's own access token. Postgres then evaluates `auth.uid()` as that person, and a forgotten filter returns nothing rather than everything. The repository class requires the token as a constructor argument with no default, because an optional token would make \"no token\" a silent, valid state.",
        "The native apps use the same pattern. DriveKeep's iOS sync writes to tables whose policies limit every row to its owner; it exists but is off by default. SpenDrop's optional cloud backup uses Supabase Auth, Storage and Postgres with RLS policies. I want to be precise about SpenDrop: its policies have been tested against a simulated server, not yet run on a live Supabase project.",
      ],
    },
    {
      heading: "ResearchForge used both, in sequence",
      body: [
        "ResearchForge is instructive because it started as Pattern A. Its first migration enabled RLS with no policy and let the backend use the service-role key, which bypasses RLS, so the API worked while the database stayed closed to the browser. The per-user policies were written early, ready for authentication, with a comment explaining why they were harmless at that stage: `auth.uid()` is null for the service-role key, and `user_id = NULL` is never true.",
        "The transition is where it went wrong. The policies were correct, but while the backend still held a key that bypasses RLS they enforced nothing, and every automated test passed because the tests modelled RLS with a stub. That defect and how it was found are described in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert). The lesson for this comparison: moving from Pattern A to Pattern B is not done when the policies exist. It is done when the server stops holding the key that bypasses them for user requests.",
      ],
    },
    {
      heading: "Choosing between them",
      body: [
        {
          type: "table",
          head: ["", "A: deny-all + trusted server", "B: per-owner policies"],
          rows: [
            ["Who talks to Postgres", "Only the server, as service_role or table owner", "The server (or app) as the signed-in user"],
            ["Where user isolation lives", "Application code", "The database"],
            ["Policies", "None; privileges revoked", "USING and WITH CHECK on owner column"],
            ["A forgotten filter", "Returns other users' rows, if there are users", "Returns nothing"],
            ["Fits", "Public pages with an admin area, owner-connected internal apps", "Private per-user data: libraries, logs, backups"],
            ["Used in", "rukon-link, RPOMS AI", "ResearchForge, DriveKeep iOS sync, SpenDrop backup"],
          ],
        },
        "Two practical notes from running them. First, whichever pattern you choose, enable RLS on every table in `public`; a loop over `pg_tables` in a migration, as RPOMS AI does, makes that hard to forget. Second, if two apps share one Supabase project, as rukon-link shares DriveKeep's, prefix every table and function (`link_` there) so the boundary between them is visible in every query and every policy list.",
        "The project pages for [rukon-link](/work/rukon-link), [ResearchForge](/work/researchforge) and [RPOMS AI](/work/rpoms-ai) describe the systems these migrations belong to.",
      ],
    },
  ],
};
