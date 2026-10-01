import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "csv-formula-injection-in-exports",
  title: "CSV Formula Injection in Exports: The One-Apostrophe Fix",
  description:
    "A name typed as =HYPERLINK(...) runs when someone opens a CSV export in a spreadsheet. The small cell guard RPOMS uses on both client and server exports, and what it leaves alone.",
  date: "2027-01-05",
  category: "Full-Stack Development",
  tags: ["CSV", "Security", "Excel", "Formula Injection", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Preventing CSV Formula Injection in Exports",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "staged-csv-import-for-operational-data",
    "testing-every-nextjs-api-route-refuses-without-session",
    "fill-a-word-template-in-nodejs-with-jszip",
  ],
  sections: [
    {
      heading: "An export is a file someone will double-click",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, exports the router registry as CSV: serials, models, the names of the people who accepted each router, dates and boxes. Those values are typed by hand on the floor or imported from other people's spreadsheets, as described in [Staged CSV Import](/blog/staged-csv-import-for-operational-data). And the export is opened in Excel.",
        "A spreadsheet treats a cell that starts with `=`, `+`, `-` or `@` as a formula. So a person's name entered as `=HYPERLINK(...)`, or a serial pasted from somewhere with a leading `=`, runs the moment someone opens the export. This is CSV or formula injection, and a launch-readiness audit in September 2026 flagged it on these exports (F-27). The data stored in the database is fine; the danger is entirely in how it is written out.",
      ],
    },
    {
      heading: "The guard",
      body: [
        {
          type: "code",
          lang: "ts",
          code: "export function csvCell(value: unknown): string {\n  let text = String(value ?? \"\");\n  if (/^[=+\\-@\\t\\r]/.test(text) && !/^-?\\d+(\\.\\d+)?$/.test(text)) {\n    text = `'${text}`;\n  }\n  return `\"${text.replace(/\"/g, '\"\"')}\"`;\n}",
          caption: "From the RPOMS source, complete.",
        },
        "Every cell is quoted, with inner quotes doubled, which handles commas and line breaks in a value. A cell that starts with a formula character gets a leading apostrophe, which tells the spreadsheet to read the cell as the text it is. The apostrophe is invisible in the cell and is dropped if the file is read back in.",
        "Tab and carriage return are in the list too. A value that starts with one of them can smuggle a formula in behind what looks like leading whitespace.",
      ],
    },
    {
      heading: "What it deliberately leaves alone",
      body: [
        "The naive version, prefix anything starting with `-`, damages data: `-5` is a value, not a formula, and prefixing it turns a number into text that no longer sums. So a plain number, optionally negative and optionally decimal, keeps its sign and is left untouched. Tests pin both directions; for example:",
        {
          type: "table",
          head: ["Input", "Written as", "Why"],
          rows: [
            ["`=HYPERLINK(\"x\")`", "`\"'=HYPERLINK(\"\"x\"\")\"`", "formula neutralised, quotes doubled"],
            ["`@SUM(A1)`", "prefixed with `'`", "formula character"],
            ["`-5`", "`\"-5\"`", "a signed number stays a number"],
            ["a serial, a date, a name", "quoted, otherwise unchanged", "ordinary values are not touched"],
          ],
        },
      ],
    },
    {
      heading: "One guard for client and server",
      body: [
        "RPOMS has two ways to export the registry: a button that builds the CSV in the browser from what is on screen, and a server route that returns the file as a download. The guard has no server-only import, so both use the same function. Two implementations of an escaping rule will eventually disagree, and the one that is wrong will be the one nobody tested.",
        "The same audit pass made the printable box label escape what it prints, for the same reason in a different format: the value came from a person, and the output is interpreted by something else.",
        {
          type: "list",
          items: [
            "Quote every CSV cell and double inner quotes.",
            "Prefix cells starting with `=`, `+`, `-`, `@`, tab or carriage return with an apostrophe.",
            "Exempt plain numbers, so negative values stay numeric.",
            "Use one function for every export path, and test both what it changes and what it leaves alone.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
