import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "stock-request-workflow-with-a-state-machine-and-event-log",
  title: "A Stock Request Portal With a State Machine and an Event Log",
  description:
    "The lifecycle behind the RPOMS Ecommerce portal: a transition table, terminal states, a void that reverses, version-checked edits and an event per step.",
  date: "2026-11-25",
  category: "Building Real Systems",
  tags: ["Workflow", "State Machine", "Audit Trail", "Inventory", "TypeScript"],
  contentType: "Case Study",
  searchIntent: "informational",
  seoTitle: "Stock Request Workflow: State Machine, Events, Voids",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "one-pure-function-for-preview-and-commit",
    "gapless-monthly-request-numbers-in-postgres",
    "derived-configuration-health-checks",
    "audit-log-with-before-snapshots-for-destructive-actions",
  ],
  sections: [
    {
      heading: "The problem: requests that change hands",
      body: [
        "Alongside the refurbishment line it was built for, RPOMS has a second user: an Ecommerce team that needs routers, or sealed boxes of ten, to sell. In September 2026 I built them a request portal, and they have been using it for real requests since then.",
        "A request is a small workflow with several hands on it: the Ecommerce team raises it, an admin decides, an admin stages the exact routers, and stock moves. Mistakes are corrected after the fact. This article is about the lifecycle design underneath: where states and transitions are defined, how corrections work without rewriting history, and how each step is recorded. It is for anyone building an approval workflow that moves physical stock.",
      ],
    },
    {
      heading: "The flow, step by step",
      body: [
        {
          type: "flow",
          steps: ["Raise (Ecommerce)", "Approve or reject (admin, with a remark)", "Stage exact routers by serial or by box", "Transfer from a chosen source", "Void or edit, with a reason"],
        },
        "Raising a request takes a type (ROUTER or BOX), a model, a quantity, a required date and a note, and returns a numbered document reference. Numbering is covered in [Monthly Request Numbers That Never Skip](/blog/gapless-monthly-request-numbers-in-postgres). The requester's portal is a separate, locked-down build of the same code, and it shows them their own requests and nothing else: no stock levels and no admin screens. They are told when a request is approved, rejected or transferred.",
        "Staging is where the request meets real routers. The admin scans serials, or scans a box and its serials are resolved from the registry. Every router is checked before it is staged: it must be in the registry or recognisable by the detection rules, be the requested model, not be delivered, not already be transferred, and suit the chosen source. A storeroom transfer, for example, refuses routers that are not in a box. Staging writes only the staged row. Nothing is deducted until the transfer, and the transfer itself is planned and executed as described in [Preview and Commit From the Same Plan](/blog/one-pure-function-for-preview-and-commit).",
      ],
    },
    {
      heading: "Transitions as a table, not as scattered ifs",
      body: [
        "Every allowed move is written in one table. Anything not listed is refused:",
        {
          type: "code",
          lang: "ts",
          code: `const TRANSITIONS: Record<EcommerceStatus, readonly EcommerceStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["TRANSFERRED"],
  REJECTED: [],
  TRANSFERRED: [],
  VOIDED: [], // nothing reopens a voided request
};

export function canTransition(from: EcommerceStatus, to: EcommerceStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}`,
          caption: "src/lib/ecommerce.ts.",
        },
        "A refused move gets a reason an admin can act on, not a generic error. A second transfer of the same request says that stock was deducted once and will not be deducted again. A transfer of a pending request says it must be approved first. The function returns the reason instead of throwing, so each route decides the HTTP status.",
        "REJECTED and TRANSFERRED are terminal on purpose. A transfer entered in error is not fixed by moving the request back to APPROVED, which would leave a deduction in the stock history with nothing explaining it. It is corrected the way RPOMS corrects any stock error, with a compensating entry that leaves both records visible.",
      ],
    },
    {
      heading: "Void is a soft delete that reverses",
      body: [
        "Any request that is not already voided can be voided, and voiding twice changes nothing. VOIDED is a soft delete: the row and its history stay on file, and the request stops counting as active. A voided transfer stops counting towards anything given to Ecommerce, and the stock it took is restored by inverting the plan that was actually executed, written as ledger rows labelled as a reversal. The voided request keeps its document number, because the document existed, but no longer holds it against the month.",
        "Edits are allowed while a request is open, and after a transfer through that same reversal. Both a void and an edit need a reason. Both carry the version of the request the admin was looking at; if the request changed in the meantime, the action is refused with \"This request was changed by someone else while you were working on it. Reload the page and try again. Nothing was changed.\"",
      ],
    },
    {
      heading: "Every step is an event",
      body: [
        "Each step writes a row to `ecommerce_request_events`: CREATED, APPROVED, REJECTED, TRANSFERRED, EDITED, VOIDED and TRANSFER_REVERSED, with the from and to status, the remark, and the actor's role and session. A transfer's event carries the frozen deduction plan and the serials that moved, so the history says which routers went, not only how many. An edit records the fields that changed. Events carry an operation key with a unique index, so a retried action that already committed is recognised instead of being recorded twice.",
        "The request page shows these events as a timeline. The question \"who approved this, and when did it go?\" is answered by reading the record, not by asking around.",
        {
          type: "table",
          head: ["Concern", "Where it lives"],
          rows: [
            ["Which moves are legal", "One transition table"],
            ["Why a move was refused", "transitionProblem(), returned as words"],
            ["What happened, by whom", "One event row per step"],
            ["What a transfer actually did", "The frozen plan on its event"],
            ["Undoing a transfer", "A reversal built from that frozen plan"],
            ["Concurrent edits", "A version carried with each edit or void"],
          ],
        },
      ],
    },
    {
      heading: "Routers the registry has never seen",
      body: [
        "One case needed a rule of its own. Routers taken straight from unpacked inventory had often never been accept-scanned, so they were not in the registry, and staging refused them and sent the admin off to another screen. Now such a router is staged as Not registered, with its model taken from the detection rules, and registered by the transfer itself.",
        "The rule this rests on is that a router enters the registry once per serial, either by an accept scan or by this path, and nothing else takes it off raw stock for that serial. Each unregistered router needs a Handled By person, an active employee. That name is stored separately from the accepting worker, so the daily report can never count it as accepted output. Registration is insert-if-absent, and only rows it actually creates are billed against stock. A serial accepted a moment earlier by the registry costs nothing.",
      ],
    },
    {
      heading: "What generalises",
      body: [
        {
          type: "list",
          items: [
            "Write the allowed transitions as data, and refuse everything else with a reason a person can act on.",
            "Make states terminal where moving backwards would hide what happened. Correct with a compensating entry instead.",
            "Use a soft delete that reverses its effects, and keep the record.",
            "Carry a version with every edit, and refuse stale ones.",
            "Record every step as an event with the actor and the data that moved.",
          ],
        },
        "The Ecommerce module is part of [RPOMS](/work/rpoms) and has been in the production release since 28 September 2026.",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
