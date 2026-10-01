import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "continuous-label-printing-page-counter-and-uncertain-jobs",
  title: "Continuous Label Printing Without Duplicates: Page Counters and \"Uncertain\" Jobs",
  description:
    "Why one printer job per label made the paper feed and rewind, how multi-page jobs fixed it, and how a print queue decides between a safe retry and a label that may already exist.",
  date: "2026-10-06",
  category: "Building Real Systems",
  tags: ["Print queue", "Thermal printer", "Web Bluetooth", "Retry semantics", "Idempotency", "TypeScript"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Continuous Printing, Page Counters and Uncertain Jobs",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "niimbot-b1-pro-ble-protocol-print-sequence",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "cross-app-printing-broadcastchannel-web-locks",
    "instrumenting-a-web-bluetooth-print-pipeline",
  ],
  sections: [
    {
      heading: "Two problems with printing labels one job at a time",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) prints a label for every router a worker scans, on a NIIMBOT B1 Pro Bluetooth thermal printer. The first version sent every label as its own printer job. On the first day with the real printer, on 24 September 2026, two things were wrong with that.",
        "The visible one: after each label the printer fed the paper out and pulled it back before the next, which the vendor's app does not do. The invisible one: if the Bluetooth link dropped in the middle of a job, the queue had no way to know whether that label had come out. Retrying could print a duplicate. Not retrying could leave a router without a label. On a production line both are wrong, and the second is the kind of bug nobody notices until two boxes carry the same serial.",
        "This article is for anyone building a print queue in front of a real printer, especially one that reports progress through a counter rather than a clean \"done\" per label.",
      ],
    },
    {
      heading: "Why the paper fed and rewound",
      body: [
        "In the B1 Pro's protocol, a job starts with PrintStart and ends with PrintEnd, and PrintEnd feeds the finished label out to the tear bar. Start the next job and the printer pulls the paper back to the print position. One job per label meant one feed-and-rewind per label. It also meant each label paid the whole job setup (density, label type, PrintStart and the page size, about 378 ms in the first hardware timing) plus the end, and that the Bluetooth transfer of label B could not start until label A was fully printed.",
        "The protocol already had the answer. PrintStart carries the total number of pages. Within one job each page gets its own SetPageSize, its rows and its PageEnd, and only the last page is followed by PrintEnd. The fix was to match the device's own session model instead of tuning timings.",
        {
          type: "flow",
          steps: [
            "Queue: take the oldest waiting labels, up to 50",
            "PrintStart with the total label count",
            "Per page: SetPageSize, rows, PageEnd",
            "Stay at most two pages ahead of the printer's page counter",
            "Wait for the counter to reach the total",
            "One PrintEnd",
          ],
          caption: "Waiting labels go out as one continuous printer job.",
        },
        "The look-ahead is two pages. After sending page i, if there are pages further back that the printer has not printed yet, the adapter waits for the counter to reach page i minus two before sending more. The next label transfers while the previous one prints, but the printer's buffer never fills with a long batch that a failure would leave in an unknown state.",
        "Continuous printing became the default after that first day. It is tested against a simulated printer. Multi-page jobs on the B1 Pro are reference behaviour, validated on a real B1 Pro by one of the open-source projects I worked from, and the 10, 25, 50 and 100-label runs on my own unit are still to be recorded.",
      ],
    },
    {
      heading: "The page counter is the only proof that a label printed",
      body: [
        "PageEnd is acknowledged when the printer has buffered a page, not when it has printed it. What does track printing is the page counter in the PrintStatus reply. The adapter polls it every 40 ms and only sends PrintEnd once the count reaches the job total, because PrintEnd too early cuts the label.",
        "The first multi-page version still had a flaw. It completed every label in a batch only when the whole printer job finished. With 50 labels queued, all 50 showed \"Printing\" until the end. Worse, if the link dropped after label 30, labels 1 to 30 were treated as uncertain, although the printer's own counter had confirmed them.",
        "The adapter was polling the counter but not telling anyone. The fix was a progress callback from the adapter's status poll. The queue walks the batch in print order, adds up each job's copies, and marks a job printed as soon as the counter passes it:",
        {
          type: "code",
          lang: "ts",
          code: "const onProgress = (labelsPrinted: number) => {\n  let cumulative = 0;\n  for (const j of batch) {\n    cumulative += j.copies;\n    if (j.status === \"printing\" && cumulative <= labelsPrinted) {\n      j.status = \"printed\"; // confirmed by the printer's counter\n    }\n  }\n};",
          caption: "Simplified from PrintQueue.ts.",
        },
        "A test pins this: in a continuous batch, each label is completed as the printer's counter passes it, not when the batch ends.",
      ],
    },
    {
      heading: "Safe retry or \"Uncertain\": deciding from one bit",
      body: [
        "When a print fails, the question is whether anything could have come out. The adapter answers it with one flag on the error: `jobStarted`, set once the printer has acknowledged PrintStart. Along with it the error carries `labelsConfirmed`, the last page count the printer reported. The queue then sorts every label in the failed batch:",
        {
          type: "table",
          head: ["Situation", "Label becomes", "What happens next"],
          rows: [
            ["The counter had already passed this label", "printed", "Done. The printer confirmed it."],
            ["The failure came before PrintStart was accepted", "waiting", "Printed automatically when the printer is ready again. Nothing could have come out."],
            ["The job was invalid (bad copies, wrong size)", "failed", "A person fixes the input."],
            ["Anything else after PrintStart", "held (shown as Uncertain)", "A person looks at the printer and chooses Reprint or Discard."],
          ],
        },
        "Unknown errors take the worst case: if the error does not say whether the job started, the queue assumes it did. The rule the whole design protects is that the queue never duplicates a label on its own. An uncertain label waits for a person, who can see whether a label is sitting at the tear bar. The queue panel says it plainly: uncertain labels may or may not have printed, check the printer, nothing is reprinted automatically.",
        "One more distinction matters. A failure while the link is still up, such as the cover being open or the labels running out, pauses the whole queue until someone presses Resume, so the following labels are not sent into the same fault. A disconnect does not pause: the queue waits for the printer to be ready again and resumes by itself, with the held labels still held.",
      ],
    },
    {
      heading: "Statuses that mean exactly one thing",
      body: [
        "Every label outcome becomes one local history record, written only after the queue settles the job. That record is what later syncs to the server, so the statuses had to be unambiguous:",
        {
          type: "table",
          head: ["Status", "Meaning"],
          rows: [
            ["waiting", "In the local queue, not sent yet"],
            ["printing", "Sent to the printer, waiting for the page counter"],
            ["printed", "The printer's counter confirmed it"],
            ["failed", "Nothing reached the printer; kept for a person to reprint"],
            ["held", "Failed after PrintStart; may or may not have printed"],
            ["cancelled", "Discarded by a person; not recorded"],
          ],
        },
        "Nothing is ever marked printed without the printer confirming it. \"Sent\" is a claim about the software; \"printed\" has to be a claim about the label, and only the printer's counter can make it.",
      ],
    },
    {
      heading: "What carried over to other callers",
      body: [
        "The same semantics mattered again when other applications started printing through the engine: a caller has to be told \"printed\", \"not printed, safe to retry\" or \"may have printed, check\", never just \"queued\". The protocol side of this, including why PrintEnd is always sent even after a failure so the label is not left under the printhead, is in [the B1 Pro protocol article](/blog/niimbot-b1-pro-ble-protocol-print-sequence).",
        "If you are building something similar, the transferable parts are small: find the one signal the device gives you that means \"physically done\", expose it as progress rather than hiding it inside the driver, and record at the moment of failure whether the point of no return had been passed. Everything else follows from those two facts.",
      ],
    },
  ],
};
