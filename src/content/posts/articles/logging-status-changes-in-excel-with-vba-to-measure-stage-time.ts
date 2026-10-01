import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "logging-status-changes-in-excel-with-vba-to-measure-stage-time",
  title: "Logging Every Status Change in Excel With VBA to Measure Time per Department",
  description:
    "Formula-driven status changes don't fire Worksheet_Change. How a stock tracker logged them with Worksheet_Calculate, timed each stage, and read the log back with SUMIFS and LOOKUP(2,1/…).",
  date: "2026-10-01",
  category: "Building Real Systems",
  tags: ["Excel", "VBA", "Audit Trail", "SUMIFS", "Operations", "Inventory"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Log Status Changes in Excel With VBA (Time per Stage)",
  relatedProjects: ["itms"],
  relatedPosts: [
    "generating-inventory-skus-in-excel-with-let-and-textjoin",
    "vba-map-columns-by-header-name-not-column-number",
    "modelling-a-refurbishment-pipeline-in-excel",
    "reporting-from-operational-data",
  ],
  sections: [
    {
      heading: "The question: how long does each department hold a unit?",
      body: [
        "In a refurbishment operation every laptop passes through the same stages: incoming stock, hardware check, software check, QC, e-commerce, posted for sale, sold. Management wanted to know how long each stage took, per unit and per day, without asking technicians to type start and end times.",
        "The BBTech Stock Tracker, an Excel workbook I worked on and maintained (see [/work/itms](/work/itms)), answered this with an append-only log. Every status change writes a row with the time, the new status, the unit's barcode SKU and the Windows user. The time spent in the previous status is backfilled onto that unit's previous row. Formulas then read the log back into per-unit and per-day figures. This article covers the macro, the formulas that read the log, and the limits of doing this in Excel.",
      ],
    },
    {
      heading: "Why Worksheet_Change is not enough",
      body: [
        "In the tracker nobody types a status. Each department ticks its own completion column, and the status column is a nested IF that turns the ticks into a stage. That is good for data quality, but it means the status cell never receives a user edit. Units are identified by the barcode SKU described in [Generating Barcode and Group SKUs in Excel](/blog/generating-inventory-skus-in-excel-with-let-and-textjoin), and that SKU is the key of the log.",
        "`Worksheet_Change` fires when a user or macro changes a cell's contents. It does not fire when a formula's result changes. The event that does fire is `Worksheet_Calculate`, but it has no `Target`: it tells you that something recalculated, not what. So the macro keeps its own memory. An extra column on each row holds the status that was last logged, and on every recalculation the macro walks the rows and compares.",
        {
          type: "flow",
          steps: [
            "A department ticks its column",
            "Status formula recalculates",
            "Worksheet_Calculate fires",
            "For each row: status differs from the cached last status?",
            "Backfill the duration on this SKU's previous log row",
            "Append a new log row",
            "Update the cache",
          ],
          caption: "The cache column is what turns a Calculate event into a per-row change detector.",
        },
      ],
    },
    {
      heading: "The logging macro",
      body: [
        "The core of the macro, simplified. The real version also writes a first row when a unit appears as incoming stock and makes sure the log's headers exist:",
        {
          type: "code",
          lang: "vba",
          code: `Private Sub Worksheet_Calculate()
    On Error GoTo CleanFail
    Application.EnableEvents = False

    For r = FIRST_ROW To lastRow
        current = Cells(r, STATUS_COL).Value
        previous = Cells(r, CACHE_COL).Value
        If current <> "" And current <> previous Then
            sku = Cells(r, SKU_COL).Value
            ' newest log row for this SKU, scanning upwards
            prevRow = FindLastLogRow(sku)
            If prevRow > 0 Then
                mins = Int((Now - wsLog.Cells(prevRow, 1).Value) * 1440)
                wsLog.Cells(prevRow, TOTAL_MIN_COL).Value = mins
            End If
            AppendLogRow Now, current, sku, Environ$("USERNAME")
            Cells(r, CACHE_COL).Value = current
        End If
    Next r

CleanExit:
    Application.EnableEvents = True
    Exit Sub
CleanFail:
    Resume CleanExit
End Sub`,
          caption: "Simplified from the tracker. Constants stand in for the real column positions.",
        },
        "Three details matter. First, events are switched off while the macro writes, because writing to the sheet can itself trigger another recalculation and re-enter the handler. The error path goes through `CleanExit`, so a failure cannot leave events disabled for the rest of the session, which would silently stop all logging. Second, the duration is written onto the previous row, not the new one. A row's minutes are the time spent in that row's status, and the value is only known once the unit leaves it. Third, the author is `Environ$(\"USERNAME\")`, the Windows login name. The tracker's change log adds this on 28 October 2025 as \"Update macro to reflect who made the status change\".",
        "The log went through the same evolution as the rest of the workbook. The change log shows a formula-based department timestamp on 12 June 2025, \"formulated time spent based on status changes\" on 28 June, and on 30 June a switch to \"macro integration on time taken instead of Excel formula based on status log changes\". An older version of the macro is still in the file. It appended to a table and let a table formula parse a \"0d 6h 44m\" style string back into minutes. The newer version writes the minutes directly.",
      ],
    },
    {
      heading: "Reading the log back: SUMIFS per stage",
      body: [
        "With one row per stage visit, time per stage for a unit is a SUMIFS over the log. LET names the SKU once and adds an `exists` guard, so a unit with no log rows shows blank rather than zero. Zero would read as \"took no time\":",
        {
          type: "code",
          lang: "excel",
          code: `=LET(
  sku,    [@[Barcode SKU]],
  exists, COUNTIFS(Log[Barcode SKU], sku),
  total,  SUMIFS(Log[Total Minutes], Log[Barcode SKU], sku, Log[Status], "Software Check"),
  IF(exists = 0, "", total)
)`,
        },
        "The hardware column sums two statuses, incoming stock and hardware check, because a unit waiting for its first check is effectively in the hardware queue. Summing rather than taking one row also handles a unit that goes back to a stage twice.",
      ],
    },
    {
      heading: "The last matching row: LOOKUP(2,1/…) versus MAXIFS",
      body: [
        "Two figures need the most recent log entry of one status for one SKU rather than a sum: the date a unit was posted for sale, and how long it then sat before selling. They use two different techniques.",
        "For the date, `MAXIFS(Log[Change Timestamp], Log[Status], \"Posted\", Log[Barcode SKU], sku)` is the clean answer. The latest timestamp is the largest one, and MAXIFS takes multiple criteria directly. Aging is then `TODAY()` minus that date while the unit is still posted.",
        "For the days to sell, the value needed is not the largest one but the one on the last matching row: the minutes recorded on the \"Posted\" row, which is the time from posting until the next change, the sale. That uses the old LOOKUP idiom:",
        {
          type: "code",
          lang: "excel",
          code: `=LOOKUP(2, 1 / (Log[Barcode SKU] = sku) / (Log[Status] = "Posted"), Log[Total Minutes]) / 1440`,
          caption: "Divided by 1,440 minutes to give days.",
        },
        "The division produces an array that is 1 where both conditions are true and a #DIV/0! error everywhere else. LOOKUP searching for 2 in an array that never exceeds 1 falls through to the last numeric entry and ignores errors, so it returns the value from the last matching row. XLOOKUP with a search mode of -1 does the same job more readably where it is available. The LOOKUP form works in every version and needs no array entry.",
      ],
    },
    {
      heading: "A daily view, and a counting trap",
      body: [
        "A management sheet turns the log into one row per day. `UNIQUE(INT(Log[Change Timestamp]))` lists the distinct dates, because INT drops the time of day. COUNTIFS with `\">=\"&day` and `\"<\"&day+1` counts entries for each status in that window, and AVERAGEIFS averages their minutes.",
        "The counts treat entering the next stage as completing the previous one: \"hardware done\" is the number of units that moved into software check that day. That is a sound way to count completions. It creates a trap for the averages, though. A row's minutes belong to the status on that row, so averaging the minutes of software-check rows gives the time spent in software check, not in hardware. When you count transitions as completions, check that each average reads the minutes of the stage that completed, not the stage that was entered. It is easy to get this off by one column, and the result looks perfectly plausible.",
      ],
    },
    {
      heading: "What this approach cannot do",
      body: [
        "It is worth being plain about the limits, because they are the reason a log like this eventually wants a database.",
        {
          type: "list",
          items: [
            "The macro scans every row on every recalculation. In a workbook with thousands of formulas that recalculate often, that is steady overhead, and it grows with the stock list.",
            "Changes are only logged while macros run. A copy opened with macros disabled, or edited in Excel for the web, where VBA does not run, changes status without writing a log row. The tracker moved to Microsoft 365 on 31 July 2025, so this is a limitation to know about. I am not recording that it caused a specific gap.",
            "`Environ(\"USERNAME\")` records a Windows login, not a verified identity. A shared machine login shows up as one user.",
            "The time in the current stage is not recorded until the unit leaves it, so open work is invisible in the totals.",
            "The cache column is found by a hard-coded column number. If columns are inserted, the macro writes its cache over whatever moved into that position. Mapping columns by their header text avoids that failure.",
          ],
        },
        "The web ITMS that replaced the tracker was built by another BBTech developer. It keeps an audit log of field changes in its database, with the old value, the new value, the time and the signed-in user who made the change. That removes the dependence on macros and on a Windows login.",
      ],
    },
  ],
};
