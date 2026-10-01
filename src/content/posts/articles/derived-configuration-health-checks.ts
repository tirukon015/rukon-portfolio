import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "derived-configuration-health-checks",
  title: "Configuration Health You Compute, Not Store: One Model Record Across Three Modules",
  description:
    "How RPOMS merged three definitions of a router model into one record, and flags broken configuration with a pure function instead of an issue table.",
  date: "2026-11-11",
  category: "Building Real Systems",
  tags: ["Master Data", "Data Quality", "Configuration", "TypeScript", "PostgreSQL"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "Derived Configuration Health Checks for Shared Master Data",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "serial-number-model-detection-by-prefix-rules",
    "gapless-monthly-request-numbers-in-postgres",
    "derived-inventory-from-a-ledger-not-a-stored-balance",
    "how-admin-panels-help-manage-operational-data",
  ],
  sections: [
    {
      heading: "The problem: one router model, three definitions",
      body: [
        "In RPOMS, the operations system I built for a router-refurbishment line, a router model used to be described in three places. Inventory had a stock variant with a name. The serial registry had detection rules that named a model as text. The Ecommerce module had a short code printed on each request number. Nothing tied the three together, so they drifted.",
        "The drift caused a real bug. The detection rules spelled a model `TPLink EX230V`, while inventory, and every request raised from it, spelled the same model `TP-Link EX230V`. The transfer check compared names by case and spacing only, so a router the rules had identified correctly was refused for a request for its own model. This article describes how I merged the definitions and how the system now reports configuration problems before they cause a wrong scan. It is for anyone maintaining master data that several modules read.",
      ],
    },
    {
      heading: "One record, and one rule for \"the same model\"",
      body: [
        "A router model is now one row in inventory, and its id is its identity. Detection rules point at that row by id, and the request code is stored on the row itself. Names are still what people type, so one shared function decides when two names mean the same model:",
        {
          type: "code",
          lang: "ts",
          code: `export function modelNameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function findModelByName<T extends { name: string }>(models: readonly T[], name: string): T | null {
  const key = modelNameKey(name);
  if (!key) return null;
  let found: T | null = null;
  for (const m of models) {
    if (modelNameKey(m.name) !== key) continue;
    if (found) return null; // two candidates: refuse to choose
    found = m;
  }
  return found;
}`,
          caption: "src/lib/model-identity.ts.",
        },
        "The key folds case, spaces and punctuation, so `TPLink EX230V`, `TP-Link EX230V` and `tp link ex230v` are one model while two different model numbers stay two. When a name matches more than one model, the function returns nothing rather than guessing. When someone adds a new model name, it is matched against existing models first, so a variant spelling links to the model that already exists instead of creating a second one.",
        "This key is deliberately separate from an older key that groups historical stock lines and keeps punctuation. Widening that one would have merged stock lines that have always been reported separately. The new key decides identity for configuration and changes nothing about how the past is reported.",
      ],
    },
    {
      heading: "Health is a pure function of the configuration",
      body: [
        "The second half is noticing when configuration is broken. The usual approach is an issues table: detect a problem, write a row, and let someone mark it resolved. That table then has to be kept in sync with the data it describes, and it drifts in exactly the way this work was meant to stop.",
        "RPOMS stores no issues. `computeConfigHealth(variants, rules)` takes the router models and the detection rules and returns every problem it can see. It runs on every request that needs it, and an issue disappears the moment the configuration that caused it is fixed. There is no \"mark resolved\" button and nothing that can disagree with the truth.",
        {
          type: "table",
          head: ["Issue", "What it means"],
          rows: [
            ["Duplicate model", "Two inventory models are one model spelled differently"],
            ["Serial prefix missing", "No detection rule names this model"],
            ["Serial length missing", "The model's rules accept a serial of any length"],
            ["Rule names no known model", "A rule's model text resolves to no inventory model, or to several"],
            ["Conflicting rules", "Two rules with the same prefix and length name different models"],
            ["Request code unverified / missing / invalid", "The code is only a suggestion, cannot be suggested safely, or has the wrong shape"],
          ],
          caption: "The eight issue codes, grouped. All are configuration issues only.",
        },
        "Operational refusals are deliberately excluded: an unknown serial, short stock or a full month is answered by the action that ran into it, at that moment, and never becomes a badge here.",
        "Each issue has a stable id of the form `module:code:subject`, where the subject is the model, the rule, or the set of conflicting rules. One underlying problem is one id however many screens show it, and badges count ids, so a conflict between two models is not counted twice. The function is shared with the browser. The screens that fix an issue re-run the same function the navigation badge uses, so a fix cannot clear the list and leave the badge showing.",
      ],
    },
    {
      heading: "Where issues appear, and who fixes them",
      body: [
        "Issues show on the Super Admin configuration tabs, as a one-line strip at the top of each affected module saying how many there are and where to fix them, and in a Needs attention list with the fix beside each entry. The strip is a status region, so a screen reader announces the new count after a fix without moving focus. Every configuration write is Super Admin only.",
        "Request codes follow a stricter rule than the other settings, because they print on documents. A code from the agreed table, or one a Super Admin typed and saved, counts as confirmed. A code the program suggested from the model's name counts only once a Super Admin accepts it. The Ecommerce team cannot raise a request for a model until its code is confirmed. A suggestion that would collide with another model's code is not offered at all.",
      ],
    },
    {
      heading: "Letting the database refuse what the screen should refuse",
      body: [
        "A model that still has detection rules pointing at it must not be deletable, or those rules would silently orphan. The screen refuses it. So does the database: the rule-to-model link is a foreign key with `ON DELETE RESTRICT`. It was added as `NOT VALID` and then validated, and existing rules were linked only where the rule's model name matched exactly one model. Everything else was left unlinked and shows up as a health issue, instead of being guessed.",
        "The schema change was additive: new nullable columns, an index and the constraint. Before release, a test built a production-shaped database with every table filled, applied the migration, and asserted that every existing value was identical afterwards. The feature went to production in the 28 September 2026 release. Its configuration screens are Super Admin only and, like the registry, their writes sit behind the production write lock.",
      ],
    },
    {
      heading: "What generalises",
      body: [
        {
          type: "list",
          items: [
            "Give shared master data one record and one identity, and make every module point at it by id.",
            "Define \"the same thing\" once, in a pure function both the browser and the server use, and refuse to choose when there are two candidates.",
            "Compute data-quality issues from the data instead of storing them. Stored issues drift; derived ones cannot.",
            "Keep configuration issues separate from operational refusals.",
            "Back the screen's rules with database constraints, and never backfill a link you would have to guess.",
          ],
        },
        "The detection rules this validates are described in [Detecting a Device Model From Its Serial Number](/blog/serial-number-model-detection-by-prefix-rules), and the request codes appear in [Monthly Request Numbers That Never Skip](/blog/gapless-monthly-request-numbers-in-postgres). Both are part of [RPOMS](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
