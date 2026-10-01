import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "gapless-monthly-request-numbers-in-postgres",
  title: "Monthly Request Numbers That Never Skip: Counters, Voids and Retries in PostgreSQL",
  description:
    "How RPOMS issues monthly request numbers with no gaps: a locked counter row, number and row in one transaction, voids given back, retries made safe.",
  date: "2026-10-22",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "Idempotency", "Document Numbering", "Transactions", "TypeScript"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Gapless Monthly Document Numbers in PostgreSQL",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "stock-request-workflow-with-a-state-machine-and-event-log",
    "optimistic-concurrency-postgres-upsert-revision-409",
    "the-business-day-is-not-the-server-day",
    "never-create-indexes-from-application-startup",
  ],
  sections: [
    {
      heading: "The problem: document numbers people read as a sequence",
      body: [
        "When the Ecommerce team requests stock from the refurbishment line through RPOMS, each request gets a document reference like `ECR/2609/R/ABC/07`. That is the prefix, the year and month (YYMM), R for routers or B for boxes, a three- or four-character model code, and a two-digit sequence that restarts every month. The code in this example is invented.",
        "People read those numbers as a run. If 06 and 08 exist and 07 does not, someone asks what happened to 07. A database sequence cannot give you that: it never rolls back, so a failed insert burns a number. It does not restart monthly. And it knows nothing about cancelled documents. This article explains how RPOMS issues these numbers, for anyone who needs human-facing document numbers with no gaps.",
      ],
    },
    {
      heading: "The month is Malaysian, not UTC",
      body: [
        "The period comes from the business day, not the server clock. The server keeps UTC and the operation runs on Malaysian time, eight hours ahead. With a monthly sequence that is not cosmetic: a request raised at 07:00 on 1 October would otherwise be numbered in September. The same `businessToday()` that files every other date in RPOMS decides the period, and the month's bounds are built with a fixed `+08:00` offset because Malaysia has no daylight saving. The wider problem is covered in [The Business Day Is Not the Server Day](/blog/the-business-day-is-not-the-server-day).",
      ],
    },
    {
      heading: "The number and the row in one transaction",
      body: [
        "If the number is chosen outside the transaction that writes the request, a failure after choosing it leaves a permanent gap. So both happen in one transaction. The first statement creates or locks the month's counter row, `seq:2609`. An upsert whose conflict branch rewrites the value it already has takes the row lock, just as `SELECT … FOR UPDATE` would, in one round trip:",
        {
          type: "code",
          lang: "sql",
          code: `INSERT INTO ecommerce_request_counters AS c (name, value)
VALUES ('seq:2609', 0)
ON CONFLICT (name) DO UPDATE SET value = c.value;`,
        },
        "A second request for the same month now waits here until the first commits. The read of the month's existing numbers must be a separate statement. A statement's snapshot is taken when it starts, so a read folded into the locking statement could predate a request that a racing transaction committed while this one waited, and hand out the same number again.",
        "Then the request is inserted, with the counter updated in the same statement through a data-modifying CTE. The counter now only records the last number issued, so the table reads sensibly; it no longer decides anything. A rollback anywhere takes the choice back with it. The monthly limit is 99, and when all 99 are held by live requests the insert is refused with a message rather than printing `/100`.",
      ],
    },
    {
      heading: "A voided request gives its number back",
      body: [
        "Requests can be voided. The first version left the voided number burnt: voiding 09 meant the next request was 10, and the month read as a run with a hole in it where a cancellation used to be. That is most of what numbering them was for.",
        "The rule now is that a number is held only by live requests. The voided row keeps its number, because the document was raised and the history has to say so, but it stops holding that number against the month. The next number is the lowest free sequence, not the highest plus one. Those are the same until something is voided; after that, only the lowest closes the gap. Voiding 05 out of 09 gives 05 back, not a second 10.",
        {
          type: "code",
          lang: "ts",
          code: `for (let seq = 1; seq <= ECR_MONTHLY_LIMIT; seq++) {
  if (taken.has(seq)) continue;
  if (olderFormat > 0) { olderFormat -= 1; continue; }
  return seq;
}
return null; // all 99 held`,
          caption: "The core of nextRequestSequence(). Sequences are compared, not whole numbers, so 09 is taken whatever model holds it.",
        },
        "Requests raised under an older number format cannot be read as a sequence, but they still belong to the month, so each one reserves the lowest place not already taken. Eleven older-format requests and nothing else still means the next number is 12.",
        "The database had to change too. `request_number` was UNIQUE across every row, which made it impossible to write a reissued number at all. It is now a partial unique index over live rows only, which states the rule exactly: a number can exist once as VOIDED and once live, and two live requests still cannot share one.",
        {
          type: "code",
          lang: "sql",
          code: `CREATE UNIQUE INDEX IF NOT EXISTS uq_ecr_request_number_live
  ON ecommerce_requests (request_number)
  WHERE status <> 'VOIDED';
ALTER TABLE ecommerce_requests
  DROP CONSTRAINT IF EXISTS ecommerce_requests_request_number_key;`,
          caption: "One transaction, index first, so live numbers are never without a uniqueness guard.",
        },
      ],
    },
    {
      heading: "A retry returns the first request",
      body: [
        "On a slow connection the Submit button gets pressed twice, or the browser retries after a timeout, and the first attempt may already have committed. Without protection that raises two requests and uses two numbers.",
        "The form generates an idempotency key with `crypto.randomUUID()` and keeps it for as long as the form content is unchanged. Pressing Submit again with the same content sends the same key. Changing any field starts a new key, because that is a different request. After a success the key is discarded.",
        "The server handles the key in two layers. Before doing anything, it looks the key up and returns the existing request if there is one. If two copies race past that check, the partial unique index `uq_ecr_idempotency` (on the key, where it is not null) lets exactly one commit. The other fails with PostgreSQL error 23505 on that constraint, its transaction rolls back and takes the number with it, and it returns the request that won.",
        {
          type: "flow",
          steps: ["Lookup by key → found? return it", "Lock month counter", "Read live numbers", "Lowest free sequence", "Insert request + event", "23505 on key? return the winner"],
        },
      ],
    },
    {
      heading: "What to take from this",
      body: [
        {
          type: "list",
          items: [
            "Don't use a database sequence for numbers people read. Choose the number inside the transaction that uses it.",
            "Lock one row per numbering period, and read existing numbers in a separate statement after the lock.",
            "Decide what a cancellation means. If cancelled numbers should come back, take the lowest free number and make uniqueness apply to live rows only.",
            "Make retries safe with a client-held key that changes only when the content changes, and a unique index as the final guard.",
            "Take the period from the business day, not the server clock.",
          ],
        },
        "The Ecommerce request portal is part of [RPOMS](/work/rpoms). The Ecommerce team has been using it for real requests since September 2026. The same row-lock idea serialises stock transfers, and how a save refuses to overwrite a newer version is covered in [Optimistic Concurrency in PostgreSQL](/blog/optimistic-concurrency-postgres-upsert-revision-409).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
