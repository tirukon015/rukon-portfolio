# content-planning

**Planning data only. Nothing in this folder is imported by the application,
routed, rendered, or indexed.** It exists so the content research survives
outside a chat log and can be picked up by a later pass.

## Files

| File | What it is |
| --- | --- |
| `blog-database.json` | The full blog opportunity database: 230 rows, 224 distinct articles across 10 clusters. |

## Where this came from

Two read-only research passes over the four source projects
(`rukon-portfolio`, RPOMS, ResearchForge, and the ERTH homepage bundle):

1. **Content audit**, inventory, existing-blog audit, capability map, SERP
   research, cluster architecture, and the initial 214-topic database.
2. **Evidence verification**, every claim re-tested against primary source.
   That pass corrected 11 findings, added 19 verified capabilities, and
   surfaced 16 topics the first pass could not see because the evidence was in
   files that had not been read.

## Counts

| Measure | Value |
| --- | --- |
| Rows | 230 |
| **Distinct articles** (excluding `merge` and `remove`) | **224** |
| Evidence A, directly verified in source | 165 |
| Evidence B, strongly supported by documentation | 51 |
| Evidence C, inferred, word cautiously | 13 |
| Evidence D, unsupported, do not publish | 1 (marked `remove`) |
| Priority P1 / P2 / P3 | 102 / 95 / 33 |

Per cluster: POS 31 · BSA 22 · FSE 33 · DAT 19 · AIE 36 · SEO 28 · ITS 14 ·
UXD 15 · MYS 20 · CAR 12.

### A note on the status split

The verification report estimated the split as
`96 publish / 88 master / 24 rewrite / 4 merge / 2 remove`. Assigning a status
to every row individually, rather than estimating buckets, produced
`183 publish / 11 master / 30 rewrite / 4 merge / 2 remove`.

**The distinct-article count is unchanged at 224.** What moved is the internal
split, and it moved for a reason worth recording: the second pass verified far
more mechanisms at source level than the first pass could, so topics that were
provisionally "keep in the master database pending evidence" turned out to have
the evidence already. 216 of 230 rows now sit at evidence level A or B.

The bucket that most closely matches the earlier "96 publish" figure is
**P1 (102)**, the first wave. `status` answers "is the evidence there?";
`priority` answers "when should this be written?". They are different axes and
the earlier report conflated them.

## Rules carried into every article

1. Every article must cite one of the verified experience areas. An article
   that could be written without this work is a tutorial, and offers no
   advantage.
2. Malaysia (`MYS`) articles link outward to their global counterpart and never
   restate it.
3. No article claims RPOMS modules beyond the Daily Production Report are
   writing in production. See the status table on `/work/rpoms`.
4. No article claims ResearchForge performs retrieval, or is a RAG system.
5. Figma-based design and prototyping on ERTH is supported evidence (the
   ERTH V2.3 prototype). Sole design authorship is not. See
   `../ERTH_REMAINING_ITEMS.md`.
6. Location is used only where the search intent or the local context genuinely
   differs. No city-swap variants.

## Relationship to the live blog

The 15 existing articles in `src/content/posts.ts` are **not** in this database.
They carry their own editorial metadata inline, `plan`, `planNote` and
`mergeInto`, recording what the audit decided about each of them. No slug in
this database collides with a live post.

## Malaysian keyword validation, still outstanding

The SERP research behind the `MYS` cluster was run with a US-locale search tool.
Malaysian sites and job boards surfaced reliably, so the **competitive-gap**
findings are sound. Search **volume** and keyword difficulty for Malaysia were
never measured.

Before committing to the 20-article `MYS` cluster, validate its primary keywords
in a tool with the country set to Malaysia. If `MYS-05` and `MYS-14` do not
confirm, cut the cluster to the six career and industry pieces and move the
effort to `AIE` and `SEO`, which do not depend on local volume at all.
