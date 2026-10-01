import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "nextjs-16-proxy-ts-supabase-session-refresh",
  title: "Refreshing a Supabase Session in Next.js 16's proxy.ts, and Not Authorising There",
  description:
    "Next.js 16 renamed Middleware to Proxy. Using proxy.ts only to refresh a Supabase session cookie for admin routes, while every page and API route checks authorisation itself.",
  date: "2027-01-13",
  category: "Full-Stack Development",
  tags: ["Next.js 16", "proxy.ts", "Supabase Auth", "Cookies", "Authorization", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Next.js 16 proxy.ts With Supabase Auth",
  relatedProjects: ["rukon-link"],
  relatedPosts: [
    "sharing-one-supabase-project-between-two-apps",
    "supabase-google-sign-in-redirects-to-localhost-with-token",
    "one-postgres-function-for-a-whole-analytics-dashboard",
  ],
  sections: [
    {
      heading: "The problem: a session cookie that Server Components cannot update",
      body: [
        "[rukon-link](/work/rukon-link), my QR link page, has a private admin area for its analytics and contact-request inbox, signed in with Supabase Auth. Supabase rotates refresh tokens, and the new tokens have to be written back to the browser's cookies. A Server Component can read cookies but cannot set them. Something that runs before the page renders has to do that write, and in Next.js 16 that something is the Proxy. This article is for anyone moving a Supabase cookie refresh to Next.js 16, and for anyone tempted to put their authorisation in the same file.",
      ],
    },
    {
      heading: "Middleware is now called Proxy",
      body: [
        "From the Next.js 16 documentation shipped with the project: Middleware is now called Proxy, with the same functionality. The file is `proxy.ts` at the project root (or in `src`), and the exported function is named `proxy` or is the default export. The `middleware` file name and named export are deprecated. One difference to know before migrating: the Proxy runtime is Node.js and cannot be configured, and the upgrade guide says to keep using `middleware` if you need the Edge runtime.",
        "The same documentation is clear about what Proxy is for. It is suitable for optimistic checks such as permission-based redirects, but it should not be used as a full session management or authorisation solution. The design below follows that literally.",
      ],
    },
    {
      heading: "The proxy: refresh, mark private, nothing else",
      body: [
        {
          type: "code",
          lang: "ts",
          code: `export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};`,
          caption: "proxy.ts from the rukon-link repository.",
        },
        "Three details carry the weight. The matcher limits it to the admin pages and admin API, so the public page and its analytics beacon never pay for a call to the auth service. Calling `getUser()` is what triggers the refresh: it verifies the token with Supabase and, if new tokens were issued, `setAll` runs.",
        "And `setAll` writes the new cookies twice, deliberately. Setting them on `request.cookies` and rebuilding `NextResponse.next({ request })` means the page rendering in this same request sees the fresh tokens. Setting them on the response sends them back to the browser. Doing only the second would leave this request's Server Components reading the old, possibly expired, token.",
        "The two headers apply to every admin response: never cache it anywhere shared, and never index it.",
      ],
    },
    {
      heading: "The server-side client for pages and actions",
      body: [
        "Pages, server actions and route handlers use a second client bound to `cookies()` from `next/headers`. Its `setAll` tries to write and silently ignores the failure, with a comment explaining why: when called from a Server Component, cookies are read-only, and the proxy has already refreshed them. That pairing, a proxy that writes and a server client that only reads in components, is the whole session mechanism.",
      ],
    },
    {
      heading: "Authorisation lives in every page and route",
      body: [
        "The proxy never decides who is allowed in. Every admin page and server action calls `requireAdmin()`, which redirects to the login page if the check fails, and every admin API route calls `getAdmin()` and returns 401. Both use the cookie-bound client and `getUser()`, which verifies the token with Supabase rather than trusting the cookie's contents.",
        {
          type: "code",
          lang: "ts",
          code: `export function isAdminUser(user: User | null | undefined) {
  return Boolean(
    user &&
      env.adminEmail &&
      user.email?.toLowerCase() === env.adminEmail &&
      (user.email_confirmed_at || user.confirmed_at),
  );
}`,
          caption: "From lib/server/admin.ts.",
        },
        "Being signed in is not enough: the user must be the one configured admin email, and that email must be confirmed. That matters more than usual here, because this Supabase project is shared with another app, so its user list is not only rukon-link's.",
        "Keeping authorisation out of the proxy has a practical benefit beyond following the documentation. A matcher that misses a route, or a future route added outside `/admin`, cannot become an unprotected page, because the check is in the code that serves the data, not in a filter in front of it. The admin layout's metadata also marks it noindex, and the admin area and API are excluded from search engines in `robots.ts`. The project is described on the [rukon-link project page](/work/rukon-link).",
      ],
    },
  ],
  related: [{ label: "rukon-link", href: "/work/rukon-link" }],
};
