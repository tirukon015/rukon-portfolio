import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "local-first-sync-conflict-policy-offline-pwa",
  title: "A Written Conflict Policy for a Local-First Workstation App",
  description:
    "How an offline-first PWA writes locally first, syncs on its own timer with backoff, and resolves conflicts with a rule per data type: last writer wins, server wins, append-only, never synced.",
  date: "2026-11-20",
  category: "Building Real Systems",
  tags: ["Local-first", "Sync", "IndexedDB", "Offline", "Conflict resolution", "PWA"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Local-First Sync and Conflict Policy for an Offline PWA",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "google-oidc-pkce-device-provisioning-revocable-tokens",
    "continuous-label-printing-page-counter-and-uncertain-jobs",
    "testing-pwa-offline-boot-headless-chrome-devtools-protocol",
    "offline-sync-deletes-tombstones-last-write-wins",
  ],
  sections: [
    {
      heading: "The constraint: printing must never wait for the server",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) is a label-printing workstation. Each PC holds its own templates, model-detection rules, settings and print history, in IndexedDB, and prints from them with or without a network. A backend adds central administration: an administrator edits a template once, every workstation picks it up, and every printed label is recorded centrally.",
        "Those two facts pull against each other. If sync is on the print path, an internet outage stops the line. If sync is an afterthought, two workstations edit the same template offline and one edit disappears without anyone noticing. This article is about the middle: a sync engine that never blocks printing, and a conflict policy that is written down, deterministic and different for each kind of data. It is for anyone building an offline-capable app where several devices share configuration.",
      ],
    },
    {
      heading: "Local first, then an outbox",
      body: [
        "Every write goes to the local database first, and that write is the one that counts. Saving a template saves it locally, immediately, and the app moves on. At the same time, an event describing the change goes into an outbox store. Print outcomes are written as history records with a `synced` flag set to false. The local database has three stores for this: a key-value store for templates, rules, the session and sync state; the print history; and the outbox.",
        "The sync engine is a separate object with its own timer. It is never called from the scan-to-print path, and the print path has a test that fails if anything in it makes a network request. Sync can be slow, failing or switched off, and printing behaves exactly the same.",
      ],
    },
    {
      heading: "One sync run: push, then pull",
      body: [
        {
          type: "flow",
          steps: [
            "If offline: mark offline, try again later",
            "Push up to 200 unsynced history records and 100 outbox events, plus workstation metadata",
            "Mark acknowledged history synced; remove acknowledged events; record rejected events with their reason",
            "Ask for configuration newer than the local version",
            "If newer: apply it under the conflict policy",
            "Persist the configuration version and last sync time",
          ],
        },
        "Pushing before pulling matters. If the workstation pulled first, a newer server template could replace a local edit that had not been pushed yet. Pushing first means the server has seen the local edit before it answers with its own view.",
        "Pulling is versioned. The workstation sends the configuration version it holds; the server answers \"unchanged\" or sends the newer configuration. Configuration is also split by module: a workstation pulls the device-label module's configuration only if its account holds that module.",
        "Runs happen one second after start-up, every five minutes while idle, half a second after the browser fires its `online` event, and when someone presses \"Sync now\" on the System panel. A failure only schedules a retry, with backoff:",
        {
          type: "code",
          lang: "ts",
          code: "const BACKOFF_MS = [5_000, 15_000, 60_000, 300_000, 1_800_000];\n// after the n-th consecutive failure, wait BACKOFF_MS[min(n - 1, 4)]",
          caption: "5 s, 15 s, 1 min, 5 min, then every 30 min until a run succeeds.",
        },
      ],
    },
    {
      heading: "The conflict policy, one rule per kind of data",
      body: [
        "There is no single right conflict strategy. The right rule depends on who owns the data and what losing a change would cost. So each kind of data got its own rule, and the rules are in the documentation and in the code comment above the function that applies them.",
        {
          type: "table",
          head: ["Data", "Rule", "Why"],
          rows: [
            ["Templates", "Last writer wins per template, by updatedAt; a losing local edit is kept beside the winner", "Edited by administrators at different stations; an edit is work someone did"],
            ["Detection rules", "The server's list wins; the previous local list is backed up", "Administered centrally; a workstation must not drift"],
            ["Print history", "Append-only; the server de-duplicates by record id", "Records of things that happened; never edited"],
            ["Settings", "Never synced", "Calibration, density and pacing belong to the physical printer next to that PC"],
          ],
        },
        "Templates need the most care. When the server's version is newer, it replaces the local one, and the local version stays in that template's own version history, so a restore is possible. When the local version is newer and differs from the server's, the local one is kept, and the server's version is imported next to it as a separate template named `<name> (server <date>)`. Nothing is overwritten silently; the administrator sees both and decides. Built-in templates the server does not know are left alone.",
        "Rules are simpler on purpose. A workstation with its own idea of which serial prefix means which model would print wrong labels, so the server wins. But the replaced local list is stored under a backup key first, so if a central change was a mistake, the old list can still be inspected on the workstation.",
        "Settings are the deliberate exception. A calibration offset is measured on one printer. Syncing it to another printer would make that one print off-centre.",
      ],
    },
    {
      heading: "Making retries safe",
      body: [
        "A push can fail after the server processed it, for example when the response is lost. The next run sends the same records again. Every history record and every outbox event carries a client-generated id, and the server treats a repeated id as already done. Server tests check that pushing the same batch twice stores it once.",
        "Two less obvious cases needed handling. If the server rejects an event, say a template that fails validation, the event stays in the outbox with its error and attempt count rather than vanishing, so the problem is visible. If the server refuses history rows because the account lacks access to that module, those rows are marked as handled locally instead of being resent forever.",
        "The statuses that history records carry, including the \"held\" state for labels that may or may not have printed, are described in [continuous label printing with page counters](/blog/continuous-label-printing-page-counter-and-uncertain-jobs). Sync only records them. It never decides them.",
      ],
    },
    {
      heading: "What happens when the server is gone",
      body: [
        "A provisioned workstation boots from cache and IndexedDB, prints, keeps recording history and queueing edits, and syncs when the server comes back. That is covered by the offline browser test, described in [proving a PWA boots offline](/blog/testing-pwa-offline-boot-headless-chrome-devtools-protocol), and by sync tests for offline boot, backoff and the conflict rules. The same design makes a server restore from backup survivable: each workstation still has its own data and simply resumes syncing, and a workstation whose token postdates the backup is re-provisioned on its next sign-in, as described in [the device provisioning article](/blog/google-oidc-pkce-device-provisioning-revocable-tokens).",
        "What has not been done is the physical version of this: a workstation unplugged from the network on the line, printing a run of real labels, then reconnecting and showing them in the central history. That is part of the hardware validation still to be recorded.",
      ],
    },
  ],
};
