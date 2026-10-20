import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "sending-labels-between-browser-tabs-broadcastchannel-coop-window-opener",
  title: "Sending Labels From One Web App to Another Tab: BroadcastChannel, COOP and window.opener",
  description:
    "How RPOMS sends a router label to the Print Engine tab that holds the Bluetooth printer: why a hidden iframe could never work across sites, why one header had to be removed from one path, and what a lost answer must say.",
  date: "2026-10-20",
  category: "Full-Stack Development",
  tags: ["BroadcastChannel", "Cross-Origin-Opener-Policy", "window.opener", "Web Bluetooth", "postMessage", "Browser Security"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "BroadcastChannel Across Sites, COOP and window.opener: Linking Two Web Apps to One Printer",
  relatedProjects: ["rpoms-print-engine", "rpoms"],
  relatedPosts: [
    "adding-label-printing-to-a-nextjs-app-through-a-relay-page",
    "refusing-runtime-ddl-on-production-schema-stamps-and-a-gate",
    "one-live-record-per-router-per-session-partial-unique-index",
  ],
  sections: [
    {
      heading: "Two apps, one printer, one tab that owns it",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) drives a NIIMBOT B1 Pro over Web Bluetooth. A Bluetooth session belongs to exactly one browser tab, so the tab that connected the printer is the only one that can print. [RPOMS](/work/rpoms) runs on a different site, rpoms.bbtech.com.my, and its new Printing page needs a label printed after every saved scan. RPOMS must therefore hand each label to the Print Engine tab that holds the printer, and get a truthful answer back.",
        "The Print Engine already had a relay for BBTech's inventory system: a small page on the engine's origin that posts the request on a BroadcastChannel, and the open engine tab answers. The RPOMS link follows the same shape with a stricter protocol, and building it taught three things about how browsers partition and isolate pages.",
      ],
    },
    {
      heading: "Why a hidden iframe can never reach the tab",
      body: [
        "The obvious design was a hidden iframe of the Print Engine inside the RPOMS page, so RPOMS could post to it and the frame could broadcast to the engine tab. It cannot work across sites. Chrome, Firefox and Safari partition BroadcastChannel by top-level site: a frame of print.rukon.dev embedded in rpoms.bbtech.com.my gets its own empty channel and never reaches a print.rukon.dev tab. The Storage Access API does not change that; Chrome can report storage access granted for cookies while the channel stays partitioned.",
        "A frame only works when both apps are the same site, and com.my is a public suffix, so print.rpoms.bbtech.com.my under rpoms.bbtech.com.my would qualify while print.rukon.dev never will. The hosting for that is written (an nginx snippet with a frame-ancestors list and no X-Frame-Options), but it is not deployed, so the frame is disabled. When a frame does load cross-site anyway, the link page compares origins, opens no channel, and answers every print with ok false and reason embedded. Nothing prints silently.",
      ],
    },
    {
      heading: "The window form, and the header that breaks it",
      body: [
        "The supported form is a window. RPOMS opens the engine's link page with window.open and keeps it open. That page is a top-level document on the Print Engine's own origin, so it is first-party: it shares the engine tab's storage partition and BroadcastChannel whatever site RPOMS is on. Messages flow RPOMS to link over postMessage, link to engine tab over the channel, and back.",
        "The first live test on 19 October printed nothing and showed Open this from RPOMS. The cause was Cross-Origin-Opener-Policy same-origin, a hardening header the engine sends on every page. A document with that policy opened by another origin is put in a new browsing-context group, and its window.opener becomes null, so the link can never answer RPOMS. The fix was to serve the link page, and later the tab entry path, with the app's headers minus COOP, while every other path keeps it. Framing stays forbidden on that page and the content security policy is unchanged; the one thing given up is opener isolation on a page that holds no session data and prints nothing itself.",
        {
          type: "callout",
          label: "Checked, not assumed",
          text: "RPOMS must not open the window with noopener, and RPOMS's own page must not send COOP same-origin either (same-origin-allow-popups is fine). The service worker never answers the link path, so the tab always gets its headers from nginx and never a cached shell with COOP.",
        },
      ],
    },
    {
      heading: "From a link window to the engine tab itself",
      body: [
        "The window form worked but opened a short-lived page per session. The next step let the Print Engine tab that RPOMS opened answer RPOMS directly: the Print Engine button opens the engine as a normal tab at a dedicated entry path, or finds the tab it opened before without reloading it. That tab speaks the link protocol through window.opener and passes each label on the router relay channel to whichever tab holds the printer. It says ready on start and whenever the operator leaves it, so a reloaded RPOMS page finds it again.",
        "Review of the first version found four defects worth recording. Vercel preview hostnames had been accepted as origins, and Vercel hostnames are first come, first served, so a pattern like that could match anyone's page; production now accepts rpoms.bbtech.com.my and its subdomains only, and loopback origins only when the engine itself is served from loopback. COOP had been dropped everywhere; it is back on every path except the tab entry. Lifecycle handling allowed overlapping pings; now one ping runs at a time, every timer is cleared on close, and on pagehide each label still waiting is answered not confirmed and RPOMS is told no engine is linked. And the tab link became its own chunk, loaded only when the tab has an opener at the entry path: 201 bytes raw added to the initial load instead of 3,334.",
      ],
    },
    {
      heading: "What a lost answer is allowed to say",
      body: [
        "The protocol's hardest rule is about silence. RPOMS sends the label as soon as its own save answers, and the engine's reply may never arrive: the tab may be closing, the printer may be mid-job, the link may have moved to another tab. RPOMS's earlier behaviour marked such a scan not saved, which was false, because the save had already committed. A lost answer is now status unknown, and a late answer from an engine tab the page linked to earlier still reaches its label even after another tab has become the link.",
        "Reprints follow the same honesty. RPOMS's Print again sends a reprint flag that lets the same scan be sent twice, but it never overrides the engine's own duplicate policy, because the link cannot authenticate who is asking. Under a block policy the label waits on the engine's Router page with a note saying RPOMS asked, and RPOMS is told the reprint waits in the Print Engine. It prints only when the operator presses Print there.",
        {
          type: "list",
          items: [
            "BroadcastChannel is partitioned by top-level site; a cross-site frame has an empty channel.",
            "COOP same-origin severs window.opener; remove it only on the one path that must answer an opener.",
            "Accept exact origins, never a pattern over a shared hosting domain.",
            "A lost answer is unknown, never not saved and never printed.",
          ],
        },
      ],
    },
  ],
};
