import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "serial-number-model-detection-by-prefix-rules",
  title: "Detecting a Device Model From Its Serial Number With Prefix Rules",
  description:
    "How RPOMS and its print engine tell a router's model from its serial: prefix and length rules stored as data, longest prefix first, unknowns flagged.",
  date: "2026-10-06",
  category: "Building Real Systems",
  tags: ["Serial Numbers", "Barcode Scanning", "TypeScript", "Validation", "Operations"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Detect Device Model From Serial Number Prefix Rules",
  relatedProjects: ["rpoms", "rpoms-print-engine"],
  relatedPosts: [
    "derived-configuration-health-checks",
    "barcode-scanner-web-app-scan-paste-and-beep",
    "printing-labels-from-the-browser-over-web-bluetooth",
    "staged-csv-import-for-operational-data",
  ],
  sections: [
    {
      heading: "The problem: a scan gives you a serial, not a model",
      body: [
        "On a refurbishment line, a worker scans a barcode and the system receives a string of characters. What the system needs to know is which router model that is, because stock, packing, labels and paperwork are all organised by model. No manufacturer publishes an API you could call with a serial, and the line cannot stop while someone looks the model up.",
        "The team was already solving this in Excel with a formula that looked at how a serial started and how long it was. RPOMS, the operations system I built for that line, and the RPOMS Print Engine, the label printer I built beside it, both turned that formula into rules. This article covers how those rules work and the mistakes the first versions made. The prefixes in the examples are invented; the real ones are not published.",
      ],
    },
    {
      heading: "A rule is a prefix, an optional length, and a model",
      body: [
        "A rule says: a serial that starts with this prefix and has this exact length belongs to this model. Length matters because different models from the same vendor can share a leading digit or two and differ only in how long the serial is.",
        {
          type: "table",
          head: ["Prefix", "Length", "Model"],
          rows: [
            ["7QA9", "13", "Vendor A model X"],
            ["7QA", "13", "Vendor A model Y"],
            ["7Q", "13", "Vendor A model Z"],
            ["KX", "16", "Vendor B model 1"],
          ],
          caption: "Illustrative rules. A length of 0 in RPOMS means any length.",
        },
        "The rules are stored as data, not code. In RPOMS they live in a table a Super Admin edits on the rules screen, seeded at first from the spreadsheet formula they replaced. A new router model therefore needs a new rule, not a new release, which matters for a line that receives whatever models turn up.",
      ],
    },
    {
      heading: "Longest prefix first",
      body: [
        "With rules like `7QA9` and `7QA`, a serial beginning `7QA9…` matches both. The more specific rule must win. RPOMS sorts the rules by prefix length, longest first, and takes the first rule whose prefix and length both fit:",
        {
          type: "code",
          lang: "ts",
          code: `export function detectModel(serial: string, rules: SerialRule[]): string {
  const s = normalizeSerial(serial).toUpperCase();
  if (!s) return "";
  const ordered = [...rules].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const rule of ordered) {
    const prefix = rule.prefix.toUpperCase();
    if (!prefix) continue;
    const lengthOk = rule.length === 0 || s.length === rule.length;
    if (lengthOk && s.startsWith(prefix)) return rule.model;
  }
  return "";
}`,
          caption: "src/lib/serials.ts in RPOMS.",
        },
        "The function is pure and has no server imports, so the same code runs in the browser, for instant feedback on each scan, and on the server, where it decides what is stored. Normalising removes any whitespace a scanner appends. Duplicate checks use an upper-cased key, which matches how the spreadsheet's COUNTIF treated two serials differing only by case.",
        "The print engine was built separately, and its first version got this wrong. It returned the first active rule in list order, so whether `7QA9…` came out as the right model depended on which rule happened to be listed first. Its seed list also carried example rules, including a regular expression that matched every 13-digit serial. The fix (commit `706d0c0`, 25 September 2026) replaced the seeds with the real rule table and made detection pick the longest matching prefix among active profiles whose length fits. Ties go to list order, and a regular-expression rule is used only when no prefix rule matches. A test reorders the list, short prefixes first, and checks that the longer prefix still wins.",
      ],
    },
    {
      heading: "An unknown serial is kept and flagged, not dropped",
      body: [
        "Some serials match no rule: a model nobody has written a rule for yet, a misread barcode, or a label from the wrong product. Dropping them would lose a physical router from the record. In RPOMS a serial that matches no rule is still stored, with status `invalid`, and shown at the top of the registry list so someone deals with it. A serial already in the registry comes back as `duplicate` and is not stored twice.",
        {
          type: "flow",
          steps: ["Scan", "Normalise", "Duplicate? → duplicate", "Longest matching rule", "Match → ok + model", "No match → invalid, flagged for review"],
          caption: "How RPOMS classifies an accept scan.",
        },
        "Packing takes a stricter view. A serial that is unknown, not accepted or already in another box blocks the box from closing, unless the operator deliberately ticks Close with issues.",
        "The print engine has no registry to fall back on, so it simply prints nothing for an unmatched serial. Its wording mattered more than I expected. Earlier messages said a serial was \"not found\", which suggests a database was checked and the router does not exist. No database is checked; only rules are evaluated. The message is now exactly `No matching detection rule.`, and a test asserts that it never contains \"not found\", \"exist\" or \"database\".",
      ],
    },
    {
      heading: "Keep serials as strings",
      body: [
        "A serial made only of digits looks like a number, and every spreadsheet and many parsers will try to treat it as one. That strips leading zeros and can turn a long serial into scientific notation. Both systems keep serials as strings from the scan onwards. The print engine has a test that passes a serial with leading zeros and lower-case letters through detection and checks that the serial comes back exactly as it was scanned. The same care applies to CSV imports, covered in [Staged CSV Import](/blog/staged-csv-import-for-operational-data).",
      ],
    },
    {
      heading: "What goes wrong when rules are data",
      body: [
        "Storing rules as data moves the risk from the code to the configuration. Two rules with the same prefix and length that name different models conflict, and the result depends on sort order. A rule saved without a length accepts any length and may claim serials it should not. A rule may name a model that inventory spells differently. In RPOMS these are now reported as configuration problems computed from the rules themselves, with the fix shown next to each one. That is a separate topic, covered in the configuration-health article.",
        {
          type: "list",
          items: [
            "Store rules as data so a new model is a configuration change.",
            "Match longest prefix first, and test it with the list deliberately reordered.",
            "Use length as part of the rule, not an afterthought.",
            "Keep unmatched serials, flag them, and say plainly that no rule matched.",
            "Never convert a serial to a number.",
          ],
        },
        "The registry is part of [RPOMS](/work/rpoms); it is complete but held behind the production write lock. The label side is the [RPOMS Print Engine](/work/rpoms-print-engine), and printing itself is covered in [Printing Labels From the Browser Over Web Bluetooth](/blog/printing-labels-from-the-browser-over-web-bluetooth).",
      ],
    },
  ],
  related: [
    { label: "RPOMS case study", href: "/work/rpoms" },
    { label: "RPOMS Print Engine", href: "/work/rpoms-print-engine" },
  ],
};
