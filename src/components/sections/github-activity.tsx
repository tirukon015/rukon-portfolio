import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { GithubIcon } from "@/components/icons";
import { HeatmapTooltip } from "@/components/heatmap-tooltip";
import { site } from "@/content/site";
import { getContributionCalendar, type ContributionDay } from "@/lib/github/contributions";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** The accessible name of one day: what a screen reader and the tooltip both say. */
function label(day: ContributionDay) {
  if (day.count === 0) return `No contributions on ${longDate(day.date)}`;
  return `${day.count.toLocaleString("en-US")} contribution${day.count === 1 ? "" : "s"} on ${longDate(
    day.date
  )}`;
}

/**
 * The GitHub contribution calendar, and nothing else from GitHub.
 *
 * Server component. The data is fetched in `src/lib/github/contributions.ts`
 * from the authenticated GraphQL API and cached for an hour, so this renders
 * real activity without a request per visitor and without a token anywhere
 * near the browser. What reaches the page is the login, the total, and the
 * dates, counts and levels of each day: no repository names, no commits, no
 * events. If GitHub cannot be reached the panel says so rather than showing
 * anything invented.
 *
 * Layout follows GitHub's own calendar: a header with the account, month
 * labels over a 53-by-7 grid, and a footer with the total and the legend.
 * Cell size is derived from the panel width with container-query units, so
 * the whole year fits on a desktop and scrolls inside the panel on a phone.
 *
 * Accessibility: the grid is one image with a full-sentence description, the
 * total and legend are real text, and the wrapper gives keyboard users
 * arrow-key movement across days with the same per-day label pointer users
 * get on hover.
 */
export async function GithubActivity() {
  const calendar = await getContributionCalendar();

  return (
    <section id="activity" aria-labelledby="activity-heading" className="border-b border-border py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="rounded-lg border border-border bg-bg-elevated">
            {/* Header: label left, account right. */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4 sm:px-6">
              <h2
                id="activity-heading"
                className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
              >
                <GithubIcon size={15} className="text-text-faint" />
                GitHub Activity
              </h2>
              {calendar ? (
                <a
                  href={`https://github.com/${calendar.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-muted transition-colors hover:text-text"
                >
                  @{calendar.login}
                </a>
              ) : (
                <a
                  href={site.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-muted transition-colors hover:text-text"
                >
                  github.com/{site.githubLogin}
                </a>
              )}
            </div>

            {calendar ? <Calendar calendar={calendar} /> : <Unavailable />}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Unavailable() {
  return (
    <div className="px-5 py-10 sm:px-6">
      <p className="text-sm text-text-muted">
        Contribution data is unavailable right now. It comes straight from GitHub and will be back
        once the connection is.
      </p>
    </div>
  );
}

function Calendar({
  calendar,
}: {
  calendar: NonNullable<Awaited<ReturnType<typeof getContributionCalendar>>>;
}) {
  const weeks = calendar.weeks;

  // A month label sits over the first week that contains the first day of a
  // new month, computed from the real dates so labels line up with columns.
  // A label is skipped only when it would sit within two columns of the
  // previous one, which happens at the very start of the range.
  const monthLabels: { week: number; name: string }[] = [];
  let lastMonth = -1;
  let lastLabelWeek = -10;
  weeks.forEach((week, i) => {
    const first = week[0];
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (i - lastLabelWeek >= 2) {
        monthLabels.push({ week: i, name: MONTHS[month] });
        lastLabelWeek = i;
      }
      lastMonth = month;
    }
  });

  const summary = `${calendar.total.toLocaleString("en-US")} contributions on GitHub between ${longDate(
    calendar.from
  )} and ${longDate(calendar.to)}.`;

  return (
    <>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <HeatmapTooltip>
          {/*
            The grid sizes itself from the scroller's width: one weekday label
            column, then one column per week. `--cell` is clamped so a desktop
            fits the whole year and a phone gets readable cells that scroll.
          */}
          <div
            role="img"
            aria-label={summary}
            className="heat-grid grid"
            style={
              {
                "--weeks": weeks.length,
                gridTemplateColumns: `2rem repeat(${weeks.length}, var(--cell))`,
                gridTemplateRows: "1.1rem repeat(7, var(--cell))",
                columnGap: "var(--gap)",
                rowGap: "var(--gap)",
              } as React.CSSProperties
            }
          >
            {/* Month labels along the top. */}
            <span aria-hidden="true" />
            {weeks.map((_, i) => {
              const m = monthLabels.find((l) => l.week === i);
              return (
                <span key={`m-${i}`} aria-hidden="true" className="relative">
                  {m ? (
                    <span className="absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] leading-[1.1rem] text-text-faint">
                      {m.name}
                    </span>
                  ) : null}
                </span>
              );
            })}

            {/* Seven rows: weekday label, then one cell per week. */}
            {Array.from({ length: 7 }, (_, weekday) => (
              <WeekRow key={weekday} weekday={weekday} weeks={weeks} />
            ))}
          </div>
        </HeatmapTooltip>
      </div>

      {/* Footer: total left, legend right. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <p className="text-sm text-text">
          <span className="font-semibold">{calendar.total.toLocaleString("en-US")}</span>{" "}
          <span className="text-text-muted">contributions in the last year</span>
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint" aria-hidden="true">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={cn("heat inline-block h-[11px] w-[11px] rounded-[2px]", level > 0 && `heat-${level}`)} />
          ))}
          <span>More</span>
        </p>
      </div>
    </>
  );
}

const WEEKDAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

function WeekRow({ weekday, weeks }: { weekday: number; weeks: ContributionDay[][] }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="self-center font-mono text-[10px] leading-none text-text-faint"
      >
        {WEEKDAY_LABELS[weekday] ?? ""}
      </span>
      {weeks.map((week, i) => {
        // Weeks run Sunday to Saturday. The first and last weeks of the year can
        // be partial, so a missing day is an empty slot rather than a zero.
        const day = week.find((d) => d.weekday === weekday);
        if (!day) return <span key={`${i}-${weekday}`} aria-hidden="true" className="block" />;
        return (
          <span
            key={day.date}
            data-date={day.date}
            data-count={day.count}
            data-label={label(day)}
            className={cn(
              "heat block rounded-[2px] transition-transform duration-150 hover:scale-125",
              "data-[focused]:outline data-[focused]:outline-2 data-[focused]:outline-offset-1 data-[focused]:[outline-color:var(--heat-4)]",
              day.level > 0 && `heat-${day.level}`
            )}
          />
        );
      })}
    </>
  );
}
