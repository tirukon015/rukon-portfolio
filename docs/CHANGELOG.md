# Changelog

Significant changes, newest first. Keep entries short: what changed for a
visitor, and anything a future developer must know. Git history has the detail.

## 2026-11-27 (production hardening)

### Security
- Next.js 16.3.2 → 16.4.6: fixes critical advisories (unauthenticated RCE,
  incl. the image optimisation API); `npm audit` clean.
- Screenshots and marks sanitised in the pixels: client and employer names,
  logos and client hardware models are redacted or replaced in every RPOMS
  and Print Engine screenshot, the RPOMS social image and three project
  marks. Verified by OCR over every public image.
- robots.txt disallows `/admin` and `/access`; `/access` is `noindex`.
- A link to a private repository (404 for visitors) removed.

### Fixed
- `/work`: 2.3–3.2 s server time per request → ~20 ms. Article counts no
  longer re-project every article per project, and the published/projected
  article list is cached per day.
- `/work` cards render on the server; the client filter receives only
  categories and finished markup (no project objects in the page payload).
- Mobile menu closes on browser back/forward and on an outside tap; Escape
  returns focus to the button; 44 px touch targets.
- Scroll reveal: a tall element could never meet the 15 % threshold and stayed
  invisible; it now reveals on first pixel. Content is visible without JS.
- Accessibility: contrast tokens (`text-faint` both themes, light `accent`)
  raised to ≥4.5:1; project overview is a valid `<dl>`; code blocks are
  keyboard-scrollable; work filter uses toggle buttons (`aria-pressed`).

### Added
- Blog pagination (`/blog`, `/blog/page/<n>`, 40 per page) so the index stays
  flat as the library grows; pages are in the sitemap.
- `npm run typecheck | test | check:site | check:browser`, all run in CI:
  route/link/image/metadata/JSON-LD/feed/robots/404 and confidentiality
  checks over the running build, plus a real-browser pass (console, network,
  overflow at ten widths, project clicks, mobile menu, filters, axe, CLS).
- Print Engine status: release 1.0.1 (live bundle verified).

## 2026-11-27

### Fixed (confidentiality)
- `/work` no longer ships the full project dataset to the browser. The client
  work filter imported a value from `content/projects.ts`, which bundled every
  project, including original names and a hidden project, into a client chunk.
  Categories moved to `content/project-categories.ts`; the content and
  confidentiality modules are now `server-only` (package added). Verified: no
  confidential term in any `.next/static` chunk.
- Redirects now point older aliases and original slugs to the public slugs.
  Previously three public aliases redirected to the original slugs.
- Image files renamed to public-slug names (`laptop-qc-tool-mark.png`,
  `driver-inspection-tool-mark*.png`, `e-waste-platform-mark.png`,
  `router-retest-distribution-mark.svg`).
- Code examples in five articles used client-derived identifiers that the
  render-time projection cannot rewrite; renamed to neutral ones. The JSON-LD
  example in the structured-data article now uses placeholder names and URLs.
- Removed internal switch names and a private storage name from the RPOMS case
  study. Internal working notes and a content preview report moved out of this
  repository; a preview URL was scrubbed from `PORTFOLIO_UI_POLISH.md`.

### Updated (verified against repositories, CI runs and deployments, 27 Nov)
- **RPOMS:** about 160,000 lines of TypeScript, 55 pages and 148 API route
  handlers, 3,323 tests passing in CI (26 Nov), 779 commits on the production
  branch. Control Center marked live (6 Nov release). The old write-lock status
  removed. New status rows for the 21, 23 and 27 November releases; the
  27 November features are marked *available* (deployed behind switches,
  activation not recorded). The registry's 250,000 figure is now described as
  a load test, not a production count. Limitations and roadmap updated for
  named accounts and employee IDs. The same figures updated in About,
  Experience, FAQ and CV.
- **Print Engine:** removed the claim that the health endpoint reports a commit
  (it no longer does).
- **ITMS:** Laptop Tool intake deployed to production on 8 Nov; 262 tests
  passing in CI (was 119).
- **Laptop Tool:** corrected the platform to .NET Framework 4.7.2 (it never
  targeted .NET 8); 596 tests passing in CI (was 685, which could not be
  verified); removed libraries it does not use; added the v1.2.0 release
  (UTF-8 JSON QR intake, SSD health).

## 2026-11-06

### Updated
- **Complete Portfolio Re-Audit & Technical Content Modernization**: Audited live repositories across `C:\Users\TOUHIDUL ISLAM RUKON\Desktop\Project` and modernized portfolio content to accurately reflect the latest system architectures and production releases:
  - **RPOMS Flagship Platform**: Updated to reflect modern platform reality (over 65,000 LOC TypeScript across 96 compiled routes, 2,388 automated tests passing across 198 test files, 250,000+ router registry). Added comprehensive case study sections:
    - *November 2026 Production Release*: Delivery Tracking & Electronic Proof of Delivery (ePOD) (`RPOMS_DELIVERY_TRACKING=1`, `RPOMS_EVIDENCE_STORAGE=vercel-blob`), Customer Portal (`/cp/do/[id]`), permanent PIN-protected QR codes, Word DO generator byte-for-byte with embedded QR verification, mobile digital signature capture directly into ePOD, private blob evidence storage (`rpoms-epod-production-proofs`), and 5-stage order lifecycle.
    - *Real-Time Control Center & Production Ledger*: Staged 5–6 November 2026 (`feat/control-center-2026-11-05`), append-only `rpoms_production_ledger` table using data-modifying folded CTEs inside router-move statements (`RETURNING`) guaranteeing zero added round trips and zero duplicate writes on retries. Database triggers refusing UPDATE, DELETE, and TRUNCATE for all roles. Keyset pagination (`idx_cc_ledger_created`).
    - *Audio Feedback Scanning Engine*: Real-time auditory confirmation (success/error cues) across six operational scanning modules to eliminate head-up display checking and accelerate warehouse scanning throughput.
    - *Hardware Lifecycle & Multi-Cycle Rework*: Secondary recovery tracking (`RPOMS_REWORK=1`) preserving initial intake identity and lineage.
    - *High-Scale Registry & Backup Verification*: 250,000+ router registry benchmarked with PostgreSQL `pg_trgm` trigram indexing; full production backup dump (1.27 MB) and restore proven on production copy with `pg_trgm`.
  - **BBTech Laptop Tool**: Documented 685 unit/integration tests passing (xUnit), .NET 8 / WPF Windows x64 desktop utility, single self-contained portable executable, direct ITMS ingestion contract (`feat/itms-direct-submission` / `POST /api/devices/requests`), and on-device encrypted audit journal in `ProgramData` (AES-256-CBC + HMAC-SHA256, DPAPI).
  - **BBTech Driver Manager (Laptop Inspection Tool)**: Documented Python 3.12 / PySide6 architecture, Inno Setup installer + portable single EXE (v1.0.0), 98 tests, device classification via PCI `VEN_`/`DEV_`, official OEM allow-lists (Lenovo, Dell, HP, Windows Update), and Authenticode verification.
  - **ITMS (H001_TrackerApp)**: Documented 119 unit/workflow tests passed, Next.js 15.5 + Supabase, direct Laptop Tool ingestion API (`POST /api/devices/requests`) with review queue (Approve, Update Existing, Link Existing, Reject), barcode sticker printing integration, and automated asset tag allocation.
  - **RPOMS-AI**: Documented 247 test assertions passed, 35 compiled routes, PGlite in-process testing, cosmetic grading (Acceptable, Not acceptable, Unclear) with photo quality gate and deterministic rules (observation-only contract, no hallucinated scores).
  - **ERTH Homepage**: Documented production homepage build on Vite and complete Next.js 16 + React 19 + TypeScript rebuild with 21 section components, Schema.org Organization/RecyclingCenter JSON-LD, axe-core 0 violations.
  - **Site-Wide Synchronization**: Updated `about.ts`, `experience.ts`, `skills.ts`, `faq.ts`, and `cv.ts` to keep statistics, technology stacks, and operational achievements aligned.
- **Authenticity-Preserving Confidentiality Architecture**: Refined confidentiality projection to retain real, authentic software project names, acronyms, and marks (**RPOMS**, **RPOMS Print Engine**, **RPOMS AI**, **ITMS**) directly under authentic slugs (`/work/rpoms`, `/work/rpoms-print-engine`, `/work/rpoms-ai`, `/work/itms`), eliminating artificial acronyms (EDOMS, AIMS) that harm engineering trust.
  - Authentic software IP, codebase metrics (65,000+ LOC, 2,388 tests), and project marks/logos remain proudly visible to public visitors.
  - Business confidentiality remains strictly enforced: client identities (**Maxis**, **ERTH**) and employer corporate entities (**Blue Bee Technologies / BBTech**) are 100% anonymized across all projects, case studies, experience records, 173 blog posts, structured data, and URLs.
  - Legacy/temporary aliases (`/work/enterprise-device-operations`, etc.) 308-redirect back to authentic project routes.

## 2026-11-05

### Added
- **Confidentiality & Anonymization Engine**: Complete, context-aware projection system for protecting business, client, employer, and confidential hardware identities across public visitors while keeping private records intact.
  - Public projection engine (`src/lib/confidentiality/projector.ts`) sanitizing all 15 projects, 173 blog articles, professional experience entries, SEO schemas, JSON-LD, and FAQs.
  - Mapped RPOMS to `Enterprise Device Operations Management System (EDOMS)` with public slug `/work/enterprise-device-operations` and 308 permanent redirects for legacy paths.
  - Anonymized ERTH to "Malaysia's No. 1 E-Waste Recycling Company", Blue Bee Technologies to "Established Malaysian technology company", and Maxis to "Leading Malaysian telecommunications provider".
  - Context-aware technical brand preservation: preserved generic networking protocols (UPnP, CSTECGI, SNMP) and hardware vendors (Huawei, TP-Link, Kaon) in educational articles while stripping confidential employer relationships and enterprise models.
  - Protected media isolation: confidential screenshots moved from `public/` to `private/media/` and served exclusively via authenticated streaming endpoint `/api/media/[...path]` with `Cache-Control: private, no-store`.
  - Approval-based access system: `/access` request form, 1-click email approvals (`/api/access/decision`), HMAC-SHA256 magic links (`/access/verify`), and admin dashboard (`/admin/access-requests`) with instant session revocation and audit logging.
  - Access status banner in header (`src/components/access/access-status-indicator.tsx`) adhering strictly to the existing design system.

## 2026-10-27

### Changed
- **Favicon & app icons**: Replaced the previous text-based favicon with the
  official Electric TIR monogram logo (white 'T' and 'R', sky blue / cyan
  `#22C7F2` 'I' with electric diagonal slash, centered on dark charcoal
  `#101820` rounded squircle background). Recreated as a crisp vector SVG
  (`src/app/icon.svg`), multi-resolution ICO (`src/app/favicon.ico`), Apple
  Touch Icon (`src/app/apple-icon.png`), and static web fallbacks in `public/`.
  Removed the outdated generator `src/app/icon.tsx`.

## 2026-10-20

### Added
- **Six articles dated 2026-10-20** (167 -> 173), written from the October
  release notes, changelogs and commit history of RPOMS, the Print Engine and
  the Laptop Inspection Tool: the RPOMS link (BroadcastChannel, COOP,
  window.opener), refusing runtime DDL on production, partial unique indexes
  for duplicate scans, sorting on the indexed column at 250,000 routers,
  Google sign-in with server-side PKCE and per-service grants, and
  official-source-only driver installation. Registered in
  `content-planning/blog-database.json` (FSE-35..38, POS-34, ITS-16).
- **BBTech Laptop Inspection Tool** (`/work/bbtech-laptop-inspection-tool`,
  secondary): Python and PySide6 driver inspection and official-source repair
  tool, written up from its repository docs and test suite (98 tests, v1.0.0
  installer and portable EXE). Linked from the BBTech experience entry and the
  systems capability. Mark from the project's own `assets/logo.png`, with a
  dark-theme variant.
- **RPOMS case study, October 2026 section**: the 12 October production
  release, the historical router archive, and the Refining and Printing
  workstation, Google sign-in with per-service access and Registry hardening
  released on 20 October with a handover package of five schema-only
  migrations. Status table, roadmap and the home-card fact (1,637 tests)
  updated.
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
