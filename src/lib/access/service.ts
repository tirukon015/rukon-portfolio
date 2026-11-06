import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { site } from "@/content/site";
import { readAccessData, saveRequest, logAction } from "./store";
import type { AccessRequest } from "./types";

const ACCESS_SECRET =
  process.env.ACCESS_SECRET ||
  process.env.CV_ACCESS_SECRET ||
  "rukon-portfolio-access-hmac-key-2026";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || "rukon-admin-access-key-2026";

export const SESSION_COOKIE_NAME = "portfolio_auth_session";
export const ADMIN_COOKIE_NAME = "portfolio_admin_session";
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return true;
}

export async function submitAccessRequest(data: {
  name: string;
  email: string;
  company?: string;
  role?: string;
  reason: string;
}): Promise<AccessRequest> {
  const id = `req_${Date.now()}_${randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString();

  const request: AccessRequest = {
    id,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company?.trim(),
    role: data.role?.trim(),
    reason: data.reason.trim(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  saveRequest(request);
  logAction("request_submitted", id, `Request submitted by ${request.name} (${request.email})`);

  // Send Resend notification if key is configured
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const decisionToken = sign(`${id}:decision`, ACCESS_SECRET);
      const approveUrl = `https://${site.canonicalHost}/api/access/decision?id=${id}&action=approve&token=${decisionToken}`;
      const rejectUrl = `https://${site.canonicalHost}/api/access/decision?id=${id}&action=reject&token=${decisionToken}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio Access <onboarding@resend.dev>",
          to: [site.email],
          subject: `[Portfolio] Confidential Portfolio Access Request: ${request.name}`,
          html: `
            <h2>New Portfolio Access Request</h2>
            <p><strong>Name:</strong> ${request.name}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Company:</strong> ${request.company || "N/A"}</p>
            <p><strong>Role:</strong> ${request.role || "N/A"}</p>
            <p><strong>Reason:</strong> ${request.reason}</p>
            <hr />
            <p><strong>Quick Decision (1-Click):</strong></p>
            <p>
              <a href="${approveUrl}" style="background:#1c85b8;color:#fff;padding:8px 16px;text-decoration:none;border-radius:4px;margin-right:10px;">Approve Access</a>
              <a href="${rejectUrl}" style="background:#e04f4f;color:#fff;padding:8px 16px;text-decoration:none;border-radius:4px;">Reject</a>
            </p>
            <p><small>Or manage at <a href="https://${site.canonicalHost}/admin/access-requests">Admin Dashboard</a></small></p>
          `,
        }),
      });
    } catch (err) {
      console.error("Failed to dispatch Resend notification email:", err);
    }
  }

  return request;
}

export function listAccessRequests(): AccessRequest[] {
  return readAccessData().requests;
}

export function getAccessAuditLogs() {
  return readAccessData().logs;
}

export async function approveAccessRequest(
  id: string,
  expiresInDays = 7
): Promise<AccessRequest | null> {
  const store = readAccessData();
  const request = store.requests.find((r) => r.id === id);
  if (!request) return null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const rawToken = randomBytes(16).toString("hex");
  const magicToken = `${id}.${rawToken}.${sign(`${id}:${rawToken}`, ACCESS_SECRET)}`;

  request.status = "approved";
  request.approvedAt = now.toISOString();
  request.updatedAt = now.toISOString();
  request.expiresAt = expiresAt;
  request.magicToken = magicToken;

  saveRequest(request);
  logAction("approved", id, `Approved access for ${request.name} until ${expiresAt}`);

  // Dispatch approval email to requester
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const magicLink = `https://${site.canonicalHost}/access/verify?token=${magicToken}`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Touhidul Islam Rukon <onboarding@resend.dev>",
          to: [request.email],
          subject: "Your Access to Touhidul Islam Rukon's Confidential Portfolio",
          html: `
            <p>Hi ${request.name},</p>
            <p>Your request to view the full confidential portfolio and original case studies on rukon.dev has been approved.</p>
            <p><a href="${magicLink}" style="background:#1c85b8;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">View Original Portfolio</a></p>
            <p>This access link is valid for ${expiresInDays} days.</p>
            <p>Best regards,<br/>Touhidul Islam Rukon</p>
          `,
        }),
      });
    } catch (err) {
      console.error("Failed to send approval magic link email:", err);
    }
  }

  return request;
}

export function rejectAccessRequest(id: string, reason?: string): AccessRequest | null {
  const store = readAccessData();
  const request = store.requests.find((r) => r.id === id);
  if (!request) return null;

  request.status = "rejected";
  request.updatedAt = new Date().toISOString();
  request.decisionReason = reason;
  saveRequest(request);
  logAction("rejected", id, `Rejected access request for ${request.name}. Reason: ${reason || "None specified"}`);

  return request;
}

export function revokeAccessRequest(id: string): AccessRequest | null {
  const store = readAccessData();
  const request = store.requests.find((r) => r.id === id);
  if (!request) return null;

  request.status = "revoked";
  request.updatedAt = new Date().toISOString();
  request.sessionToken = undefined;
  request.magicToken = undefined;
  saveRequest(request);
  logAction("revoked", id, `Revoked access for ${request.name} (${request.email})`);

  return request;
}

export function verifyDecisionToken(id: string, token: string): boolean {
  const expectedSig = sign(`${id}:decision`, ACCESS_SECRET);
  return token === expectedSig;
}

export function verifyMagicToken(token: string): { valid: boolean; request?: AccessRequest; sessionToken?: string } {
  if (!token) return { valid: false };
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };

  const [id, rawToken, signature] = parts;
  if (!verifySignature(`${id}:${rawToken}`, signature, ACCESS_SECRET)) {
    return { valid: false };
  }

  const store = readAccessData();
  const request = store.requests.find((r) => r.id === id);
  if (!request || request.status !== "approved") {
    return { valid: false };
  }

  if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
    return { valid: false };
  }

  // Create persistent session token
  const expiry = Math.floor(new Date(request.expiresAt || "").getTime() / 1000) || Math.floor(Date.now() / 1000) + DEFAULT_SESSION_MAX_AGE;
  const sessionToken = `${id}.${expiry}.${sign(`${id}:${expiry}`, ACCESS_SECRET)}`;

  request.sessionToken = sessionToken;
  saveRequest(request);
  logAction("session_authenticated", id, `Session created for ${request.name}`);

  return { valid: true, request, sessionToken };
}

export async function verifyAccessSession(token: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [id, expiryStr, signature] = parts;
  if (!verifySignature(`${id}:${expiryStr}`, signature, ACCESS_SECRET)) {
    return false;
  }

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const store = readAccessData();
  const request = store.requests.find((r) => r.id === id);
  if (!request || request.status !== "approved") {
    return false;
  }

  return true;
}

export function createAdminSession(): string {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours
  return `${expiry}.${sign(`admin:${expiry}`, ADMIN_SECRET)}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expiryStr, signature] = parts;
  if (!verifySignature(`admin:${expiryStr}`, signature, ADMIN_SECRET)) {
    return false;
  }

  const expiry = Number(expiryStr);
  return Number.isFinite(expiry) && expiry > Math.floor(Date.now() / 1000);
}
