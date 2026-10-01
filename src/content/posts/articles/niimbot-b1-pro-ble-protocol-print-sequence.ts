import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "niimbot-b1-pro-ble-protocol-print-sequence",
  title: "The NIIMBOT B1 Pro Bluetooth Protocol, Packet by Packet",
  description:
    "The frame format, checksum, connect packet, identification reads and the full V4 print sequence I use to drive a NIIMBOT B1 Pro over Web Bluetooth, with what is verified and what is not.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["NIIMBOT", "Bluetooth Low Energy", "Web Bluetooth", "Protocol", "Thermal printer", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "NIIMBOT B1 Pro BLE Protocol: Frames and Print Sequence",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "printing-labels-from-the-browser-over-web-bluetooth",
    "rendering-labels-for-a-576-dot-thermal-printhead",
    "continuous-label-printing-page-counter-and-uncertain-jobs",
    "instrumenting-a-web-bluetooth-print-pipeline",
  ],
  sections: [
    {
      heading: "Who this is for",
      body: [
        "This is the protocol reference I wish I had when I started driving a NIIMBOT B1 Pro, a 300 dpi Bluetooth thermal label printer, directly from a browser for the [RPOMS Print Engine](/work/rpoms-print-engine). NIIMBOT does not publish the protocol. What exists is the vendor's own app and a few open-source projects that reverse-engineered it. If you want to print to a B1 Pro from your own code, over Web Bluetooth or any other BLE stack, this page lists the bytes that go over the air and the order they have to go in.",
        "The overall architecture, the scanner workflow and the test setup are in the earlier article, [Printing Labels From the Browser Over Web Bluetooth](/blog/printing-labels-from-the-browser-over-web-bluetooth). This one only covers the wire.",
        {
          type: "callout",
          label: "How much of this is proven",
          text: "Every fact in my protocol notes carries a tag. VERIFIED means confirmed from the vendor's own device data file or on my own printer. REFERENCE means a reference project reports validating it on a real B1 Pro, but I have not confirmed it on mine. UNVERIFIED means it was transcribed from a source that did not test it on this model. On 24 September 2026 my B1 Pro connected, identified itself and completed one router label with every acknowledgement. Error codes, printer-side copies and multi-page jobs on my unit are still open.",
        },
        "The sources were the device data file shipped inside the NIIMBOT Windows app (model ids, resolution, density range, paper types), plus two MIT-licensed projects: iscarelli/niimbot-web-bluetooth, which was validated on a real B1 Pro, and MultiMote/niimbluelib, the TypeScript library behind niim.blue. I copied no code from them. I wrote my implementation from the behaviour they describe.",
      ],
    },
    {
      heading: "Transport: one GATT characteristic, filtered by name",
      body: [
        "The printer exposes a single custom service and a single characteristic that you both write to and subscribe to for notifications. On my unit these were:",
        {
          type: "table",
          head: ["Item", "Value", "Tag"],
          rows: [
            ["Service", "e7810a71-73ae-499d-8c15-faa9aef0c3f2", "Verified"],
            ["Characteristic", "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f", "Verified"],
            ["Properties", "notify + write without response", "Reference"],
            ["Advertised service?", "No: filter the chooser by name prefix, not service", "Reference"],
            ["Name prefix", "B1 (shared with the B1 and B1 SE)", "Verified"],
          ],
        },
        "That last row matters. The plain B1 (model id 4096, 203 dpi) advertises under the same name prefix, so a name can never tell you that you are talking to a B1 Pro. My adapter reads the model id after connecting and refuses anything that is not 4097, with an error naming what it actually found. Sending a 300 dpi raster to a 203 dpi printer does not fail loudly. You just get a wrong label.",
      ],
    },
    {
      heading: "The frame format and checksum",
      body: [
        "Every command and every reply is a frame: two `0x55` bytes, a command byte, a length byte, the payload, a one-byte XOR checksum and two `0xAA` bytes. The checksum is the command XOR the length XOR every payload byte. Both reference projects agree on this.",
        {
          type: "code",
          lang: "ts",
          code: "export function packFrame(cmd: number, data: ArrayLike<number> = []): Uint8Array {\n  const len = data.length;\n  if (len > 255) throw new Error(`payload too long: ${len} bytes`);\n  const out = new Uint8Array(7 + len);\n  out[0] = 0x55; out[1] = 0x55; out[2] = cmd; out[3] = len;\n  let checksum = cmd ^ len;\n  for (let i = 0; i < len; i++) { out[4 + i] = data[i]; checksum ^= data[i]; }\n  out[4 + len] = checksum & 0xff;\n  out[5 + len] = 0xaa; out[6 + len] = 0xaa;\n  return out;\n}",
          caption: "From the print engine's frame.ts. The length is one byte, so a payload can never exceed 255 bytes.",
        },
        "Receiving is less tidy than sending. A single BLE notification can hold several frames, a frame can be split across two notifications, and there can be stray bytes in front. My parser keeps a buffer, scans for `55 55`, waits until the declared length has arrived, then checks the checksum and the `AA AA` trailer. A bad frame is reported and the parser moves forward one byte and resynchronises on the next `55 55` rather than throwing the buffer away.",
        "The one exception to the frame format is the connect packet, which is a raw `0x03` byte followed by a normal frame for command `0xC1` with payload `01`: `03 55 55 C1 01 01 C1 AA AA`. The printer may or may not answer it, so the adapter waits 200 ms once per connection before it starts identification. That wait is per session, never per label.",
      ],
    },
    {
      heading: "Identifying the printer",
      body: [
        "After connecting, these reads establish what is on the other end:",
        {
          type: "table",
          head: ["Request", "Reply", "Payload", "Purpose"],
          rows: [
            ["0xA5", "0xB5", "01", "Status data; protocol version from bytes 11 and 12"],
            ["0x40", "0x40 + sub", "08", "Model id, u16 big-endian (4097 = B1 Pro)"],
            ["0x40", "0x40 + sub", "09 / 0C / 0B", "Firmware, hardware version, serial"],
            ["0xDC", "0xDE", "03", "Capabilities; bytes 4-5 are the printhead width"],
          ],
        },
        "The printhead width is worth reading live. The niimbluelib model table lists 567 dots for the B1 Pro, while the iscarelli project read 576 from the capabilities reply and confirmed that columns at or beyond 576 do not print. My profile uses 576 and logs a warning if the printer reports something else. The identification reads themselves (model 4097, firmware and hardware versions) were confirmed on my printer. Whether the 576 on screen came from the printer or from the profile default was not recorded, so that value stays tagged Reference.",
      ],
    },
    {
      heading: "The V4 print sequence for one label",
      body: [
        "This is the order that completed an acknowledged label on my printer. Each request waits for its specific reply command, with a timeout, except the ones marked one-way.",
        {
          type: "flow",
          steps: [
            "SetDensity 0x21 [1-5] -> 0x31",
            "SetLabelType 0x23 [1 = gaps] -> 0x33",
            "PrintStart 0x01, 9 bytes: pages u16, four zeros, page colour 0, speed, 0 -> 0x02",
            "PrintStatus 0xA3 one-way, then wait 30 ms",
            "SetPageSize 0x13, 13 bytes: rows u16, columns u16, copies u16, seven zeros -> 0x14",
            "Image rows as 0x84 / 0x85 packets, no acknowledgement",
            "PageEnd 0xE3 [01] -> 0xE4",
            "Poll PrintStatus 0xA3 -> 0xB3 until the page counter reaches the total",
            "PrintEnd 0xF3 [01] -> 0xF4",
          ],
          caption: "One 50 x 30 mm label: 354 rows by 576 columns.",
        },
        "Three details here cost the most time in the reference projects and are easy to get wrong.",
        "First, the one-way PrintStatus and the 30 ms pause before SetPageSize. Both references do it and neither explains it. I kept it and tagged it as a reference quirk. At 30 ms per label it is under one percent of a print.",
        "Second, the page-counter poll before PrintEnd. PageEnd is acknowledged when the printer has buffered the page, not when it has printed it. PrintEnd feeds the label out, so sending it as soon as PageEnd is acknowledged cuts the label short. The adapter polls PrintStatus every 40 ms. The reply carries the page number as a u16 plus print and feed percentages, and the adapter only sends PrintEnd once the page count reaches the number of labels in the job.",
        "Third, failure handling. If anything fails after PrintStart was accepted, the adapter still tries to send PrintEnd so the label is not left half under the printhead, then rethrows. The error records whether PrintStart had been accepted, which the queue uses to decide whether a retry is safe. That distinction, between a failure that is safe to retry and one where a label may already exist, is what keeps the queue from ever printing a duplicate on its own.",
      ],
    },
    {
      heading: "Row packets: 0x84 for blank, 0x85 for dots",
      body: [
        "Image data goes one printer row at a time, with no acknowledgement per packet. A row on the B1 Pro is 576 dots, packed MSB-first into 72 bytes, with 1 meaning black. Two commands carry rows, and both let one packet stand for up to 200 identical consecutive rows:",
        {
          type: "code",
          lang: "text",
          code: "0x84  [row_hi, row_lo, repeat]                                  blank rows\n0x85  [row_hi, row_lo, 0, total_lo, total_hi, repeat, ...72 bytes]  rows with dots\n\ntotal = number of black dots in the row (note: little-endian, unlike the row index)",
        },
        "A full row packet is 72 + 6 bytes of payload plus 7 bytes of framing, well inside the 255-byte payload limit. The iscarelli project verified the dot-count variant byte for byte against niim.blue's output. Collapsing identical rows is what keeps the packet count down: the router label compresses to 132 packets. How the raster is produced and why some label designs need far more packets is covered in [rasterising labels for a 576-dot printhead](/blog/rendering-labels-for-a-576-dot-thermal-printhead).",
        "Since there is no per-packet acknowledgement, pacing is the only flow control. Writes without response that arrive too fast can be dropped, and the reference reports that the B1 Pro garbles several frames bundled into one write. My transport keeps unacknowledged writes at least 10 ms apart, measured from the start of one write to the start of the next, and never bundles frames. After PageEnd the adapter compares the highest row the printer reported receiving (where the model sends that counter) with the page height, and fails the page with a clear message if rows are missing.",
      ],
    },
    {
      heading: "Status, errors and disconnects",
      body: [
        "A heartbeat request, `0xDC [04]`, answers with `0xD9` and a 13-byte payload on the B1 Pro. The reference captured it with controlled changes: byte 2 is battery percent, byte 4 is the lid (0 = closed), byte 5 is paper (0 = inserted). Byte 1 behaves like a counter; the reference explicitly refuted reading it as an error code. I decode these only when the model is 4097 and the payload is exactly 13 bytes, and otherwise show the raw bytes as unknown. Status is advisory. It never blocks a print, because the printer's own error reply is authoritative.",
        "Errors arrive either as an unsolicited `0xDB [code]` or as a non-zero byte 6 in a 10-byte PrintStatus reply. The codes I map to worker messages are cover open (0x01), out of labels (0x02), battery low (0x03), data rejected (0x06), overheated (0x07), feed problem (0x08) and busy (0x09). All of them are still Unverified on the B1 Pro. The plan is to open the lid and run out of labels during a print on the Hardware test page and record what actually comes back.",
        "A dropped link shows up as `gattserverdisconnected`. An in-flight job fails immediately with \"Printer disconnected during printing\" rather than waiting for a timeout. Reconnecting reuses the same `BluetoothDevice` object, so there is no chooser as long as the tab stays open. After a page reload, the browser insists on the chooser again.",
      ],
    },
    {
      heading: "What I would tell someone starting",
      body: [
        "Identify by model id, never by name. Wait for the page counter before PrintEnd. Keep the protocol layer ignorant of labels, templates and scanners, so the whole sequence can be tested against a simulated printer that checks the exact bytes. And write down, next to every constant, where you learned it and whether you have seen it work on your own hardware. That record was more useful than any single fix, because it told me which facts to test first when the printer arrived.",
        "The engine this came from, including its test suite and deployment, is described in the [RPOMS Print Engine case study](/work/rpoms-print-engine).",
      ],
    },
  ],
};
