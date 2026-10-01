import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "sharing-one-supabase-project-between-two-apps",
  title: "Sharing One Supabase Project Between Two Apps Safely",
  description:
    "A second app inside an existing Supabase project: prefixed tables, RLS on with no policies, revoked grants, server-only access and an admin check for a shared user list.",
  date: "2027-01-14",
  category: "Full-Stack Development",
  tags: ["Supabase", "PostgreSQL", "Row Level Security", "Security", "Next.js", "Architecture"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Two Apps, One Supabase Project: Prefix and RLS",
  relatedProjects: ["rukon-link", "drivekeep"],
  relatedPosts: [
    "nextjs-16-proxy-ts-supabase-session-refresh",
    "every-policy-was-correct-and-every-policy-was-inert",
    "wrong-supabase-key-returns-200-and-zero-rows",
    "two-ways-to-use-supabase-row-level-security",
  ],
  sections: [
    {
      heading: "The problem: one free project, two applications",
      body: [
        "A small app often does not justify a Supabase project of its own. [rukon-link](/work/rukon-link), my QR link page, lives in the same Supabase project as [DriveKeep](/work/drivekeep). Sharing is fine, but it changes two assumptions you can usually make: that every table in the schema is yours, and that every user in the auth system is one of your users. This article is how rukon-link handles both, for anyone adding a second app to an existing Supabase project.",
      ],
    },
    {
      heading: "Prefix everything the app owns",
      body: [
        "Every table and function rukon-link creates starts with `link_`: `link_analytics_events`, `link_contact_requests`, `link_settings`, `link_daily_stats`, `link_dashboard()` and `link_purge()`. Its indexes and scheduled job are prefixed the same way. The migration's first comment says why, so the reason travels with the schema.",
        "A prefix is not security. It is ownership you can read: anyone browsing the table list can tell which app a table belongs to, a cleanup can be scoped to one app with confidence, and two apps cannot both create a table called `settings`. Every statement in the migration is also written to be re-runnable (`if not exists`, `on conflict do nothing`), which matters more when the database also holds someone else's data.",
      ],
    },
    {
      heading: "Deny by default: RLS on, no policies, grants revoked",
      body: [
        "rukon-link has no end-user accounts. Visitors never need to read these tables, and the only writes are page events and contact requests, which the server validates first. So browsers get no access at all:",
        {
          type: "code",
          lang: "sql",
          code: `alter table public.link_analytics_events enable row level security;
alter table public.link_contact_requests enable row level security;
alter table public.link_settings        enable row level security;
alter table public.link_daily_stats     enable row level security;

revoke all on public.link_analytics_events, public.link_contact_requests,
              public.link_settings, public.link_daily_stats from anon, authenticated;

revoke all on function public.link_dashboard(date, date, text) from public, anon, authenticated;
revoke all on function public.link_purge() from public, anon, authenticated;
grant execute on function public.link_dashboard(date, date, text) to service_role;
grant execute on function public.link_purge() to service_role;`,
          caption: "The lock-down section of the rukon-link migration.",
        },
        "Row Level Security enabled with no policies means the browser-facing roles see no rows and can write none. Revoking the table privileges as well is belt and braces: if someone later added a permissive policy by mistake, the role would still lack the privilege. Functions are executable by `public` by default in PostgreSQL, so they are revoked explicitly and granted only to the service role.",
        "The Next.js server is the only client. It uses the service-role key, which bypasses Row Level Security, only in server code, and only after validating the request (for public writes) or confirming the admin (for reads). The key lives in a server-only environment variable and the module that uses it imports `server-only`.",
      ],
    },
    {
      heading: "Why a server key is right here and was wrong elsewhere",
      body: [
        "This is the opposite of what I did in ResearchForge, where the backend reaches the database as the signed-in user so that Row Level Security filters every query, and where connecting with a privileged key was the defect, described in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert). The difference is who the data belongs to. ResearchForge stores each user's private library, so per-user policies are the guarantee. rukon-link has no user-owned rows at all: every row is the site owner's data, written by the server on visitors' behalf. Deny-all to browsers plus a validated server path is the accurate model of that.",
        "The risk moves accordingly. With a server key, a bug in a route handler is not caught by the database. That is why each public route validates every field and the tables repeat the important limits as CHECK constraints.",
      ],
    },
    {
      heading: "The auth user list is shared too",
      body: [
        "Supabase Auth belongs to the project, not to an app. In a shared project, \"the user is signed in\" only proves they have an account in that project, which could have been created for any app that uses the project. So rukon-link never treats a session as authorisation. Admin access requires the signed-in user's email to equal one configured `ADMIN_EMAIL` and to be confirmed, and every admin page, server action and API route checks it, verifying the token with Supabase rather than trusting the cookie. The admin account was created by hand in the Supabase dashboard; there is no sign-up form in rukon-link at all.",
        "Two smaller things follow from sharing. Both apps' tables are visible to anyone with dashboard access to the project, so the boundary between the apps is organisational, not a security boundary. And a migration for one app runs against a database the other app depends on, which is one more reason to keep each migration additive and prefixed.",
        "For a personal link page that trade was worth it. For two apps with different owners or different sensitivity, separate projects would be the right call. The project details are on the [rukon-link project page](/work/rukon-link).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
