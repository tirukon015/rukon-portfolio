import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "app-group-swiftdata-store-was-never-the-one-in-use",
  title: "The SwiftData Store I Configured Was Never the One Being Used",
  description:
    "Renaming an iOS app opened an empty database. The App Group store URL I had configured had never worked; SwiftData's fallback had been doing the job.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["SwiftData", "App Groups", "iOS", "Share Extension", "Debugging", "Data Safety"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "App Group SwiftData Store URL Pitfall on iOS",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "swiftdata-versioned-schema-migration-without-losing-data",
    "ios-share-extension-ocr-shared-swiftdata-store",
    "in-app-test-runner-and-xcuitest-for-an-ios-app",
  ],
  sections: [
    {
      heading: "A rename, and an empty app",
      body: [
        "[SpenDrop](/work/spendrop) started life as \"SpendDrop\". Renaming it to SpenDrop meant new bundle identifiers for the app and its Share Extension and, in the first attempt, a new App Group identifier as well. On my own iPhone the renamed app opened to an empty store, while the old build still held 19 real transactions I had logged with it.",
        "This note is for anyone sharing a SwiftData store between an iOS app and an extension through an App Group. It explains why the data looked lost, what I found when I went looking for it, and the one-line configuration that fixed it.",
      ],
    },
    {
      heading: "Why an App Group identifier is part of your data",
      body: [
        "An app and its extension run as separate processes with separate sandboxes. For both to read and write the same database, the store has to live in a shared container, and on iOS that container belongs to an App Group. Both targets get the App Group entitlement, both open the same schema, and both point SwiftData at a file inside the group's container.",
        "The container is identified by the group identifier. Change the identifier and the system gives you a different, new, empty container. Nothing is migrated; the old container is still there, owned by the old identifier, but the renamed app has no reason to look in it. So the first explanation was simple: the new group was empty because it was new.",
      ],
    },
    {
      heading: "What was actually in the container",
      body: [
        "Before changing anything I wanted to see the real files. I copied the old app's group container off the phone with Xcode's `devicectl device copy from` command and opened the database with `sqlite3`: 19 rows in `ZEXPENSE` and one in `ZPAYBOOKCONTACT`. The data was intact.",
        "The file name was the surprise. My configuration pointed SwiftData at an explicit URL, a file called `SpenDrop.store` in the group container, created with `ModelConfiguration(schema:url:)`. That file was not what held the data. The group container held `Library/Application Support/default.store`, which is where SwiftData writes when it creates its default configuration for an app that belongs to exactly one App Group.",
        "In other words, the URL-based configuration had been failing on the device all along, and a fallback path in the container code, a plain `ModelContainer(for:)`, had been silently doing the work. Every expense I had saved, from the app and from the Share Extension, had gone into a store I had never explicitly configured. It worked, so nothing had prompted me to look.",
      ],
    },
    {
      heading: "The fix: stop naming files, name the group",
      body: [
        "SwiftData can be told to use a group container by identifier rather than by URL. That resolves to the same `default.store` location the fallback had been using, so the store that already existed on the phone is the one that opens:",
        {
          type: "code",
          lang: "swift",
          code: `// Before: an explicit file URL that never opened on the device
// ModelConfiguration(schema: schema, url: groupURL.appendingPathComponent("SpenDrop.store"))

// After: let SwiftData resolve the store inside the App Group container
let groupConfig = ModelConfiguration(schema: schema,
                                     groupContainer: .identifier(appGroupIdentifier))`,
        },
        "The App Group identifier went back to its original value and became a single documented constant used by both targets. The receipts folder inside the container kept its original name for the same reason. With that, the renamed app opened the existing store on the device without copying anything. Before trying it on the phone, I proved the configuration on the simulator by placing the backed-up store at the group path and checking that the real rows appeared on the dashboard. Both targets still built and the 48 in-app tests that existed at that point passed.",
        "The current container code also has a small safety net: if a store exists under the older group identifier and none exists under the current one, the three store files (`default.store`, `-shm`, `-wal`) are copied across before the store is opened. It copies and never moves, so the original is left where it was.",
      ],
    },
    {
      heading: "What to check in your own app",
      body: [
        {
          type: "list",
          items: [
            "Find out which file your store actually is. On the simulator, print the configuration's `url` after the container opens; on a device, copy the group container off with `devicectl` and look.",
            "Treat a fallback that swallows a failed configuration as a bug. If the first attempt fails, log it loudly, because a working fallback hides the failure indefinitely.",
            "Treat App Group identifiers, store names and folder names as a contract with existing users. A rename that touches them needs a migration or a decision to keep them.",
            "Prove recovery on a copy first. Injecting a copied store into the simulator's group container is quick and risks nothing.",
          ],
        },
        "The same release moved SpenDrop's store to explicit versioned schemas with a copy taken before every upgrade, which is described in [SwiftData Migrations That Can't Lose Data](/blog/swiftdata-versioned-schema-migration-without-losing-data). Both changes came from the same realisation: on a local-first app, the storage layer is the product's memory, and nothing else will notice when it goes wrong.",
        {
          type: "callout",
          label: "Scope",
          text: "The investigation and the fix were done on an earlier build, on the developer's own iPhone and on the simulator. Version 1.4.0 has been verified on the simulator only, and SpenDrop is not on the App Store.",
        },
      ],
    },
  ],
};
