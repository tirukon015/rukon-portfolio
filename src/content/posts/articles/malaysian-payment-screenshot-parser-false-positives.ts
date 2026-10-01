import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "malaysian-payment-screenshot-parser-false-positives",
  title: "Screens That Look Like Payments but Aren't: Parsing Malaysian Receipts Without Fake Expenses",
  description:
    "Balance, credit-limit and reward screens all show RM amounts. How SpenDrop rejects them, and the Malaysian receipt formats two of my parsers read.",
  date: "2026-11-16",
  category: "Malaysia & Cyberjaya",
  tags: ["OCR", "Receipt Parsing", "Regex", "Malaysia", "Touch 'n Go", "Bahasa Malaysia", "Tesseract.js"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Avoiding Fake Expenses in Malaysian Receipt OCR",
  relatedProjects: ["spendrop", "drivekeep"],
  relatedPosts: [
    "ignoring-advert-prices-when-reading-payment-screenshots",
    "sender-vs-recipient-bank-in-malaysian-transfer-receipts",
    "odometer-ocr-tesseract-sharp-preprocessing-plausibility",
    "removing-default-values-that-look-like-data",
  ],
  location: "Malaysia",
  sections: [
    {
      heading: "An RM amount is not always a payment",
      body: [
        "[SpenDrop](/work/spendrop) turns a shared payment screenshot into an expense. Early on it also turned a few things into expenses that were not: a screenshot of an e-wallet balance, a credit card's available limit, a rewards page. Each of those screens has an RM figure in large type, and a parser that looks for \"the amount\" will find one and offer to save it.",
        "This article covers how SpenDrop decides that a screen is not a payment at all, and the Malaysian money formats it and a second project of mine, the fuel log [DriveKeep](/work/drivekeep), had to accept. It is for anyone writing OCR or text parsing for Malaysian receipts, e-wallet screens or bank notifications, where English and Bahasa Malaysia appear side by side.",
      ],
    },
    {
      heading: "Recognising balance, limit and points screens",
      body: [
        "The check runs before any amount is chosen, over the whole OCR text. It looks for three families of words, and then for evidence of a transaction:",
        {
          type: "table",
          head: ["Family", "Examples (English and Malay)"],
          rows: [
            ["Balance", "\"available balance\", \"account balance\", \"current balance\", \"baki akaun\", \"baki tersedia\""],
            ["Limit", "\"credit limit\", \"card limit\", \"available credit\", \"had kredit\""],
            ["Points", "\"reward points\", \"point balance\", \"points earned\", \"mata ganjaran\", \"my rewards\""],
            ["Transaction indicators", "\"paid\", \"payment successful\", \"purchase\", \"total\", \"amount paid\", \"transferred\", \"debit\", \"resit\", \"receipt\", \"invoice\""],
          ],
        },
        "A screen counts as balance-only when it has balance, limit or points wording and no transaction indicator. That second condition matters, because a genuine payment receipt often shows the remaining balance underneath; it also says \"Payment successful\", so it is still treated as a payment, and the balance figure on it is labelled as a balance and excluded from the amount.",
        "When a screen is balance-only, the parser returns no amount at all, low confidence, and a status of `balance_inquiry`. The review screen shows an orange \"Account Balance / Credit Limit\" banner instead of a form full of guesses, and nothing is saved unless the user deliberately enters an expense. The tests for this are named for what they prevent: false positives for account balance, credit limit and reward points screens.",
      ],
    },
    {
      heading: "Failed payments and negative notifications",
      body: [
        "Two more cases looked like payments and needed rules. A failed transaction still shows the amount you tried to pay. The parser looks for failure wording in both languages, \"payment failed\", \"unsuccessful\", \"declined\", \"rejected\", \"gagal\", \"transaksi gagal\", and the review shows \"Payment Failed\" rather than \"Expense Detected\".",
        "Bank and e-wallet notifications write debits with a sign: `-RM12.00`. The amount patterns accept an optional leading hyphen, en dash or em dash before the currency, and capture only the digits, so the stored amount is a positive RM 12.00. A test built from a real notification layout covers it.",
        "Every detected status is normalised into one of a small set of values, such as `failed`, `balance_inquiry`, `transferred`, `payment_successful`, `approved` and `completed`, so the rest of the app never has to interpret raw wording. And the extractors return nothing rather than guess: a merchant candidate is rejected if it contains a currency, the word \"account\", \"successful\" or a provider's name, or if it is one of about sixty generic labels such as headings that appear on every receipt.",
      ],
    },
    {
      heading: "Malaysian amount formats in SpenDrop",
      body: [
        "Apple's Vision framework is asked to recognise English, Malay and Simplified Chinese (`en-US`, `ms-MY`, `zh-Hans`), which covers the languages that appear on everyday Malaysian receipts. The amount patterns then have to accept how those screens write money:",
        {
          type: "list",
          items: [
            "`RM 25.90` and `RM25.90`, with or without thousands separators",
            "`MYR 25.90`, and the currency after the number: `25.90 RM`",
            "`RM450`, with no decimals (common in adverts, which is one reason adverts were a problem)",
            "a labelled value: `Amount`, `Total`, `Jumlah` or `Paid`, followed by an optional currency",
            "a bare decimal such as `12.50`, as a last resort",
          ],
        },
        "Every value must be greater than zero and below 500,000. Labels are bilingual throughout: totals include \"jumlah bayaran\", \"jumlah keseluruhan\" and \"jumlah bersih\"; fees include \"caj perkhidmatan\"; cashback includes \"rebat\" and \"duit pulangan\"; discounts include \"diskaun\" and \"potongan\"; and a transfer amount can be \"jumlah pindahan\". How SpenDrop then decides which of several amounts is the payment is the subject of [Which RM Is the Payment?](/blog/ignoring-advert-prices-when-reading-payment-screenshots).",
      ],
    },
    {
      heading: "Fuel receipts: the formats DriveKeep's web OCR reads",
      body: [
        "DriveKeep is a fuel and maintenance log for a car and a motorcycle. In its web app a pump receipt photo goes to the server, Tesseract.js reads it, and a regex parser extracts the station, total, litres and price per litre. Malaysian fuel receipts have their own conventions, and the comments in the parser list the shapes it was written for:",
        {
          type: "table",
          head: ["Field", "Formats the patterns accept", "Sanity range"],
          rows: [
            ["Total", "\"TOTAL: RM 74.83\", \"JUMLAH RM74.83\", \"TOTAL (RM) : 74.83\", \"NETT: 74.83\", \"AMT: 74.83\", or an amount with RM before or after it", "more than RM 1, less than RM 1,000"],
            ["Price per litre", "\"HARGA/L: 2.050\", \"PRICE/L 2.050\", \"RM 2.050/L\", \"2.050 / L\"", "between 0.3 and 20"],
            ["Volume", "\"VOLUME: 36.500L\", \"36.50 LITER\", \"QTY: 25.0L\", plus \"kuantiti\" and \"isipadu\"", "between 0.5 and 200 litres"],
            ["Station", "PETRONAS, Shell, Caltex, BHPetrol (\"BHP\"), Petron, as whole words", "n/a"],
          ],
          caption: "From DriveKeep's src/lib/ocr.ts. The total pattern also allows an optional bracketed unit such as \"(RM)\" between the label and the number.",
        },
        "The detail that matters most is the price: pump prices are printed to three decimal places, `2.050`, not two. A pattern written for shop receipts, two decimals after the point, either misses the price or truncates it. DriveKeep's unit-price patterns accept two or three decimals after a label, and a bare three-decimal number followed by `/L`.",
        "Fuel receipts also allow a cross-check that payment screenshots do not. Litres times price per litre should equal the total, so when exactly one of the three is missing the parser computes it from the other two, and only then; when all three are present and the total disagrees by a ringgit or more, it recomputes the price from total and litres if that price is realistic. The extracted values only ever fill an editable form; nothing is saved until the owner confirms. The DriveKeep web app is live on Vercel with no sign-in, and these patterns were exercised on synthetic receipts, not a collection of real ones, so no accuracy figure is claimed.",
      ],
    },
    {
      heading: "One parser's rule is another parser's bug",
      body: [
        "Putting the two parsers side by side shows something worth noticing. DriveKeep's total pattern includes \"balance\" among the labels it accepts for the amount. SpenDrop treats the same word as a reason to exclude an amount, because on a bank or e-wallet screen the balance is what is left in your account. If the fuel parser were ever pointed at a bank screen, that one word would make it pick the wrong number. Keyword rules encode assumptions about one kind of document, and they should be written, tested and documented for that kind of document, not shared as a general \"Malaysian receipt parser\".",
        {
          type: "callout",
          label: "Verification",
          text: "SpenDrop's parser checks feed synthetic OCR text to the parser and passed on the iOS simulator on 29 September 2026; they test the rules, not Vision's recognition. SpenDrop is not on the App Store. DriveKeep's web parser was tested with synthetic images in a local production build.",
        },
      ],
    },
  ],
};
