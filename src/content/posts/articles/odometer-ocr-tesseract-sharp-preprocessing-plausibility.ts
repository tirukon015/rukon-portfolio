import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "odometer-ocr-tesseract-sharp-preprocessing-plausibility",
  title: "Reading an Odometer Photo: Preprocessing Variants, Tesseract.js and a Plausibility Check",
  description:
    "DriveKeep's web app reads four sharp-preprocessed variants of an odometer photo with Tesseract.js and ranks every candidate against the previous reading.",
  date: "2026-12-26",
  category: "AI & Automation",
  tags: ["OCR", "Tesseract.js", "sharp", "Node.js", "Image Preprocessing", "Next.js"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Odometer OCR With Tesseract.js, sharp and Sanity Checks",
  relatedProjects: ["drivekeep"],
  relatedPosts: [
    "measured-vs-estimated-fuel-economy-full-tank-method",
    "apple-foundation-models-structured-receipt-extraction",
    "photo-quality-gate-blur-glare-exposure-before-a-vision-model",
    "malaysian-payment-screenshot-parser-false-positives",
  ],
  sections: [
    {
      heading: "Why odometers are a hard OCR target",
      body: [
        "In [DriveKeep](/work/drivekeep), my fuel and maintenance log, a refill starts with two photos: the pump receipt and the odometer. The odometer reading is the more important of the two, because every distance and every economy figure is computed from the difference between readings. One misread digit corrupts the next refill's numbers.",
        "It is also the harder photo to read. An instrument cluster is behind curved glass, often lit from inside, sometimes with bright digits on a dark background, sometimes a segmented LCD, usually with a trip meter, a clock and a temperature display in the same frame. A general-purpose OCR engine like Tesseract reads text on paper well; a cluster photo is not that.",
        "This article describes the server-side pipeline in DriveKeep's Next.js web app, which is the part that is live and tested. It is for developers using Tesseract.js or similar engines on photos of displays, meters or gauges, where the expected value is a number with a known history.",
      ],
    },
    {
      heading: "Several preprocessed variants instead of one guess",
      body: [
        "No single preprocessing setting suits every photo: what rescues a dim photo ruins one with glare. So the server makes several variants of the image with sharp and lets the results compete. For odometers it resizes to a width of 1,200 pixels (receipts get 1,600) and produces four:",
        {
          type: "code",
          lang: "ts",
          code: `// Variant 1: grayscale + contrast normalisation
sharp(img).resize({ width, withoutEnlargement: true }).grayscale().normalize()

// Variant 2: grayscale + sharpening + stronger contrast
sharp(img).resize({ width, withoutEnlargement: true }).grayscale().sharpen({ sigma: 1.5 }).linear(1.3, -20)

// Variant 3: binarised, black on white (threshold 115 for odometers, 128 for receipts)
sharp(img).resize({ width, withoutEnlargement: true }).grayscale().normalize().threshold(115)

// Variant 4 (odometers only): inverted, for bright digits on a dark cluster
sharp(img).resize({ width, withoutEnlargement: true }).grayscale().negate().normalize().threshold(120)`,
          caption: "Simplified from preprocessImageForOcr in src/lib/ocr.ts; each variant is encoded as PNG.",
        },
        "The inverted variant is the one specific to odometers. Tesseract expects dark text on a light background, and many clusters are the opposite.",
      ],
    },
    {
      heading: "Two reading modes per variant",
      body: [
        "Each variant is read twice by a single Tesseract.js worker. The first pass is digit-only: a character whitelist of `0123456789` and the single-line page segmentation mode, and every run of four to seven digits between 1,000 and 999,999 becomes a candidate with the pass's confidence. The second pass reads letters too, in automatic segmentation mode, and hands the text to the same regex parser the receipts use, which looks for a number after labels such as ODO, KM, MI or mileage and only accepts one that is at least the previous reading.",
        "So one photo can produce up to eight readings, some unlabelled, some labelled, all with a confidence. The next step decides between them.",
      ],
    },
    {
      heading: "Ranking candidates against the previous reading",
      body: [
        "The app knows something Tesseract does not: the vehicle's last recorded odometer reading. Odometers only go up, and between two refills they go up by a few hundred kilometres, not by hundreds of thousands. The ranking uses that directly:",
        {
          type: "code",
          lang: "ts",
          code: `candidates.sort((a, b) => {
  let scoreA = a.confidence + (a.labeled ? 50 : 0);
  let scoreB = b.confidence + (b.labeled ? 50 : 0);

  // Boost candidates in realistic range near previousOdometer
  if (previousOdometer > 0) {
    if (a.value >= previousOdometer && a.value <= previousOdometer + 50000) scoreA += 40;
    if (b.value >= previousOdometer && b.value <= previousOdometer + 50000) scoreB += 40;
  }
  return scoreB - scoreA;
});

const best = candidates[0];
if (best.confidence >= 40 || best.labeled) {
  result.odometer = best.value;
}`,
          caption: "From performOdometerOcr. A reading found after a label gets +50; one within 50,000 km above the previous reading gets +40.",
        },
        "In a test of the pipeline on a synthetic odometer image, the digit-only pass read `053261` as `953261`, the classic confusion of a leading zero with a nine. That reading was not deleted by a special rule. It simply lost: it is far more than 50,000 km above the previous reading, so it got no plausibility boost, while 53,261 did, and 53,261 was used. Tesseract's confidence alone would not have caught it; the domain knowledge did.",
        "Receipts are ranked differently, by how many fields a variant's text parses into (litres and total count most, then price and station, then date) plus its confidence, and the best-scoring variant's values are used.",
      ],
    },
    {
      heading: "A suggestion, then server-side rules",
      body: [
        "Whatever OCR returns only fills an editable form. The owner checks the numbers and taps Confirm & Save, and only then does the refill reach the API, which applies its own rules regardless of where the numbers came from: an odometer lower than the last refill's is rejected with a 400, and a refill that looks like a duplicate of an existing one gets a 409. OCR is allowed to be wrong because it never writes anything by itself. How those odometer readings become economy figures is in [Measured or Estimated](/blog/measured-vs-estimated-fuel-economy-full-tank-method).",
        "The route also contains an optional cloud extraction path that calls a hosted vision model when an API key is configured. The project documentation lists it as not configured; everything described here is the local Tesseract pipeline.",
      ],
    },
    {
      heading: "What is measured and what is not",
      body: [
        "The pipeline has been exercised on synthetic images only: a synthetic receipt read as 22.45 L, RM 2.05 per litre and RM 46.02, and the synthetic odometer above. No accuracy figure is claimed, because there is no labelled set of real cluster photos to measure against. One receipt OCR call took about 5.4 seconds on the audit machine, and running up to eight recognitions per odometer photo has an obvious cost. The DriveKeep web app is live on Vercel with no sign-in.",
        "The iOS app takes a different route, entirely on the phone: an image quality check first, Apple's Vision framework, crops of the instrument-cluster region, a seven-segment check and a consensus across readings, with Apple's Foundation Models on iOS 27 and later. That code has not been built or run for the project's audit, so it is not described as working here; the structured-extraction part is walked through separately as code. Checking photo quality before spending model time on it is discussed in [a photo quality gate for blur, glare and exposure](/blog/photo-quality-gate-blur-glare-exposure-before-a-vision-model).",
      ],
    },
  ],
};
