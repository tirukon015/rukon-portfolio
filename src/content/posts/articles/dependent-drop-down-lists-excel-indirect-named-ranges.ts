import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "dependent-drop-down-lists-excel-indirect-named-ranges",
  title: "Dependent Drop-Downs With INDIRECT and Named Ranges, and What They Cost to Maintain",
  description:
    "A Brand → Model drop-down built with INDIRECT and one named range per brand works well on day one. The two update procedures, orphaned #REF! names and fixed ranges are what it costs later.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Excel", "Data Validation", "INDIRECT", "Named Ranges", "Reference Data", "Maintenance"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Excel Dependent Drop-Downs With INDIRECT: The Maintenance Cost",
  relatedProjects: ["itms"],
  relatedPosts: [
    "documenting-an-excel-tracker-for-non-technical-users",
    "generating-inventory-skus-in-excel-with-let-and-textjoin",
    "mapping-an-excel-tracker-to-a-database-schema",
  ],
  sections: [
    {
      heading: "The problem: the model list should depend on the brand",
      body: [
        "When staff receive a laptop, they pick its brand, then its model. A single model list with every brand's models in it is long, and it lets someone pick a Lenovo model for a Dell. That wrong pairing then flows into the barcode SKU printed on the label. The standard Excel answer is a dependent drop-down: the second list changes with the first.",
        "The BBTech Stock Tracker, the Excel workbook I worked on and maintained for BBTech's laptop stock (project page: [/work/itms](/work/itms)), used the classic INDIRECT and named-range version of this pattern. This article shows how it works, then spends most of its time on what it cost to keep running, because that part rarely makes it into tutorials.",
      ],
    },
    {
      heading: "How INDIRECT and named ranges make a list depend on another cell",
      body: [
        "Every reference list lives on one sheet, Ref, whose top row says \"DO NOT TOUCH\". It holds columns for brand, CPU, generation, RAM, SSD, source and status, plus one column of models per brand. Each model column has a workbook-level name that is exactly the brand in capitals: a name DELL refers to the cells holding Dell models, a name HP to the HP models, and so on.",
        "The brand column's validation is an ordinary list pointing at the brand column on Ref. The model column's validation is one formula:",
        {
          type: "code",
          lang: "excel",
          code: `Data Validation → Allow: List → Source:
=INDIRECT(UPPER($D22))`,
          caption: "D is the Brand column. For a row where Brand is \"Dell\", the source becomes the range named DELL.",
        },
        "INDIRECT turns text into a reference. The brand cell contains text, UPPER normalises it to the name's spelling, and INDIRECT resolves that text as a name. Because the reference to column D is row-relative, one rule applied to the whole column gives every row its own dependent list.",
        "It is a good pattern for a small, stable catalogue. It needs no helper columns and no macros, and a non-technical user sees exactly the behaviour they expect.",
      ],
    },
    {
      heading: "Two different ways to add an item",
      body: [
        "The cost shows up the first time the catalogue changes. The tracker's own \"How to add drop down\" sheet, added in September 2025 alongside the user guide, has to teach two separate procedures, because the two kinds of list are wired differently.",
        {
          type: "table",
          head: ["Adding…", "Steps the guide gives"],
          rows: [
            ["A brand, CPU, generation, RAM, SSD or source", "Unhide Ref, add the value to its list, select any cell in that column on the Receiving sheet, open Data Validation, re-select the longer source range, tick \"Apply these changes to all other cells with the same settings\"."],
            ["A model for an existing brand", "Add it under that brand's column on Ref, open Formulas → Name Manager, edit the brand's name and extend \"Refers to\" to include the new cell."],
            ["A model for a new brand", "Add a new column on Ref, then in Name Manager create a new name spelled exactly like the brand and point it at the model cells only, not the heading."],
          ],
          caption: "Paraphrased from the tracker's in-workbook guide.",
        },
        "Each procedure is reasonable on its own. Together they ask an operations user to know that brand lists and model lists live in different parts of Excel, to find a sheet that is hidden on purpose, and to use Name Manager, a dialog most spreadsheet users never open. The guide ends with the most honest line in the workbook: if the instruction does not work, contact the maintainer.",
      ],
    },
    {
      heading: "What goes wrong over time",
      body: [
        "Reading the workbook's defined names in the April 2026 copy shows the kind of wear this pattern accumulates. None of it is dramatic, but every item is a small trap for the next person.",
        {
          type: "list",
          items: [
            "Orphaned names. Three names, spelled like models rather than brands, now resolve to #REF!. They were left behind when the cells they pointed to were deleted. Name Manager keeps a name after its cells are gone, and nothing warns you.",
            "Fixed-size ranges. Each brand's name refers to a fixed block of cells. A model typed one row below the block exists on Ref but never appears in the drop-down until someone extends the name by hand, which is exactly the step the guide has to explain.",
            "Fragmented rules. \"Apply to all other cells with the same settings\" only reaches cells whose rule is still identical. In the April 2026 copy the brand column's validation is split: most rows point at a ten-item brand list, and a later block of rows at an eleven-item one. The generation column has one source range for most rows and two single cells with longer ones. Each fragment is a row where a new value may or may not be offered, depending on which rule it inherited.",
            "Ad hoc placement. Most brands have their own column, but two share one column at different heights. It works, but the Ref sheet no longer tells you where the next list should go.",
            "A string contract. The link between a brand and its model list is only that the brand's text, upper-cased, equals a name. A brand whose name has a space or hyphen cannot be a defined name as written, and a brand typed differently in the brand list simply produces an empty model drop-down.",
          ],
        },
        "INDIRECT is also a volatile function, which matters when it is used in cell formulas across large sheets. Inside data validation it is only evaluated when the list is used, so that is not the problem here. The problems above are about maintenance, not speed.",
      ],
    },
    {
      heading: "Cheaper variations if you stay in Excel",
      body: [
        "The tracker did not use these, so treat them as options rather than tested advice from this workbook. Two changes remove most of the upkeep. First, keep each list in an Excel table and point the name at the table column (for example `=tblDell[Model]`). Tables grow when you type directly below them, so the \"extend Refers to\" step disappears. Second, and better, replace the column-per-brand layout with one two-column table of brand and model pairs. Adding a model becomes adding a row, and nothing else changes. The dependent list can then be produced with a FILTER in a helper area, `=FILTER(Models[Model], Models[Brand]=selectedBrand)`, which a validation rule can reference as a spill range. That works cleanly for a single entry cell, such as a scan-and-edit panel. It is less convenient for every row of a long table, because each row needs its own filtered list.",
      ],
    },
    {
      heading: "Where this ends up in a database",
      body: [
        "When the workflow moved to the web ITMS, which was built by another BBTech developer, this whole mechanism became plain relational data. There are reference tables for brands, models, CPUs, generations, RAM, storage and sources. Each row has an id, a display name and a short code, and a model row carries the id of its brand. The dependent list is a filter on that foreign key, a new model is one new row, and a misspelt brand cannot orphan anything because nothing is matched by text.",
        "The code column is a detail worth noticing. In the spreadsheet, SKU formulas cut codes out of display names with LEFT, as described in [Generating Barcode and Group SKUs in Excel](/blog/generating-inventory-skus-in-excel-with-let-and-textjoin). With a separate code on each reference row, the label code no longer depends on how a name happens to be spelled.",
      ],
    },
  ],
};
