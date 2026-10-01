import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "swiftdata-versioned-schema-migration-without-losing-data",
  title: "SwiftData Migrations That Can't Lose Data: VersionedSchema, Pre-Upgrade Copies and a Safe Mode",
  description:
    "SwiftData's inferred migration silently dropped a table. How SpenDrop moved to VersionedSchemas, pre-upgrade copies and a safe mode that never deletes.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["SwiftData", "iOS", "Swift", "Data Migration", "Backups", "Data Safety"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  seoTitle: "Safe SwiftData Migrations: VersionedSchema and Backups",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "app-group-swiftdata-store-was-never-the-one-in-use",
    "in-app-test-runner-and-xcuitest-for-an-ios-app",
    "why-system-maintenance-matters-after-deployment",
  ],
  sections: [
    {
      heading: "The upgrade is where a local-first app loses data",
      body: [
        "[SpenDrop](/work/spendrop) keeps everything on the phone in a SwiftData store. There is no server copy unless the user signs in and turns on backup, so if an app update damages the store, the data is simply gone. Version 1.4.0 added accounts, shared bills, money in and out and learned categories, which meant new tables and new fields on existing ones. Before writing any of those features I spent the first phase of that release on one question: what happens to a real user's database when the model changes?",
        "The answers were worse than I expected, in two ways. This article is for iOS developers using SwiftData who are about to change a shipped model, and it covers both problems and what replaced them.",
      ],
    },
    {
      heading: "Problem one: a failed open deleted the database",
      body: [
        "The original container code had a recovery path. If the store could not be opened, it deleted the `default.store` files and rebuilt from the app's automatic JSON backup. That sounds reasonable until you check when the backup was written: only after a restore or an import. On a normal user's phone it could be days old, and a failed migration would have quietly replaced their data with an old copy.",
        "The replacement, `openStoreSafely`, has one rule: it never deletes. If the store cannot be opened, the app starts in safe mode on a temporary in-memory store, leaves the files exactly where they are, and tells the user nothing was deleted. The only destructive-looking action, \"Move Aside & Use Backup\", moves the files into a dated `SpenDropSafety/failed-open-…` folder, and only when the user asks.",
        {
          type: "code",
          lang: "swift",
          code: `static func openStoreSafely(storeURL: URL, configuration: ModelConfiguration,
                            defaults: UserDefaults) -> (container: ModelContainer, status: StoreStatus) {
    let fingerprint = schemaFingerprint(currentSchema)
    snapshotStoreIfSchemaChanged(storeURL: storeURL, fingerprint: fingerprint, defaults: defaults)

    do {
        let container = try openPersistentContainer(configuration: configuration)
        defaults.set(fingerprint, forKey: schemaFingerprintKey)
        return (container, .persistent(storeURL: storeURL))
    } catch {
        // The store is left untouched on disk. Nothing written now is saved.
        return (makeInMemoryContainer(), .safeMode(reason: String(describing: error), storeURL: storeURL))
    }
}`,
          caption: "From ExpenseDataContainer.swift, logging removed.",
        },
        "Other parts of the app check `isPersistentStoreHealthy` before writing. The Shortcuts action that logs Apple Pay purchases, for example, refuses to run in safe mode and asks the user to open the app instead.",
      ],
    },
    {
      heading: "Problem two: SwiftData can drop data without an error",
      body: [
        "The second finding came from a test. I opened a store that had been created with a different model, expecting an error. It succeeded. SwiftData's inferred (automatic) migration had removed the entity it did not recognise, rows and all, and reported nothing.",
        "That changes what a migration strategy has to protect against. Catching errors is not enough when the dangerous case does not produce one. Two things replaced the implicit behaviour.",
        "First, the schema became explicit. The model as it shipped before 1.4.0 is frozen as `SpenDropSchemaV1`, with nested copies of the old model classes and a comment saying never to edit them, because any change makes existing stores unrecognisable. V2 adds the new tables and fields, all optional or defaulted. V3 adds one standalone table for learned category rules.",
        {
          type: "code",
          lang: "swift",
          code: `public enum SpenDropMigrationPlan: SchemaMigrationPlan {
    public static var schemas: [any VersionedSchema.Type] {
        [SpenDropSchemaV1.self, SpenDropSchemaV2.self, SpenDropSchemaV3.self]
    }
    public static var stages: [MigrationStage] { [migrateV1toV2, migrateV2toV3] }

    // Only adds the ClassificationRule table; existing data is untouched.
    static let migrateV2toV3 = MigrationStage.lightweight(
        fromVersion: SpenDropSchemaV2.self, toVersion: SpenDropSchemaV3.self)

    // Adds tables and columns, then creates one Account per distinct funding
    // account and links existing expenses to it. No column is removed or changed.
    static let migrateV1toV2 = MigrationStage.custom(
        fromVersion: SpenDropSchemaV1.self, toVersion: SpenDropSchemaV2.self,
        willMigrate: nil,
        didMigrate: { context in
            _ = AccountLinker.linkUnlinkedExpenses(in: context)
            try context.save()
        })
}`,
          caption: "V1 to V2 needs a custom stage because it creates data; V2 to V3 only adds a table.",
        },
        "V2 lists the live model types rather than frozen copies, so a test checks V2's fingerprint against the shipped model. The day any of those types changes, V2 has to be frozen first, the same way V1 was.",
        "Second, and more important, the store is copied before it is opened with a changed schema. That copy is the only protection against a silent drop: if something disappears, the pre-upgrade copy still has it.",
      ],
    },
    {
      heading: "Knowing when the schema changed",
      body: [
        "A pre-upgrade copy is only useful if it is taken at the right moment. The first version recorded a fingerprint of the schema (every entity, attribute and relationship, sorted into a string) in shared UserDefaults after each successful open, and took a copy whenever the current fingerprint differed.",
        "Then a test swapped the store file, which is what a restore does, and no copy was taken. UserDefaults still held the fingerprint of the model that had last opened a store, not of the store that was now on disk. The settings said nothing had changed.",
        "The fix asks the store itself as well. Core Data can read a store's metadata without opening it, and a managed object model can say whether it is compatible with that metadata. A copy is taken if either check says the model changed.",
        {
          type: "code",
          lang: "swift",
          code: `static func storeMatchesCurrentModel(storeURL: URL) -> Bool {
    guard let metadata = try? NSPersistentStoreCoordinator.metadataForPersistentStore(
              type: .sqlite, at: storeURL),
          let model = NSManagedObjectModel.makeManagedObjectModel(for: SpenDropSchemaV3.models)
    else { return false }   // unreadable metadata counts as "changed"
    return model.isConfiguration(withName: nil, compatibleWithStoreMetadata: metadata)
}

// Copy when the recorded fingerprint differs OR the file does not match the model.
let fingerprintChanged = defaults.string(forKey: schemaFingerprintKey) != fingerprint
guard fingerprintChanged || !storeMatchesCurrentModel(storeURL: storeURL) else { return nil }`,
        },
        "The copy includes the `-shm` and `-wal` files next to the store, goes into `SpenDropSafety/pre-upgrade-<timestamp>/`, and only the newest three are kept.",
      ],
    },
    {
      heading: "Backups that keep history",
      body: [
        "The JSON auto-backup was rewritten alongside this. It is now refreshed after saves (debounced), when the app goes to the background and when it returns. The previous file is kept once per day for seven days, and separately whenever a new backup would contain fewer records than the last one, the last five of those. That second rule exists because the backup you need is the one from before something disappeared.",
        "Imports match records by id, never merge people by name, report possible duplicates instead of skipping them, and refuse a backup written by a newer app version.",
      ],
    },
    {
      heading: "Rehearsing on copies of real data",
      body: [
        "Unit tests with invented stores prove the mechanism; they do not prove that my own data survives. So each migration was rehearsed on the simulator with copies of real stores, and the results are recorded in the project documentation:",
        {
          type: "table",
          head: ["Rehearsal", "Result"],
          rows: [
            ["V1 (the original, pre-safety store) to V3", "23 expenses (RM 1,500.11 in total), 10 people and 16 payment methods preserved; 5 accounts created and 22 expenses linked, 1 \"Unknown\" left unlinked; pre-upgrade copy taken"],
            ["V2 (with money movements) to V3", "ids, amounts, funding text, account links and movements byte-identical; rules table added; pre-upgrade copy taken"],
            ["Rollback", "the pre-1.4 app opened a pre-upgrade copy with all its data"],
            ["Safe mode", "a deliberately corrupted store was left untouched, and a good backup was not overwritten"],
          ],
        },
        "The data-safety suite in the app's own test runner covers the same ground in 18 checks, including \"Failed migration leaves database untouched\", \"Pre-upgrade copy keeps data an automatic migration drops\" and \"Pre-upgrade copy taken when settings are out of sync with the store\". All 274 in-app checks passed on the iOS 27 simulator on 29 September 2026.",
        {
          type: "callout",
          label: "Not yet verified",
          text: "Version 1.4.0 has been verified on the simulator only, not on a physical iPhone, and SpenDrop is not on the App Store. The rehearsals used copies of stores, not an in-place upgrade on a device.",
        },
      ],
    },
    {
      heading: "What I would tell someone starting with SwiftData",
      body: [
        "Freeze your first shipped model as a `VersionedSchema` before you change anything, even if the change looks additive. Take a file copy of the store before opening it with a new schema, and decide that change from the store's own metadata, not only from something you cached. Never delete a store you failed to open; you can always offer to move it aside later. And test the case where the migration succeeds, because that was the one that lost data.",
        "The storage location mattered just as much: SpenDrop's store lives in an App Group container shared with its Share Extension, and I later found the configuration I had written for it had never been the one in use, which is a separate story. The [SpenDrop project page](/work/spendrop) covers the rest of the app. For why this kind of care continues after release, see [Why System Maintenance Matters After Deployment](/blog/why-system-maintenance-matters-after-deployment).",
      ],
    },
  ],
};
