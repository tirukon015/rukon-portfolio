# Project specification: rukon.dev

The functional specification of the portfolio as it is. The current code is the
source of truth; this file says what it does and what must not change by
accident. Baseline: `main` @ `ac88d39` (2026-09-25).

Related: [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [ARCHITECTURE](ARCHITECTURE.md) ·
[COMPONENT_MAP](COMPONENT_MAP.md) · [FEATURES](FEATURES.md) · [CHANGELOG](CHANGELOG.md)

---

## 1. Purpose

A personal portfolio and technical blog for Touhidul Islam Rukon. It should let a
recruiter or hiring manager understand quickly who the owner is (IT Systems &
Operations Lead, web and software), what was built, what the owner personally did,
and how the systems work, backed by evidence (real screenshots, status tables,
tests, links), never by unverified claims.

Production host: `https://www.rukon.dev` (apex redirects to `www`; see
`site.canonicalHost`). Deployed on Vercel from `main`.

## 2. Routes

| Route | Type | Content |
| --- | --- | --- |
| `/` | static | Homepage (sections in §3) |
| `/work` | static | All projects as HR cards, filterable by category |
| `/work/[slug]` | SSG | Level 1: HR project overview |
| `/work/[slug]/case-study` | SSG | Level 2: full technical case study |
| `/blog` | static | Article index with category filter |
| `/blog/[slug]` | SSG | Article; per-article OG image at `/blog/[slug]/opengraph-image` |
| `/blog/category/[slug]` | SSG | Category page (6 categories) |
| `/cv` | dynamic | CV request-access gate and viewer |
| `/feed.xml` | static | RSS feed of articles |
| `/sitemap.xml`, `/robots.txt` | static | Generated from content |
| `/opengraph-image`, `/icon` | static | Generated site images |
| `/api/contact` | POST | Contact form → Resend email |
| `/api/cv/request-access` | POST | Issues a signed CV access grant |
| `/api/cv/contact` | GET | Gated contact details (needs a grant) |
| `/api/cv/document` | GET | Gated CV PDF (needs a grant) |

Project slugs today: `rpoms`, `rpoms-print-engine`, `erth`, `researchforge`,
`rpoms-ai`, `itms`, `drivekeep`, `spendrop`, `rukon-link`. Both project routes are generated from
`src/content/projects.ts`; adding a project there creates both pages, the sitemap
entries and the homepage card.

Old blog URLs permanently redirect (`next.config.ts` `permanentRedirects`). **Never
delete a redirect**; indexed links depend on them.

## 3. Homepage structure (in order, `src/app/page.tsx`)

1. **Hero** (`#hero`): statement headline, paragraph, CTA "See the work" and a
   Resume link, "now" facts (Role / Shipped / Live / Status), and the portrait
   spotlight.
2. **Selected Work** (`#work`): three visual tiers from project data:
   flagship (RPOMS: copy, facts row, workflow + ecosystem panel; the
   full-width screenshot was removed on request on 2026-10-01), featured (alternating screenshot/mark + copy), then an
   "Other work" list.
3. **GitHub activity**: live contribution heatmap (server-fetched, cached 1 h).
4. **What I Build** (`#capabilities`): five capability areas, each naming the
   projects that evidence it, then the stack as one sentence.
5. **Experience**: roles from `src/content/experience.ts`.
6. **About** (`#about`).
7. **Latest writing**: most recent articles.
8. **Contact** (`#contact`): form to `/api/contact`, email link, socials.

Header nav: Work · About · Blog · Resume · Contact, plus the theme toggle. Anchor
items highlight by scroll position on `/`, route items by pathname elsewhere.

## 4. Project pages: the two-level model

- **Level 1, `/work/[slug]`**: scannable in 10–20 seconds. Value proposition,
  summary, optional `previewFigure` screenshot, role / context / period /
  category, key highlights, technologies, CTA to the case study, links,
  confidentiality notice if confidential, related articles.
- **Level 2, `/work/[slug]/case-study`**: header with role, affiliation,
  timeline; workflow strip; related-systems band (if `ecosystem`); numbered
  sections with paragraphs, figures (normal or `wide`) and notes; "What's live,
  and what isn't" status table; grouped tech stack; limitations; "What's next"
  (roadmap); source links; confidentiality notice; related writing.

Content rules for every project (enforced by review, not code):

- **Status honesty.** `status` states are `implemented` (live), `available`
  (built, not live) and `not-connected`. Never mark planned, demo, local-only or
  unreleased work as `implemented`.
- **Evidence.** Every number in `summary`, `facts` or highlights must be
  checkable in the project's repository or case study. No invented metrics.
- **Screenshots** are of the real application. For confidential work (RPOMS)
  they are taken on synthetic demo data only; `confidentialNotice` says so.
- **Private repositories** link to the GitHub profile with the label
  "GitHub profile (X repository is private)", never to a URL that 404s for
  visitors.

## 5. Blog

28 articles in `src/content/posts/articles/*.ts`, registered in
`src/content/posts/index.ts`. Six categories (`src/content/categories.ts`):
Building Real Systems, Full-Stack Development, AI & Automation, UI/UX & Product,
Developer Journey, Malaysia & Cyberjaya. Articles can list `relatedProjects`,
which feeds "Writing from this work" on project pages. Body blocks: paragraphs,
list, code, callout, flow, image, table.

## 6. CV access

`/cv` is a request-access gate: name + email → `/api/cv/request-access` issues an
HMAC-signed grant (`CV_ACCESS_SECRET`). With the grant, the page can fetch the
contact details (`/api/cv/contact`, from `CV_CONTACT_*` env vars, never in client
bundles) and the PDF (`/api/cv/document`, from `CV_DOCUMENT_URL` or the bundled
`private/cv/` file). Requests are recorded by a **mock, in-memory** service
(`src/lib/cv-access/mock-service.ts`), which is not durable; a Supabase
implementation is the documented next step.

> **Known exposure:** `private/cv/Touhidul-Islam-Rukon-CV.pdf` is tracked in git
> (`.gitignore` exceptions added in `dbbde9a`) and the repository is **public**, so
> the PDF can be downloaded from GitHub without the gate. Decide whether to keep
> that trade-off or move the PDF to `CV_DOCUMENT_URL` storage.

## 7. Responsive behaviour

- Designed mobile-first; verified at 390, 834 and 1440 px with no horizontal
  overflow.
- Header collapses to a menu button below `md` (768 px).
- Hero: one column below `lg`, portrait under the copy; two columns from `lg`.
- Case-study figures marked `wide` break out of the 768 px reading column to up
  to 1152 px from `md`, always keeping a 2 rem margin.
- Heatmap scrolls horizontally inside its own container on narrow screens.

## 8. External integrations

| Integration | Used for | Env | If missing |
| --- | --- | --- | --- |
| Resend | Contact form email | `RESEND_API_KEY` | `/api/contact` answers 503 |
| GitHub GraphQL | Contribution heatmap | `GITHUB_TOKEN` | section shows an "unavailable" state |
| CV storage | Gated PDF | `CV_DOCUMENT_URL`, `CV_DOCUMENT_TOKEN` | falls back to `private/cv/` |
| Vercel | Hosting | n/a | n/a |

## 9. Constraints: do not change by accident

1. **Two-level project flow** and its URLs (`/work/[slug]`, `/work/[slug]/case-study`).
2. **Status honesty** (§4). This is the site's credibility.
3. **Dark is the foundation theme**; light is `[data-theme="light"]`. Theme is set
   before paint by `next-themes`; do not add a client-side theme read that
   causes a flash.
4. **Canonical host is `www.rukon.dev`**; all absolute URLs come from `src/lib/seo.ts`.
5. **Structured data mirrors visible content.** Remove the JSON-LD when a section is removed.
6. **Redirects in `next.config.ts` are permanent**; add, never remove.
7. **No client-side exposure of contact details**; they stay server-side behind the CV grant.
8. **Next.js 16 conventions**: read `node_modules/next/dist/docs/` before using an
   API; for example `next/image` `priority` is deprecated in favour of `preload`.
9. **One design system** (see DESIGN_SYSTEM). No second palette, font or button style.
