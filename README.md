# Touhidul Islam Rukon, Portfolio

Personal portfolio and blog for Touhidul Islam Rukon, IT Systems & Operations Lead / Software Developer.

Live at [rukon.dev](https://rukon.dev).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- [Resend](https://resend.com) for the contact form
- Deployed on [Vercel](https://vercel.com)

## Structure

- `src/app`, routes: home, `/blog`, `/blog/[slug]`, `/work/[slug]`, `/api/contact`
- `src/components`, layout, section, and UI components
- `src/content`, typed content data (site config, projects, experience, education, skills, blog posts, FAQ, process)
- `src/lib`, small hooks and utilities (media query, reading time, active-section tracking)
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
