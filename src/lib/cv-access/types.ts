/**
 * CV access: the contract between the UI and whatever is storing access records.
 *
 * The UI depends on this file and never on an implementation, so replacing the
 * mock with Supabase is a change in one factory (`./index.ts`) rather than a
 * change in the page.
 */

/** What the visitor supplies. Name and email only: see the note on identity below. */
export type CVAccessRequest = {
  fullName: string;
  email: string;
  /** Which build of the CV was released. Recorded so a later request is attributable. */
  cvVersion: string;
  /** Where the request came from, e.g. "hero", "about", "contact", "direct". */
  source: string;
};

/**
 * A stored access record.
 *
 * Mirrors the future `cv_access_requests` table:
 *
 *   id           uuid primary key
 *   full_name    text not null
 *   email        text not null
 *   accessed_at  timestamptz not null default now()
 *   cv_version   text not null
 *   source       text
 *
 * Deliberately absent: IP address, user agent, fingerprint. Nothing here is
 * collected that the access log does not actually need, and none of it
 * establishes who the visitor is.
 */
export type CVAccessRecord = {
  id: string;
  fullName: string;
  email: string;
  accessedAt: string;
  cvVersion: string;
  source: string;
};

export type CVAccessResult =
  | { ok: true; record: CVAccessRecord }
  | { ok: false; error: string };

export interface CVAccessService {
  /**
   * Record an access request and decide whether to grant access.
   *
   * This is an access log, not an identity check. Nothing about a name and an
   * email address proves who submitted them, and no part of this system treats
   * the values as verified.
   */
  requestCVAccess(request: CVAccessRequest): Promise<CVAccessResult>;
}
