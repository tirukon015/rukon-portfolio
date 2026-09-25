import { NextResponse } from "next/server";
import { isDocumentSourceConfigured } from "@/lib/cv-access/document";
import { grantCookie, verifyGrantToken } from "@/lib/cv-access/grant";
import { loadProtectedContact } from "@/lib/cv-access/protected-contact";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow" };

/**
 * The only route that can produce the email, phone and address.
 *
 * Same gate as the document route: a signed cookie this server issued. The
 * values are never rendered into the page, so the locked state has nothing in
 * it to un-blur, and a visitor who has not submitted the form receives a 401
 * with no contact data attached.
 */
export async function GET(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${grantCookie.name}=`));

  const token = cookie?.slice(grantCookie.name.length + 1);

  if (!verifyGrantToken(token)) {
    return NextResponse.json(
      { error: "Access has not been granted, or the grant has expired." },
      { status: 401, headers: NO_STORE }
    );
  }

  const result = loadProtectedContact();
  if (!result.ok) {
    console.error("CV contact requested but CV_CONTACT_* environment variables are not configured.");
    return NextResponse.json(
      { error: "Contact details are temporarily unavailable. Please reach me through LinkedIn." },
      { status: 503, headers: NO_STORE }
    );
  }

  const documentAvailable = isDocumentSourceConfigured();
  return NextResponse.json(
    { ok: true, contact: result.contact, documentAvailable },
    { headers: NO_STORE }
  );
}

