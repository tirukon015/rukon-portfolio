import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "mapping-an-excel-tracker-to-a-database-schema",
  title: "What Survives When an Excel Tracker Becomes a Web App",
  description:
    "Mapping an Excel stock tracker's sheets, formulas and macros onto the tables of the web system that replaced it: what carried over unchanged, and what had to become explicit.",
  date: "2026-11-06",
  category: "Building Real Systems",
  tags: ["Excel", "Database Design", "Migration", "Inventory", "Supabase", "Internal Tools"],
  contentType: "Explainer",
  searchIntent: "informational",
  seoTitle: "Mapping an Excel Tracker to a Web App Database",
  relatedProjects: ["itms"],
  relatedPosts: [
    "modelling-a-refurbishment-pipeline-in-excel",
    "dependent-drop-down-lists-excel-indirect-named-ranges",
    "logging-status-changes-in-excel-with-vba-to-measure-stage-time",
    "from-manual-workflow-to-digital-workflow",
  ],
  sections: [
    {
      heading: "The question, and whose work this is",
      body: [
        "If you maintain an operational spreadsheet, you will eventually be asked what it would look like as an application. This article answers that question for one real case, by comparing the BBTech Stock Tracker, the Excel workbook I worked on and maintained from July 2025, with the web ITMS that replaced it in 2026.",
        {
          type: "callout",
          label: "Attribution",
          text: "The web ITMS was designed and built by another BBTech developer while I was committed to other projects. Everything below about its tables and code describes their work, at a high level, as I know it from troubleshooting and maintaining the system with them. My side is the spreadsheet, and knowing the process both were built around.",
        },
        "The value of the comparison is that it shows which spreadsheet ideas were really the domain, because they survived intact, and which were workarounds for the medium, because they disappeared. The project page is [/work/itms](/work/itms).",
      ],
    },
    {
      heading: "Concept by concept",
      body: [
        {
          type: "table",
          head: ["In the tracker", "In the web ITMS"],
          rows: [
            ["Hidden Ref sheet; one named range per brand for models", "Reference tables for brands, models, CPUs, generations, RAM, storage and sources; each row has an id, a name and a short code; a model row points to its brand"],
            ["A row on Receiving plus a formula-pulled row on Technician for the same unit", "One device record holding foreign keys to the reference tables, the model number, serial, barcode SKU, group SKU key and the attributes added later in the process"],
            ["Serial formula: COUNTIF of rows above, letter after 99", "The same visible scheme, but the next serial is the highest existing one plus one, and it is stored on the record"],
            ["Barcode SKU and group key built by TEXTJOIN formulas", "A stored SKU rule: an ordered list of fields for each identifier, joined without a separator for the barcode and with hyphens for the group key"],
            ["Status column derived from department ticks, plus a drop-down for exceptions", "A status on the device, with the same stage names: Incoming Stock, Hardware Check, Software Check, QC Check, E-Comm, Posted, Sold"],
            ["StatusLog sheet written by a VBA macro, author from the Windows login", "Audit tables recording field, old value, new value, time and the signed-in user, for devices, sales and warranty claims"],
            ["Sold tick, sold date stamp, warranty period drop-down and an EDATE end date", "A separate sales record with its warranty period, and a separate table for warranty claims"],
            ["Deleting a row", "A trash table and page, so a deleted device can be found again"],
          ],
          caption: "High-level mapping. The right-hand column is the other developer's design.",
        },
      ],
    },
    {
      heading: "What survived: the domain",
      body: [
        "The stage names survived word for word, and so did both identifiers. That is the strongest evidence that they were the real model of the operation rather than spreadsheet habits. The departments still think in \"QC Check\" and \"Posted\", the label still carries a barcode SKU, and e-commerce still counts by group key. The idea that each department's own action moves a unit forward is described in [Modelling a Multi-Stage Refurbishment Pipeline in Excel](/blog/modelling-a-refurbishment-pipeline-in-excel), and it is just as true of the web system as of the workbook.",
        "Even the serial scheme survived: DE99 is still followed by DEA0. Labels already stuck on laptops had to keep making sense, so continuity in identifiers was a requirement, not a preference.",
      ],
    },
    {
      heading: "What disappeared: workarounds for the medium",
      body: [
        "The biggest structural change is the loss of the second sheet. In the workbook the same unit existed twice: typed on Receiving, then pulled by position onto Technician, where more values were typed beside the formulas. In a database a device is one record that gains fields as it moves, so there is no positional hand-off to fall out of step.",
        "The reference data stopped being a string contract. In the workbook a model list was found by matching the brand's text to a name, and adding one meant Name Manager, as covered in [Dependent Drop-Downs With INDIRECT and Named Ranges](/blog/dependent-drop-down-lists-excel-indirect-named-ranges). With a foreign key from model to brand, adding a model is inserting a row, and a typo cannot orphan a list. The separate short code on each reference row also replaces cutting SKU parts out of display names with LEFT.",
        "The audit log stopped depending on the client. The tracker's log only existed while a macro ran on someone's desktop Excel, and it trusted a Windows login, which [Logging Every Status Change in Excel With VBA](/blog/logging-status-changes-in-excel-with-vba-to-measure-stage-time) treats as its main limitation. In the web system the author is a signed-in account, and the change record lives in the database next to the data.",
      ],
    },
    {
      heading: "What had to become explicit",
      body: [
        "A spreadsheet does a lot of work silently, and an application has to spell each piece out. Recalculation is the obvious one. In Excel, changing a brand instantly changes the SKU, the name and the group key. In the web form, those values are computed in code from the selected fields and the stored rule, and they have to be recomputed whenever an input changes. That includes deciding what happens to an identifier that has already been printed.",
        "Configuration became data. The SKU's composition used to be whatever the formula said, so changing it meant editing a formula and filling it down. In the web system it is a stored rule, so it can change without a code change. The cost is that a change to the rule now affects SKUs generated afterwards, which needs a decision that a formula fill-down made implicitly.",
        "Identity became a requirement. A workbook knows nothing about who is using it beyond a login name. A web application needs accounts, sign-in, password reset and route protection before it can do anything at all. That is real work the spreadsheet never needed.",
      ],
    },
    {
      heading: "What the mapping is useful for",
      body: [
        "For anyone planning the same move, the practical method is to list every sheet, formula and macro in the workbook and sort each one into one of three groups: domain (keep the names and meanings exactly), workaround (replace it with a structure that makes the problem impossible), or implicit behaviour (write it down, because the application will not do it for free). Doing that for the tracker produces almost exactly the table above.",
        "For me it has a second use. When the web ITMS misbehaves, knowing which spreadsheet behaviour a feature replaced is often the quickest way to understand what users expect it to do. Label printing is one example. The tracker printed NIIMBOT labels from the SKUs it generated, and the web ITMS is being connected to my own Print Engine, which drives the same kind of printer, through the relay described in [Letting Another Web App Print Through an Open Tab](/blog/cross-app-printing-broadcastchannel-web-locks). That integration is on a branch and has not yet been merged.",
      ],
    },
  ],
};
