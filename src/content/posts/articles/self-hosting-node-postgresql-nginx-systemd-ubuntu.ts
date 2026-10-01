import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "self-hosting-node-postgresql-nginx-systemd-ubuntu",
  title: "Self-Hosting a Node and PostgreSQL Service With nginx and systemd on Ubuntu",
  description:
    "The deployment behind print.rukon.dev: one origin for a PWA and API, a hardened systemd unit, atomic releases, nginx header gotchas and a backup design.",
  date: "2026-11-26",
  category: "Full-Stack Development",
  tags: ["nginx", "systemd", "PostgreSQL", "Node.js", "Ubuntu", "Deployment", "Backups"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Self-Hosting Node + PostgreSQL With nginx and systemd",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "vercel-or-a-self-hosted-ubuntu-server-choosing-per-app",
    "google-oidc-pkce-device-provisioning-revocable-tokens",
    "freezing-label-templates-with-raster-hash-tests",
    "security-headers-for-a-web-bluetooth-pwa",
  ],
  sections: [
    {
      heading: "What is being hosted, and why one origin",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) is a label-printing PWA with an optional backend: Google sign-in, workstation provisioning and configuration sync, on Node.js 24 with PostgreSQL. It has been live since 29 September 2026 at print.rukon.dev, on a self-hosted Ubuntu server behind nginx, with the API as a systemd service. Why this app runs on my own server rather than a managed platform is discussed in [choosing between Vercel and a self-hosted Ubuntu server](/blog/vercel-or-a-self-hosted-ubuntu-server-choosing-per-app). This article is the how.",
        "The central decision is a single origin. nginx serves the static app and proxies `/api/` to the Node process on loopback. PostgreSQL listens on localhost only.",
        {
          type: "flow",
          steps: [
            "https://print.rukon.dev/ -> static files from the current release directory",
            "https://print.rukon.dev/api/... -> Node API on 127.0.0.1:8787",
            "Node API -> PostgreSQL on 127.0.0.1:5432, never reachable from a browser",
          ],
        },
        "With one origin, the browser needs no CORS, the session cookie can stay `SameSite=Strict`, and the Content Security Policy can say `connect-src 'self'`. Two origins would have meant loosening all three.",
      ],
    },
    {
      heading: "A systemd unit that assumes the process could be compromised",
      body: [
        "The API runs as a dedicated `rpoms` system user, with its secrets in a `.env` file readable only by that user (mode 0600), loaded with `EnvironmentFile`. The unit restarts the service after three seconds if it dies, and starts after PostgreSQL. Most of the file is hardening: the process needs to read its own directory and talk to loopback, and nothing else.",
        {
          type: "code",
          lang: "ini",
          code: "[Service]\nUser=rpoms\nEnvironmentFile=/opt/rpoms-print-engine/server/.env\nEnvironment=NODE_ENV=production\nExecStart=/usr/bin/node dist/index.js\nRestart=always\nRestartSec=3\n\nNoNewPrivileges=true\nPrivateTmp=true\nPrivateDevices=true\nProtectSystem=strict\nProtectHome=true\nSystemCallFilter=@system-service\nCapabilityBoundingSet=\nRestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX\nUMask=0077",
          caption: "An excerpt; the unit also protects kernel tunables, modules, control groups, the clock and the hostname.",
        },
        "The deploy script has to restart the service, and it runs as the unprivileged user. Rather than give that user general sudo, a sudoers line allows exactly three commands: `systemctl restart`, `start` and `stop` for this one unit.",
      ],
    },
    {
      heading: "Refuse to start when misconfigured",
      body: [
        "A misconfigured server that starts anyway is worse than one that does not start. With `NODE_ENV=production` the server checks its configuration at startup and exits with a clear message if any of these hold:",
        {
          type: "list",
          items: [
            "The public origin is not `https://`.",
            "The session secret is shorter than 32 characters.",
            "There is no `DATABASE_URL`. The in-memory store used in development loses everything on restart.",
            "Secure cookies have been switched off.",
            "The bind address is not loopback.",
          ],
        },
        "Each of these is a setting that is legitimate in development and dangerous in production, and each would otherwise fail silently. It also pings the database at start, logs one line per request to journald, cleans up expired sessions hourly and shuts down gracefully on SIGTERM.",
      ],
    },
    {
      heading: "Deploying: migrate, test, build, health-check, swap a symlink",
      body: [
        "The deploy script is meant to be re-run safely. It pulls the branch fast-forward only, then:",
        {
          type: "list",
          ordered: true,
          items: [
            "Installs the server's dependencies and applies database migrations.",
            "Installs the app's dependencies and runs the label template freeze test on its own; a failing test stops the deploy.",
            "Builds the server and the app.",
            "Restarts the API and polls `/api/health` for up to ten seconds; if it never answers, it prints the last 30 journal lines and fails.",
            "Copies the built app into a new release directory named after the commit and time.",
            "Points a temporary symlink at it and renames it over `current` in one step.",
            "Deletes all but the five most recent releases.",
          ],
        },
        "The rename matters. nginx serves from `/var/www/rpoms-print/current`. Copying files into a live directory means a workstation loading during the copy can get a new `index.html` with old assets. `ln -sfn` to a temporary name followed by `mv -T` replaces the symlink atomically, so a request sees either the old release or the new one. Old releases stay on disk, so rolling back is pointing the symlink back.",
        "Migrations are plain SQL files applied in name order by a small runner. Each file runs in a transaction and is recorded in a `schema_migrations` table, so it applies once. The files are also written to be idempotent, so a database created before the table existed is brought up to date safely. CI applies all migrations twice against a Postgres 16 service to prove that. The freeze test that guards the deploy is described in [freezing a label design in CI](/blog/freezing-label-templates-with-raster-hash-tests).",
      ],
    },
    {
      heading: "nginx: two gotchas worth knowing",
      body: [
        "The first is cache headers for a PWA. The service worker script, `index.html`, the manifest and Workbox's runtime must be revalidated on every load, or workstations can stay on an old version indefinitely. Vite's hashed assets under `/assets/` never change, so they are cached for a year as immutable.",
        "The second is easy to miss. In nginx, an `add_header` inside a `location` block replaces every `add_header` inherited from the server block; it does not add to them. So the moment `/sw.js` got its own `Cache-Control` header, it silently lost the Content Security Policy, HSTS and every other security header. The fix is to keep the security headers in a snippet and `include` it in every location that sets its own headers:",
        {
          type: "code",
          lang: "nginx",
          code: "location = /sw.js {\n  include /etc/nginx/snippets/rpoms-print-headers.conf;\n  add_header Cache-Control \"no-cache\" always;\n}\nlocation /assets/ {\n  include /etc/nginx/snippets/rpoms-print-headers.conf;\n  add_header Cache-Control \"public, max-age=31536000, immutable\" always;\n  try_files $uri =404;\n}",
        },
        "A unit test in the repository checks that every security header appears, verbatim, in both the site file and the snippet. The header set itself is the subject of a separate article on securing a Web Bluetooth PWA.",
        "The rest of the site is routine but deliberate: TLS 1.2 and 1.3 only, port 80 redirected to HTTPS, rate limits of 10 requests a minute per IP on sign-in and provisioning and 60 a second on the rest of the API, a 6 MB body limit, and no dotfiles or source maps served. Order matters on first setup, and the setup guide was corrected for it: install the systemd unit before the first deploy, and issue the TLS certificate before enabling the site, because `nginx -t` fails on a missing certificate path.",
      ],
    },
    {
      heading: "Backups, and a restore that has not yet been tested",
      body: [
        "A nightly cron job runs a backup script as the service user. Each backup is a dated directory, created with a restrictive umask because it contains secrets, holding:",
        {
          type: "list",
          items: [
            "A custom-format `pg_dump` of the database.",
            "The central templates and rules exported as plain JSON, readable without PostgreSQL.",
            "The server's `.env`, the nginx site and the systemd unit.",
            "The git commit that was deployed.",
            "A `SHA256SUMS` file over all of it.",
          ],
        },
        "Directories older than 30 days are deleted.",
        "The restore script has two modes. `--verify` checks the checksums, creates a scratch database, restores the dump into it, prints row counts for the main tables and the configuration version, and drops the scratch database on exit. It is safe to run at any time, and it is the only honest way to know a backup is usable. That is also why the database role has `CREATEDB`: verify needs to create the scratch database. `--restore` replaces the real database, but only after you type its name. It stops the API, terminates remaining connections, recreates the database, restores, re-applies any migrations newer than the backup, starts the API and checks health.",
        {
          type: "callout",
          label: "Status",
          text: "Both scripts are written and reviewed, but `restore.sh --verify` has never been run on the production server, so the backups have never been proven restorable. Until that run is recorded, the backups are a design, not a tested recovery.",
        },
        "One property makes a server restore less frightening than usual: the workstations are local-first. Each keeps its own templates, rules, session and unsynced history, and resumes syncing against the restored server. A workstation provisioned after the backup was taken is unknown to the restored database; it signs in once and is provisioned again. How the device tokens and the sync work is covered in [the provisioning article](/blog/google-oidc-pkce-device-provisioning-revocable-tokens) and the [conflict policy article](/blog/local-first-sync-conflict-policy-offline-pwa).",
      ],
    },
    {
      heading: "Health and outages",
      body: [
        "`/api/health` returns the version, whether the store is PostgreSQL, whether Google sign-in is configured, and uptime, and returns 503 when the database does not answer. That one endpoint is what the deploy script waits on. Logs are in journald for the API and in two nginx log files for the edge.",
        "An outage of the whole server does not stop printing. Provisioned workstations boot from their service worker cache and IndexedDB, print, and queue their history until the server is back. For this app, that matters more than any of the hosting details above.",
      ],
    },
  ],
};
