import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "barcode-scanner-web-app-scan-paste-and-beep",
  title: "Building a Web Screen Around a Barcode Scanner: Enter Keys, Excel Pastes and a Beep That Froze the Page",
  description:
    "How RPOMS's scan screens handle a barcode scanner: Enter-terminated scans, pasted Excel columns, one batched lookup, and a beep that no longer blocks.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Barcode Scanner", "Web Audio", "React", "Performance", "TypeScript", "Operations"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Barcode Scanner Web App: Scans, Pastes and Beeps",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "serial-number-model-detection-by-prefix-rules",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "why-internal-software-needs-good-ux",
    "delivery-module-scan-boxes-never-type-serials",
  ],
  sections: [
    {
      heading: "The problem: a screen driven by a scanner, not a mouse",
      body: [
        "The Registry and Pack screens in RPOMS, the operations system I built for a router-refurbishment line, are used with a handheld barcode scanner. The operator scans one router after another, sometimes hundreds in a session, and only looks at the screen when it makes a sound. That changes what the web page has to be good at: taking input fast, validating each scan immediately, and making a blocked scan impossible to miss.",
        "This article covers the parts of that which were not obvious: how a scanner actually delivers input, what happens when someone pastes a column from Excel instead, how to check many serials without many requests, and a beep that was freezing the page. It is for developers building scan-driven screens in the browser.",
      ],
    },
    {
      heading: "A scanner is a keyboard that presses Enter",
      body: [
        "A typical handheld scanner in keyboard mode acts as a keyboard. It types the characters of the barcode into whatever field has focus and then sends Enter. It never fires a paste event. So the scan field is an ordinary input, and a scan is complete when Enter arrives. The value is normalised the same way everywhere, removing any whitespace the scanner appends, before it is classified against the model detection rules described in [Detecting a Device Model From Its Serial Number](/blog/serial-number-model-detection-by-prefix-rules).",
        "The Registry has a Rapid mode for long sessions. Each scan is stacked below the field and checked on screen, but nothing is saved until the operator presses Finish, which sends the whole batch in one request. The operator gets per-scan feedback and the server gets one write.",
      ],
    },
    {
      heading: "Pasting a column from Excel",
      body: [
        "Operators also have lists of serials in spreadsheets, and they will paste a column into the scan field. The browser would put the whole clipboard into one input as a single long string. RPOMS handles that case separately, and only that case.",
        {
          type: "code",
          lang: "ts",
          code: `export function parseSerialPaste(text: string): string[] {
  return text
    .replace(ZERO_WIDTH, "")
    .split(/\\r\\n|\\r|\\n|\\t/)
    .map(normalizeSerial)
    .filter(Boolean);
}

export function classifyPaste(text: string): PasteKind {
  const serials = parseSerialPaste(text);
  if (serials.length < 2) return { kind: "single" };
  if (serials.length > MAX_PASTE_SERIALS) return { kind: "too-many", count: serials.length };
  return { kind: "batch", serials };
}`,
          caption: "src/lib/serial-paste.ts. MAX_PASTE_SERIALS is 100.",
        },
        "Excel separates rows with CRLF and cells with tabs, and ends a copy with a line break, so both are split and blanks are dropped. Zero-width characters are removed too. A paste of zero or one serial is left to the browser, so it behaves exactly like a scan. Two to 100 serials are judged by the same rules as a scan, in the same order: model detection, then duplicates against the registry, the current session and earlier in the same paste. The screen updates once instead of 100 times. More than 100 is refused outright with a message pointing to CSV import, which has the staged review a large list deserves.",
      ],
    },
    {
      heading: "One lookup for many serials",
      body: [
        "A pasted list, and any scans that could not be checked because the network dropped, need the registry's answer: is this serial already accepted, is it in a box? Asking one request per serial would mean 100 requests. Instead the list goes to the existing import route in a check-only mode, which answers the whole list with one statement on the serial key. Repeated serials are asked about once, and an empty list makes no request at all.",
        "The failure case matters as much as the success case. If the lookup does not come back, each affected serial is marked unchecked. It is never shown as not accepted, because that would tell the operator something false about a real router.",
      ],
    },
    {
      heading: "A scan cache that fits in the page",
      body: [
        "The Pack screen checks each scan instantly because the page arrives with a cache of every accepted router not yet in a box, which can be thousands of rows. As a list of `{ serial, model }` objects, every row repeated both key names and a model name shared by nearly every other row, which was most of the bytes. The cache now sends each model name once, and each serial points at its model by index.",
        {
          type: "code",
          lang: "ts",
          code: `export interface LooseCache {
  models: string[];   // each model name once
  serials: string[];
  modelOf: number[];  // index into models, one per serial
}`,
        },
        "The contents are exactly the same rows in the same order; only the encoding changed. On the client it is expanded into a Map from serial key to model.",
      ],
    },
    {
      heading: "The beep that froze the page",
      body: [
        "A blocked scan (a duplicate, an invalid serial or a full box) makes a short beep, because the operator is looking at the router, not the screen. The first version created a new `AudioContext` for every beep and closed it afterwards. Creating a context opens the audio device, and when the device had gone idle that was measured at over 200 ms of blocked main thread. A flagged scan could freeze the screen at exactly the moment the operator needed it to respond.",
        "Now there is one context for the whole page, created once and reused, so each beep only schedules an oscillator and a gain node. The context is opened on the page's first key press or pointer press, during idle time, so its one-time cost never lands on a beep. That first interaction also satisfies the browser's autoplay rule. Beeps less than 120 ms apart are merged, so a paste that flags several rows beeps once instead of stuttering.",
        {
          type: "code",
          lang: "ts",
          code: `export function beep(tone: BeepTone = SCAN_TONE): void {
  const now = performance.now();
  if (now - lastBeepAt < COLLAPSE_MS) return;
  lastBeepAt = now;
  const ctx = audioContext(); // shared, created once
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // ... connect, start, stop after tone.lengthMs, disconnect on end
}`,
          caption: "Simplified from src/lib/beep.ts.",
        },
        "Where audio is unavailable, the beep does nothing and the visual flag carries the message on its own.",
      ],
    },
    {
      heading: "Limits that protect the physical work",
      body: [
        "The Pack screen also enforces limits that exist because of the boxes, not the software. A paste must fit in what is left of the current box; it is never split across boxes and never starts the next one. Auto-close fires only when a box holds exactly its capacity, never below and never above, and only when nothing is still being checked. One packing session closes at most ten boxes. Each rule is a small pure function, so the screen, the route and the tests all ask the same question.",
        "Scan-driven screens are where the argument in [Why Internal Software Needs Good UX](/blog/why-internal-software-needs-good-ux) becomes concrete. The Registry and Pack modules are part of [RPOMS](/work/rpoms); they are complete, but held behind the production write lock while the programme works through sign-off.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
