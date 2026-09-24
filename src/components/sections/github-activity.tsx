import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
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
 * and cached for an hour, so this renders real activity without a request per
 * visitor and without a token anywhere near the browser. What reaches the
 * page is dates, counts and levels only: no repository names, no commits, no
 * events. If GitHub is unreachable the section renders nothing rather than an
 * empty frame.
 *
 * Accessibility: the grid is one image with a full-sentence description, the
 * total, range and legend are real text beside it, and the wrapper gives
 * keyboard users arrow-key movement across days with the same per-day label
 * pointer users get on hover.
 */
export async function GithubActivity() {
  const calendar = await getContributionCalendar(site.githubLogin);
  if (!calendar) return null;

  const weeks = calendar.weeks;

  // A month label sits over the first week that contains a new month, and is
  // skipped when the previous label is too close to breathe.
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
    <section id="activity" aria-labelledby="activity-heading" className="border-b border-border py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Activity</span>
              <h2 id="activity-heading" className="mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                {calendar.total.toLocaleString("en-US")} contributions in the last year.
              </h2>
            </div>
            <a
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              github.com/{site.githubLogin} <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="mt-10 rounded-lg border border-border bg-bg-elevated p-4 sm:p-6">
            <div>
              <HeatmapTooltip>
                <div className="inline-block min-w-full">
                  <div
                    role="img"
                    aria-label={summary}
                    className="grid gap-x-[3px]"
                    style={{
                      gridTemplateColumns: `2.25rem repeat(${weeks.length}, 11px)`,
                      gridTemplateRows: "1.25rem repeat(7, 11px)",
                      rowGap: "3px",
                    }}
                  >
                    {/* Month labels along the top. */}
                    <span aria-hidden="true" />
                    {weeks.map((_, i) => {
                      const m = monthLabels.find((l) => l.week === i);
                      return (
                        <span
                          key={`m-${i}`}
                          aria-hidden="true"
                          className="relative font-mono text-[10px] leading-5 text-text-faint"
                        >
                          {m ? <span className="absolute left-0 top-0">{m.name}</span> : null}
                        </span>
                      );
                    })}

                    {/* Seven rows: weekday label, then one cell per week. */}
                    {Array.from({ length: 7 }, (_, weekday) => (
                      <WeekRow key={weekday} weekday={weekday} weeks={weeks} />
                    ))}
                  </div>
                </div>
              </HeatmapTooltip>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-text-faint">
              <p>
                {longDate(calendar.from)} to {longDate(calendar.to)}. Updated hourly from GitHub; includes
                private activity as an aggregate only.
              </p>
              <p className="flex items-center gap-1.5" aria-hidden="true">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={cn("h-[11px] w-[11px] rounded-[2px] heat", level > 0 && `heat-${level}`)} />
                ))}
                <span>More</span>
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const WEEKDAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

function WeekRow({ weekday, weeks }: { weekday: number; weeks: ContributionDay[][] }) {
  return (
    <>
      <span aria-hidden="true" className="font-mono text-[10px] leading-[11px] text-text-faint">
        {WEEKDAY_LABELS[weekday] ?? ""}
      </span>
      {weeks.map((week, i) => {
        // Weeks run Sunday to Saturday. The first and last weeks of the year can
        // be partial, so a missing day is an empty slot rather than a zero.
        const day = week.find((d) => d.weekday === weekday);
        if (!day) return <span key={`${i}-${weekday}`} aria-hidden="true" className="block h-[11px] w-[11px]" />;
        return (
          <span
            key={day.date}
            data-date={day.date}
            data-label={label(day)}
            className={cn(
              "heat block h-[11px] w-[11px] rounded-[2px] transition-transform duration-150 hover:scale-125",
              "data-[focused]:outline data-[focused]:outline-2 data-[focused]:outline-offset-1 data-[focused]:outline-accent",
              day.level > 0 && `heat-${day.level}`
            )}
          />
        );
      })}
    </>
  );
}
