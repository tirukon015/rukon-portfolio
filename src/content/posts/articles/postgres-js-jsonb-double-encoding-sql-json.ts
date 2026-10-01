import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "postgres-js-jsonb-double-encoding-sql-json",
  title: "postgres.js Stored My JSON Arrays as Strings in a jsonb Column",
  description:
    "Writing JSON.stringify(x)::jsonb through postgres.js encodes the value twice, so a jsonb column holds a string, not an array. The symptom, the sql.json() fix, and handling rows already stored.",
  date: "2026-12-25",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "postgres.js", "jsonb", "Node.js", "Debugging"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "postgres.js jsonb Double-Encoding: Use sql.json()",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "postgres-js-timestamptz-microseconds-lost-in-binding",
    "postgres-bulk-insert-bind-parameter-limit-unnest",
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
  ],
  sections: [
    {
      heading: "A delivery sheet full of brackets and single digits",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, stores a few lists as `jsonb`: the serials in each delivered box, a delivery location's address lines, and which deliveries a delivery order covers. One early symptom was a delivery sheet with a column of brackets and single digits where serial numbers should have been. Code iterating what it thought was an array was iterating a string, one character per row.",
        "The reading side got defensive quickly: a `jsonb` value that comes back as text is re-parsed. Later I found one way such values get there on the writing side, and it is a postgres.js behaviour worth knowing if you write `jsonb` from Node.",
      ],
    },
    {
      heading: "JSON.stringify plus ::jsonb encodes twice",
      body: [
        "The writes looked reasonable:",
        {
          type: "code",
          lang: "ts",
          code: "// Looks right. Stores a JSON string, not an array.\nawait sql`UPDATE some_table SET ids = ${JSON.stringify(ids)}::jsonb WHERE ...`;",
          caption: "Illustrative; the RPOMS writes had this shape.",
        },
        "postgres.js serialises a JavaScript value for a `jsonb` parameter itself. Given a string that already contains JSON, it encodes that string as a JSON string. PostgreSQL then stores a `jsonb` value whose type is `string`, holding the text of an array, rather than the array. Nothing errors. Reads in JavaScript get a string back, and anything that checks `Array.isArray` or uses a `jsonb` operator sees the wrong shape.",
        "I found it while working through a launch-readiness audit in September 2026 (it became finding F-40), on the `delivery_orders` and `delivery_locations` columns.",
      ],
    },
    {
      heading: "The fix: hand the value to sql.json()",
      body: [
        {
          type: "code",
          lang: "ts",
          code: "await sql`\n  UPDATE delivery_locations\n  SET address_lines = ${sql.json(input.addressLines)}\n  WHERE ...`;",
          caption: "From the RPOMS delivery store, shortened.",
        },
        "`sql.json()` tells the driver the value is JSON to be encoded once. The array arrives as an array. There is one TypeScript wrinkle: postgres.js types its JSON values with an index signature that a TypeScript interface never satisfies, however plain its fields. Rather than casting at every call site, the store has one small helper that asserts it once, with a comment explaining why.",
      ],
    },
    {
      heading: "Living with rows already in the wrong shape",
      body: [
        "Fixing the writes does not fix rows written before the change, and rewriting them in place was not something I wanted to do without need. So the column holds two shapes, and the code says so:",
        {
          type: "list",
          items: [
            "Reads tolerate both. A helper accepts an array, or a string that parses as a JSON array, and treats any other string as a single value rather than dropping it.",
            "Operators that inspect `jsonb` structure, such as `@>` and `?`, only see correctly stored arrays. Where a query has to match both shapes, the decision is made in JavaScript after reading each candidate row through the tolerant helper.",
            "When such a row is written back, it goes through `sql.json()`, so it leaves in the proper shape. Rows convert as they are touched.",
          ],
        },
        "The delete path for a delivery is where this mattered most. Removing a delivery takes its id out of each delivery order that lists it, and that list was exactly one of the double-encoded columns, so a `jsonb` containment query would have missed the older rows.",
        {
          type: "callout",
          label: "How to check your own database",
          text: "`SELECT jsonb_typeof(col), count(*) FROM t GROUP BY 1;` shows whether a column you expect to hold arrays holds any strings.",
        },
        "Like [the timestamptz microseconds bug](/blog/postgres-js-timestamptz-microseconds-lost-in-binding), this is a case where the driver does something sensible with what it is given, and the bug is in what it was given. The system is described in the [RPOMS case study](/work/rpoms).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
