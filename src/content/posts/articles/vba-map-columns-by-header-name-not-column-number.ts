import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "vba-map-columns-by-header-name-not-column-number",
  title: "Why My VBA Maps Columns by Header Name, Not Column Number",
  description:
    "One workbook held both approaches: event macros with hard-coded column numbers that drifted as columns were added, and an update macro that finds columns by header text. The difference.",
  date: "2026-10-07",
  category: "Full-Stack Development",
  tags: ["VBA", "Excel", "Maintenance", "Scripting.Dictionary", "Barcode", "Data Quality"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "VBA: Map Columns by Header Name, Not Column Index",
  relatedProjects: ["itms"],
  relatedPosts: [
    "logging-status-changes-in-excel-with-vba-to-measure-stage-time",
    "versioning-an-operational-spreadsheet-like-software",
    "why-system-maintenance-matters-after-deployment",
  ],
  sections: [
    {
      heading: "The problem: a spreadsheet's columns move, and VBA doesn't notice",
      body: [
        "An operational workbook changes shape while people use it. A team asks for a new column, a group of timing columns gets added, a section is split out. Formulas that use structured references follow their columns. VBA that says `Cells(r, 32)` does not. It keeps writing to column 32, whatever column 32 has become.",
        "This is a maintenance note from the BBTech Stock Tracker, the macro-enabled Excel workbook I worked on and maintained (project page: [/work/itms](/work/itms)). The copy I read, dated April 2026, happens to contain both styles side by side, which makes the difference unusually easy to see. It is not about who wrote what. The workbook went through many versions, and the drift is the kind that any hard-coded index accumulates over time.",
      ],
    },
    {
      heading: "What drift looks like in practice",
      body: [
        "The workbook's event macros identify columns by number, with the letter in a comment. The status logger, described in [Logging Every Status Change in Excel With VBA](/blog/logging-status-changes-in-excel-with-vba-to-measure-stage-time), keeps a per-row cache of the last logged status. A small handler stamps today's date when a unit's sold status is ticked:",
        {
          type: "code",
          lang: "vba",
          code: `Dim soldStatCol As Long: soldStatCol = 32   ' Column AF
Dim soldDateCol As Long: soldDateCol = 33   ' Column AG
Dim lastStatusCol As Long: lastStatusCol = 35 ' AI`,
          caption: "The constants and their comments agree with each other. Both disagree with the sheet.",
        },
        "In the April 2026 layout, columns AF to AI are the four time-in-stage columns (hardware, software, QC and e-commerce minutes), and sold status and sold date are further right. The columns had moved, and the numbers had not. The result is quiet rather than dramatic. The sold-date handler listens to a column that now holds hardware minutes. The e-commerce minutes column, which shares its position with the status cache, has its formula in only a fraction of its rows, where its three sibling columns have one in every row, and its first data row holds a status word instead of a number. That pattern is what you would expect if the logger has been writing its cache over the formulas. I describe it as consistent with the drift, not as a confirmed sequence of events.",
        "Nothing errored. That is the real problem with positional indexes: a wrong column is still a valid column, so the macro succeeds at the wrong thing.",
      ],
    },
    {
      heading: "The other macro: find columns by their header text",
      body: [
        "The same workbook has an Update button, added on request in August 2025 so staff could scan a unit and edit its RAM and SSD. It was reworked in January 2026 into a separate update sheet \"to minimize human error\". That macro never uses a column number for data. It reads the header row of both sheets into dictionaries and matches columns by name:",
        {
          type: "code",
          lang: "vba",
          code: `Private Function BuildHeaderMap(ws As Worksheet, headerRow As Long) As Object
    Dim dict As Object: Set dict = CreateObject("Scripting.Dictionary")
    dict.CompareMode = vbTextCompare          ' "Barcode SKU" = "barcode sku"
    Dim c As Long, h As String
    For c = 1 To ws.Cells(headerRow, ws.Columns.Count).End(xlToLeft).Column
        h = Trim(CStr(ws.Cells(headerRow, c).Value))
        If h <> "" And Not dict.Exists(h) Then dict.Add h, c
    Next c
    Set BuildHeaderMap = dict
End Function`,
          caption: "Simplified from the tracker's update module.",
        },
        "The update then loops over the input sheet's headers and writes each value into the master column with the same name. A column that exists on only one side is skipped. Inserting, removing or reordering columns in the master sheet changes nothing, as long as the header text stays the same. The key column has a guard as well: if the master sheet is missing the header \"Barcode SKU\", the macro stops with a message rather than guessing.",
      ],
    },
    {
      heading: "Three rules that made the update safe",
      body: [
        "Mapping by name removes drift. Three more rules in the same macro stop a routine edit from destroying data, and they are worth copying along with it:",
        {
          type: "list",
          items: [
            "Never overwrite the key. The loop skips the barcode SKU column even though it appears on both sheets, so an edit can change a unit's attributes but not which unit it is.",
            "Blank means \"no change\", not \"clear\". A configuration flag, `OVERWRITE_BLANKS = False`, means an empty input cell leaves the master value alone. Without it, editing one field would wipe every field the user didn't fill in.",
            "Never write into formula rows. The update sheet has a formula-driven \"current values\" row that looks the scanned SKU up, and a separate input row. The macro only reads the input row and only writes the master sheet. A comment marks the formula row as off limits.",
          ],
        },
        {
          type: "flow",
          steps: [
            "Scan SKU into the scan cell",
            "Current row recalculates by lookup",
            "Input row is pre-filled from the master",
            "User edits the input row",
            "Update button: match headers, skip key, skip blanks",
            "Input row reloaded from the master",
          ],
          caption: "Reloading after the write shows the user what was actually saved.",
        },
        "A small sheet event completes the flow. When the scan cell changes, it forces a recalculation so the lookup row is current, then copies it into the input row. The user starts from the real values instead of an empty form.",
      ],
    },
    {
      heading: "If you must use positions, derive them",
      body: [
        "Sometimes a position is unavoidable, for example inside a tight event handler. Even then it can be derived rather than typed. If the data is an Excel table, `ListObject.ListColumns(\"Sold Status\").Index` returns the current position of a named column. If it is a plain range, `Application.Match(\"Sold Status\", headerRow, 0)` does the same. Look it up once at the start of the procedure and fail loudly if the header is missing, as the update macro does for its key.",
        "The cost is one lookup per run. The benefit is that renaming a header, which people do less often than inserting columns, becomes the only change that can break the macro, and it breaks with a message instead of writing into the wrong place.",
      ],
    },
    {
      heading: "What I take from it",
      body: [
        "The lesson is not that the positional macros were careless. They were correct when written, and the workbook kept changing underneath them, which is what a live operational tool does. The lesson is that a spreadsheet macro's contract should be with the headers people can see, not the column letters they can't. When the tracker's workflow later moved to a web application built by another BBTech developer, fields became named database columns and this whole class of problem went away. Until then, header maps were the cheapest way to get the same property in VBA.",
      ],
    },
  ],
};
