import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ignoring-advert-prices-when-reading-payment-screenshots",
  title: "Which RM Is the Payment? Classifying Every Amount on a Receipt Screenshot",
  description:
    "A payment screenshot shows fees, balances and advert prices as well as the payment. How SpenDrop labels every RM value, using keywords and screen position.",
  date: "2026-10-01",
  category: "AI & Automation",
  tags: ["OCR", "Apple Vision", "Swift", "Receipt Parsing", "Touch 'n Go", "iOS"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Picking the Real Total From Receipt OCR, Not the Advert",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "sorting-vision-text-observations-into-rows",
    "malaysian-payment-screenshot-parser-false-positives",
    "sender-vs-recipient-bank-in-malaysian-transfer-receipts",
    "a-vision-model-that-only-observes",
  ],
  sections: [
    {
      heading: "A payment screen rarely has one number on it",
      body: [
        "[SpenDrop](/work/spendrop) is an iOS expense tracker I built for everyday Malaysian payments. You share a payment confirmation from Touch 'n Go, a bank app or Apple Pay, Apple's Vision framework reads the text on the phone, and a rule-based parser fills in a review form. The first thing that parser has to get right is the amount, and that is harder than it sounds.",
        "A Touch 'n Go transfer confirmation can carry a promotional banner under the payment, with an air conditioner priced at RM 450 beneath an RM 22.00 transfer. A receipt lists a subtotal, a service charge, tax and a total. A bank screen may show the balance left in the account, and an e-wallet screen may show cashback. Every one of those is an RM value, and any regular expression written to find the payment finds all of them.",
        "This article is for anyone extracting a total from OCR text, whether from receipts, invoices or app screenshots. The approach is simple: give every amount a meaning first, and only then choose one.",
      ],
    },
    {
      heading: "Find every candidate first",
      body: [
        "The parser does not look for the amount. It collects every RM value on every OCR line into a candidate list. The patterns accept the ways Malaysian screens write money: `RM 22.00`, `RM22.00`, `MYR 22.00`, `22.00 RM`, `RM450` without decimals, a labelled `Total:` or `Jumlah` followed by a number, a notification's `-RM12.00` (the sign is not captured, so the stored amount is positive), and a bare decimal such as `12.50`. A value must be above zero and below 500,000, and the same amount on the same line is only recorded once.",
        "Each candidate keeps more than its value. It keeps the line index, the full line text and the bounding box Vision returned for that line, because the next step needs all three.",
      ],
    },
    {
      heading: "Give each amount a meaning",
      body: [
        "Every candidate is labelled with one of ten semantic types. Seven of them can never be the payment:",
        {
          type: "table",
          head: ["Type", "Can be the payment?", "How it is recognised"],
          rows: [
            ["Balance", "No", "balance or credit-limit words on the line or as the label directly above it, including Malay (\"baki akaun\", \"baki tersedia\")"],
            ["Advertisement", "No", "ad words on the line, the line above or below, or near the bottom of the screen (next section)"],
            ["Fee", "No", "\"service fee\", \"processing fee\", \"caj perkhidmatan\", SST, GST"],
            ["Cashback", "No", "\"cashback\", \"rebate\", \"rebat\", \"duit pulangan\""],
            ["Discount", "No", "\"discount\", \"diskaun\", \"potongan\", \"voucher applied\""],
            ["Promotion, product price", "No", "reserved for promotional and item prices"],
            ["Total", "Yes, first", "\"grand total\", \"total paid\", \"jumlah bayaran\"; a line containing \"subtotal\" never counts"],
            ["Transaction amount", "Yes", "\"amount paid\", \"transfer amount\", \"paid to\", \"jumlah pindahan\", or an unlabelled amount next to a status and a recipient"],
            ["Unknown", "Only as a fallback", "anything else, scored lower near the bottom"],
          ],
          caption: "The order of the checks matters: balance first, then advertisement, fee, cashback and discount, and only then total and transaction amount.",
        },
        "The order is deliberate. A line such as `Cashback up to RM 5` also contains an amount and possibly the word \"total\" somewhere near it. Checking the excluding types first means a value that looks like a fee or a balance is never promoted to a total just because a total keyword appears nearby.",
        "Unlabelled amounts are common on transfer screens, where the big number at the top has no label at all. For those, the parser looks at a window of two lines either side: an amount between a status such as \"Transferred\" or \"berjaya\" and a recipient label scores highest, one near either scores a little lower, and an amount with a currency prefix in the upper part of the screen scores lower again.",
      ],
    },
    {
      heading: "Position is a signal: using Vision's bounding boxes",
      body: [
        "Keywords alone did not catch every advert. Banners are written to look like content, and not every promotion says \"promo\". What they have in common is where they sit: adverts on payment confirmation screens are placed at the bottom, under the transaction.",
        "Vision returns a normalised bounding box for each line, with the origin at the bottom left. That makes the position test a single comparison:",
        {
          type: "code",
          lang: "swift",
          code: `// From TransactionParser.swift (simplified)
let isNearBottom: Bool
if candidate.boundingBox != .zero {
    isNearBottom = candidate.boundingBox.midY < 0.35   // bottom 35% of the image
} else {
    // no geometry (e.g. text-only tests): use the line's position in the list
    isNearBottom = Double(lineIndex) / Double(totalLines) > 0.65
}

// An amount near the bottom with ad words in the surrounding lines is an advert.
if isNearBottom && adKeywords.contains(where: { nearbyLines.contains($0) }) {
    semanticType = .advertisement
}`,
        },
        "The advert keyword list has more than fifty entries, built from real banners: \"shop now\", \"min spend\", \"lucky draw\", \"terms and conditions\", \"near me\", \"validity:\", and a few brand names that kept appearing. Short words such as \"ad\", \"ads\", \"promo\" and \"off\" are matched as whole words only, so \"address\" or \"office\" do not trigger them.",
        "Being near the bottom is not enough on its own. A receipt's total is often near the bottom too. The rule needs both the position and advert wording in the surrounding lines, which is why a total at the foot of a receipt still wins.",
      ],
    },
    {
      heading: "Choosing, and letting the person overrule it",
      body: [
        "Once every candidate has a type, the excluded ones are removed and the rest are sorted: a total beats anything else, then the highest score. On a synthetic receipt used in the tests, with `Amount: RM50.00`, `Service Fee: RM1.00`, `Total: RM51.00`, `Balance: RM948.00` and `Cashback: RM5.00`, the parser returns RM 51.00. The Touch 'n Go test with the RM 450 advert returns RM 22.00.",
        "The parser's answer is a suggestion, not a decision. The review screen pre-fills the chosen amount, and when more than one valid candidate remains it shows the others as one-tap \"Possible amounts\" chips with their labels. Excluded values are not offered, so the advert's price never appears as an option; when only one valid candidate is left, the chips are hidden. Nothing is saved until the user confirms.",
        "There is one fallback worth knowing about. If every candidate was excluded, the parser does not give up silently: it takes the highest-scoring candidate at half its confidence, which pushes the review screen to its weaker \"Possible Expense Detected\" state so the user looks harder.",
        {
          type: "flow",
          steps: [
            "Vision OCR lines with bounding boxes",
            "Collect every RM value",
            "Label each one (balance, advert, fee, cashback, discount, total, amount)",
            "Drop excluded types",
            "Total first, then highest score",
            "Review form with alternatives",
          ],
          caption: "The amount step inside SpenDrop's on-device pipeline.",
        },
      ],
    },
    {
      heading: "Where it still fails",
      body: [
        "Column-aligned paper receipts break the model. On a synthetic receipt where the word TOTAL sat far to the left of its amount, Vision returned \"TOTAL\" and \"RM 19.08\" as separate observations. The amount lost its label, became an unlabelled candidate, and a line item scored higher. The review screen did downgrade to \"Possible Expense Detected\", and the case is recorded as a known limitation. How the lines are ordered in the first place is its own problem, covered in the note on sorting Vision text into rows.",
        "The rules are keyword-driven, so an unfamiliar layout or a new banner style falls back to a low-confidence guess until a rule is added. The parser's own tests feed synthetic OCR text, which means they test the parser, not how well Vision reads a real screenshot. SpenDrop is verified on the iOS simulator and is not on the App Store.",
        {
          type: "callout",
          label: "The lesson",
          text: "Layout turned out to be a stronger signal than the text alone. If your OCR engine gives you geometry, keep it next to every line all the way through the parser, not just the string.",
        },
        "The same idea, that the extraction proposes and a person decides, runs through the rest of the app. The [SpenDrop project page](/work/spendrop) covers the full pipeline, and [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes) applies the same principle to a different system.",
      ],
    },
  ],
};
