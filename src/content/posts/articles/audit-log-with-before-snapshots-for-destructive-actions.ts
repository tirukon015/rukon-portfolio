import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "audit-log-with-before-snapshots-for-destructive-actions",
  title: "An Append-Only Audit Log That Keeps What Was Deleted",
  description:
    "RPOMS's audit log records who acted, from the signed session, and a snapshot of what each destructive action removed, which turns irreversible deletes into recoverable ones.",
  date: "2026-10-02",
  category: "Building Real Systems",
  tags: ["Audit Log", "PostgreSQL", "Data Integrity", "Security", "Database Design"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "An Audit Log That Makes Deletes Recoverable",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "immutable-reference-data-postgres-triggers-and-hash-pinning",
    "hmac-signed-session-cookies-without-a-library",
    "data-preservation-check-before-production-release",
    "remediating-a-code-audit-with-p0-findings",
  ],
  sections: [
    {
      heading: "The only evidence of a deletion was its absence",
      body: [
        "RPOMS, the operations system I built for a router-refurbishment line, allows a small number of genuine deletions. A super admin can remove a day's production report filed in error, an admin can delete a mistyped router or empty a box packed by accident. Until September 2026, none of it was recorded. A code audit listed it as SEC-04: there was no actor, no time, and no way to tell a deliberate correction from a mistake, or from someone using a cookie that should have been revoked.",
        "It also could not be fixed first. The session cookie at the time was the same for every admin, so there was no identity to attribute anything to. The audit log came after the session rework in [From a Constant Per-Role Cookie to HMAC-Signed, Expiring Sessions](/blog/hmac-signed-session-cookies-without-a-library). This article is for anyone adding an audit trail to an application that lets people delete records.",
      ],
    },
    {
      heading: "Who: read from the session, never from the request",
      body: [
        "Each entry records the actor's role and session id, read on the server from the signed cookie. Nothing in the request body can claim to be someone. Two roles share one password each, so the role alone cannot tell two admins apart, but the per-session id can. If a cookie is ever found to have leaked, every action taken with it can be listed.",
        "Each row also has the time, the action, the entity and its id, a snapshot, and a detail field. The action is a plain text column with a TypeScript union on top, so adding an action needs no migration, and an older deployment reading the table simply sees strings it has not seen before.",
      ],
    },
    {
      heading: "What was there: a snapshot taken before the action",
      body: [
        "The more useful half is not who, but what. Every destructive action carries a snapshot of the record as it stood before the action:",
        {
          type: "table",
          head: ["Action", "Snapshot", "Why it matters"],
          rows: [
            ["`report.delete`", "the whole report", "the one action that can remove a day of production history"],
            ["`router.delete`", "the registry row", "model, who accepted it, the date and its box"],
            ["`box.empty`", "the serials it held", "unpacking clears each router's box number, so which routers were inside existed only in the fields being cleared"],
            ["`box.rename`", "from, to, and the count", "a packed date travelling with a box changes which day it bills to"],
            ["`settings.update`", "before and after", "one setting decides how packaging boxes come off stock, and so changes published figures"],
          ],
        },
        "Later work extended it to deletes of employees, stock adjustments, models, customers and serial rules, and to deleting a delivery, which records the whole delivery. With the snapshot, a deletion goes from irreversible to recoverable: a read-only script prints the record back out of the log, and re-entering it through the ordinary screens restores it.",
      ],
    },
    {
      heading: "Append-only, in the strict sense",
      body: [
        "The audit module issues `CREATE TABLE`, `CREATE INDEX` and `INSERT`, and nothing else. No code path removes an audit row and no migration touches the table. When a staging copy is refreshed from production, the refresh script never copies the audit log.",
        "The table's two indexes are created plainly at first use, which looks like it breaks the rule I apply elsewhere of never building an index from application startup. The rule exists because a plain `CREATE INDEX` locks a table other queries are using. This table is brand new and empty when it is built, so there is nothing to lock anyone out of.",
      ],
    },
    {
      heading: "It never throws, and that is a trade-off",
      body: [
        {
          type: "code",
          lang: "ts",
          code: `export async function recordAudit(event: AuditEvent): Promise<void> {
  try {
    // insert actor role, session id, action, entity, snapshot, detail
  } catch (err) {
    console.error("[audit] FAILED to record " + event.action + " ...", err);
  }
}`,
          caption: "The shape of recordAudit, simplified.",
        },
        "If an audit write could fail its operation, a hiccup on this one table could stop a super admin correcting a report: the log holding the system to ransom over its own bookkeeping. So a failure is logged loudly to the server console, which is itself collected, and the operation proceeds.",
        {
          type: "callout",
          label: "What that costs",
          text: "Because a write can fail without stopping the action, the log is a very good record of what happened, not a proof that nothing else did. Making it authoritative means writing it inside the same transaction as the operation it describes. That is worth doing per path, and the code says so where a future reader will see it.",
        },
        "One path already works that way. An Ecommerce stock transfer is logged here too, because it moves published stock figures and cannot be undone by doing it again, but its authoritative record is a separate event table written inside the transfer's own transaction. The general log entry is the best-effort copy in the place an operator already looks.",
      ],
    },
    {
      heading: "If you are adding one",
      body: [
        {
          type: "list",
          items: [
            "Attribute from the server's own reading of the session, never from the payload.",
            "Snapshot the record before a destructive action. The snapshot is what makes the log useful for recovery, not just blame.",
            "Make the table append-only in code, and keep it out of copies made for testing.",
            "Decide explicitly whether the log may block the action, and write the decision down where it is enforced.",
          ],
        },
        "The system is described in the [RPOMS case study](/work/rpoms). The audit log is one part of the evidence that a release lost nothing, alongside the checks in [Proving a Release Deleted Nothing](/blog/data-preservation-check-before-production-release).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
