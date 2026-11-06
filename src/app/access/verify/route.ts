import { NextResponse } from "next/server";
import { verifyMagicToken, SESSION_COOKIE_NAME, DEFAULT_SESSION_MAX_AGE } from "@/lib/access/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/access?error=missing_token", request.url));
  }

  const result = verifyMagicToken(token);
  if (!result.valid || !result.sessionToken) {
    return NextResponse.redirect(new URL("/access?error=invalid_or_expired", request.url));
  }

  const response = NextResponse.redirect(new URL("/work/rpoms?unlocked=true", request.url));

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: result.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEFAULT_SESSION_MAX_AGE,
  });

  return response;
}
