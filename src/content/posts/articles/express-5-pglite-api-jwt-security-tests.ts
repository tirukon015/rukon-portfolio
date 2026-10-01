import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "express-5-pglite-api-jwt-security-tests",
  title: "A Postgres-Backed Express 5 API With No Database Server: PGlite, JWT and Security Tests",
  description:
    "DriveKeep's backend runs PostgreSQL in-process with PGlite, signs HS256 tokens and has 17 security checks. What it does well and what must change first.",
  date: "2027-01-03",
  category: "Full-Stack Development",
  tags: ["Express 5", "PGlite", "PostgreSQL", "JWT", "API Security", "Node.js", "Testing"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Express 5 + PGlite API With JWT and Security Tests",
  relatedProjects: ["drivekeep"],
  relatedPosts: [
    "testing-postgres-in-vitest-with-pglite-and-postgres-js",
    "testing-every-nextjs-api-route-refuses-without-session",
    "offline-sync-deletes-tombstones-last-write-wins",
    "hmac-signed-session-cookies-without-a-library",
  ],
  sections: [
    {
      heading: "A backend that needs no database server",
      body: [
        "[DriveKeep](/work/drivekeep), my fuel and maintenance log, is one repository with three parts: an iOS app, a Next.js web app, and a standalone backend API. The backend is the part neither app uses yet. It was built to become the one API both clients share, and it is complete and tested on its own, which makes it a useful thing to describe honestly: what an Express 5 API on PGlite looks like, what its security tests cover, and what a careful read of the code says must change before it goes anywhere near a client.",
        "This article is for Node.js developers who want real PostgreSQL behaviour in a small API or its tests without running a database server.",
      ],
    },
    {
      heading: "PGlite: PostgreSQL in the same process",
      body: [
        "PGlite is PostgreSQL compiled to WebAssembly, running inside the Node.js process. Point it at a folder and it persists there; create it with no folder and it is in memory. The backend wraps it in a tiny client with the two methods the routes need:",
        {
          type: "code",
          lang: "ts",
          code: `import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

export async function getDatabase(options: { inMemory?: boolean; dataDir?: string } = {}) {
  if (options.inMemory) {
    const inMemDb = new PGlite();
    await inMemDb.waitReady;
    return inMemDb;
  }
  if (!dbInstance) {
    dbInstance = new PGlite(options.dataDir || config.dataDir);   // folder created if missing
    await dbInstance.waitReady;
  }
  return dbInstance;
}`,
          caption: "Simplified from backend/src/db/client.ts.",
        },
        "Because it is real PostgreSQL, the schema uses real features: UUID keys, `timestamptz`, constraints, a `users` table that owns every record, an audit log, and tombstones for sync deletes. Nothing has to be rewritten to move to a hosted PostgreSQL later; only the client changes. A related article shows the same idea used for tests in another project: [Testing Postgres in Vitest with PGlite](/blog/testing-postgres-in-vitest-with-pglite-and-postgres-js).",
      ],
    },
    {
      heading: "Migrations with a checksum ledger",
      body: [
        "Schema changes are plain SQL files, `001_initial_schema`, `002_receipt_attachments` and `003_audit_and_sync_tombstones`, applied in order by a small runner. It records each applied file in a `_schema_migrations` table together with a SHA-256 checksum of its contents, applies each new file inside a transaction with its ledger row, and rolls back on failure. If a file that was already applied has since been edited, the checksums differ and the runner warns.",
        "Backup, restore and backup-verification scripts sit next to it, with a runbook in the backend's docs. They are outside the scope of this article.",
      ],
    },
    {
      heading: "HS256 JWTs in about eighty lines",
      body: [
        "Authentication is a hand-written HS256 JWT module using Node's `crypto`. Signing builds the header and payload, adds `iat` and `exp`, and signs with HMAC-SHA256. Verification recomputes the signature over the received header and payload and compares it in constant time:",
        {
          type: "code",
          lang: "ts",
          code: `const expectedSignature = crypto.createHmac('sha256', secret).update(dataToVerify).digest();
const expectedBuf = Buffer.from(base64UrlEncode(expectedSignature));
const actualBuf = Buffer.from(signatureB64);

if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
  return { valid: false, error: 'Invalid signature' };
}`,
          caption: "From backend/src/auth/jwt.ts.",
        },
        "One property is worth pointing out. The verifier never reads the token's header, so it never trusts the header's `alg`. The classic JWT attacks, `alg: none` or switching algorithms, have nothing to work with: every token is checked with HMAC-SHA256 and the server's secret, whatever it claims. Middleware requires `Authorization: Bearer <token>`, returns a structured 401 with the code `UNAUTHORIZED` otherwise, and puts the token's `sub` on the request as the user id. Every query is then scoped to that id.",
      ],
    },
    {
      heading: "What the security suite checks",
      body: [
        "The API is tested by starting the real Express app on an ephemeral HTTP server and making real requests. The security suite has 17 checks across eight scenarios:",
        {
          type: "table",
          head: ["Scenario", "Expected result"],
          rows: [
            ["No Authorization header", "401, code UNAUTHORIZED"],
            ["Token with a forged signature", "401, \"Invalid signature\""],
            ["Token that expired 100 seconds ago", "401, an expiry message"],
            ["User B reads, updates or deletes user A's vehicle", "404 each time"],
            ["SQL injection in a path parameter", "400 from the UUID validator"],
            ["SQL injection in a JSON body", "201, stored as a literal name; the table still exists"],
            ["Malformed JSON body", "an error envelope, no crash"],
            ["Non-UUID identifier", "400 explaining the UUID format"],
          ],
        },
        "Cross-user access returns 404, not 403, so a caller cannot even learn that another user's record exists. The full run is 12 database checks, 35 API checks and these 17: 64 of 64 on the latest commit. For the same discipline applied to every route of a Next.js app, see [Testing That Every Next.js API Route Refuses Without a Session](/blog/testing-every-nextjs-api-route-refuses-without-session).",
      ],
    },
    {
      heading: "What has to change before a client uses it",
      body: [
        "Reading the code closely turns up things the tests do not cover, and they are the reason the backend is described as built, not ready:",
        {
          type: "list",
          items: [
            "A development endpoint, `POST /api/v1/auth/dev-token`, issues a 30-day token for any user id in the request body, with no authentication and no check that the server is in development mode. On a reachable server it would let anyone act as anyone. It needs to be removed or gated on the environment.",
            "The JWT secret falls back to a built-in development value when `JWT_SECRET` is not set. Production should refuse to start instead.",
            "The verifier only rejects an expired token if it has an `exp` claim. Tokens this server signs always have one, but a missing `exp` should be a rejection.",
            "The malformed-JSON test accepts either 400 or 500. A body that does not parse is a client error and should be pinned to 400.",
            "The API and security suites expect a database that has already been migrated and seeded. On a fresh checkout `npm test` passes the database suite and then fails with `relation \"users\" does not exist`; it passes 64 of 64 only after `npm run migrate` and `npm run seed`. The fix is for the suite to create its own in-memory database, which PGlite makes easy.",
          ],
        },
        "Separately, ESLint run over the whole repository reports 30 errors in the backend's CommonJS scripts, because the root configuration does not exclude them; the web source lints clean.",
        {
          type: "callout",
          label: "Status",
          text: "The backend is not connected to either app and is not deployed. The iOS app syncs to Supabase, the web app (live on Vercel, no sign-in) uses its own database, and pointing both at one backend is on the roadmap. How the backend's sync deletes work is covered in the article on tombstones.",
        },
      ],
    },
  ],
};
