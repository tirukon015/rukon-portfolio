import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifyAccessSession } from "@/lib/access/service";

/**
 * Checks whether the incoming Server Component request is from an
 * authorized visitor who has an approved, active access grant.
 */
export async function isAuthorizedSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;
    return await verifyAccessSession(token);
  } catch {
    // During build time SSG or static generation where cookies() throws or is absent,
    // safely return false so only public anonymized data is pre-rendered.
    return false;
  }
}
