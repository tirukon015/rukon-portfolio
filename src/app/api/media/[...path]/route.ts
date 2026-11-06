import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAuthorizedSession } from "@/lib/confidentiality/auth";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const isAuthorized = await isAuthorizedSession();
  if (!isAuthorized) {
    return new NextResponse("Unauthorized. This media asset contains confidential business data.", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Asset path missing.", { status: 400 });
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(...segments)).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(process.cwd(), "private", "media", safePath);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Asset not found.", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
