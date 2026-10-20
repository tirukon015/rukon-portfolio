import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "swiftdata-local-first-outbox-sync-engine",
  title: "Sub-Millisecond Saves: Designing a Local-First Outbox and Sync Engine in SwiftData",
  description:
    "How SpenDrop achieved an on-device save latency of 0.240 ms in SwiftData while synchronising in the background with a remote Supabase PostgreSQL backend using the persistent outbox pattern.",
  date: "2026-10-13",
  category: "Full-Stack Development",
  tags: ["SwiftData", "iOS", "Swift", "Local-First", "Offline Sync", "Supabase", "Performance"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "SwiftData Local-First Sync Outbox: Sub-Millisecond Saves",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "app-group-swiftdata-store-was-never-the-one-in-use",
    "append-only-cloud-backup-supabase-storage-rls",
    "apple-foundation-models-structured-receipt-extraction",
  ],
  sections: [
    {
      heading: "The UX requirement: instant typing without network latency",
      body: [
        "In a personal expense tracker like [SpenDrop](/work/spendrop), speed is the primary product requirement. When a user splits a restaurant bill across four friends or reviews an extracted receipt amount, the interface must respond without micro-stutters. Traditional cloud-first architectures send an HTTP mutation on every button tap, forcing the UI to either display a loading spinner or manage complex optimistic state rollbacks.",
        "A truly local-first mobile application writes directly to disk on the device first. The network is treated as an asynchronous background synchronization channel rather than a blocking prerequisite for user interaction.",
      ],
    },
    {
      heading: "The architecture: SwiftData save recorder and persistent outbox",
      body: [
        "To decouple user interaction from network I/O, SpenDrop implements the **Persistent Outbox Pattern** directly within the SwiftData persistence lifecycle.",
        {
          type: "flow",
          steps: [
            "User confirms expense edit in SwiftUI form",
            "Main actor context writes mutation to SwiftData store",
            "SaveRecorder intercepts context save and generates OutboxRecord",
            "Background synchronization actor reads pending outbox queue",
            "Mutations coalesced into batch upsert payload",
            "Network transport executes POST to remote Supabase backend",
            "On 200 OK, outbox queue marks records synced",
          ],
          caption: "Data flow from local SwiftData save to background remote synchronization.",
        },
        "A custom `SaveRecorder` hooks into `ModelContext.didSave` notifications. Whenever an `Expense`, `Account`, or `Split` entity is inserted or updated, the recorder serializes the entity's primary key, table name, and modified fields into an `OutboxRecord` stored within the same local SQLite container. Because both the entity and its outbox log are written in the same local transaction, outbox writes cannot become desynchronized from local state.",
      ],
    },
    {
      heading: "Benchmarked results: 0.240 ms on-device save latency",
      body: [
        "In SpenDrop PR #5, we instrumented the save pipeline across 27 automated test suites and live hardware sessions. We measured the total elapsed time on the main thread between calling `context.save()` and returning control to SwiftUI's render loop.",
        {
          type: "table",
          head: ["Configuration", "Mean Save Latency", "Network Blocking", "Data Safety"],
          rows: [
            ["Local Only (Sync Disabled)", "0.233 ms", "0.0 ms", "On-device SQLite ACID"],
            ["Local-First Outbox (Sync Enabled)", "0.240 ms", "0.0 ms (Async Background Actor)", "Persistent Outbox + Remote Backup"],
            ["Conventional Cloud-First API Call", "180.00 – 650.00 ms", "180 – 650 ms (Main/Worker)", "Vulnerable to offline dropouts"],
          ],
          caption: "On-device latency comparison benchmarked on Apple hardware.",
        },
        "The overhead of appending an outbox record was just **7 microseconds** (0.007 ms). The main thread never waits for HTTP handshakes, SSL negotiation, or remote server locks.",
      ],
    },
    {
      heading: "Coalescing mutations: preventing network floods",
      body: [
        "A common hazard with local-first systems is mutation flooding. If a user quickly adjusts an expense amount four times, naive sync engines fire four separate HTTP PUT requests to the server.",
        "SpenDrop's background actor implements mutation coalescing. Before dispatching a network request, the actor inspects the pending outbox queue and merges duplicate edits targeting the same entity ID. In our benchmark evaluations, a burst of 25 rapid user edits coalesced into just 5 consolidated HTTP payloads, reducing bandwidth consumption and remote database row contention.",
      ],
    },
    {
      heading: "Conflict resolution: deterministic Last-Writer-Wins",
      body: [
        "When synchronizing across multiple devices (e.g. iPhone and Web), conflicts are resolved using a deterministic **Last-Writer-Wins (LWW)** strategy backed by UTC `updated_at` ISO timestamps and cursor-based pull pagination.",
        "Before applying local outbox changes to the cloud, the sync actor executes a cursor query fetching any records modified on the remote database since the last local sync timestamp. If a remote record has a newer `updated_at` timestamp than the local pending edit, the local change yields, preserving data integrity across shared splits.",
      ],
    },
  ],
};
