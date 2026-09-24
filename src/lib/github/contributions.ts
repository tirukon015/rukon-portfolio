/**
 * The GitHub contribution calendar, fetched on the server.
 *
 * Two sources, chosen by which environment variable is present, matching the
 * pattern used elsewhere in this codebase:
 *
 *   1. The GraphQL API, when `GITHUB_TOKEN` is set. This is the documented,
 *      supported path and the one production runs on. The query reads the
 *      token owner's own calendar (`viewer`), which is what makes private
 *      contribution activity part of the total when the profile setting to
 *      show it is on. Only the calendar is requested: dates, counts, levels.
 *      No repository, commit or event data is ever asked for, so none can
 *      leak. The token is read here and nowhere else. This module must only
 *      ever be imported from a server component; the `server-only` guard
 *      package is deliberately not added, because the project keeps its
 *      dependency list short, so the import discipline is the guard.
 *   2. GitHub's own public calendar fragment, when no token is configured. It
 *      is the HTML GitHub renders on a profile page, which is undocumented and
 *      could change shape without notice. It exists so the section works in
 *      development and degrades rather than disappears if the token is ever
 *      missing in production.
 *
 * Both are cached by Next for an hour, so the homepage makes at most one
 * GitHub request per hour per deployment rather than one per visitor. Both
 * fail soft: any error returns `null` and the section renders nothing. Log
 * lines carry a status code or GitHub's error message, never the token and
 * never a response body.
 */

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  count: number;
  level: ContributionLevel;
  /** 0 = Sunday, as GitHub reports it. */
  weekday: number;
  /** GitHub's own hex for the day, when the API supplied one. Display uses the theme; this is kept for reference. */
  color?: string;
};

export type ContributionCalendar = {
  total: number;
  /** Oldest week first. Each week is up to seven days, Sunday first. */
  weeks: ContributionDay[][];
  from: string;
  to: string;
  source: "graphql" | "public";
};

/** Seconds. One request an hour is plenty for a calendar that changes daily. */
export const CONTRIBUTIONS_REVALIDATE = 60 * 60;

/**
 * Milliseconds. Applied with a race rather than an AbortSignal, because
 * passing a signal to `fetch` opts the request out of Next's data cache.
 * On timeout the section renders nothing for this render; the fetch itself
 * is left to finish and populate the cache for the next one.
 */
const REQUEST_TIMEOUT_MS = 8000;

const QUERY = `
  query ContributionCalendar {
    viewer {
      login
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              color
              weekday
            }
          }
        }
      }
    }
  }
`;

type GraphQLResponse = {
  data?: {
    viewer?: {
      login?: string;
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel:
                | "NONE"
                | "FIRST_QUARTILE"
                | "SECOND_QUARTILE"
                | "THIRD_QUARTILE"
                | "FOURTH_QUARTILE";
              color?: string;
              weekday: number;
            }[];
          }[];
        };
      } | null;
    } | null;
  };
  errors?: { message: string; type?: string }[];
};

const LEVEL_BY_NAME: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function withTimeout<T>(work: Promise<T>, label: string): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.error(`GitHub ${label} did not answer within ${REQUEST_TIMEOUT_MS} ms.`);
      resolve(null);
    }, REQUEST_TIMEOUT_MS);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        console.error(`GitHub ${label} failed:`, error instanceof Error ? error.message : "unknown error");
        resolve(null);
      }
    );
  });
}

async function fromGraphQL(login: string, token: string): Promise<ContributionCalendar | null> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "rukon.dev",
    },
    body: JSON.stringify({ query: QUERY }),
    // No abort signal: passing one opts the request out of Next's data cache,
    // which would turn one request an hour into one per render.
    next: { revalidate: CONTRIBUTIONS_REVALIDATE, tags: ["github-contributions"] },
  });

  if (!res.ok) {
    // 401 is a bad token, 403 is usually a rate limit. Neither message is
    // shown to a visitor, and the body is not logged.
    console.error(`GitHub GraphQL responded ${res.status}.`);
    return null;
  }

  const json = (await res.json()) as GraphQLResponse;
  const viewer = json.data?.viewer;
  const calendar = viewer?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    console.error("GitHub GraphQL returned no calendar:", json.errors?.[0]?.message ?? "unknown");
    return null;
  }

  // The token owner's calendar must be the account the page says it is.
  if (viewer?.login && viewer.login.toLowerCase() !== login.toLowerCase()) {
    console.error("GitHub token belongs to a different account than the configured login.");
    return null;
  }

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_BY_NAME[day.contributionLevel] ?? 0,
      weekday: day.weekday,
      color: day.color,
    }))
  );

  return finish(weeks, calendar.totalContributions, "graphql");
}

/**
 * Parses the calendar out of GitHub's profile fragment.
 *
 * Each day is a `<td>` carrying `data-date`, `data-level` and an id of the form
 * `contribution-day-component-<weekday>-<week>`, and a separate `<tool-tip>`
 * element points at that id with the human-readable count. The count is only
 * available from the tooltip text, so both are read and joined on the id.
 */
async function fromPublicFragment(login: string): Promise<ContributionCalendar | null> {
  const res = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions`, {
    headers: { "User-Agent": "rukon.dev", Accept: "text/html" },
    next: { revalidate: CONTRIBUTIONS_REVALIDATE, tags: ["github-contributions"] },
  });

  if (!res.ok) {
    console.error(`GitHub contributions fragment responded ${res.status}.`);
    return null;
  }

  const html = await res.text();

  const counts = new Map<string, number>();
  for (const match of html.matchAll(
    /<tool-tip[^>]*\sfor="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)<\/tool-tip>/g
  )) {
    const text = match[2].trim();
    const number = /^([\d,]+)\s+contribution/.exec(text);
    counts.set(match[1], number ? Number(number[1].replace(/,/g, "")) : 0);
  }

  const weekMap = new Map<number, ContributionDay[]>();
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const attrs = match[1];
    const date = /\sdata-date="(\d{4}-\d{2}-\d{2})"/.exec(attrs)?.[1];
    const id = /\sid="(contribution-day-component-(\d+)-(\d+))"/.exec(attrs);
    const level = /\sdata-level="(\d)"/.exec(attrs)?.[1];
    if (!date || !id || !level) continue;

    const week = Number(id[3]);
    const days = weekMap.get(week) ?? [];
    days.push({
      date,
      count: counts.get(id[1]) ?? 0,
      level: Math.min(4, Math.max(0, Number(level))) as ContributionLevel,
      weekday: Number(id[2]),
    });
    weekMap.set(week, days);
  }

  if (weekMap.size === 0) {
    console.error("GitHub contributions fragment parsed to zero days; its markup may have changed.");
    return null;
  }

  const weeks = [...weekMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, days]) => days.sort((a, b) => (a.date < b.date ? -1 : 1)));

  const total = weeks.flat().reduce((sum, day) => sum + day.count, 0);
  return finish(weeks, total, "public");
}

function finish(
  weeks: ContributionDay[][],
  total: number,
  source: ContributionCalendar["source"]
): ContributionCalendar | null {
  const days = weeks.flat();
  if (days.length === 0) return null;
  return {
    total,
    weeks,
    from: days[0].date,
    to: days[days.length - 1].date,
    source,
  };
}

/**
 * The sanitised calendar for `login`, or `null`.
 *
 * What comes back is exactly the shape above: dates, counts, levels, weekday
 * and GitHub's colour hex. Nothing about repositories, commits, events or the
 * request itself is included, and the token never leaves this module.
 */
export async function getContributionCalendar(
  login: string
): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN?.trim();

  if (token) {
    const viaApi = await withTimeout(fromGraphQL(login, token), "GraphQL request");
    if (viaApi) return viaApi;
    // A bad token, a rate limit or a timeout should not blank the section
    // while the public path works.
  }
  return withTimeout(fromPublicFragment(login), "contributions fragment");
}
