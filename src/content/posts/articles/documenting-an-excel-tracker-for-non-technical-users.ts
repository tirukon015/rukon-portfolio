import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "documenting-an-excel-tracker-for-non-technical-users",
  title: "Writing a User Guide Into the Spreadsheet Itself",
  description:
    "A stock tracker's in-workbook guide: a colour legend for formula, drop-down and free-text columns, a sheet-by-sheet purpose list, and how the guide drifted from the formulas it described.",
  date: "2026-10-19",
  category: "UI/UX & Product",
  tags: ["Excel", "Documentation", "Internal Tools", "User Guide", "Data Quality"],
  contentType: "Experience-led",
  searchIntent: "informational",
  seoTitle: "Documenting an Excel Tracker for Non-Technical Users",
  relatedProjects: ["itms"],
  relatedPosts: [
    "dependent-drop-down-lists-excel-indirect-named-ranges",
    "versioning-an-operational-spreadsheet-like-software",
    "why-internal-software-needs-good-ux",
    "vba-map-columns-by-header-name-not-column-number",
  ],
  sections: [
    {
      heading: "The problem: a heavily formulated sheet looks like any other sheet",
      body: [
        "To a user, a cell with a formula and a cell for typing look the same. In an operational workbook that is dangerous. Typing over a formula in one row breaks the barcode SKU for that unit, and nothing warns you. The people using the BBTech Stock Tracker were receiving staff, technicians, the e-commerce team and management, not spreadsheet builders. The tracker needed to tell them, inside the file, which cells were theirs.",
        "I worked on and maintained the tracker (project page: [/work/itms](/work/itms)). Its change log records a \"User Guide\" and a \"How to add drop down\" guide being added on 3 September 2025, two months after the tracker went live on 1 July. This article describes what the guide did well, and one thing it did not survive: later changes to the workbook.",
      ],
    },
    {
      heading: "A colour legend for column types",
      body: [
        "The most useful part of the guide is a four-row legend. Every column header on the working sheets is filled with one of four colours, and the guide says what each colour means and what the user should do:",
        {
          type: "table",
          head: ["Header type", "What the user should do"],
          rows: [
            ["Formulated", "Do not overwrite or change anything; the formula runs by itself."],
            ["Drop Down", "Pick from the list. If a value is missing, follow the \"How to add drop down\" sheet, and ask the maintainer if that fails."],
            ["Free Text", "Write whatever is needed."],
            ["Informational", "A formulated guide cell. If it turns red, the barcode SKU is too long to print as a barcode: shorten the free-text model-number cell."],
          ],
          caption: "Paraphrased from the tracker's User Guide sheet.",
        },
        "This works because it is enforced by something the user sees on every screen, the header colour, rather than by something they must remember. It also turns a rule into an action. \"Don't touch formula columns\" is advice. \"Leave any column with this header colour alone\" is an instruction. The Informational type is the clever one: a formula whose only job is to warn about a problem another formula will cause later, at the label printer.",
      ],
    },
    {
      heading: "Say who each sheet is for",
      body: [
        "The rest of the guide goes sheet by sheet, and each section opens with who the sheet is for. Receiving is where every new unit starts. The e-commerce summary is \"for E-Comm summary view only\". The sold list and the daily update are \"meant for management view\". The Sold button is \"meant to be used by the Front Office (E-Comm)\". That one line per sheet answers the question a new user actually has, \"do I need to be here?\", before they read anything else.",
        "Where it explains a mechanism, it does so in the user's terms, with an example rather than a formula. Time in stage is described as: if the status is hardware and it is marked software ten minutes later, those ten minutes are recorded against hardware. That sentence explains the logging macro described in [Logging Every Status Change in Excel With VBA](/blog/logging-status-changes-in-excel-with-vba-to-measure-stage-time) better than the macro does.",
        "Some of the most important documentation is not on the guide sheet at all. Next to the scan box on the update sheet is a note in capitals: always make sure the cursor is on the scan cell before scanning. A barcode scanner is a keyboard, and it types into whatever cell is selected. That warning belongs exactly where the mistake happens.",
      ],
    },
    {
      heading: "Teaching the maintenance tasks too",
      body: [
        "The second guide is a step-by-step, screenshot-driven walkthrough for adding values to drop-down lists, using a new brand and a placeholder model as the worked example. It exists because the reference lists were meant to be extended by users, not only by the maintainer, and the mechanism behind them, dependent lists built from named ranges, is not something users would discover alone. Why that mechanism needed two different procedures is covered in [Dependent Drop-Downs With INDIRECT and Named Ranges](/blog/dependent-drop-down-lists-excel-indirect-named-ranges).",
        "A worked example with an obviously fake value is a good habit. Users can follow along without editing real data, and it is clear which parts of the screenshot are the example.",
      ],
    },
    {
      heading: "Where the guide drifted from the workbook",
      body: [
        "Reading the April 2026 copy against its own guide shows three places where the text no longer matches the logic:",
        {
          type: "list",
          items: [
            "The guide says the barcode SKU takes the first three letters of the model and the first four characters of the model number. The formula takes the first four letters of the model and the whole model number.",
            "The guide says the check status is generated when a quality column is Pending or Ready. The formula sets it when all seven specification cells in the row are filled.",
            "The guide names specific scan and lookup cells. The scan-and-update flow was later moved to its own sheet (the change log's January 2026 revamp), and the cells the formulas now read are different ones.",
          ],
        },
        "None of this is surprising. The guide was written once, as version 1.6, and the workbook kept changing through versions 1.7 and 1.8. Nobody reads a guide sheet when changing a formula, so the guide never got updated.",
      ],
    },
    {
      heading: "What I would do differently",
      body: [
        "Three habits would have kept the guide honest, and they apply to any internal tool, not just spreadsheets:",
        {
          type: "list",
          items: [
            "Describe rules, not implementations. \"The SKU is the serial followed by a short model code, model number, CPU and generation\" survives a change from three letters to four. \"The first three letters\" does not.",
            "Refer to headers people can see, never to cell addresses. Cell addresses move, and the same lesson applies to macros ([Why My VBA Maps Columns by Header Name](/blog/vba-map-columns-by-header-name-not-column-number)).",
            "Make updating the guide part of each version in the change log. If a version's entry lists the guide sections it touched, a missing entry is visible.",
          ],
        },
        "The colour legend needed none of these fixes. It describes what kind of column something is, not how it is computed, which is why it stayed true while the formulas beneath it changed.",
      ],
    },
  ],
};
