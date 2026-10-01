import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "instrumenting-a-web-bluetooth-print-pipeline",
  title: "Where Does a 4-Second Label Go? Instrumenting a Scan-to-Print Pipeline",
  description:
    "Stage-by-stage tracing of a Web Bluetooth label print, an audit of every sleep in the code, and the rule of not claiming a speed-up until the hardware has measured it.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Performance", "Tracing", "Web Bluetooth", "Thermal printer", "Profiling", "TypeScript"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Profiling a Web Bluetooth Print Pipeline Stage by Stage",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "benchmark-regression-gate-medians-noise-floor",
    "chrome-background-tab-timer-throttling-web-worker",
    "niimbot-b1-pro-ble-protocol-print-sequence",
    "printing-labels-from-the-browser-over-web-bluetooth",
  ],
  sections: [
    {
      heading: "\"It feels slow\" is not a measurement",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) prints a label on a NIIMBOT B1 Pro over Web Bluetooth each time a router is scanned. The first real print, on 24 September 2026, took about four seconds end to end. The question after that was the usual one: where do the four seconds go, and which part of them is ours to fix?",
        "This article is about answering that without guessing, for anyone tuning a pipeline that ends in hardware: give every stage a timestamp, split every number that hides two things, list every deliberate wait with its reason, and refuse to claim an improvement the hardware has not confirmed.",
      ],
    },
    {
      heading: "A trace event for every stage",
      body: [
        "Every stage from scan to paper records a named event into a fixed-size ring buffer, with a `performance.now()` timestamp, the label it belongs to and a small detail object such as a packet count or a page number:",
        {
          type: "flow",
          steps: [
            "SCAN_RECEIVED, ENTER_RECEIVED, SCAN_COMPLETE",
            "DETECTION_START, DETECTION_END, TEMPLATE_RESOLUTION",
            "RENDER_START, RENDER_END",
            "QUEUE_INSERT, QUEUE_START",
            "BLE_WRITE_START, PACKET_TRANSFER, ACK",
            "PRINTER_PROCESSING, STATUS",
            "PRINT_COMPLETE or PRINT_FAILED",
          ],
        },
        "Recording is a few object allocations per label and never awaits, so it cannot slow the path it measures. Nothing is written to the console. The diagnostics screen reads the buffer and derives timings per label: scan to job, detection, template, render, queue wait, printer setup, transfer, acknowledgement and printing. The Router page and the device-label module's Print Jobs page show the timing of the last label, and a continuous print test aggregates them across 10, 25, 50 or 100 labels.",
        "One bug in the measurement itself turned up later. For the device-label module, the timer started when a job entered the queue, which quietly hid the render time. It now starts at the scan, like everything else. Measure from the event the user experiences, not from the point where your code first sees the job.",
      ],
    },
    {
      heading: "Splitting the number that hid two things",
      body: [
        "The first hardware report broke the four seconds down like this:",
        {
          type: "table",
          head: ["Phase", "Time"],
          rows: [
            ["Setup: density, label type, PrintStart, page size", "about 378 ms"],
            ["Transfer: 132 row packets plus the PageEnd acknowledgement", "about 2,294 ms"],
            ["Printer printing, confirmed by its page counter", "about 1,586 ms"],
            ["PrintEnd", "about 96 ms"],
          ],
          caption: "Router label, first real print, 24 September 2026.",
        },
        "\"Transfer\" was two different things added together: our Bluetooth writes, and the time the printer took to acknowledge the end of the page. Those have different owners. One is our pacing, the other is the printer's buffering. With them merged, any optimisation of the transfer number would have been guesswork. So the adapter now records row-write time and PageEnd-acknowledgement time separately, and setup is split per command, so the next slow command is visible by name.",
        "The split also exposed the biggest item we control. The pacing slept 10 ms after every packet, on top of the time the write itself took: 132 × 10 ms is 1,320 ms of deliberate idle time inside that 2,294. The pacer now keeps the same 10 ms minimum measured from the start of one write to the start of the next, so time already spent inside the write counts towards the gap. The printer still never receives packets closer than 10 ms apart.",
      ],
    },
    {
      heading: "An audit of every wait in the code",
      body: [
        "Before changing any timing, I listed every `setTimeout`, `setInterval`, sleep, delay and poll in the source and wrote down why each exists. Most stayed, and the table explains why.",
        {
          type: "table",
          head: ["Wait", "Value", "Verdict"],
          rows: [
            ["Between unacknowledged writes", "10 ms, start to start", "Keep as default; faster modes only in per-run benchmarks"],
            ["After the connect packet", "200 ms once per connection", "Keep; never per label"],
            ["Before SetPageSize", "30 ms per page", "Keep; protocol quirk from both references, under 1% of a label"],
            ["Page-counter poll gap", "40 ms (was 150 ms)", "Reduced: it only bounds how late we notice a finished page"],
            ["Write retry when the buffer is full", "4 ms, up to 30 times", "Keep; runs only on failure"],
            ["Protocol reply timeouts", "600 to 10,000 ms", "Keep; upper bounds, never slept to completion"],
            ["Scanner idle completion", "120 ms", "Keep; a fallback for scanners that send no Enter"],
          ],
        },
        "The conclusion was useful precisely because it was boring. Apart from the packet spacing and the poll gap, nothing on the print path sleeps for a fixed time except what the protocol needs. Five days later the same list made a different problem easy to diagnose: when a background tab made every one of those waits take up to a second, it was obvious which code to move, as described in [the background-tab throttling article](/blog/chrome-background-tab-timer-throttling-web-worker).",
      ],
    },
    {
      heading: "Two problems the audit found that were not about speed",
      body: [
        "The diagnostics log re-rendered on every Bluetooth frame. Status polls run every 40 ms, so during a print a 2,000-line list was re-rendering around 50 times a second. The React hook that reads the log now coalesces notifications to one render per 120 ms. The worker-facing pages never subscribe to the log at all.",
        "Choosing the same printer again in the device chooser added a second `gattserverdisconnected` listener, so a later link loss was handled twice. The listener is now removed before it is added. Neither of these shows up in a stage timing; both showed up from reading every owner of a resource while looking for waits.",
      ],
    },
    {
      heading: "Software cost versus physics",
      body: [
        "Against the simulated printer, the software side of a device label costs very little: 0.1 to 0.3 ms in the scan handler, so the scan field is free again at once; about 7 to 12 ms to render and rasterise, about 40 ms for the first render of a session, which is why templates are warmed at start-up; nothing between the queue and the printer starting; and about 4 ms for the loop that produces its 179 row packets.",
        "On the real printer, the time is protocol and hardware. With packets at least 10 ms apart, 179 packets need at least 1.8 seconds of transfer, and the printer then needs its own time to print. The largest software-controlled item was the packet spacing. The largest item overall is the printer itself. Continuous printing, sending waiting labels as one job, removes the per-label setup and end, about 470 ms, and lets the next label transfer while the previous one prints.",
      ],
    },
    {
      heading: "No speed claim without the hardware",
      body: [
        "Faster settings exist in the code: a 5 ms pace, unpaced writes, batched jobs. They are selectable for one benchmark run at a time on the Hardware test page and stay off by default. The rule is that a setting becomes the default only after a run of ten labels on the real printer comes out complete, sharp and scannable, ten out of ten. That run has not been recorded yet, so no hardware speed-up is claimed beyond the first measured label.",
        "The software side has its own guard: a baseline-versus-current benchmark against the simulator, described in [a performance gate that stopped crying wolf](/blog/benchmark-regression-gate-medians-noise-floor). The two measure different things and neither stands in for the other.",
      ],
    },
  ],
};
