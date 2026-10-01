import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "stale-responses-overwrite-newer-filter-results-react",
  title: "Out-of-Order Responses on Filter Changes: Only the Newest Request May Write",
  description:
    "Filters that apply on change put several fetches in flight, and the slow broad one often lands last. A ticket per request in a React ref keeps the screen answering the current question.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["React", "Race Conditions", "Fetch", "Next.js", "Frontend"],
  contentType: "Problem/Solution",
  searchIntent: "problem-aware",
  seoTitle: "Stop Stale Fetches Overwriting Newer Results in React",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "nextjs-error-boundary-auto-retry-jitter",
    "why-internal-software-needs-good-ux",
    "remediating-a-code-audit-with-p0-findings",
  ],
  sections: [
    {
      heading: "Nothing looked wrong, and the list was for the wrong filter",
      body: [
        "The router registry in RPOMS, the operations system I built for a router-refurbishment line, lists accepted routers with filters for serial, model, person and date. The filters apply on change rather than on a submit button, so typing a serial or clicking through a dropdown sends a request for each step. Several are in flight at once, and they do not come back in the order they were sent.",
        "Worse, the order is biased the wrong way. A broad early query, say a partial serial of two characters, is slow precisely because it matches a lot. The narrow query that followed it is fast. So the broad result tends to land after the narrow one, and overwrite the list, the total count, the page size and the highlighted serial with results for a filter the admin has already moved past. Nothing looks broken. The screen is simply showing an answer to an older question.",
        "A code audit in September 2026 listed this as FE-02. This note is for anyone whose search box or filter panel fires a fetch per change.",
      ],
    },
    {
      heading: "A ticket per request",
      body: [
        "The fix is a counter in a ref. Each request takes the next number before it is sent, and a response may write to the screen only if its number is still the latest:",
        {
          type: "code",
          lang: "ts",
          code: "const ticket = ++filterRequestRef.current;\ntry {\n  const res = await fetch(`/api/routers?${params.toString()}`);\n  const data = await res.json().catch(() => ({}));\n  if (ticket !== filterRequestRef.current) return; // superseded\n  if (data.ok) {\n    setRecent(data.routers);\n    if (typeof data.count === \"number\") setTotal(data.count);\n    setLimit(rows);\n    setHighlight(f.serial.trim());\n  }\n} catch {\n  if (ticket !== filterRequestRef.current) return; // not this filter's failure\n  toast.error(\"Could not load the list.\");\n}",
          caption: "From the RPOMS accepted-routers panel.",
        },
        "A ref rather than state, because the check must see the current value at the moment the response arrives, not the value captured when the callback was created, and incrementing it must not cause a render.",
        "The check is made twice: after the response is parsed and before any state is set, and again in the error path. A failure from a superseded request is not the current filter's failure, and showing an error toast for a query nobody is waiting on any more would be its own small lie.",
      ],
    },
    {
      heading: "Why not AbortController?",
      body: [
        "Aborting the earlier fetch is the other common answer, and it works. I chose to read late answers and discard them instead. The request has already been paid for, the server will finish the query either way, and aborting mid-flight buys nothing for a list this size. The ticket is also simpler to get right: it covers every state the response would set in one comparison, and there is no aborted-fetch exception to tell apart from a real network error.",
        "Where a component loads data in an effect, the codebase already used the other standard pattern, a `cancelled` flag set in the effect's cleanup. That handles a component unmounting or its inputs changing. The ticket handles something the cleanup does not: several calls from the same callback overlapping while the component stays mounted.",
      ],
    },
    {
      heading: "A related cost on the same screens",
      body: [
        "The same audit found a quieter frontend problem in the daily report form: a one-second clock lived inside the form component, so every tick re-rendered the whole form, every workforce row included, none of it memoised. The fix was to extract the clock into its own small component, so the tick re-renders the clock and nothing else. Typing on the form went from one whole-form reconciliation per second to none.",
        {
          type: "list",
          items: [
            "If a fetch fires per keystroke or per change, assume responses arrive out of order.",
            "Give each request a ticket from a ref and let only the latest write state, including error state.",
            "Use a cleanup flag for unmounts, and a ticket for overlapping calls; they solve different problems.",
          ],
        },
        "The registry is described in the [RPOMS case study](/work/rpoms), and why small interface failures like this matter on an operations floor is in [Why Internal Software Needs Good UX](/blog/why-internal-software-needs-good-ux).",
      ],
    },
  ],
  related: [{ label: "RPOMS case study", href: "/work/rpoms" }],
};
