# rukon.dev

Portfolio and blog for **Touhidul Islam Rukon** — IT Systems & Operations Lead · Web Developer · Software Specialist.

Live: **[www.rukon.dev](https://www.rukon.dev)**

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Theming | `next-themes`, `data-theme` on `:root`, dark is the foundation |
| Mail | Resend, via `/api/contact` |
| Hosting | Vercel |

No CMS. All content is typed data in `src/content/`.

---

## Layout

```
src/app/          routes
src/components/   layout, section and ui components
src/content/      all site copy, as typed data
src/lib/          hooks, and seo.ts
```

**Routes:** `/` · `/work` · `/work/[slug]` · `/blog` · `/blog/[slug]` · `/blog/category/[slug]` · `/api/contact`
Plus generated `robots.txt`, `sitemap.xml`, `icon` and `opengraph-image`.

---

## Content model

| File | Holds |
| --- | --- |
| `site.ts` | Name, role, statement, links, nav |
| `projects.ts` | Case studies, in display order |
| `posts.ts` | Blog posts |
| `experience.ts` · `education.ts` | Roles, study, certifications |
| `skills.ts` | Capabilities, and the tiered stack |
| `about.ts` · `faq.ts` · `process.ts` · `categories.ts` | Everything else |

### Things worth knowing before editing

**Project order is array order.** `projects.ts` drives the homepage Selected Work section, `/work`, the sitemap and the cross-links on each case study. Reorder the array and all of them follow.

**`summary` is the card.** It appears on project cards and at the top of the case study, so keep it compact. Depth belongs in `sections`.

**Honesty fields are load-bearing.** `status` marks each capability `implemented` / `available` / `not-connected`, `limitations` states what a project does not do, and a section's `note` qualifies a claim in place. They exist so a case study can be specific without overclaiming. Use them rather than softening the prose.

**`canonicalHost`, not `domain`.** The apex 308-redirects to `www`, so every absolute URL is built from `site.canonicalHost` via `src/lib/seo.ts`. `site.domain` is display text only.

**`image.srcDark`.** Some supplied logos ship on an opaque background, which makes one file wrong in one theme. Set `srcDark` and `ProjectMark` renders both, with CSS choosing, so the correct one paints on the first frame.

---

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

## Environment

| Variable | Required for | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `/api/contact` | Via the Resend Vercel integration. Without it the form returns a clear error rather than a false success. |

---

## Featured work

- **[RPOMS](https://www.rukon.dev/work/rpoms)** — WMS/ERP-style operational system running a live router-refurbishment line. NDA-safe overview.
- **[ERTH](https://www.rukon.dev/work/erth)** — production homepage for a Malaysian e-waste service. Complete and deployed.
- **[ResearchForge](https://www.rukon.dev/work/researchforge)** — deployed AI research paper assistant. Five-person university group project.
