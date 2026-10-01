import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "supabase-google-sign-in-ios-pkce-without-google-sdk",
  title: "Google Sign-In on iOS Through Supabase, With PKCE and No Google SDK",
  description:
    "Google sign-in on iOS through Supabase with ASWebAuthenticationSession and PKCE, no Google SDK or client secret, plus an identity bug RLS would reject.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["Supabase", "OAuth", "PKCE", "iOS", "Swift", "Keychain", "Row Level Security"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Supabase Google Sign-In on iOS Without the Google SDK",
  relatedProjects: ["spendrop", "drivekeep"],
  relatedPosts: [
    "append-only-cloud-backup-supabase-storage-rls",
    "google-oidc-pkce-device-provisioning-revocable-tokens",
    "every-policy-was-correct-and-every-policy-was-inert",
    "supabase-google-sign-in-redirects-to-localhost-with-token",
  ],
  sections: [
    {
      heading: "Sign-in for a local-first app",
      body: [
        "[SpenDrop](/work/spendrop), an expense tracker, and [DriveKeep](/work/drivekeep), a fuel and maintenance log, are both iOS apps that work entirely on the phone with no account. Both also have optional sign-in, so that data can be backed up or synced to Supabase under row-level security. I wanted Google sign-in without adding Google's sign-in SDK, without shipping any secret in the app, and without holding the user's password.",
        "Supabase Auth makes that possible: it runs the Google OAuth exchange on its side, and the app only needs a browser session and a redirect back. This guide covers how both apps do it, the difference between the two flows they use, where the tokens live, and the identity mistake that would have made every policy reject every request. It is for iOS developers adding Supabase Auth with a social provider.",
      ],
    },
    {
      heading: "ASWebAuthenticationSession is the whole browser",
      body: [
        "Apple's `ASWebAuthenticationSession` is the supported way to run OAuth from an iOS app. It shows a system browser sheet the app cannot read into, follows the provider's pages, and returns control when the browser is redirected to a URL with the app's callback scheme. Both apps use it with `prefersEphemeralWebBrowserSession = false`, so an existing Google session in Safari can be reused, and both map the user cancelling the sheet to a distinct error so it is not reported as a failure.",
        "The app opens Supabase's authorize endpoint, not Google's: `/auth/v1/authorize?provider=google&redirect_to=<app scheme>`. Supabase redirects to Google, Google back to Supabase, and Supabase finally to the app's scheme, for example `spendrop://auth-callback`. That redirect URL has to be added to the allowed redirect list in the Supabase project, and the Google provider enabled there with its own client credentials, which never leave Supabase. The app ships only the project URL and the public anon key, read in SpenDrop from a git-ignored configuration file.",
      ],
    },
    {
      heading: "SpenDrop: authorization code with PKCE",
      body: [
        "SpenDrop uses the authorization code flow with PKCE (Proof Key for Code Exchange, RFC 7636). Before opening the browser it creates a random verifier and sends only its SHA-256 hash, the challenge. The redirect brings back a one-time code, and the app exchanges the code together with the original verifier. Anyone who intercepted the redirect has the code but not the verifier, so the code is useless to them.",
        {
          type: "code",
          lang: "swift",
          code: `public static func make() -> PKCE {
    var bytes = [UInt8](repeating: 0, count: 48)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    let verifier = Data(bytes).base64URLEncoded()
    return PKCE(verifier: verifier, challenge: challenge(for: verifier))
}

public static func challenge(for verifier: String) -> String {
    Data(SHA256.hash(data: Data(verifier.utf8))).base64URLEncoded()
}

// Authorize: provider=google, redirect_to, code_challenge, code_challenge_method=s256
// Callback:  spendrop://auth-callback?code=...
// Exchange:  POST /auth/v1/token?grant_type=pkce  { "auth_code": code, "code_verifier": verifier }`,
          caption: "From SpenDrop's AuthService.swift (the comments summarise the surrounding calls).",
        },
        "The callback is checked for an `error` or `error_description` first, then for a non-empty `code`. The tests include the challenge computed for the example verifier published in RFC 7636, so the hashing and base64url encoding are pinned to the standard rather than to my own expectations.",
      ],
    },
    {
      heading: "DriveKeep: the token in the URL fragment",
      body: [
        "DriveKeep, written earlier, uses the simpler implicit-style flow. It opens the same authorize endpoint without a code challenge, and Supabase redirects to `drivekeep://auth-callback#access_token=…&refresh_token=…&expires_in=3600`. The app parses the fragment, falling back to the query string, and stores the session.",
        "It also avoids the Google SDK and any client secret, and on iOS the redirect only reaches the app that started the session. But the tokens themselves travel in the redirect URL, which is exactly what PKCE was designed to avoid. If I were to bring the two apps together, DriveKeep would move to SpenDrop's PKCE flow.",
      ],
    },
    {
      heading: "Tokens in the Keychain, and what happens when they expire",
      body: [
        "Neither app keeps tokens in UserDefaults or the database. SpenDrop stores the access token, refresh token and user profile in the Keychain with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`, which keeps them off backups and other devices. In DriveKeep, a dedicated commit moved the Supabase session and configuration into the Keychain only.",
        "SpenDrop refreshes the access token whenever it is within 60 seconds of expiry. The failure cases are explicit: if the device is offline, the session is kept; if the server returns a 5xx error, the error is passed on; any other refresh failure means the refresh token is no longer valid, so the app signs out of the cloud with a message. Signing out, or deleting the cloud account, never touches local data, because in a local-first app the cloud is the optional part.",
        "DriveKeep learned that last rule the hard way. While adding real sign-in, I found its old sign-out handler cleared local data and then wrote demo records over it, and a cloud rebuild replaced local arrays wholesale, dropping anything not yet uploaded. The same commit made sign-out preserve local data and made the rebuild merge instead.",
      ],
    },
    {
      heading: "An identity that row-level security can actually check",
      body: [
        "Before that commit, DriveKeep's sign-in produced a user id on the phone, a SHA-256 hash of the email address. It looked like a stable id. But Supabase's row-level security policies compare a row's owner with `auth.uid()`, the id of the authenticated user in Supabase's own `auth.users` table, read from the JWT on each request. A hash computed on the phone exists in no database, so every policy would have rejected every write.",
        "The fix was to stop inventing an identity. The user id now comes from the Supabase session, the client sends the live JWT on every request and refreshes it when expired, and it falls back to the anon key only when genuinely signed out. The session is revalidated at launch before anything reads the current user id. Policies that are correct but can never match a real request are a recurring trap; [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert) describes a different version of it in another project.",
      ],
    },
    {
      heading: "What has and has not been verified",
      body: [
        "SpenDrop's sign-in is covered by 14 authentication checks in its in-app test runner, including the RFC 7636 vector, the Google code exchange, a cancelled or denied sheet, session restore, refresh, offline and expiry, and they pass on the iOS 27 simulator against an in-memory fake of the Supabase HTTP API. The real Google sheet and a live Supabase project have not been tested yet. DriveKeep's iOS app has not been built for its audit at all (the audit machine runs Windows and the project has no XCTest target), so its flow is described from the source code. Neither app is on the App Store.",
        "For the same pattern on the web, with PKCE used to provision devices, see [Google OIDC with PKCE for device provisioning](/blog/google-oidc-pkce-device-provisioning-revocable-tokens). What SpenDrop does with the session once it has one is covered in the article on its append-only cloud backup.",
      ],
    },
  ],
};
