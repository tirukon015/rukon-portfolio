/**
 * The three contact fields that are only released after an access grant.
 *
 * Read from the environment, never written into source. This repository is
 * public, so a value committed here would be published the moment it was
 * pushed, which is exactly what the gate exists to prevent. Environment
 * variables keep them out of the repository and out of the client bundle: this
 * module is imported only by the route handler, so nothing here is ever sent to
 * a browser that has not earned it.
 *
 * ==========================================================================
 * FUTURE SUPABASE INTEGRATION POINT
 * ==========================================================================
 * When `cv_access_requests` and the protected profile live in Supabase, replace
 * the body of `loadProtectedContact` with a service-role read. The route above
 * it does not care where the values come from.
 */

export type ProtectedContact = {
  email: string;
  phone: string;
  address: string;
};

export type ProtectedContactResult =
  | { ok: true; contact: ProtectedContact }
  | { ok: false; reason: "not-configured" };

export function loadProtectedContact(): ProtectedContactResult {
  const email = process.env.CV_CONTACT_EMAIL?.trim();
  const phone = process.env.CV_CONTACT_PHONE?.trim();
  const address = process.env.CV_CONTACT_ADDRESS?.trim();

  // All three or none. A partially configured deployment would reveal some
  // fields and silently fail the others, which reads as a bug to the visitor.
  if (!email || !phone || !address) return { ok: false, reason: "not-configured" };

  return { ok: true, contact: { email, phone, address } };
}
