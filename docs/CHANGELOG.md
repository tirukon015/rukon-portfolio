# Changelog

Significant changes, newest first. Keep entries short: what changed for a
visitor, and anything a future developer must know. Git history has the detail.

## 2026-10-01 (technical knowledge base)

### Added
- 133 new articles (about 133,000 words) written from the repositories and
  documentation of the projects themselves, in eight clusters: RPOMS engineering
  (20) and operations (13), RPOMS Print Engine (14), RPOMS AI (18), ITMS and the
  Excel stock tracker (10), SpenDrop and DriveKeep (21), ResearchForge and
  rukon-link (25), web / SEO / infrastructure (12). Every article has an SEO
  title, description, tags, related projects and related posts; 403 internal
  body links connect articles to each other and to the case studies.
- Scheduled publishing. An article's `date` is its publication date and is
  never back-dated: `publishedPosts()` hides future-dated articles from every
  listing, route, feed and sitemap until that day (Malaysia time), and the
  blog and work routes revalidate hourly to release them. 12 new articles were
  published on 2026-10-01 and, at the owner's request, the other 121 on
  2026-10-02 (dated the day they went live, not back-dated). The gate remains
  for future articles.

### Changed
- RPOMS case study and two articles: write-locked modules show an
  under-development notice in production (verified in the code), rather than
  "rendering live data".
- The Web Bluetooth article gained a dated update (backend, deployment, tests).
- The RPOMS AI article now lists `rpoms-ai` as its project.

### Not published (owner's decision)
- An article on working with an AI coding assistant, which would disclose the
  AI co-author trailers in the repositories.

## 2026-10-01

Content and SEO audit against the current state of every project repository.
No component, layout, style or route code changed.

### Added
- **RPOMS AI** (`/work/rpoms-ai`): photo inspection where a self-hosted vision
  model observes and a deterministic rule engine decides. Honest status: deployed,
  no model active in production, not yet used on line photos. RPOMS ecosystem now
  links to it.
- **rukon-link** (`/work/rukon-link`): QR link hub with gated contact details,
  first-party analytics and an admin panel. Built, not yet deployed.

### Changed
- **RPOMS**: staging line released to production on 28 Sep 2026; 958 tests
  (66 files, 17 on PGlite), ~61,400 lines; new router-model configuration
  section and the Supabase pooler incident; status, roadmap and facts updated.
- **RPOMS Print Engine**: deployed at print.rukon.dev (Ubuntu, nginx, systemd,
  PostgreSQL); 218 app + 26 backend tests; device-label module and print relay;
  ITMS print integration (branch, not merged); hidden-tab timer fix; admin role
  gating, rate limiting and audit log no longer listed as gaps.
- **ERTH**: link now points to the deployed build (erth-homepage.vercel.app) and
  the public source; TypeScript work described as the verified local Next.js
  rebuild (not deployed) rather than a team migration.
- **DriveKeep**: web app is deployed on Vercel (was "not deployed"); not linked
  because it has no sign-in.
- **SpenDrop**: version 1.4.0 (splits, money in/out, versioned schema, optional
  Supabase backup); 274/274 in-app checks and 6/6 UI tests.
- Experience, About and capability copy updated to match; RPOMS AI article
  corrected (it mixed figures from the 20 and 22 Sep evaluation runs).

### SEO
- Homepage `<title>` from `site.seoTitle` (role line and share image unchanged);
  shorter, keyword-accurate meta description.
- Person JSON-LD: `worksFor`, and `knowsAbout` extended to the current stack.
- Case-study meta descriptions rewritten; `/work` description lists the new work.

### Second pass (same day): live verification and authorship
- RPOMS: production health endpoint confirms the Supabase transaction pooler;
  the incident fix is recorded as done and removed from the roadmap.
- rukon-link: live at link.rukon.dev; status and link updated.
- DriveKeep: live web app linked.
- SpenDrop: Payment Channel / Funding Account separation, reconciliation,
  five-tab layout, learned categories and Apple Pay App Intent documented;
  unsupported "16 providers" and live-RLS wording corrected.
- ERTH: design authorship, Figma and team claims removed across the project
  entry, About, Experience, FAQ, capabilities, categories and four articles;
  ERTH's own ranking and JAS claims now attributed to ERTH. Role is
  "Web Developer" building from the client-approved design file.

### Third pass (same day): ITMS
- Added **ITMS** (`/work/itms`) as one project covering its phases: the Excel
  workflow I worked on, the web application built by another BBTech developer,
  my ongoing troubleshooting and maintenance, and the Print Engine integration
  (branch, not merged). Custom confidentiality notice states the authorship.
- Print Engine: ITMS named and linked (related-systems panel, relay section,
  status row); stated as my independent project and why the device-label
  module was built. Experience gains an ITMS bullet.
- ITMS Excel phase now described from the BBTech Stock Tracker workbook
  itself (versioned change history June 2025 to January 2026, live 1 July
  2025, SKU formulas, VBA status log and Update macro, user guide, NIIMBOT
  printing) and its weekly operational submission. The workbook is not shown
  (operational data and colleagues' names).
- SpenDrop: older in-app test screenshot caption dated (48 checks then, 274 now).
- Homepage: the full-width RPOMS dashboard screenshot under the flagship block
  was removed at the owner's request (only that instance; it remains on
  `/work`, the RPOMS overview and the case study).
- Skills: ITMS added as evidence for systems work; Excel / VBA automation added
  to the supporting tier.

### Technical
- Verified: `tsc`, lint, `next build`.

## 2026-09-26

### Technical
- Added the permanent documentation baseline: `docs/PROJECT_SPEC.md`,
  `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `COMPONENT_MAP.md`, `FEATURES.md` and
  this changelog; maintenance workflow added to `AGENTS.md`.

## 2026-09-25

### Added
- Full, evidence-based case studies with real screenshots and diagrams for
  RPOMS (synthetic demo data), ResearchForge, DriveKeep and SpenDrop.
- DriveKeep and SpenDrop as full projects (previously "upcoming"); new
  "Personal Project" badge.
- Case-study features: wide figures, click-to-full-size images, related-systems
  band, roadmap ("What's next"), source links, per-project confidentiality notice.
- Project `previewFigure` (overview screenshot and card thumbnails), `facts`
  (verified figures on homepage cards) and `shareImage` (per-project OG/Twitter image).
- "Native iOS" capability; "Live: ResearchForge" hero fact.

### Changed
- Hero portrait now rests at a soft glimpse instead of fully hidden.
- ResearchForge promoted to a featured project.
- Hero statement and homepage meta description (now ~170 characters).
- Project overview meta descriptions use the one-line value proposition.
- RPOMS figures corrected across `about.ts`, `experience.ts` and `faq.ts`.

### Fixed
- Links to private repositories now point to the GitHub profile (no visitor 404s).

### Removed
- "LMS Platform" upcoming entry: no repository or code backs it.
- TanStack Table and React Hook Form from the stack list (no project uses them).

### Technical
- Commit `ac88d39`. Verified: `tsc`, lint, build (90 pages), browser audit of
  15 pages at 390 / 834 / 1440 px, 102 links checked.

## 2026-09-25 (earlier)
- Two-tier project flow (HR overview → full case study) with category filtering
  (`a88c0a0`); RPOMS Print Engine case study (`e9af774`); ERTH role correction;
  CV contact release fix (`dbbde9a`).

## 2026-09-24
- Homepage simplified: tiered featured work replaced the grid; process,
  education and FAQ sections removed. Blog categories folded into six, with
  permanent redirects. Live GitHub contribution heatmap.

## 2026-09-06
- Content repositioned around IT Systems & Operations, Web and Software;
  verified project content; ResearchForge scope; CV put behind a request-access gate.

## 2026-09-02
- UI polish: viewport spacing, typography, container max-width overrides.

## 2026-08-25
- Initial portfolio build.

---

### Entry template

```
## YYYY-MM-DD

### Added
- ...
### Changed
- ...
### Fixed
- ...
### Technical
- ...
```
