import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "modelling-a-refurbishment-pipeline-in-excel",
  title: "Modelling a Multi-Stage Refurbishment Pipeline in Excel",
  description:
    "Following one laptop through an Excel stock tracker: a completeness gate at receiving, an automatic hand-off list, status derived from department ticks, e-commerce counts, and EDATE warranties.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Excel", "Inventory", "Workflow", "XLOOKUP", "EDATE", "Dynamic Arrays"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "A Multi-Stage Inventory Pipeline in Excel",
  relatedProjects: ["itms"],
  relatedPosts: [
    "generating-inventory-skus-in-excel-with-let-and-textjoin",
    "logging-status-changes-in-excel-with-vba-to-measure-stage-time",
    "mapping-an-excel-tracker-to-a-database-schema",
    "what-is-a-production-management-system",
  ],
  sections: [
    {
      heading: "The problem: one unit, several departments, one workbook",
      body: [
        "A refurbished laptop at BBTech passes through receiving, a hardware check, a software check, quality control, and the e-commerce team, who post it for sale, until it is sold and its warranty starts. Each department needs to see its own queue, and management needs counts and times across all of them. Before any web system, this all ran in the BBTech Stock Tracker, a macro-enabled Excel workbook that I worked on and maintained from its go-live on 1 July 2025 (project page: [/work/itms](/work/itms)).",
        "This article follows one unit through the workbook and shows the formula at each step. The identifiers and the audit log have their own articles, so here they appear only where the pipeline uses them. All example values are invented, and prices are left out.",
        {
          type: "flow",
          steps: ["Receiving", "Hand-off when complete", "Hardware check", "Software check", "QC check", "E-Comm", "Posted", "Sold, warranty starts"],
          caption: "The stages as the tracker names them.",
        },
      ],
    },
    {
      heading: "Receiving: a completeness gate before anything moves",
      body: [
        "Receiving staff enter a unit from drop-downs: source, brand, model (dependent on brand), CPU and generation, plus a free-text model number. Formulas fill in the serial, a readable name and the barcode SKU, as described in [Generating Barcode and Group SKUs in Excel](/blog/generating-inventory-skus-in-excel-with-let-and-textjoin).",
        "The last column is the gate. It only says the unit is ready to move on once every required cell is filled:",
        {
          type: "code",
          lang: "excel",
          code: `=IF(COUNTA(B22:H22) = 7, "To be check", "")`,
          caption: "Seven cells: serial, source, brand, model, model number, CPU and generation.",
        },
        "A half-entered row never reaches the technicians. A per-brand counter at the top of the sheet (a COUNTIFS for each brand) gives receiving a quick view of what has arrived. A scan box looks a unit up by its barcode with XLOOKUP. After a user request in August 2025, it also returns the unit's cell address with `ADDRESS(MATCH(...))`, so staff can jump straight to the row.",
      ],
    },
    {
      heading: "The hand-off: a formula-built queue on the next sheet",
      body: [
        "The technician sheet does not copy rows. Its SKU column pulls the k-th unit marked \"To be check\" from receiving, and every other attribute is looked up by that SKU:",
        {
          type: "code",
          lang: "excel",
          code: `SKU (row k):
=IFERROR(INDEX(Receiving[Barcode SKU],
    SMALL(IF(Receiving[Check Status] = "To be check",
             ROW(Receiving[Check Status]) - ROW(first cell) + 1),
          k)), "")

Brand (same row):
=LET(sku, [@[Barcode SKU]], IF(sku = "", "", XLOOKUP(sku, Receiving[Barcode SKU], Receiving[Brand], "")))`,
          caption: "Simplified. k comes from ROWS($L$3:L4), which grows by one per row.",
        },
        "RAM and SSD are entered here rather than at receiving, because the technicians confirm them. The display name is then rebuilt with `TEXTJOIN(\" / \", TRUE, name, ram, ssd)`.",
        "This pattern has one inherent risk worth knowing. The looked-up columns are formulas keyed to position in the queue, but the columns technicians type into (ticks, RAM, notes) are plain values sitting beside them. If a unit earlier in receiving stops matching the gate, or a row is inserted above it, the formula side shifts by one row and the typed side does not. I have no record of that happening, but it is the kind of mismatch the January 2026 revamp, described in its change log as \"to minimize human error\", was aimed at. Its approach was to move edits onto a separate update sheet.",
      ],
    },
    {
      heading: "Status from department ticks",
      body: [
        "Each department has a tick column (hardware, software, QC, e-commerce), and there is a sold tick. The status is derived from the ticks rather than typed, so the department that did the work records it by marking its own column:",
        {
          type: "code",
          lang: "excel",
          code: `=IF(sku = "", "",
 IF(no ticks,                  "Incoming Stock",
 IF(HD, SW, QC, EC and Sold,   "Sold",
 IF(HD, SW, QC and EC,         "Posted",
 IF(HD, SW and QC,             "E-Comm",
 IF(HD and SW,                 "QC Check",
 IF(HD,                        "Software Check",
                               "Hardware Check")))))))`,
          caption: "Pseudocode of the nested IF. Each test checks the tick cells for a check mark.",
        },
        "The status names the queue a unit is waiting in, not the work just done: once hardware is ticked, the unit is in \"Software Check\". Conditional formatting colours each status, so a technician can scan down the column for their colour. The status changes are what the logging macro in [Logging Every Status Change in Excel With VBA](/blog/logging-status-changes-in-excel-with-vba-to-measure-stage-time) records.",
        "In the April 2026 copy the status column also carries a drop-down of statuses. That list includes exception states such as sending a unit out or outsourcing a repair, which the ticks cannot express, and only part of the rows still hold the formula. Tick-driven and hand-picked status coexist, which is typical of a workbook that has met real exceptions.",
      ],
    },
    {
      heading: "E-commerce: counting variants, and aging",
      body: [
        "The e-commerce team works from a summary sheet that counts sellable variants rather than units. It lists each group SKU key that has any unit in the E-Comm or Posted status once, and counts them:",
        {
          type: "code",
          lang: "excel",
          code: `Keys:  =UNIQUE(FILTER(Tech[Group SKU Key], (Tech[Status]="E-Comm") + (Tech[Status]="Posted")))
Qty:   =COUNTIFS(Tech[Group SKU Key], key, Tech[Status], "E-Comm")
      + COUNTIFS(Tech[Group SKU Key], key, Tech[Status], "Posted")`,
          caption: "The + inside FILTER is an OR of two conditions.",
        },
        "Once posted, the unit's posted date comes from the audit log (`MAXIFS` of the log timestamp for that SKU and the Posted status). Aging is `TODAY()` minus that date while the unit is still posted, and conditional formatting on the SKU cell uses that aging value. An update sheet also breaks stock down by brand and stage, so the counts per department are visible in one grid.",
      ],
    },
    {
      heading: "Sold: a stamped date and an EDATE warranty",
      body: [
        "Selling is done from a Sold button (a macro that asks for the barcode, added in version 7 before go-live) or by ticking the sold column. A sheet event is meant to stamp today's date into the sold-date cell when the tick is set, but only if that cell is empty, so correcting a tick later does not move the sale date. In the April 2026 copy that handler's hard-coded column number had drifted away from the sold column, a failure mode covered in [Why My VBA Maps Columns by Header Name](/blog/vba-map-columns-by-header-name-not-column-number).",
        "The warranty period is a drop-down with the values \"3 Months\", \"6 Months\" and \"12 Months\". The end date reads the number from the text and adds it with EDATE:",
        {
          type: "code",
          lang: "excel",
          code: `=IF(sold = "", "", IF(soldDate = "", "",
   EDATE(soldDate, VALUE(LEFT(period, FIND(" ", period & " ") - 1))) - 1))`,
        },
        "Two small details are worth copying. Appending a space before FIND means a value with no space, such as a bare \"12\", still parses instead of returning an error. The final `- 1` makes a three-month warranty sold on 15 March end on 14 June, not 15 June. EDATE also handles month ends correctly, which adding 30-day blocks does not.",
        "Management sees sales on a sold list, built with the same INDEX/SMALL(IF(...)) pattern as the technician queue but filtered on the sold tick, and a daily sheet that counts completions per department from the log. When BBTech moved this pipeline into the web ITMS in 2026, built by another BBTech developer, the same stage names came with it. How the rest of the workbook maps onto database tables is the subject of a separate article in this series.",
      ],
    },
  ],
};
