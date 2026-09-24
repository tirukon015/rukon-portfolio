import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "printing-labels-from-the-browser-over-web-bluetooth",
  title: "Printing Labels From the Browser Over Web Bluetooth: The RPOMS Print Engine",
  description:
    "A scan-to-label workflow that drives a NIIMBOT B1 Pro directly from Chrome, with no vendor app and no backend. What the protocol work looked like, how 116 tests run without a printer, and what the first real print taught.",
  date: "2026-09-24",
  category: "Full-Stack Development",
  tags: ["Web Bluetooth", "TypeScript", "Hardware", "Vite", "Testing", "Barcode"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "staged-csv-import-for-operational-data",
    "verifying-a-static-site-you-built-by-hand",
    "a-vision-model-that-only-observes",
  ],
  sections: [
    {
      heading: "The job",
      body: [
        "On the refurbishment line that RPOMS runs, every router gets a label with its serial as a barcode, and every packed box gets a label with its number as a QR code. The printer is a NIIMBOT B1 Pro, a small Bluetooth thermal printer that takes 50 by 30 mm labels. The vendor's route is its own app and, in practice, an Excel sheet feeding it. The workflow I wanted was: scan a serial with a USB barcode scanner, and a label comes out. No app, no spreadsheet, no server in the loop.",
        "Web Bluetooth makes that possible from a browser, with real limits: Chrome and Edge on desktop only, no Firefox, no browser on an iPhone, and the page has to be served over HTTPS or from localhost. For a fixed workstation next to a printer, those limits are fine. The print engine is a standalone Vite and React app, built and validated on its own before anything touches production RPOMS.",
      ],
    },
    {
      heading: "Layers that do not know about each other",
      body: [
        {
          type: "flow",
          steps: ["USB scanner", "ScannerService", "RouterPrintWorkflow", "TemplateService + renderer", "PrintQueue", "B1 Pro adapter", "Web Bluetooth", "Printer"],
          caption: "The scanner never touches Bluetooth; the UI never sees a frame or an opcode.",
        },
        "The device layer knows the BLE link, identification, status and the print sequence, and must not know about serials or templates. The print service is a FIFO queue, one job at a time, that holds a job if the printer faults and retries on resume. The template service stores JSON templates in millimetres, with text, logo, Code 128, QR, line and rectangle elements and `{{VARIABLE}}` bindings, and must not know about Bluetooth. The renderer turns millimetres into dots and produces a one-bit raster for a 576-dot printhead at 300 dpi. Workflows wire scans to templates to the queue. The UI talks only to a single `PrintEngine` object.",
        "Nothing in the core imports React, and DOM use is confined to the Web Bluetooth transport and one browser-environment shim. That is what lets every other module run in Node, which is how the tests run it.",
      ],
    },
    {
      heading: "116 tests and a fake printer",
      body: [
        "The protocol is packets: a frame with a checksum, a connect packet, identification reads, then rows of raster data encoded two ways depending on their content, a page end and an acknowledgement. All of that is testable without a printer, and it is. A simulated B1 Pro in the test helpers answers identification with the right model id, rejects the wrong one, checks the exact bytes of the print sequence, returns error codes, and can be powered off mid-job to prove the queue holds and then reprints after reconnect without doubling a label.",
        "Other suites cover the barcode encoder, template validation and the raster, the scanner service, the box-range parser, the router registry that detects a model from a serial, the template store's versions and import-export round trip, and a performance suite that prints a table of render time, raster bytes and packet counts per template. The Router page was also driven in a real headless Chrome with simulated scanner keystrokes.",
        {
          type: "callout",
          label: "What the fake proves",
          text: "The simulated printer proves our side is consistent with itself. Only real hardware proves the printer agrees. The protocol document tags every fact VERIFIED, REFERENCE or UNVERIFIED depending on whether it was confirmed from vendor files or on our own unit, reported by a project that validated it on a real B1 Pro, or transcribed from something that did not.",
        },
        "The protocol was written against the vendor's own device data file and two open-source Web Bluetooth projects that had validated their work on real printers. No code was copied; what was reused was the description of the behaviour.",
      ],
    },
    {
      heading: "A scanner is a keyboard that types very fast",
      body: [
        "A USB barcode scanner is a keyboard wedge: it types the serial into whatever field has focus and then sends Enter. So the scanner service listens to one input and treats a scan as complete on Enter. That was the design. Then, on the first day with a real scanner, six serials scanned in a row arrived in one value separated by spaces and were rejected as a single invalid serial. This scanner was not sending Enter.",
        "The service now completes a scan on any of: Enter or numpad Enter, Tab, a line break inserted as text by some wedge drivers, whitespace in the buffer, or 120 ms of silence after machine-speed typing where every key arrived under 40 ms apart. Serials never contain whitespace, so a buffer holding several is split into one scan per serial, in order. Human typing never qualifies for the idle rule, so nobody's half-typed value submits itself. A Scanner test page shows the raw keys a scanner sends, because the next scanner will be different again.",
      ],
    },
    {
      heading: "What the first real print measured",
      body: [
        "The router label is 132 row packets, about 10.8 kB, and renders in eight to ten milliseconds. The first hardware report showed about 2,294 ms to transfer it, and 1,320 ms of that was deliberate: a 10 ms sleep after each of the 132 packets, stacked on top of the write time. The pacer now keeps the same 10 ms minimum between writes without adding it to a write that already took longer. Faster settings exist, a smaller pace, fast writes, batching, and they stay off until a benchmark on the Hardware page shows ten good labels out of ten. No hardware speed improvement is claimed until that number exists.",
        "The other thing the first print taught: after each label the printer fed the paper out and pulled it back before the next, unlike the vendor app. The cause was one printer job per label. Continuous printing, sending waiting labels as one job, is now the default.",
        {
          type: "table",
          head: ["Checked on the real printer", "Status"],
          rows: [
            ["Connect, identify (model 4097, 300 dpi, 576-dot head)", "Verified"],
            ["One router label, full sequence with every acknowledgement", "Verified"],
            ["Label quality, copies, error codes, power-cycle recovery, speed benchmark", "Not yet done on hardware"],
          ],
          caption: "Status as of 24 September 2026. Software behaviour for every row is tested against the simulator.",
        },
      ],
    },
    {
      heading: "The boundary with RPOMS",
      body: [
        "Production RPOMS is untouched while this is validated. The integration boundary is two read-only data providers: given a serial, return the router's print data or a not-found result; given a box number, return the box. Not-found is a normal result, not an exception: the worker sees a message, nothing prints, and the scan field is ready again. Authentication, and who may edit templates, belongs to RPOMS, which is why the standalone app has no login and stays on an internal host until it is behind one.",
        "The whole thing is a few thousand lines of framework-free TypeScript plus a thin UI. If you are driving hardware from a browser, the two decisions I would repeat are keeping the protocol layer free of anything that knows what a label is, and writing down for every protocol fact where you learned it.",
        "The system it serves is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
