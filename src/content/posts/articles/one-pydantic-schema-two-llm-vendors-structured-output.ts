import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-pydantic-schema-two-llm-vendors-structured-output",
  title: "One Pydantic Schema, Two LLM Vendors: Native Parsing vs JSON Mode",
  description:
    "The same Pydantic models drive structured output from Anthropic's native parsing and Groq's JSON mode. Forbidding extra fields, catching truncation, and validating instead of repairing.",
  date: "2026-10-02",
  category: "AI & Automation",
  tags: ["LLM", "Structured Output", "Pydantic", "JSON Schema", "Anthropic", "Groq", "Python"],
  contentType: "AI Engineering",
  searchIntent: "informational",
  seoTitle: "Pydantic Structured Output Across LLM Vendors",
  relatedProjects: ["researchforge"],
  relatedPosts: [
    "making-an-llm-admit-the-paper-does-not-say",
    "when-not-to-fall-back-to-another-ai-provider",
    "testing-an-llm-app-without-calling-paid-apis",
  ],
  sections: [
    {
      heading: "The problem: one response contract, two very different APIs",
      body: [
        "[ResearchForge](/work/researchforge) asks a model for three structured objects per paper: a summary, a research-gap analysis and a literature review. It can route those calls to Anthropic's claude-opus-5 or to Groq's qwen3.6-27b, and the rest of the application must not care which one answered. This article is the mechanics of making one set of Pydantic models the single source of truth for both, for anyone wiring structured output across more than one vendor.",
        "Why the schemas contain explicit ways to decline, and why failing output is discarded, is covered in [Making an LLM Admit the Paper Doesn't Say That](/blog/making-an-llm-admit-the-paper-does-not-say). This is the how.",
      ],
    },
    {
      heading: "Strict models: forbid what you did not ask for",
      body: [
        "Every response model shares one configuration:",
        {
          type: "code",
          lang: "python",
          code: `from pydantic import BaseModel, ConfigDict, Field

# extra="forbid" makes Pydantic emit \`additionalProperties: false\`, which
# strict structured-output modes require.
_STRICT = ConfigDict(extra="forbid")

class ResearchGap(BaseModel):
    model_config = _STRICT

    gap: str = Field(description="The gap, stated in one or two sentences.")
    why_it_matters: str = Field(description="Why addressing this gap would be valuable.")
    evidence: str = Field(description="The wording FROM THE PAPER that supports this gap ...")`,
          caption: "From src/schemas/analysis.py (one description shortened).",
        },
        "`extra=\"forbid\"` does two jobs. It makes `model_json_schema()` emit `additionalProperties: false`, which strict structured-output modes expect, and it makes validation reject a reply carrying fields nobody asked for. Field descriptions are part of the contract too: they end up in the schema the model reads, so they are written as instructions.",
      ],
    },
    {
      heading: "Anthropic: native schema-constrained parsing",
      body: [
        "The Anthropic SDK can take the Pydantic model directly and return a validated instance:",
        {
          type: "code",
          lang: "python",
          code: `response = self._client.messages.parse(
    **self._base_kwargs(system, prompt),
    output_format=output_model,
)
self._check_stop_reason(response)
parsed = response.parsed_output`,
          caption: "From src/rag/llm/anthropic_provider.py, error translation omitted.",
        },
        "Constrained generation removes the most common failure, a reply that is prose, fenced, or almost-valid JSON. It does not remove the need to look at why the model stopped. `_check_stop_reason` rejects two cases before the output is trusted: `refusal`, where the model declined to process the document, and `max_tokens`, where the reply was cut off before it finished. A truncated reply can still arrive as a successful response, so checking the stop reason is not optional. If `parsed_output` is missing or is not an instance of the requested model, it is validated again rather than trusted.",
      ],
    },
    {
      heading: "Groq: JSON mode, the schema in the prompt, then validation",
      body: [
        "Groq serves an OpenAI-compatible API, called here with `httpx` rather than an extra SDK because one endpoint does not justify a dependency. Schema-constrained output is not available for every model there, so the provider does three things:",
        {
          type: "flow",
          steps: [
            "Request response_format json_object, so the reply is syntactically valid JSON",
            "Append the exact JSON Schema from model_json_schema() to the system prompt",
            "Reject finish_reason \"length\" as truncated",
            "Parse, then output_model.model_validate()",
            "Any failure raises LLMResponseError",
          ],
          caption: "The Groq structured path in src/rag/llm/groq_provider.py.",
        },
        "The schema is pasted in verbatim, not described in prose, because a description is a second source of truth that drifts away from the model. The appended instruction also tells the model to use the schema's own way of declining, an empty list or the insufficient-evidence field, instead of inventing content.",
        "One small concession: if the model wraps otherwise valid JSON in a Markdown code fence, the fence is stripped before parsing. That is presentation, not content. The JSON inside is untouched, and if it is not valid the call still fails. There is no regex salvage, no partial object and no repair of a near miss, because a patched-up analysis is an invented one.",
      ],
    },
    {
      heading: "Proving the keys and models actually work",
      body: [
        "Every automated test runs against a fake provider, which keeps the suite free and deterministic but proves nothing about whether a configured model name exists or whether that model can produce structured output. Groq's catalogue changes, and the default model name came from a specification rather than from the live model list.",
        "So there is one opt-in live smoke test per provider, skipped unless `RESEARCHFORGE_LIVE_PROVIDER_TEST=1` is set and that provider's key is present, so it can never fire by accident in CI. Each is one tiny round trip through the structured path specifically, Anthropic's parse and Groq's JSON-then-validate, because a model can pass a plain-text call and still fail every structured one. No key is ever printed; failures name the environment variable.",
      ],
    },
    {
      heading: "What the rest of the code sees",
      body: [
        "Callers invoke `generate_structured(system=..., prompt=..., output_model=Summary)` and get back a validated `Summary` or a project-owned exception. Vendor SDK types appear only inside each provider's own module. That is what lets a router choose between providers, as described in [When Not to Fall Back to Another AI Provider](/blog/when-not-to-fall-back-to-another-ai-provider), without the analysis code learning anything about either of them. The full system is in the [ResearchForge case study](/work/researchforge/case-study).",
      ],
    },
  ],
  related: [{ label: "ResearchForge case study", href: "/work/researchforge/case-study" }],
};
