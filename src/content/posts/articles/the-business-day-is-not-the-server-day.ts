import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "the-business-day-is-not-the-server-day",
  title: "The Business Day Is Not the Server Day: Time Zones in a Malaysian Operations System",
  description:
    "A deployed server keeps UTC. A warehouse floor in Malaysia keeps UTC+8. Until eight in the morning, the two disagree about what day it is, which is long enough for a morning delivery to file itself under yesterday.",
  date: "2026-09-24",
  category: "Malaysia & Cyberjaya",
  location: "Cyberjaya, Malaysia",
  tags: ["Time Zones", "Malaysia", "Next.js", "Vercel", "Intl", "Operations"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "staged-csv-import-for-operational-data",
    "one-storage-interface-three-backends",
    "building-software-in-cyberjaya-the-development-environment",
  ],
  sections: [
    {
      heading: "The eight-hour hole",
      body: [
        "Malaysia is UTC+8 all year; there is no daylight saving to reason about. Vercel's functions, like most deployed servers, keep UTC. So between midnight and eight in the morning Malaysian time, `new Date()` on the server is still on the previous calendar day.",
        "For most web applications that is invisible. For a system that files a daily production report, deducts the day's stock, and records which day a delivery went out, it is a correctness bug that only fires in the morning. RPOMS runs a router-refurbishment line in Malaysia, and its first shift starts well before 8 am. A delivery scanned at 7:30 would take the server's idea of today, `toISOString().slice(0, 10)`, and land under yesterday's date, in yesterday's report, against yesterday's target.",
        "The bug never appears in the afternoon, never appears in development on a laptop set to local time, and never appears in a test that does not control the clock. It is the kind of thing you find by being on the floor when it happens.",
      ],
    },
    {
      heading: "Resolve the day where the work is",
      body: [
        "The fix is to stop asking the server what day it is and ask instead what day it is on the floor. `Intl.DateTimeFormat` with an explicit `timeZone` does that without a dependency:",
        {
          type: "code",
          lang: "ts",
          code: `const BUSINESS_DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kuala_Lumpur",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function businessToday(now: Date = new Date()): string {
  const parts = BUSINESS_DAY_FORMAT.formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return \`\${part("year")}-\${part("month")}-\${part("day")}\`;
}`,
          caption: "Built once at module load: constructing a formatter costs far more than using one.",
        },
        "`formatToParts` rather than `format` because the goal is a `YYYY-MM-DD` key, not a display string, and assembling it from parts is locale-proof. The `now` parameter exists so a test can hand in 23:30 UTC and assert that the answer is tomorrow, which is the one case that matters.",
      ],
    },
    {
      heading: "Store the instant, derive the day",
      body: [
        "The tempting shortcut is to store local dates everywhere. The better rule is the boring one: timestamps are stored in UTC, and the floor's calendar day is derived from them at the edge, with the same formatter applied to a stored instant instead of to now.",
        {
          type: "code",
          lang: "ts",
          code: `export function businessDateOf(iso: string | null | undefined): string {
  if (!iso) return "";
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? "" : businessToday(dt);
}`,
        },
        "The first ten characters of a stored UTC timestamp are the UTC day, which for the first eight hours of every Malaysian day is yesterday. Anywhere the code used to slice a timestamp to get a date now goes through this function instead.",
        "Business dates are also their own columns. A report has a `report_date`, a delivery has a `delivery_date`, and those travel beside `created_at` rather than being derived from it. That is the difference between when something happened and when it was entered, and an operations system needs both: a report filed late is still a report for the day it describes, and a backdated entry stays backdated.",
      ],
    },
    {
      heading: "A date that exists",
      body: [
        "Once dates are strings, they need checking as calendars, not as shapes. A regular expression accepts `2026-02-31`; the calendar does not, and `new Date(2026, 1, 31)` quietly becomes 3 March. So the check constructs the date and compares each part back:",
        {
          type: "code",
          lang: "ts",
          code: `export function isCalendarDate(value: string): boolean {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}`,
        },
        "The display formatter uses the same rule in reverse: a string that is not a real date is returned as it was given, never corrected into a different day. Silently fixing a date is how a wrong date becomes a confident one.",
      ],
    },
    {
      heading: "The smaller surprise: \"Sept\"",
      body: [
        "One more thing showed up while making dates consistent. Newer ICU data spells September as \"Sept\" for `en-GB`, and a date that reads \"15 Sept 2026\" on the server and \"15 Sep 2026\" on a phone is worse than one fixed spelling. So the display format builds the day and year from `en-GB` parts and takes the month abbreviation from `en-US`, which still says \"Sep\". It is a cosmetic fix, but the operations team reads these dates on printed paperwork, and paperwork that changes between two machines invites the question of what else did.",
      ],
    },
    {
      heading: "Why this is a Malaysia article",
      body: [
        "None of the code above is specific to Malaysia. What is specific is the shape of the failure: a large, fixed offset, no daylight-saving edge to remind anyone that time zones exist, and an operation whose day starts early. A team in a UTC-adjacent zone might never trip over this. A team in Kuala Lumpur or Cyberjaya, deploying to servers that keep UTC, will trip over it the first morning a real user does real work before eight.",
        "The same offset shows up elsewhere in the same system: worksheets that write dates day first, which the [CSV import](/blog/staged-csv-import-for-operational-data) has to read the way they were written, and paperwork that a customer expects in a particular format. Building for a Malaysian operation mostly means taking the local conventions seriously and resolving them at the edges, once, rather than sprinkling `+8` through the code.",
        "The system this comes from is described in the [RPOMS case study](/work/rpoms). The business-day resolution has its own test, which hands the function times either side of midnight UTC and checks which day comes back.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
