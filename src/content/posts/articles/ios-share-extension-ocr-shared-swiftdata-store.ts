import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ios-share-extension-ocr-shared-swiftdata-store",
  title: "Building an iOS Share Extension That Reads a Screenshot and Saves to the App's Database",
  description:
    "How SpenDrop's Share Extension loads an image from any app, stays inside the memory limit, runs Vision OCR and saves to the app's shared SwiftData store.",
  date: "2026-10-15",
  category: "Full-Stack Development",
  tags: ["iOS", "Share Extension", "SwiftUI", "Apple Vision", "SwiftData", "App Groups", "NSItemProvider"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "iOS Share Extension With Vision OCR and SwiftData",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "app-group-swiftdata-store-was-never-the-one-in-use",
    "ignoring-advert-prices-when-reading-payment-screenshots",
    "sorting-vision-text-observations-into-rows",
    "in-app-test-runner-and-xcuitest-for-an-ios-app",
  ],
  sections: [
    {
      heading: "Capture has to happen where the payment is",
      body: [
        "The point of [SpenDrop](/work/spendrop) is that you never type an expense your phone already shows you. A payment confirmation appears in Touch 'n Go, a bank app or Wallet; you take a screenshot, tap Share, pick SpenDrop, and a filled-in review form appears on top of the app you were in. That is an iOS Share Extension, and it is the part of the app that took the most care to make reliable.",
        "An extension is not a small copy of your app. It is a separate process with its own lifecycle, a much tighter memory budget, no direct access to your app's files, and very little visibility when something fails. This guide walks through the pieces SpenDrop needed, in the order an image passes through them.",
        {
          type: "flow",
          steps: [
            "Share sheet hands over attachments",
            "UI attached immediately",
            "Load the image (UTIs × strategies)",
            "Downsample to 1280 px",
            "Vision OCR and parse",
            "Duplicate check and review",
            "Save to the App Group store",
            "completeRequest",
          ],
          caption: "The Share Extension path. Reading and parsing never leave the phone.",
        },
      ],
    },
    {
      heading: "Show something before doing anything",
      body: [
        "The extension's principal class is a small UIKit `ShareViewController` that hosts a SwiftUI view. The first version showed a black screen on some shares. The fix recorded in the code is to attach the SwiftUI root synchronously in `viewDidLoad`, pinned with explicit constraints and a `systemBackground` colour, and only then start loading the image asynchronously. A comment in the source puts the goal plainly: the extension should never present a black screen.",
        "The SwiftUI side is a view model with explicit phases: receiving, processing, reviewing, no text found, and error. Every phase has a screen. \"No text found\" offers \"Enter Details Manually\", which opens a blank review form with the image attached, and \"Retry\". OCR runs in a cancellable task with a re-entrancy guard, so cancelling the sheet stops the work and a double trigger cannot start two recognitions.",
      ],
    },
    {
      heading: "Getting an image out of NSItemProvider",
      body: [
        "Photos, Files, a fresh screenshot and a bank app's own share button do not hand over images the same way. One gives a `UIImage`, another a security-scoped file URL, another raw `Data`, and they register different type identifiers. The extension's activation rule accepts `public.image`, `public.file-url`, `public.png`, `public.jpeg` and `public.heic`.",
        "The loader tries every combination rather than guessing. For each attachment it builds a list of candidate type identifiers, the ones the provider actually registered first and then a prioritised list (PNG, JPEG, HEIC, image, file URL, URL, data), and for each identifier it tries three loading strategies in order:",
        {
          type: "list",
          ordered: true,
          items: [
            "`loadItem(forTypeIdentifier:)`, handling a `UIImage`, a `URL` (opened with `startAccessingSecurityScopedResource`) or `Data`",
            "`loadDataRepresentation(forTypeIdentifier:)`",
            "`loadFileRepresentation(forTypeIdentifier:)`",
          ],
        },
        "The first one that produces a decodable image wins. It is verbose, but it turned \"sometimes nothing happens\" into a sequence of logged attempts, which is what made the failures fixable.",
      ],
    },
    {
      heading: "Staying inside the extension's memory limit",
      body: [
        "Share Extensions are given far less memory than a full app, and a full-resolution screenshot decoded at the screen's 3× scale is a large bitmap before Vision allocates anything of its own. SpenDrop downsamples to a longest side of 1280 pixels as soon as the image arrives, rendering at a scale of 1.0 so the result is not tripled again. A comment in the code sets the target at under 30 MB.",
        {
          type: "code",
          lang: "swift",
          code: `private func downsampleImageIfNeeded(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
    let maxSide = max(image.size.width, image.size.height)
    guard maxSide > maxDimension, maxSide > 0 else { return image }

    let scale = maxDimension / maxSide
    let newSize = CGSize(width: round(image.size.width * scale),
                         height: round(image.size.height * scale))

    let format = UIGraphicsImageRendererFormat()
    format.scale = 1.0          // do not render a 3x retina buffer
    format.opaque = false

    return UIGraphicsImageRenderer(size: newSize, format: format).image { _ in
        image.draw(in: CGRect(origin: .zero, size: newSize))
    }
}`,
          caption: "From ShareViewController.swift. The OCR service downsamples again with the same rules, so the main app path is covered too.",
        },
        "The Vision request itself runs in `Task.detached(priority: .userInitiated)` inside an `autoreleasepool`, so temporary objects from recognition are released as soon as it finishes rather than at the end of a run loop the extension may not survive to see. 1280 pixels is enough for Vision to read a phone screenshot's text; the parser that turns that text into an amount, merchant and provider is described in [Which RM Is the Payment?](/blog/ignoring-advert-prices-when-reading-payment-screenshots).",
      ],
    },
    {
      heading: "One database, two processes",
      body: [
        "An expense saved from the share sheet has to be on the dashboard the next time the app opens, and the duplicate check in the extension has to see everything the app has saved. So there is one SwiftData store, in the App Group container, opened by both targets with an identical schema. SpenDrop does not use a shared framework: every model and engine file is compiled into both targets. That keeps the build simple and has a cost, which the history shows: one fix commit exists only because a sample-data file was missing from the extension target.",
        "Where exactly that store lives turned out to matter more than I realised; [The SwiftData Store I Configured Was Never the One Being Used](/blog/app-group-swiftdata-store-was-never-the-one-in-use) tells that story. The extension saves with a source type of `shareExtension`, so every record says how it arrived, and then calls `extensionContext.completeRequest` to dismiss.",
        "Since version 1.4.0 the extension's review can save as an Expense, Money In or Money Out, preselected only when the screen's wording is clear, and it links the funding account at once. Transfers are not offered there, because they need two accounts.",
      ],
    },
    {
      heading: "Give the extension its own observability",
      body: [
        "An extension's standard output is awkward to watch: it is a different process from the app you launched from Xcode. SpenDrop's extension writes every step through a `shareLog()` helper to stdout, to `NSLog`, and to an append-only file in the App Group. The main app prints that file when launched with `--read-share-logs`, so after a failed share you open the app with that flag and read exactly which type identifier and which strategy failed.",
        "The same idea produced an image diagnostics mode. Launching with `--run-image-diagnostics` pushes three bundled samples, a PNG, a JPEG and a HEIC, through eight steps: data load, `UIImage`, `CGImage`, downsample, temporary write, App Group write and read, OCR and parser. It isolates whether a problem is decoding, storage or recognition.",
        {
          type: "callout",
          label: "What is verified",
          text: "Both the app and the Share Extension build, and the extension ran on the simulator for the screenshots on the project page, which were taken before version 1.4.0. The project's own notes list the extension at runtime in the share sheet as not yet re-tested for 1.4.0, and 1.4.0 has not been run on a physical iPhone. SpenDrop is not on the App Store.",
        },
      ],
    },
  ],
};
