import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The access grant.
 *
 * The gate has to be enforced on the server, because anything the browser
 * decides can be decided differently by a browser I do not control. So the
 * document route does not ask the page whether access was granted: it verifies
 * a signed cookie that only this server can mint.
 *
 * This authorises one thing, fetching the document. It does not authenticate
 * anybody. A name and an email address are not identity, and nothing here
 * pretends otherwise.
 */

const COOKIE_NAME = "cv_access";
const MAX_AGE_SECONDS = 60 * 60 * 12;

/**
 * In production the secret must be configured, and the document route refuses
 * to serve without it rather than falling back to something guessable. In
 * development a per-process random secret keeps the flow working with no setup;
 * it dies with the process, which is the correct scope for a dev secret.
 */
let devSecret: string | undefined;

function getSecret(): string | null {
  const configured = process.env.CV_ACCESS_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") return null;
  devSecret ??= randomBytes(32).toString("hex");
  return devSecret;
}

export function isGrantConfigured(): boolean {
  return getSecret() !== null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** `<expiry-epoch-seconds>.<signature>` */
export function createGrantToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(expiry);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyGrantToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const provided = token.slice(separator + 1);

  const expected = sign(payload, secret);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, so that is checked first.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiry = Number(payload);
  return Number.isFinite(expiry) && expiry > Math.floor(Date.now() / 1000);
}

export const grantCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  },
};
