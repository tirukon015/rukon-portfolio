import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * The site served none of these. They are all response headers rather than
 * anything the pages have to cooperate with, so none of them can change how
 * the site looks or behaves.
 *
 * Deliberately not included: a Content-Security-Policy. Next injects inline
 * scripts for hydration and the theme provider writes an inline style before
 * paint, so a useful CSP here needs per-request nonces threaded through the
 * document. That is a real change with a real chance of breaking the theme
 * flash-prevention, and it does not belong in a content update.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * Old URLs, kept working.
 *
 * On 2026-09-24 the blog's six categories were folded into six clusters, and
 * one article was merged into the one it duplicated. Every URL that existed
 * before still answers, with a permanent redirect to where the content lives
 * now, so nothing indexed or linked breaks.
 */
const permanentRedirects = [
  { from: "/blog/category/operations", to: "/blog/category/building-real-systems" },
  { from: "/blog/category/it-systems", to: "/blog/category/building-real-systems" },
  { from: "/blog/category/software-engineering", to: "/blog/category/full-stack-development" },
  { from: "/blog/category/web-development", to: "/blog/category/full-stack-development" },
  { from: "/blog/category/business-automation", to: "/blog/category/ai-and-automation" },
  { from: "/blog/category/ui-ux", to: "/blog/category/ui-ux-and-product" },
  {
    from: "/blog/why-production-operations-need-digital-systems",
    to: "/blog/common-problems-manual-production-tracking",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return permanentRedirects.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },
};

export default nextConfig;
