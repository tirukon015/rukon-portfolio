import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "sender-vs-recipient-bank-in-malaysian-transfer-receipts",
  title: "Telling the Sender Bank From the Recipient on a Malaysian Transfer Receipt",
  description:
    "A CIMB to Maybank transfer receipt names both banks. Reading the receipt's structure to attribute the payment to the bank that actually sent it.",
  date: "2026-11-08",
  category: "Malaysia & Cyberjaya",
  tags: ["OCR", "Receipt Parsing", "Malaysian Banks", "DuitNow", "Swift", "iOS"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Sender vs Recipient Bank Detection in Receipt OCR",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "payment-channel-vs-funding-account-apple-pay-reconciliation",
    "ignoring-advert-prices-when-reading-payment-screenshots",
    "malaysian-payment-screenshot-parser-false-positives",
  ],
  location: "Malaysia",
  sections: [
    {
      heading: "Two banks on one receipt",
      body: [
        "In Malaysia, sending money to someone at another bank is routine: an interbank transfer or a DuitNow transfer from your banking app, which ends with a confirmation screen you can screenshot. [SpenDrop](/work/spendrop), my iOS expense tracker, turns that screenshot into an expense, and it records which account the money came from. On an interbank receipt that is not as obvious to software as it is to a person, because the receipt names two banks: yours, and the recipient's.",
        "A CIMB to Maybank transfer receipt contains \"CIMB\" in its header and account details, and \"Maybank\" next to the recipient. A parser that asks \"which bank names appear on this screen?\" finds both. If its rules check Maybank first, the expense is attributed to a bank you never paid from, and every funding-account report after that is wrong.",
        "This article is for anyone parsing bank receipts, transfer confirmations or statements, in Malaysia or elsewhere, where a document mentions more than one institution in different roles.",
      ],
    },
    {
      heading: "Why keyword presence is not enough",
      body: [
        "The first version of SpenDrop's provider detection did what most first versions do: a list of bank keywords, checked in order, first match wins. It worked for purchase receipts, which name one bank, and for e-wallet screens. It failed on exactly the documents where the answer mattered most.",
        "The fix was to stop treating the OCR text as a bag of words and read it as a document. A transfer receipt has a structure that people rely on without noticing: a header naming the app or bank, a \"From\" block describing your account, and a recipient block with labels such as \"Recipient bank\", \"Beneficiary bank\" or \"To bank\". The bank in the recipient block is, by definition, not the sender.",
      ],
    },
    {
      heading: "Step one: collect the recipient banks",
      body: [
        "Before any sender rule runs, the detector scans the lines for recipient labels: \"receiving bank\", \"recipient bank\", \"beneficiary bank\", \"to bank\" and \"bank/e-wallet\". When it finds one, it checks that line and the two lines after it for known bank names and adds each one to a set of recipient bank ids. Some receipts use a plain key-value layout, a line that says only \"Bank\" followed by the bank's name on the next line, and that pattern is collected too.",
        "Here is an invented receipt in the shape these screens take, after OCR has turned it into lines:",
        {
          type: "code",
          lang: "text",
          code: `CIMB OCTO
Transfer Successful
RM 50.00
From
Savings Acct-i
Recipient Bank
Maybank
Recipient Name
A. EXAMPLE
Reference No.
0000000000`,
          caption: "Synthetic example. \"Maybank\" appears after a recipient label, so it is recorded as a recipient bank.",
        },
      ],
    },
    {
      heading: "Step two: read the From block, then apply sender rules",
      body: [
        "Next the detector looks for a line that is exactly \"From\", or starts with \"From:\" or \"From \", and gathers it with the two lines below it. That text describes the paying account. Then each bank's sender rule runs, and every rule has the same shape: the bank counts as the sender if it is named in the From block, or in the first five lines (the header), or by one of its own product names, or anywhere at all, provided it is not in the recipient set.",
        {
          type: "code",
          lang: "swift",
          code: `// From PaymentProviderDetector.swift (one of the sender rules, trimmed)
let isCIMBSender = fromAccountText.contains("cimb") ||
                   fromAccountText.contains("savings acct-i") ||
                   fromAccountText.contains("current acct-i") ||
                   // ...CIMB product and app names...
                   (lowerFull.contains("cimb") && !recipientBankIds.contains("cimb"))

if isCIMBSender && !fromAccountText.contains("maybank") {
    // attribute the payment to CIMB
}`,
        },
        "The last clause is what fixed the bug. A bank that appears only as a recipient can never be chosen through the \"mentioned anywhere\" path. Rules also exclude a bank when the From block names a different one, so an explicit statement of the paying account beats everything else on the screen.",
        {
          type: "flow",
          steps: [
            "OCR lines",
            "Collect banks after recipient labels",
            "Gather the From block",
            "Sender rules (From block, header, product names, or any mention not in the recipient set)",
            "Provider and funding account",
          ],
        },
        "E-wallets get the same treatment. A Touch 'n Go transfer to a Maybank account is attributed to Touch 'n Go, because Maybank is in the recipient set; one of the real-reference tests exists for exactly that case.",
      ],
    },
    {
      heading: "Apple Pay is a wrapper around a bank",
      body: [
        "The same idea, that the visible name is not always the paying account, applies to Apple Pay. Apple Pay is a way of paying, not a place money comes from. When a screen is recognised as Apple Wallet or mentions Apple Pay, the detector also looks for the bank behind the card, from bank names or from a card line such as \"Maybank Visa Debit\", and records it separately as the underlying bank. The expense then shows \"Apple Pay • CIMB\" rather than just \"Apple Pay\". Why SpenDrop stores how you paid and where the money came from as two separate fields is covered in [Apple Pay Is Not a Bank](/blog/payment-channel-vs-funding-account-apple-pay-reconciliation).",
      ],
    },
    {
      heading: "Tested against real receipt layouts",
      body: [
        "The parser's test suite includes three interbank cases written from real receipt layouts: CIMB to Maybank, Maybank to RHB, and RHB to CIMB. Between them every one of those banks appears once as sender and once as recipient, which is the point: a rule order that happens to favour one bank cannot pass all three. All three pass, along with the Touch 'n Go to Maybank case.",
        "Those tests feed the receipts' text straight into the parser, so they test the parsing logic, not how well Apple's Vision framework reads a particular screenshot. They also carry the usual limits of a keyword parser: a bank or wallet with no rule falls back to Unknown with low confidence, and a new receipt layout with an unfamiliar recipient label would need that label added. SpenDrop is verified on the iOS simulator and is not on the App Store.",
        {
          type: "callout",
          label: "The general lesson",
          text: "When a document mentions several entities in different roles, identify the roles from the document's structure first (labels, blocks, position), and only then let keyword rules choose among the entities that can play the role you need.",
        },
        "The amount on the same screen has an equivalent problem, with adverts and balances instead of a second bank; that is covered in [Which RM Is the Payment?](/blog/ignoring-advert-prices-when-reading-payment-screenshots).",
      ],
    },
  ],
};
