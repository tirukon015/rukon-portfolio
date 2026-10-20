# Organic Search & Keyword Strategy Master Document

This document defines the organic search strategy, keyword clusters, search intent mapping, and on-page optimization standards for `rukon.dev`.

---

## 1. Executive Strategy & Market Positioning

Rather than chasing broad, generic search terms with massive competition (e.g., "full stack developer" or "javascript tutorial"), the portfolio's SEO strategy is built on **high-intent, problem-solving technical queries** and **specialized engineering capability searches**.

### Core Audiences:
1. **Senior Engineering Peers & Technical Leads:** Searching for specific production debugging solutions, architectural patterns, and hardware/software integration challenges (problem-aware queries).
2. **Technical Recruiters & Engineering Hiring Managers:** Searching for full-stack, reverse logistics, and systems developers in Malaysia / APAC or globally remote, evaluating real-world operational ownership and technical depth.
3. **Product Founders & Enterprise Operators:** Seeking proven experience in warehouse management, inventory tracking, hardware-tethered QC workstations, and high-performance local-first mobile applications.

---

## 2. Target Keyword Clusters & URL Mapping

| Cluster / Category | Target Keyword / Query | Secondary & Long-Tail Queries | Search Intent | Target Canonical URL | SERP Competition & Opportunity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase & Postgres Scalability** | `supabase connection pool exhaustion` | `supavisor emaxconnsession`, `max client connections reached supabase`, `session mode 5432 vs transaction mode 6543`, `prisma serverless connection limits supabase` | Problem-Aware / Diagnostic | `/blog/supabase-connection-pool-exhaustion-supavisor-production` | Competes with forum threads (GitHub Discussions, Reddit) and generic documentation. Wins by providing an end-to-end production incident postmortem (INC-2026-10-11-01) with metrics and configuration diffs. |
| **SwiftData & Local-First Sync** | `swiftdata local first outbox sync` | `swiftdata offline sync engine`, `swiftdata outbox pattern NWPathMonitor`, `swiftdata background task sync`, `modelcontext save latency swiftdata` | Problem-Aware / Architecture | `/blog/swiftdata-local-first-outbox-sync-engine` | High technical interest post-iOS 17/18. Apple Docs are theoretical; this article details exact 0.240 ms latency benchmarks and idempotent sequence queuing. |
| **Windows Win32 System APIs** | `windows appbar api exclude monitor strip` | `shappbarmessage abm_new c#`, `reserve desktop margin windows wpf`, `damaged screen margin workarea`, `virtual screen coordinates multi monitor` | Problem-Aware / How-to | `/blog/excluding-damaged-monitor-strip-windows-appbar-api` | Zero modern high-quality documentation exists; developers rely on 15-year-old MSDN forum snippets. High likelihood of capturing #1 ranking. |
| **Hardware ID & Asset Tracking** | `immutable hardware serial smbios wmi` | `asset tag vs serial number refurbishment`, `wmi serial number c# wpf`, `dpapi localmachine test journal`, `preventing duplicate stock barcodes` | Informational / Systems | `/blog/hardware-identity-vs-generated-stock-prefixes-refurbishment` | Highly relevant to enterprise IT, refurbishers, and asset managers. |
| **Android ML Kit & OCR** | `offline receipt ocr android ml kit` | `ml kit text recognition bitmap rotation exif`, `room sqlite outbox pattern android`, `integer sen currency arithmetic mobile`, `offline first expense scanner` | Problem-Aware / Implementation | `/blog/offline-receipt-ocr-on-android-with-ml-kit` | Outperforms boilerplate ML Kit guides by solving real-world camera orientation metadata bugs and transaction queues. |
| **Multi-Vendor Network Diagnostics** | `lan serial number extraction router` | `extract serial upnp cstecgi snmp`, `router diagnostic tool c#`, `detect wan mac address lan script`, `kaon huawei tp link lan serial` | Technical / Diagnostic | `/blog/lan-serial-number-extraction-across-router-vendors` | Niche telecom/ISP engineering intent; highly authoritative with protocol-specific payloads. |
| **Reverse Logistics & Warehouse Ops** | `reverse logistics management system architecture` | `refurbishment tracking software`, `router retest cleaning operations`, `scan and print barcode workstation`, `rpoms warehouse management` | Solution-Aware / Commercial | `/work/rpoms` | High-value B2B/enterprise positioning showcasing end-to-end production operations tracking. |
| **Industrial Desktop Utilities** | `c# wpf hardware diagnostic tool` | `laptop qc checklist automated testing`, `wmi battery health test suite c#`, `portable net 8 diagnostic app` | Evaluation / Engineering | `/work/bbtech-laptop-tool` | Demonstrates native desktop engineering, Windows internals, and 685 automated tests. |
| **Multi-Tenant SaaS Architecture** | `multi tenant supabase row level security` | `sharing one supabase project two apps`, `privacy preserving contact broker`, `whatsapp presets deep link nextjs`, `link in bio saas architecture` | Architectural / Solution | `/work/link-nest` & `/blog/sharing-one-supabase-project-between-two-apps` | Shows security rigor, multi-tenant database isolation, and SaaS quota enforcement. |
| **Recruiter Intent: APAC & Global** | `full stack engineer cyberjaya` | `systems software developer kuala lumpur`, `nextjs typescript developer malaysia`, `operations software engineer` | Navigational / Hiring Intent | `/` (Homepage) & `/work` | Optimizes local and regional discoverability for technical leadership and senior engineering roles. |

---

## 3. On-Page Content Optimization Standards

Every article and case study on `rukon.dev` follows strict content hygiene rules:

1. **Title Tags & Meta Descriptions:**
   - Title length: 50–60 characters, front-loaded with the primary technical entity.
   - Meta description: 140–160 characters, summarizing the exact technical failure mode, solution, and takeaway.
2. **Entity-Rich Technical Vocabulary:**
   - Mentions exact RFCs, protocol names, API symbols, and error codes (e.g., `SHAppBarMessage`, `ABM_NEW`, `Supavisor`, `emaxconnsession`, `NWPathMonitor`, `ModelContext`, `WMI Win32_Bios`, `RFC 4180`).
3. **Structured Data Markup:**
   - Articles output `TechArticle` / `BlogPosting` JSON-LD schemas with `headline`, `datePublished`, `author`, `publisher`, and `keywords`.
   - Projects output `SoftwareApplication` / `CreativeWork` JSON-LD schemas.
4. **Internal Link Mesh:**
   - Every article links to its originating project case study and 2–4 related deep-dive articles using context-rich anchor text.
   - Breadcrumb navigation and contextual footer links ensure zero orphan pages.
5. **Real-World Evidence & Truthfulness:**
   - No fabricated benchmarks or inflated claims.
   - Exact test counts (685 unit tests, 84 assertions, 9,811 test cases) and latency figures (0.240 ms) match verifiable repository artifacts.

---

## 4. Technical SEO Architecture

1. **Crawl Budget & Server Efficiency:**
   - Zero client-side route waterfalls: 100% of pages are statically pre-rendered (SSG) via Next.js App Router.
   - Clean `robots.ts` disallowing private API routes (`/api/`) while ensuring search engine access to all content, feeds, and `sitemap.xml`.
2. **Canonical URL Hygiene:**
   - Strictly enforced canonical headers and `<link rel="canonical">` pointing to `https://rukon.dev/...`.
   - Trailing-slash normalization and consistent URL paths.
3. **Core Web Vitals:**
   - Ultra-fast First Contentful Paint (< 0.8s) and Largest Contentful Paint (< 1.2s) achieved via zero external blocking scripts, scoped Tailwind utility styles, and optimized vector SVGs.
   - Cumulative Layout Shift (CLS) = 0.00 through strict image dimensions and system font fallbacks.

---

## 5. Ongoing Monitoring & Maintenance

- **Quarterly Audits:** Review Google Search Console search performance (impressions, CTR, queries) to identify emerging search queries for existing articles.
- **Content Refreshing:** As framework versions update (e.g., Next.js, Supabase, SwiftData), verify that code snippets remain accurate and append dated updates rather than rewriting history.
- **Link Integrity:** Run `node scratch/audit_crawler.mjs` prior to any major deployment to guarantee 0 broken links and 100% schema compliance.
