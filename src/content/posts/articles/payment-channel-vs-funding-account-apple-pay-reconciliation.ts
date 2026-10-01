import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "payment-channel-vs-funding-account-apple-pay-reconciliation",
  title: "Apple Pay Is Not a Bank: Payment Channels, Funding Accounts and Reconciling Double Records",
  description:
    "One purchase can arrive as an Apple Pay tap and again as a bank record. Separating how you paid from where money came from, and merging the duplicate.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Data Modelling", "Reconciliation", "Duplicate Detection", "Apple Pay", "SwiftData", "Personal Finance"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Reconciling Apple Pay and Bank Records in an Expense App",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "modelling-spending-cash-flow-and-who-owes-whom",
    "sender-vs-recipient-bank-in-malaysian-transfer-receipts",
    "logging-apple-pay-purchases-with-app-intents-wallet-automation",
    "ignoring-advert-prices-when-reading-payment-screenshots",
  ],
  sections: [
    {
      heading: "The same purchase, recorded twice",
      body: [
        "In [SpenDrop](/work/spendrop), my iOS expense tracker, an expense can arrive from several places: a shared screenshot of a payment confirmation, a receipt photo, manual entry, or an Apple Pay tap logged by a Shortcuts automation. The trouble is that one real purchase often produces more than one of those. You tap your phone at a till, the Apple Pay record lands, and a day later your bank app shows its own debit for the same amount. Share both and a naive app counts the purchase twice.",
        "Before that problem can even be solved, there is a modelling one. \"Apple Pay\" and \"Maybank\" are not two alternative answers to the same question. This article covers both: how SpenDrop models a payment, and how it recognises and merges a second record of it. It is for anyone building expense tracking, bank-feed matching or any system that receives the same event from more than one source.",
      ],
    },
    {
      heading: "Two questions, two fields",
      body: [
        "A payment answers two separate questions, and the app stores them separately.",
        "The Payment Channel is how it was paid: Apple Pay, QR payment, DuitNow QR, bank transfer, online banking, card, e-wallet, cash, other, or unknown. The Funding Account is where the money came from: a specific bank, an e-wallet balance, or cash. An Apple Pay purchase has the channel Apple Pay and a funding account of whichever bank issued the card. A DuitNow QR payment from a bank app has the channel DuitNow QR and that bank as its funding account.",
        "Keeping them apart fixes the reports as well. With one \"payment method\" field, a breakdown shows Apple Pay as if it were a bank and hides which bank actually paid. With two, the Breakdown tab can answer both \"how do I pay?\" and \"which account is funding my spending?\". On screen an Apple Pay expense shows as \"Apple Pay • CIMB\" with both logos, and the parser pre-fills the note with \"Paid via Apple Pay • CIMB\" when a screen names the bank behind the card.",
        {
          type: "callout",
          label: "Never guess the channel",
          text: "The source comment on PaymentChannel states the rule: if the channel cannot be reliably identified, use Unknown. A card name such as \"Visa Debit\" on its own is not enough to say how it was used, so it yields Unknown. Unknown is a valid, honest value; a wrong guess would pollute every report built on it.",
        },
        "The three newer channel values, DuitNow QR, Online Banking and E-Wallet, were added without renaming any stored raw value, so existing records kept their meaning. Since version 1.4.0 funding accounts are real records rather than text, with money recorded in and out per account and deliberately no balance field.",
      ],
    },
    {
      heading: "Finding the other record",
      body: [
        "Before an expense is saved from the review screen, the app looks for an existing expense that represents the same real-world payment. Because Apple Pay authorisation and the bank's posting can be a day or more apart, the search starts wide: it fetches up to 20 existing expenses with exactly the same amount dated within 48 hours either side of the new one. Then it applies four rules in order, and the first that matches wins:",
        {
          type: "table",
          head: ["Rule", "Condition (among same-amount candidates within ±48 h)", "Confidence"],
          rows: [
            ["1. Same reference", "Both have a transaction reference and they are equal (case-insensitive)", "1.00"],
            ["2. Same merchant, same day", "Merchant names match, or one contains the other, ignoring \"Unknown\"; same calendar day", "0.95"],
            ["3. Apple Pay and bank", "The existing record is Apple Pay, or has a known funding account; same calendar day", "0.90"],
            ["4. Close in time", "Within 2 hours of each other", "0.85"],
          ],
          caption: "From TransactionReconciliationEngine.findMatch.",
        },
        "The ±48-hour window is only the candidate search. The Apple Pay and bank rule itself requires the two records to fall on the same calendar day; its code comment speaks of 24 hours, but the check is a same-day comparison. So a tap late on Monday and a bank posting on Wednesday are fetched as candidates but will only be matched if they share a reference or are otherwise caught by the rules above. I would rather miss that pair and let the user decide than merge two genuinely separate payments of the same amount.",
        "The same function drives the duplicate warning, so a screenshot shared twice is caught by rule 1 when it has a reference, and by rule 2 or 4 when it does not. Money In and Money Out records have their own duplicate detector with the same attitude.",
      ],
    },
    {
      heading: "Merging without losing anything",
      body: [
        "When a match is found, the review screen does not decide. It shows \"Existing Transaction Detected\" with the reason (for example, that an identical reference is already recorded) and three choices: \"Reconcile with Existing (Recommended)\", \"Add as Separate Transaction\", and Cancel.",
        "Reconciling does not replace the existing record. It only fills in what that record lacked:",
        {
          type: "list",
          items: [
            "the payment channel, if the existing one is Unknown",
            "the funding account and funding instrument, if they are unknown or empty",
            "the merchant, if it is \"Unknown\" or empty",
            "the transaction reference and the receipt image, if missing",
            "the notes, appended rather than overwritten",
          ],
        },
        "The record is then marked as reconciled. An Apple Pay tap that knew the merchant but not the bank, merged with a bank screenshot that knew the bank and the reference, becomes one expense that knows all of it, counted once.",
      ],
    },
    {
      heading: "The function that is never called",
      body: [
        "An earlier version had a clean-up routine that scanned the whole database, found pairs that looked like duplicates, merged them and deleted the second record. It is still in the source, marked deprecated, with a comment explaining why: it deletes expenses without asking the user, and it is intentionally not called anywhere. Its guard refuses to merge any record that carries a split, a different payer or a linked refund, because deleting one of those would silently destroy the relationships attached to it, and two tests call it on purpose to check that it never merges a shared expense.",
        "That is the rule the rest of the app now follows. Duplicate checks warn and offer to merge; they never delete on their own.",
      ],
    },
    {
      heading: "Limits",
      body: [
        "Matching is on exact amount, so a bank record that differs from the Apple Pay amount by a fee or a currency conversion will not be found. Merchant matching is substring-based and can be fooled by very short or generic names. The logic is covered by the app's in-app test runner, including reconciliation scenarios, and those checks passed on the iOS 27 simulator on 29 September 2026; SpenDrop has not been verified on a physical iPhone in version 1.4.0 and is not on the App Store.",
        "How the parser works out which bank a screenshot belongs to in the first place, including Apple Pay's underlying bank, is its own problem; the amount side is covered in [Which RM Is the Payment?](/blog/ignoring-advert-prices-when-reading-payment-screenshots), and how spending and cash flow are counted once a record is saved is in [Spending, Cash Flow and Who Owes Whom](/blog/modelling-spending-cash-flow-and-who-owes-whom).",
      ],
    },
  ],
};
