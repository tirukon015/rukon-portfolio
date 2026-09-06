import { NextResponse } from "next/server";
import { CV_DOWNLOAD_FILENAME } from "@/lib/cv-access";
import { loadCVDocument } from "@/lib/cv-access/document";
import { grantCookie, verifyGrantToken } from "@/lib/cv-access/grant";

export const runtime = "nodejs";

/**
 * The only route that can produce the CV.
 *
 * The document lives outside `public/`, so this is the single door to it, and
 * it is shut unless the request carries a grant this server signed. The page's
 * own idea of whether access was granted is never consulted.
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
      {
        status: 401,
        // Never let an intermediary keep a copy of this response, in either state.
        headers: { "Cache-Control": "no-store, private" },
      }
    );
  }

  const document = await loadCVDocument();
  if (!document.ok) {
    console.error("CV grant verified but the document could not be read.");
    return NextResponse.json(
      { error: "The CV is temporarily unavailable. Please email me and I'll send it directly." },
      { status: 503, headers: { "Cache-Control": "no-store, private" } }
    );
  }

  const url = new URL(request.url);
  const disposition = url.searchParams.get("disposition") === "attachment" ? "attachment" : "inline";

  return new NextResponse(document.bytes as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": document.contentType,
      "Content-Length": String(document.bytes.byteLength),
      "Content-Disposition": `${disposition}; filename="${CV_DOWNLOAD_FILENAME}"`,
      // Private and uncacheable: a shared cache must not hold a document that
      // was only released to one visitor.
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
