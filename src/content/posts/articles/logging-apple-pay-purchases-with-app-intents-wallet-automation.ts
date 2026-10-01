import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "logging-apple-pay-purchases-with-app-intents-wallet-automation",
  title: "Logging Apple Pay Taps Automatically With an App Intent and a Wallet Automation",
  description:
    "An App Intent lets the Shortcuts Wallet automation hand each Apple Pay purchase to SpenDrop. The intent, its duplicate guard, and what iOS lets apps see.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["App Intents", "Shortcuts", "Apple Pay", "iOS", "Swift", "Automation"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "App Intents + Wallet Automation to Log Apple Pay",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "payment-channel-vs-funding-account-apple-pay-reconciliation",
    "swiftdata-versioned-schema-migration-without-losing-data",
    "ios-share-extension-ocr-shared-swiftdata-store",
  ],
  sections: [
    {
      heading: "Capturing a payment without a screenshot",
      body: [
        "[SpenDrop](/work/spendrop), my iOS expense tracker, normally captures a payment from a shared screenshot. For Apple Pay there is a better route. The Shortcuts app has a Wallet \"Transaction\" automation that runs when you tap a card, and it can pass the merchant, the amount and the card name to an action. If the app provides that action, an Apple Pay purchase can be logged with no screenshot and no typing.",
        "This note shows the App Intent SpenDrop provides for that, the guard that stops one tap becoming two expenses, and the limits. It is for iOS developers who want their app to react to Apple Pay purchases.",
        {
          type: "callout",
          label: "Not yet tested on a device",
          text: "The Wallet automation only runs on a physical iPhone, and SpenDrop version 1.4.0 has not yet been verified on one. The intent builds, its metadata is generated, and the recording logic is covered by the in-app tests on the iOS 27 simulator; the automation end to end has not been run. SpenDrop is not on the App Store.",
        },
      ],
    },
    {
      heading: "The intent",
      body: [
        "An App Intent is a struct with typed parameters and a `perform()` method. Shortcuts shows it as an action and lets the automation fill the parameters from its variables:",
        {
          type: "code",
          lang: "swift",
          code: `struct LogApplePayPurchaseIntent: AppIntent {
    static var title: LocalizedStringResource = "Log Apple Pay Purchase"
    static var description = IntentDescription(
        "Adds an Apple Pay purchase to SpenDrop. Use it in a Shortcuts Wallet “Transaction” automation.")
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Amount")   var amount: Double
    @Parameter(title: "Merchant") var merchant: String
    @Parameter(title: "Card")     var card: String?

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let context = ExpenseDataContainer.shared.mainContext
        guard ExpenseDataContainer.isPersistentStoreHealthy else {
            return .result(dialog: "SpenDrop can't open its data right now. Open the app to check.")
        }
        let outcome = ApplePayAutomation.record(amount: amount, merchant: merchant, card: card, in: context)
        return .result(dialog: IntentDialog(stringLiteral: outcome.message))
    }
}

struct SpenDropShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: LogApplePayPurchaseIntent(),
                    phrases: ["Log Apple Pay purchase in \\(.applicationName)"],
                    shortTitle: "Log Apple Pay Purchase",
                    systemImageName: "wallet.pass")
    }
}`,
          caption: "From SpenDrop's App/ApplePayIntent.swift, lightly reformatted.",
        },
        "`openAppWhenRun = false` matters: the purchase is recorded in the background and the automation shows a one-line result, so paying for coffee does not open an app. The health check matters too. If SpenDrop's database could not be opened and the app is running in its safe mode, the intent refuses to write rather than saving into a temporary store that will be thrown away. That safe mode is explained in [SwiftData Migrations That Can't Lose Data](/blog/swiftdata-versioned-schema-migration-without-losing-data).",
        "To use it, the user creates a personal automation in Shortcuts: Wallet, choose the cards, then add \"Log Apple Pay Purchase\" with the Merchant, Amount and Card variables.",
      ],
    },
    {
      heading: "Recording the purchase, once",
      body: [
        "The intent hands everything to a small `ApplePayAutomation.record` function, which is plain Swift and therefore testable without Shortcuts. It rejects an amount that is not a finite number above zero, uses \"Apple Pay purchase\" when the merchant is empty, and converts the amount to integer sen before comparing anything.",
        "An automation can fire twice for one tap, so the function skips a purchase when an expense with the same amount and the same merchant (ignoring case) already exists within ten minutes, and tells the user it was not added again.",
        "Then it saves an expense with the Apple Pay channel, a note saying it was recorded by the automation, and a category from SpenDrop's learned merchant rules. The card name is used to find the bank behind the card: \"Maybank Visa Debit\" maps to Maybank, and a card name it does not recognise leaves the bank unknown rather than guessed. The expense is linked to the matching account. When the bank's own record of the same purchase arrives later as a screenshot, the reconciliation described in [Apple Pay Is Not a Bank](/blog/payment-channel-vs-funding-account-apple-pay-reconciliation) offers to merge the two instead of counting the purchase twice.",
      ],
    },
    {
      heading: "What iOS does not let an app see",
      body: [
        "This works for Apple Pay because Apple provides the automation. It does not extend to anything else. An iOS app cannot read another app's notifications, so a Touch 'n Go payment, a DuitNow QR payment from a bank app or a card-issuer alert cannot trigger SpenDrop. Those still go through the screenshot and Share Extension path.",
        "Two implementation details are worth improving. The duplicate guard fetches every expense and filters in memory, where a date-bounded fetch would do. And the save ignores errors with `try?`, which the project's own notes list among the remaining local saves to convert to handled errors.",
      ],
    },
  ],
};
