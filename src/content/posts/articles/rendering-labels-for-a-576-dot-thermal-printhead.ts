import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "rendering-labels-for-a-576-dot-thermal-printhead",
  title: "From Millimetres to Dots: Rasterising a 50×30 mm Label for a 576-Dot Printhead",
  description:
    "How a label template in millimetres becomes a 1-bit raster for a 300 dpi thermal printhead: geometry, thresholding, whole-dot barcodes and why some designs cost more Bluetooth packets.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["Thermal printing", "Canvas 2D", "Barcode", "QR code", "Raster", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Rasterising Labels for a 300 dpi Thermal Printhead",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "niimbot-b1-pro-ble-protocol-print-sequence",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "freezing-label-templates-with-raster-hash-tests",
  ],
  sections: [
    {
      heading: "The problem: a label is designed in millimetres, printed in dots",
      body: [
        "A direct thermal printer does not understand fonts, images or barcodes. It understands rows of dots that are either heated or not. Everything between a label design and those rows is the application's job. In the [RPOMS Print Engine](/work/rpoms-print-engine) that job belongs to a renderer that turns a JSON template, measured in millimetres, into the exact 1-bit raster a NIIMBOT B1 Pro prints.",
        "This article is for anyone writing that renderer for a small thermal printer: the geometry, the thresholding, and the choices that decide whether a barcode scans. How the raster then travels to the printer is covered in [the B1 Pro protocol article](/blog/niimbot-b1-pro-ble-protocol-print-sequence).",
      ],
    },
    {
      heading: "The geometry of a 50 × 30 mm label at 300 dpi",
      body: [
        "At 300 dpi there are 300 / 25.4 = 11.81 dots per millimetre. A 50 × 30 mm label is therefore about 591 × 354 dots. The printhead, though, is 576 dots wide, about 48.8 mm. The raster actually sent to the printer is 576 × 354: the printhead width by the label length.",
        {
          type: "table",
          head: ["Quantity", "Value"],
          rows: [
            ["Dots per mm", "11.81"],
            ["Full label", "591 × 354 dots"],
            ["Raster sent", "576 × 354 dots (72 bytes per row)"],
            ["Unprintable", "about 0.6 mm at each side (15 dots in total)"],
            ["Design rule", "keep content at least 1.5 mm from the left and right edges"],
          ],
        },
        "Templates are designed on the full 50 × 30 mm label, because that is what people measure with a ruler. The print raster is a printhead-wide window cut out of the full label. The vendor's device file says content is centred on the printhead, so that is the default position of the window. Where the window really lands on a given printer is a calibration value: offsets in millimetres, applied in whole dots, and an optional 180° rotation if labels come out upside down. Scale factors exist too, but the rule in the calibration procedure is to leave them at 1 unless a measured grid proves the head or the feed is off. Stretching a template to hide an unmeasured problem only moves the problem.",
        "The editor preview hatches the two unprintable strips, so a template can never look printable where the printer will not print.",
      ],
    },
    {
      heading: "Rendering the template onto a canvas",
      body: [
        "Rendering happens in four steps: bind the data, draw the full label, cut out the printhead window, threshold to one bit.",
        {
          type: "flow",
          steps: [
            "Bind {{VARIABLES}} to every element; collect every missing value",
            "Draw the 591 × 354 label on a canvas, element by element",
            "Cut the 576-dot window, apply calibration offsets and rotation",
            "Threshold to 1-bit: luminance below 128 is black",
          ],
        },
        "Binding comes first and fails as a whole. If any variable is missing or blank, every missing name is reported together and nothing reaches the printer. A label with an empty serial is worse than no label.",
        "Text uses bundled Roboto fonts, not system fonts, so a label renders the same on every workstation and offline. Text shrinks to fit its box by default. Images carry their own threshold, because a logo often needs a different cut-off from the rest of the label.",
        "That per-image threshold was not enough for one logo. The device-label template carries a brand logo whose second letter is a light teal. At a luminance threshold it simply disappeared. The fix was a small build script that turns every visible pixel of the colour source into solid black on a transparent background and writes a dedicated 1-bit asset. Thermal paper has one colour, so it is better to decide the monochrome version once, deliberately, than to hope a threshold picks the right pixels.",
      ],
    },
    {
      heading: "Thresholding and bit packing",
      body: [
        "The canvas gives RGBA pixels. The conversion to the printer's format is short enough to show whole:",
        {
          type: "code",
          lang: "ts",
          code: "for (let y = 0; y < height; y++) {\n  for (let x = 0; x < width; x++) {\n    const i = (y * width + x) * 4;\n    if (rgba[i + 3] <= alphaCutoff) continue;          // transparent = paper\n    const lum = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];\n    if (lum < threshold) bmp.data[y * bmp.stride + (x >> 3)] |= 0x80 >> (x & 7);\n  }\n}",
          caption: "From raster.ts. 1 = black, packed MSB-first: bit 0x80 is the leftmost dot of each byte.",
        },
        "There is no dithering. Dithering helps photographs and hurts barcodes and small text, and a production label has no photographs. Transparent pixels count as white paper. The result, a `MonoBitmap` with width, height, stride and bytes, is the only thing the rest of the system sees. The preview shows exactly this raster, not the canvas it came from, so what the editor shows is what the printer gets.",
      ],
    },
    {
      heading: "Barcodes with whole-dot modules",
      body: [
        "Code 128 is encoded in-house, with automatic switching between code sets A, B and C. The important decision is in drawing it. A Code 128 symbol is a number of modules, the narrowest bar or space. The renderer picks the widest whole number of dots per module that fits the element's box, and draws every bar on dot boundaries.",
        "For a 16-character router serial the symbol is 145 modules. At 3 dots per module that is 435 dots, 36.8 mm on the label. In the vendor app's version of the same label, the barcode is stretched to about 45.6 mm, which means fractional modules: some bars get rounded to one more dot than others. I deliberately did not match it. On a 300 dpi thermal head, bars that are all exact multiples of one dot scan more reliably than a wider barcode with uneven bars.",
        "QR codes follow the same rule. The module matrix comes from the `qrcode` library and every module is drawn as a whole number of dots, the largest that fits the box, centred. For the device-label template a test goes further: it reads the QR back out of the final print raster and compares it module by module with the encoding of the exact input value. That catches the case where a rendering change still produces something that looks like a QR code but no longer is the right one.",
      ],
    },
    {
      heading: "Why some labels cost more Bluetooth packets",
      body: [
        "The printer receives rows, and one packet can stand for up to 200 identical consecutive rows. So the cost of a label over Bluetooth is not its size but how many distinct runs of rows it has.",
        "The router label is mostly horizontal bands: a logo, a divider, a model name, a barcode whose rows are all identical, and the serial. It encodes to 132 row packets. The device label puts a QR code on the left beside wrapped text and a logo on the right. A QR code changes nearly every module row, and the text and logo beside it change too, so few rows repeat. It needs 179 packets.",
        {
          type: "table",
          head: ["Label", "Row packets", "Transfer floor at 10 ms per packet"],
          rows: [
            ["Router label (barcode)", "132", "about 1.3 s"],
            ["Device label (QR beside text and logo)", "179", "about 1.8 s"],
          ],
          caption: "Packets must be at least 10 ms apart, so the packet count sets a minimum transfer time that no software change can remove.",
        },
        "On the software side the whole render and raster step takes roughly 7 to 12 ms per label in the simulator, around 40 ms for the first render of a session, which is why templates are warmed at start-up. That is noise next to the Bluetooth floor. If you design labels for a Bluetooth printer and care about speed, the design itself is the lever: content arranged in horizontal bands transfers faster than content arranged side by side.",
      ],
    },
    {
      heading: "What keeps the output stable",
      body: [
        "The label design was fixed from the start, and every later change had to leave the physical output untouched. New renderer behaviour is therefore opt-in. Text wrapping, needed for the device label, is a property a template has to switch on, so templates without it render exactly as before. A test also hashes each built-in template's rendered raster and fails if a single dot moves.",
        "All of this is verified at the raster level. The printer completed a router label with every acknowledgement, but a systematic physical inspection, with a ruler against the calibration template's grid and the production scanner against every barcode, is part of the hardware validation that has not been recorded yet.",
      ],
    },
  ],
};
