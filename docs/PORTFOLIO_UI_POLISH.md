# Portfolio UI Polish and Responsive Layout Fixes

Date: 2026-09-02

## Overview

A corrective UI and responsive-layout pass. **This was not a redesign.**

The existing visual identity was preserved in full: the colour system, dark
theme, typography family, background grid, component styles, navigation,
buttons, cards, animations and hover behaviour are unchanged. `globals.css` was
not modified. No dependency was added or removed.

The work covered five things:

1. Viewport composition of the homepage hero.
2. Responsive vertical spacing across all sections.
3. Typography breakpoint containment.
4. Removal of long Unicode dash characters from user-facing content.
5. Regression verification (build, routes, metadata, structured data,
   accessibility, internal links).

## Problems identified

Established by direct source inspection and by headless-Chrome screenshots of
the running production build at 1440x900.

| # | Problem | Evidence |
| --- | --- | --- |
| 1 | Roughly 131px of empty vertical space between the header and the first hero element ("Open to opportunities"). | Screenshot at 1440x900. Header bottom edge at y=65, badge top edge at y=196. |
| 2 | Hero content extended past the fold. The social-icon row was not visible at 900px viewport height. | Same screenshot. |
| 3 | `min-height` expressed in `vh`, which on mobile browsers is measured against the largest viewport and grows when browser UI retracts. | `src/components/sections/hero.tsx` |
| 4 | Section vertical padding was a single fixed value at every breakpoint, so mobile carried desktop-sized gaps. | `py-28` used on 9 sections with no responsive variant. |
| 5 | The name dropped to its largest size at the `md` breakpoint (768px), where the column is narrowest relative to the type size. | `src/components/sections/hero.tsx` |
| 6 | 129 long Unicode dash characters in source and documentation. | Repository-wide search. |

## Root cause

Three independent rules stacked on top of each other in
`src/components/sections/hero.tsx`:

```
line 15  <section className="... flex min-h-[92vh] items-center ...">
line 23  <Container className="relative z-10 py-32">
```

combined with the header in `src/components/layout/header.tsx`:

```
line 50  className="sticky top-0 z-50 ..."
line 56  className="... flex h-16 ..."
```

Mechanism:

1. `min-h-[92vh]` forced the section to at least 828px at a 900px viewport.
2. `py-32` added 128px of padding above the content and 128px below.
3. `flex items-center` vertically centred the content box inside that
   minimum height, adding further space above it whenever the content was
   shorter than the minimum.
4. The header is `sticky top-0`, so it overlays the first 64px of the hero.
   That 64px is consumed before any hero padding begins.

The dominant contributor at 1440x900 was the 128px of top padding sitting
underneath a 64px sticky header. `min-h-[92vh]` contributed little at that
particular size but is the rule that would have caused the mobile
viewport-unit problem, so it was removed as well.

`src/app/globals.css` contains no height, width or overflow rules and was not
a contributor. It was not modified.

## Implementation

### `src/components/sections/hero.tsx`

| Change | From | To | Why |
| --- | --- | --- | --- |
| Section height | `flex min-h-[92vh] items-center` | (removed) | Lets the hero size to its content. Also removes the `vh` unit, so mobile browser UI cannot inflate the section. Once `min-height` was gone, `flex items-center` was inert, and it additionally made `Container` a flex item with `min-width: auto`. Both were removed together. |
| Container padding | `py-32` | `pt-20 pb-24 lg:pt-24 lg:pb-28` | Reduces top padding from 128px to 80px on small screens and 96px on large, which is the single largest contributor to the gap. Bottom padding is kept larger than top because the header already occupies visual space at the top. |
| Name type scale | `text-5xl sm:text-6xl md:text-7xl` | `text-5xl sm:text-6xl lg:text-7xl` | Moves the 72px size from `md` (768px) to `lg` (1024px). Tablets get 60px, where the column is proportionally narrower. The name remains the largest element on the page at every breakpoint. |
| Button row margin | `mt-10` | `mt-8` | Recovers 8px. |
| Social row margin | `mt-10` | `mt-8` | Recovers 8px. |
| Text column | `<div>` | `<div className="min-w-0">` | Defensive. A grid item defaults to `min-width: auto` and will not shrink below its widest child's min-content width. Added so the monospace proof list can never widen the column past its container. |

### Section spacing, 14 files

Fixed vertical padding replaced with responsive padding. **Desktop spacing is
unchanged**; only small and medium breakpoints were tightened.

| From | To | Occurrences |
| --- | --- | --- |
| `py-28` | `py-20 sm:py-24 lg:py-28` | 9 |
| `py-24` | `py-16 sm:py-20 lg:py-24` | 3 |
| `py-20` | `py-16 sm:py-20` | 2 |

### Result, measured

Homepage at 1440x900, headless Chrome screenshots before and after:

| Measure | Before | After |
| --- | --- | --- |
| Header bottom to first hero element | 131px | 99px |
| Hero content fully above the 900px fold | No, social row cut off | Yes, badge through social row all visible |

## Unicode dash cleanup

The following characters are now avoided in the repository:

- U+2014 EM DASH
- U+2013 EN DASH
- U+2015 HORIZONTAL BAR
- U+2012 FIGURE DASH

Ordinary hyphen-minus (`-`) is unaffected and remains in compound words such as
`full-stack`, `production-operations`, `design-to-code` and `router-refurbishment`.

### Result

Repository-wide search, excluding `node_modules`, `.next` and `.vercel`:

| Scope | Before | After |
| --- | --- | --- |
| `src/` (application source) | 79 | 0 |
| Documentation and planning files | 50 | 0 |
| **Total** | **129** | **0** |

U+2015 and U+2012 were searched for and were not present at any point.

`AGENTS.md` retains 2 em dashes and was deliberately excluded: it is generated
and re-written by `next dev` (see `CLAUDE.md`), so edits to it are reverted
automatically.

Rendered HTML was checked separately. Nine routes were fetched from the running
production build and searched for the four prohibited characters. All returned
zero.

### Method and one correction

Replacement was performed with explicit string pairs for titles, separators and
labels, plus a rule converting remaining prose dashes to commas, followed by a
manual review of every changed line. The final source diff against the
pre-cleanup copy is 175 changed lines, 90 of them additions (this figure also
includes the layout changes described above, which were made in the same pass).

That review caught two problems, both fixed:

1. A punctuation-tidy regex (`,\s+\.` collapsed to `.`) corrupted JavaScript
   spread operators in 9 places across 7 files, for example
   `[...staticRoutes, ...projectRoutes]` became `[...staticRoutes...projectRoutes]`.
   `src/` was restored from a pre-change copy and the cleanup re-run without
   that rule.
2. Eighteen sentences became comma splices or ambiguous lists when a paired em
   dash became a comma. Each was rewritten by hand to use a colon, parentheses
   or a conjunction.

## Responsive QA

Verified with headless Chrome (`--headless=new`) against the local production
build (`next start`), inspecting each screenshot.

### Important limitation

**Headless Chrome on this machine clamps the browser window to approximately
484px minimum width.** Requesting a window narrower than that produces a
screenshot that is a *crop* of a ~484px render, not a true narrow-viewport
layout. This was established by screenshotting the framework's own centred 404
page at a requested 320px and measuring where its horizontally-centred content
block sat, which implied a layout width of about 484px rather than 320px.

Screenshots below roughly 480px are therefore not valid evidence, and viewports
in that range are reported as NOT VERIFIED rather than PASS.

| Viewport | Result | Notes |
| --- | --- | --- |
| 1440x900 | PASS | Before/after compared. Full hero above the fold. No overflow. |
| 1440x800 | PASS | Captured and inspected. |
| 1536x864 | PASS | Captured and inspected. |
| 1366x768 | PASS | Captured and inspected. |
| 1280x800 | PASS | Captured and inspected. |
| 1280x720 | PASS | Captured and inspected. |
| 1024x768 | PASS | Captured and inspected. |
| 768x1024 | PASS | Captured and inspected. |
| 560x900 | PASS | Smallest reliably-rendered width. Single-column layout, mobile header controls present, no horizontal overflow, full hero above the fold. |
| 430x932 | NOT VERIFIED | Below the headless clamp. |
| 390x844 | NOT VERIFIED | Below the headless clamp. |
| 375x812 | NOT VERIFIED | Below the headless clamp. |
| 360px | NOT VERIFIED | Below the headless clamp. |
| 320px | NOT VERIFIED | Below the headless clamp. |

### What was checked at verified widths

| Check | Result |
| --- | --- |
| Horizontal overflow | None observed at 560px and above. |
| Hero clipping | None. Full hero visible at 1440x900 and 560x900. |
| Heading wrapping | Name wraps to two lines at 1440 and one line at 560. Both intentional and uncropped. |
| Button overflow | None. Button row wraps correctly. |
| Card overflow | None on `/work`, `/blog`, `/blog/category/operations`. |
| Navigation overflow | None. Desktop nav at wide widths, hamburger and theme toggle at 560px. |
| Excessive whitespace | Reduced. See the measured table above. |
| Footer spacing | Unchanged, no regression observed. |
| Blog layouts | Index, category and article pages captured and inspected at 1440x900. |
| Project layouts | `/work`, `/work/rpoms`, `/work/erth` captured and inspected at 1440x900. |
| Mobile viewport behaviour (`vh` inflation) | Addressed structurally by removing the only `vh` unit in the codebase. **Not verified on a real mobile browser.** |

## Route QA

Automated checks against the local production build. Visual QA means a
screenshot was captured at 1440x900 and inspected.

| Route | HTTP | Visual QA | Result |
| --- | --- | --- | --- |
| `/` | 200 | Yes | PASS |
| `/work` | 200 | Yes | PASS |
| `/work/rpoms` | 200 | Yes | PASS |
| `/work/researchforge` | 200 | No | PASS (HTTP, metadata, schema) |
| `/work/erth` | 200 | Yes | PASS |
| `/blog` | 200 | Yes | PASS |
| `/blog/category/operations` | 200 | Yes | PASS |
| `/blog/category/{it-systems, software-engineering, business-automation, web-development, ui-ux}` | 200 | No | PASS (HTTP) |
| `/blog/{15 article slugs}` | 200 | 1 of 15 | PASS (HTTP), one inspected |
| `/sitemap.xml` | 200 | n/a | PASS, 27 URLs |
| `/robots.txt` | 200 | n/a | PASS |
| `/opengraph-image` | 200 | n/a | PASS |
| Unknown routes (`/nope`, `/blog/x`, `/work/x`, `/blog/category/x`) | 404 | n/a | PASS |

There is no `/about` route. About is a section of the homepage (`/#about`).
Contact is likewise a homepage section (`/#contact`).

Internal links: all 27 pages reachable from `/` were crawled. **0 broken links,
0 broken assets.**

## SEO regression check

No intentional SEO architecture changes were made in this pass. The metadata,
canonical, Open Graph, Twitter, sitemap, robots and JSON-LD implementation is
unchanged in structure.

Verified after the changes, across 10 sampled routes:

| Item | Result |
| --- | --- |
| Title, unique per route, template applied | PASS |
| Meta description, unique per route | PASS |
| Canonical, self-referencing | PASS |
| Open Graph, including `og:image` and `og:locale=en_MY` | PASS |
| Twitter `summary_large_image` | PASS |
| Sitemap, 27 URLs | PASS |
| Robots | PASS |
| JSON-LD parses, all node types present | PASS |
| `FAQPage` schema matches visible FAQ text exactly | PASS, 10 of 10 |
| Duplicate canonical / description / title tags | None |

**Text that changed because of the dash cleanup** and therefore appears in
metadata and structured data:

- `site.role`: now "Software Developer, Operations and AI Systems". This feeds
  the homepage title, `og:title`, `twitter:title`, the OG image alt text and the
  `Person.jobTitle` and `ProfilePage.name` schema fields.
- `site.statement`: the site-wide meta description. One em dash became a comma.
- Page title template: now `%s | Touhidul Islam Rukon`.
- Category page titles: now `{Category} Writing`.
- Project `fullName` and `role` fields, category descriptions, capability
  descriptions and FAQ answers: punctuation only, no change of meaning.

## Accessibility

Manual accessibility regression checks were performed with an automated
structural script plus screenshot inspection. This was **not** a full WCAG
audit and no conformance level is claimed.

| Check | Result |
| --- | --- |
| Exactly one `h1` per page | PASS, 8 routes checked |
| No skipped heading levels | PASS, 8 routes checked |
| All `img` elements have `alt` | PASS |
| `main`, `nav`, `header`, `footer` landmarks present | PASS |
| `html` has a `lang` attribute (`en-MY`) | PASS |
| All links have an accessible name | PASS |
| All buttons have an accessible name | PASS |
| Breadcrumb navigation labelled | PASS on all non-home routes |
| Focus states | Not re-tested in this pass. No focus-related CSS was modified. |
| Keyboard navigation | Not re-tested in this pass. No interactive markup was modified. |
| Text clipping | None observed at verified widths. |

## Verification

Commands are the project's own, from `package.json`.

- Lint (`npm run lint`): **PASS**, 0 errors, 0 warnings
- Typecheck (`npx tsc --noEmit`): **PASS**, 0 errors
- Production build (`npm run build`): **PASS**, 35 routes generated
- Automated tests: **N/A.** No test suite is configured for this project. The
  `package.json` scripts are `dev`, `build`, `start`, `lint`.

## Before and after

### Before

- 131px of empty vertical space between the header and the first hero element.
- Hero content ran past the fold at 900px height; the social-icon row was cut off.
- The hero was pinned to `min-h-[92vh]`, the only `vh` unit in the codebase.
- Section padding was a single fixed value at every breakpoint.
- 129 long Unicode dash characters across source and documentation.

### After

- 99px between the header and the first hero element.
- The entire hero fits above the fold at 1440x900.
- The hero sizes to its content. No `vh` units remain in the codebase.
- Section padding scales across three breakpoints; desktop rhythm unchanged.
- 0 prohibited dash characters, excluding the auto-generated `AGENTS.md`.
- Visual identity, components, colours, typography family and animations
  unchanged.

## Known issues, not fixed in this pass

1. **`Container` max-width override does not apply.** `src/components/ui/container.tsx`
   sets `max-w-6xl`. Callers that pass `className="max-w-3xl"` (blog articles and
   case-study bodies) do not get a narrower column, because `cn()` in
   `src/lib/utils.ts` is a plain string join with no Tailwind conflict
   resolution, so both classes are emitted and the wider one wins. Article body
   text therefore renders at roughly 1090px measure at 1440px viewport, wider
   than a comfortable reading line. This is **pre-existing** and was left alone
   because fixing it would visibly change the layout of every article and case
   study, which is outside the scope of a corrective polish pass.

2. **Sub-480px viewports are unverified.** See the responsive QA limitation
   above. Verifying these needs either a real device, a browser with device
   emulation driven over the DevTools Protocol, or a headless browser without
   the minimum-window-width clamp.

## Changelog

### UI and layout
- Removed the forced `min-h-[92vh]` and the vertical centering wrapper from the
  homepage hero.
- Reduced hero container padding and made it responsive.
- Moved the largest name type size from the `md` breakpoint to `lg`.
- Made section vertical padding responsive across 14 files; desktop unchanged.
- Added `min-w-0` to the hero text column as a defensive grid-shrink guard.

### Content
- Removed all U+2014 and U+2013 characters from source and documentation.
- Rewrote 18 sentences by hand where the replacement would have produced a
  comma splice or an ambiguous list.
- Preserved all substantive content. No blog article body was modified.

### Documentation
- Created this document.
- Updated a stale rule in `content-planning/README.md` and
  `content-planning/blog-database.json` that still forbade Figma claims, which
  was superseded when the ERTH V2.3 prototype was accepted as evidence.

### QA
- Ran lint, typecheck and production build.
- Crawled all 27 internal routes and checked every internal link and asset.
- Re-validated metadata and JSON-LD on 10 routes.
- Re-checked accessibility structure on 8 routes.
- Captured and inspected screenshots at 9 viewport sizes and 6 routes.

## Git

Repository: `https://github.com/tirukon015/rukon-portfolio` (public)

Branch: `main`

Commit: `28ade95` "fix: polish viewport spacing and typography punctuation"

Push: **SUCCESS** (`81d9759..28ade95  main -> main`)

The local working copy was not a Git repository. Rather than re-clone, it was
initialised in place, pointed at the existing remote, and `git reset --soft
origin/main` was used to set HEAD to the remote commit without touching the
working tree. **Existing history is intact**: `b87c038` and `81d9759` are still
the first two commits.

39 paths were committed. `node_modules`, `.next`, `.vercel` and `.env.local`
were confirmed ignored, and no key, certificate or token-bearing file was
staged.

## Deployment

Platform: Vercel, project `rpoms/rukon-portfolio` (existing project, unchanged
domain and DNS)

Deployment: **SUCCESS**, `rukon-portfolio-9nmjmw9eu-rpoms.vercel.app`, target
production

Production URL: `https://www.rukon.dev`

### Post-deployment verification, performed against the live site

| Check | Result |
| --- | --- |
| `https://rukon.dev` | 200 |
| `https://www.rukon.dev` | 200 |
| `/work`, `/work/rpoms`, `/work/researchforge`, `/work/erth` | 200 |
| `/blog`, `/blog/category/operations`, one article route | 200 |
| `/sitemap.xml` | 200, 27 URLs |
| `/robots.txt` | 200 |
| Canonical on `/` | `https://rukon.dev` |
| `og:locale` | `en_MY` |
| `twitter:card` | `summary_large_image` |
| JSON-LD blocks on `/` | 4 |
| Prohibited dash characters across 9 live routes | 0 |
| Homepage screenshot at 1440x900 | Captured and inspected. Full hero above the fold, corrected spacing, no em dash in the role line. |

