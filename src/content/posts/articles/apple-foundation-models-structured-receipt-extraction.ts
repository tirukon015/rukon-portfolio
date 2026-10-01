import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "apple-foundation-models-structured-receipt-extraction",
  title: "Structured Receipt Extraction With Apple's Foundation Models and @Generable: A Code Walkthrough",
  description:
    "How DriveKeep's iOS code asks Apple's on-device Foundation Models for typed receipt fields and fuses them with Vision OCR. A walkthrough of unverified code.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["Foundation Models", "Apple Intelligence", "Swift", "On-Device AI", "Structured Output", "iOS 27", "OCR"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "Apple Foundation Models @Generable for Receipt Data",
  relatedProjects: ["drivekeep"],
  relatedPosts: [
    "odometer-ocr-tesseract-sharp-preprocessing-plausibility",
    "removing-default-values-that-look-like-data",
    "a-vision-model-that-only-observes",
    "making-an-llm-admit-the-paper-does-not-say",
  ],
  sections: [
    {
      heading: "Read this first: what this article is and is not",
      body: [
        {
          type: "callout",
          label: "Unverified code",
          text: "This is a walkthrough of source code in DriveKeep's iOS app. That app has not been built or run for the project's audit (the audit machine runs Windows, and the project has no XCTest target), so nothing here is a measured result. I make no claim about how accurately the model reads receipts, how fast it is, or that every API call compiles against the current SDK. Treat it as a design you can learn from, not a benchmark.",
        },
        "[DriveKeep](/work/drivekeep) is my log for a car and a motorcycle. Adding a refill starts with a photo of the pump receipt and one of the odometer, and on iOS both are read on the phone. Receipts are small financial documents, so reading them without a network call is a feature in itself. Apple's Vision framework provides the text; on iOS 27 and later, the code also asks Apple's on-device Foundation Models for the fields directly, as typed values rather than text to be parsed. This article is for iOS developers considering the Foundation Models framework for structured extraction from images.",
      ],
    },
    {
      heading: "Declaring the output as a Swift type",
      body: [
        "The Foundation Models framework can generate an instance of a Swift type marked `@Generable` instead of free text. DriveKeep declares two, one per photo, with every field optional:",
        {
          type: "code",
          lang: "swift",
          code: `#if canImport(FoundationModels)
@available(iOS 27.0, macOS 27.0, *)
@Generable
public struct FuelReceiptAIResult: Sendable {
    public var station: String?
    public var fuelType: String?
    public var quantityLitres: Double?
    public var pricePerLitre: Double?
    public var totalCost: Double?
    public var date: String?
    public var time: String?
    public var confidence: Double?
}

@available(iOS 27.0, macOS 27.0, *)
@Generable
public struct OdometerAIResult: Sendable {
    public var odometerReading: Double?
    public var confidence: Double?
    public var notes: String?
}
#endif`,
          caption: "From ios/DriveKeep/Services/FoundationVisionService.swift.",
        },
        "Optional fields are the important design choice. A receipt that does not print the price per litre should produce `nil` for it, not a number the model made up to fill a required field. The schema gives the model a legitimate way to say \"not there\".",
      ],
    },
    {
      heading: "A prompt that forbids arithmetic and guessing",
      body: [
        "The request passes the photo and an instruction block together. The code builds the prompt with the image as an attachment, then calls `respond(to:generating:)` with the result type:",
        {
          type: "code",
          lang: "swift",
          code: `let session = LanguageModelSession()

let promptText = """
You are extracting structured information from a fuel station receipt image.
The uploaded receipt image itself is the ONLY source of truth.
Read ONLY text that is visibly printed on the receipt.
...
CRITICAL EXTRACTION RULES:
1. NEVER calculate or multiply any numbers (DO NOT calculate quantity * price = total).
2. NEVER invent or guess any value.
3. If any field is not clearly printed on the receipt, return null for that field.
4. Do NOT confuse invoice numbers, terminal numbers, approval codes, card numbers,
   or other numbers with receipt fields.
5. Pay exact attention to decimal points (e.g. 13.730 L, 4.370, 60.00).
"""

let prompt = Prompt {
    Attachment(normalized)   // the receipt photo, orientation-normalised
    promptText
}
let response = try await session.respond(to: prompt, generating: FuelReceiptAIResult.self)`,
          caption: "Trimmed from extractReceiptWithFoundationModel; the elided lines describe each field with Malaysian examples (PETRONAS, PRIMAX 95, \"JUMLAH\").",
        },
        "Rule 1 is the interesting one. A language model asked for litres, price and total will happily compute a missing one from the other two, and the result looks exactly like a value read from the paper. Checking litres × price against the total is one of the best ways to catch a misread, and that check is worthless if the model has already made the numbers agree. (The iOS result types have fields for such a check, but in this code they are always set to false; the web app's parser is the one that cross-checks the three values.) Rules 3 and 4 do the same job for missing fields and for the many other numbers printed on a receipt.",
        "The odometer prompt is a list of things to ignore (the clock, speedometer, tachometer, trip meter, fuel gauge, temperature, warning lights) and the instruction to read the digits exactly as displayed, not to guess, and not to combine numbers from different regions of the dashboard.",
      ],
    },
    {
      heading: "Gating: compile time, OS version, and device",
      body: [
        "Foundation Models is not available everywhere, and the code checks at three levels. `#if canImport(FoundationModels)` keeps the project compiling with an SDK that lacks the framework (the file also conditionally imports a UIKit overlay module for the image attachment). `@available(iOS 27.0, *)` and `if #available` keep it off older systems, while the app itself targets iOS 17. And at runtime `SystemLanguageModel.default.isAvailable` decides whether this particular device can run the model at all; when it cannot, the reason from `availability` is logged and the code returns `nil`, so the caller falls back to Vision alone.",
        "That fallback is the main point of the architecture. Vision OCR is the base path on every supported device. The model is an extra signal where available, never a requirement.",
      ],
    },
    {
      heading: "Fusing the model with Vision",
      body: [
        "For receipts, the validation service asks the model for its result and runs Vision OCR on the same photo, then merges field by field: each field takes the model's value when there is one and the Vision parser's otherwise, so a partial result from either source is kept. The model's output is also used as evidence in the photo check: an image that looks like a dashboard, or like food or a person, is only rejected as \"not a receipt\" if the model also found no litres or total.",
        "For odometers the model is one voter among several. The code crops the central instrument-cluster region of the photo (and a wider crop if the first returns nothing), asks the model for a reading, and adds it to a consensus with the candidates from Vision OCR. A reading the model agrees with gets extra weight, two votes instead of one; candidates confirmed by a seven-segment check are boosted; and the winner must pass plausibility checks against the previous reading and a minimum score, otherwise it is returned for review. Whatever wins only fills the editable review form.",
      ],
    },
    {
      heading: "Two things I would change",
      body: [
        "First, the confidence fallback. When the model returns no confidence, the code substitutes 0.95 for receipts and 0.90 for odometers. That is a default that reads as data, the very thing the rest of the project worked to remove (see [Defaults Are Claims](/blog/removing-default-values-that-look-like-data)). A missing confidence should stay missing, or be treated as low.",
        "Second, a model asked to output its own confidence is not a calibrated probability. It is useful as a tie-breaker in a consensus, not as a number to show the user. The same caution about letting a model decide versus observe runs through [A Vision Model That Only Observes](/blog/a-vision-model-that-only-observes).",
        "The parts of DriveKeep that are verified are on the web: the server-side OCR pipeline with Tesseract.js, covered in [Reading an Odometer Photo](/blog/odometer-ocr-tesseract-sharp-preprocessing-plausibility), and the calculation engine. The web app is live on Vercel with no sign-in; the iOS app is not published.",
      ],
    },
  ],
};
