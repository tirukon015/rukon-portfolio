import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "chrome-background-tab-timer-throttling-web-worker",
  title: "Chrome Throttled My Bluetooth Printer: Moving Timers Into a Web Worker",
  description:
    "Labels slowed from about 4 seconds to 13 or more whenever the print tab was in the background. The cause was Chrome's timer throttling; the fix was a tiny Web Worker that owns the waits.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Chrome", "Web Worker", "setTimeout", "Web Bluetooth", "Performance", "TypeScript"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Fixing Background-Tab Timer Throttling With a Web Worker",
  relatedProjects: ["rpoms-print-engine", "itms"],
  relatedPosts: [
    "cross-app-printing-broadcastchannel-web-locks",
    "niimbot-b1-pro-ble-protocol-print-sequence",
    "instrumenting-a-web-bluetooth-print-pipeline",
    "continuous-label-printing-page-counter-and-uncertain-jobs",
  ],
  sections: [
    {
      heading: "The symptom: printing was fast until the tab was hidden",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) is a browser app that drives a Bluetooth label printer. A label took about four seconds from scan to paper. Then other web applications started printing through it: the operator works in another site, which hands the label to the Print Engine tab that already holds the Bluetooth connection. That is how BBTech's inventory system, [ITMS](/work/itms), prints device labels through the engine. In that setup the Print Engine tab is almost always in the background.",
        "And in the background, labels took thirteen seconds or more. Same printer, same label, same code. Only the visibility of the tab had changed. If you have a browser app doing anything time-sensitive with hardware, and the user can switch tabs, this is for you.",
      ],
    },
    {
      heading: "Why a hidden tab slows a Bluetooth print",
      body: [
        "Chrome throttles timers in hidden tabs to save power. In a hidden tab, timer callbacks are batched to wake up at most about once per second, and after the tab has been hidden for a few minutes chained timers can be limited further, to about once per minute. For most pages that is invisible. For a printer driver it is fatal, because the print path is full of short waits:",
        {
          type: "table",
          head: ["Wait", "Length", "Why it exists"],
          rows: [
            ["Pacing between unacknowledged Bluetooth writes", "at least 10 ms", "The printer drops rows when writes arrive too fast"],
            ["Page-counter status poll", "40 ms", "Detect when the page has physically printed"],
            ["Pause before SetPageSize", "30 ms per page", "A protocol quirk both reference drivers keep"],
            ["Write retry when the buffer is full", "4 ms", "Only on transient write failures"],
            ["Reply timeouts", "hundreds of ms to seconds", "Upper bounds; raced against the reply"],
          ],
        },
        "A router label is 132 row packets. With each 10 ms pacing wait stretched towards a second, and every status poll stretched too, the arithmetic explains the symptom. Nothing was broken. Every wait was simply much longer than asked for. The waits are in the protocol for good reasons, covered in [the B1 Pro protocol article](/blog/niimbot-b1-pro-ble-protocol-print-sequence), so shortening or removing them was not an option.",
      ],
    },
    {
      heading: "The fix: a worker that only answers after ms",
      body: [
        "Dedicated Web Workers are not throttled the way a hidden page's main-thread timers are. So the waits moved into a worker. The worker is eight lines, and it does exactly one thing: receive an id and a duration, and post the id back when the duration has passed.",
        {
          type: "code",
          lang: "ts",
          code: "// timerWorker.ts: answers each { id, ms } after ms.\nconst scope = self as unknown as {\n  onmessage: ((e: MessageEvent<{ id: number; ms: number }>) => void) | null;\n  postMessage(m: number): void;\n};\nscope.onmessage = (e) => {\n  const { id, ms } = e.data;\n  setTimeout(() => scope.postMessage(id), ms);\n};",
        },
        "On the page side there is one `sleep(ms)` function that every wait on the print path now calls: the write pacer, the adapter's pauses and status polls, and the protocol layer's reply timeouts. It keeps a map of pending promises by id and resolves each one when the worker posts its id back.",
        {
          type: "code",
          lang: "ts",
          code: "export function sleep(ms: number): Promise<void> {\n  const w = timerWorker();\n  if (!w) return new Promise<void>((r) => setTimeout(r, ms));\n  return new Promise<void>((resolve) => {\n    const id = nextId++;\n    pending.set(id, { resolve, ms });\n    w.postMessage({ id, ms });\n  });\n}",
          caption: "From sleep.ts. The worker is created lazily on first use.",
        },
      ],
    },
    {
      heading: "The fallback must never shorten a wait",
      body: [
        "Two situations have no worker: the Node test environment, where there is no `Worker` or `document`, and a browser where the worker fails to start. In both, `sleep` falls back to a plain `setTimeout`. That keeps the tests that run the print path against a simulated printer unchanged.",
        "The subtle case is a worker that dies while waits are pending. The tempting shortcut is to resolve everything pending at once. That would send the next Bluetooth packets with no spacing at all, which is exactly what makes the printer drop rows. So the error handler re-schedules every pending wait with its original duration on the main thread, then uses `setTimeout` from then on:",
        {
          type: "code",
          lang: "ts",
          code: "w.onerror = () => {\n  worker = null;\n  for (const p of pending.values()) setTimeout(p.resolve, p.ms);\n  pending.clear();\n};",
        },
        "A slow label is a nuisance. A label with missing rows is a wrong label. When a fallback exists, it should fail in the slow direction.",
      ],
    },
    {
      heading: "The measurement",
      body: [
        "The change was measured with a direct test of the thing that was broken: fifty 10 ms waits in a hidden tab. With main-thread timers they took 49.5 seconds, almost exactly one second per wait. Through the worker they took 0.84 seconds. With the worker in place, labels printed from a background tab returned to about four seconds.",
        "No protocol wait, timeout, pacing value or retry was changed in the process. Only where the waiting happens changed. That was deliberate: the pacing values are tied to what the printer tolerates, and changing them belongs to a separate, measured benchmark on the hardware.",
      ],
    },
    {
      heading: "Where else this applies",
      body: [
        "Anything in a web page that has to keep a rhythm while the user looks elsewhere has this problem: device protocols over Web Bluetooth, Web Serial or WebUSB, polling loops that talk to local hardware, or pacing of any kind. The worker does not make the page do more work in the background. It only makes a short wait take as long as it says.",
        "Two notes if you copy the pattern. Keep the worker trivially small, since all it should own is time; the protocol logic stays on the page. And keep the waits that matter to the user interface, like toasts or debounce timers, on normal timers. Only the waits on the hardware path need to be accurate while hidden.",
        "The cross-application setup that exposed the problem is the subject of a separate write-up on the relay page, and the queue behaviour it relies on is in [continuous label printing with page counters](/blog/continuous-label-printing-page-counter-and-uncertain-jobs).",
      ],
    },
  ],
};
