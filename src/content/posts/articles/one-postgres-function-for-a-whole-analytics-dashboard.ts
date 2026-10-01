import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-postgres-function-for-a-whole-analytics-dashboard",
  title: "One SQL Function for a Whole Analytics Dashboard",
  description:
    "Every figure on a small analytics dashboard, totals, a gap-free time series and ranked breakdowns, returned as one JSON document by one PostgreSQL function, in the owner's time zone.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "SQL", "Supabase", "Analytics", "JSONB", "Time Zones"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "A Whole Dashboard in One Postgres Function",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "cookieless-first-party-analytics-with-a-daily-salted-ip-hash",
    "analytics-retention-rollups-with-pg-cron",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "The problem: a dozen numbers, a dozen round trips",
      body: [
        "The admin dashboard of [rukon-link](/work/rukon-link), my QR link page, shows views, visits, unique visitors, link clicks and contact requests for a chosen range, a traffic chart, per-link figures, and ranked breakdowns by source, device, operating system, browser, country and city. Built the obvious way, that is a dozen queries from the server, each a round trip to the database. This article shows the alternative I used: one PostgreSQL function, `link_dashboard`, that computes everything and returns it as a single `jsonb` document. It is aimed at anyone building a small dashboard on Supabase or plain PostgreSQL.",
      ],
    },
    {
      heading: "The signature: local calendar dates in, one JSON document out",
      body: [
        {
          type: "code",
          lang: "sql",
          code: `create or replace function public.link_dashboard(
  p_from date, p_to date, p_tz text default 'Asia/Kuala_Lumpur'
)
returns jsonb
language sql
stable
set search_path = public
as $$ ... $$;`,
        },
        "The inputs are calendar dates, inclusive, as the person reading the dashboard understands them, plus the time zone they are in. \"Today\" means today in Kuala Lumpur, not today in UTC. The Next.js server works out the range from the owner's time zone (today, yesterday, seven or thirty days, this month, or a custom range capped at a year so a typo cannot scan the whole table) and calls the function once through Supabase's RPC.",
        "`language sql` and `stable` tell PostgreSQL the function only reads. `set search_path = public` pins name resolution, which is a sensible habit for any function so it cannot be redirected by a caller's search path.",
      ],
    },
    {
      heading: "Turning local dates into exact instants",
      body: [
        "The first CTE converts the dates into a half-open range of timestamps, and chooses a bucket size:",
        {
          type: "code",
          lang: "sql",
          code: `with bounds as (
  select (p_from::timestamp at time zone p_tz)       as t0,
         ((p_to + 1)::timestamp at time zone p_tz)   as t1,
         case when p_to = p_from then 'hour' else 'day' end as bucket
)`,
        },
        "`date::timestamp at time zone p_tz` reads midnight as local time in that zone and returns the exact instant. The end is the start of the day after `p_to`, so the filter is `created_at >= t0 and created_at < t1`, with no off-by-one at midnight and no `23:59:59`. A single day is charted by hour, anything longer by day. This is the same idea I wrote about in [The Business Day Is Not the Server Day](/blog/the-business-day-is-not-the-server-day): decide which calendar a question is asked in before you write the query.",
      ],
    },
    {
      heading: "A time series with no missing buckets",
      body: [
        "A chart built only from rows that exist skips the hours or days with no traffic, and the bars close up as though the quiet period never happened. `generate_series` produces every bucket in the range, and the page views are left-joined onto it:",
        {
          type: "code",
          lang: "sql",
          code: `series as (
  select g as bucket_start,
         count(pv.id) as page_views,
         count(distinct pv.vid) as visitors
  from bounds b
  cross join lateral generate_series(
    date_trunc(b.bucket, b.t0 at time zone p_tz),
    date_trunc(b.bucket, (b.t1 - interval '1 second') at time zone p_tz),
    case when b.bucket = 'hour' then interval '1 hour' else interval '1 day' end
  ) g
  left join pv on date_trunc(b.bucket, pv.created_at at time zone p_tz) = g
  group by g
  order by g
)`,
          caption: "From the rukon-link migration. Empty buckets come back as zero.",
        },
        "Bucketing happens in local time as well: `created_at at time zone p_tz` converts each stored instant back to a local clock time before truncating, so an event at 00:30 in Kuala Lumpur lands on the right day.",
      ],
    },
    {
      heading: "Counting people, and building the document",
      body: [
        "A unique visitor is `count(distinct coalesce(visitor_id, ip_hash))`: the random id from the visitor's browser storage when there is one, otherwise the daily salted IP hash. Visits are distinct session ids. Both are approximations, and the dashboard does not pretend otherwise.",
        "The final `select` assembles one object with `jsonb_build_object`: an overview of five totals, the series, per-link clicks and contact requests with their unique users, and each breakdown as a `jsonb_agg` of label and count, ordered and limited (top ten sources, countries and cities, top eight browsers and operating systems). Missing values are labelled \"Unknown\" or \"Direct / Unknown\" rather than dropped, and `coalesce(..., '[]'::jsonb)` makes an empty range return empty arrays rather than null, so the frontend has no special cases. An all-time page-view total adds the current events to the daily totals kept after old events are purged.",
      ],
    },
    {
      heading: "Locked down like the tables",
      body: [
        "The function is revoked from `public`, `anon` and `authenticated` and granted only to `service_role`, the same as the tables it reads, which have Row Level Security on and no policies. Only the Next.js server, after checking that the caller is the signed-in admin, can call it. The server returns the result with `Cache-Control: private, no-store`.",
        "The trade-off is that the logic lives in SQL, which is less familiar than TypeScript to many people and is changed by migration rather than by deploy. For a dashboard whose figures all come from one table and must agree with each other, one consistent snapshot in one round trip was worth it. I have not benchmarked it; at this page's traffic, any approach would be fast. How the events get into the table is in [First-Party Analytics Without Cookies](/blog/cookieless-first-party-analytics-with-a-daily-salted-ip-hash).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
