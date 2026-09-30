# Architecture

How the portfolio is built. Baseline `ac88d39`.

## 1. Stack

| | |
| --- | --- |
| Framework | Next.js **16.3.2**, App Router (read `node_modules/next/dist/docs/` before using an API; it differs from older Next) |
| UI | React 19.2.8, TypeScript 5 (strict), Tailwind CSS v4 via `@tailwindcss/postcss` |
| Runtime deps | `next`, `react`, `react-dom`, `next-themes`, `lucide-react` only |
| Lint | ESLint 9 with `eslint-config-next` (core-web-vitals + typescript) |
| Tests | none configured; verification is `tsc`, lint, build and a browser check |
| Hosting | Vercel, deploys `main`; canonical host `www.rukon.dev` |

Keep the dependency list this short. Add a package only when the platform
cannot do the job.

## 2. Directory structure

```
src/
  app/                    routes (App Router)
    page.tsx              homepage: composes section components
    layout.tsx            fonts, ThemeProvider, header/footer, site metadata, Person + WebSite JSON-LD
    work/                 /work, /work/[slug], /work/[slug]/case-study
    blog/                 /blog, /blog/[slug] (+ opengraph-image), /blog/category/[slug]
    cv/                   /cv request-access gate
    api/                  contact, cv/request-access, cv/contact, cv/document
    feed.xml/ sitemap.ts robots.ts opengraph-image.tsx icon.tsx not-found.tsx globals.css
  components/
    layout/               header, footer
    sections/             homepage and page sections
    work/                 project cards and filter
    blog/                 post list and body renderer
    ui/                   primitives (Container, Reveal, Button, Tag, …)
    seo/json-ld.tsx
  content/                ALL site content as typed TS modules (no CMS)
  lib/                    seo, cv-access/, github/, hooks, utils
public/images/            project screenshots, diagrams, marks, social images
private/cv/               CV PDF bundled into /api/cv/document
docs/                     this documentation
```

## 3. Rendering model

- **Server components by default.** Pages and sections render on the server
  and read content modules directly. Only these are client components:
  `layout/header.tsx` (mobile menu, active section), `sections/contact.tsx`
  (form), `sections/cv-access.tsx` (gate flow), `work/work-filter.tsx`,
  `ui/reveal.tsx`, `hero-spotlight.tsx`, `cursor-grid.tsx`,
  `heatmap-tooltip.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, and hooks in
  `lib/use-*.ts`.
- **Rule:** make a component client-side only for interaction or browser APIs.
  Keep data and copy in server components and pass plain props down.
- **Static generation:** `/work/[slug]`, the case studies, articles and
  categories use `generateStaticParams` from the content modules, so the build
  emits every page (90 at baseline). `/cv` is dynamic. `/feed.xml` is `force-static`.
- **Revalidation:** only the GitHub heatmap fetch revalidates (every 3600 s, tag
  `github-contributions`).

## 4. Content and data flow

```
src/content/*.ts  ──►  page / section components  ──►  HTML at build time
   projects.ts         (typed props)                    + metadata + JSON-LD
   posts/…             sitemap.ts, feed.xml, robots.ts read the same modules
```

- **projects.ts** is the single source for project cards, `/work`, both project
  pages, the sitemap and the homepage tiers. Types (`Project`,
  `CaseStudySection`, `CaseStudyFigure`, `ProjectStatusItem`, …) are declared at
  the top of the file; optional fields render only when present.
- **posts/** holds one file per article plus `index.ts` registering them;
  `types.ts` defines the block types.
- **site.ts** holds identity, hero copy, the meta description, nav and links.
  `skills.ts` holds capabilities and the stack; `experience.ts`, `about.ts`,
  `cv.ts` and `education.ts` hold their sections.
- There is **no database** and no CMS. Content changes are code changes.

## 5. API routes

| Route | Method | Behaviour |
| --- | --- | --- |
| `/api/contact` | POST | Validates name/email/message (lengths, email shape, no header newlines) → sends via Resend REST (`fetch`, no SDK). 400 validation, 503 when unconfigured, 502 on provider failure |
| `/api/cv/request-access` | POST | Validates name/email → records via `getCVAccessService()` (mock, in-memory) → sets the signed grant cookie |
| `/api/cv/contact` | GET | 401 without a valid grant; returns `CV_CONTACT_*` values; `no-store` |
| `/api/cv/document` | GET | 401 without a valid grant; streams the PDF from `CV_DOCUMENT_URL` or `private/cv/` |

`lib/cv-access/` is the only server library with its own structure: `grant.ts`
(HMAC token and cookie), `protected-contact.ts`, `document.ts`, `types.ts`,
`mock-service.ts`, and `index.ts` (chooses the implementation; the Supabase
integration point is documented there).

## 6. SEO architecture (`src/lib/seo.ts`)

- `BASE_URL` / `absoluteUrl()` build every absolute URL from `site.canonicalHost`.
- `openGraphFor()` / `twitterFor()` always re-apply site defaults (a child
  route's `openGraph` replaces the parent's rather than merging); both accept an
  optional per-page image (projects pass `shareImage`).
- JSON-LD through `components/seo/json-ld.tsx`: `Person` + `WebSite` in the
  layout, `ProfilePage` on `/`, `CreativeWork` / `TechArticle` + `BreadcrumbList`
  on project pages, article schema on posts. Structured data must mirror visible content.
- Meta descriptions: homepage `site.metaDescription`; project overview uses
  `hrOverview.valueProposition`. Keep them near or under 160 characters.

## 7. Styling architecture

Tailwind v4 with CSS-first config: tokens in `globals.css` (`:root`, the light
override, and `@theme inline` mapping to utilities). No `tailwind.config`.
Component-specific CSS (hero portrait mask, heatmap, CV reveal) lives in
`globals.css` under clear comments. `cn()` in `lib/utils.ts` is a plain class
join (no tailwind-merge), except `Container`, which checks for `max-w-*` itself.
See [DESIGN_SYSTEM](DESIGN_SYSTEM.md).

## 8. Environment variables (names only)

| Name | Required | Purpose |
| --- | --- | --- |
| `CV_ACCESS_SECRET` | production | HMAC key for CV grants (≥16 chars) |
| `CV_CONTACT_EMAIL`, `CV_CONTACT_PHONE`, `CV_CONTACT_ADDRESS` | for the gate | Gated contact details |
| `CV_DOCUMENT_URL`, `CV_DOCUMENT_TOKEN` | optional | Remote CV PDF source |
| `RESEND_API_KEY` | for contact form | Email delivery |
| `GITHUB_TOKEN` | for heatmap | GitHub GraphQL contributions |

Template: `.env.example`. Real values live in `.env.local` (git-ignored) and in
Vercel. Changing a Vercel variable needs a redeploy.

## 9. Deployment assumptions

- Vercel builds `main` on push (production). Other branches build previews.
- `outputFileTracingIncludes` bundles `private/cv/**` into the CV document
  function.
- Security headers (nosniff, Referrer-Policy, X-Frame-Options SAMEORIGIN,
  Permissions-Policy, HSTS) come from `next.config.ts`. **No CSP**, deliberately:
  Next's inline hydration scripts and the theme script would need per-request
  nonces (see the comment in `next.config.ts`).
- Images: default `next/image` optimiser (Next 16 default quality 75), no remote patterns.

## 10. Architectural decisions (keep unless deliberately revisited)

1. **Content as typed TS, not a CMS**: type errors catch broken content at build time.
2. **Two-level project model** (overview → case study), driven by one `Project` type.
3. **Optional fields render only when present**, so projects can be as deep as their evidence.
4. **Theme swap in CSS, not JS**, so there is no flash and components stay server components.
5. **Integrations chosen by environment variables** and failing soft (the
   heatmap hides, contact answers 503) rather than breaking the page.
6. **No CSP until nonces are threaded properly.**
