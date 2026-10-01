import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "making-an-invalid-config-state-unrepresentable-in-postgres",
  title: "One Checked Value Instead of Two Booleans: Making a Bad Config Unrepresentable",
  description:
    "Two on/off flags allow a state with no correct behaviour: both off. Storing the enabled set as one CHECK-constrained value and validating the resulting state instead.",
  date: "2026-12-31",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "Data Modelling", "Validation", "Configuration", "FastAPI"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Unrepresentable Invalid State With a Postgres CHECK",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "when-not-to-fall-back-to-another-ai-provider",
    "schema-skew-degrade-one-migration-at-a-time",
    "one-pydantic-schema-two-llm-vendors-structured-output",
  ],
  sections: [
    {
      heading: "The problem: two switches, four states, one of them nonsense",
      body: [
        "[ResearchForge](/work/researchforge) can analyse papers with two AI providers, Anthropic and Groq. The owner chooses which is primary, the other becomes the automatic fallback, and the owner can also switch a provider off entirely. The obvious storage for \"is each provider enabled\" is two boolean settings. Two booleans have four combinations, and one of them, both off, has no correct behaviour: every analysis would fail. This is a short design note on keeping that state out of the database rather than relying on code to remember to check for it.",
      ],
    },
    {
      heading: "Store the set, and constrain the set",
      body: [
        "Owner settings live in a key/value table. Instead of two boolean rows, there is one row, `enabled_ai_providers`, holding the set of enabled providers, with a CHECK constraint that lists every legal value and has no empty option:",
        {
          type: "code",
          lang: "sql",
          code: `ALTER TABLE system_settings ADD CONSTRAINT system_settings_enabled_providers
    CHECK (
        key <> 'enabled_ai_providers'
        OR value IN ('anthropic', 'groq', 'anthropic,groq')
    );`,
          caption: "From migration 006 (wrapped in a guard so re-running it is safe).",
        },
        "Preventing \"both off\" across two rows would need a trigger, or application code that every writer remembers to call. A single value with a closed list makes the bad state unrepresentable: the database refuses it, including from a hand-edited row in the Supabase dashboard. The constraint carries a comment saying exactly that, so the next person to read the schema knows the empty set is excluded on purpose.",
        "The constraint is keyed on `key`, so other settings in the same table are unaffected. It was added alongside the earlier constraint that limits the primary provider to two values, rather than rewriting it; PostgreSQL applies both, so neither can weaken the other. The migration inserts the default, both enabled, with `ON CONFLICT DO NOTHING`, so applying it changes no behaviour and never overwrites an owner's choice.",
      ],
    },
    {
      heading: "Validate what the configuration would become",
      body: [
        "One rule spans two rows and the database does not enforce it: the primary provider must be one of the enabled ones. That lives in the API, and the way it is checked matters.",
        "Validating each field on its own would reject a perfectly sensible request: \"make Claude the primary and switch Groq off\". Taken one at a time, switching Groq off while it is primary is invalid. So the endpoint first computes what the configuration would become from the current values and the request, then checks the invariants against that resulting state:",
        {
          type: "list",
          ordered: true,
          items: [
            "At least one provider stays enabled. (The CHECK already guarantees this; the API checks too so it can explain itself.)",
            "The primary is in the enabled set. If not, the refusal names the fix: make the other provider primary first, then disable this one.",
          ],
        },
        "Only then are the changed values written. An honest caveat: the primary and the enabled set are two rows written by two separate requests, not one transaction. A failure between the two writes could leave a combination the API would have refused, and nothing in the database prevents it. The empty set is impossible; this second rule is only as strong as the code path that writes it.",
      ],
    },
    {
      heading: "Enforced where it is used, too",
      body: [
        "The same idea continues into the code that uses the setting. The provider router is built per request from the enabled set, and a disabled provider is never constructed, so no branch inside the router can reach it, as primary or as fallback. A disabled primary is reported as a configuration error, because nothing can run. A disabled fallback is not an error at all; the analysis runs on the primary alone and, if the primary fails, its own error surfaces instead of the work moving silently to a vendor the owner excluded.",
        "A test asserts that a disabled provider's call count is zero even when the primary fails with an error that would normally trigger the fallback. How the fallback itself is scoped is in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider).",
        "The pattern is not specific to AI providers. When a pair of flags has a combination your system cannot handle, store the combination as one value, constrain it in the database, and validate the resulting state rather than each field. More on the system is in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
