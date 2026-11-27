import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "replacing-dashboard-polling-with-server-sent-events",
  title: "Replacing Dashboard Polling With Server-Sent Events",
  description:
    "How the RPOMS dashboard stopped polling: a Daily Report save now notifies every open dashboard over Server-Sent Events, other server instances are covered by one cheap version read, and polling stays as the fallback. The measurements from the release, including what was not verified.",
  date: "2026-11-27",
  category: "Building Real Systems",
  tags: ["Server-Sent Events", "Next.js", "PostgreSQL", "Vercel", "Real-time"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: ["reporting-from-operational-data", "the-business-day-is-not-the-server-day"],
  sections: [
    {
      heading: "What problem did the dashboard have?",
      body: [
        "The RPOMS dashboard is the screen the production floor and the office watch during the day: today's accepted, cleaned and packed counts, batch progress and the workforce assignment. When someone saved the Daily Report, other open dashboards found out by polling a version endpoint, six times a minute per screen. That meant up to ten seconds of stale figures after a save, and a steady stream of requests from every idle screen even when nothing had changed.",
      ],
    },
    {
      heading: "What replaced the polling?",
      body: [
        "A Server-Sent Events route, `GET /api/dashboard/stream`, released to production on 21 November 2026. A screen opens one long-lived connection. When a Daily Report is saved or deleted, the server that handled the write tells every dashboard connected to it at once, and each one refreshes.",
        "A save on a different server instance is the harder case, because that instance's listeners are not this instance's listeners. Each instance therefore reads the dashboard's version once every 1.5 seconds, but only while at least one screen is connected to it, and pushes an update when the version changes. Polling from the browser remains only as the fallback if the stream cannot be opened.",
        {
          type: "flow",
          steps: [
            "Daily Report saved",
            "Same instance: notify connected screens immediately",
            "Other instances: version read every 1.5 s while screens are connected",
            "Each screen refreshes once",
          ],
          caption: "How a save reaches every open dashboard.",
        },
      ],
    },
    {
      heading: "Why Server-Sent Events rather than WebSockets?",
      body: [
        "The traffic is one-way: the server announces that something changed, and the browser fetches the new figures through the routes it already uses. Server-Sent Events are plain HTTP, reconnect automatically, pass through the existing authentication on the route, and need no extra protocol or library on either side. Nothing here needed the browser to send messages back over the same connection.",
      ],
    },
    {
      heading: "How was it verified?",
      body: [
        "On server staging, with two signed-in sessions and staging data:",
        {
          type: "table",
          head: ["Check", "Result"],
          rows: [
            ["Save through the form, second screen watching", "Save 82–121 ms; the other screen began its refresh 8–75 ms after the save's response; exactly one refresh, zero polls"],
            ["Dashboard left open for 60 seconds", "6 version polls a minute before; 0 requests after"],
            ["Five extra stream clients plus the browser", "Each received exactly one update per save; heartbeats every 20 s"],
          ],
          caption: "Staging measurements recorded with the release.",
        },
        "The cost on the database side is the version statement: about 4 ms on staging, mostly planning. One instance with screens connected runs it 40 times a minute, where previously every screen ran it six times a minute, which is not material at this size and buys at most 1.5 seconds of cross-instance freshness.",
      ],
    },
    {
      heading: "What does serverless hosting change?",
      body: [
        "On Vercel an open stream holds one idle function connection. The server ends each stream at 240 seconds, inside the route's 300-second maximum, and the browser reconnects. That keeps each connection inside the platform's limits instead of relying on it never being cut.",
      ],
    },
    {
      heading: "What was not verified in production?",
      body: [
        "After deployment the production stream route answered unauthenticated requests with 401, which shows the route is live and protected. A dashboard updating after a real save in production needs a signed-in person on production data, and that check was recorded as outstanding rather than assumed.",
        "The system behind this is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
