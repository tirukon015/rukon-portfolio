import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Where the protected document comes from.
 *
 * The real CV is not in this repository. It cannot be: the repository is
 * public, so a committed PDF is a published PDF regardless of which directory
 * it sits in. `private/` only means "not served as a static asset by Next"; it
 * never meant private from the world.
 *
 * Two sources, chosen by which environment variables are present, matching the
 * pattern used elsewhere in my work:
 *
 *   1. Private storage over HTTPS (`CV_DOCUMENT_URL`, optionally with
 *      `CV_DOCUMENT_TOKEN`). This is the production path. The URL is read
 *      server-side only and is never sent to a browser, so a Vercel Blob
 *      private URL, a Supabase signed URL, or any other authenticated endpoint
 *      all work without a code change.
 *   2. A local file under `private/cv/`, for development. That directory is
 *      git-ignored, so the file exists on my machine and in no commit.
 *
 * With neither configured the route answers 503 with an explanation, which is
 * the honest failure: better than shipping a deployment that claims to have a
 * CV and then serves nothing.
 */

export type CVDocument =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; reason: "not-configured" | "fetch-failed" };

export function getLocalCVPath(): string {
  const primaryPath = path.join(process.cwd(), "private", "cv", "Touhidul-Islam-Rukon-CV.pdf");
  if (existsSync(/*turbopackIgnore: true*/ primaryPath)) return primaryPath;

  const nestedPath = path.join(process.cwd(), "rukon-portfolio-main", "private", "cv", "Touhidul-Islam-Rukon-CV.pdf");
  if (existsSync(/*turbopackIgnore: true*/ nestedPath)) return nestedPath;

  return primaryPath;
}

async function loadFromPrivateStorage(url: string): Promise<CVDocument> {
  const token = process.env.CV_DOCUMENT_TOKEN?.trim();

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`CV private storage responded ${res.status}.`);
      return { ok: false, reason: "fetch-failed" };
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") {
      console.error("CV private storage returned something that is not a PDF.");
      return { ok: false, reason: "fetch-failed" };
    }

    return { ok: true, bytes, contentType: "application/pdf" };
  } catch (error) {
    console.error("CV private storage fetch failed:", error);
    return { ok: false, reason: "fetch-failed" };
  }
}

async function loadFromLocalFile(): Promise<CVDocument> {
  const localPath = getLocalCVPath();
  try {
    const bytes = await readFile(/*turbopackIgnore: true*/ localPath);
    if (bytes.byteLength < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") {
      console.error("Local CV file is not a valid PDF document.");
      return { ok: false, reason: "fetch-failed" };
    }
    return { ok: true, bytes: new Uint8Array(bytes), contentType: "application/pdf" };
  } catch {
    return { ok: false, reason: "not-configured" };
  }
}

export async function loadCVDocument(): Promise<CVDocument> {
  const url = process.env.CV_DOCUMENT_URL?.trim();
  if (url) return loadFromPrivateStorage(url);
  return loadFromLocalFile();
}

/** True when this deployment has a document source available (remote URL or local PDF). */
export function isDocumentSourceConfigured(): boolean {
  if (Boolean(process.env.CV_DOCUMENT_URL?.trim())) return true;
  return existsSync(/*turbopackIgnore: true*/ getLocalCVPath());
}

