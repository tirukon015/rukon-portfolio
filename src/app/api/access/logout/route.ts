import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/access/service";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/?logged_out=true", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
