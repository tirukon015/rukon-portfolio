import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "rtl-arabic-dashboard-in-nextjs-with-typed-i18n",
  title: "Adding Arabic (RTL) to a Next.js Dashboard Without Translating the Whole App",
  description:
    "Publishing the RPOMS dashboard in Arabic: a typed dictionary that fails the build, dir on one wrapper not <html>, an LTR chart, and Latin digits.",
  date: "2026-10-02",
  category: "UI/UX & Product",
  tags: ["i18n", "RTL", "Arabic", "Next.js", "TypeScript", "Dashboard"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Arabic RTL Dashboard in Next.js With Typed i18n",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "comparison-baselines-for-an-operations-dashboard",
    "production-write-lock-read-only-mode-nextjs-middleware",
    "why-internal-software-needs-good-ux",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "The problem: one screen needs a second language, the rest do not",
      body: [
        "The RPOMS dashboard, which shows how the router-refurbishment line is doing today, is read by people who do not all read English. In July 2026 I published it in Arabic as well. The admin panel, where reports are filed and stock is managed, stayed English-only. That constraint shaped every decision below: I needed right-to-left Arabic on one part of a Next.js App Router application without turning the rest of it around, and without a translation that could quietly go stale.",
        "This article is for developers adding a right-to-left language to part of a Next.js app. It covers the type that keeps translations complete, where the locale and direction live, what should not be mirrored, and how numbers are formatted.",
      ],
    },
    {
      heading: "A dictionary typed against English fails the build",
      body: [
        "English is the source dictionary, declared `as const`. A mapped type turns its shape into the contract every other language must satisfy: the same keys, with every leaf a string.",
        {
          type: "code",
          lang: "ts",
          code: `export const en = {
  nav: { batchProgress: "Batch Progress", /* ... */ },
  // ...
} as const;

export type Dictionary = {
  [K in keyof typeof en]: typeof en[K] extends Record<string, unknown>
    ? { [P in keyof typeof en[K]]: typeof en[K][P] extends Record<string, unknown>
        ? { [Q in keyof typeof en[K][P]]: string }
        : string }
    : string;
};

export const ar: Dictionary = { /* ... */ };`,
          caption: "src/lib/i18n/dictionaries/en.ts and ar.ts.",
        },
        "Adding a string to English stops the build until the Arabic file supplies it. A language cannot go half-translated without anyone noticing, and a half-translated screen is what makes people switch back to English and stop trusting the translation. The list of languages is one array of `{ code, label, dir }`, and the switcher builds itself from it, so adding the next language (Bangla is planned, not done) means one entry and one dictionary file.",
        "Word order is the other trap. Arabic often puts a value first where English puts it last. So translated strings never get values glued on in English order; they carry named placeholders, `\"{count} used today\"`, and a small `fill()` function substitutes them, so each translation places the values where its own grammar wants them.",
      ],
    },
    {
      heading: "A cookie, not a URL segment, and dir on a wrapper, not <html>",
      body: [
        "Most Next.js i18n guides put the locale in the URL: `/en/...` and `/ar/...`. That would have moved every admin route under a locale prefix for no gain while those pages stay English. The choice is kept in a cookie instead, read on the server when the dashboard renders. The page is already rendered per request, so reading a cookie costs nothing. An unrecognised or outdated value falls back to English rather than failing.",
        "For the same reason, `lang` and `dir` are set on the dashboard's own wrapper element, not on `<html>`:",
        {
          type: "code",
          lang: "tsx",
          code: `<div lang={locale} dir={directionOf(locale)} className="overview-theme ...">
  <SiteHeader role={role} locale={locale} t={t} />
  {/* ... */}
</div>`,
        },
        "Setting `dir=\"rtl\"` on `<html>` would have flipped the admin panel too, leaving English text laid out right to left. Inside the dashboard, physical spacing classes (left and right margins and padding) were replaced with logical ones (start and end), so they follow the reading direction.",
        "The switcher writes the cookie directly in the browser and calls `router.refresh()`. It deliberately does not call an API route. Production runs behind a write lock that refuses every write except signing in and the daily report, and a language switch that depended on a POST would stop working exactly where it was needed.",
      ],
    },
    {
      heading: "What should not be mirrored",
      body: [
        "Mirroring the layout is correct for text, cards and navigation. It is wrong for a time series. The production trend chart is pinned left to right in both languages:",
        {
          type: "code",
          lang: "tsx",
          code: `{/* A time axis runs from older to newer. Mirroring it would put the most
    recent day on the left, which no reader expects from a trend line. */}
<div dir="ltr" className="mt-3 h-56 flex-1">
  <ResponsiveContainer>{/* Recharts AreaChart */}</ResponsiveContainer>
</div>`,
        },
        "The labels around the chart are still translated. Proper names also stay in Latin script: the product name, the programme's company names, batch numbers and router models appear that way on the paperwork and the equipment, and an Arabic rendering would no longer match what the reader is holding.",
      ],
    },
    {
      heading: "Arabic text, Latin digits",
      body: [
        "Depending on the locale data, `Intl` may format plain `ar` with Arabic-Indic digits. I asked for Latin digits explicitly, with the `nu-latn` Unicode extension, so the result does not depend on that:",
        {
          type: "code",
          lang: "ts",
          code: `export function formattingLocale(locale: Locale): string {
  return locale === "ar" ? "ar-u-nu-latn" : "en-GB";
}`,
        },
        "The dashboard is read next to serial numbers, box numbers and delivery paperwork, all in Latin digits. A figure that changes shape between the screen and the document it is checked against is worse than one that stays legible. This is a judgement for this context, not a general rule for Arabic interfaces.",
      ],
    },
    {
      heading: "Checklist for a partial RTL rollout",
      body: [
        {
          type: "list",
          items: [
            "Type every translation against the source dictionary so a missing string fails the build.",
            "Use named placeholders, never string concatenation in English word order.",
            "If only part of the app is translated, keep the locale out of the URL and scope `dir` to that part.",
            "Replace physical spacing with logical properties inside the RTL area.",
            "Keep time axes and other inherently directional plots left to right, and translate their labels.",
            "Decide deliberately on digits and on proper names, based on the documents people compare the screen with.",
            "Make the language switch work without a server write.",
          ],
        },
        "The dashboard is the live, read-only face of [RPOMS](/work/rpoms), and it has been published in English and Arabic since July 2026. How the production write lock works is covered in its own article on [read-only mode in Next.js middleware](/blog/production-write-lock-read-only-mode-nextjs-middleware). The admin panel is still English-only, and translating it is on the backlog.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
