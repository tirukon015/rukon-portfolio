import { NextResponse } from "next/server";
import { submitAccessRequest } from "@/lib/access/service";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, role, reason } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Please briefly describe why you are requesting access (e.g. role, recruitment, evaluation)." },
        { status: 400 }
      );
    }

    if (name.length > 150 || email.length > 250 || reason.length > 2000) {
      return NextResponse.json({ error: "One of the submitted fields exceeds length limits." }, { status: 400 });
    }

    const record = await submitAccessRequest({
      name,
      email,
      company,
      role,
      reason,
    });

    return NextResponse.json({
      ok: true,
      message: "Access request received. You will receive an email once your access is approved.",
      id: record.id,
    });
  } catch (err) {
    console.error("Failed to process access request:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
