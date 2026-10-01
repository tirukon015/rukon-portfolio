import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-json-ld-graph-person-referenced-by-id",
  title: "One Person, Referenced Everywhere: A JSON-LD @graph for a Personal Site",
  description:
    "How this site declares its Person and WebSite nodes once and points every article, project page and the homepage at them by @id, and what that forced me to leave out.",
  date: "2026-10-01",
  category: "Full-Stack Development",
  tags: ["JSON-LD", "Schema.org", "Structured Data", "Next.js", "Technical SEO"],
  contentType: "SEO/GEO",
  searchIntent: "informational",
  seoTitle: "JSON-LD @graph With @id References in Next.js",
  relatedProjects: [],
  relatedPosts: [
    "canonical-urls-apex-www-308-sitemap-redirects-nextjs",
    "structured-data-for-a-local-recycling-business",
    "gating-a-cv-download-behind-a-server-signed-grant",
    "nextjs-opengraph-metadata-replaces-not-merges",
  ],
  sections: [
    {
      heading: "The problem: three copies of the same person",
      body: [
        "A personal site has one author, and that author appears in structured data over and over: as the author of every article, as the publisher of the site, as the subject of the homepage, as the creator of every project page. The easy way to write that is to paste a full Person object into each page's JSON-LD. The result is a dozen lookalike Person nodes that a parser has no reason to treat as the same entity, each one a place for a job title or a profile link to drift out of date.",
        "This note is for anyone adding Schema.org markup to a Next.js site with more than one page type. It describes how this portfolio does it: one Person and one WebSite node, declared once, and every other node pointing at them by `@id`.",
      ],
    },
    {
      heading: "Declare the entities once, give them stable ids",
      body: [
        "Two ids are defined in `src/lib/seo.ts`, both built from the canonical host rather than whatever host a request came in on:",
        {
          type: "code",
          lang: "ts",
          code: "export const PERSON_ID = `${BASE_URL}/#person`;\nexport const WEBSITE_ID = `${BASE_URL}/#website`;",
          caption: "From src/lib/seo.ts. BASE_URL is https:// plus the canonical host.",
        },
        "The root layout emits both nodes on every page, wrapped in a single `@graph` document by a small `graph()` helper. The Person node carries the name, job title, employer, a Cyberjaya postal locality, a `knowsAbout` list and `sameAs` links to the GitHub, LinkedIn and X profiles. The WebSite node carries the site name, `inLanguage: \"en-MY\"` and `publisher: { \"@id\": PERSON_ID }`.",
        "The fragment ids (`#person`, `#website`) are not anchors on the page. They are identifiers. What matters is that they are absolute, identical everywhere, and built from the host that actually answers 200, which on this site is the www host. The reasons for that last part are in a separate article on canonical URLs.",
      ],
    },
    {
      heading: "Every page type points at the same node",
      body: [
        "Each route then adds one node of its own and refers to the shared entities instead of repeating them:",
        {
          type: "table",
          head: ["Route", "Node type", "References"],
          rows: [
            ["/", "ProfilePage", "mainEntity → #person, isPartOf → #website"],
            ["/blog/[slug]", "BlogPosting + BreadcrumbList", "author and publisher → #person, isPartOf → #website"],
            ["/work/[slug]", "CreativeWork + BreadcrumbList", "author and creator → #person"],
            ["/work/[slug]/case-study", "TechArticle + BreadcrumbList", "author and creator → #person"],
          ],
          caption: "Person and WebSite are declared in the layout; routes only reference them.",
        },
        "The BlogPosting node is the richest. Its `@id` is the article's own canonical URL, and it carries the headline, the description, the generated share image, `datePublished` and `dateModified` in Malaysian time, the category as `articleSection`, the tags as `keywords`, a word count computed from the body blocks, and an `about` list naming the projects the article is drawn from, each with its project URL. That last field is how an article about a label printer says, in machine-readable form, which system it is about.",
        {
          type: "code",
          lang: "ts",
          code: "author: { \"@id\": PERSON_ID },\npublisher: { \"@id\": PERSON_ID },\nisPartOf: { \"@id\": WEBSITE_ID },",
          caption: "The three lines that replace a pasted Person object on every article.",
        },
      ],
    },
    {
      heading: "What the shared node forced me to leave out",
      body: [
        "Declaring the Person once has a consequence that is easy to miss: whatever goes into it is published on every page. That includes the CV page, which releases contact details only after a request form. An email address in the Person node would have put the address into the page source of the very page designed to gate it.",
        "So `email` is intentionally absent. Schema.org does not require it, and the site still offers contact through the form and the footer link. The comment in `personSchema()` records the reason, so nobody adds it back to make a validator happier. The mechanism behind the gate itself is described in [Gating a CV Download Behind a Server-Signed Grant](/blog/gating-a-cv-download-behind-a-server-signed-grant).",
        "The general rule is that a node emitted from a layout inherits the privacy requirements of the most sensitive page under that layout.",
      ],
    },
    {
      heading: "Structured data has to mirror the visible page",
      body: [
        "The homepage used to carry an FAQPage node alongside the ProfilePage. When the FAQ section was removed from the homepage, the node was removed with it. A comment in `src/app/page.tsx` says why: structured data has to describe what a reader can see, and the questions were no longer on the page.",
        "It would have been easy to leave the node in place. Nothing breaks, no build fails, and a validator still reports a well-formed FAQPage. That is exactly why it needed deciding deliberately: markup describing content that is not on the page is the kind of drift nothing catches. The same principle drove the sixteen-question FAQPage on the ERTH homepage, where every question in the markup is also a question on the page, covered in the [ERTH case study](/work/erth/case-study).",
      ],
    },
    {
      heading: "Rendering it so a crawler receives it",
      body: [
        "The JSON-LD component is a server component that writes a `<script type=\"application/ld+json\">` tag into the HTML, so the markup is in the document a crawler downloads rather than appearing after hydration. One detail is worth copying: every `<` in the serialised JSON is replaced with `\\u003c`. A string in the data that happened to contain `</script>` would otherwise close the tag early and turn the rest of the payload into page content.",
        {
          type: "code",
          lang: "tsx",
          code: "dangerouslySetInnerHTML={{\n  __html: JSON.stringify(data).replace(/</g, \"\\\\u003c\"),\n}}",
          caption: "From src/components/seo/json-ld.tsx.",
        },
        "If you are adding structured data to a multi-page site, the order I would suggest is: pick the canonical host, define the shared entities with absolute ids, make every page node reference them, and then read the Person node while pretending to be the most privacy-sensitive page on the site. For a static page, add a build step that parses every JSON-LD block, as described in [Verifying a Static Site You Built by Hand](/blog/verifying-a-static-site-you-built-by-hand).",
      ],
    },
  ],
};
