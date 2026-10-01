import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "fill-a-word-template-in-nodejs-with-jszip",
  title: "Filling a Word Template in Node.js When Word Splits Your Placeholders",
  description:
    "How RPOMS fills the office's own Delivery Order .docx with JSZip: placeholders split across Word runs, a two-pass replace, and an Excel tracker beside it.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["DOCX", "JSZip", "ExcelJS", "Node.js", "Next.js", "Document Generation"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Fill a Word (.docx) Template in Node.js With JSZip",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "delivery-module-scan-boxes-never-type-serials",
    "staged-csv-import-for-operational-data",
    "csv-formula-injection-in-exports",
  ],
  sections: [
    {
      heading: "The problem: paperwork that already has a format",
      body: [
        "In RPOMS, the operations system I built for a router-refurbishment line, every delivery goes out with a Delivery Order. The office already had that note as a Word document, with its own layout, borders, fonts and logo, and the customer expected it to look exactly like that. My first version redrew the note in HTML. It came close but never matched, and a delivery note that nearly matches the real one is worse than having no second copy.",
        "So I stopped drawing it. The generator now opens the office's actual .docx, in which the details of one real delivery have been replaced by placeholders, fills those placeholders in, and returns the file. What comes out is the document the office already prints. This article is for anyone who needs to generate a Word document from a template in Node.js without a heavyweight templating library, and who has found that a plain search-and-replace misses half the placeholders.",
      ],
    },
    {
      heading: "A .docx is a zip, and the text lives in word/document.xml",
      body: [
        "A .docx file is a zip archive. The body of the document is one XML file, `word/document.xml`. JSZip can open the archive, read that file as a string, and write it back, so the whole generator is: load the template, edit one string, zip it again.",
        {
          type: "code",
          lang: "ts",
          code: `const zip = await JSZip.loadAsync(await fs.readFile(TEMPLATE));
let xml = await zip.file("word/document.xml")!.async("string");

for (const [from, to] of values) {
  xml = replaceAcrossRuns(xml, from, escapeXml(to));
}

zip.file("word/document.xml", xml);
return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });`,
          caption: "The shape of buildDoDocx() in RPOMS, trimmed.",
        },
        "A Next.js route handler returns that buffer with the Word MIME type and a `Content-Disposition` filename that follows the office's own naming, with the DO number's slash turned into an underscore. JSZip had only been in the project as a dependency of ExcelJS, and I added it as a direct dependency when the generator started relying on it.",
      ],
    },
    {
      heading: "Why a plain replace misses placeholders: Word runs",
      body: [
        "Word does not store a line of text as one string. It stores a paragraph (`<w:p>`) made of runs (`<w:r>`), each with its own text node (`<w:t>`). A run boundary appears wherever formatting, spell-check state or editing history changed, and that is often in the middle of a word. The placeholder you typed as `Location XXXX` can be stored as `Location X` in one run and `XXX` in the next. Searching the XML for `Location XXXX` finds nothing.",
        "The generator therefore works in two passes, and both always run. The first replaces every occurrence that sits whole inside one run. The second goes paragraph by paragraph: it joins the text of all the runs, and if the joined text still contains the placeholder, it replaces it there and writes the whole result into the first run, emptying the others.",
        "Running both passes every time matters. The customer's name prints twice on the note, under CUSTOMER and under SHIP TO. In the real template one of those was a single run and the other was split. A generator that stopped after the first pass succeeded would fill one and leave the other reading `Location XXXX`.",
        {
          type: "callout",
          label: "Trade-off",
          text: "The second pass puts the paragraph's text into its first run, so any formatting that differed between runs of that paragraph is lost. That is acceptable for this note, where each placeholder sits in a plainly formatted cell. It would not be acceptable for a paragraph that mixes bold and regular text.",
        },
      ],
    },
    {
      heading: "Placeholder design: longer first, and never reuse a word",
      body: [
        "Two further rules came from bugs rather than from planning.",
        "Longer placeholders are replaced first, so a short one cannot match inside a longer one. The replacement list is ordered by hand with a comment saying so.",
        "A placeholder must never be text that also appears legitimately in the document. The template originally used `QTY` for the quantity cell, and the column header is also `QTY`. Filling one filled both, and the header row printed the quantity: `No | DESCRIPTION | PRODUCT CODE | S/N | 250`. The value cell now has its own placeholder, `QTY_TOTAL`, and the header stays as it is. The rule I took from that: a placeholder such as `Name XXX` or `REF-XXXX-XX-XXX` should be something no real value or label on the page would ever contain.",
        "The address block taught the last lesson. The note has three address lines, and one customer's address has four. The first version dropped the fourth line without any warning, which leaves an incomplete address on a delivery note. Now fewer than three lines are padded with empty strings, so `Address Line 3` never prints, and more than three are folded into the last line rather than cut off.",
      ],
    },
    {
      heading: "Escaping, and a double-escape I have not fixed yet",
      body: [
        "Values going into XML must be escaped: `&`, `<` and `>` become entities. RPOMS escapes each value before replacing it. That is correct for the first pass, which works on raw XML.",
        "It is not quite right in the second pass. The joined run text is read straight out of the XML, so it is already escaped, and the value put into it was escaped too. The production code then escapes the joined result once more. When a placeholder is split across runs and that paragraph contains an `&`, `<` or `>`, either in the value or already in the text, the note would show the entity (`&amp;`) instead of the character. It only happens on that narrow path, but it is a real bug and it is still in the code. The correct version writes the joined text back without escaping it again:",
        {
          type: "code",
          lang: "ts",
          code: `// Second pass, simplified. Both the joined run text and \`to\` are already
// XML-escaped, so the result is written back as it is, not escaped again.
xml = xml.replace(/<w:p[ >][\\s\\S]*?<\\/w:p>/g, (para) => {
  const texts = [...para.matchAll(/<w:t[^>]*>([^<]*)<\\/w:t>/g)].map((m) => m[1]);
  const joined = texts.join("");
  if (!joined.includes(from)) return para;
  const replaced = joined.split(from).join(to);
  let first = true;
  return para.replace(/(<w:t[^>]*>)[^<]*(<\\/w:t>)/g, (_m, open, close) => {
    if (!first) return open + close;
    first = false;
    return open + replaced + close;
  });
});`,
        },
      ],
    },
    {
      heading: "The tracker beside it: Excel in the customer's column layout",
      body: [
        "Each delivery also produces a tracker list, the per-serial spreadsheet the customer keeps. This one is generated from scratch with ExcelJS, but it follows the same principle: copy the office's layout exactly rather than inventing a better one.",
        "The route builds one row per serial across the deliveries the user ticked on the history screen. It never exports the whole history by default. Columns follow the office sheet, with one addition: Box Number sits just before Serial Number, so a delivered router can be traced back to the box it left in. The registry's model string is split into the sheet's two columns, brand into Display Name and the rest into Model, and the casing colour chosen while scanning is appended as the sheet expects, for example `AR2140, BLK`.",
        {
          type: "code",
          lang: "ts",
          code: `function fill(cell: ExcelJS.Cell, argb: string) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
}

// Fills copied from the office sheet, ARGB as ExcelJS expects.
fill(row.getCell(6), "FFFFFF00"); // yellow
fill(row.getCell(9), "FF00B050"); // green`,
        },
        "All text stays black and only the fills carry meaning, which is how the office sheet reads. The file name follows the office convention too: the delivery date as DDMMYY, then the customer's short code. When an export mixes customers it says `MIXED` rather than picking one of them. `wb.xlsx.writeBuffer()` goes back from the route handler with the spreadsheet MIME type. Exports that include hand-typed text also need formula-injection escaping, which is covered in [Staged CSV Import](/blog/staged-csv-import-for-operational-data).",
      ],
    },
    {
      heading: "What I would do the same way again",
      body: [
        {
          type: "list",
          items: [
            "Fill the document people already use instead of recreating it. The template is the specification, and a PDF is simply that document saved as PDF from Word. A byte-faithful server-side PDF is still on the backlog, not done.",
            "Assume every placeholder may be split across runs, and run the paragraph-level pass every time.",
            "Make placeholders impossible to confuse with real text, and order them longest first.",
            "Escape exactly once. Track which strings are raw text and which are already XML.",
            "Never drop data to fit a template. Fold it into the space that exists and let a person see it.",
          ],
        },
        "The delivery module this belongs to, including the scanned-load check that happens before any paperwork is raised, is described on the [RPOMS project page](/work/rpoms). Like the registry and packing, it is complete but held behind the production write lock while the programme works through sign-off.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
