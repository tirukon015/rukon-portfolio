import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "workbox-conflicting-precache-entries-empty-cache",
  title: "The Service Worker Was Active and the Cache Was Empty: A Workbox Duplicate-Entry Bug",
  description:
    "An offline PWA that registered its service worker, cached nothing, and failed silently. The cause was one file listed twice in the precache manifest by vite-plugin-pwa's includeAssets.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Workbox", "vite-plugin-pwa", "Service worker", "PWA", "Offline", "Debugging"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Workbox add-to-cache-list-conflicting-entries Fix",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "security-headers-for-a-web-bluetooth-pwa",
  ],
  sections: [
    {
      heading: "The symptom: registered, active, and useless offline",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) has to boot and print with the network unplugged. It is a Vite and React app, and the offline part comes from `vite-plugin-pwa`, which generates a Workbox service worker that precaches the whole build: the app code, the bundled fonts the label renderer needs, and the logo drawn on every label.",
        "The first automated offline test failed in a confusing way. The service worker had registered and was active. Every check you would normally look at in DevTools said the PWA was installed. But the cache held zero entries, and reloading with the network cut showed Chrome's own offline error page instead of the app. If you are seeing exactly that combination, this note is for you.",
      ],
    },
    {
      heading: "Finding the error nobody printed",
      body: [
        "The page console showed nothing useful, because a service worker's errors are logged in the worker's own context, not the page's. The test was driving headless Chrome over the DevTools protocol, so the next step was to attach to the service-worker target itself rather than the page target and read its log. That exposed the real error, from Workbox's precache installer:",
        {
          type: "code",
          lang: "text",
          code: "add-to-cache-list-conflicting-entries",
        },
        "The entry it complained about was the template logo. Workbox refuses a precache list that contains conflicting entries for the same URL, and when that happens, precaching does not proceed. Nothing in the page told you.",
      ],
    },
    {
      heading: "The cause: the same file listed twice",
      body: [
        "In `vite-plugin-pwa`, two options decide what goes into the precache manifest. `workbox.globPatterns` matches files in the built output. `includeAssets` adds files from `public/` explicitly. Files in `public/` are copied into the build output by Vite, so a glob that matches `png` and other extensions already picks them up. Listing them in `includeAssets` as well puts them in the manifest twice.",
        {
          type: "code",
          lang: "ts",
          code: "VitePWA({\n  registerType: \"autoUpdate\",\n  // public/ files are copied into dist and matched by globPatterns below; listing them in\n  // includeAssets as well produces conflicting precache entries and aborts precaching.\n  workbox: {\n    globPatterns: [\"**/*.{js,css,html,png,woff,woff2,json,svg,webmanifest}\"],\n    navigateFallback: \"/index.html\",\n    navigateFallbackDenylist: [/^\\/api\\//, /^\\/bbtech\\//],\n  },\n})",
          caption: "The fixed configuration, trimmed. The comment is the fix: includeAssets is gone.",
        },
        "The fix was to delete `includeAssets` and let the glob cover everything. The next build precached 95 files, and the offline reload booted the app. The rest of the app, the [Web Bluetooth print path](/blog/printing-labels-from-the-browser-over-web-bluetooth), needed no change: it had never touched the network. The count moved to 99 and later to over a hundred as the app grew, and the offline test checks it on every run.",
        "The configuration around it matters for offline too. `navigateFallback` serves the app shell for any navigation when offline. The deny list keeps two paths out of that fallback: `/api/`, which must always see the real server, and a static relay page under its own path, which must be served as itself rather than replaced by the app shell.",
      ],
    },
    {
      heading: "What to check instead of \"is the worker active\"",
      body: [
        "The lesson I wrote down was short: verify what the worker cached, not whether it registered. Registration and activation tell you the worker script ran. They say nothing about whether the install step did its job. A worker whose precache is empty passes every registration check.",
        {
          type: "list",
          items: [
            "Count cache entries after the first online load, with `caches.keys()` and each cache's `keys()`, and assert a minimum.",
            "Check for the specific files offline boot cannot live without: `index.html`, and any asset your first screen draws.",
            "When something is wrong, read the service worker's own console, not the page's.",
            "Then cut the network and reload. That is the only test that proves offline boot.",
          ],
        },
        "The Print Engine's offline test now does most of this on every run: it reports the number of cached entries, fails unless `index.html` and the template logo are in the cache, then cuts the network at the protocol level, reloads and checks that the app boots and renders a label from cache.",
        "A related trap came up later in the same build. The production Content Security Policy only allows fonts from the app's own origin, and Vite inlines small assets as `data:` URLs by default. The first offline run under the production headers found eight fonts inlined that way, each one blocked by the policy. The build config now never inlines font files. It is the same shape of bug: a default that works in development and quietly breaks the offline, production-headers path.",
      ],
    },
  ],
};
