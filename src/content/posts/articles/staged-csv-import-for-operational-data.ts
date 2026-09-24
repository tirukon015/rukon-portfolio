import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "staged-csv-import-for-operational-data",
  title: "Staged CSV Import: Validating Operational Data Before It Is Written",
  description:
    "The office already keeps its records in a workbook. Importing that sheet into a production system means matching its headers loosely, reading its dates the way it wrote them, surfacing duplicates before anything is saved, and never letting the client tell the server what a file contains.",
  date: "2026-09-24",
  category: "Building Real Systems",
  tags: ["CSV", "Data Validation", "TypeScript", "Papa Parse", "Operations", "Security"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "common-problems-manual-production-tracking",
    "one-storage-interface-three-backends",
    "the-business-day-is-not-the-server-day",
  ],
  sections: [
    {
      heading: "Start from the sheet that exists",
      body: [
        "When RPOMS replaced the spreadsheets running a router-refurbishment line, the spreadsheets did not disappear. The office still kept an accepted-router list and a ready-for-delivery list as worksheets, and the fastest way to bring a day's work into the system was to save a sheet as CSV and import it. So the import was designed around the workbook the office already had, not around a template they would have to learn.",
        "That decision shaped everything else. Two file shapes are accepted, matching the two sheets. The accepted list carries a serial number, a router model, a person's name and a date. The boxes list carries a serial number and a box number, and nothing else is read from it: the model and the accepting worker come from the serial's existing registry record, the same way packing by scanner works. Columns the registry has no field for, remarks, a sending location, a row number, are ignored rather than rejected, so the sheet can be imported as it is.",
      ],
    },
    {
      heading: "Match headers the way people write them",
      body: [
        "\"Serial Number\", \"serial_number\" and \"SERIAL\" are the same column. Header matching lowercases and strips spaces, underscores, dots, hyphens and hashes, then looks for the first present alias in a short list per field:",
        {
          type: "code",
          lang: "ts",
          code: `function normHeader(h: string): string {
  return h.toLowerCase().replace(/[\\s_.\\-#]/g, "");
}

const SERIAL_KEYS = ["serialnumber", "serial", "serialno", "routerserial", "barcode"];
const PERSON_KEYS = ["personname", "person", "name", "acceptedby", "worker"];
const BOX_KEYS = ["boxnumber", "box", "boxno"];`,
        },
        "The office sheet also carries two title rows above the real header. If the first row has no recognisable column, the parser retries further down the file before giving up. Parsing is Papa Parse; the work is in what happens to the parsed rows.",
      ],
    },
    {
      heading: "Dates: day first, unless the file says otherwise",
      body: [
        "The sheet writes dates day first, 24/07/2026, which is ambiguous against month-first for days one to twelve. The caller states which convention the file uses, and then the parser applies one rule that needs no convention: any value whose first part is above twelve is unambiguous and read as day-first regardless, because it cannot be a month. Two-digit years are expanded. A four-digit first part means the file is actually year-first.",
        "Every result is then checked as a real date. A regular expression accepts 2026-02-31; a calendar does not, and a date that rolls over into a different day is worse than a rejected one. An unreadable value becomes an issue against the row, with a one-based line number that counts the header so it matches the row the user sees in Excel.",
      ],
    },
    {
      heading: "Stage it, show it, then write it",
      body: [
        "Nothing is written when the file is uploaded. The import is staged like a scan session: rows are parsed, per-row issues are listed, duplicates within the file are counted and dropped, and duplicates against the registry are shown before anything is saved and can be dropped or merged row by row. The same is true of the daily production report, which can be populated from a sheet and is previewed for review first.",
        {
          type: "flow",
          steps: ["Upload CSV", "Find the header row", "Parse and normalise", "List issues by line", "Show duplicates", "Decide per row", "Write"],
          caption: "The write is the last step, and it only happens for rows a person has seen.",
        },
        "This is the difference between an import someone trusts and one they re-check by hand afterwards. Discovering a duplicate after it is written means finding it in a report weeks later, which is exactly the failure mode the spreadsheet had.",
      ],
    },
    {
      heading: "The client does not get to describe its own payload",
      body: [
        "The subtle bug was not in parsing. A daily-report save carried a small object saying which sections of the report had come from a CSV import, and the save path used it to relax two protections that guard hand-entered figures. That flag was read straight off the request body. A client that asserted the sections were imported had both protections waived, for rows it was free to invent. The flag described the payload, so it was trusted to describe itself.",
        "The fix was not to remove the capability; importing a worksheet is how the warehouse files a day. It was to make the server work the answer out rather than be told it. The sheet now travels with the save, the server parses it with the same parser the browser used, and the sections it grants are the ones its own reading found. An assertion with no sheet behind it grants nothing.",
        "Two refusals are deliberately different. A save with no sheet attached is most likely an older browser tab, and degrading to the ordinary rules is safe. A sheet that names a different day than the one being saved is refused out loud, because degrading silently would drop the imported rows while reporting success, and yesterday's worksheet must not unlock today's figures.",
      ],
    },
    {
      heading: "And on the way back out",
      body: [
        "Exports go to the same spreadsheets, and a spreadsheet treats a cell beginning with `=`, `+`, `-` or `@` as a formula. Names and serials in the registry are typed by hand and imported from other people's sheets, so a value entered as `=HYPERLINK(...)` would run the moment someone opened the export. Every exported cell that starts with one of those characters, or with a tab or carriage return that could hide one, gets a leading apostrophe, which the spreadsheet reads as \"this is text\" and which is invisible in the cell. A plain negative number keeps its sign; `-5` is a value, not a formula.",
        {
          type: "code",
          lang: "ts",
          code: `export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+\\-@\\t\\r]/.test(text) && !/^-?\\d+(\\.\\d+)?$/.test(text)) {
    text = \`'\${text}\`;
  }
  return \`"\${text.replace(/"/g, '""')}"\`;
}`,
        },
      ],
    },
    {
      heading: "The general shape",
      body: [
        {
          type: "list",
          items: [
            "Accept the file people already have. Loose header matching and ignored extra columns cost almost nothing and remove the most common reason an import fails.",
            "Read dates the way the file wrote them, use the unambiguous cases to disambiguate the rest, and validate against a calendar rather than a pattern.",
            "Report problems by the line number the user can see, not the array index.",
            "Never write on upload. Stage, show, decide, then write.",
            "Never let a request describe what it contains. If a file grants a capability, the server reads the file.",
            "Escape on the way out as carefully as you validate on the way in.",
          ],
        },
        "This is one module of the system described in the [RPOMS case study](/work/rpoms). The same principle, surfacing problems before anything is committed, runs through the packing and delivery screens too.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
