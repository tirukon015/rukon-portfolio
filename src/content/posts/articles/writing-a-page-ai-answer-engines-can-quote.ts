import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "writing-a-page-ai-answer-engines-can-quote",
  title: "Writing a Page an AI Answer Engine Can Quote Correctly: GEO on a Locked Design",
  description:
    "Implementing a GEO requirement on a locked design: test the questions visitors ask, make answers self-contained, attribute claims, and escalate contradictions.",
  date: "2026-10-02",
  category: "UI/UX & Product",
  tags: ["GEO", "AI Search", "Content Accuracy", "Technical SEO", "Local Business", "Malaysia"],
  contentType: "SEO/GEO",
  searchIntent: "informational",
  seoTitle: "GEO in Practice: Making a Page AI-Answerable",
  location: "Cyberjaya, Malaysia",
  relatedProjects: ["erth"],
  relatedPosts: [
    "structured-data-for-a-local-recycling-business",
    "rebuilding-a-design-prototype-as-a-production-website",
    "verifying-a-static-site-you-built-by-hand",
  ],
  sections: [
    {
      heading: "The requirement: be answerable, not just rankable",
      body: [
        "The ERTH homepage, for a Malaysian e-waste collection and recycling service, came with a requirements document that included a section headed \"GEO / AI search readability\". It asked for the existing content to be easy for search engines and AI systems to understand, using clear, direct answers to questions such as what ERTH collects, where it collects, how pickup works, what qualifies for free pickup, whether broken electronics are accepted, what happens after collection, how data-bearing devices are handled and whether businesses are served.",
        "It set two constraints in the same breath: do this primarily by improving existing copy and headings, and do not create a visually repetitive page just to add keywords. On top of that, the design was locked. The client had approved one design file as final, and the brief was to ship exactly that.",
        "This article is for developers and content owners asked to make a page \"AI-ready\" who want something more concrete than keyword lists. It describes how that requirement was implemented and checked. It makes no claim about how any AI system has since answered questions about ERTH; that was never measured.",
      ],
    },
    {
      heading: "Turn the requirement into a test",
      body: [
        "\"Make content AI-readable\" cannot be checked. \"Does this page answer this question on its own?\" can. The requirements-compliance audit in the repository did exactly that: nine questions, each matched to the section that should answer it, each marked on whether the answer is self-contained.",
        {
          type: "table",
          head: ["Question", "Answered self-containedly?"],
          rows: [
            ["What does ERTH collect?", "Yes, the accepted-electronics section"],
            ["Does ERTH accept broken electronics?", "Yes, the rewards section heading and the FAQ"],
            ["What qualifies for free pickup?", "No: contradictory"],
            ["Where does ERTH collect?", "Yes, the service-areas section"],
            ["How does pickup work?", "Yes, the how-it-works steps"],
            ["How do I book?", "Yes, the call to action and step one"],
            ["What happens after collection?", "Yes, the process section"],
            ["How is data handled?", "Yes, the data section"],
            ["Does ERTH serve businesses?", "Yes, the business sections"],
          ],
          caption: "From the requirements-compliance audit, section 4.13, paraphrased.",
        },
        "Eight passed. The one that failed did not fail for lack of content. It failed because the page said two different things, which is the more important finding and is covered below.",
      ],
    },
    {
      heading: "Write blocks that survive being quoted alone",
      body: [
        "An answer engine rarely quotes a page. It quotes a passage. So the useful unit of writing is a block that still makes sense when everything around it is gone.",
        "The clearest example on the page is the block about disposal versus recycling. It defines both terms, states the difference, and says why it matters, inside the block itself. A system that extracts only that block still produces a correct answer; it does not depend on a heading two sections earlier to supply the subject.",
        "Headings did the same work at a larger scale. The page has one `h1`, an `h2` per section and `h3`s on cards, so each answer sits under a heading that names its subject, and each FAQ question is its own `h3`. The FAQ was extended from the objections customers actually raise rather than from a keyword list: questions about accepted electronics, devices that are not listed, how booking works, business collection and what happens after collection were added, taking it to sixteen questions, which the structured data then mirrors. That part is described in [Structured Data for a Local Recycling Business](/blog/structured-data-for-a-local-recycling-business).",
      ],
    },
    {
      heading: "Attribute every claim, because unattributed and invented look the same",
      body: [
        "To a person reading a homepage, \"award-winning\" is a mild boast. To a system assembling an answer, an unattributed claim and a fabricated one are indistinguishable: neither says who made it or where it can be checked. The requirements set the rule for recognition claims explicitly: use the verified recognitions and wording where supported, and anything not supported by the source must be verified before publication, or removed or softened.",
        "In practice that meant restructuring recognition claims to carry three things: who recognised the achievement, when, and where it can be verified. The audit also flagged reviews: the design used named reviews, while the requirements supplied unattributed quotes, and swapping new text under real names would have misattributed words to people. That went to the client as a decision.",
        "The working rule across the page was: verify, soften, or omit. No award, statistic, certification, testimonial or coverage claim was introduced that the source material did not support, and absolute claims such as \"100% safe\" were not used without support.",
      ],
    },
    {
      heading: "Contradictions go to the client, not into the code",
      body: [
        "The content consistency pass found six contradictions or unsupported claims. Two show why this matters more for machine readers than for human ones.",
        "The first is the free-pickup rule. The copy stated it in two incompatible ways in different places, and the audit noted that the requirements document itself stated both. A human visitor might notice and ask. An answer engine will pick one and state it confidently. It was raised for a client ruling rather than resolved by the developer, because choosing a reading of a business rule is not a developer's call. It remains open, and both statements are carried through as supplied. This is the question in the table above that fails, and it will keep failing until the copy agrees with itself.",
        "The second was a headline figure that appeared to confuse two units: a large number presented as money paid out, where the cited source reported it as a weight recycled. On a page, that is a typo waiting to be noticed. Quoted by a machine, it becomes a confident false statement about the business. Catching it before publication mattered more than any markup change in the engagement.",
        {
          type: "callout",
          label: "What GEO work cannot fix",
          text: "No amount of structure makes a contradictory page answerable. If two sections disagree, the most useful output of the work is the list of disagreements, sent to the person who can decide.",
        },
      ],
    },
    {
      heading: "Doing it inside a locked design",
      body: [
        "Every change above had to fit a design that could not move. That ruled out the usual shortcut of adding a new \"Answers\" section. The audit planned every change at that level: copy inside existing blocks, heading wording, new rows in the existing FAQ list, a citation line inside the existing award cards, and navigation anchors for sections that an internal-linking pass found unreachable from the menu. How the design lock shaped the rest of the build is in [Rebuilding a Design-Tool Prototype as a Production Website](/blog/rebuilding-a-design-prototype-as-a-production-website).",
        "The approach generalises: write down the questions real visitors ask, check each against the page, make the answering block self-contained, attach a source to every claim, and treat contradictions as findings for the owner rather than problems to paper over. The full build, including what remains open, is in the [ERTH case study](/work/erth/case-study).",
      ],
    },
  ],
};
