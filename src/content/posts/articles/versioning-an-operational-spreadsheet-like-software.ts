import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "versioning-an-operational-spreadsheet-like-software",
  title: "Versioning an Operational Spreadsheet Like Software",
  description:
    "A stock tracker's Change History sheet as a release log: eight iterations before go-live, a 1.x line after, user-requested versions, and what an in-file changelog cannot give you.",
  date: "2026-10-24",
  category: "Building Real Systems",
  tags: ["Excel", "Change Management", "Versioning", "Internal Tools", "Operations"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "Versioning an Excel Workbook With a Change Log",
  relatedProjects: ["itms"],
  relatedPosts: [
    "documenting-an-excel-tracker-for-non-technical-users",
    "vba-map-columns-by-header-name-not-column-number",
    "why-system-maintenance-matters-after-deployment",
  ],
  sections: [
    {
      heading: "The problem: a workbook in daily use has no release history",
      body: [
        "Most operational spreadsheets change the way a shared document changes: someone edits it, and the old behaviour is gone. That is fine for a list. It is not fine for a workbook with formulas generating barcode SKUs and macros writing an audit log. When a number looks wrong, the first question is \"what changed, and when?\", and a spreadsheet has no answer unless someone kept one.",
        "The BBTech Stock Tracker, which I worked on and maintained (project page: [/work/itms](/work/itms)), kept one: a Change History sheet with a version, the changes, a status and a date for every release. This article reads that sheet as a release log. It covers what the log made possible, and what a log inside the file itself can't do.",
      ],
    },
    {
      heading: "The history, as recorded",
      body: [
        {
          type: "table",
          head: ["Version", "Date", "Change (summarised)"],
          rows: [
            ["1", "11 Jun 2025", "Technician inventory tracker"],
            ["2", "12 Jun 2025", "Formula-based timestamps by department"],
            ["3", "16 Jun 2025", "Split into Receiving, Technician and E-Comm sheets; barcode SKU"],
            ["4", "17 Jun 2025", "Group SKU for e-commerce; completion ticks by department; cost and sell price"],
            ["5", "25 Jun 2025", "Conditional formatting by status; look up a unit by scanning its barcode"],
            ["6", "27 Jun 2025", "Sold list, daily department counts, time-to-complete and sales analysis sheets"],
            ["7", "28 Jun 2025", "Sold input box macro; time spent from status changes; sold date and warranty date"],
            ["8", "30 Jun 2025", "Time taken computed by macro from the status log instead of by formula"],
            ["1.1", "1 Jul 2025", "Tracker go-live"],
            ["1.2", "31 Jul 2025", "Implementation into Microsoft 365"],
            ["1.3", "1 Aug 2025", "SKU scheme for more than 99 units per brand (DE99, DEA0, DEB0)"],
            ["1.4", "4 Aug 2025", "User requests: show the scanned item's actual cell; QR code for long SKUs; copy scanned item into the technician view"],
            ["1.5", "6 Aug 2025", "User request: macro button to update RAM and SSD"],
            ["1.6", "3 Sep 2025", "User guide and \"How to add drop down\" guide"],
            ["1.7", "28 Oct 2025", "Macro records who made each status change"],
            ["1.8", "7 Jan 2026", "Revamp to minimise human error; updates moved to a separate sheet"],
          ],
          caption: "From the tracker's Change History sheet.",
        },
      ],
    },
    {
      heading: "What the log shows about how the tool was built",
      body: [
        "Eight versions in under three weeks before go-live is the shape of a prototype being fitted to a real process. Each version adds one capability the operation turned out to need: separate sheets per department, then identifiers, then prices, then scanning, then management views. Version 8 is interesting because it replaces version 7's approach to the same problem, time in stage, moving it from formulas to a macro. The log records a design decision, not just a feature.",
        "The renumbering at go-live is the most software-like choice in the sheet. Versions 1 to 8 were development. Version 1.1 on 1 July 2025 is the first release people depended on, and everything after it is a change to a system in use. That line is useful later. A question about data from May 2025 is a question about a tool that did not exist yet, not a bug.",
        "After go-live the entries change character. Two of the next five cite a user request. One is forced by growth: the serial scheme needed a new form once a brand passed 99 units, which is described in [Generating Barcode and Group SKUs in Excel](/blog/generating-inventory-skus-in-excel-with-let-and-textjoin). One, version 1.6, is documentation, treated as a release like any other. That is exactly right, and [Writing a User Guide Into the Spreadsheet Itself](/blog/documenting-an-excel-tracker-for-non-technical-users) covers what the guide contained. The last, version 1.8, is a structural change aimed at preventing mistakes rather than adding features. That is usually a sign a tool has reached the limits of its form.",
      ],
    },
    {
      heading: "Small mechanics that matter",
      body: [
        "The sheet itself has a few rough edges, and each is a cheap lesson:",
        {
          type: "list",
          items: [
            "Version numbers were typed as numbers. Excel stores version 1.1 as a floating-point value, 1.1000000000000001 in the file, and would show a version \"1.10\" as 1.1. Format the version column as text.",
            "Dates were typed as text, like \"11th June 2025\". They read well, but they can't be sorted, filtered or compared. Use real dates and a display format.",
            "The status column drifted. Most rows say Completed. One has its date typed into the status cell, and the last has no status at all. A status column is only useful if every row uses the same small set of values.",
          ],
        },
      ],
    },
    {
      heading: "What an in-file changelog cannot do",
      body: [
        "A Change History sheet records intent. It does not record the change. There is no diff, so a log line like \"separating update into a different sheet\" does not say which columns moved. That is the kind of detail that later matters to a macro with hard-coded column numbers, as described in [Why My VBA Maps Columns by Header Name](/blog/vba-map-columns-by-header-name-not-column-number). There is no rollback either. The previous version exists only if someone kept a copy.",
        "The log also travels inside the file it describes. The tracker was shared as a weekly submission, and each weekly copy carries its own copy of the history. The copy I read is named for a week in April 2026, and its last entry is from January. Whether anything changed between January and April, the log cannot say. It is only as current as the copy you happen to have open.",
        "For a spreadsheet that has to stay a spreadsheet, the cheap improvements are to save each release as a dated file in one place and treat those files as the rollback, and to write the changed sheets and columns into each log entry. For a spreadsheet whose change log reads like the one above, the stronger conclusion is the one BBTech reached in 2026: move the workflow into an application with real version control. That application, the web ITMS, was built by another BBTech developer; I troubleshoot and maintain it with them.",
      ],
    },
  ],
};
