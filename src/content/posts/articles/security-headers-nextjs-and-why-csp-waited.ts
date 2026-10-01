import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "security-headers-nextjs-and-why-csp-waited",
  title: "Baseline Security Headers in Next.js, and Why the CSP Waited",
  description:
    "Adding five response headers to a Next.js site that served none, why the Content-Security-Policy was deliberately deferred, and a nonce-free CSP on another app.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Next.js", "Security Headers", "Content Security Policy", "HSTS", "Web Security"],
  contentType: "Problem/Solution",
  searchIntent: "informational",
  seoTitle: "Next.js Security Headers, and Why the CSP Waited",
  relatedProjects: ["rpoms-ai", "erth"],
  relatedPosts: [
    "theme-specific-logos-without-a-flash",
    "gating-a-cv-download-behind-a-server-signed-grant",
    "security-headers-for-a-web-bluetooth-pwa",
    "nextjs-opengraph-metadata-replaces-not-merges",
  ],
  sections: [
    {
      heading: "The finding: a site that sent no security headers",
      body: [
        "During a content and SEO audit of this portfolio in September 2026, one finding had nothing to do with content: the site served no security response headers at all. No `nosniff`, no referrer policy, no framing policy, no HSTS.",
        "This article is for developers adding headers to a Next.js App Router site after the fact. It covers which headers went in and why they were safe to add in a content update, why the Content-Security-Policy did not, and how another of my apps handles CSP with different trade-offs.",
      ],
    },
    {
      heading: "Five headers that cannot change how the site looks",
      body: [
        "The headers are declared once in `next.config.ts` and applied to every path:",
        {
          type: "code",
          lang: "ts",
          code: "const securityHeaders = [\n  { key: \"X-Content-Type-Options\", value: \"nosniff\" },\n  { key: \"Referrer-Policy\", value: \"strict-origin-when-cross-origin\" },\n  { key: \"X-Frame-Options\", value: \"SAMEORIGIN\" },\n  {\n    key: \"Permissions-Policy\",\n    value: \"camera=(), microphone=(), geolocation=(), interest-cohort=()\",\n  },\n  {\n    key: \"Strict-Transport-Security\",\n    value: \"max-age=63072000; includeSubDomains; preload\",\n  },\n];\n\nasync headers() {\n  return [{ source: \"/:path*\", headers: securityHeaders }];\n}",
          caption: "From next.config.ts.",
        },
        "The reason they could go into a content update is written in the comment above them: they are response headers that the pages do not have to cooperate with. `nosniff` stops a browser guessing a file's type. The referrer policy sends only the origin to other sites. `SAMEORIGIN` stops the site being framed elsewhere. The permissions policy turns off camera, microphone and geolocation, which the site never uses. HSTS tells browsers to use HTTPS for two years, including subdomains.",
        "HSTS is the one to think about before copying. `includeSubDomains` applies the rule to every subdomain of the host that sends it, and `preload` signals intent to be added to browsers' built-in HTTPS lists, which is slow to undo. Both are right for a domain where everything is HTTPS; check before you send them for a domain with an older HTTP-only subdomain.",
      ],
    },
    {
      heading: "Why the Content-Security-Policy was left out",
      body: [
        "A CSP is the header that does the most against cross-site scripting, and it was deliberately not added. The comment in `next.config.ts` gives the reason: Next.js injects inline scripts for hydration, and the theme provider writes inline code before paint so the page renders in the right theme without a flash. A CSP that blocks inline scripts breaks both. A CSP that allows them with `'unsafe-inline'` gives up much of what made it worth adding.",
        "The proper fix is a per-request nonce: generate a random value for each response, put it in the CSP header, and attach it to every inline script, including the theme provider's. That means rendering dynamically to produce the nonce and threading it through the document. The comment calls it what it is: a real change with a real chance of breaking the flash prevention, and not something that belonged in a content update. So the decision was recorded in the code instead of being forgotten. The same before-paint mechanism is what keeps theme-specific images correct, as described in [Theme-Specific Logos Without a Flash](/blog/theme-specific-logos-without-a-flash).",
        {
          type: "callout",
          label: "Why write the reason down",
          text: "An absent header looks like an oversight. A comment that says it was considered, why it was deferred and what doing it properly involves turns it into a known, scoped piece of work.",
        },
      ],
    },
    {
      heading: "The other side of the trade-off: a CSP without nonces",
      body: [
        "RPOMS AI, a photo-inspection app also built on Next.js, does ship a CSP, and it shows the compromise honestly. Its policy is `default-src 'self'` with no third-party sources at all, but `script-src` includes `'unsafe-inline'`, with a comment noting that Next.js injects inline bootstrap scripts and no third-party script is loaded.",
        {
          type: "code",
          lang: "ts",
          code: "\"default-src 'self'\",\n\"script-src 'self' 'unsafe-inline'\",\n\"img-src 'self' blob: data:\",\n\"connect-src 'self'\",\n\"frame-ancestors 'none'\",\n\"base-uri 'self'\",\n\"form-action 'self' https://accounts.google.com\",\n\"object-src 'none'\",",
          caption: "Abridged from RPOMS AI's next.config.ts.",
        },
        "That policy is weaker against injected inline script than a nonce-based one, but it is far from useless. It blocks scripts, styles, fonts and connections to any other origin, forbids framing outright, pins the base URL, limits where forms may post to the app itself and Google sign-in, and disables plugins. For an app with an admin area and photo uploads, those restrictions are worth having even before nonces. Its other headers go further than this portfolio's too: `X-Frame-Options: DENY`, and a permissions policy that allows the camera for its own origin only, because capturing a photo is the app's purpose. Its photo route adds a separate `default-src 'none'` CSP to the images it serves. More on the app is in the [RPOMS AI case study](/work/rpoms-ai/case-study).",
      ],
    },
    {
      heading: "Headers on a static site, and input limits behind a form",
      body: [
        "The static ERTH homepage on Vercel sets the same four non-HSTS headers through `vercel.json`, alongside long-lived immutable caching for hashed assets and fonts. It ships 3.7 kB of its own JavaScript and no framework runtime, so it is a much easier candidate for a strict CSP than a hydrated React app. See the [ERTH project page](/work/erth).",
        "The same audit tightened the one endpoint on this site that accepts input. The contact form's message was already capped at 5,000 characters, but name, email and subject were unbounded. They are now capped at 200, 320 and 200 characters, and line breaks are rejected in all three; the subject is interpolated into an email header. The comment in the route notes that the email service takes JSON rather than raw SMTP, so header injection was not exploitable, and that the values still should not carry line breaks into a header regardless of who parses them next.",
        "The order I would recommend: add the headers that cannot break anything first, today; write down why the CSP is not there yet; then do the nonce work as its own change, tested against the theme script, rather than squeezing it into something else.",
      ],
    },
  ],
};
