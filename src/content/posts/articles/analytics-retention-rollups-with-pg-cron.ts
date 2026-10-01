import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "analytics-retention-rollups-with-pg-cron",
  title: "Keeping Analytics for 90 Days: Roll Up, Then Delete, With pg_cron",
  description:
    "Detailed analytics events kept for a set period, then summarised into daily totals and deleted by a scheduled PostgreSQL function. The retention setting, the job, and the time-zone trade-offs.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "pg_cron", "Data Retention", "Supabase", "Privacy", "Analytics"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Analytics Data Retention With pg_cron Rollups",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "one-postgres-function-for-a-whole-analytics-dashboard",
    "cookieless-first-party-analytics-with-a-daily-salted-ip-hash",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "The problem: analytics you keep forever become a liability",
      body: [
        "[rukon-link](/work/rukon-link), my QR link page, records page views and link clicks with device, referrer, approximate location and a hashed network address. That detail is useful for a few weeks and then mostly risk: more data to protect and nothing to gain from it. Its privacy page promises that detailed analytics are deleted after about 90 days and only daily totals are kept. This article is how that promise is kept inside PostgreSQL, for anyone wanting a retention policy that runs without an application server being awake.",
      ],
    },
    {
      heading: "Retention as data, editable from the admin panel",
      body: [
        "Retention periods live in a small key/value settings table as `jsonb`, seeded by the migration with `on conflict do nothing` so re-running it never overwrites a changed value:",
        {
          type: "table",
          head: ["Setting", "Default", "Allowed in the admin form", "Meaning"],
          rows: [
            ["analytics_retention_days", "90", "7 to 730", "How long detailed events are kept"],
            ["contact_retention_days", "0", "0 to 3,650", "How long contact requests are kept; 0 means until deleted by hand"],
          ],
        },
        "The admin settings page is a server action that checks the signed-in admin and validates the numbers before saving. The settings page also has a button that runs the purge immediately and reports how many events and requests it removed.",
      ],
    },
    {
      heading: "The purge: summarise first, then delete",
      body: [
        "One PL/pgSQL function, `link_purge()`, does the work. It reads the two settings, computes a cutoff at the start of a day, and then rolls everything older than the cutoff into a daily table before deleting it:",
        {
          type: "code",
          lang: "sql",
          code: `insert into link_daily_stats (day, event_type, link_key, events, visitors)
select created_at::date, event_type, coalesce(link_key, ''),
       count(*), count(distinct coalesce(visitor_id, ip_hash))
from link_analytics_events
where created_at < cutoff
group by 1, 2, 3
on conflict (day, event_type, link_key) do update
  set events   = link_daily_stats.events   + excluded.events,
      visitors = link_daily_stats.visitors + excluded.visitors;

delete from link_analytics_events where created_at < cutoff;`,
          caption: "From link_purge() in the rukon-link migration.",
        },
        "Because the insert and the delete run inside one function call, they share one transaction: either both happen or neither does, so events are never deleted without being counted. `link_key` is coalesced to an empty string because it is part of the primary key and cannot be null. If a contact retention period is set, old contact requests are deleted too. The function returns how many rows it removed.",
        "What survives is deliberately coarse: per day, per event type and per link, a count of events and a count of distinct visitors. No hash, user agent, referrer or location is kept.",
      ],
    },
    {
      heading: "Scheduling it with pg_cron, and surviving without it",
      body: [
        "Supabase includes the `pg_cron` extension, so the job runs inside the database on a schedule, with no external cron service and no function that has to be woken up. The migration schedules it, and is written so it degrades instead of failing:",
        {
          type: "code",
          lang: "sql",
          code: `do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule('link_purge_daily')
    where exists (select 1 from cron.job where jobname = 'link_purge_daily');
  perform cron.schedule('link_purge_daily', '15 3 * * *', 'select public.link_purge()');
exception when others then
  raise notice 'pg_cron not available (%). Run select public.link_purge() manually ...', sqlerrm;
end
$$;`,
          caption: "Simplified from the migration.",
        },
        "Unscheduling an existing job of the same name first makes the migration safe to re-run. If `pg_cron` is unavailable, the migration still succeeds with a notice, and the manual button in the admin panel covers the gap. The job runs daily at 03:15 UTC, which is 11:15 in Malaysia, and like the dashboard function it is granted only to the server's service role.",
      ],
    },
    {
      heading: "Time-zone and counting trade-offs, stated plainly",
      body: [
        "The dashboard works in the owner's time zone, Asia/Kuala_Lumpur. The purge does not. `created_at::date` and `date_trunc('day', now())` both use the database session's time zone, which on Supabase is UTC unless it has been changed. So a rolled-up \"day\" is a UTC day, eight hours offset from the dashboard's local days. I checked where that matters before writing this, and today it barely does: the dashboard reads detailed events for every range, and the daily table is used only to add to an all-time page-view total, where which day an event is filed under makes no difference.",
        "Two consequences are worth knowing all the same. A dashboard range reaching further back than the retention period shows nothing for the purged days, because the charts read only detailed events; the totals were kept, but nothing displays them by day yet. And the `visitors` column is distinct per UTC day. Adding days together, or the rare case of the upsert adding to an existing row, gives visits-by-day summed, not distinct people across days. If the rollups ever feed a chart, the purge should bucket by the same local time zone as the dashboard, and the chart should say what a summed visitor count means.",
        "Rolling up and deleting is simple, and it makes a privacy promise enforceable by the database rather than by someone remembering. How the detailed figures are computed is in [One SQL Function for a Whole Analytics Dashboard](/blog/one-postgres-function-for-a-whole-analytics-dashboard), and the question of which calendar a business question is asked in is in [The Business Day Is Not the Server Day](/blog/the-business-day-is-not-the-server-day).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
