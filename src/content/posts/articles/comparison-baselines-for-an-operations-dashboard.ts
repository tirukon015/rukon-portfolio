import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "comparison-baselines-for-an-operations-dashboard",
  title: "Yesterday Is Not Enough: Choosing Comparison Baselines for an Operations Dashboard",
  description:
    "The five baselines the RPOMS dashboard compares today against, how each is computed, why one rising metric is red, and why missing data shows N/A.",
  date: "2026-12-10",
  category: "Building Real Systems",
  tags: ["Dashboard", "KPIs", "Data Visualisation", "React", "Operations"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Comparison Baselines for a Production Dashboard",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "reporting-from-operational-data",
    "rtl-arabic-dashboard-in-nextjs-with-typed-i18n",
    "blank-is-not-zero-production-report-inputs",
    "derived-inventory-from-a-ledger-not-a-stored-balance",
  ],
  sections: [
    {
      heading: "The problem: a number with nothing to compare it to",
      body: [
        "\"We packaged 180 routers today\" does not tell a supervisor whether the day went well. Against yesterday it might be up; against the last week it might be the worst day running. A raw count does not support a decision. A comparison does, but only if the comparison is the right one and is honest about what it is compared with.",
        "The RPOMS dashboard is the live, read-only screen that shows how the router-refurbishment line is doing. Alongside the day's four figures (accepted, retired, cleaned and packaged) it has a Production Comparison card that lets the reader choose the baseline. This article explains the five baselines, how each is computed, and the small decisions that keep the comparison honest. It is for anyone building KPI comparisons on daily operational data.",
      ],
    },
    {
      heading: "What \"today\" means",
      body: [
        "On this card, today is the most recent report on file, not the calendar date. Reports are filed at the end of the working day, so in the morning the latest report is yesterday's, and comparing the empty calendar day against anything would show a collapse that did not happen. Every baseline is defined relative to the date of that latest report. That date is the Malaysian business day, not the server's.",
      ],
    },
    {
      heading: "Five baselines and how each is computed",
      body: [
        {
          type: "table",
          head: ["Baseline", "Compared against", "Answers"],
          rows: [
            ["Yesterday", "The report dated one day before the latest", "Did today go better than the day before?"],
            ["7-day average", "Mean of reports in the 7 days before the latest, excluding it", "Is today normal for this week?"],
            ["Last week", "Mean of reports 7 to 13 days before the latest", "Is this week's level different from last week's?"],
            ["This month", "Mean of this month's reports, excluding the latest", "How does today sit against the month so far?"],
            ["Custom", "Mean of reports in a chosen date range", "Anything else, for example before and after a process change"],
          ],
        },
        {
          type: "code",
          lang: "ts",
          code: `case "7davg": {
  const min = shift(latest, 7);
  const vals = series
    .filter((s) => s.date < latest && s.date >= min)
    .map((s) => s[key]);
  return vals.length ? mean(vals) : null;
}`,
          caption: "One arm of the comparison, from production-comparison.tsx.",
        },
        "The averaging baselines leave today out on purpose. Including the day being judged in its own baseline pulls the average towards it and shrinks every difference. The difference shown is today minus the rounded baseline, with an explicit sign.",
        "One limitation is worth stating. The averages are over days that have a report. A day with no report, such as a day the line did not run, is excluded rather than counted as zero. That is the right choice for judging working days, but it means \"7-day average\" is the average of up to seven working days, not a weekly total divided by seven.",
      ],
    },
    {
      heading: "Up is not always good",
      body: [
        "Each metric carries a flag saying which direction is good. For accepted, cleaned and packaged, higher is better. For retired, routers taken out of the programme, a rise is bad. The colour comes from the direction and the flag together, not from the sign alone:",
        {
          type: "code",
          lang: "ts",
          code: `export function toneFor(delta: number, positiveIsGood: boolean): "good" | "bad" | "flat" {
  if (delta === 0) return "flat";
  const good = positiveIsGood ? delta > 0 : delta < 0;
  return good ? "good" : "bad";
}`,
          caption: "src/lib/overview.ts. The definition lives with the metric, not with the card.",
        },
        "Putting `positiveIsGood` on the metric definition means any card that colours a change reads the same flag, and a new metric has to state its direction when it is added.",
      ],
    },
    {
      heading: "A missing baseline is N/A, not zero",
      body: [
        "If there is no report for yesterday, or no reports in the chosen range, the comparison function returns `null`, and the card shows N/A. It does not compare against zero. A comparison against zero would show today as a large improvement, coloured green, which is exactly the kind of believable wrong number people act on. The same principle runs through the rest of RPOMS: a stock figure that could not be read is shown as unavailable, never as zero, as covered in [Stock You Never Store](/blog/derived-inventory-from-a-ledger-not-a-stored-balance).",
      ],
    },
    {
      heading: "Keeping the dashboard current without writing to it",
      body: [
        "The dashboard refreshes itself every two minutes, and again when someone returns to the tab, so a screen left open on the floor stays current. It never writes anything. The notes card shows the day's notes and, for an admin, lines describing the day's Ecommerce requests and transfers. Those activity lines are derived when the page renders, not appended to the report's notes, because that column is saved wholesale from the report form and an appended line would be silently destroyed the next time anyone saved the day.",
        "The card is also translated: the dashboard is published in English and Arabic, with the comparison labels translated and figures kept in Latin digits, as described in [Adding Arabic (RTL) to a Next.js Dashboard](/blog/rtl-arabic-dashboard-in-nextjs-with-typed-i18n).",
      ],
    },
    {
      heading: "Choosing baselines for your own dashboard",
      body: [
        {
          type: "list",
          items: [
            "Offer more than one baseline. Yesterday is noisy; an average is stable; a same-period-last-week comparison catches drift.",
            "Define \"today\" as the latest complete record, not the calendar date.",
            "Exclude the day being judged from its own baseline.",
            "Store the good direction with each metric, so every view colours changes consistently.",
            "Show N/A when there is nothing to compare against. Never substitute zero.",
            "Say what an average is over, especially when some days have no data.",
          ],
        },
        "The dashboard is the live part of [RPOMS](/work/rpoms) and reads from the daily report, which is also live in production. For the general case for reporting from operational data, see [Reporting From Operational Data](/blog/reporting-from-operational-data).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
