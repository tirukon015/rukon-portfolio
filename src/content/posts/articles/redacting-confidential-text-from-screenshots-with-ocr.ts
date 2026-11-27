import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "redacting-confidential-text-from-screenshots-with-ocr",
  title: "Redacting Confidential Text From Screenshots With OCR",
  description:
    "Text sanitising cannot reach words inside an image. How the screenshots on this portfolio were checked with OCR, redacted in place with neutral stand-ins, and verified again, and why logos still needed a human eye.",
  date: "2026-11-27",
  category: "AI & Automation",
  tags: ["OCR", "Confidentiality", "Python", "Image Processing", "Automation"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms", "rpoms-print-engine"],
  relatedPosts: [
    "one-client-import-shipped-every-project-to-the-browser",
    "odometer-ocr-tesseract-sharp-preprocessing-plausibility",
  ],
  sections: [
    {
      heading: "Why can text sanitising not protect a screenshot?",
      body: [
        "The case studies on this site show real screens from systems I built, captured on synthetic demo data. The site replaces confidential organisation names in its text with public descriptions before rendering. A screenshot is not text: if a header, a table cell or a label inside the image shows a name, every visitor sees it, and no amount of string replacement on the page changes the pixels.",
        "An audit of the published images found exactly that: organisation names in dashboard headers, in table columns and in a social-sharing image, plus device model names that identify a particular fleet.",
      ],
    },
    {
      heading: "How does the OCR pass work?",
      body: [
        "Every image under the site's `public/images` folder goes through an OCR engine (RapidOCR on ONNX Runtime, run locally in an isolated Python environment). For each line it finds, the engine returns the text and its bounding box. Lines that match the list of protected terms, or that look like an email address, phone number, IP address or private domain, are recorded with their box.",
        {
          type: "flow",
          steps: [
            "OCR every public image",
            "Match lines against protected terms and patterns",
            "Blank each matched box with its own background colour",
            "Redraw the line with neutral stand-ins",
            "OCR again until clean",
            "Check logos by eye",
          ],
          caption: "The redaction loop used on this site's screenshots.",
        },
      ],
    },
    {
      heading: "How is a line redacted without breaking the screenshot?",
      body: [
        "Covering a word with a black box would be honest but ugly, and it would hide the layout the screenshot exists to show. Instead, each matched box is filled with the most common colour along its own border, which in a UI screenshot is almost always the background behind the text. The line is then redrawn in the same position, at a size fitted to the original box and in the original line's text colour, with the protected terms swapped for neutral stand-ins: a client becomes \"Client\", a device model becomes \"Model A\".",
        "So a packed-box list still reads as a packed-box list, with box numbers, dates and states intact, and the parts that identified the organisation are gone.",
      ],
    },
    {
      heading: "Why run OCR again after redacting?",
      body: [
        "Because removing text can reveal text. On the second pass a logo that the first pass had read as part of a longer line came back as a word on its own, and one table cell that the first pass had skipped was found. A third pass came back clean except for a deliberate placeholder (`you@university.edu` in a sign-in form), which is not confidential.",
      ],
    },
    {
      heading: "What can OCR not find?",
      body: [
        "Logos. A stylised mark is a picture, not a word, and OCR either reads nothing or reads it only when it happens to contain clean letters. The remaining marks inside screenshots were located by viewing contact sheets of the affected images and blanking those regions by coordinates, each one checked afterwards in a zoomed crop.",
        "The project logos themselves are a different question, and a decision for the owner rather than for a script: they are the identity of the projects, and they stayed.",
      ],
    },
    {
      heading: "What does this leave in place?",
      body: [
        {
          type: "list",
          items: [
            "The procedure and the term list live in a private repository, because the list itself names what must not be published.",
            "Changing a screenshot means running the OCR pass again before publishing.",
            "Git history still holds the originals; removing them is a separate, deliberate decision.",
          ],
        },
        "The redacted screens are on the [RPOMS](/work/rpoms) and [RPOMS Print Engine](/work/rpoms-print-engine) case studies.",
      ],
    },
  ],
  related: [
    { label: "RPOMS case study", href: "/work/rpoms" },
    { label: "RPOMS Print Engine case study", href: "/work/rpoms-print-engine" },
  ],
};
