import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "modelling-spending-cash-flow-and-who-owes-whom",
  title: "Spending, Cash Flow and Who Owes Whom: Modelling Shared Bills in a Personal Finance App",
  description:
    "When a bill is shared, 'how much did I spend?' has three honest answers. SpenDrop's rules for spending, cash flow, refunds and balances.",
  date: "2026-10-25",
  category: "Building Real Systems",
  tags: ["Data Modelling", "Personal Finance", "Swift", "SwiftData", "Shared Expenses", "Product Design"],
  contentType: "Explainer",
  searchIntent: "informational",
  seoTitle: "Modelling Shared Expenses: Spending vs Cash Flow",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "splitting-a-bill-in-integer-sen-largest-remainder",
    "payment-channel-vs-funding-account-apple-pay-reconciliation",
    "swiftdata-versioned-schema-migration-without-losing-data",
  ],
  sections: [
    {
      heading: "One bill, three different numbers",
      body: [
        "You pay RM 30.00 for dinner for four and each person owes you RM 7.50. How much did you spend? RM 30.00 left your account. Your share of the meal was RM 7.50. And three people now owe you RM 22.50 between them. All three numbers are true, and an expense app that shows only one of them, or worse, adds two of them together, gives you a wrong picture of your month.",
        "Version 1.4.0 of [SpenDrop](/work/spendrop) turned an expense log into a small personal-finance model: shared bills, money in and out, loans and repayments, transfers between your own accounts, and balances with the people in your PayBook. This article sets out the definitions it uses and the one structural rule behind them. It is aimed at anyone designing a data model for split expenses, budgeting or household money.",
      ],
    },
    {
      heading: "Each number answers one question",
      body: [
        "The design started from a table, not from screens. Every figure the app shows is defined once, and each answers exactly one question:",
        {
          type: "table",
          head: ["Concept", "Rule"],
          rows: [
            ["Expense amount", "Always the full bill. Never changed by splits or refunds."],
            ["Spending", "The full amount if I paid; my share if someone else paid."],
            ["Cash out (for an expense)", "The full amount if I paid; nothing if someone else paid."],
            ["Money In", "Income, loans received, repayments received, refunds, other money in."],
            ["Money Out", "Cash out on expenses I paid, plus loans given, repayments made, other money out."],
            ["Own transfer", "Moves money between my own accounts; excluded from spending, Money In, Money Out and net."],
            ["Net cash flow", "Money In minus Money Out."],
            ["Refund", "A Money In linked to the original expense. Gross spending is unchanged; net spending is shown separately."],
            ["Person balance", "Per currency: shares others owe me when I paid (+), my share when they paid (−), loans and repayments (±). Positive means they owe me."],
          ],
          caption: "SpenDrop's financial model, from the project documentation.",
        },
        "Two rules in that table do most of the work. The expense amount is sacred: it is what the receipt says, so it never changes, and everything else is derived from it and its shares. And spending and cash flow are different axes. Spending is about consumption, what the month cost me. Cash flow is about money moving through my accounts. The Home screen, the Transactions header and the Breakdown tab always show them separately, and nothing in the app adds one to the other.",
      ],
    },
    {
      heading: "The same dinner, both ways",
      body: [
        "The test suite pins the dinner example from both sides. If I paid RM 30.00 split four ways: spending RM 30.00, cash out RM 30.00, my share RM 7.50, and each of the other three owes me RM 7.50. If a friend paid instead: my spending is RM 7.50, my cash out is zero, and I owe that friend RM 7.50. The other two people's shares are between them and the payer; the app does not invent a debt between people who are not me.",
        "Refunds are modelled the same way. A RM 100.00 purchase with a RM 30.00 refund keeps the purchase at RM 100.00 (gross spending), records a Money In of RM 30.00 linked to it, and shows net spending of RM 70.00. Deleting or editing the refund never touches the original record.",
        "Here is the core of the calculation. It is a pure function over the records it is given, in integer sen, and it never adds amounts in different currencies:",
        {
          type: "code",
          lang: "swift",
          code: `// Per expense (Expense extension)
var spendingMinor: Int { paidByMe ? amountMinor : myShareMinor }
var cashOutMinor: Int  { paidByMe ? amountMinor : 0 }

// Totals (FinancialCalculator.summary)
for expense in expenses where expense.currency == currency {
    result.spendingMinor += expense.spendingMinor
    result.moneyOutMinor += expense.cashOutMinor
}
for movement in movements where movement.currency == currency {
    switch movement.kind.direction {
    case .moneyIn:
        result.moneyInMinor += movement.amountMinor
        if movement.kind == .refund { result.refundsMinor += movement.amountMinor }
    case .moneyOut:
        result.moneyOutMinor += movement.amountMinor
    case .internal:
        break   // own transfers count toward nothing
    }
}`,
          caption: "From FinancialCalculator.swift, lightly trimmed.",
        },
        "The shares themselves come from a split calculator that works in integer sen and always sums exactly to the bill, which is covered in [Splitting RM 10 Three Ways](/blog/splitting-a-bill-in-integer-sen-largest-remainder). That exactness is what lets a balance of zero mean \"settled\".",
      ],
    },
    {
      heading: "Calculate balances, never store them",
      body: [
        "The structural rule is that nothing in the table above is stored. Balances, spending totals, account activity and the unified Transactions timeline are all computed from the underlying records when a screen needs them.",
        "Stored balances drift. Every edit, delete, refund and repayment would have to update them correctly, in every code path, forever, including the Share Extension, the Shortcuts action and backup restores. A calculated balance cannot disagree with the records because it is the records. The cost is recomputation on each render, which the project notes openly: there is no caching or pagination, and no benchmark has been recorded. For a personal expense log I chose correctness first and left performance work until it is measured.",
        "The Transactions tab follows the same rule. It shows expenses and money movements in one timeline, but that timeline is built on the fly from the two record types and never saved, so nothing can be counted twice. Transfers appear as \"From → To · Not spending\".",
      ],
    },
    {
      heading: "Accounts record activity, not balances",
      body: [
        "Each account shows Recorded In, Recorded Out and Recorded Net, with a note that this is not a bank balance. The account model deliberately has no balance field. SpenDrop only knows what was recorded in it, not what the bank holds, and a field called \"balance\" would invite the user to trust it. An expense someone else paid does not count against my account at all, because no money left it.",
        "Accounts can be renamed and archived but not deleted, so history is kept. People follow a similar rule: deleting a person is blocked while their balance is not zero, and the app offers \"Archive instead\". Deleting a settled person keeps all their records under the name that was saved with them.",
      ],
    },
    {
      heading: "Keeping the normal case simple",
      body: [
        "None of this makes a normal expense harder to enter. The Add sheet opens on Expense exactly as before; splitting, choosing who paid and switching to Money In or a transfer only appear when asked for. The model is richer, but the everyday path is unchanged.",
        "These definitions are checked by the app's own test runner: the financial models suite (46 checks), accounts and money in and out (10), shared expenses (15), PayBook balances (11) and the timeline (12) all passed on the iOS 27 simulator on 29 September 2026. SpenDrop is verified on the simulator only and is not on the App Store; amounts are RM, and the per-currency rules exist so that another currency cannot corrupt a total later. The [SpenDrop project page](/work/spendrop) shows how these pieces fit into the rest of the app.",
      ],
    },
  ],
};
