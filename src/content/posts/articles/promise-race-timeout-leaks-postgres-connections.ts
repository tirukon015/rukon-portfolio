import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "promise-race-timeout-leaks-postgres-connections",
  title: "Promise.race Timeouts Don't Cancel Queries, and That Emptied My Connection Pool",
  description:
    "A read deadline built on Promise.race walks away from a query that keeps running and keeps its pooled connection. How that fed on itself on Vercel, and the bounds that fixed it.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "postgres.js", "Connection Pooling", "Vercel", "Timeouts", "Node.js"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Why Promise.race Timeouts Leak Postgres Connections",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "one-storage-interface-three-backends",
    "supabase-session-pooler-emaxconnsession-postmortem",
    "nextjs-error-boundary-auto-retry-jitter",
  ],
  sections: [
    {
      heading: "Eight seconds on every request, from a fast database",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, runs on Vercel against Supabase PostgreSQL through postgres.js. Every read has an eight-second deadline, the reasoning for which is in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends). At the end of August 2026 I measured the live site and found `/admin` answering in 8.2 seconds on sixteen consecutive requests, every read inside it giving up at the deadline. Meanwhile `/api/settings`, which ran the very same settings query in a different function and therefore a different pool, answered in about a fifth of a second.",
        "The database was never slow. One pool had filled with connections that could not answer. This is for anyone who has wrapped database calls in a `Promise.race` timeout and assumed the timeout freed something.",
      ],
    },
    {
      heading: "What Promise.race actually does",
      body: [
        "The deadline helper races the query against a timer and returns a fallback when the timer wins:",
        {
          type: "code",
          lang: "ts",
          code: `const result = await Promise.race([
  query,                                   // keeps running regardless
  sleep(8_000).then(() => fallback),       // the page moves on
]);`,
          caption: "The shape of the original deadline, simplified.",
        },
        "Nothing here cancels the query. The page moves on with its fallback, but the query is still in flight and its connection is still checked out of the pool. A code audit put the consequence in one line: ten of those empties a pool of ten, everything behind them waits and times out, and each of those leaks a slot of its own. The failure feeds itself.",
      ],
    },
    {
      heading: "Where the stuck queries came from",
      body: [
        "The slow queries were not slow queries. Vercel's Fluid Compute freezes an instance between requests, and freezes its timers with it, so the timer that would have retired an idle connection does not fire. Meanwhile the pooler drops connections it considers idle. The instance thaws holding sockets it believes are open and are not. A query sent down one waits for an answer that is never coming, and TCP keep-alive takes far longer to notice than the function is allowed to live.",
        {
          type: "flow",
          steps: [
            "Instance freezes with idle connections",
            "Pooler closes them",
            "Instance thaws; client still trusts the sockets",
            "Query sent down a dead socket never returns",
            "Deadline fires; connection stays checked out",
            "Pool fills; healthy queries queue and time out too",
          ],
        },
      ],
    },
    {
      heading: "Four bounds, each closing one gap",
      body: [
        "No single setting fixes this, because a timeout at the application layer cannot reach into the driver or the server. The pool is now bounded at every layer:",
        {
          type: "table",
          head: ["Setting", "Was", "Now", "Why"],
          rows: [
            ["`max_lifetime`", "10 minutes", "60 s", "a pool that collects dead sockets recovers in a minute, not after most of its life"],
            ["`idle_timeout`", "—", "5 s", "an instance rarely holds a connection when it freezes"],
            ["`connect_timeout`", "10 s", "5 s", "a failed connect raises an error inside the 8 s deadline instead of after it"],
            ["`statement_timeout`", "none", "7 s", "the server ends an over-running query, below the app deadline"],
            ["`idle_in_transaction_session_timeout`", "none", "10 s", "a transaction that opened and stalled cannot hold its slot"],
          ],
        },
        "The connect timeout detail is easy to miss. At ten seconds it never fired first: the read gave up at eight, abandoned its promise and left the connection checked out, so a stall cost a pool slot every time instead of raising an error the pool could reclaim. At five, it lands inside the deadline.",
        "The statement timeout is set deliberately below the application deadline so that the database wins the race. When the server cancels a query, the driver's promise rejects, the connection goes straight back to the pool, and the caller gets a real error to log rather than a fallback that looks like an empty result.",
        {
          type: "code",
          lang: "ts",
          code: `sql = postgres(url, {
  max: Number(process.env.PG_POOL_MAX || 10),
  max_lifetime: Number(process.env.PG_MAX_LIFETIME || 60),
  idle_timeout: Number(process.env.PG_IDLE_TIMEOUT || 5),
  connect_timeout: Number(process.env.PG_CONNECT_TIMEOUT || 5),
  prepare: false, // transaction pooler
  connection: {
    statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS || 7_000),
    idle_in_transaction_session_timeout: Number(process.env.PG_IDLE_TX_TIMEOUT_MS || 10_000),
  },
});`,
          caption: "From the RPOMS Postgres client, comments removed. Every value can be overridden by environment variable.",
        },
      ],
    },
    {
      heading: "The part that depends on the pooler",
      body: [
        "The two server-side timeouts are sent as startup parameters. A pooler that forwards them applies them per connection. Whether Supabase's pooler accepts them in transaction mode is something I have not verified, and the incident notes from September record it as untested. If it declines, the application deadline is still there as the backstop it always was, so nothing is worse than before, but the leak fix is then only as good as the lifetime and connect bounds.",
        "The check is one statement on the deployment: `SHOW statement_timeout;`. It belongs in any release checklist that changes these settings.",
        {
          type: "list",
          items: [
            "A JavaScript timeout abandons a promise; it does not release a connection.",
            "Put a server-side `statement_timeout` below the application deadline, and verify the pooler forwards it.",
            "Keep `connect_timeout` inside the read deadline, so a failed connect becomes an error rather than a leaked slot.",
            "On platforms that freeze instances, bound connection lifetime and idle time aggressively; reconnecting to a nearby database costs milliseconds.",
          ],
        },
        "The pool size and pooler mode matter just as much; the day they did not match is in [the EMAXCONNSESSION postmortem](/blog/supabase-session-pooler-emaxconnsession-postmortem). The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
