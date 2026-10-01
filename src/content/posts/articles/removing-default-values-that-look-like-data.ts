import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "removing-default-values-that-look-like-data",
  title: "Defaults Are Claims: Removing Placeholder Numbers That Looked Like Measurements",
  description:
    "A 75% tank, a 10 km/L economy, a hardcoded user id: defaults in DriveKeep that rendered as real data, what replaced them, and the same rule in SpenDrop.",
  date: "2026-12-24",
  category: "UI/UX & Product",
  tags: ["Data Quality", "Empty States", "Product Design", "Swift", "TypeScript", "Null Handling"],
  contentType: "Experience-led",
  searchIntent: "informational",
  seoTitle: "Why Default Values Can Mislead Users as Real Data",
  relatedProjects: ["drivekeep", "spendrop"],
  relatedPosts: [
    "measured-vs-estimated-fuel-economy-full-tank-method",
    "blank-is-not-zero-production-report-inputs",
    "implemented-available-not-connected-status-honesty",
    "payment-channel-vs-funding-account-apple-pay-reconciliation",
  ],
  sections: [
    {
      heading: "A new car with a 75% tank",
      body: [
        "Add a new vehicle to an early build of [DriveKeep](/work/drivekeep), my fuel and maintenance log, and the dashboard looked healthy straight away: a tank about three-quarters full, an economy figure, an estimated range, and a suggested odometer reading for the next refill. None of it had been measured. The vehicle had no refills at all.",
        "Every one of those numbers came from a default that someone, me, had typed in to make a screen render while the real calculation was being built. Defaults like that feel like scaffolding. On screen they are claims. This article is about finding and removing them, and about the rule that replaced them. It is for anyone building dashboards, calculators or forms where a value might be missing.",
      ],
    },
    {
      heading: "What the defaults were",
      body: [
        "The project's honesty pass happened over three commits in September 2026. Their messages list what was removed, and it is worth seeing how ordinary each one looked:",
        {
          type: "table",
          head: ["Where", "Default", "What it produced"],
          rows: [
            ["Average economy (iOS and web engines)", "25.0 km/L for motorcycles, 10.0 for cars when there was no refill history", "a range and refill target for a vehicle that had never been refilled"],
            ["Fuel balance (both engines)", "a full tank when there were no refills", "together with the economy default: a 100% tank and a 400 km range"],
            ["Fuel gauge card (iOS and web)", "a 75% tank, 75% of capacity in litres, 12 or 15 km/L when stats were missing", "a gauge that read as a real level"],
            ["Stat cards (iOS)", "a hardcoded 350 km range", "a refill target with no measurement behind it"],
            ["Add vehicle (iOS)", "a 40-litre tank when the entry could not be parsed", "invented vehicle data every later estimate inherited"],
            ["Current user (iOS)", "a hardcoded all-zero-plus-one UUID when signed out", "sync would have written real records to a fabricated account"],
          ],
          caption: "From DriveKeep commits b418d76, 72948d7 and e3df6f6.",
        },
        "None of these was a bug in the usual sense. Each made its own screen work. The damage was in how they combined: the economy default and the full-tank default together produced a confident range for a vehicle with no data, and the refill target was computed from that. A default does not stay where you put it; it flows into everything downstream.",
        "The last one is the most dangerous kind. A fallback user id that is only meant to keep a screen from crashing becomes, the moment sync runs, an identity that real records are written under. The fix made the id optional and stopped sync with an explicit not-authenticated state.",
      ],
    },
    {
      heading: "The replacement: make unknown representable",
      body: [
        "Removing a default is not enough if the types cannot express \"unknown\". The engine functions now return `null` (in TypeScript) or `nil` (in Swift) when there is nothing to measure from, and the stats model was changed so an unknown tank level, range or economy is a legal value rather than something every caller has to invent around.",
        {
          type: "code",
          lang: "ts",
          code: `/**
 * Returns null when no completed full-tank refill exists — a placeholder figure
 * would propagate into range, tank level and the refill target.
 */
export function calculateAverageEfficiency(vehicle: Vehicle, refills: Refill[]): number | null {
  const validRefills = refills.filter(
    (r) => r.efficiency != null && r.efficiency > 0 && r.isFullTank && !r.isMissedRefill
  );
  if (validRefills.length === 0) {
    return null;
  }
  // ...weighted average over up to the last ten qualifying refills
}`,
          caption: "From DriveKeep's web engine. The comment states the reason, so the next person does not put the default back.",
        },
        "The interface then says what is true. The tank, range, economy and next-refill cards read \"Not available\", and the recommendation reads \"Add a refill to estimate your next one.\" A form that could not parse a tank size asks for it instead of substituting one. The commit message for the last of these records the iOS build succeeding and the dashboard showing \"Not available\" on the simulator at the time; the iOS app has not been rebuilt since for the project's later audit.",
        "The same pass removed demo seeding. A fresh install used to fill itself with sample records, and the iOS app had a \"Reset Demo Data\" button. Both are gone, so the first-run screen is a real empty state, and a store that could not be read now says so rather than inviting the user to add a vehicle over records that may still exist.",
      ],
    },
    {
      heading: "The trade-off is a less impressive first screen",
      body: [
        "Removing the defaults made a new vehicle look emptier. The first impression went from a full dashboard to a column of \"Not available\" until the first full-tank refill, and I think that is correct. A user who sees a range of 400 km on day one will trust the range on day thirty, and the day-one number was fiction. How the measured figures are then computed, and labelled ACTUAL or ESTIMATED, is in [Measured or Estimated](/blog/measured-vs-estimated-fuel-economy-full-tank-method).",
        "Defaults hide in places a search for magic numbers will not find. In the web app's refill API, a refill whose request omits the full-tank flag is treated as a full tank, which is a default that decides whether economy is computed. In the iOS on-device extraction code, a confidence value the model does not return falls back to 0.95. Both are worth the same scrutiny, and neither has been changed yet.",
      ],
    },
    {
      heading: "The same rule in SpenDrop",
      body: [
        "[SpenDrop](/work/spendrop), my iOS expense tracker, applies the rule to parsing. Every extractor returns nothing rather than guessing: no merchant is better than a heading mistaken for a merchant. The payment channel, how you paid, stays \"Unknown\" when the screen does not say; a card name alone is not taken as proof of how it was used. Accounts show \"Recorded In / Out\" and deliberately have no balance field, because SpenDrop knows what was recorded, not what the bank holds. The reasoning for the channel rule is in [Apple Pay Is Not a Bank](/blog/payment-channel-vs-funding-account-apple-pay-reconciliation).",
        {
          type: "callout",
          label: "A checklist for your own code",
          text: "Search for fallbacks (?? and || in TypeScript, ?? in Swift) on any value the user will read as a fact. For each one, ask: if this fallback is shown, will anyone know it is not real? If not, make the value nullable, show \"Not available\", and say what would make it available.",
        },
        "The DriveKeep web app is live on Vercel with no sign-in; its engine tests pass 21 of 21. SpenDrop is verified on the iOS simulator and is not on the App Store. A related idea from a different domain, that an empty input in a report must not become zero, is in [Blank Is Not Zero](/blog/blank-is-not-zero-production-report-inputs).",
      ],
    },
  ],
};
