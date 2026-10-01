import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "security-headers-for-a-web-bluetooth-pwa",
  title: "Security Headers for a Web Bluetooth PWA, Pinned by a Test",
  description:
    "The CSP, Permissions-Policy and COOP for a PWA that drives a Bluetooth printer, why each source is there, a separate policy for the API, and a test that keeps nginx and the app in step.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Content Security Policy", "Permissions-Policy", "Web Bluetooth", "nginx", "PWA", "Security"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "CSP and Permissions-Policy for a Web Bluetooth PWA",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "security-headers-nextjs-and-why-csp-waited",
    "cross-app-printing-broadcastchannel-web-locks",
    "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
    "self-hosting-node-postgresql-nginx-systemd-ubuntu",
  ],
  sections: [
    {
      heading: "Why a printer app needs strict headers",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) is a Progressive Web App that can talk to a Bluetooth label printer, holds a workstation's device token in IndexedDB, and lets administrators edit label templates that include uploaded images. A script injected into that page could print, read the token, or change what every workstation prints. So the page's response headers are part of its design, not an afterthought.",
        "This article goes through the headers the app is served with, the reason for every CSP source, the separate policy for the API, and how a test keeps the headers from drifting between the development tooling and nginx. For the general case of adding headers to a Next.js site, see [security headers in Next.js and why the CSP waited](/blog/security-headers-nextjs-and-why-csp-waited). This one is about a Vite PWA with hardware access.",
      ],
    },
    {
      heading: "The Content Security Policy, source by source",
      body: [
        {
          type: "table",
          head: ["Directive", "Value", "Why"],
          rows: [
            ["default-src", "'self'", "Anything not listed comes from the app's own origin only"],
            ["script-src", "'self'", "Vite emits external module scripts only; no inline scripts, no eval"],
            ["style-src", "'self' 'unsafe-inline'", "React sets style attributes, for canvas sizes and drawers"],
            ["img-src", "'self' data: blob:", "Template images are data URLs; previews come from canvases"],
            ["font-src", "'self'", "Bundled fonts only"],
            ["connect-src", "'self'", "The API is same-origin behind nginx; printing never uses the network"],
            ["worker-src", "'self'", "The service worker and the timer worker"],
            ["manifest-src", "'self'", "The PWA manifest"],
            ["object-src", "'none'", "No plugins"],
            ["base-uri / form-action", "'self'", "No base-tag or form-target hijacking"],
            ["frame-ancestors", "'none'", "The app is never embedded"],
          ],
        },
        "The one concession is `'unsafe-inline'` for styles, and it is a deliberate one: React writes inline style attributes, and allowing inline styles does not allow inline scripts. `script-src` stays at `'self'` with nothing else.",
        "`connect-src 'self'` works because of an architecture decision made for other reasons: the API is served from the same origin as the app. It also doubles as a statement of fact about printing. The scan-to-print path makes no network request at all, and a unit test fails if it does. Bluetooth traffic is not governed by `connect-src`; it is governed by the next header.",
      ],
    },
    {
      heading: "Permissions-Policy: Bluetooth for this origin only",
      body: [
        {
          type: "code",
          lang: "http",
          code: "Permissions-Policy: bluetooth=(self), camera=(), microphone=(), geolocation=(), payment=()",
        },
        "The app needs exactly one powerful feature, Web Bluetooth, and only in its own top-level pages. `bluetooth=(self)` allows it there and nowhere else, so no embedded frame could ever request a device. Every feature the app does not use is switched off explicitly. Web Bluetooth also requires a secure context and a user gesture for the device chooser, so the policy narrows something that was already narrow. The offline browser test checks that loading the page does not open a Bluetooth chooser.",
      ],
    },
    {
      heading: "The rest of the set, and one side effect",
      body: [
        "`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` alongside `frame-ancestors 'none'` for older clients, `Referrer-Policy: strict-origin-when-cross-origin`, and, added by nginx because TLS lives there, `Strict-Transport-Security` for a year including subdomains.",
        "`Cross-Origin-Opener-Policy: same-origin` isolates the app's browsing context from pages on other origins. It had a cost I did not anticipate. When another web application opened the Print Engine to print a label, it could no longer keep a handle to the window, so every request opened a fresh tab without a printer connection. I kept the header and solved the hand-off inside the app's own origin with a relay page, a BroadcastChannel and a Web Lock, described in [letting another web app print through an open tab](/blog/cross-app-printing-broadcastchannel-web-locks). A security header that makes a feature awkward is usually telling you where the trust boundary is.",
      ],
    },
    {
      heading: "A different policy for the API",
      body: [
        "The API returns JSON, never HTML, so it gets a policy that allows nothing: `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`. If a response were ever rendered as a document, nothing in it could load or run. API responses also carry `Cache-Control: no-store`, `nosniff`, HSTS and `Referrer-Policy: no-referrer`. The backend sets these itself; nginx only forwards them.",
        "Headers are not the only control on the API. Sessions use `SameSite=Strict` cookies and every state-changing request needs a custom header that a cross-site page cannot add without a preflight, which only the app's own origin passes. Template uploads are limited to PNG, JPEG and SVG under 2 MB, and templates are drawn to a canvas rather than inserted as HTML, so an SVG's scripts never run.",
      ],
    },
    {
      heading: "One source, three consumers, one test",
      body: [
        "The headers exist in two places by necessity: nginx serves production, and nginx cannot import JavaScript. A third consumer is the local static server used by the browser tests. So the header values live in one JavaScript module. The local server imports it and serves the built app with exactly those headers. A unit test reads the nginx site file and the header snippet and fails unless every header appears in both, verbatim:",
        {
          type: "code",
          lang: "ts",
          code: "for (const [name, value] of Object.entries(APP_HEADERS)) {\n  expect(nginx).toContain(`add_header ${name} \"${value}\" always;`);\n  expect(snippet).toContain(`add_header ${name} \"${value}\" always;`);\n}",
          caption: "From tests/prodHeaders.test.ts.",
        },
        "The snippet exists because of an nginx rule: an `add_header` inside a `location` block replaces all inherited ones, so locations that set their own cache headers must include the security headers again. The test checks that copy too, which is the copy most likely to be forgotten. Other tests check the policy's shape, such as `script-src` being only `'self'` and `object-src` being `'none'`.",
        "Then the headless offline test loads the built app under those headers and fails on any CSP violation in the console. Its first run found eight fonts that Vite had inlined as `data:` URLs, all blocked by `font-src 'self'`. The fix was to stop inlining fonts, not to loosen the policy. A policy that has never been run against the real build is a guess; this one is exercised in CI on every push.",
      ],
    },
    {
      heading: "What is accepted",
      body: [
        "Headers do not protect what is already on the machine. The workstation's device token is readable by anyone with access to that PC's operating-system account. That risk is written down and accepted, mitigated by the OS login, the token's narrow scope and server-side revocation. And `'unsafe-inline'` for styles remains, as a known trade against React's style attributes.",
      ],
    },
  ],
};
