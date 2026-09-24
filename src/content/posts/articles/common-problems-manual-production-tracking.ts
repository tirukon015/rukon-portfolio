import type { BlogPost } from "../types";

/**
 * 2026-09-24: absorbed "Why Production Operations Need Digital Systems",
 * which overlapped this article by about seventy percent. Its one distinct
 * observation, the private copies of a shared sheet as the tell, and its
 * conclusion that the decision is about trust rather than scale, now live
 * here. The old URL redirects to this one.
 */
export const post: BlogPost = {
  slug: "common-problems-manual-production-tracking",
  title: "Common Problems in Manual Production Tracking With Spreadsheets",
  description:
    "The specific ways spreadsheet-based production tracking breaks down in practice, the tell that says it is time to move, and what a replacement has to remove.",
  date: "2026-06-16",
  updated: "2026-09-24",
  category: "Building Real Systems",
  tags: ["Production Systems", "Operations", "Spreadsheets"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "what-is-a-production-management-system",
    "staged-csv-import-for-operational-data",
    "from-manual-workflow-to-digital-workflow",
  ],
  sections: [
    {
      heading: "What this is about",
      body: [
        "A rundown of the concrete failure modes that show up when a spreadsheet is used to track a live production process rather than a static record, and the point at which a manual, spreadsheet-based process stops being reliable enough to run a physical operation on.",
        "A shared spreadsheet works when one or two people update it carefully. It stops working once there are several people, several stages, and real consequences for the numbers being wrong: stock that does not match what is on the shelf, a delivery that does not match what was scanned, a report that was already stale by the time someone read it.",
      ],
    },
    {
      heading: "Why it matters",
      body: [
        "These problems are easy to dismiss individually. A duplicate entry here, a stale copy there. But they compound, and by the time they are visible, the operation has usually already made a decision based on wrong numbers.",
      ],
    },
    {
      heading: "The four failure modes",
      body: [
        {
          type: "list",
          items: [
            "No validation. A spreadsheet accepts whatever is typed into it, including numbers that do not reflect what happened and serials that were never accepted.",
            "No single source of truth. Multiple copies drift apart, and nobody is sure which one is current.",
            "No audit trail. It is rarely clear who changed what, or when, once something looks wrong.",
            "Delayed visibility. Problems surface in a weekly review, long after they happened on the floor.",
          ],
        },
      ],
    },
    {
      heading: "The tell",
      body: [
        "Watch for the moment when people start keeping their own private copies of a shared sheet, to be safe. That is usually the sign. A private copy is a vote of no confidence in the shared one, and once two copies exist the question of which number is right has no answer the sheet can give.",
        "That is also why the decision to move off spreadsheets is less about scale than it looks. A small operation with three people can cross this line; a large one with disciplined habits can stay on the right side of it for a long time. The question is whether the numbers can still be trusted.",
      ],
    },
    {
      heading: "What the replacement has to remove",
      body: [
        "Before RPOMS, the router-refurbishment programme I work on ran on spreadsheets. The system that replaced them is deliberately built around these exact failure modes rather than around a generic data-entry pattern.",
        {
          type: "list",
          items: [
            "Validation at the point of entry: a serial is checked against configurable detection rules, and a packing screen checks it against the registry instead of trusting a typed value.",
            "One record per unit, with stock derived from the full history of adjustments and consumption rather than stored as a running total that can quietly diverge.",
            "Imports staged before they are written, so duplicates are surfaced for a row-by-row decision rather than discovered afterwards. The mechanics are in [Staged CSV Import for Operational Data](/blog/staged-csv-import-for-operational-data).",
            "A delivery that cannot be saved unless the scanned load matches the quantity it was raised for, so the mismatch is caught at the door rather than in a report.",
            "Figures entered once, with the dashboard and the stock deduction updated in the same step, so the numbers reflect what is happening rather than what was last typed in.",
          ],
        },
        "A digital system does not need to be complex to be worth it. It needs to remove the specific failure modes a spreadsheet has, and it only works if it fits how the operation actually runs, not the other way around.",
      ],
    },
    {
      heading: "Conclusion",
      body: [
        "These are not reasons to dislike spreadsheets in general. They are reasons a live, physical process usually outgrows one, and the moment it does is visible in behaviour before it is visible in the numbers.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
