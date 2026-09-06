import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where the protected document actually comes from.
 *
 * Today it is a file under `private/` at the repository root, which is outside
 * `public/` and therefore has no static URL: the only way to reach it is
 * through the document route, which checks the grant first.
 *
 * ==========================================================================
 * FUTURE PRIVATE-STORAGE INTEGRATION POINT
 * ==========================================================================
 * To move the document into Supabase Storage (a private bucket), replace the
 * body of `loadCVDocument` with a download through the service-role client, or
 * add a second implementation selected by environment variable. The route above
 * it does not care where the bytes come from, so nothing else changes.
 */

export type CVDocument =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; reason: "not-found" };

const CV_PATH = path.join(process.cwd(), "private", "cv", "Touhidul-Islam-Rukon-CV.pdf");

export async function loadCVDocument(): Promise<CVDocument> {
  try {
    const bytes = await readFile(CV_PATH);
    return { ok: true, bytes: new Uint8Array(bytes), contentType: "application/pdf" };
  } catch {
    // A missing document is an operational problem, not a client error. The
    // route turns this into a 503 with an explanation rather than a blank 404.
    return { ok: false, reason: "not-found" };
  }
}
