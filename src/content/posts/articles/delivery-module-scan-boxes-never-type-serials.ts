import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "delivery-module-scan-boxes-never-type-serials",
  title: "Designing a Delivery Module: Scan Boxes, Never Type Serials, Freeze What Left",
  description:
    "How the RPOMS delivery module works: scanned boxes instead of typed serials, a load that must match its quantity, and a snapshot of what actually left.",
  date: "2026-11-19",
  category: "Building Real Systems",
  tags: ["Warehouse", "Delivery", "Data Integrity", "Transactions", "Operations"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "Designing a Delivery Module With Box Scans and Snapshots",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "fill-a-word-template-in-nodejs-with-jszip",
    "barcode-scanner-web-app-scan-paste-and-beep",
    "audit-log-with-before-snapshots-for-destructive-actions",
    "derived-inventory-from-a-ledger-not-a-stored-balance",
  ],
  sections: [
    {
      heading: "The problem: what left the building, exactly?",
      body: [
        "A delivery is where an operations system meets the customer. Once a truck leaves, the question \"which routers went on that delivery?\" has to have one answer, and it has to match the paperwork the customer signed. In a spreadsheet, that answer is typed by hand, counted by eye, and edited later without a trace.",
        "RPOMS is the operations system I built for a router-refurbishment line. This article describes how its delivery module is designed so that the record of a delivery is counted rather than intended, and cannot quietly change afterwards. It is for anyone designing dispatch or delivery verification for physical goods that carry serial numbers.",
      ],
    },
    {
      heading: "Scan boxes; the serials come from the registry",
      body: [
        "Routers are packed into numbered boxes before they are delivered, and each box's contents are already in the serial registry from the packing scan. So a delivery is built by scanning box numbers, never router serials. The serials inside each box come from the registry and are never typed.",
        {
          type: "flow",
          steps: ["Pick customer location", "CUSTOMER and SHIP TO fill in", "DO number suggested", "Choose quantity", "Scan boxes", "Load matches? Save", "One transaction writes everything"],
          caption: "Building a delivery, as implemented.",
        },
        "A box that is not in the registry is refused, and the same box cannot be scanned twice. The operator also picks the casing colour while scanning, because the customer's tracker prints the model with its colour. That belongs to the delivery, not the registry.",
        "Choosing the customer location fills in the CUSTOMER and SHIP TO blocks from stored data and shows them before any box is scanned, so an address is checked before the paperwork is raised rather than after. Customers are held as data, so a new one needs no release. Correcting a customer's details is restricted; for everyone else the block is read-only and says whose permission is needed.",
      ],
    },
    {
      heading: "A load must match the quantity it was raised for",
      body: [
        "Each delivery is raised for a quantity: one of the standard sizes (250, 500, 750, 1,000 or 1,250) or a restricted custom figure. As boxes are scanned the screen counts against it, for example \"20 of 250, 230 short\", and Save stays disabled until the count equals the quantity.",
        "Hiding the button is not what enforces the rule. The server applies the same check, and a short or over load is saved only by a Super Admin. For other roles the override is not shown disabled; it is not rendered at all. The quantity is stored with the delivery, so the Delivery Order and its tracker carry the figure the load was checked against, and the figure on the paperwork is one that was actually counted.",
        {
          type: "callout",
          label: "Why both",
          text: "A disabled button stops honest mistakes. A server-side check stops everything else, including an old browser tab, a script, and a future screen that forgets the rule.",
        },
      ],
    },
    {
      heading: "Save once, in one transaction",
      body: [
        "Saving writes the delivery, its boxes and each router's delivered state in one transaction. Either the whole delivery exists or none of it does. A partly saved delivery, with boxes recorded but routers not marked, would leave the registry claiming that routers are still on the shelf.",
        "The delivered state itself was a late addition. The registry originally knew three states for a router: absent, accepted and boxed. Nothing recorded that a boxed router had left. A `delivered_at` column now records it, written by this transaction, and existing rows were left as unknown rather than reinterpreted.",
      ],
    },
    {
      heading: "Snapshot the serials, don't reference them",
      body: [
        "Each delivered box stores a copy of the serials it held at the moment of delivery, not a reference to the registry. That choice is the core of the design. If a router is later edited, repacked or removed in the registry, the record of what actually left the building does not change. A reference would let today's registry rewrite last month's delivery.",
        "For the same reason a saved delivery is never partly edited. A delivery either stands as it was saved or is removed entirely. Removing one is Super Admin only, because it corrects something entered in error, not routine tidying. Everything it touched is undone in one transaction: a router it marked delivered is unmarked, unless another delivery still holds it, and any Delivery Order that listed it stops listing it. Before that was written, a deleted delivery left its routers marked delivered for ever and its id dangling in the paperwork. Moving a delivery to a different customer is restricted in the same way, because the location is where the goods physically went.",
      ],
    },
    {
      heading: "The paperwork follows from the record",
      body: [
        "Delivery Orders are numbered per month, `DO{YY}/ERTH{MM}{NNN}`, and the next number is suggested from the highest one already used that month, so a number entered by hand is never reused. A Delivery Order can cover one or more deliveries to one customer, with lines grouped by model and colour. Once it is marked delivered it is final and no longer editable.",
        "The note itself is generated from the office's own Word template, and the tracker as an Excel file in the customer's column layout. Both are described in [Filling a Word Template in Node.js](/blog/fill-a-word-template-in-nodejs-with-jszip). Delivery history lists every delivery with its boxes and serials, and the document and tracker are one click from each row.",
      ],
    },
    {
      heading: "Design rules worth keeping",
      body: [
        {
          type: "list",
          items: [
            "Scan the largest unit that is already recorded (the box), and pull the details from the record.",
            "Make the expected quantity part of the delivery, and block the save until the count matches, on the server as well as the screen.",
            "Write the delivery and the state change of every unit in one transaction.",
            "Snapshot what was delivered. History should not depend on live records that can change.",
            "Allow removal, not partial edits, and make removal undo everything the record touched.",
          ],
        },
        "The scanning side of these screens is covered in [Building a Web Screen Around a Barcode Scanner](/blog/barcode-scanner-web-app-scan-paste-and-beep). The delivery module is part of [RPOMS](/work/rpoms). It is complete, and the screenshots on the project page come from it running on synthetic data, but in production it is held behind the write lock while the programme works through sign-off.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
