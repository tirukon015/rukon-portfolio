import {
  approveAccessRequest,
  rejectAccessRequest,
  verifyDecisionToken,
  listAccessRequests,
} from "@/lib/access/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token");

  if (!id || !action || !token) {
    return new Response("Invalid or missing parameters.", { status: 400 });
  }

  if (!verifyDecisionToken(id, token)) {
    return new Response("Invalid or forged decision token.", { status: 403 });
  }

  const all = listAccessRequests();
  const target = all.find((r) => r.id === id);
  if (!target) {
    return new Response("Request record not found.", { status: 404 });
  }

  if (action === "approve") {
    await approveAccessRequest(id, 7);
  } else if (action === "reject") {
    rejectAccessRequest(id, "Rejected via 1-click admin email action");
  } else {
    return new Response("Unsupported action.", { status: 400 });
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Decision Recorded — rukon.dev</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #05070a; color: #edf1f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { max-width: 480px; width: 100%; background: #0b0f14; border: 1px solid rgba(233,240,244,.12); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { font-size: 20px; margin-top: 0; color: #4fb2e0; }
        p { color: #99a3ad; font-size: 14px; line-height: 1.6; }
        .badge { display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; }
        .badge-approved { background: rgba(79,178,224,0.15); color: #4fb2e0; border: 1px solid rgba(79,178,224,0.3); }
        .badge-rejected { background: rgba(224,79,79,0.15); color: #e04f4f; border: 1px solid rgba(224,79,79,0.3); }
        .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; font-size: 13px; font-weight: 500; border-radius: 9999px; text-decoration: none; background: #10151c; border: 1px solid rgba(233,240,244,.18); color: #edf1f4; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Action Recorded</h1>
        <p>The request from <strong>${escapeHtml(target.name)}</strong> (${escapeHtml(target.email)}) has been updated.</p>
        <p>Status: <span class="badge ${action === "approve" ? "badge-approved" : "badge-rejected"}">${action === "approve" ? "Approved (7 Days)" : "Rejected"}</span></p>
        ${action === "approve" ? "<p>A secure magic link was automatically sent to the requester.</p>" : "<p>The request was marked rejected.</p>"}
        <a href="/admin/access-requests" class="btn">Go to Access Admin Dashboard &rarr;</a>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
