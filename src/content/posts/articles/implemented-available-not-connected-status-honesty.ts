import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "implemented-available-not-connected-status-honesty",
  title: "Implemented, Available, Not Connected: Writing Honest Status Into Project Docs",
  description:
    "\"It exists in the repository\" and \"it runs in production\" are different claims. The three-state status model I use across my projects, with real rows from each.",
  date: "2026-10-02",
  category: "Developer Journey",
  tags: ["Documentation", "Project Status", "Engineering Practice", "Portfolio", "TypeScript"],
  contentType: "Explainer",
  searchIntent: "informational",
  seoTitle: "Honest Project Status: Implemented vs Built vs Live",
  relatedProjects: ["rpoms", "rpoms-ai", "rpoms-print-engine", "spendrop", "erth"],
  relatedPosts: [
    "testing-without-paid-apis-or-hardware-and-where-fakes-lie",
    "production-write-lock-read-only-mode-nextjs-middleware",
    "why-system-maintenance-matters-after-deployment",
    "a-vision-model-that-only-observes",
  ],
  sections: [
    {
      heading: "The problem: \"done\" means three different things",
      body: [
        "A feature can be finished in the code, tested, merged and deployed, and still not be in use. It can be deployed but switched off. It can be written but only ever run against a simulator. When a project page, a README or a CV collapses all of that into \"built\" or \"done\", a technical reader who checks will find the gap, and after that they discount everything else on the page.",
        "This article is for developers who document their own systems, for a portfolio, a handover or a status report. It describes the small model I use to keep those claims separate, with real entries from my projects.",
      ],
    },
    {
      heading: "Three states, defined by what is true in production",
      body: [
        "Every project on this site carries a status table, and every row has one of three states. The type is deliberately small, and its comment carries the rule:",
        {
          type: "code",
          lang: "ts",
          code: "/**\n * Where a capability actually stands. Kept explicit because \"it exists in the\n * repository\" and \"it runs in production\" are different claims, and conflating\n * them is the fastest way to lose a technical reader's trust.\n */\nexport type CapabilityState = \"implemented\" | \"available\" | \"not-connected\";\n\nexport type ProjectStatusItem = {\n  label: string;\n  state: CapabilityState;\n  detail: string;\n};",
          caption: "From src/content/projects.ts on this site.",
        },
        {
          type: "table",
          head: ["State", "Shown as", "Means"],
          rows: [
            ["implemented", "Implemented", "Live and in use. The working rule is simply: implemented means live."],
            ["available", "Built, not live", "The code exists and is tested, but something stands between it and real use: a lock, a switch, missing hardware validation, a missing deployment."],
            ["not-connected", "Not connected", "Not built, not wired, or not activated. Including these is the point: they mark the edge of the claim."],
          ],
        },
        "The `detail` field is required. A state on its own is a label; the detail says why, in one or two sentences a reader can check.",
      ],
    },
    {
      heading: "Real rows, and why each sits where it does",
      body: [
        "The model only earns its keep when the answer is uncomfortable. These are rows from the live project pages.",
        {
          type: "list",
          items: [
            "RPOMS, the operations system for a router-refurbishment line: the dashboard and the daily production report are implemented, live in production. The serial registry, packing, delivery and paperwork, workforce and inventory modules are available: complete, but held behind a deployment-level write lock pending programme sign-off, and production shows those screens as under development until then. A demo would make them look live. They are not, and the table says so. The lock itself is described in [A Production Write Lock in Next.js Middleware](/blog/production-write-lock-read-only-mode-nextjs-middleware).",
            "RPOMS AI, a photo-inspection system: the public checker and admin area are implemented. Self-hosted inference through the gateway is available: verified end to end on local hardware, usable only while that machine and tunnel are running. \"Active model in production\" is not connected: no model is activated in the production database, so a production check answers that the AI check is unavailable. \"Use on the refurbishment line\" is also not connected.",
            "RPOMS Print Engine: scan-to-print, the queue and templates are implemented, verified on the real printer once with one label. Continuous printing on the physical printer is available, not implemented, because the multi-label runs have only been done against the simulated printer.",
            "SpenDrop, an iOS expense tracker: the optional Supabase backup is available, with the note that it was tested against a simulated server and its policies have not yet run on a live project.",
            "ERTH homepage: one row is not connected, and it is not code at all. The free-pickup eligibility rule is stated two ways in the client-approved copy; it was raised for a client ruling and is carried through as supplied.",
            "rukon-link: notifications for new contact requests are not connected, with the detail \"Not built: new requests appear only in the admin inbox.\"",
          ],
        },
        "Two of those rows carry most of the value. The RPOMS AI row stops a reader assuming a deployed AI system is making decisions on a production line. The Print Engine row stops \"tested\" being read as \"tested on hardware\". The reasoning behind that second distinction is in [Testing Without Paid APIs or Hardware](/blog/testing-without-paid-apis-or-hardware-and-where-fakes-lie).",
      ],
    },
    {
      heading: "Honesty runs in both directions",
      body: [
        "Status drift is not always overclaiming. When I audited this site's content against the deployed projects in September 2026, the ResearchForge entry was understating the system: it said there were no accounts, nothing stored and no database connected. The deployed health endpoint reported authentication and the library both enabled, so accounts, per-account libraries and recorded provenance moved to implemented. The same audit found an ERTH article still saying the build was in progress after it had been deployed.",
        "An out-of-date \"not yet\" is as wrong as an early \"done\", and it costs credibility with the same reader. The fix in both cases was the same: re-verify against the running system, not against what the page previously said.",
      ],
    },
    {
      heading: "Making it hard to drift",
      body: [
        "A status model only works if updating it is part of the work. Three habits make that likely.",
        "First, the state lives next to the description it qualifies. On this site every project's status table is in the same object as its case study, so editing one without looking at the other is awkward.",
        "Second, there is a written rule. The instructions for working on this repository say that status states must be honest and that implemented means live, alongside \"no invented metrics or features\". Writing it down means it applies to every edit, not only to the ones made on a careful day.",
        "Third, evidence goes in the detail. \"Released to production on 28 September 2026, with CI passing on main\" can be checked. \"Production-ready\" cannot. If I cannot write a checkable sentence for a row, the row is probably in the wrong state.",
        "The same three states would work in a README, a handover document or a weekly report. The labels matter less than the commitment that a reader can tell, for every capability, whether it is running, built and waiting, or not there. The [RPOMS AI case study](/work/rpoms-ai/case-study) is the clearest example of a page where most of the value is in that distinction.",
      ],
    },
  ],
};
