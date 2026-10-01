import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "when-production-breaks-and-nothing-changed-paused-free-tier-database",
  title: "Production Broke and Nothing Had Changed: A Paused Free-Tier Database",
  description:
    "Admin sign-in returned 503 and nothing was being saved, with no deploy and no config change. One credential-free request that tells a database outage from wrong credentials.",
  date: "2027-01-02",
  category: "Full-Stack Development",
  tags: ["Supabase", "PostgreSQL", "Incident", "Vercel", "Runbook", "Debugging"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Supabase Free Tier Paused: Diagnosing the Outage",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "supabase-session-pooler-emaxconnsession-postmortem",
    "storing-uploaded-photos-in-postgres-bytea-admin-only",
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
  ],
  sections: [
    {
      heading: "The symptom: \"I cannot get into Admin\"",
      body: [
        "This short note is for anyone running a small app on a free-tier hosted Postgres who sees it fail with no change on their side. On 20 September 2026, [RPOMS AI](/work/rpoms-ai) production started answering admin sign-in with 503, \"Sign-in is temporarily unavailable\". At the same time, every public photo check came back with `saved: false` and no id.",
        "The awkward part was that \"I cannot get into Admin\" has two very different causes that look the same from the login form: wrong credentials, or a database that cannot be reached. One is fixed by typing more carefully. The other cannot be fixed from the application at all.",
      ],
    },
    {
      heading: "Nothing had changed",
      body: [
        "The evidence ruled out the deployment. Writes had succeeded at 16:27. By 17:55 the database was unreachable. No deployment between those times touched any database code, and every environment variable in Vercel was present and unchanged. When the code and configuration are constant and behaviour changes, the cause is outside them.",
        "The most likely cause, recorded as such at the time, was the database project itself. A free-tier Supabase project is paused after a period of inactivity and has to be resumed by hand from the dashboard. Two days later, on 22 September, the production database was verified reachable and writing again.",
      ],
    },
    {
      heading: "Why the site degraded instead of falling over",
      body: [
        "The application was built to keep working without its database, and that made the outage easy to misread. Every database call goes through one function that runs pending migrations once and then returns a client. If the database is unreachable, that function throws a specific `DatabaseUnavailableError` instead of a raw driver error.",
        "The sign-in route catches that error and returns 503 with a neutral message. The public check catches it differently. If the rate-limit count fails, the check still runs: photos are still quality-checked and analysed, but nothing is stored, and the response says `saved: false`. Users kept getting answers, which is good for them. It also hid the outage from anyone who was not trying to sign in.",
      ],
    },
    {
      heading: "One request that tells the two cases apart",
      body: [
        "The runbook now carries a single request that needs no real credentials. Post a sign-in with an account that does not exist:",
        {
          type: "code",
          lang: "bash",
          code: `curl -s -X POST https://<your-app>/api/auth/login \\
  -H "Content-Type: application/json" -H "Origin: https://<your-app>" \\
  -d '{"username":"no-such-account","password":"no-such-password"}'`,
        },
        {
          type: "table",
          head: ["Response", "Meaning"],
          rows: [
            ["401, \"Invalid username or password.\"", "The database answered. It looked the user up and found nothing. The problem is the credentials."],
            ["503, \"Sign-in is temporarily unavailable.\"", "The database could not be reached. No credentials will work."],
          ],
        },
        "This works because a failed lookup needs a working database. The same Origin header is included because the API refuses cross-origin writes.",
        "If it is the database, the runbook's order of checks is: the Supabase dashboard first, for a paused project, which is the most common cause; then whether a usage or connection limit has been hit; then whether `DATABASE_URL` still exists in the production environment, because removing it produces the same 503. The runbook's note is blunt and correct: nothing in the application can fix this, and it is resolved in Supabase.",
      ],
    },
    {
      heading: "Knowing which database you are looking at",
      body: [
        "A related change made the investigation faster. On startup, the app now logs the database's identity, the host and the hosted project reference, parsed from the connection string without the credentials, and shows the same on the admin dashboard. RPOMS AI sits next to a separate system with its own database. Being able to confirm from a log line which project the app is actually connected to removes a whole class of \"am I even looking at the right thing\" confusion. A connection failure of a different kind is covered in [the session pooler postmortem](/blog/supabase-session-pooler-emaxconnsession-postmortem).",
        "Free tiers are a fair choice for a tool in a testing phase. RPOMS AI has no model active in production and has not been used on real line photos. But a free-tier project that pauses itself needs either regular traffic, a scheduled keep-alive, or a runbook entry like this one, so the next person does not spend an hour on the application code.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
