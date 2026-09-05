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

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
