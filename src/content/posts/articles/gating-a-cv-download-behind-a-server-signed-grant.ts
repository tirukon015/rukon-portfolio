import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "gating-a-cv-download-behind-a-server-signed-grant",
  title: "Gating a CV Download Behind a Server-Signed Grant in Next.js",
  description:
    "A public portfolio, a CV with a phone number in it, and a public repository. How this site releases three contact fields and one PDF only after a form, without a database and without trusting the browser.",
  date: "2026-09-24",
  category: "Full-Stack Development",
  tags: ["Next.js", "Security", "Route Handlers", "HMAC", "Privacy"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  relatedPosts: [
    "live-github-contribution-heatmap-in-nextjs",
    "every-policy-was-correct-and-every-policy-was-inert",
  ],
  sections: [
    {
      heading: "The problem is smaller than it looks, and that matters",
      body: [
        "This site's CV page renders the whole CV as HTML: summary, experience, education, training. All of it is public and indexable. Three fields are not: the email address, the phone number and the postal address. Those, and the PDF that contains them, are released only after a visitor gives a name and an email.",
        "It is worth being precise about what that achieves. The email address is already published in the footer and the contact section, deliberately. So gating it on the CV page does not make it confidential; it makes the three fields behave consistently on that one page. The phone number and the address appear nowhere else, so those two are genuinely protected. And a name plus an email is not identity. The form is an access log, and nothing in the system pretends it is verification.",
        "Being honest about that scope is what kept the design small. There is no account system, no database, and no attempt at something the mechanism cannot deliver.",
      ],
    },
    {
      heading: "The document is not a static file",
      body: [
        "The first mistake to avoid is putting the PDF under `public/`, where it has a URL whether or not anything links to it. The second, which I made and then corrected, is putting it anywhere in a public repository at all: a committed PDF is a published PDF regardless of which directory it sits in.",
        "So the PDF lives in private storage, fetched server-side through a URL that is read from an environment variable and never sent to a browser. A local development copy sits in a git-ignored folder. The route that serves it checks that the bytes begin with `%PDF-`, because a misconfigured storage URL tends to return an HTML error page with a 200, which would otherwise be handed to the browser as a corrupt document.",
        {
          type: "flow",
          steps: ["Form: name + email", "POST /api/cv/request-access", "Signed cookie issued", "GET /api/cv/contact", "GET /api/cv/document"],
          caption: "One submission releases the three fields and unlocks the download. Both GET routes verify the same cookie; neither consults the page's own idea of whether access was granted.",
        },
      ],
    },
    {
      heading: "A grant the server can verify and the browser cannot forge",
      body: [
        "The grant is a cookie of the form `<expiry-epoch-seconds>.<signature>`, where the signature is an HMAC-SHA256 of the expiry under a server secret. Verifying it is: split on the last dot, recompute the signature, compare with `timingSafeEqual`, then check the expiry is in the future. Twelve hours, `httpOnly`, `sameSite=lax`, `secure` in production.",
        {
          type: "code",
          lang: "ts",
          code: `export function verifyGrantToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = sign(payload, secret);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expiry = Number(payload);
  return Number.isFinite(expiry) && expiry > Math.floor(Date.now() / 1000);
}`,
          caption: "timingSafeEqual throws on a length mismatch, so the length is compared first.",
        },
        "The page never reads this cookie; it cannot, it is `httpOnly`. When a returning visitor loads the CV page, the client asks the contact route whether it is still granted, and only does so if a `sessionStorage` hint says this tab was granted before. That avoids paying for a guaranteed 401 on every first visit.",
      ],
    },
    {
      heading: "Fail closed, in every direction",
      body: [
        {
          type: "list",
          items: [
            "In production the signing secret is required. Without it the request route answers 503 rather than issuing a grant it could never verify. In development a random per-process secret is generated, so local work needs no setup and the secret dies with the process.",
            "The three contact fields are read from environment variables, all or nothing. A partially configured deployment would reveal some fields and silently fail the rest, which reads as a bug to the visitor, so a missing one returns 503 for all three.",
            "Every response from the gated routes carries `Cache-Control: no-store, private` and `X-Robots-Tag: noindex, nofollow`. A shared cache must not hold a document that was only released to one visitor, and the document route must not end up in an index.",
            "The locked state on the page renders placeholder geometry, not a blurred value. There is nothing in the markup to un-blur, because the values have not been sent to the browser at all.",
          ],
        },
      ],
    },
    {
      heading: "An interface with a mock behind it",
      body: [
        "Recording who asked is the point of the feature, so the request route calls a `CVAccessService` with one method, `requestCVAccess`. The only implementation today is an in-memory mock that logs the record to the server console and keeps it for the life of the process. On a serverless platform that is deliberately not durable: instances come and go, so the record does. It exists so the flow is real end to end and the interface is exercised, not so the log can be relied on.",
        "The factory that chooses the implementation is the single place a database-backed version would be selected, following the same rule as elsewhere in my work: chosen by which environment variables are present, so no caller changes and the mock stays available for local development. The record type mirrors the future table and deliberately omits IP address, user agent and any fingerprint. Nothing is collected that the access log does not need.",
      ],
    },
    {
      heading: "What this is not",
      body: [
        "It is not authentication, and it is not confidentiality for the email address. It is a way to keep a phone number and a home address off a public page and out of a public repository while still handing a complete CV to anyone who asks and leaves a name. That is a modest guarantee, and it is an honest one, which I have come to think is the right kind for a personal site.",
        "The full CV page is at [/cv](/cv). The three routes and the grant module are a few hundred lines of TypeScript with no dependencies beyond Node's `crypto`.",
      ],
    },
  ],
  related: [{ label: "The CV page", href: "/cv" }],
};
