import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
  title: "Proving a PWA Boots Offline: A Headless Chrome Test Over the DevTools Protocol",
  description:
    "An automated test that installs a PWA under production headers, cuts the network at the protocol level, reloads, and checks the app still works, with no test framework beyond a WebSocket.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PWA", "Chrome DevTools Protocol", "Offline", "Testing", "Service worker", "CI"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Automated PWA Offline Test With Chrome DevTools Protocol",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "workbox-conflicting-precache-entries-empty-cache",
    "security-headers-for-a-web-bluetooth-pwa",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "local-first-sync-conflict-policy-offline-pwa",
  ],
  sections: [
    {
      heading: "Why offline needs its own test",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) is a label-printing workstation for a production line, and the line cannot stop because the internet does. The requirement was that a workstation, once opened online, boots and prints from cache and local data with the network unplugged. Unit tests can prove that the print path makes no network request. They cannot prove that a real browser will load the app with no network, because that depends on the service worker, the cache, the build and the response headers all working together.",
        "The first offline run showed why this needs automating. The service worker registered and the app looked installed, but the cache was empty and an offline reload showed the browser's error page. The cause is in [the Workbox duplicate-entry article](/blog/workbox-conflicting-precache-entries-empty-cache). After that I wanted a test that fails loudly the next time. This article describes it: a single Node script, no Playwright, that talks to a headless Chromium browser over the DevTools protocol.",
      ],
    },
    {
      heading: "Serve the build the way production does",
      body: [
        "A test against `vite preview` would test the wrong thing. Production serves the app through nginx with a strict Content Security Policy, a Permissions-Policy that allows Bluetooth for the app's own origin only, and cache headers that decide whether a stale service worker survives. So the test starts a small Node static server that serves the built `dist/` with exactly the production headers.",
        "Those headers are defined once, in a module that both the static server and a unit test import. The unit test reads the nginx site file and its header snippet and fails unless every header appears in both, verbatim, with the module's value. So the offline test runs against the same policy nginx sends, and a header change cannot slip into one place and not the other.",
        {
          type: "flow",
          steps: [
            "Build the app",
            "Start the static server with production headers",
            "Launch headless Chromium with a remote-debugging port and a fresh profile",
            "Connect a WebSocket to the page target",
            "Run the steps; collect console, exception and CSP log entries throughout",
          ],
        },
        "The script prefers Brave when it is installed, because Brave is the browser the workstations use, and falls back to Chrome, Chromium or Edge. In CI it runs under headless Chromium as the step called \"Production headers and offline boot\".",
      ],
    },
    {
      heading: "Talking to the browser without a framework",
      body: [
        "The DevTools protocol is JSON over a WebSocket. Every command has an id, and the reply carries the same id. Events arrive on the same socket without one. A promise map by id is all the plumbing needed:",
        {
          type: "code",
          lang: "js",
          code: "const send = (method, params = {}) => new Promise((res, rej) => {\n  const i = ++id;\n  pending.set(i, { res, rej });\n  ws.send(JSON.stringify({ id: i, method, params }));\n});\n\nconst evaluate = async (expression) => {\n  const r = await send(\"Runtime.evaluate\", { expression, awaitPromise: true, returnByValue: true });\n  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));\n  return r.result.value;\n};",
          caption: "From tools/offline-check.mjs.",
        },
        "The message handler resolves pending commands and also watches three event streams for the whole run: log entries that mention the Content Security Policy, uncaught exceptions, and `console.error` calls. Any of those at the end fails the test, even if every functional step passed.",
      ],
    },
    {
      heading: "The steps, in order",
      body: [
        {
          type: "list",
          ordered: true,
          items: [
            "Fetch the app shell and check every production header is present, and that `sw.js` is served with `Cache-Control: no-cache`.",
            "Load the app online. Check it is a secure context with the service worker API.",
            "Wait for an active service worker registration, polling for up to ten seconds.",
            "Open every cache and count entries; require `index.html` and the label logo to be cached.",
            "Check the local IndexedDB database exists, that no Bluetooth chooser opened on load, and that the scan field is shown.",
            "Cut the network with `Network.emulateNetworkConditions` set to offline, then reload.",
            "Check the Router page boots with its scan field and the offline indicator shows.",
            "Open the template page and read the preview canvas's pixels: the frozen router label must render from cached assets with real ink on it.",
            "Check no network fetch failed while offline, and the System panel reports \"Offline Ready: YES\".",
            "Go back online, open another page, and require zero CSP violations and zero uncaught errors for the whole run.",
          ],
        },
        "Two of these are worth explaining. Cutting the network through the protocol, rather than stopping the static server, means the browser genuinely believes it is offline: `navigator.onLine` turns false and every request fails as it would with a cable pulled. And the pixel check on step 8 is what proves the fonts and logo came from cache. A page can boot offline and still draw a label with missing images. Counting dark pixels on the canvas catches that. The Brave run recorded 31,289 black dots.",
      ],
    },
    {
      heading: "What it has caught",
      body: [
        "The first version of the test found the empty precache. The version that runs under production headers found something else on its first run: eight fonts had been inlined into the bundle as `data:` URLs, and the production policy, `font-src 'self'`, blocked every one of them. A development server with no policy would never have shown it. On a label printer it matters, because the renderer draws label text with bundled fonts so every workstation produces the same raster. Fonts are now always emitted as files.",
        {
          type: "table",
          head: ["Run", "Browser", "Precached entries", "Result"],
          rows: [
            ["25 Sep 2026", "headless Chrome", "95", "All steps pass"],
            ["27 Sep 2026", "headless Brave, production headers", "103", "All steps pass; no CSP violation after the font fix"],
          ],
        },
      ],
    },
    {
      heading: "What it does not prove",
      body: [
        "The test proves the app boots and renders offline. It does not print, because there is no printer in CI or on the machine that ran it. A separate unit test replaces `fetch` with a function that records calls and rejects, then runs scans all the way through a simulated printer and requires the call list to be empty. That proves the print path makes no network request. A physical offline run, scanning real routers on a workstation with the cable pulled and a B1 Pro connected, is part of the hardware validation that has not been recorded yet.",
        "The cost of the whole approach is one Node script of about a hundred lines and no dependencies beyond the browser. The gain is that \"works offline\" is a check that fails in CI rather than a property someone discovers on the line.",
      ],
    },
  ],
};
