# Touhidul Islam Rukon, Portfolio

Personal portfolio and blog for Touhidul Islam Rukon, Web Developer & IT Operations Lead.

Live at [www.rukon.dev](https://www.rukon.dev). The apex redirects to `www`, so every canonical URL, `og:url` and sitemap entry is built from `site.canonicalHost` rather than the display domain.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- [Resend](https://resend.com) for the contact form
- Deployed on [Vercel](https://vercel.com)

## Structure

- `src/app`, routes: home, `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/api/contact`
- `src/components`, layout, section, and UI components
- `src/content`, typed content data (site config, projects, experience, education, skills, blog posts, FAQ, process)
- `src/lib`, small hooks and utilities (media query, reading time, active-section tracking) and `seo.ts`, the single source of absolute URLs and shared schema nodes
- `docs`, engineering notes for changes made to this repository
- `content-planning`, blog research dataset. Planning data only, not imported by the app
- `reports`, internal audit and preview artefacts. Not routed and not indexed

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | The contact form (`/api/contact`) | Provisioned via the Resend Vercel integration. Without it, the contact form returns a clear error instead of a false success. |

## Build

```bash
npm run lint
npm run build
```

## Content

All site copy, project case studies, experience, and blog posts live as typed data in `src/content/`, no CMS. Blog posts are added directly to `src/content/posts.ts`.

Project order is the array order in `src/content/projects.ts`. Every surface that lists projects (the homepage Selected Work section, `/work`, the sitemap, and the "other projects" links on a case study) reads that one array, so reordering it there reorders all of them.

A project's `image` may carry a `srcDark` alongside `src`. That exists because some supplied logos ship with an opaque background rather than a transparent one, which makes a single file wrong in one of the two themes. `ProjectMark` renders both and CSS picks, so the right one is painted on the first frame.
