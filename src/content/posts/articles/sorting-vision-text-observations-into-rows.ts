import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "sorting-vision-text-observations-into-rows",
  title: "Sorting Apple Vision Text Into Lines Without Crashing Swift's Sort",
  description:
    "VNRecognizeTextRequest returns boxes, not lines. Sorting them top to bottom and left to right with a comparator Swift's sort can trust.",
  date: "2026-11-23",
  category: "Full-Stack Development",
  tags: ["Apple Vision", "Swift", "OCR", "iOS", "Sorting", "VNRecognizeTextRequest"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Sort VNRecognizeTextRequest Results Into Rows in Swift",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "ignoring-advert-prices-when-reading-payment-screenshots",
    "ios-share-extension-ocr-shared-swiftdata-store",
    "malaysian-payment-screenshot-parser-false-positives",
  ],
  sections: [
    {
      heading: "Vision gives you boxes, your parser wants lines",
      body: [
        "[SpenDrop](/work/spendrop) reads payment screenshots on the iPhone with Apple's Vision framework. `VNRecognizeTextRequest` returns an array of `VNRecognizedTextObservation`s, one per run of text it found, each with candidate strings and a normalised bounding box. A rule-based parser, on the other hand, thinks in lines: \"the amount is on the line after Transferred\", \"the bank name is in the two lines below Recipient bank\". Turning boxes into lines in reading order is the first step of the pipeline, and it is easy to get subtly wrong.",
        "This note is for Swift developers post-processing Vision OCR results. It covers the coordinate system, why the obvious comparator is unsafe, and the quantised version SpenDrop uses.",
      ],
    },
    {
      heading: "Two traps: the origin, and tolerance",
      body: [
        "Vision's normalised coordinates have their origin at the bottom left, so a larger `midY` means higher on the image. Sorting by `midY` ascending reads the screen bottom to top. Using `1 - midY` gives a distance from the top, which sorts the natural way.",
        "Text on the same visual row rarely has exactly the same `midY`: a bold amount and a small label next to it differ by a fraction. The obvious fix is a tolerance, \"if two boxes are within a few thousandths vertically, treat them as the same row and compare `minX`\". That comparator is not a valid ordering. With a tolerance, A can be \"the same row\" as B and B \"the same row\" as C while A and C are not, so equivalence is not transitive. Swift's `sorted(by:)` requires a strict weak ordering; when the predicate breaks it, the result is unspecified and, as the source comment in SpenDrop records, can end in a runtime crash.",
      ],
    },
    {
      heading: "Quantise into row bands",
      body: [
        "The fix is to turn the fuzzy comparison into an exact one. Divide the distance from the top into fixed bands, take each box's band as an integer, and compare integers. Two boxes are in the same row exactly when they are in the same band, which is transitive by construction:",
        {
          type: "code",
          lang: "swift",
          code: `// From OCRService.swift
// Quantized row-band sort ensures strict weak ordering (prevents Swift sorting runtime crash)
let rowBandHeight: CGFloat = 0.018
let sortedObservations = observations.sorted { obs1, obs2 in
    // In Vision coordinates, (0,0) is bottom-left, so (1.0 - midY) measures distance from top
    let topDist1 = 1.0 - obs1.boundingBox.midY
    let topDist2 = 1.0 - obs2.boundingBox.midY

    let band1 = Int(topDist1 / rowBandHeight)
    let band2 = Int(topDist2 / rowBandHeight)

    if band1 != band2 {
        return band1 < band2   // higher on the page comes first
    }
    return obs1.boundingBox.minX < obs2.boundingBox.minX   // left to right within a band
}`,
        },
        "A band height of 0.018 is just under 2% of the image height. Each sorted observation then becomes a line that keeps its text, its confidence and its bounding box. Keeping the box is deliberate: the parser later uses it to recognise adverts at the bottom of the screen, as described in [Which RM Is the Payment?](/blog/ignoring-advert-prices-when-reading-payment-screenshots).",
        "The request around this runs with `.accurate` recognition, language correction, and the languages `en-US`, `ms-MY` and `zh-Hans`, on an image already downsampled to 1280 pixels, inside a detached task and an `autoreleasepool`.",
      ],
    },
    {
      heading: "What banding does not solve",
      body: [
        "Bands have edges. Two boxes on the same visual row can straddle a band boundary and land one band apart, which swaps their order. Payment screenshots usually have well-separated rows, which makes this less likely, but for dense documents a better approach is to cluster boxes into rows first and then sort the clusters.",
        "Banding also cannot join what Vision has already split. On a synthetic paper receipt with the word TOTAL at the left margin and RM 19.08 far to the right, Vision returned them as two separate observations. Sorting placed them correctly, but they are still two lines, so the amount lost its label and a line item won. SpenDrop's review screen downgraded to \"Possible Expense Detected\", and the case is recorded as a known limitation. Merging boxes that share a band into one line before parsing is the obvious next step; it is not implemented.",
        {
          type: "callout",
          label: "Evidence",
          text: "That the tolerance comparator caused a crash is taken from the comment in the code, not from a recorded crash log. SpenDrop is verified on the iOS simulator and is not on the App Store.",
        },
        "If you are building the extension side of this pipeline, [Building an iOS Share Extension That Reads a Screenshot](/blog/ios-share-extension-ocr-shared-swiftdata-store) covers getting the image in and staying within memory.",
      ],
    },
  ],
};
