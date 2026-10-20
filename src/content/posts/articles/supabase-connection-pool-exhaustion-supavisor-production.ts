import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "supabase-connection-pool-exhaustion-supavisor-production",
  title: "Connection-Pool Exhaustion Under Serverless Scale: Investigating Supavisor and Vercel in Production",
  description:
    "A postmortem of production incident INC-2026-10-11-01: why Vercel serverless functions saturated Supavisor transaction pool connections during a warehouse shift change while CPU was under 5%, and how we recovered with zero data loss.",
  date: "2026-10-13",
  category: "Building Real Systems",
  tags: ["PostgreSQL", "Supabase", "Supavisor", "Connection Pooling", "Vercel", "Incident Postmortem"],
  contentType: "Case Study",
  searchIntent: "problem-aware",
  seoTitle: "Supavisor Connection Pool Exhaustion on Serverless: INC-2026-10-11-01",
  relatedProjects: ["rpoms"],
  relatedPosts: [
    "when-production-breaks-and-nothing-changed-paused-free-tier-database",
    "the-business-day-is-not-the-server-day",
    "staged-csv-import-for-operational-data",
  ],
  sections: [
    {
      heading: "The incident: Sunday shift change on a router refurbishment line",
      body: [
        "On Sunday evening during a warehouse shift transition, floor operators on the router refurbishment line reported that [RPOMS](/work/rpoms) had stopped loading inventory balances and registry cards. Submitting a finished box or opening the delivery dashboard produced an immediate failure banner with error reference `842299323`. Yet, when checked through external uptime monitors, the application's `/api/health` route returned an immediate HTTP 200.",
        "A physical line cannot wait indefinitely for an IT system to heal itself. If technicians cannot record accepted serial numbers or verify box packing limits, physical units begin stacking up on testing benches, risking mixed batches and untracked inventory.",
        {
          type: "callout",
          label: "Incident Summary",
          text: "Incident reference INC-2026-10-11-01 (SEV-1). Outage duration: 15 minutes. Impact: Write operations locked on floor terminals; zero operational data loss; 382 routers and 140 stock adjustments reconciled cleanly post-incident.",
        },
      ],
    },
    {
      heading: "Why the health check lied: the serverless decoupling trap",
      body: [
        "The first mystery was why monitoring alerts failed to fire. The application's `/api/health` endpoint was written as a lightweight probe: it returned `{ status: 'ok', timestamp: Date.now() }` directly from the Next.js edge route. Because the health check did not execute a live query against the database, Vercel's edge network responded instantly with HTTP 200 even while every real database route was hanging.",
        "On a traditional monolithic server, an unhealthy database often causes worker processes to crash or back up memory, eventually failing HTTP checks. On a serverless architecture, each incoming HTTP request spins up an isolated function instance. When those instances cannot reach the database, they wait for their socket timeout, consume pool slots, and terminate, while stateless health routes continue to report perfect availability.",
      ],
    },
    {
      heading: "Diagnosing Supavisor: pool modes and connection limits",
      body: [
        "RPOMS connects to PostgreSQL through Supabase's managed connection pooler, **Supavisor**. Supavisor offers two primary modes: session mode (port 5432) and transaction mode (port 6543). Because serverless functions scale unpredictably, the application was configured to connect through the transaction pooler on port 6543.",
        "Inspection of the database telemetry revealed the root cause: during the shift handover, multiple supervisors opened historical batch delivery exports while floor technicians simultaneously scanned serial barcodes. Vercel Fluid Compute spun up concurrent container instances to handle the simultaneous requests. Each container established an initial client socket to Supavisor.",
        {
          type: "flow",
          steps: [
            "Warehouse shift change generates concurrent dashboard and scan requests",
            "Vercel auto-scales container instances to handle HTTP ingress",
            "Each container opens a connection socket to Supavisor on port 6543",
            "Backend pooler connection limit is exceeded, queuing new transactions",
            "Client function instances hit 8-second execution timeout and terminate abruptly",
            "Abruptly severed client sockets leave orphan transactions waiting in pooler",
          ],
          caption: "Cascading connection-pool saturation under serverless scale.",
        },
        "When client functions terminated due to client-side timeouts, their underlying TCP sockets were severed before an orderly connection close or transaction rollback could complete. Supavisor held the backend PostgreSQL slots open until its internal socket keep-alive expired, creating a pool-exhaustion cascade where new requests could not acquire a connection.",
      ],
    },
    {
      heading: "The 15-minute mitigation and recovery",
      body: [
        "Once the exhaustion pattern was identified, mitigation proceeded in two steps:",
        {
          type: "list",
          ordered: true,
          items: [
            "Drained the pooler connections by restarting the Supavisor service pool through the management CLI, instantly terminating abandoned backend connections.",
            "Deployed an immediate configuration update tightening client-side acquisition timeouts to 3,000 ms with exponential backoff and jitter, preventing retry storms from overwhelming the pool.",
          ],
        },
        "Within 15 minutes of initial notification, database latency dropped back to under 15 ms, and floor workstations resumed scanning.",
      ],
    },
    {
      heading: "Proving zero data loss: reconciliation scripts",
      body: [
        "In an operational system, recovering connectivity is only half the battle. We had to prove to warehouse management that no router scans, stock deductions, or delivery records were dropped mid-transaction.",
        "We ran automated reconciliation scripts against the database audit log, comparing pre-release snapshots with post-incident tables. Because RPOMS wraps multi-table operations (such as deducting box consumables while registering router serials) in atomic database transactions, every in-flight operation that timed out rolled back cleanly. The post-incident audit verified that all 382 routers processed during that day's shift and 140 stock adjustments matched physical physical box counts exactly.",
      ],
    },
    {
      heading: "Permanent architectural guardrails",
      body: [
        "Following the incident, we implemented three structural safeguards across RPOMS:",
        {
          type: "list",
          items: [
            "Upgraded `/api/health` to perform an active database probe (`SELECT 1`) with a strict 2-second timeout, ensuring external uptime monitors detect database outages immediately.",
            "Configured client-side retry with exponential backoff and random jitter, preventing floor terminals from retrying simultaneously on connection failure.",
            "Added an explicit client-side connection timeout (`statement_timeout = 5000`) to guarantee runaway reporting queries cannot hold database connection slots indefinitely.",
          ],
        },
      ],
    },
  ],
};
