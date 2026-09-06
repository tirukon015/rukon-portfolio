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

**The CV page is public; three fields are not.** `/cv` renders the whole CV from `src/content/cv.ts`. Email, phone and address are absent from that file by design, because it ships in the client bundle. They come from `/api/cv/contact`, which checks the same grant as the document route, so one form submission releases all three at once and unlocks the download.

**The real CV PDF is not in this repository, and must not be.** This repository is public, so a committed PDF is a published PDF whatever directory it sits in — `private/` only means "not served as a static asset by Next". `private/` is git-ignored and holds the local development copy only; production fetches the document from private storage via `CV_DOCUMENT_URL`. See `src/lib/cv-access/document.ts`.

**Known and accepted: the email is public elsewhere.** The footer and the Contact section both publish `site.email` deliberately, and that is intentional. The CV page still gates Email Address alongside Phone and Address, so the three fields behave consistently there, but gating it on `/cv` does **not** make the address globally confidential — anyone can read it from any other page. It has been removed from the Person JSON-LD, because metadata is a different matter from a visible contact link. Phone and address appear nowhere else on the site, so those two are genuinely protected.

**The CV is not a static file.** `private/cv/` sits outside `public/`, so the document has no static URL. `/api/cv/document` is the only way to reach it and it verifies a server-signed grant cookie first. The three CV buttons link to `/cv`, never to the file. See `src/lib/cv-access/` for the service abstraction and the two marked Supabase integration points.

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
| `CV_CONTACT_EMAIL`, `CV_CONTACT_PHONE`, `CV_CONTACT_ADDRESS` | `/api/cv/contact` | The three gated CV fields. Kept out of source because this repository is public. All three or none: a partial set returns 503 rather than revealing some fields and failing the rest. |
| `CV_DOCUMENT_URL` | `/api/cv/document` | Where the real CV PDF is fetched from. **Required in production** — the PDF is not in this repository. Any private, authenticated URL: a Vercel Blob private URL, a Supabase signed URL, or similar. Read server-side only and never sent to a browser. Without it the route returns 503. |
| `CV_DOCUMENT_TOKEN` | `/api/cv/document` | Optional bearer token for `CV_DOCUMENT_URL`, when the storage provider needs one. |
| `CV_ACCESS_SECRET` | `/api/cv/*` | Signs the CV access grant. **Required in production** — without it the request route returns 503 rather than issuing a grant it cannot verify. In development a per-process random secret is used, so no setup is needed locally. Any random string of 16+ characters. |

---

## Featured work

- **[RPOMS](https://www.rukon.dev/work/rpoms)** — WMS/ERP-style operational system running a live router-refurbishment line. NDA-safe overview.
- **[ERTH](https://www.rukon.dev/work/erth)** — production homepage for a Malaysian e-waste service. Complete and deployed.
- **[ResearchForge](https://www.rukon.dev/work/researchforge)** — deployed AI research paper assistant. University project, taken from planning documents to a maintained deployment.
