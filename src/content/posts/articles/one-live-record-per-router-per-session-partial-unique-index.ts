import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "one-live-record-per-router-per-session-partial-unique-index",
  title: "One Live Record per Router per Session: Partial Unique Indexes Instead of Per-Scan Locks",
  description:
    "A barcode scanner can fire the same serial twice in a few milliseconds, and two workstations can scan the same router at once. RPOMS's Refining workstation catches both with one partial unique index, and decides whether to print from what the save recorded.",
  date: "2026-10-20",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "Partial Index", "Concurrency", "Idempotency", "Barcode Scanning", "Next.js"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Partial Unique Index for Duplicate Scans: Concurrency Without Row Locks in PostgreSQL",
  relatedProjects: ["rpoms", "rpoms-print-engine"],
  relatedPosts: [
    "sending-labels-between-browser-tabs-broadcastchannel-coop-window-opener",
    "staged-csv-import-for-operational-data",
    "refusing-runtime-ddl-on-production-schema-stamps-and-a-gate",
  ],
  sections: [
    {
      heading: "The workstation and its two duplicate problems",
      body: [
        "The Refining workstation in [RPOMS](/work/rpoms) is a scan-first screen. A refiner picks their name, an inspector and a category, and starts scanning routers; the first scan opens a session, every scan registers the router against it, and the Printing page sends a label for each saved scan to the [Print Engine](/work/rpoms-print-engine). Nothing is typed, so the data is only as clean as the scanner's input.",
        "Scanners produce two kinds of duplicates. A USB scanner can deliver the same serial twice within a few milliseconds when the trigger bounces or the operator re-scans a label that did not beep. And two people can scan the same router, in the same session on two devices or in separate sessions. The first must be saved once and printed once; the second must be handled by a stated rule, because the obvious rule, block it everywhere, turned out to be wrong.",
      ],
    },
    {
      heading: "The first attempt: take turns per serial",
      body: [
        "The first fix made same-serial saves take turns. Each scan took a row lock keyed on the serial for the day, so a concurrent duplicate waited for the first save and then saw it. It was correct, and it was measured, but it put a lock on the hot path of every scan to protect against a case that happens a few times a shift. Locks also tell the next engineer nothing: the rule lives in the code that takes them, not in the schema.",
        "The replacement is a declaration rather than a procedure. The scans table carries a unique index on session and serial, restricted by a WHERE clause to rows that have not been removed. One live record per router per session is now a fact the database enforces, and removing a scan and re-scanning it is allowed because the removed row leaves the index.",
        {
          type: "code",
          lang: "sql",
          code: "CREATE UNIQUE INDEX IF NOT EXISTS uq_refining_scan\n  ON refining_scans (session_id, serial_key)\n  WHERE removed_at IS NULL;\n\nCREATE UNIQUE INDEX IF NOT EXISTS uq_refining_open_cleaner\n  ON refining_sessions (cleaner_id)\n  WHERE completed_at IS NULL;",
          caption: "Two partial unique indexes carry the rules: one live record per router per session, and one open session per refiner.",
        },
      ],
    },
    {
      heading: "What the save records, and what prints",
      body: [
        "A scan is one statement: insert the record, and on conflict with the live index, count the repeat on the existing record instead of creating another. The response says which happened. That matters because the decision to print is made from what the save recorded, before anything is sent: a first scan in a session is saved and its label sent; the same router scanned again in the same session is counted and not sent, and the screen says duplicate, not printed.",
        "The measurement that proves it is simultaneous scans. On PostgreSQL 17 with twenty identical scans fired at once into one session, exactly one record exists and exactly one label request leaves; the other nineteen are repeats on it. A resent request is recorded once and its answer sends nothing new. Print again and Retry are new requests on the same record, so a reprint never creates a second record and every request stays in the print history.",
      ],
    },
    {
      heading: "The rule that was removed before release",
      body: [
        "An earlier version of this work also held a router that had been scanned today in another session, with a second unique index for it. The owner's decision on 17 October was that printing a router's label in several sessions is intended: a router that comes back to the line later in the day gets a fresh label. Both the rule and its index were removed before anything was applied anywhere.",
        "Duplicate scope is therefore the current session only. Nothing reads today's scans, other sessions or the Registry to block printing, which also keeps the scan's statement small; the Registry link is a separate, indexed read. A second partial index enforces one open session per refiner, so a session cannot be started twice for the same person while one is unfinished.",
        {
          type: "callout",
          label: "Measured",
          text: "On a PostgreSQL rig with 3,000+ records, production builds, interleaved runs: every page and the scan itself within 1.4 ms of the previous build on the second run. On a real B1 Pro: the first scan printed one label, and a repeat in the same session sent no request.",
        },
      ],
    },
  ],
};
