/**
 * The GitHub contribution calendar, fetched on the server.
 *
 * One source: GitHub's GraphQL API, authenticated with `GITHUB_TOKEN`. The
 * query reads the token owner's own calendar (`viewer`), which is what makes
 * private contribution activity part of the total when the profile setting
 * to show it is on. Only the calendar is requested: login, dates, counts,
 * levels and weekdays. No repository, commit or event data is ever asked
 * for, so none can leak.
 *
 * The token is read here and nowhere else. This module must only ever be
 * imported from a server component; the `server-only` guard package is
 * deliberately not added, because the project keeps its dependency list
 * short, so the import discipline is the guard.
 *
 * The request is cached by Next for an hour, so the homepage makes at most
 * one GitHub request per hour per deployment rather than one per visitor.
 * Everything fails soft: a missing token, a bad token, a rate limit, a slow
 * answer or a malformed reply all return `null`, and the section shows an
 * unavailable state rather than invented data. Log lines carry a status code
 * or GitHub's error message, never the token and never a response body.
 */

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  count: number;
  level: ContributionLevel;
  /** 0 = Sunday, as GitHub reports it. */
  weekday: number;
};

export type ContributionCalendar = {
  /** The authenticated account, as GitHub reports it. */
  login: string;
  total: number;
  /** Oldest week first. Each week is up to seven days, Sunday first. */
  weeks: ContributionDay[][];
  from: string;
  to: string;
};

/** Seconds. One request an hour is plenty for a calendar that changes daily. */
export const CONTRIBUTIONS_REVALIDATE = 60 * 60;

/**
 * Milliseconds. Applied with a race rather than an AbortSignal, because
 * passing a signal to `fetch` opts the request out of Next's data cache.
 * On timeout the section renders its unavailable state for this render; the
 * fetch itself is left to finish and populate the cache for the next one.
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

function withTimeout<T>(work: Promise<T>): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.error(`GitHub GraphQL request did not answer within ${REQUEST_TIMEOUT_MS} ms.`);
      resolve(null);
    }, REQUEST_TIMEOUT_MS);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        console.error("GitHub GraphQL request failed:", error instanceof Error ? error.message : "unknown error");
        resolve(null);
      }
    );
  });
}

async function fetchCalendar(token: string): Promise<ContributionCalendar | null> {
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
  if (!viewer?.login || !calendar) {
    console.error("GitHub GraphQL returned no calendar:", json.errors?.[0]?.message ?? "unknown");
    return null;
  }

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_BY_NAME[day.contributionLevel] ?? 0,
      weekday: day.weekday,
    }))
  );

  const days = weeks.flat();
  if (days.length === 0) return null;

  return {
    login: viewer.login,
    total: calendar.totalContributions,
    weeks,
    from: days[0].date,
    to: days[days.length - 1].date,
  };
}

/**
 * The sanitised calendar for the authenticated account, or `null`.
 *
 * What comes back is exactly the shape above: login, total, and weeks of
 * dates, counts, levels and weekdays. Nothing about repositories, commits,
 * events or the request itself is included, and the token never leaves this
 * module.
 */
export async function getContributionCalendar(): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    console.error("GITHUB_TOKEN is not configured; the contribution calendar is unavailable.");
    return null;
  }
  return withTimeout(fetchCalendar(token));
}
