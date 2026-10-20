import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "offline-receipt-ocr-on-android-with-ml-kit",
  title: "Offline Receipt OCR on Android: On-Device Google ML Kit Text Recognition with Jetpack Compose",
  description:
    "How SpenDrop's native Android engine parses payment receipts and merchant summaries offline on device using Google ML Kit, Jetpack Compose, and Room SQLite without third-party cloud APIs.",
  date: "2026-10-13",
  category: "AI & Automation",
  tags: ["Android", "Kotlin", "Jetpack Compose", "ML Kit", "OCR", "Offline First", "Room SQLite"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Offline Android Receipt OCR with Google ML Kit & Jetpack Compose",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "apple-foundation-models-structured-receipt-extraction",
    "benchmarking-ollama-vision-models-the-cached-image-trap",
    "swiftdata-local-first-outbox-sync-engine",
  ],
  sections: [
    {
      heading: "The privacy and latency challenge in mobile expense tracking",
      body: [
        "Most commercial mobile finance applications implement receipt scanning by uploading user photos to a cloud computer vision API. While convenient for the developer, this approach carries severe trade-offs: it compromises user financial privacy by sending raw transaction documents over the internet, fails immediately when the user has poor mobile connectivity in a basement retail store, and introduces recurring per-scan API costs.",
        "When engineering the native Android implementation of [SpenDrop](/work/spendrop), we committed to an offline-first architecture: receipts must be read directly on the user's handset with zero cloud dependency.",
      ],
    },
    {
      heading: "On-device text recognition with Google ML Kit",
      body: [
        "On Android, on-device OCR is implemented via Google's standalone ML Kit Text Recognition library (`com.google.android.gms:play-services-mlkit-text-recognition:19.0.0`). The recognition model runs entirely inside the local application runtime, accelerated by the device's Neural Networks API (NNAPI) or GPU where available.",
        "In `ReceiptOcrEngine.kt`, the image bitmap is wrapped into an `InputImage` and processed through an asynchronous coroutine pipeline:",
        {
          type: "code",
          lang: "kotlin",
          code: `class ReceiptOcrEngine @Inject constructor() {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    suspend fun parseReceipt(bitmap: Bitmap): OcrResult = withContext(Dispatchers.Default) {
        val image = InputImage.fromBitmap(bitmap, 0)
        val visionText = recognizer.process(image).await()
        extractFinancialData(visionText)
    }
}`,
        },
      ],
    },
    {
      heading: "Rule-based financial extraction pipeline",
      body: [
        "Raw OCR returns bounding boxes and unorganized text blocks. Turning raw text into a reliable expense record requires structured deterministic parsing:",
        {
          type: "flow",
          steps: [
            "Input receipt image processed by on-device ML Kit model",
            "Text blocks grouped into line-height normalized text rows",
            "Regex filters detect transaction date, reference number, and payment provider",
            "Amount candidates scored by visual proximity to currency tokens ('RM', 'MYR')",
            "Advertisement prices, tax percentages, and account balances disqualified",
            "Highest-confidence candidate populates Jetpack Compose review screen",
          ],
          caption: "Deterministic financial parsing pipeline on Android.",
        },
        "A critical rule ported directly from SpenDrop's iOS engine is **amount candidate disambiguation**. Receipts frequently list multiple monetary figures: subtotal, service tax, rounding adjustments, and change due. The parser scores each candidate based on its vertical position and token proximity, ensuring the true transaction total is selected while advertising prices or balances are disqualified.",
      ],
    },
    {
      heading: "Handling camera orientation and EXIF rotation metadata",
      body: [
        "A notorious pitfall in mobile document scanning is image rotation. When a user captures a receipt using the device camera or selects a screenshot from the gallery, Android hardware sensors often store the pixel buffer in native sensor landscape orientation accompanied by an EXIF rotation tag (0, 90, 180, or 270 degrees).",
        "If an OCR engine feeds raw bitmap dimensions directly to ML Kit without accounting for the sensor orientation, text recognition fails completely or produces garbled character sequences because the neural model attempts to read vertical text sideways. SpenDrop extracts the orientation degrees from the image metadata before constructing the `InputImage`:",
        {
          type: "code",
          lang: "kotlin",
          code: `fun prepareInputImage(uri: Uri, context: Context): InputImage {
    val inputStream = context.contentResolver.openInputStream(uri) ?: throw IOException("Cannot open URI")
    val exif = ExifInterface(inputStream)
    val rotationDegrees = when (exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
        ExifInterface.ORIENTATION_ROTATE_90 -> 90
        ExifInterface.ORIENTATION_ROTATE_180 -> 180
        ExifInterface.ORIENTATION_ROTATE_270 -> 270
        else -> 0
    }
    val bitmap = BitmapFactory.decodeStream(context.contentResolver.openInputStream(uri))
    return InputImage.fromBitmap(bitmap, rotationDegrees)
}`,
        },
      ],
    },
    {
      heading: "Local-first persistence with Room SQLite and integer arithmetic",
      body: [
        "Once the parsed transaction values appear on the Jetpack Compose review screen and the user approves the entry, SpenDrop commits the record immediately to local storage. Under no circumstances does the application block user interaction waiting for a cloud HTTP response.",
        "To avoid IEEE 754 floating-point rounding errors when calculating shared bills or sales taxes, all monetary amounts are converted into integer-sen representations (e.g., RM 45.80 is stored strictly as `4580` cents). The local transaction is inserted into Room SQLite alongside an outbox queue event within a single database transaction:",
        {
          type: "code",
          lang: "kotlin",
          code: `@Transaction
suspend fun insertExpenseWithOutbox(expense: ExpenseEntity, outboxEvent: OutboxEntity) {
    expenseDao.insert(expense)
    outboxDao.insert(outboxEvent)
}`,
        },
        "A background coroutine worker observing Android's `ConnectivityManager` drains the outbox queue when internet access is present, leaving the primary user experience completely unaffected by network speed.",
      ],
    },
    {
      heading: "Architecture and test harness",
      body: [
        "The Android implementation is structured in clean modular layers:",
        {
          type: "list",
          items: [
            "**Presentation (`:app`):** Declarative UI built with Jetpack Compose BOM, ViewModel state machines, and camera capture flows.",
            "**Domain (`:core`):** Platform-neutral business logic, integer-sen currency calculations, and split rules.",
            "**Data (`:core-database`):** Room SQLite with encrypted persistence and background WorkManager synchronization.",
          ],
        },
        "The engine is backed by **298 JVM unit tests** covering financial calculation vectors and **52 Android unit tests** executed via Robolectric, ensuring complete mathematical parity with the iOS and Web implementations.",
      ],
    },
  ],
};
