import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "vercel-or-a-self-hosted-ubuntu-server-choosing-per-app",
  title: "Vercel or a Self-Hosted Ubuntu Box? How I Chose Hosting App by App",
  description:
    "Eight deployed apps, three hosting shapes: Vercel for pages and serverless APIs, a self-hosted Ubuntu box for a stateful API, and a hybrid for a model Vercel can't run.",
  date: "2026-10-28",
  category: "Building Real Systems",
  tags: ["Vercel", "Self-Hosting", "Ubuntu", "nginx", "systemd", "Deployment"],
  contentType: "Comparison",
  searchIntent: "commercial-adjacent",
  seoTitle: "Vercel vs Self-Hosted Ubuntu: Choosing Per App",
  relatedProjects: ["rpoms-print-engine", "researchforge", "rpoms-ai", "erth", "rukon-link"],
  relatedPosts: [
    "fastapi-and-nextjs-as-two-services-on-one-vercel-origin",
    "exposing-local-ollama-to-vercel-through-a-token-gateway",
    "self-hosting-node-postgresql-nginx-systemd-ubuntu",
    "stop-vercel-preview-deployments-using-production-database",
  ],
  sections: [
    {
      heading: "The question is per app, not per developer",
      body: [
        "\"Should I use Vercel or my own server?\" is usually asked as if it had one answer. Across the systems I have deployed, it has had three. Most run on Vercel. One runs on a self-hosted Ubuntu server with nginx, systemd and PostgreSQL. One is a hybrid: the web app on Vercel, the heavy part on a machine I control, reached through a tunnel.",
        "This is for developers weighing the same choice for a specific app. No single document records a rule I followed; what follows is the pattern that shows up when the deployments are laid side by side, with the properties each one actually relies on.",
      ],
    },
    {
      heading: "What runs where",
      body: [
        {
          type: "table",
          head: ["App", "Hosting", "What it relies on"],
          rows: [
            ["ERTH homepage (static)", "Vercel, Vite preset", "Static files, long-lived immutable caching for hashed assets and fonts, security headers from vercel.json"],
            ["This portfolio", "Vercel", "Static pages plus a few route handlers (contact form, CV access); hourly revalidation for scheduled articles"],
            ["ResearchForge", "Vercel, two services in one project", "A Next.js frontend and a FastAPI backend behind one origin via rewrites; Supabase for auth and Postgres"],
            ["rukon-link", "Vercel", "Next.js with a managed Supabase Postgres; Vercel's edge headers for country/city analytics"],
            ["DriveKeep web", "Vercel", "A Next.js web app with no sign-in"],
            ["RPOMS", "Vercel + Supabase", "Serverless Next.js against managed Postgres"],
            ["RPOMS AI", "Vercel + a machine I control", "Web app on Vercel; the vision model on Ollama behind a token-protected gateway and an HTTPS tunnel"],
            ["RPOMS Print Engine", "Self-hosted Ubuntu", "nginx, a Node API under systemd, PostgreSQL on localhost, deploy/backup/restore scripts"],
          ],
          caption: "Drawn from each repository's README or deployment docs. RPOMS AI has no model active in production.",
        },
      ],
    },
    {
      heading: "Where Vercel is the obvious fit",
      body: [
        "Everything in the Vercel rows shares a shape: request/response work, state in a managed database or none at all, and no process that has to stay alive between requests. For those, Vercel removes whole categories of work: TLS, deploys from git, preview deployments per branch, and a CDN in front of static output.",
        "The ERTH page is the extreme case. It is a static build, so hosting is just file serving with good cache headers: `vercel.json` gives `/assets/*` and `/fonts/*` long-lived immutable caching, because Vite hashes those file names, and adds the baseline security headers. ResearchForge is the more interesting one: a Python backend and a Next.js frontend deployed as two services in one Vercel project, with rewrites sending `/api/*` and `/health` to FastAPI and everything else to Next.js. That arrangement is covered in detail in [FastAPI and Next.js as Two Services on One Vercel Origin](/blog/fastapi-and-nextjs-as-two-services-on-one-vercel-origin).",
        "Preview deployments are a strength with a sharp edge. Every branch gets a live deployment, and every one of them runs your code against whatever database its environment variables name. If previews and production share a database, a preview can change production. On RPOMS that led to an environment guard that refuses the pairing, described in [One Storage Interface, Three Backends](/blog/one-storage-interface-three-backends).",
      ],
    },
    {
      heading: "Why one app lives on its own Ubuntu server",
      body: [
        "The RPOMS Print Engine is a browser app that prints labels over Web Bluetooth. Printing itself never touches a server. The optional backend is for a fleet of stations: Google sign-in, device provisioning, authorisation and synchronisation, with a PostgreSQL store. It has been live since 29 September 2026 at print.rukon.dev on a self-hosted Ubuntu server.",
        "The deployment is small and explicit. nginx serves the built PWA from a release directory and proxies `/api/` to a Node process bound to `127.0.0.1:8787`. PostgreSQL listens on localhost only, so the database is never reachable from outside the machine. The API runs as a dedicated user under a hardened systemd unit (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`, a system-call filter, no capabilities) and restarts on failure. The server refuses to start in production with an `http://` origin, a short session secret, no database URL, insecure cookies or a non-loopback bind.",
        {
          type: "flow",
          steps: [
            "Browser requests https://print.rukon.dev/",
            "nginx serves the static PWA from the current release",
            "Requests to /api/ are proxied to Node on 127.0.0.1:8787",
            "Node reads and writes PostgreSQL on 127.0.0.1:5432",
          ],
          caption: "One host, one origin. The database is never exposed.",
        },
        "Deploys pull, migrate, build and restart the API, then switch the static site by atomically swapping a `current` symlink to a new release directory, keeping the five most recent releases. A nightly backup takes a custom-format `pg_dump` plus the configuration needed to rebuild the host, with 30 days of retention. A restore script exists, with a verify mode that restores into a scratch database and counts rows, but a restore has not yet been executed on this deployment, and I would not call the backups proven until one has.",
        "What this buys is control: a long-running process, a database next to it, headers and rate limits in nginx, and nothing billed per invocation. What it costs is that all of the above is mine to maintain: OS updates, certificates, disk space, and the backups themselves.",
      ],
    },
    {
      heading: "One origin either way",
      body: [
        "The Ubuntu and Vercel deployments ended up agreeing on one thing: the frontend and the API answer on the same origin. On Vercel, ResearchForge does it with rewrites; on Ubuntu, the Print Engine does it with an nginx location. The payoff is the same in both. The frontend calls the API with a relative path, which works unchanged on the custom domain, on a platform subdomain and on every preview URL. There is no CORS preflight to configure for the app's own calls. And a session cookie can stay `SameSite=Strict`, because it is never sent cross-site. Pointing the frontend at an absolute API origin instead would make every other host a cross-origin caller and would require changes to the CSP's `connect-src` and to the server's allowed origins.",
      ],
    },
    {
      heading: "The hybrid: when the platform cannot run the workload",
      body: [
        "RPOMS AI needed a multi-gigabyte vision model, and Vercel cannot run that. The documented setup avoids a paid GPU host entirely (its guide says \"Nothing here costs money\"): the web app stays on Vercel and calls a free, open-source model through Ollama on a machine I control, via a token-protected gateway and an HTTPS tunnel. The important design property is failure: while that machine or tunnel is off, the site keeps working, photos are still quality-checked and saved, and the answer is \"needs a human check\". No model is active in production, so this path is built and documented rather than in daily use. The gateway itself is described in [Exposing a Local Ollama to Vercel Through a Token Gateway](/blog/exposing-local-ollama-to-vercel-through-a-token-gateway).",
      ],
    },
    {
      heading: "The pattern, as a rule of thumb",
      body: [
        {
          type: "list",
          items: [
            "Static output or request/response APIs with a managed database: a platform like Vercel, and spend the time saved on the app.",
            "A process that must stay alive, a database you want next to it, or network rules you want to own: a small server you administer, with the operations work written down as scripts.",
            "A workload the platform cannot run at all: keep the web tier on the platform and put the heavy part behind a narrow, authenticated interface that can be switched off without taking the site down.",
            "Whatever the host, serve the frontend and API from one origin unless there is a reason not to.",
          ],
        },
        "The self-hosted deployment, with its nginx and systemd details, is part of the [RPOMS Print Engine case study](/work/rpoms-print-engine/case-study).",
      ],
    },
  ],
};
