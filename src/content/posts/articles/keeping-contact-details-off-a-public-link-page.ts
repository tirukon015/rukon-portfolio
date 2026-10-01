import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "keeping-contact-details-off-a-public-link-page",
  title: "Keeping Your Email and Phone Off a Public Link Page Until Someone Asks",
  description:
    "A QR link page that never ships private contact details in its HTML or JavaScript. Server-only values, a short request form, only the asked-for methods returned, and a 24-hour signed re-reveal.",
  date: "2027-01-09",
  category: "Full-Stack Development",
  tags: ["Next.js", "Privacy", "Server-Only", "HMAC", "Supabase", "Forms"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Hide Contact Details Until Requested in Next.js",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "contact-form-spam-protection-without-captcha",
    "gating-a-cv-download-behind-a-server-signed-grant",
    "cookieless-first-party-analytics-with-a-daily-salted-ip-hash",
    "sharing-one-supabase-project-between-two-apps",
  ],
  sections: [
    {
      heading: "The problem: a QR code is public, a phone number should not be",
      body: [
        "A link page behind a QR code on a card or a slide will be opened by anyone, and anything in its HTML can be scraped. I wanted [rukon-link](/work/rukon-link), my page at link.rukon.dev, to list social profiles openly while keeping my email, phone number and WhatsApp off the page entirely, released only when a person asks. This article is for anyone building the same in Next.js: where the values live, how a request releases them, and what this protects against and what it does not.",
      ],
    },
    {
      heading: "The values never reach the client bundle",
      body: [
        "The private details exist only as server-side environment variables, `PRIVATE_EMAIL`, `PRIVATE_PHONE` and `PRIVATE_WHATSAPP_NUMBER`, without the `NEXT_PUBLIC_` prefix that would inline them into the browser bundle. The module that reads them starts with `import \"server-only\"`, so if a client component ever imported it, the build would fail rather than quietly ship the values.",
        "The public page renders three buttons, \"Get my Email\", \"Phone\" and \"WhatsApp\", and nothing else. There is no obfuscated address in the markup and no hidden element to scrape. If you view the page source, the values are simply not there.",
        {
          type: "code",
          lang: "ts",
          code: "/** Private contact details. Only ever sent to a browser after a successful contact request. */\nexport function privateContact(method: ContactMethod) {\n  const email = read(\"PRIVATE_EMAIL\");\n  // ...\n  switch (method) {\n    case \"email\":\n      return email ? { method, label: \"Email\", value: email, href: `mailto:${email}` } : null;\n    // phone and whatsapp build tel: and wa.me links the same way\n  }\n}",
          caption: "Simplified from lib/server/env.ts.",
        },
      ],
    },
    {
      heading: "Asking for them",
      body: [
        "A visitor opens a short form: name, email, an optional phone number and message, which methods they want, and a consent tick box. `POST /api/contact-request` validates everything on the server, applies spam checks and a rate limit described in their own article, and stores the request. It then returns only the methods the visitor asked for. Asking for an email address does not also reveal the phone number.",
        {
          type: "flow",
          steps: [
            "Visitor taps Get my Email / Phone / WhatsApp",
            "Form: name, email, methods, consent",
            "Server validates, checks for spam, rate-limits",
            "Request stored for the admin inbox",
            "Response: only the requested details, plus a 24-hour token",
          ],
        },
        "The database enforces the shape too: the requests table has a CHECK that at least one of the three methods was requested, and length limits on every text column, so a request that bypassed the form's validation still could not store nonsense.",
        "Every request lands in a private admin inbox, where it can be filtered and marked new, contacted or handled, or deleted. That is half the point. I know who asked for what, and when.",
      ],
    },
    {
      heading: "Seeing them again without asking twice",
      body: [
        "Someone who closes the sheet and opens it again a minute later should not have to fill in the form again. The response carries a signed token, stored in the visitor's `localStorage`, that `POST /api/contact-access` will honour for 24 hours. The token's payload is the request id, the list of methods that request covered, and an expiry; the signature is an HMAC-SHA256 under a server secret, compared in constant time. Because the methods are inside the signed payload, a token issued for an email request cannot be edited to reveal the phone number.",
        "The token mechanics, splitting, recomputing the signature, comparing lengths before `timingSafeEqual` and then checking the expiry, are the same pattern I used for a CV download, explained in [Gating a CV Download Behind a Server-Signed Grant in Next.js](/blog/gating-a-cv-download-behind-a-server-signed-grant). An expired or altered token gets a 401 and the client discards it.",
      ],
    },
    {
      heading: "What this protects against, and what it does not",
      body: [
        "It stops passive harvesting. Scrapers, link previewers and anyone reading the page source get no contact details, and bulk collection now requires filling in a form, passing the spam checks and staying within a rate limit of three requests per ten minutes and ten per day per network.",
        "It is not a verification step. The email address a visitor enters is not confirmed, so a determined person can type any address and receive the details. The design accepts that: the goal is friction against automated collection and a record of who asked, not secrecy from a human who wants to contact me. Those are different problems, and a link page for a QR code only needs to solve the first.",
        "Notifications are also not built: new requests appear only in the admin inbox. The project's status and limitations are on the [rukon-link project page](/work/rukon-link).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
