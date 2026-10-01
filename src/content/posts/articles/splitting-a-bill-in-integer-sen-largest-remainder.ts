import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "splitting-a-bill-in-integer-sen-largest-remainder",
  title: "Splitting RM 10 Three Ways: Integer Sen and the Largest-Remainder Method",
  description:
    "Floating-point money drifts and naive splits lose a sen. Integer sen at one boundary and the largest-remainder method, so shares always add up.",
  date: "2026-10-20",
  category: "Building Real Systems",
  tags: ["Swift", "Money", "Rounding", "Bill Splitting", "Integer Arithmetic", "Testing"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Splitting Bills Exactly in Swift With Integer Cents",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "modelling-spending-cash-flow-and-who-owes-whom",
    "swiftdata-versioned-schema-migration-without-losing-data",
    "in-app-test-runner-and-xcuitest-for-an-ios-app",
  ],
  sections: [
    {
      heading: "Three people, RM 10, and a sen that goes missing",
      body: [
        "Version 1.4.0 of [SpenDrop](/work/spendrop), my iOS expense tracker, added shared bills. You pay RM 10.00 for three people, the app records what each person owes, and later a balance says who owes whom. The arithmetic looks trivial until you do it: RM 10.00 divided by three is RM 3.333…, rounded to RM 3.33 each, and three times RM 3.33 is RM 9.99. Somebody's sen has disappeared, and every balance built on those shares is now wrong by a little.",
        "Floating point makes it worse. The app's existing `Expense.amount` was a `Double`, and `0.1 + 0.2` is not `0.3` in binary floating point. Summing many such values drifts, and comparing them for equality is unreliable.",
        "This article is for anyone writing money logic in Swift or any other language: how to keep amounts exact, and how to split a total so the parts always add back to it.",
      ],
    },
    {
      heading: "Convert once, at a single boundary",
      body: [
        "Changing the stored `Double` would have meant a data migration on every existing record, so the model kept it. Instead, all new financial logic works in integer sen (minor units), and there is exactly one place where a `Double` or a typed string becomes an integer:",
        {
          type: "code",
          lang: "swift",
          code: `public enum Money {
    public static let minorUnitsPerMajor = 100

    /// RM7.50 -> 750. Rounds half away from zero, which absorbs binary noise
    /// such as 100.99 being stored as 100.98999...
    public static func minorUnits(from amount: Double) -> Int {
        Int((amount * Double(minorUnitsPerMajor)).rounded(.toNearestOrAwayFromZero))
    }

    /// Exact conversion for user-typed text: "7.50" -> 750, "RM 1,234.5" -> 123450.
    public static func minorUnits(parsing text: String) -> Int? {
        let cleaned = text
            .replacingOccurrences(of: "RM", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "MYR", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: ",", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty,
              let decimal = Decimal(string: cleaned, locale: Locale(identifier: "en_US_POSIX"))
        else { return nil }
        var scaled = decimal * Decimal(minorUnitsPerMajor)
        var rounded = Decimal()
        NSDecimalRound(&rounded, &scaled, 0, .plain)
        return NSDecimalNumber(decimal: rounded).intValue
    }
}`,
          caption: "From Money.swift. Converting back to a Double is for display only.",
        },
        "Typed text never passes through a `Double` at all; it goes through `Decimal`, which represents \"100.99\" exactly. The tests pin the edge cases: 100.99 becomes 10099, `0.1 + 0.2` becomes 30, 19.999 becomes 2000, and \"RM 1,234.5\" becomes 123450. The rule for the rest of the codebase is written in the file's header comment: convert here, never with ad-hoc maths.",
      ],
    },
    {
      heading: "The largest-remainder method",
      body: [
        "Splitting in integers is easy if you accept that shares will not all be equal. The largest-remainder method (sometimes called Hamilton's method) does it in two steps: give everyone the floor of their exact share, then hand out the sen that are left over, one at a time, to the people whose exact share had the biggest fractional part.",
        "SpenDrop uses the same function for equal splits (every weight is 1) and for splits by parts (weights from 1 to 99):",
        {
          type: "code",
          lang: "swift",
          code: `/// Floor of each proportional share, then the leftover sen one by one to the
/// largest fractional remainders. Ties: Me first (when I paid), then list order.
private static func largestRemainder(totalMinor: Int, weights: [Int],
                                     participants: [Participant], iPaid: Bool) -> [Int] {
    let weightSum = weights.reduce(0, +)
    var shares = weights.map { totalMinor * $0 / weightSum }
    let remainders = weights.map { (totalMinor * $0) % weightSum }
    var leftover = totalMinor - shares.reduce(0, +)

    let order = participants.indices.sorted { a, b in
        if remainders[a] != remainders[b] { return remainders[a] > remainders[b] }
        if iPaid && participants[a].isMe != participants[b].isMe { return participants[a].isMe }
        return a < b
    }
    var position = 0
    while leftover > 0 {
        shares[order[position % order.count]] += 1
        leftover -= 1
        position += 1
    }
    return shares
}`,
          caption: "From SplitCalculator.swift. Integer division and modulo only; no floating point anywhere.",
        },
        "The remainder is computed as an integer, `(total × weight) mod weightSum`, so comparing \"fractional parts\" never involves a fraction. The sort is deterministic, so the same bill always splits the same way.",
      ],
    },
    {
      heading: "Who gets the extra sen",
      body: [
        "With equal weights every remainder is the same, so the tie-break decides everything. The rule is a product decision: when I paid, leftover sen go to me first, so a friend is never asked to repay a sen more than their share. When someone else paid, they go in list order. The tests show both:",
        {
          type: "table",
          head: ["Split", "Result (sen)", "Why"],
          rows: [
            ["RM 30.00 equally, 4 people", "750, 750, 750, 750", "divides exactly"],
            ["RM 10.00 equally, 3 people, I paid (I am second)", "333, 334, 333", "the one leftover sen goes to me"],
            ["The same, someone else paid", "334, 333, 333", "leftover in list order"],
            ["RM 100.00 equally, 7 people, I paid", "1429 ×4, 1428 ×3", "4 leftover sen: me first, then list order; sum is exactly 10000"],
            ["RM 30.00 by parts 1 / 1 / 2 / 1", "600, 600, 1200, 600", "divides exactly"],
            ["RM 10.00 by parts 1 / 2", "333, 667", "the larger remainder gets the sen"],
          ],
          caption: "Cases from the app's Phase 2 test suite.",
        },
      ],
    },
    {
      heading: "Exact amounts: report the difference, never fix it",
      body: [
        "The third split method lets you type each person's amount. Here the app does something different: if the amounts do not add up to the total, the calculation fails with the signed difference, and the editor shows it (\"RM 2.00 left to assign\"). It never nudges someone's share to make it balance, because a silently adjusted number is a wrong number the user did not choose. A share of RM 0 for me is allowed; a negative share, a missing amount, fewer than two people, no \"Me\", or two \"Me\"s are all validation errors.",
        "Balances are then calculated from these shares when they are shown, never stored. Because every share is an integer and every split sums exactly, a person's balance is a sum of integers and can be compared with zero reliably, which is what makes \"settled\" mean settled. How spending, cash flow and balances are defined on top of the shares is covered in the article on modelling shared bills.",
      ],
    },
    {
      heading: "Takeaways",
      body: [
        {
          type: "list",
          items: [
            "Pick one conversion point into integer minor units and make every other path go through it.",
            "Parse user input with a decimal type, not a binary float.",
            "Split with floors plus largest remainders, and make the tie-break an explicit, tested product rule.",
            "When user-entered parts do not match the total, report the difference instead of adjusting.",
          ],
        },
        "The split calculator is pure Swift with no SwiftData dependency, which is why it could be tested exhaustively in the app's in-app test runner; the Phase 2 and Phase 4 suites passed on the iOS 27 simulator on 29 September 2026. SpenDrop is verified on the simulator and is not on the App Store. The rest of the 1.4.0 release, including how the data model changed safely, is in [SwiftData Migrations That Can't Lose Data](/blog/swiftdata-versioned-schema-migration-without-losing-data).",
      ],
    },
  ],
};
