import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "supabase-google-sign-in-redirects-to-localhost-with-token",
  title: "Why Supabase Google Sign-In Landed on localhost With a Token in the URL",
  description:
    "Google sign-in on a custom domain returned users to localhost:3000 with an access token in the address bar. Two separate causes, the Site URL fallback and the implicit flow, and the fixes.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Supabase Auth", "OAuth", "PKCE", "Google Sign-In", "Next.js", "Security"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Supabase OAuth Redirects to localhost: Fix",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "fastapi-and-nextjs-as-two-services-on-one-vercel-origin",
    "logout-still-worked-for-30-seconds-token-cache-serverless",
    "wrong-supabase-key-returns-200-and-zero-rows",
  ],
  sections: [
    {
      heading: "The symptom",
      body: [
        "After adding \"Continue with Google\" to [ResearchForge](/work/researchforge), a production sign-in on the custom domain ended at `http://localhost:3000/?access_token=...`. If you are using Supabase Auth with a custom domain or preview deployments and see the same thing, there are two independent causes, and only one of them is in your code. This is how each was diagnosed and fixed, for a Next.js frontend using `@supabase/supabase-js` in the browser.",
        "The first instinct was to look for a hard-coded localhost. There was none: the redirect was already built from `window.location.origin`, which was correct. The bug was above it.",
      ],
    },
    {
      heading: "Cause one: Supabase substitutes the Site URL on the way back",
      body: [
        "Supabase Auth accepts any `redirectTo` when the flow starts. I verified this empirically: even a blatantly invalid redirect still returned a 302 to Google. The redirect is validated on the way back, and if it is not in the project's redirect allow-list, Supabase silently substitutes the project's Site URL.",
        "The project's Site URL was still `http://localhost:3000`, and the production callback was not in the allow-list. That explains both halves of the symptom exactly: landing on `/` rather than `/auth/callback` is the substitution, and `localhost:3000` is the Site URL. The same misconfiguration breaks email confirmation and password-reset links, which had failed the same way earlier.",
        "So a missing allow-list entry does not look like a permissions error. It looks like a localhost URL. The fix is in the Supabase dashboard, not in code: set the Site URL to the production origin, and allow-list the exact callback and reset URLs for production and for local development. Watch the trailing slash, because allow-list matching is exact, and a redirect built as `https://example.com//auth/callback` or with a stray slash will silently fail to match.",
        {
          type: "code",
          lang: "ts",
          code: "export function authRedirectUrl(path: string): string {\n  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();\n  const base = (\n    configured || (typeof window !== \"undefined\" ? window.location.origin : \"\")\n  ).replace(/\\/+$/, \"\");\n  return `${base}${path.startsWith(\"/\") ? path : `/${path}`}`;\n}",
          caption: "From app/src/lib/supabase.ts. Redirects are derived from the running origin, with an optional override for a proxied deployment.",
        },
      ],
    },
    {
      heading: "Cause two: the implicit flow puts tokens in the URL",
      body: [
        "The `access_token` in the address bar was the second, separate defect. `flowType` had never been set, and plain `@supabase/supabase-js` defaults to the implicit flow, which returns the session by putting the access token and refresh token in the URL of the page it redirects to. Tokens in a URL reach browser history, can leak through a `Referer` header to any third-party asset the landing page loads, and are visible to anyone glancing at the screen. (`@supabase/ssr` defaults to PKCE; `supabase-js` does not, so relying on the default was fragile anyway.)",
        "The client is now created with `flowType: \"pkce\"`. The provider returns a single-use `?code=` instead, which is worthless without the verifier held in this browser's own storage. Nothing secret is ever in a URL.",
      ],
    },
    {
      heading: "The callback page waits instead of exchanging the code",
      body: [
        "The obvious callback implementation calls `exchangeCodeForSession(code)`. In this configuration that is a bug. With `detectSessionInUrl: true`, the client spots the code as it initialises and redeems it before the callback component mounts, and a one-time code cannot be redeemed twice. The explicit call would fail and the page would report a failure on a sign-in that had succeeded.",
        "So `/auth/callback` waits for the session to appear through `onAuthStateChange`, with a 20-second timeout, and then forwards on. That approach is also flow-agnostic, which matters because a confirmation link issued before the switch to PKCE still had to work. Signup confirmation was changed to return to the same callback rather than to the dashboard, which also means confirmation and Google sign-in share one allow-listed URL.",
      ],
    },
    {
      heading: "Keeping the return path from becoming an open redirect",
      body: [
        "Where the user was going before sign-in is kept in `sessionStorage`, not in `redirectTo`, so only one plain URL needs allow-listing and the destination cannot be tampered with in a query string. Both the write and the read go through one check:",
        {
          type: "code",
          lang: "ts",
          code: `export function isSafeReturnPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;   // protocol-relative: //evil.example
  if (path.startsWith("/\\\\")) return false;  // browsers may treat /\\ as //
  return true;
}`,
          caption: "From app/src/lib/supabase.ts (comments added).",
        },
        "OAuth failures arrive as URL parameters rather than exceptions, in the query string or the hash, so both are checked and mapped to sentences a person can read. The redirect construction and the open-redirect check were extracted as pure functions, and 16 Vitest tests cover production and local redirect construction, the trailing-slash case, and rejection of the protocol-relative and backslash bypasses.",
      ],
    },
    {
      heading: "Checklist",
      body: [
        {
          type: "list",
          ordered: true,
          items: [
            "Site URL is the production origin, not localhost.",
            "Every callback and reset URL, production and local, is in the redirect allow-list, exactly as the code builds it.",
            "`flowType: \"pkce\"` is set explicitly in the browser client.",
            "The callback does not redeem a code the client already redeemed.",
            "Return destinations are same-site paths, checked on write and on read.",
          ],
        },
        "Same-origin routing made the rest of the deployment work on every domain, as described in [Running FastAPI and Next.js as Two Services Behind One Vercel Origin](/blog/fastapi-and-nextjs-as-two-services-on-one-vercel-origin). The account side of the system is covered in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
