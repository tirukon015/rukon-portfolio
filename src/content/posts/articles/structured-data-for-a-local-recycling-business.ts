import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "structured-data-for-a-local-recycling-business",
  title: "Structured Data for a Local Recycling Business: Organization, RecyclingCenter and an FAQPage That Matches the Page",
  description:
    "Turning a client's schema requirements into JSON-LD for a Malaysian e-waste service: Organization plus RecyclingCenter, and an FAQPage that mirrors the visible FAQ.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["JSON-LD", "Schema.org", "Local SEO", "FAQPage", "RecyclingCenter", "Malaysia"],
  contentType: "SEO/GEO",
  searchIntent: "informational",
  seoTitle: "JSON-LD for a Local Business: RecyclingCenter + FAQPage",
  location: "Cyberjaya, Malaysia",
  relatedProjects: ["erth"],
  relatedPosts: [
    "porting-a-static-page-to-nextjs-without-visual-drift",
    "one-json-ld-graph-person-referenced-by-id",
    "verifying-a-static-site-you-built-by-hand",
    "writing-a-page-ai-answer-engines-can-quote",
    "canonical-urls-apex-www-308-sitemap-redirects-nextjs",
  ],
  sections: [
    {
      heading: "The starting point: a page with no structured data",
      body: [
        "ERTH is an e-waste collection and recycling service in Malaysia, with a drop-off point in Cyberjaya and doorstep pickup across several areas. I built its production homepage from a design the client had approved as final. When the build started, the page had no canonical URL, no social metadata and no structured data at all.",
        "The client's requirements document specified what the search layer should say: the title tag, the meta description, a website name and alternate name, the organisation's description, logo, URL, email, phone and address, the address format, \"Use Multiple Locations: No\", and a business type of `RecyclingCenter`. The strategy was theirs. My job was to turn those fields into correct Schema.org markup that matched the page, and to make sure it stayed correct.",
        "This article is for developers doing the same for a small local business: a single location, a service area wider than the address, and an FAQ that customers actually read.",
      ],
    },
    {
      heading: "One node, two types: Organization and RecyclingCenter",
      body: [
        "`RecyclingCenter` is a Schema.org type under `LocalBusiness`, which fits the drop-off point. But the business is also an organisation with a brand name, an alternate name and a legal name, and most of its customers never visit the premises. Rather than choosing, the node carries both types:",
        {
          type: "code",
          lang: "json",
          code: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": [\"Organization\", \"RecyclingCenter\"],\n  \"name\": \"ERTH\",\n  \"alternateName\": \"Electronic Recycling Through Heroes\",\n  \"legalName\": \"...\",\n  \"url\": \"https://erth.app/\",\n  \"logo\": \"https://erth.app/logo.png\",\n  \"address\": { \"@type\": \"PostalAddress\", \"addressLocality\": \"Cyberjaya\", \"addressRegion\": \"Selangor\", \"addressCountry\": \"MY\", \"...\": \"...\" },\n  \"areaServed\": [\"Kuala Lumpur\", \"Petaling Jaya\", \"Shah Alam\", \"Klang Valley\", \"Johor Bahru\", \"Penang\"],\n  \"sameAs\": [\"...\"]\n}",
          caption: "Shape of the shipped node, with contact fields elided. The live page carries description, email, telephone, the full street address and postal code.",
        },
        "Two requirement fields shaped the markup more than they appear to. \"Use Multiple Locations: No\" means one `PostalAddress` for the Cyberjaya premises, not a list of branches. The areas the service collects from are a different fact, so they go in `areaServed` as place names. Mixing the two, by inventing addresses for areas served, would have described branches that do not exist.",
        "The address follows the requirements' own format field by field: street address, locality, postal code, region, and country as the ISO code `MY`. The page also declares `lang=\"en-MY\"` and an `og:locale` of `en_MY`, so the language signal matches the audience in every layer.",
      ],
    },
    {
      heading: "An FAQPage that mirrors the visible FAQ",
      body: [
        "The second block is an `FAQPage` with sixteen `Question` nodes, each with an `acceptedAnswer`. The rule is that every question in the markup must be a question a reader can see on the page, with the same answer; search engines' structured-data guidelines ask for the same thing. FAQ markup that says more than the page, or something different, is describing a page that does not exist.",
        "To check it rather than assume it, I compared the shipped HTML with the markup: all sixteen question names in the JSON-LD appear in the visible page content. The FAQ itself grew from the eleven questions in the source document to sixteen during the requirements-compliance work, adding questions about accepted electronics, unlisted devices, booking, business collection and what happens after collection. Those were added as visible questions and answers, and the markup describes them; it never carries a question the page does not.",
        {
          type: "callout",
          label: "A limitation carried into the markup",
          text: "One eligibility rule, what qualifies for free pickup, is stated two ways in the client-approved copy. It was raised with the client rather than resolved by the developer, and it remains open. Because the FAQPage mirrors the page, the markup carries the page's answer exactly as supplied; it cannot be more consistent than the copy it describes.",
        },
      ],
    },
    {
      heading: "A WebSite node for the site name",
      body: [
        "The first two blocks came across from the approved design file. The third, a `WebSite` node, was added because the requirements named a website name and a website alternate name, and `WebSite` is where those belong. It states `name`, `alternateName`, `url` and `inLanguage: \"en-MY\"`.",
        "Looking back with the approach I later used on this portfolio, there is one thing I would change. The three blocks are separate script tags, and the WebSite node's `publisher` is a small inline Organization rather than a reference to the main node by `@id`. Parsers can still reconcile them by name and URL, but a shared `@id`, as described in [One Person, Referenced Everywhere](/blog/one-json-ld-graph-person-referenced-by-id), would state the relationship instead of leaving it to inference.",
      ],
    },
    {
      heading: "Canonical and content that a crawler can read without JavaScript",
      body: [
        "The canonical URL, `og:url`, `robots.txt` and `sitemap.xml` all name the client's domain, `https://erth.app/`, as the requirements specified. They are deliberately independent of the Vercel deployment URL, so they are already right when the custom domain is attached. The reasoning is the same as in [Canonicals That Pointed at a Redirect](/blog/canonical-urls-apex-www-308-sitemap-redirects-nextjs): a canonical names the URL you want indexed, not the one the build ran on.",
        "All page content, the FAQ answers included, is in the static HTML. Nothing depends on JavaScript to be crawlable, which matters for the FAQ in particular: each question is an `h3` followed by its answer as a paragraph, in the HTML the server sends, not text fetched or rendered on demand.",
      ],
    },
    {
      heading: "Keeping it correct after launch",
      body: [
        "Structured data is read only by machines, so a broken block is invisible to every human reviewer. The post-build script in the repository parses every JSON-LD block and fails the build if one does not parse; the rest of that script is described in [Verifying a Static Site You Built by Hand](/blog/verifying-a-static-site-you-built-by-hand). What a parse check cannot do is tell whether the FAQ markup still matches the FAQ on the page. That comparison is the one I would add next, because the FAQ is the part of the page most likely to be edited.",
        "For a local business the checklist comes out short: one address for one location, service areas as `areaServed`, a type that fits the premises alongside Organization, an FAQPage generated from or checked against the visible FAQ, and a canonical on the business's own domain. The rest of the build is in the [ERTH case study](/work/erth/case-study).",
      ],
    },
  ],
};
