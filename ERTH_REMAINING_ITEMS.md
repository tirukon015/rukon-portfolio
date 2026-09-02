# ERTH, remaining evidence items

Internal note for the portfolio project. **Nothing in the ERTH project itself was
modified.** This records what could not be safely claimed on `rukon.dev` during
the 2026-09-02 content implementation pass, and what would resolve each item.

Sources read for this assessment:

- `ERTH Homepage rewards restructure-handoff.zip` (full bundle)
- `ERTH Homepage v9.dc.html`, the readable implementation source, 1,506 lines
- `ERTH Homepage (standalone) v12.html` and `v13.html`
- `ERTH v12 - Compliance Audit and Plan.md`
- `uploads/ERTH Homepage v12 - Requirements Compliance Update.md`
- `ERTH - Homepage (1).docx`, `ERTH_Homepage_Development_SEO_Requirements_Update_1.docx`
- `requirements-v2.txt` (partial), `seo-copy.txt` (partial)

---

## 1. Figma evidence, RESOLVED 2026-09-02

**Status:** resolved. Design and prototyping claims restored to the site.

An ERTH Figma prototype was supplied:

```
https://www.figma.com/proto/iCpcSyT0BBks4RGdoihtIp/ERTH-V2.3?node-id=1-2
```

### What was independently verified

I cannot open the file, it is access-restricted, but the file key was tested
against Figma's own responses, which distinguish the two cases:

| Request | Response | Meaning |
| --- | --- | --- |
| `/design/iCpcSyT0BBks4RGdoihtIp/ERTH-V2.3` | **403** | The key resolves to a real file the requester may not access |
| `/proto/iCpcSyT0BBks4RGdoihtIp/...` | 404 | Figma's standard unauthenticated proto response |
| Control: a deliberately invalid key | 404 | Key does not resolve |

The 403 on a real key versus 404 on a bogus one confirms **the file exists**.
Its contents and its authorship are not independently verifiable from outside.

### What that supports, and what it does not

| Claim | Status |
| --- | --- |
| The ERTH interface was worked out as a Figma prototype before implementation | **Supported** |
| Translating that prototype into the production build | **Supported** |
| Design-first process, component vocabulary, responsive-at-design-time | **Supported** |
| **Sole authorship of the ERTH design** | **Not separately supported**, the prototype's existence says nothing about who authored it |

### Action taken

- ERTH case-study role changed to *"UI/UX & Web Developer, design prototyping,
  requirements implementation, technical SEO"*.
- A two-phase "My Role" section added: the Figma prototype and its translation
  into production, then the later requirements-compliance pass.
- A caveat note renders under that section stating this describes involvement
  and translation, **not** sole authorship.
- `Figma` restored to the technical stack (Project-specific tier) and a
  *UI/UX & Design-to-Code* capability restored, anchored to ERTH.
- All four Figma-related blog posts had their retirement and merge plans
  **withdrawn**. See §1a.

### §1a, the four articles, reclassified

| Article | Was | Now | Outstanding edit |
| --- | --- | --- | --- |
| `designing-a-website-in-figma-before-development` | RETIRE | **UPDATE** | Body claims sole design authorship |
| `from-figma-design-to-production-website` | MERGE (target) | **EXPAND** | Sole authorship, plus a stale "still in progress" statement contradicted by the shipped v13/v14 builds |
| `translating-figma-components-into-reusable-code` | MERGE | **UPDATE** | Body claims sole design authorship |
| `designing-for-desktop-and-mobile-before-development` | MERGE | **UPDATE** | Body claims sole design authorship |

**No article body was modified.** All four still contain first-person sole-authorship
wording ("I designed the ERTH website in Figma", "a Figma design I created myself",
"from my own Figma file… since I designed it", "Designing the ERTH website myself").
That wording exceeds what the prototype alone evidences and is recorded in each
article's `planNote` as the edit an UPDATE pass must make.

## 2. Free-pickup eligibility threshold, UNRESOLVED, deliberately not resolved here

**Status:** client decision. Not resolved unilaterally, per instruction.

The requirements document **states the rule two different ways**:

| Location in `ERTH - Homepage (1).docx` | Wording |
| --- | --- |
| Line 61, "Small Orders Welcome" benefit card | "Free pickup can start from just **1 working device or 3 qualifying non-working devices**." |
| Line 221, FAQ, "Is ERTH e-waste pickup free?" | "Free pickup is available when your order includes **at least 3 listed devices**. If you have fewer than 3 listed devices, the pickup fee is **RM50**." |

Both statements are **also present in the shipped implementation**
(`ERTH Homepage v9.dc.html`): the benefit card carries the first, and the visible
FAQ plus the `FAQPage` JSON-LD both carry the second.

The process brief (`ERTH Homepage v12 - Requirements Compliance Update.md`, §4)
instructed that the wording must distinguish "1 qualifying working device OR
3 qualifying non-working devices", which is the reading the shipped FAQ and
structured data do **not** follow.

**Consequence:** one reading of a business rule is currently being served to
search engines and AI systems inside `FAQPage` structured data while the other
appears in visible copy on the same page.

**Action taken:** the ERTH case study on `rukon.dev` describes this as an item
raised for a client decision and still open. It is **not** described as resolved,
and neither reading is asserted as correct. See the `note` on the
"Content accuracy" section and the `not-connected` status row in
`src/content/projects.ts`.

**To resolve:** an ERTH ruling on which rule is correct, then a single
page-wide correction covering the benefit card, the visible FAQ and the
`FAQPage` JSON-LD together.

---

## 3. Compliance-audit authorship framing, RESOLVED CAUTIOUSLY

**Status:** wording chosen conservatively; no further evidence required, but the
decision is worth recording.

`ERTH Homepage v12 - Requirements Compliance Update.md` is not a client
requirements document. It is a 24-section instruction brief written for a coding
agent, "DO NOT redesign the website", "Create an internal checklist of every
requirement", "Produce an internal compliance matrix", "Anything that cannot be
confirmed from the source document must be explicitly marked REQUIRES FACTUAL
VERIFICATION". The compliance audit is the deliverable produced against it,
inside an AI-assisted workflow (the handoff bundle is a Claude Design export).

The work, the direction, the design-lock discipline, the escalation decisions and
the shipped markup are all real and verified. The authorship of the audit
document's prose is not determinable from the evidence alone.

**Action taken:** the case study claims the *direction and the outcome* rather
than sole authorship of the document. Wording used: "auditing the existing page,
producing the compliance assessment, raising the items that needed a client
decision, implementing the changes, and re-checking the result against the same
matrix." No sentence claims to have personally written a 21-section audit.

**Optional follow-up:** if you want a stronger authorship claim, the supporting
evidence would be drafts, commit history, or dated working notes.

---

## 4. `<main>` landmark, NOT IMPLEMENTED IN ERTH

**Status:** open item on the ERTH side. Recorded, not fixed (ERTH is out of scope).

The compliance audit recommended wrapping the header navigation in `<nav>` and
the body sections in `<main>`. Verified in `ERTH Homepage v9.dc.html`:

- `<nav>` count: **1**, implemented
- `<main>` count: **0**, not implemented

**Action taken:** the ERTH case study lists this honestly under
"What's live, and what isn't" as `available` rather than `implemented`.

For contrast, `rukon.dev` itself does render a `<main>` landmark on every route
(`src/app/layout.tsx`), which was verified during this pass.

---

## 5. Placeholder URLs and image slots, CLIENT-SUPPLIED, STILL OPEN

Flagged in the original compliance audit and not re-verified in detail this pass:

- Four press-coverage links were placeholders pending real article URLs
- Two drop-off CTAs were placeholders pending a Google Maps URL and a Pos
  Malaysia page URL
- Nine image slots were reserved pending photography, with alt text to be
  written when they are filled
- Client logo row required confirmation of which organisations are licensed for
  display

**Action taken:** the case study states plainly that "several external links and
image slots were left as placeholders pending client-supplied URLs and
photography" under Limitations. No claim is made that the page is complete.

---

## 6. Source material read only in part

These were not fully read and could contain further usable evidence:

| File | Read | Note |
| --- | --- | --- |
| `requirements-v2.txt` | ~6% | Lines 420, 1624 are an "AI Audit & Recommendations" section covering customer groups and booking motives. Largest unexploited ERTH source. |
| `seo-copy.txt` | ~4% | Interleaves raw OOXML with plain text; structurally hard to parse. |
| `project/req2.docx` | not read | Unknown content. |
| `uploads/ERTH - Homepage (2).docx` | not read | Named by the compliance audit as the "requirements source of truth". |
| `ERTH - Homepage.docx`, `ERTH_Homepage_Development_SEO_Requirements_Update.docx` | not read | Probable earlier versions of files that were read. |
| `assets/` (53 files) | metadata only | Fonts and images. |

None of these block anything currently published. They are listed so a future
pass knows where to look before extending the ERTH case study.

---

## Summary

| # | Item | Status | Blocks publication? |
| --- | --- | --- | --- |
| 1 | Figma evidence | **Resolved 2026-09-02**, file existence verified, claims restored | No |
| 1a | Sole design authorship | Open, four article bodies still claim it | Not blocking; recorded per-article |
| 2 | Free-pickup threshold | Unresolved, client decision | Recorded as open, not asserted |
| 3 | Audit authorship framing | Resolved cautiously | No |
| 4 | `<main>` landmark in ERTH | Open on ERTH side | No, stated honestly |
| 5 | Placeholder URLs / images | Open, client-supplied | No, stated in Limitations |
| 6 | Partially-read sources | Open | No |

**Nothing published on `rukon.dev` depends on an unresolved item.** Every ERTH
claim now on the site is either directly verified in the shipped markup, verified
by the supplied Figma prototype, or explicitly described as open.

The one residual inconsistency is between the case study, which carefully
describes design *involvement*, and four blog bodies that claim sole authorship.
That is an editorial edit, not an evidence gap.

---

## 7. ERTH build v14, reviewed 2026-09-02, no portfolio impact

A newer standalone build (`ERTH Homepage (standalone) v14.html`) was supplied and
compared against v13. Once embedded asset payloads and regenerated asset UUIDs are
normalised, the only authored change is **16 added `color:#F2F5F2` declarations on
`<h3>` elements**, the locked heading token from the recorded visual language, so a
consistency fix inside the design lock rather than a deviation from it.

Unchanged in v14: title, canonical, all 7 Open Graph tags, all 4 Twitter tags, both
JSON-LD blocks, `areaServed`, the Cyberjaya postal address, and all 16 FAQPage
questions.

**Still unresolved in v14:**

- The free-pickup threshold contradiction (§2), both readings remain on the page,
  one of them inside `FAQPage` structured data.
- The `<main>` landmark (§4), still absent.

No portfolio change was required. Every ERTH claim on `rukon.dev` was verified
against v13 markup and holds identically in v14.
