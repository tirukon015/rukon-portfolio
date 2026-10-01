import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding",
  title: "Hardening a Public Photo Upload: Magic Bytes, Header Dimensions and Stripping EXIF Twice",
  description:
    "An anonymous endpoint that decodes images is easy to abuse. How RPOMS AI re-encodes photos in the browser, trusts none of it on the server, and never stores the uploaded bytes.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["File Upload", "Security", "EXIF", "Next.js", "Image Processing", "Privacy"],
  contentType: "Technical Guide",
  searchIntent: "problem-aware",
  seoTitle: "Secure Photo Upload: EXIF, Magic Bytes, Re-encode",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "photo-quality-gate-blur-glare-exposure-before-a-vision-model",
    "capping-image-size-for-a-vision-model-inside-a-60-second-limit",
    "rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip",
    "storing-uploaded-photos-in-postgres-bytea-admin-only",
  ],
  sections: [
    {
      heading: "An anonymous endpoint that decodes images",
      body: [
        "This is for anyone accepting photos from the public on a Next.js or similar server. The [RPOMS AI](/work/rpoms-ai) public checker needs no account. Anyone can photograph a router casing and submit it. That makes `POST /api/check` the cheapest thing on the site to abuse: it accepts arbitrary bytes, decodes them as an image and does real work.",
        "Two risks shape the design. The first is hostile input: files that are not images, images with absurd dimensions, polyglots. The second is privacy: a phone photo carries EXIF metadata, often including GPS coordinates and device details, and a system that stores photos should not store that. The approach is to do the privacy work in the browser, then assume the browser did nothing and redo all of it on the server.",
      ],
    },
    {
      heading: "In the browser: downscale and re-encode",
      body: [
        "Before upload, the page decodes the chosen photo, draws it onto a canvas at most 1600 px on the long edge, and exports a fresh JPEG at quality 0.9. A canvas export contains only pixels, so EXIF and GPS data do not survive it.",
        {
          type: "code",
          lang: "ts",
          code: `async function prepare(file: File): Promise<Blob> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    source = await loadWithImgElement(file); // fallback for browsers that refuse the file
  }
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.9),
  );
}`,
          caption: "Simplified from src/app/checker.tsx (the fallback is inlined there).",
        },
        "`imageOrientation: \"from-image\"` matters. Phones often store a photo sideways with an EXIF orientation tag. If you strip the metadata without applying the rotation first, the photo arrives on its side. Decoding with the orientation applied and then drawing bakes the rotation into the pixels before the tag is lost.",
        "This step has a second benefit. The picker also accepts HEIC and WebP by filename. The browser decodes them if it can, and what leaves the page is always a JPEG, well under the upload cap.",
      ],
    },
    {
      heading: "On the server: decide the type from the bytes",
      body: [
        "None of the browser step can be relied on, because a script can post anything. The server therefore checks, in order:",
        {
          type: "list",
          ordered: true,
          items: [
            "Origin. Requests must come from the site itself, and cross-site posts get 403.",
            "Declared size. A `Content-Length` over the 4 MB cap, plus a small allowance for the form envelope, is refused with 413 before the body is read. The 4 MB cap sits under Vercel's 4.5 MB request body limit.",
            "Actual size. The file itself must be non-empty and at most 4 MB.",
            "Type, by magic bytes. `FF D8 FF` is JPEG and the eight-byte PNG signature is PNG. Everything else is refused, including executables, SVG, HTML, PDF and polyglots with the wrong leading bytes. The client's declared type only has to start with `image/`, and it is never what decides.",
            "Dimensions, from the header, before decoding. Width and height are read from the PNG IHDR chunk or the JPEG start-of-frame marker, and anything over 8000 px on a side is refused without decoding a single pixel.",
          ],
        },
        "The JPEG header walk has one detail that is easy to get wrong. Start-of-frame markers occupy `0xC0` to `0xCF`, but three codes in that range are not frames: `0xC4` (Huffman tables), `0xC8` and `0xCC`. Treat them as frames and you read nonsense dimensions from a Huffman table.",
        {
          type: "code",
          lang: "ts",
          code: `if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
  return { height: v.getUint16(i + 5), width: v.getUint16(i + 7) };
}
i += 2 + v.getUint16(i + 2); // skip this segment`,
          caption: "From src/lib/analysis/sniff.ts.",
        },
      ],
    },
    {
      heading: "Store pixels, never the uploaded file",
      body: [
        "The server never stores the bytes it received. After decoding, the copy kept for review is a new JPEG encoded from the decoded pixels at quality 85, at most 1600 px on the long edge. So even if a client skipped the browser step and sent a full-size photo with GPS in its EXIF, the stored file has no metadata, and its size is bounded.",
        "The copy sent to the vision model is handled separately and deliberately differently. Within 896 px, the uploaded bytes go through unchanged, because re-encoding would alter an image the model was evaluated on. That reasoning is in [the 896 px article](/blog/capping-image-size-for-a-vision-model-inside-a-60-second-limit). Those bytes go to the self-hosted model over an authenticated tunnel and are not stored. Only the re-encoded copy is kept.",
        "Before any of this, the image has to pass the deterministic [quality gate](/blog/photo-quality-gate-blur-glare-exposure-before-a-vision-model), so a blank or garbage frame is answered without any inference being spent on it.",
      ],
    },
    {
      heading: "What the response gives away",
      body: [
        "Failures return plain messages, such as \"Only JPEG and PNG photos are supported.\" or \"That photo couldn't be read.\" Details go to structured server logs, which never include photo bytes, addresses or secrets. A successful response carries only the verdict, a short explanation, plain observations and the criteria involved. It never includes the internal trace, model identity, measurements or storage ids, and an architecture test fails the suite if any of those words appear in the response-building code.",
        "Stored photos are private: they are served only through an admin-guarded route and never have a public URL. Retention is a setting. The rate limits in front of all this are keyed by an HMAC of the address, not the address itself. RPOMS AI is deployed and the checker accepts uploads, but no model is active in production and it has not been used on real line photos.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
