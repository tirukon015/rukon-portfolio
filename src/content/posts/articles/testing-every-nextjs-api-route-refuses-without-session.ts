import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "testing-every-nextjs-api-route-refuses-without-session",
  title: "The Test That Calls Every Next.js API Route With No Session",
  description:
    "Five API reads in RPOMS typechecked and linted cleanly and were open to anyone. They were found by probing the built app, and now one test globs every route.ts and expects a refusal.",
  date: "2026-11-17",
  category: "Full-Stack Development",
  tags: ["Next.js", "Authorization", "Vitest", "API Security", "Route Handlers", "Testing"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Test That Every Next.js API Route Needs Auth",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "enforcing-architecture-boundaries-with-a-test-in-nextjs",
    "hmac-signed-session-cookies-without-a-library",
    "production-write-lock-read-only-mode-nextjs-middleware",
    "remediating-a-code-audit-with-p0-findings",
  ],
  sections: [
    {
      heading: "The page was gated; the data behind it was not",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, renders most pages on the server, reading the database directly. The pages check the role. Alongside them are API route handlers, and in September 2026 I ran the built app and called every endpoint without signing in. Five GET handlers answered.",
        {
          type: "table",
          head: ["Endpoint", "What it returned", "Now requires"],
          rows: [
            ["`GET /api/report`", "the latest daily report, including each named person's output", "any signed-in session"],
            ["`GET /api/routers/box/building`", "box transfer history: who moved which box, and when", "admin"],
            ["`GET /api/employees`", "the staff roster", "admin"],
            ["`GET /api/inventory`", "stock movements", "admin"],
            ["`GET /api/settings`", "business configuration", "any signed-in session"],
          ],
        },
        "The dashboard's own comment said no production data is fetched or shown until the visitor signs in, and it rendered a confidentiality gate for anyone without a role. The gate was on the page and not on the data. One of the five was my own, from two commits earlier: its doc comment said \"Readable by any admin\" and the code checked nothing.",
        "This is for anyone with Next.js route handlers that nothing in the app calls anymore, because the pages read the database directly. Those are exactly the endpoints nobody looks at.",
      ],
    },
    {
      heading: "Why static checks never see this",
      body: [
        "All five compiled, typechecked and linted perfectly. A missing `if (!isAdmin())` is not a type error. My own first grep over the handlers also flagged a route that was in fact guarded, through a helper my pattern did not match; a live request against a non-existent id returned 401, so it was checked rather than claimed. Grep is a lead, not a verdict. Calling the handler is.",
        "The production write lock did not help either. It blocks writes only, by design, and never reads. That is the difference between a lock that decides what may change and the access control that decides who may see.",
      ],
    },
    {
      heading: "One test for every route, present and future",
      body: [
        "The fix for the five was a line each. The fix for the class is a test that imports every `route.ts` under `src/app/api`, calls each exported method with an empty request and no cookie, and expects 401 or 403, never a 200 and never a 500:",
        {
          type: "code",
          lang: "ts",
          code: `vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, getAll: () => [], has: () => false }),
  headers: async () => new Headers(),
}));

const modules = import.meta.glob("../src/app/api/**/route.ts");
const OPEN_ON_PURPOSE = new Set(["/api/auth/login", "/api/auth/logout", "/api/health"]);

for (const [file, load] of Object.entries(modules)) {
  const path = routePath(file);
  if (OPEN_ON_PURPOSE.has(path)) continue;
  it(path, async () => {
    const mod = await load();
    for (const method of METHODS.filter((m) => typeof mod[m] === "function")) {
      const res = await mod[method](requestFor(path, method), { params: ... });
      expect([401, 403]).toContain(res.status);
    }
  });
}`,
          caption: "Condensed from the RPOMS test. Dynamic segments like [id] are filled with a placeholder.",
        },
        "`import.meta.glob` is what makes it durable: a route added tomorrow is covered the moment the file exists, without anyone remembering to add a test. A sanity check asserts the glob found more than thirty routes, so a broken pattern cannot pass by testing nothing. Each route must export at least one handler, and a response body that says `ok: true` fails even if the status looks right.",
      ],
    },
    {
      heading: "The exceptions are asserted too",
      body: [
        "Three routes are open on purpose, and each gets its own test on its own terms rather than a silent skip:",
        {
          type: "list",
          items: [
            "Sign-in refuses empty credentials with 401 and sets no cookie.",
            "Sign-out is open because it only clears the browser's cookie; the test checks the cookie is cleared.",
            "The health endpoint is open and returns exactly six keys, all strings or booleans, and nothing that matches a connection string, host or `@`.",
          ],
        },
        "One practical detail: the first import of a route that pulls in a spreadsheet or document library can take tens of seconds on a cold cache, while the handler itself answers in milliseconds. Each case gets a generous timeout for that first import.",
      ],
    },
    {
      heading: "It still needs a human with a browser",
      body: [
        "The matrix proves that no route answers an anonymous request. It does not prove that each route applies the right role, or that a page does not leak through its own server rendering. The release review for the model-configuration work found exactly that: the admin page read and sent the day's report and model names to signed-out, Ecommerce and viewer sessions. The page now reads nothing for them, and the release check recorded 32 of 32 unauthorized writes refused.",
        "So the routine is both: an automated test that covers every route by construction, and a probe of the built app, signed out and as each role, before a release. Sessions themselves are described in [From a Constant Per-Role Cookie to HMAC-Signed, Expiring Sessions](/blog/hmac-signed-session-cookies-without-a-library), and the system in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
