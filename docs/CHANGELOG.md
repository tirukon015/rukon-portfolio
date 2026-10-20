# Changelog

Significant changes, newest first. Keep entries short: what changed for a
visitor, and anything a future developer must know. Git history has the detail.

## 2026-10-20

### Added
- **BBTech Laptop Inspection Tool** (`/work/bbtech-laptop-inspection-tool`,
  secondary): Python and PySide6 driver inspection and official-source repair
  tool, written up from its repository docs and test suite (98 tests, v1.0.0
  installer and portable EXE). Linked from the BBTech experience entry and the
  systems capability. Mark from the project's own `assets/logo.png`, with a
  dark-theme variant.
- **RPOMS case study, October 2026 section**: the 12 October production
  release, the historical router archive, and the Refining and Printing
  workstation, Google sign-in with per-service access and Registry hardening
  that are on staging with a 20 October handover package. Status table,
  roadmap and the home-card fact (1,637 tests on the staging release) updated.
  Every staging item is labelled as such; production is the 12 October release.
- **RPOMS Print Engine**: RPOMS link (engine tab answers label requests from
  allow-listed RPOMS origins), gated deploys and approved migrations, second
  hostname, 320 app and 42 backend tests; production commit 9d46377 of
  19 October confirmed from the live health endpoint.
- **ERTH Router Retest & Distribution** is now listed in the RPOMS ecosystem
  (and links back to RPOMS), as a related system on its own database.

### Changed
- **ITMS**: the printing integration is recorded as merged and deployed on
  4 October 2026 (commit 0f67de6) everywhere on the page; the status table,
  note and roadmap no longer say it is on a branch.
- **Marks** for BBTech Laptop Tool, ERTH Router Retest & Distribution and
  DriveKeep (`public/images/*-mark.{png,svg}`), taken from each project's own
  branding assets, so their cards no longer fall back to a text wordmark.

### Changed
- **WiFi Router Diagnostic Tool is hidden** for now: a `hidden` flag on
  `Project` keeps an entry out of the exported `projects` list, so it has no
  card, route or sitemap entry. The write-up stays in `content/projects.ts`
  and the flag can be removed when it is ready to show. The one article that
  linked to its page now names the tool without a link.
- **Homepage featured blocks** always show the project mark. ResearchForge
  previously showed its analysis screenshot there while ERTH and the other
  featured projects showed a logo; the screenshot still appears on
  `/work/researchforge` and in the `/work` list (`sections/featured-work.tsx`).

## 2026-10-13 (comprehensive engineering & portfolio update)

### Added
- **5 new project case studies** added to `/work`:
  - **BBTech Laptop Tool** (`/work/bbtech-laptop-tool`): Portable .NET 8 WPF utility extracting immutable SMBIOS hardware serials, battery health, and encrypted on-device QC histories; 685 automated unit tests.
  - **WiFi Router Diagnostic Tool** (`/work/router-diagnostic`): Automated network recovery and multi-vendor LAN serial extraction across Kaon, Huawei, and TP-Link; 84 verified assertions (v2.6.0). Authored by Bijoy Shariar; operational testing and diagnostic contributions by Rukon.
  - **ERTH Router Retest & Distribution** (`/work/erth-router-distribution`): Floor operations Next.js 15 app tracking multi-tiered router cleaning quotas (L1–L4) and cleaner productivity points; dedicated PostgreSQL database and Google OIDC PKCE.
  - **Startup Research Hub** (`/work/startup-research-hub`): Zero-dependency single-file 238 KB market intelligence platform analyzing 100 Malaysian YC business models and a 50-company AI financial watchlist.
  - **LinkNest** (`/work/link-nest`): Multi-tenant digital profile SaaS with 1 Super + 5 Standard link hierarchy, privacy-preserving contact broker, WhatsApp presets (+60, +880), and Supabase RLS.
- **6 new technical deep dive articles** added to `/blog` (161 -> 167 total):
  - `supabase-connection-pool-exhaustion-supavisor-production` (Incident postmortem INC-2026-10-11-01)
  - `swiftdata-local-first-outbox-sync-engine` (SpenDrop iOS 0.240 ms local-first outbox sync)
  - `hardware-identity-vs-generated-stock-prefixes-refurbishment` (ITMS vs SMBIOS hardware identity audit)
  - `excluding-damaged-monitor-strip-windows-appbar-api` (WorkAreaGuard Win32 SHAppBarMessage margin reservation)
  - `lan-serial-number-extraction-across-router-vendors` (Router Diagnostic v2.6.0 UPnP/CSTECGI/SNMP)
  - `offline-receipt-ocr-on-android-with-ml-kit` (SpenDrop Android ML Kit coroutine OCR)

- **Organic Search & Keyword Strategy**: Created master strategy specification (`docs/KEYWORD_STRATEGY.md`) establishing query-to-URL mappings, search intent clustering (Supabase, SwiftData, Win32 AppBar, reverse logistics, ML Kit OCR, and APAC recruiter intent), and SERP competitive positioning.
- **Next.js Root Error Boundary**: Implemented accessible, production-safe `src/app/error.tsx` preventing stack trace leaks while logging errors safely and offering one-click retry state recovery.

### Changed
- **Technical SEO & Crawl Budget**: Updated `src/app/robots.ts` to explicitly disallow `/api/` protecting crawl budget from internal endpoints.
- **Internal Entity Linking**: Fixed broken related post slugs, integrated the 5 newly added projects into `src/content/skills.ts` capabilities evidence, and cross-referenced `link-nest` and `erth-router-distribution` in operational articles.
- **Content Depth**: Expanded `src/content/posts/articles/offline-receipt-ocr-on-android-with-ml-kit.ts` to 605 words with EXIF rotation handling and integer-sen Room SQLite outbox transactions.
- **RPOMS**: role updated to **IT Systems & Operations Lead**; added October 2026 releases (multi-box delivery, paged history, refining scan-and-print workstation, INC-2026-10-11-01 connection pooler resolution).
- **ITMS**: updated attribution to reflect foundational Excel Stock Tracker contributions, base app by `devbbtech`, merged direct Print Engine integration and CSV export (commit `0f67de6`), and hardware identity audit.
- **SpenDrop**: updated to tri-platform parity (iOS, Android, Web), verified 0.240 ms save latency, 9,811 evaluation test cases, and Android local hardware APK status.
- **DriveKeep**: documented verified odometer OCR defect in `src/lib/ocr.ts` (`trip` regex keyword collision & ascending sort bias) and Idea-only status of live fuel-price updater.
- **ERTH**: role updated to **Figma UI/UX Designer and Website Developer** (Figma V2.3 prototype + static Vite build + Next.js 16 rebuild).
- **Experience**: updated BBTech entry with new project links and reconciled bullets.
- **Content Planning**: reconciled `content-planning/blog-database.json` with published statuses and registered topics.

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
