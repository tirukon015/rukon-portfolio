# Component map

Where each piece of the UI lives and what uses it. Paths are relative to `src/`.
"(client)" marks client components.

## Page composition

| Route | File | Composed of |
| --- | --- | --- |
| all | `app/layout.tsx` | `ThemeProvider`, `Header`, `Footer`, `JsonLd` (Person, WebSite) |
| `/` | `app/page.tsx` | `Hero` → `FeaturedWork` → `GithubActivity` → `Capabilities` → `Experience` → `About` → `LatestWriting` → `Contact` |
| `/work` | `app/work/page.tsx` | `Breadcrumbs`, `WorkFilter` (client), which renders the `HRProjectCard` list and `UpcomingProjectCard` (when upcoming items exist) |
| `/work/[slug]` | `app/work/[slug]/page.tsx` | page-local layout: badges, `ProjectMark`, value proposition, `previewFigure`, meta grid, highlights, `Tag`, CTA, related posts |
| `/work/[slug]/case-study` | `app/work/[slug]/case-study/page.tsx` | page-local: header meta, workflow strip, ecosystem band, sections with figures and notes, status table, tech groups, limitations, roadmap, links, notice |
| `/blog` | `app/blog/page.tsx` | `BlogIndex` |
| `/blog/category/[slug]` | `app/blog/category/[slug]/page.tsx` | `PostList` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `PostBody`, related links, `opengraph-image.tsx` |
| `/cv` | `app/cv/page.tsx` | `Breadcrumbs`, `CVAccess` (client) |

## Layout

| Component | File | Notes |
| --- | --- | --- |
| Header (client) | `components/layout/header.tsx` | nav from `content/site.ts` `nav`; active section via `lib/use-active-section.ts`; mobile menu below `md`; `ThemeToggle` |
| Footer | `components/layout/footer.tsx` | links from `site.links`, `footerLinks` |

## Homepage sections (`components/sections/`)

| Component | Anchor | Data | Notes |
| --- | --- | --- | --- |
| `hero.tsx` | `#hero` | `site.headline`, `statement`, `now`, `cvHref` | uses `CursorGrid`, `HeroSpotlight` |
| `featured-work.tsx` | `#work` | `getProjectsByTier()`, `upcomingWork` | internal `Flagship`, `FlagshipVisual`, `Featured`, `SecondaryList`; shows `previewFigure`, `facts`, `status` |
| `github-activity.tsx` | n/a | `lib/github/contributions.ts` | server fetch; `HeatmapTooltip` (client) |
| `capabilities.tsx` | `#capabilities` | `content/skills.ts` `capabilities`, `stack` | evidence links resolve through `getProject()` |
| `experience.tsx` | n/a | `content/experience.ts` | |
| `about.tsx` | `#about` | `content/about.ts` | |
| `latest-writing.tsx` | n/a | posts index | |
| `contact.tsx` (client) | `#contact` | posts to `/api/contact` | |
| `blog-index.tsx` | n/a | posts + categories | used by `/blog` |
| `cv-access.tsx` → `CVAccess` (client) | n/a | `/api/cv/*` | used by `/cv` |

## Work components (`components/work/`)

| Component | Used by | Notes |
| --- | --- | --- |
| `hr-project-card.tsx` | `/work` (via `WorkFilter`) | thumbnail from `previewFigure`, badges (NDA-Safe, University/Personal Project), value proposition, up to 5 highlights, 6 technologies |
| `upcoming-project-card.tsx` | `/work` (via `WorkFilter`) | renders `upcomingProjects` (empty at baseline) |
| `work-filter.tsx` (client) | `/work` | category filter from `projectCategories` |

## Blog components (`components/blog/`)

| Component | Notes |
| --- | --- |
| `post-body.tsx` | renders section blocks: list, code, callout, flow, image, table |
| `post-list.tsx` | article rows |

## UI primitives (`components/ui/`): extend these, don't duplicate

| Component | Props | Use |
| --- | --- | --- |
| `Container` | `className` (a `max-w-*` overrides the 6xl default) | every section's horizontal frame |
| `Reveal` (client) | `delayMs`, `as: div\|li`, `className` | scroll-in animation wrapper |
| `SectionHeading` | `eyebrow`, `title`, `description?` | section titles |
| `Button`, `ButtonLink` | `variant: primary\|secondary\|ghost`, `external`, `download` | all buttons |
| `Tag` | children | technology chips |
| `Breadcrumbs` | `items: Crumb[]` | inner pages (pair with `breadcrumbSchema`) |
| `ProjectMark` | `project`, size, classes | project logo with dark/light variants and text fallback |

## Other shared components

| Component | File | Notes |
| --- | --- | --- |
| `HeroSpotlight` (client) | `components/hero-spotlight.tsx` | portrait reveal; tunables at top (`RESTING_STRENGTH`, radii, opacity) |
| `CursorGrid` (client) | `components/cursor-grid.tsx` | hero background grid glow |
| `HeatmapTooltip` (client) | `components/heatmap-tooltip.tsx` | contribution tooltip |
| `ThemeProvider`, `ThemeToggle` (client) | `components/theme-*.tsx` | `next-themes`, `attribute="data-theme"`, default system |
| `JsonLd` | `components/seo/json-ld.tsx` | structured data script |
| Icons | `components/icons.tsx` | brand icons not in lucide |

## Libraries (`lib/`)

| File | Provides |
| --- | --- |
| `seo.ts` | `BASE_URL`, `absoluteUrl`, schema builders, `openGraphFor`, `twitterFor`, `OG_IMAGE` |
| `cv-access/*` | CV grant, gated contact and document, access-request service |
| `github/contributions.ts` | contribution calendar fetch (GraphQL, revalidate 1 h) |
| `use-active-section.ts`, `use-media-query.ts`, `use-mounted.ts` | client hooks |
| `reading-time.ts`, `utils.ts` (`cn`) | helpers |

## Where to change common things

| Change | File |
| --- | --- |
| Hero text, facts, nav, meta description, socials | `content/site.ts` |
| Add or edit a project (cards, both project pages, sitemap) | `content/projects.ts` + `public/images/<slug>/` |
| Capabilities or stack | `content/skills.ts` |
| Experience / About / CV page data | `content/experience.ts`, `about.ts`, `cv.ts`, `education.ts` |
| New article | `content/posts/articles/<slug>.ts` + register in `content/posts/index.ts` |
| Blog categories | `content/categories.ts` (+ a redirect if a slug changes) |
| Colours, type scale, motion | `app/globals.css` |
| Security headers, redirects | `next.config.ts` |
