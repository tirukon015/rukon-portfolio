import { mockCVAccessService } from "./mock-service";
import type { CVAccessService } from "./types";

export type {
  CVAccessRecord,
  CVAccessRequest,
  CVAccessResult,
  CVAccessService,
} from "./types";

/**
 * The single place an implementation is chosen.
 *
 * ==========================================================================
 * FUTURE SUPABASE INTEGRATION POINT
 * ==========================================================================
 * When the `cv_access_requests` table exists, add a `SupabaseCVAccessService`
 * implementing `CVAccessService` and select it here, for example:
 *
 *   if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
 *     return supabaseCVAccessService;
 *   }
 *
 * following the same "chosen by which environment variables are present"
 * pattern the rest of my work uses, so no caller changes and the mock stays
 * available for local development.
 *
 * Nothing above this function needs to know which one it got.
 */
export function getCVAccessService(): CVAccessService {
  return mockCVAccessService;
}

/**
 * Which release of the CV is currently being handed out.
 *
 * Recorded against each access request so that a request made today can be
 * matched to the document that was actually served.
 */
export const CV_VERSION = "2026-09";

/** Filename offered to the browser on download. */
export const CV_DOWNLOAD_FILENAME = "Touhidul-Islam-Rukon-CV.pdf";
