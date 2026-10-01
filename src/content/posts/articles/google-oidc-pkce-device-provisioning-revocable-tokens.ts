import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "google-oidc-pkce-device-provisioning-revocable-tokens",
  title: "Google Sign-In for Shared Workstations: PKCE, Pending Users and Revocable Device Tokens",
  description:
    "Google OIDC with PKCE on a framework-free Node server, users keyed by sub, accounts that start pending, and workstations provisioned with hashed, revocable device tokens that keep working offline.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["OpenID Connect", "Google sign-in", "PKCE", "Node.js", "Device tokens", "Authentication"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Google OIDC, Device Provisioning and Revocable Tokens",
  relatedProjects: ["rpoms-print-engine"],
  relatedPosts: [
    "hmac-signed-session-cookies-without-a-library",
    "local-first-sync-conflict-policy-offline-pwa",
    "self-hosting-node-postgresql-nginx-systemd-ubuntu",
    "security-headers-for-a-web-bluetooth-pwa",
  ],
  sections: [
    {
      heading: "Two questions sign-in has to answer",
      body: [
        "The [RPOMS Print Engine](/work/rpoms-print-engine) runs on shared PCs on a production floor. Printing works with no server at all. A server matters for a fleet: someone has to decide who may print, who may edit label templates, and which workstations may sync with the central configuration. So the backend has to answer two separate questions. Who is this person? And is this particular PC still allowed to act?",
        "Google answers the first. The Print Engine's own server answers the second, with a token per workstation. This article walks through both, for anyone adding Google sign-in to an internal tool used on shared or offline-capable machines. The server is plain Node.js with no web framework, so every step is visible.",
      ],
    },
    {
      heading: "Authorization Code with PKCE, run by the backend",
      body: [
        "The browser never sees a Google token. The flow runs between the backend and Google:",
        {
          type: "flow",
          steps: [
            "Browser navigates to /api/auth/google/start",
            "Server creates state (16 random bytes) and a PKCE verifier (48 random bytes)",
            "Server stores both in a short-lived HMAC-signed cookie and redirects to Google with the S256 challenge",
            "Google redirects back to /api/auth/google/callback with a code",
            "Server checks the cookie signature and the state, exchanges the code with the verifier",
            "Server verifies the ID token and creates its own session",
          ],
        },
        "The state and verifier live in a signed cookie that lasts ten minutes rather than in server memory, so the server keeps no per-login state and a restart in the middle of a sign-in does no harm. The cookie is cleared after the callback. The `return` path after login must start with a single `/`, which closes the open-redirect hole where `//evil.example` would be treated as another host.",
        "Verifying the ID token is done by hand, which keeps the checks explicit. The token's header must say RS256. The key comes from Google's JWKS, cached for six hours, and if the token's key id is not in the cache the server refetches once, which is how Google's key rotation is absorbed. Then the claims: the issuer must be Google's, the audience must be this client id, the token must not be expired, and `email_verified` must be true.",
      ],
    },
    {
      heading: "Identity is sub, permission is ours",
      body: [
        "An e-mail address is not a stable identifier. Addresses get reassigned, and a Google account can change its address. Users are therefore keyed by Google's `sub` claim. The e-mail is used to display, to match allow-lists, and once, to adopt a user row created before `sub` was stored. If an address arrives with a different `sub` from the one on record, sign-in is refused with a message to ask an administrator, and the refusal is audited.",
        "A valid Google identity grants nothing by itself. A new user starts as pending unless their address is in the administrators' list or their domain is configured for automatic activation. An administrator activates them. Status and role are checked on every request, not only at login, so disabling someone deletes their live server sessions immediately, and a disabled account never receives a session at all. Administrators cannot disable or demote themselves, which keeps the system from losing its last administrator by accident.",
        "The session cookie is a random id signed with HMAC, `HttpOnly`, `Secure` and `SameSite=Strict`, backed by a server-side record with an expiry and an hourly cleanup. Every state-changing request also needs a custom `X-RPOMS-Client: web` header. A cross-site page cannot add that header without a CORS preflight, and only the app's own origin passes the preflight. The signing details are the same pattern as in [HMAC-signed session cookies without a library](/blog/hmac-signed-session-cookies-without-a-library).",
      ],
    },
    {
      heading: "Provisioning a workstation silently",
      body: [
        "A person's session is the wrong credential for background sync. It expires, and it belongs to a person, not to the PC. So after the first active login, the app silently calls a provisioning endpoint. The server creates a device record, names it from a database sequence (`RPOMS-PRINT-001`, `RPOMS-PRINT-002` and so on, with no chance of two workstations colliding), and returns a device token: 32 random bytes.",
        {
          type: "code",
          lang: "ts",
          code: "const token = randomToken(32);\ndevice = {\n  id: deviceId(await store.nextDeviceNumber()),\n  userId: user.id,\n  tokenHash: sha256(token),   // only the hash is stored\n  status: \"active\",\n  // ...name, timestamps, app version, printer\n};\nreturn { json: { device: publicDevice(device), deviceToken: token, /* ... */ } };",
          caption: "Simplified from the provisioning route.",
        },
        "The server stores only the SHA-256 of the token. A leaked database does not leak working tokens. The token is scoped: it is accepted by the sync and configuration routes, and by nothing administrative. Provisioning again from the same user's active device renews the token and replaces the hash, so an old copy stops working.",
        "Each request authenticated by a device token looks the device up by the token's hash and then checks two things: the device is still active, and its user is still active. Revoking a workstation is one status change. Its next request gets a 403 with the code `DEVICE_REVOKED`, and the app signs out with that reason on screen. Other workstations are unaffected; a server test revokes one device while another keeps syncing.",
        "Workstations also report their app version, connected printer and last sync time, which administrators see per device. Every login, refusal, provisioning and administrative change goes into an audit log with the actor, target and IP address.",
      ],
    },
    {
      heading: "Working offline without becoming permanent",
      body: [
        "After provisioning, the workstation stores a local session in IndexedDB: the employee, the device, the device token, and the time the server last confirmed them. On the next boot it uses that session immediately, with no network request. When it is online it re-verifies in the background. Offline, it keeps working for at most 30 days after the last successful verification. After that, the employee has to come back online.",
        "That window is the compromise between two real requirements. The line must keep printing through an internet outage, so the app cannot demand a server on every boot. And someone who leaves the company must not keep a working station forever. Thirty days bounds the second without breaking the first, and a revoked device or disabled user is cleared on the first online check.",
        {
          type: "callout",
          label: "Accepted risk",
          text: "The device token sits in the workstation's IndexedDB, so anyone with access to that PC's operating system account can read it. I accepted that and wrote it down: the mitigations are the OS login, the token's narrow scope, and server-side revocation. Binding sessions to IP address or user agent was considered and rejected, because floor PCs change networks.",
        },
      ],
    },
    {
      heading: "Rate limiting the expensive routes",
      body: [
        "Sign-in and provisioning are the routes worth abusing: each one can trigger calls to Google and writes to the database. The backend limits them per client IP, 30 requests per 10 minutes by default, answering 429 with a `Retry-After` header. Behind nginx it trusts `X-Forwarded-For` only when told to. The in-process limiter resets when the service restarts, so nginx applies its own limit to the same routes and covers that gap.",
      ],
    },
    {
      heading: "What is tested and what is not",
      body: [
        "The server's tests run the whole flow end to end against a fake identity provider: login, pending and active users, roles, the CSRF header, provisioning, revocation, rate limiting and the audit log. The PostgreSQL store tests run in CI against a real Postgres 16. The backend is deployed with Google sign-in configured, and its health endpoint reports it. A complete production round trip, signing in with a real Google account, being activated and provisioning a workstation, has not been recorded yet.",
      ],
    },
  ],
};
