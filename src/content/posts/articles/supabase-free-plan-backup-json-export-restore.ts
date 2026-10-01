import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "supabase-free-plan-backup-json-export-restore",
  title: "Backing Up a Database on a Plan With No Backups, and a One-Way Staging Refresh",
  description:
    "The procedure and scripts I designed for a production Supabase database on the Free plan: a read-only JSON export, a restore that only targets staging, and an anonymising refresh.",
  date: "2027-01-07",
  category: "Building Real Systems",
  tags: ["Supabase", "PostgreSQL", "Backups", "Disaster Recovery", "Staging", "Node.js"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Backing Up Supabase on the Free Plan",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "when-production-breaks-and-nothing-changed-paused-free-tier-database",
    "data-preservation-check-before-production-release",
    "stop-vercel-preview-deployments-using-production-database",
    "audit-log-with-before-snapshots-for-destructive-actions",
  ],
  sections: [
    {
      heading: "The only copy was the live database",
      body: [
        "On 24 September 2026, the backup document for RPOMS, the operations system I built for a router-refurbishment line, opened with an uncomfortable status: no backup of the production database existed. The Supabase project was on the Free plan, which includes no project backups, nothing in the repository had ever taken one, and the only copy of the programme's records was the live database itself.",
        "This article describes the procedure and scripts I wrote for that situation. It is a design and a runbook, and I will be precise about what has and has not been exercised. It is for anyone running a real system on a free database tier who needs a floor under it before a paid plan arrives.",
      ],
    },
    {
      heading: "A read-only export of every table",
      body: [
        "`npm run db:export` writes every table in the public schema to `backups/<timestamp>/<table>.json`, plus a `manifest.json` with row counts. The only statements it sends are `SELECT`s against `information_schema` and each table. Tables are discovered rather than listed, so a table added by a later release is picked up without editing the script. The output folder is git-ignored, because operational data does not belong in a repository.",
        {
          type: "code",
          lang: "bash",
          code: "DATABASE_URL=\"<production pooler string>\" npm run db:export\n# -> backups/<timestamp>/*.json and manifest.json",
          caption: "The connection string goes in the command and nowhere else.",
        },
        "The runbook then asks a human to read the manifest against rough expectations, such as reports in the tens and stock adjustments in the hundreds. A table with zero rows that is known to have data means the export is wrong, and the instruction is to stop and say so. The folder is then copied off the machine, encrypted, with at least thirty days kept, and the pre-deployment export kept for as long as that deployment is in production. Each export is recorded with its date, row counts, location and who took it.",
      ],
    },
    {
      heading: "A backup that has never been restored is a hope",
      body: [
        "That line is in the runbook because it is the part most often skipped. Proving a restore must not touch production, so the restore script is built to be unable to. It reads a separate staging connection variable, refuses any target that names the production project, requires an explicit `--confirm-staging` flag, and never copies the audit log. Its alternative is loading the export into a local in-process PostgreSQL.",
        "The original export script says, in its header, that restoring is deliberately not a flag on it: putting data back is a decision with a runbook, not an option on a script. That is why export and restore are separate commands with separate connection variables.",
      ],
    },
    {
      heading: "A one-way staging refresh",
      body: [
        "The same two scripts compose into `npm run staging:refresh -- --confirm-staging`, which copies production into a staging database:",
        {
          type: "flow",
          steps: [
            "Export production read-only (staging string withheld)",
            "Load staging, parents before children (production string withheld)",
            "Replace names with \"Employee N\" unless --keep-names",
            "Blank session ids; never copy the audit log",
            "Delete the export folder unless --keep-export",
          ],
        },
        "Each step is given only the connection string it needs, so the export step cannot write to staging by mistake and the load step cannot touch production. Business dates travel unchanged next to the created and updated timestamps, so a backdated entry stays backdated in staging. Ids are copied as they are and tables load in dependency order, so deliveries keep their boxes and requests keep their events. Schema stamps are copied too, so staging's code sees the stamps production has and does not rebuild on its first request.",
        "It refuses a missing source or target, a target equal to the source, a target that names production, and any run without the confirmation flag. Every refusal was exercised. There is no reverse path, by design.",
      ],
    },
    {
      heading: "What has not been exercised, and what this is not",
      body: [
        {
          type: "callout",
          label: "Status",
          text: "The staging database this refresh targets does not exist yet: creating another database project was blocked by plan limits and account permissions. So the refresh has been built and its refusals tested, but it has never run end to end, and a restore of a production export into staging has not been demonstrated.",
        },
        "The export is not point-in-time recovery, and it does not capture database-level settings such as roles and extensions. The runbook's own recommendation is a managed daily backup on a paid plan plus this export, with a nightly scheduled export as the step after; this export alone is the floor. The runbook also says when to take one: before every production deployment that changes a schema stamp, and before any approved migration.",
        "The checks that run alongside it at release time, a row-count gate and a whole-database preservation test, are in [Proving a Release Deleted Nothing](/blog/data-preservation-check-before-production-release), and the guard that stops previews using production is in [Stopping Vercel Preview Deployments From Touching the Production Database](/blog/stop-vercel-preview-deployments-using-production-database). The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
