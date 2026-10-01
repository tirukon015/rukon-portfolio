import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "nextjs-error-boundary-auto-retry-jitter",
  title: "An Error Boundary That Retried Into the Outage: Backoff With Jitter",
  description:
    "A Next.js error.tsx that retries on its own is right for a wall display, and wrong if every open screen retries in lockstep. Longer waits, jitter and a slow interval that never stops.",
  date: "2026-12-28",
  category: "Full-Stack Development",
  tags: ["Next.js", "Error Handling", "Retry", "Jitter", "React", "Resilience"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Next.js Error Boundary Retries: Add Jitter",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "supabase-session-pooler-emaxconnsession-postmortem",
    "promise-race-timeout-leaks-postgres-connections",
    "stale-responses-overwrite-newer-filter-results-react",
  ],
  sections: [
    {
      heading: "A screen nobody stands next to",
      body: [
        "The dashboard in RPOMS, the operations system I built for a router-refurbishment line, is left running for days at a time. It refreshes itself, about fourteen hundred loads a day. Before its error boundary retried at all, one failed load left it sitting on an error page until somebody noticed and pressed the retry button, which on a screen nobody stands next to could be hours.",
        "So the route-level `error.tsx` was given an automatic retry: wait a few seconds, call Next.js's `reset()`, and try the render again. That was the right idea with the wrong timing. This is for anyone whose error boundary retries by itself.",
      ],
    },
    {
      heading: "The recovery competed with the recovery",
      body: [
        "The first version retried after four seconds. A code audit in September 2026 (ERR-05) pointed out what that meant. A failed admin page is eight database queries that did not answer, and retrying it four seconds later asks the same eight questions of a database that is already in trouble. Every open screen failed at the same moment, so every open screen retried at the same moment. The load arrived in spikes exactly while the database was trying to recover.",
        "The failure mode is real. During [an incident where the connection pooler ran out of slots](/blog/supabase-session-pooler-emaxconnsession-postmortem), the error page was what operators saw, and every retry it made was another request for the same reads.",
      ],
    },
    {
      heading: "Three changes, none of which give up",
      body: [
        {
          type: "code",
          lang: "ts",
          code: `const FIRST_RETRY_MS = 8_000;
const MAX_RETRY_MS = 60_000;
const ATTEMPTS_BEFORE_SETTLING = 10;
const SETTLED_RETRY_MS = 5 * 60_000;
const JITTER = 0.25;

export function retryDelayMs(n: number, random: () => number = Math.random): number {
  const base =
    n > ATTEMPTS_BEFORE_SETTLING
      ? SETTLED_RETRY_MS
      : Math.min(FIRST_RETRY_MS * 2 ** (n - 1), MAX_RETRY_MS);
  // +/- JITTER around the base, never below a second.
  const scattered = base * (1 + (random() * 2 - 1) * JITTER);
  return Math.max(1_000, Math.round(scattered));
}`,
          caption: "From the RPOMS error boundary.",
        },
        {
          type: "list",
          items: [
            "A longer first wait. Eight seconds instead of four, doubling to a one-minute ceiling, because almost nothing that breaks a page is fixed within four seconds.",
            "Jitter of plus or minus 25 percent, so screens that failed together do not retry together. The randomness is injectable, which makes the function testable.",
            "A slow interval instead of stopping. The first ten attempts take about eight minutes. Past that, the trouble is not transient, and asking every minute from every open screen is pure load, so the wait settles at five minutes.",
          ],
        },
        "It deliberately never stops retrying. A boundary that gives up after ten tries is a boundary that leaves the wall display dead until someone walks over to it, which was the original problem.",
      ],
    },
    {
      heading: "Wiring it into error.tsx",
      body: [
        "The boundary keeps an attempt counter in a ref, so it counts up for as long as the boundary stays mounted, and each failed attempt waits longer than the last. A one-second interval drives the countdown shown on screen, and a timeout calls `reset`. Both are cleared on cleanup, so a boundary that unmounts leaves nothing running. The manual retry button is still there for anyone who is standing next to it.",
        {
          type: "code",
          lang: "ts",
          code: `const attempt = useRef(0);
useEffect(() => {
  attempt.current += 1;
  const wait = retryDelayMs(attempt.current);
  setSeconds(Math.round(wait / 1000));
  const tick = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
  const retry = setTimeout(reset, wait);
  return () => { clearInterval(tick); clearTimeout(retry); };
}, [error, reset]);`,
        },
        "One thing the boundary cannot do is say why it failed. In production, Next.js sends the browser only an error digest, so \"database busy\" and \"bug\" look the same on screen. The reason lives in the server log, which is where to look first.",
      ],
    },
    {
      heading: "The general rule",
      body: [
        "Any client that retries automatically is part of the load on the thing it is waiting for. Exponential backoff spreads one client's attempts out over time; jitter spreads many clients' attempts out from each other; a settled interval bounds the cost of a long outage. For unattended screens, the right final state is \"keep trying, slowly\", not \"give up\".",
        "On the server side, the matching fix was making sure abandoned queries do not hold connections, described in [Promise.race Timeouts Don't Cancel Queries](/blog/promise-race-timeout-leaks-postgres-connections). The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
