import { NextResponse } from "next/server";
import { CV_VERSION, getCVAccessService } from "@/lib/cv-access";
import { createGrantToken, grantCookie, isGrantConfigured } from "@/lib/cv-access/grant";

export const runtime = "nodejs";

type Payload = {
  fullName?: string;
  email?: string;
  source?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const ALLOWED_SOURCES = new Set(["hero", "about", "contact", "direct"]);

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const rawSource = body.source?.trim() ?? "direct";
  // The source is a UI hint, so it is constrained to a known set rather than
  // stored as free text a caller could put anything into.
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "direct";

  if (!fullName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (fullName.length > 200 || email.length > 320) {
    return NextResponse.json({ error: "One of those fields is too long." }, { status: 400 });
  }
  if (/[\r\n]/.test(fullName) || /[\r\n]/.test(email)) {
    return NextResponse.json({ error: "Invalid characters in a field." }, { status: 400 });
  }

  // Refuse before recording anything, so a visitor is never told access was
  // granted by a deployment that cannot then serve the document.
  if (!isGrantConfigured()) {
    console.error("CV access requested but CV_ACCESS_SECRET is not configured.");
    return NextResponse.json(
      { error: "CV access isn't available right now. Please email me and I'll send it directly." },
      { status: 503 }
    );
  }

  const service = getCVAccessService();
  const result = await service.requestCVAccess({ fullName, email, cvVersion: CV_VERSION, source });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const token = createGrantToken();
  if (!token) {
    return NextResponse.json(
      { error: "CV access isn't available right now. Please email me and I'll send it directly." },
      { status: 503 }
    );
  }

  // The record id is echoed so the client has something to quote if a request
  // needs chasing. Nothing else about the record is returned.
  const response = NextResponse.json({ ok: true, reference: result.record.id });
  response.cookies.set(grantCookie.name, token, grantCookie.options);
  return response;
}
