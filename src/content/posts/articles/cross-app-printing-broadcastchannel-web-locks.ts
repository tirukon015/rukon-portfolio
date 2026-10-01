import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "cross-app-printing-broadcastchannel-web-locks",
  title: "Letting Another Web App Print Through an Open Tab: BroadcastChannel, Web Locks and COOP",
  description:
    "How a tiny relay page lets another web application print on a Bluetooth printer held by an already-open tab, with one tab answering via a Web Lock and the printer's real result reported back.",
  date: "2026-11-06",
  category: "Full-Stack Development",
  tags: ["BroadcastChannel", "Web Locks API", "Web Bluetooth", "COOP", "Browser APIs", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Cross-App Printing With BroadcastChannel and Web Locks",
  relatedProjects: ["rpoms-print-engine", "itms"],
  relatedPosts: [
    "adding-label-printing-to-a-nextjs-app-through-a-relay-page",
    "chrome-background-tab-timer-throttling-web-worker",
    "continuous-label-printing-page-counter-and-uncertain-jobs",
    "security-headers-for-a-web-bluetooth-pwa",
  ],
  sections: [
    {
      heading: "The problem: the printer belongs to one tab",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) drives a NIIMBOT label printer over Web Bluetooth from a browser tab. A Bluetooth connection in a browser belongs to the page that opened it. It cannot be shared with another page, and opening it needs the browser's device chooser and a click.",
        "Then a second application needed labels. BBTech's inventory system, [ITMS](/work/itms), a web app built by another developer, needed to print a QR label for a device from its own pages. The operator works in ITMS; the Print Engine sits in another tab with the printer connected. The question was how a page on one site gets a label printed by a tab of another site that already holds the connection, without a server in the middle and without a reload. This article is the answer I built, and it applies to any case where one tab owns a device or a session that other pages need to use.",
      ],
    },
    {
      heading: "Why the obvious approach opened a cold tab every time",
      body: [
        "The first integration was a link. The calling site opened a Print Engine URL with the label data in the query string, and the Print Engine page read it and printed. It worked, but every click opened a new tab: a cold start with no Bluetooth connection, where the label waited for someone to press Connect and pick the printer from the chooser.",
        "The reason is a security header. The Print Engine is served with `Cross-Origin-Opener-Policy: same-origin`. With that policy, a page from another origin that opens the Print Engine cannot keep a handle to the opened window, so it cannot find and reuse an existing tab, and it cannot `postMessage` into it. Loosening COOP would have fixed that and weakened the isolation of the page that holds the printer. I kept the header and moved the hand-off inside the Print Engine's own origin instead.",
      ],
    },
    {
      heading: "A relay page on the printer's own origin",
      body: [
        "The relay is a tiny static page, served by the Print Engine itself at its own path. The calling site opens it with the label data. Because the relay is same-origin with the Print Engine tab, the two can talk over a `BroadcastChannel`, which reaches every same-origin tab in the browser profile.",
        {
          type: "flow",
          steps: [
            "Calling site: window.open(relay page with the label data in the hash)",
            "Relay: post a print request with a random id on the BroadcastChannel",
            "Print Engine tab holding the Web Lock: validate, queue, print",
            "Print Engine: post progress, then the printer's actual result",
            "Relay: show the result; close itself when the printer confirmed",
          ],
          caption: "Nothing reloads and the Bluetooth connection is reused.",
        },
        "The label data goes in the URL hash rather than the query string. The hash never reaches the network or the service worker's request, so the cached relay page loads even when the workstation is offline. A query string also works online. The relay waits 1.5 seconds for any Print Engine tab to answer. If none does, no tab is open, and it falls back to the old behaviour of opening the full print page.",
      ],
    },
    {
      heading: "Exactly one tab answers: a Web Lock held for life",
      body: [
        "A BroadcastChannel message reaches every open Print Engine tab. If two tabs are open, both would queue the label, and it would print twice, or once on a tab with no printer. One tab has to answer.",
        "The Web Locks API gives a simple leader election. Every Print Engine tab requests the same named lock with a callback that never resolves. The first tab gets it and holds it for as long as it lives; every later tab waits in line. When the leader closes, the browser releases its lock and the next tab in line becomes the leader. Only the leader handles relay messages.",
        {
          type: "code",
          lang: "ts",
          code: "// Without the Locks API every tab answers; with it, only the lock holder does.\nthis.leader = !locks;\nif (locks) {\n  void locks.request(RELAY_LOCK, () => {\n    this.leader = true;\n    return new Promise(() => undefined); // held for the life of the tab\n  });\n}",
          caption: "From the relay listener. The oldest open tab is the one that answers.",
        },
        "Two small guards sit next to it. Each request carries a timestamp, and anything older than 15 seconds is ignored, so a tab waking from sleep does not replay a stale request. And each request id is remembered in a bounded set, so a message seen twice is handled once. The listener takes the channel and the locks object as injected interfaces, which is what lets its tests run in Node with fakes.",
      ],
    },
    {
      heading: "Report the printer's result, not \"queued\"",
      body: [
        "The first relay acknowledged as soon as the labels were queued. For the calling site that is the wrong answer. \"Queued\" does not mean printed, and an operator who sees a green tick walks away.",
        "The relay now follows its own jobs until the printer confirms or refuses each one, with a 60-second limit, and reports one of a few precise outcomes: printed; not printed; some printed and some not; not confirmed, meaning the printer had started and the label may or may not exist; or no confirmation within the time limit. These map directly onto the queue states described in [continuous printing with page counters](/blog/continuous-label-printing-page-counter-and-uncertain-jobs), where a job that failed after the printer accepted it is held for a person to check.",
        "One case needed a deliberate decision. If the link drops before the printer starts, a normal queue job waits and prints automatically once the printer is back. For a relayed request that would be a surprise: the calling site was told \"not printed\", and later a label appears anyway. So when the relay stops waiting, relayed jobs still waiting are discarded, and the caller can simply retry. The rule is that the answer the caller received stays true.",
        "The relay also refuses outright, without queueing, when no printer is connected, when it is still connecting, or when the queue is paused on a printer fault. \"Connect the printer, then print again\" is a better answer than a label queued behind a problem nobody is looking at.",
      ],
    },
    {
      heading: "Security choices",
      body: [
        {
          type: "list",
          items: [
            "Any web page can open a URL, so by default a relayed request only prepares the labels in the Print Engine tab and waits for one click on Print. Printing without a click is a setting an administrator has to turn on.",
            "The Print Engine tab must be signed in with access to the device-label module, which the server grants per user. Otherwise the relay is refused.",
            "The engine never generates or changes the values it prints. It checks they are present, printable and short enough for a label, and prints them exactly as received.",
            "Nothing crosses origins except one `window.open`. COOP stays `same-origin`.",
          ],
        },
        "One practical consequence showed up quickly: the Print Engine tab is now usually in the background while it prints, and Chrome throttles background timers. That slowed every label until the print-path waits moved into a Web Worker, described in [the background-tab throttling article](/blog/chrome-background-tab-timer-throttling-web-worker).",
      ],
    },
    {
      heading: "Status",
      body: [
        "The relay and the device-label module are deployed with the Print Engine and covered by tests: request parsing, leader handling, and result reporting against a fake queue. On the ITMS side, I built a small print service and print buttons on a branch of that repository. It has not been merged or deployed there yet.",
      ],
    },
  ],
};
