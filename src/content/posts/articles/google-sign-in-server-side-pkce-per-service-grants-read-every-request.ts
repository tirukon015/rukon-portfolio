import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "google-sign-in-server-side-pkce-per-service-grants-read-every-request",
  title: "Google Sign-In Without a Client Library: Server-Side PKCE and Grants Read on Every Request",
  description:
    "RPOMS added Google sign-in through its Supabase project's provider with no client library in the browser bundle. Google proves who someone is and grants nothing; a Super Admin grants access per service and capability, and revocation takes effect on the next request.",
  date: "2026-10-20",
  category: "Full-Stack Development",
  tags: ["OAuth", "PKCE", "Supabase Auth", "Authorization", "Next.js", "Access Control"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Server-Side PKCE Google Sign-In With Supabase and Per-Service Authorization in Next.js",
  relatedProjects: ["rpoms", "rpoms-print-engine"],
  relatedPosts: [
    "sharing-one-supabase-project-between-two-apps",
    "refusing-runtime-ddl-on-production-schema-stamps-and-a-gate",
    "sending-labels-between-browser-tabs-broadcastchannel-coop-window-opener",
  ],
  sections: [
    {
      heading: "From shared role logins to named people",
      body: [
        "[RPOMS](/work/rpoms) ran for its first months on password logins shared per role, which its own case study lists as a limitation: the audit trail records a role and a session, not a person. As the system grew a Printing page, a Refining workstation and a Packaging screen used by different people on the floor, the question became how to let a named person in to exactly the screens their job needs, without a second identity system and without a client-side authentication library in a bundle that floor workstations load over a thin connection.",
        "The answer separates two things that are often fused: who someone is, and what they may do. Google answers the first. RPOMS answers the second, on every request.",
      ],
    },
    {
      heading: "Identity: Google through Supabase, PKCE on the server",
      body: [
        "Sign in with Google goes through the Google provider configured on the Supabase project, but the authorization-code exchange with PKCE happens on the server. The browser is redirected to Google and back; the code verifier never leaves the server; no Supabase client library ships to the browser and nothing is added to the bundle. The sign-in page was redesigned in RPOMS's own colours with no new dependency and no image.",
        "What Google proves is identity, and only identity. A new account is pending until a Super Admin approves it, and the approval chooses which services the person may open. RPOMS trusts only Supabase's Google identity record for the email, never user-editable metadata. One server setting lists exact emails that become active Super Admins on a verified Google sign-in, audited, so the first administrator can exist without anyone to approve them.",
        {
          type: "callout",
          label: "Two cookies, one source of truth",
          text: "RPOMS keeps its own signed session cookie. An account cookie carries the account and an epoch, and the account's status and grants are read on every request, so a revocation or a disabled account takes effect on the next request. Signing out of an account ends all of its sessions.",
        },
      ],
    },
    {
      heading: "Authorization: per service, per capability",
      body: [
        "Access is modelled as services, each with capabilities. A Super Admin's Access screen has four tabs: requests to approve with chosen services or reject; people, showing each person's effective permissions with grants per service and capability, a disable switch, and a Super Admin flag that can never be set on one's own account; services, which can be switched off for everyone, hidden from the portal, or reordered; and history, read from the existing audit log.",
        "The isolation is enforced on the server by one gate used by the Dashboard, Printing, Refining, Packaging and Delivery pages and by their API routes. A Printing-only account sees no Accepting, Refining, Packaging or Router History: the Registry tab bar shows only the tabs a person may open and none when one is left, and cross-links follow the same rule. Printing view-only is a read-only session list. Access requests name capabilities, approved staff can ask for more, and approval grants only what is ticked.",
        {
          type: "list",
          items: [
            "A services portal lists what this person may open, with direct addresses such as /printing and /refining that keep old bookmarks working.",
            "Password logins keep exactly their previous access, encoded as role defaults, so nothing changes for a role that has not moved to accounts.",
            "A switched-off service refuses everyone, including administrators, until it is switched back on.",
          ],
        },
      ],
    },
    {
      heading: "Why the account tables are optional",
      body: [
        "The account, account-service and service-setting tables come only from a reviewed migration file; the application never creates them on a shared database, in line with the release's rule against runtime DDL on production. That makes the whole feature optional at deployment time. Without the migration, password logins and every page work as before, Google sign-in is off, and an attempt to change access is refused with a message rather than failing silently.",
        "Reading grants on every request costs one indexed read per request and buys the property that matters most in an operations system: when a person leaves the line or changes job, the next click after the change is the one that is refused. The same model carries across to the [Print Engine](/work/rpoms-print-engine), where Google is also the identity provider and RPOMS the authority over who may print.",
      ],
    },
  ],
};
