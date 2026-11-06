import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminSession,
  ADMIN_COOKIE_NAME,
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccessRequest,
} from "@/lib/access/service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!verifyAdminSession(adminToken)) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, expiresInDays, reason } = body;

    let updated = null;
    if (action === "approve") {
      updated = await approveAccessRequest(id, Number(expiresInDays) || 7);
    } else if (action === "reject") {
      updated = rejectAccessRequest(id, reason);
    } else if (action === "revoke") {
      updated = revokeAccessRequest(id);
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, request: updated });
  } catch (err) {
    console.error("Admin request action error:", err);
    return NextResponse.json({ error: "Failed to perform action." }, { status: 500 });
  }
}
