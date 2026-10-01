import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "generating-inventory-skus-in-excel-with-let-and-textjoin",
  title: "Generating Barcode and Group SKUs in Excel From Spec Columns",
  description:
    "How an Excel stock tracker built a per-brand serial that rolls past 99, a barcode SKU and a variant group key from spec columns with LET and TEXTJOIN, and where formula IDs break.",
  date: "2026-10-01",
  category: "Building Real Systems",
  tags: ["Excel", "LET", "TEXTJOIN", "SKU", "Barcode", "Inventory"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Generating Inventory SKUs in Excel With LET and TEXTJOIN",
  relatedProjects: ["itms", "rpoms-print-engine"],
  relatedPosts: [
    "logging-status-changes-in-excel-with-vba-to-measure-stage-time",
    "serial-number-model-detection-by-prefix-rules",
    "mapping-an-excel-tracker-to-a-database-schema",
    "printing-labels-from-the-browser-over-web-bluetooth",
  ],
  sections: [
    {
      heading: "The problem: every laptop needs a label before anyone knows much about it",
      body: [
        "A refurbished-laptop operation receives units in batches, from more than one source, and each unit needs a scannable label on the day it arrives. After that, every department finds the unit by scanning it. An e-commerce team also needs a second identifier: one that is the same for every unit sold as the same listing, so a Dell with 16 GB and 512 GB can be counted as one product on the shelf even though each unit has its own label.",
        "At BBTech this ran on the BBTech Stock Tracker, a macro-enabled Excel workbook that I worked on and maintained. It went live on 1 July 2025 (the project page is [/work/itms](/work/itms)). It generated three identifiers with formulas and no macros: a per-brand serial, a barcode SKU for the label, and a group SKU key for e-commerce variants. This article explains how each one works, the edge cases they ran into, and the one property that makes a formula-generated ID risky. The examples below use invented values.",
      ],
    },
    {
      heading: "A per-brand serial that keeps going past 99",
      body: [
        "The serial is the first two letters of the brand plus a running count of how many units with that prefix appear above the current row. The first version was just the prefix and the count. That broke visually at 100: the tracker's change log records an update on 1 August 2025 for \"SKU update on over 100 units\" (DE99, then DEA0, and DEB0 at 200). The count's hundreds became a letter, which kept serials short:",
        {
          type: "code",
          lang: "excel",
          code: `=LET(
  prefix,      LEFT([@Brand], 2),
  count,       COUNTIF(<serials above this row>, prefix & "*") + 1,
  groupLetter, CHAR(64 + INT(count / 100)),
  remainder,   MOD(count, 100),
  IF(count < 100,
     prefix & count,
     prefix & groupLetter & remainder)
)`,
          caption: "Simplified from the tracker. CHAR(65) is A, so 100 becomes DEA0, 105 becomes DEA5 and 200 becomes DEB0.",
        },
        "LET is what keeps this readable. Without it, `LEFT(Brand,2)` and the COUNTIF appear three or four times each in one nested IF, and a change to one copy silently misses the others. With LET each intermediate value has a name, and the final IF reads like the rule it implements.",
        "The scheme has limits that are worth knowing before copying it. Two brands whose names start with the same two letters would share one sequence. The brand list in the tracker had no such pair, but nothing enforces that. After Z (2,600 to 2,699) CHAR returns punctuation, so the scheme has a ceiling. The serial is also not zero-padded after the letter, so DEA5 and DEA50 are different lengths. That is fine for a scanner, but it looks wrong in a sorted column.",
      ],
    },
    {
      heading: "The barcode SKU: concatenating spec columns with TEXTJOIN",
      body: [
        "The label SKU is built from the serial and the spec columns that receiving staff select from drop-downs: brand, model, a free-text model number, CPU and CPU generation. The formula only runs once the brand is filled in, so a half-entered row stays blank instead of producing a partial SKU that someone might print.",
        {
          type: "code",
          lang: "excel",
          code: `=IF([@Brand] <> "",
   TEXTJOIN("", TRUE, [@Serial], LEFT([@Model], 4), [@[Model No]], [@CPU], [@Gen]),
   "")`,
          caption: "Invented example: DE12 + LATI + 7400 + i7 + 8G gives DE12LATI7400i78G.",
        },
        "TEXTJOIN with `TRUE` as the second argument skips empty cells. The barcode SKU uses no delimiter, so that matters little here. It matters a lot for the hyphenated group key below: with `&` and hard-coded hyphens, an empty cell leaves a doubled hyphen in the key, and TEXTJOIN simply leaves it out.",
        "The serial at the front is what makes the barcode SKU unique. The spec part is only there so a person can read roughly what the unit is from the label. That readability has a cost: a long model number pushes the SKU past what fits as a 1D barcode on a small thermal label. The tracker's user guide describes an informational cell that turns red when the SKU is too long to print as a barcode, and tells staff to shorten the free-text model-number cell. On 4 August 2025 the change log adds \"use of QR code for long SKU instead of barcode\". A QR code holds the same string in a much smaller area.",
      ],
    },
    {
      heading: "The group SKU key: one identifier per sellable variant",
      body: [
        "The e-commerce team did not need to know which unit it was. They needed to know which listing it belonged to. The group key drops the serial and keeps only the attributes a buyer chooses between, including RAM, storage and whether the screen is touch, joined with hyphens so the key is readable:",
        {
          type: "code",
          lang: "excel",
          code: `=IF([@SKU] <> "",
   TEXTJOIN("-", TRUE,
     LEFT([@Channel], 3), LEFT([@Model], 3), [@[Model No]], [@CPU], [@Gen],
     LEFT([@RAM], 2), LEFT([@SSD], 3),
     IF([@[Touch Screen]] = "Yes", "T", "")),
   "")`,
          caption: "Simplified. Invented example: SHP-LAT-7400-i7-8G-16-512-T. The first part is a two-value classification column in the tracker.",
        },
        "Every unit with the same key is the same product for listing purposes. That made the e-commerce summary sheet a short formula instead of a manual count: `UNIQUE(FILTER(group keys, status is E-Comm or Posted))` lists each variant once, and a COUNTIFS next to it counts how many of that key are currently in those two statuses. The change log dates the group SKU to 17 June 2025, before go-live.",
        "Fixed-width truncation has a quirk worth testing for. `LEFT(RAM, 2)` turns \"16GB\" into \"16\" but \"8GB\" into \"8G\". Both are still unique, so grouping works, but the key is less consistent than it looks. When building a key like this, write out every value that can actually appear in each column and check what the truncation does to each one.",
      ],
    },
    {
      heading: "Why a formula-generated ID is fragile",
      body: [
        "The serial formula counts the matching rows above the current one. That means the serial is a function of row position, not a stored fact. If a row is deleted, or the table is sorted, every later serial with the same prefix is recalculated. The labels already stuck on laptops are not. I found no record in the workbook of this causing a problem, and the operation mostly appended rows. But it is a property of the formula, and it is the first thing I would warn anyone copying the pattern about.",
        "The usual mitigations in Excel all involve turning the computed value into a stored one: paste it as a value once assigned, or have a macro write it when the row is created. Each of those gives up the thing that made the formula attractive, which is that nobody has to remember to do anything.",
        {
          type: "callout",
          label: "Rule of thumb",
          text: "A value that is printed and stuck on a physical object must never be recomputed. Derive it once, then store it.",
        },
      ],
    },
    {
      heading: "What carried over to the web ITMS",
      body: [
        "In 2026 BBTech moved the workflow into a web application. It was built by another BBTech developer, not by me; I troubleshoot and maintain it with them. The same two identifiers survived, and two of the tracker's weaknesses were addressed in that design. The visible serial scheme is the same (prefix, then a letter past 99), but the next serial is derived from the highest existing serial for that prefix and stored on the device record, so it does not depend on row order. The composition of the barcode SKU and the group key is no longer hard-coded in a formula. It is an ordered list of fields in a configuration, joined without a separator for the barcode and with hyphens for the group key.",
        "Printing moved too. Labels were printed from the tracker on a NIIMBOT printer, and the web system prints both SKUs through the [RPOMS Print Engine](/work/rpoms-print-engine), my own project, which drives the same kind of printer over Web Bluetooth. That side is described in [Printing Labels From the Browser Over Web Bluetooth](/blog/printing-labels-from-the-browser-over-web-bluetooth). How the tracker then followed each SKU through the departments is covered in [Logging Every Status Change in Excel With VBA](/blog/logging-status-changes-in-excel-with-vba-to-measure-stage-time).",
      ],
    },
  ],
};
