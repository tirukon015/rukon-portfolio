import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "measured-vs-estimated-fuel-economy-full-tank-method",
  title: "Measured or Estimated: Calculating Fuel Economy Only From Full Tanks",
  description:
    "Dividing a top-up into the distance driven gives a meaningless economy figure. How DriveKeep measures km/L only from full tanks and labels estimates.",
  date: "2026-12-18",
  category: "Building Real Systems",
  tags: ["Fuel Economy", "TypeScript", "Next.js", "Calculation Engine", "Data Quality", "Vehicle Log"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Full-Tank Fuel Economy Calculation, Measured vs Estimated",
  relatedProjects: ["drivekeep"],
  relatedPosts: [
    "removing-default-values-that-look-like-data",
    "odometer-ocr-tesseract-sharp-preprocessing-plausibility",
    "malaysian-payment-screenshot-parser-false-positives",
    "blank-is-not-zero-production-report-inputs",
  ],
  sections: [
    {
      heading: "Why a fuel log's economy figure jumps around",
      body: [
        "[DriveKeep](/work/drivekeep) is a log for running a car and a motorcycle that I built for myself: fuel, mileage, servicing and other costs. It started from a spreadsheet of refills and repairs, and the spreadsheet's fuel economy column was the least trustworthy number in it. Some months it said 9 km/L, some months 25, for the same car driven the same way.",
        "The cause is well known to anyone who has tracked fuel by hand. If you divide the distance since the last refill by the litres you just bought, the answer is only meaningful when both refills filled the tank to the top. A top-up of 10 litres after 300 km gives 30 km/L; a fill-up after several top-ups gives a figure far too low. This article is for anyone building a fuel tracker or any calculation where some inputs are measurements and some are not: how DriveKeep decides when economy has actually been measured, how it estimates what it cannot measure, and how the screen tells the two apart.",
      ],
    },
    {
      heading: "The full-tank rule in code",
      body: [
        "Every refill records whether the tank was filled to full and whether a refill was missed before it (a fill-up you forgot to log breaks the chain just as surely as a top-up). Economy for a refill is computed only when the tank was filled and nothing was missed; otherwise it is `null`, not zero and not an estimate.",
        {
          type: "code",
          lang: "ts",
          code: `export function calculateEfficiency(
  distance: number | null | undefined,
  fuelAmount: number,
  isFullTank: boolean,
  isMissedRefill: boolean
): number | null {
  if (!distance || distance <= 0 || fuelAmount <= 0) return null;
  // If the tank wasn't filled to full or a previous refill was missed,
  // the single-refill economy cannot be accurately calculated using simple division.
  if (!isFullTank || isMissedRefill) return null;

  return Math.round((distance / fuelAmount) * 100) / 100;
}`,
          caption: "From DriveKeep's web calculation engine, src/lib/calculations.ts.",
        },
        "Distance itself has the same discipline. `calculateDistance` returns `null` when there is no previous reading or when the new odometer is not higher than the previous one; it never returns a negative number. On save, the web API rejects an odometer lower than the last refill's with a 400, unless an explicit odometer-reset option is sent, and flags a likely duplicate refill with a 409: the same odometer reading, or the same day with nearly the same litres and cost.",
        "The vehicle's average is the total distance divided by the total litres over up to the last ten qualifying refills, which weights long trips properly instead of averaging ratios. If no refill qualifies, the average is `null`.",
      ],
    },
    {
      heading: "Estimating what was not measured",
      body: [
        "Two figures on the dashboard can never be measured by a log: how much fuel is in the tank now, and how far it will go. DriveKeep estimates them by carrying a fuel balance forward through the refill history, oldest first:",
        {
          type: "flow",
          steps: [
            "First refill: a full tank, or the litres added",
            "Each later refill: previous estimate − distance ÷ average economy",
            "Add the litres bought (or reset to full on a full fill)",
            "Clamp between 0 and the tank capacity",
            "Subtract the distance since the last refill",
            "Range = fuel left × average economy",
          ],
          caption: "The fuel balance in calculateFuelBalance and calculateVehicleStats.",
        },
        "From the remaining fuel the dashboard derives a tank percentage, an estimated range, and a target odometer for the next refill, with \"Fuel Low\" at 15% or less and \"Reserve reached\" at 30% or less. Every one of these depends on the average economy, which is why it matters so much that the average is never invented. If there is no measured average, the range and the refill target are `null` and the card asks for a refill instead. Why that rule exists, and what the engine used to do instead, is the subject of the companion article on default values that look like data.",
      ],
    },
    {
      heading: "ACTUAL and ESTIMATED on screen",
      body: [
        "The web app puts a badge on every figure: ACTUAL for economy measured between full tanks, ESTIMATED for fuel left and range. The refill history shows an ACTUAL km per litre badge only on refills where economy was computed. A partial refill simply has no economy figure.",
        "That labelling is the product, more than any chart. A number the owner can trust and a number that is a reasonable guess look identical in a spreadsheet. Once they are labelled, a surprising range estimate is understood as an estimate, and a measured economy figure can be compared month to month.",
      ],
    },
    {
      heading: "Where the rule is still too loose",
      body: [
        "Read closely, the per-refill rule is weaker than the textbook full-tank method. The textbook method measures from one full fill to the next full fill, adding up the litres of any partial fills in between. DriveKeep's rule checks that the current fill is full and that no refill was missed, but it divides only by the current fill's litres and measures distance only from the previous refill, whatever kind it was. A full fill that follows a partial one therefore gets an economy figure computed over the wrong span.",
        "There is a related gap in the fuel balance. When a vehicle has a refill but no measured average yet, consumption is computed as zero, so the estimated level after the first full fill stays at a full tank however far the vehicle has been driven since. The range is still `null` in that state, because it needs the average, but the tank percentage is shown. Both fixes are small: accumulate litres since the last full fill, and return no fuel level until an average exists.",
        "The first refill is measured from the vehicle's initial odometer, which is only right if the tank was full when the odometer was recorded.",
      ],
    },
    {
      heading: "Verification and status",
      body: [
        "The web engine's test script passes 21 of 21 on the latest commit: 12 scenarios, including fuel balance consumption, the tank capacity formula, range changing with the odometer and isolation between the car and the motorcycle, plus 9 regression checks. The web app is live on Vercel, deployed from the main branch, with no sign-in yet. The iOS app has its own calculation engine, documented as applying the same rules; it has not been built or run for the project's audit (the audit machine runs Windows) and has no automated tests.",
        "Getting the odometer into the log in the first place, from a photo of the instrument cluster, is covered in a separate article on odometer OCR. The same idea, that a missing value must not quietly become a number, appears in a manufacturing context in [Blank Is Not Zero](/blog/blank-is-not-zero-production-report-inputs).",
      ],
    },
  ],
};
