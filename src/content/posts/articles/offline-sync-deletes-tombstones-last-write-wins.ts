import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "offline-sync-deletes-tombstones-last-write-wins",
  title: "Deletes That Don't Come Back: Tombstones and Last-Write-Wins in Offline Sync",
  description:
    "In offline sync, a deleted record comes back when another copy is pushed. DriveKeep's soft deletes, tombstone list and timestamp merge, and its clock problem.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Offline Sync", "Tombstones", "PostgreSQL", "Supabase", "Swift", "Conflict Resolution"],
  contentType: "Explainer",
  searchIntent: "informational",
  seoTitle: "Offline Sync Deletes With Tombstones in PostgreSQL",
  relatedProjects: ["drivekeep"],
  relatedPosts: [
    "express-5-pglite-api-jwt-security-tests",
    "local-first-sync-conflict-policy-offline-pwa",
    "optimistic-concurrency-postgres-upsert-revision-409",
    "append-only-cloud-backup-supabase-storage-rls",
  ],
  sections: [
    {
      heading: "The record that came back",
      body: [
        "Offline-first sync has a classic failure. You delete a refill on your phone while offline. Before the phone reconnects, a sync pulls the server's copy of your data, which still contains that refill, and the merge adds it back because, as far as the merge can tell, it is a record the phone simply does not have yet. Or another device that still holds the row pushes it up again. Either way the deletion is undone, and the user deletes the same thing twice and stops trusting the app.",
        "A plain `DELETE` cannot fix this, because absence carries no information: \"I do not have this row\" looks the same whether it was deleted or never arrived. The fix is to make a deletion a piece of data that syncs like any other. That record of a deletion is called a tombstone. This article shows how [DriveKeep](/work/drivekeep), my fuel and maintenance log, does it in two places, and where its conflict rule is weaker than it looks. It is for anyone writing sync between a mobile app and PostgreSQL.",
      ],
    },
    {
      heading: "On the phone: a tombstone list that survives relaunch",
      body: [
        "In the iOS app, deleting a record does two things: it removes the record from the local store and adds a tombstone, the record's id and table and the time, marked as pending. Deleting a vehicle tombstones the vehicle and everything that hangs off it: its refills, maintenance items, expenses and odometer checks. Tombstones are written to their own file next to the data, because a pending deletion that is lost on relaunch means a record that comes back.",
        "A sync then runs in a fixed order, and the order is the point:",
        {
          type: "flow",
          steps: [
            "Upload pending records (the offline queue)",
            "Upload pending attachments",
            "Push tombstones: set deleted_at on the server rows",
            "Download remote rows and merge",
          ],
          caption: "From SyncManager.swift. Deletions go up before anything comes down.",
        },
        "Pushing tombstones before downloading means the server already knows about the deletion by the time the phone asks for data. On Supabase, a deletion is an update that sets `deleted_at`, not a SQL `DELETE`, so every other device sees the row as deleted instead of seeing it vanish. A comment in the schema says exactly that, and the schema adds partial indexes on `deleted_at IS NULL` so live-row queries stay cheap.",
      ],
    },
    {
      heading: "The merge: skip, remove, or compare timestamps",
      body: [
        "Every remote row goes through one generic merge function. The rules fit in a few lines:",
        {
          type: "code",
          lang: "swift",
          code: `private func merge<T: SyncableRecord>(_ remote: [T], into local: inout [T], entity: String) {
    for r in remote {
        if isTombstoned(r.id, entity: entity) { continue }        // deleted here, not yet confirmed
        if r.deletedAt != nil {                                    // deleted elsewhere
            local.removeAll { $0.id == r.id }
            continue
        }
        if let idx = local.firstIndex(where: { $0.id == r.id }) {
            if r.updatedAt >= local[idx].updatedAt { local[idx] = r }   // last write wins
        } else {
            local.append(r)
        }
    }
}`,
          caption: "From DataStore.swift.",
        },
        "A row this device has tombstoned is ignored even if the server still has it live, which covers a tombstone push that failed. A row deleted elsewhere is removed locally. Otherwise the newer `updatedAt` wins. Remote rows are merged, never assigned wholesale: an earlier version replaced the local arrays with the cloud's, which silently dropped any record that had not been uploaded yet.",
      ],
    },
    {
      heading: "In the standalone backend: a tombstone table",
      body: [
        "DriveKeep's Express backend, which is built and tested but not yet connected to either app, takes the same approach with an explicit table. Its sync endpoint accepts a batch of records and tombstones. Records are upserted with a guard so an older copy cannot overwrite a newer one:",
        {
          type: "code",
          lang: "sql",
          code: `INSERT INTO refills (id, user_id, vehicle_id, odometer, fuel_amount, price_per_unit, total_cost, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id) DO UPDATE SET
    odometer = EXCLUDED.odometer,
    fuel_amount = EXCLUDED.fuel_amount,
    price_per_unit = EXCLUDED.price_per_unit,
    total_cost = EXCLUDED.total_cost,
    updated_at = EXCLUDED.updated_at
WHERE EXCLUDED.updated_at >= refills.updated_at;`,
          caption: "From backend/docs/SYNC_PROTOCOL.md.",
        },
        "Each tombstone sets `deleted_at` on the row, scoped to the caller's user id, and is recorded in a `sync_tombstones` table, so a client can later ask for every deletion since its last sync. Table names arrive from the client, so they are checked against an allowlist before being placed in the SQL. The design is in migration `003_audit_and_sync_tombstones`; how the rest of that API is secured is in [A Postgres-Backed Express 5 API With No Database Server](/blog/express-5-pglite-api-jwt-security-tests).",
      ],
    },
    {
      heading: "The weak spot: whose clock is updated_at?",
      body: [
        "Last-write-wins is only as good as the timestamps it compares, and here they come from two different clocks. Both the Supabase schema and the backend migration install a trigger that sets `updated_at = now()` on every update. That keeps timestamps honest for edits made on the server, but it also overrides the timestamp a device sends. So a stored `updated_at` is the server's time of the write, while the incoming one in the upsert guard, and the local one in the phone's merge, are device times. A phone whose clock runs fast or slow can win or lose conflicts it should not.",
        "The robust fixes are known: compare a server-assigned version number instead of times (the approach in [Optimistic Concurrency With a Postgres Upsert](/blog/optimistic-concurrency-postgres-upsert-revision-409)), or let the trigger skip rows whose timestamp was supplied by a sync. A smaller point: the backend's tombstone insert uses `ON CONFLICT DO NOTHING`, but the table has no unique constraint on table and record, so repeated pushes can store duplicates; harmless for reads, untidy for storage.",
        {
          type: "callout",
          label: "Status",
          text: "None of this sync code has been verified against a live Supabase project. The iOS app has not been built or run for the project's audit, and cloud sync is off by default. The backend's tests pass 64 of 64 after migrate and seed, but it is not connected to either app.",
        },
      ],
    },
  ],
};
