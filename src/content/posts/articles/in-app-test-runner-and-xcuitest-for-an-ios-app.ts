import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "in-app-test-runner-and-xcuitest-for-an-ios-app",
  title: "Testing an iOS App With an In-App Test Runner, Launch Flags and XCUITest",
  description:
    "274 logic checks run inside the app from a launch flag, a final check proves no test opened the real database, and six XCUITest flows drive the UI.",
  date: "2026-12-14",
  category: "Developer Journey",
  tags: ["iOS", "Testing", "XCUITest", "Swift", "simctl", "SwiftData", "Test Isolation"],
  contentType: "Experience-led",
  searchIntent: "informational",
  seoTitle: "In-App Test Runner and XCUITest for iOS",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "generating-an-xcode-project-file-from-a-script",
    "swiftdata-versioned-schema-migration-without-losing-data",
    "testing-without-paid-apis-or-hardware-and-where-fakes-lie",
    "append-only-cloud-backup-supabase-storage-rls",
    "splitting-a-bill-in-integer-sen-largest-remainder",
  ],
  sections: [
    {
      heading: "Tests that live inside the app",
      body: [
        "Most iOS projects put their tests in an XCTest bundle and run them from Xcode's test navigator. [SpenDrop](/work/spendrop), my iOS expense tracker, started differently. Its first tests were plain Swift functions compiled into the app itself, run from a self-test screen in Settings. The project notes record the reason as testing without needing a Mac and Xcode in the loop: the checks travel with the app and run wherever it runs.",
        "By version 1.4.0 the same approach carried 274 checks across twelve suites, could be run from the command line with a process exit code, and was joined by a proper XCUITest target for the UI. This is an account of how that works, what it costs, and the one bug it caught that I most needed caught. It is for iOS developers deciding how to test logic-heavy apps, especially ones with local data they cannot afford to touch.",
      ],
    },
    {
      heading: "Running suites from a launch argument",
      body: [
        "Every suite is a function that returns a list of results, each with a name, pass or fail, and the expected and actual values. A table maps each suite to a launch flag:",
        {
          type: "code",
          lang: "swift",
          code: `public static let suites: [(name: String, flag: String, run: () -> [TestCaseResult])] = [
    ("Existing",       "--run-tests",             { TransactionParserTests.runAllTests() }),
    ("Data safety",    "--run-data-safety-tests", { DataSafetyTests.runAllTests() }),
    ("Phase 2",        "--run-financial-tests",   { FinancialModelTests.runAllTests() }),
    // ...Phases 3 to 8...
    ("Authentication", "--run-auth-tests",        { blocking { await AuthTests.runAllTests() } }),
    ("Cloud Backup",   "--run-cloud-tests",       { blocking { await CloudBackupTests.runAllTests() } }),
    // Must stay last: proves none of the suites above touched the user's real database.
    ("Test isolation", "--run-all-tests",         { isolationCheck() })
]`,
          caption: "From TestKit.swift. Async suites are driven to completion by spinning the main run loop.",
        },
        "The check happens in the app's `init`, before any scene or database exists. If a test flag is present, the selected suites run, every result is printed as a `[TEST][suite] [PASS|FAIL]` line, each suite prints one `[SUITE_SUMMARY] <suite>: n/m PASSED` line, and the process exits with 0 if everything passed and 1 otherwise. That makes it usable from a terminal or a script:",
        {
          type: "code",
          lang: "bash",
          code: `xcodebuild -project SpenDrop.xcodeproj -scheme SpenDrop \\
  -destination 'platform=iOS Simulator,name=iPhone 17' build

xcrun simctl launch --console-pty booted com.spendrop.SpenDrop --run-all-tests
# [SUITE_SUMMARY] Existing: 93/93 PASSED ... Test isolation: 1/1 PASSED`,
          caption: "From the project README.",
        },
      ],
    },
    {
      heading: "What the suites cover",
      body: [
        "The suites grew phase by phase with version 1.4.0, and each phase was gated by the full run before the next began:",
        {
          type: "table",
          head: ["Suite", "Covers"],
          rows: [
            ["Existing", "parsing, amounts, false positives, providers, reference screenshots as text, merchant rules, filters, reconciliation, PayBook, backup, share flow"],
            ["Data safety", "safe mode, corrupt store, frozen schemas, pre-upgrade copies, backup history"],
            ["Phase 2 to Phase 8 (seven suites)", "money conversion and splits, accounts, money in and out, shared expenses, balances, timeline, automation, migrations, hardening"],
            ["Authentication", "PKCE, Google exchange, email sign-in, refresh, offline, expiry"],
            ["Cloud backup", "upload, append-only, unchanged skipped, failure and retry, restore merge"],
            ["Test isolation", "no suite opened the real database"],
          ],
          caption: "The recorded run on the iOS 27 simulator on 29 September 2026 reports 274 of 274 checks passing across the twelve suites.",
        },
        "Suites use in-memory SwiftData containers or temporary folders. The authentication and cloud suites run against an in-memory fake of Supabase's HTTP API, which is useful for testing the client's behaviour and says nothing about whether the real server agrees; [Testing Without Paid APIs or Hardware](/blog/testing-without-paid-apis-or-hardware-and-where-fakes-lie) discusses where fakes like that lie. The parser checks feed synthetic OCR text, so they test the rules, not how well Apple's Vision framework reads a screenshot.",
      ],
    },
    {
      heading: "The test that opened the real database",
      body: [
        "Version 1.4.0 taught the Share Extension to suggest a learned category for a merchant. I added that lookup to the function that applies a parsed transaction to the review form. The existing self-tests call that function, so the next test run opened the real store, and, because the schema had changed, upgraded it. Nothing was lost, and I reproduced it on a copy of V2 data, but a test run had just migrated a user's database.",
        "The fix had two parts. The function went back to having no database access, and the suggestion moved to the real OCR path. Then I added a check that makes the mistake impossible to repeat silently. Test runs happen before the app opens its database, so the store status is still its initial value, safe mode with no store URL. If any suite had opened the real store, that status would have changed:",
        {
          type: "code",
          lang: "swift",
          code: `static func isolationCheck() -> [TestCaseResult] {
    var untouched = false
    if case .safeMode(_, let url) = ExpenseDataContainer.storeStatus, url == nil { untouched = true }
    return [TestCaseResult(testName: "Test suites never open the real database", passed: untouched,
                           expected: "store never opened",
                           actual: untouched ? "never opened" : "OPENED",
                           details: "Isolation")]
}`,
          caption: "From TestKit.swift (the failure message is shortened here). It always runs last.",
        },
        "It is one check, but it is the one I trust most, because it tests the property I care about directly instead of trusting every suite to behave.",
      ],
    },
    {
      heading: "XCUITest for the flows people actually use",
      body: [
        "Logic tests cannot tell you that a button exists or that a balance appears on the right screen. Version 1.4.0 added a `SpenDropUITests` target with six flows: the five tabs in order; adding an expense; splitting a RM 30 expense with a new person and seeing \"owes you RM 15.00\" in PayBook; creating two accounts, recording Money In and a transfer, and checking filters and account totals; the cash-flow card and the Breakdown cash-flow view; and the Account screen in its not-configured state. Key controls carry accessibility identifiers so the tests do not depend on layout, and each flow attaches screenshots to the result bundle.",
        "The UI tests launch the app with `--ui-testing`. In that mode the app creates a fresh temporary database on every launch, seeds no sample data and writes no backups, so the user's store and backup files are never touched. All six passed on 29 September 2026.",
      ],
    },
    {
      heading: "The trade-offs",
      body: [
        "An in-app runner has real costs. There is no test navigator integration and no code coverage, and the test code ships in the app binary. In exchange the checks run anywhere the app runs, need nothing but the app, and report through a process exit code, which is all a CI job needs.",
        "SpenDrop does not have CI yet; the counts above are from a recorded run, not from a pipeline. Version 1.4.0 has not been run on a physical iPhone, the Share Extension and the Wallet automation have not been tested at runtime for this release, there is no VoiceOver audit, and there are no performance benchmarks. SpenDrop is not on the App Store. What the data-safety suite protects is described in [SwiftData Migrations That Can't Lose Data](/blog/swiftdata-versioned-schema-migration-without-losing-data).",
      ],
    },
  ],
};
