# Features

Implemented functionality, as of the date in the last CHANGELOG entry. Update
this list whenever a feature is added, removed or changed.

Status: **Live** = in production code; **Partial** = works with a stated limitation.

## Navigation and layout

| Feature | Status | Where |
| --- | --- | --- |
| Sticky header with anchor nav and active-section highlight on `/` | Live | `layout/header.tsx`, `lib/use-active-section.ts` |
| Route-based active nav on inner pages | Live | `layout/header.tsx` |
| Mobile menu (below 768 px) | Live | `layout/header.tsx` |
| Dark / light theme, system default, no flash | Live | `theme-provider.tsx`, `theme-toggle.tsx` |
| Breadcrumbs on inner pages (with BreadcrumbList schema) | Live | `ui/breadcrumbs.tsx` |
| Custom 404 | Live | `app/not-found.tsx` |

## Homepage

| Feature | Status | Where |
| --- | --- | --- |
| Hero: statement, CTA, Resume link, verifiable "now" facts | Live | `sections/hero.tsx`, `content/site.ts` |
| Hero cursor grid | Live | `cursor-grid.tsx` |
| Hero portrait spotlight (soft resting glimpse, reveal near the pointer, tap toggle on touch) | Live | `hero-spotlight.tsx` |
| Tiered Selected Work: flagship with facts, workflow and ecosystem (no screenshot since 2026-10-01); featured blocks with screenshot or mark; "Other work" rows | Live | `sections/featured-work.tsx` |
| Live GitHub contribution heatmap with tooltip | Live (needs `GITHUB_TOKEN`) | `sections/github-activity.tsx` |
| "What I Build": five capabilities, each with project evidence links | Live | `sections/capabilities.tsx`, `content/skills.ts` |
| Experience, About, Latest writing (3 newest) | Live | `sections/*` |
| Contact form → email | Live (needs `RESEND_API_KEY`) | `sections/contact.tsx`, `api/contact` |

## Projects

| Feature | Status | Where |
| --- | --- | --- |
| `/work` index with category filter (Systems / Web Apps / Websites / iOS & Mobile) | Live | `work/work-filter.tsx` |
| Project cards with screenshot thumbnail, badges, highlights, stack | Live | `work/hr-project-card.tsx` |
| Level 1 overview page per project, with optional preview screenshot | Live | `app/work/[slug]/page.tsx` |
| Level 2 case study: workflow strip, related systems, sections with figures (normal / wide, click for full size), notes, status table, tech groups, limitations, roadmap, source links, confidentiality notice | Live | `app/work/[slug]/case-study/page.tsx` |
| Per-project social image (`shareImage`) | Live | both project routes |
| Project count | 9: RPOMS (flagship); RPOMS Print Engine, ERTH, ResearchForge (featured); RPOMS AI, ITMS, DriveKeep, SpenDrop, rukon-link (secondary) | `content/projects.ts` |

## Blog

| Feature | Status | Where |
| --- | --- | --- |
| 161 articles (28 earlier + 133 added 2026-10-01/02), six categories, category pages | Live | `content/posts`, `app/blog/*` |
| Scheduled publishing: an article dated in the future is hidden from every listing, route, feed and sitemap until its date (Malaysia time); blog and work routes revalidate hourly | Live | `publishedPosts()` in `content/posts/index.ts`, `revalidate = 3600` |
| Rich blocks: code, callout, flow, image, table, list | Live | `blog/post-body.tsx` |
| Reading time | Live | `lib/reading-time.ts` |
| Per-article OG image | Live | `app/blog/[slug]/opengraph-image.tsx` |
| Related projects ↔ articles | Live | `relatedProjects` in posts |
| RSS feed | Live | `app/feed.xml/route.ts` |
| Permanent redirects for retired categories and merged article | Live | `next.config.ts` |

## CV access

| Feature | Status | Where |
| --- | --- | --- |
| Request-access gate issuing a signed, expiring grant cookie | Live | `api/cv/request-access`, `lib/cv-access/grant.ts` |
| Gated contact details (server-only) | Live | `api/cv/contact` |
| Gated PDF download | Live | `api/cv/document` |
| Access-request log | Partial: in-memory mock, not durable; Supabase planned | `lib/cv-access/mock-service.ts` |

## SEO and platform

| Feature | Status | Where |
| --- | --- | --- |
| Per-page metadata, canonical URLs on `www.rukon.dev` | Live | `lib/seo.ts` |
| JSON-LD: Person, WebSite, ProfilePage, CreativeWork, TechArticle, BreadcrumbList, articles | Live | `components/seo/json-ld.tsx` |
| Sitemap, robots, site OG image, icon | Live | `app/sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `icon.tsx` |
| Security headers (no CSP, by decision) | Live | `next.config.ts` |
| Reduced-motion support for every animation | Live | `app/globals.css` |

## Known gaps

- No automated tests; checks are `tsc`, lint, build and a browser pass.
- CV access log is not durable (mock service).
- The CV PDF is tracked in the public repository (see PROJECT_SPEC §6).
- No Content-Security-Policy yet.
