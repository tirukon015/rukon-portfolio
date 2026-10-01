import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "storing-uploaded-photos-in-postgres-bytea-admin-only",
  title: "Storing Uploaded Photos in Postgres bytea, Served Only to Admins",
  description:
    "Why RPOMS AI keeps inspection photos in a PostgreSQL bytea column instead of a bucket, how they are served only through an admin-guarded route, and when this stops being a good idea.",
  date: "2026-10-02",
  category: "Full-Stack Development",
  tags: ["PostgreSQL", "bytea", "Supabase", "Next.js", "File Storage", "Security"],
  contentType: "Problem/Solution",
  searchIntent: "commercial-adjacent",
  seoTitle: "Storing Images in Postgres bytea: When It Works",
  relatedProjects: ["rpoms-ai"],
  relatedPosts: [
    "hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding",
    "two-ways-to-use-supabase-row-level-security",
    "rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip",
    "every-policy-was-correct-and-every-policy-was-inert",
  ],
  sections: [
    {
      heading: "The usual advice, and why I did not follow it here",
      body: [
        "This is for anyone deciding where a small web app should keep user-uploaded images. The standard advice is object storage: put files in a bucket and keep a key in the database. For [RPOMS AI](/work/rpoms-ai), a router inspection tool where anyone can upload a photo and only administrators may ever see it, I put the photos in PostgreSQL instead.",
        "The first version did have a storage boundary written in S3 vocabulary, with an S3-compatible provider and an in-memory one. The rebuild on 20 September 2026 removed both. Two reasons decided it. First, the photos are private by nature. A bucket is one misconfigured policy away from public, and the whole point of this data is that no one but an administrator sees it. Second, every photo belongs to exactly one inspection row, and keeping both in one database means one transaction, one backup and one access-control story.",
      ],
    },
    {
      heading: "The table",
      body: [
        {
          type: "code",
          lang: "sql",
          code: `CREATE TABLE IF NOT EXISTS photos (
  id            text PRIMARY KEY,
  sha256        text NOT NULL,
  content_type  text NOT NULL,
  width         integer NOT NULL,
  height        integer NOT NULL,
  byte_size     integer NOT NULL,
  data          bytea NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_photos_type CHECK (content_type IN ('image/jpeg','image/png')),
  CONSTRAINT ck_photos_size CHECK (byte_size > 0 AND byte_size <= 6291456),
  CONSTRAINT ck_photos_dims CHECK (width > 0 AND height > 0)
);`,
          caption: "From db/migrations/003_surface_checker.sql.",
        },
        "The constraints are the database refusing nonsense, whatever the application does: only two content types, a 6 MB ceiling, and positive dimensions. Each inspection row references its photo with `ON DELETE SET NULL`. A photo can therefore be deleted for retention without losing the inspection record, its verdict or its full reasoning trace.",
        "What goes into `data` is never the uploaded file. It is a JPEG re-encoded on the server from decoded pixels, at most 1600 px on the long edge and quality 85, so it carries no EXIF or GPS and has a bounded size. The details are in [Hardening a Public Photo Upload](/blog/hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding). Whether a photo is kept at all is an admin setting, and it defaults to on.",
      ],
    },
    {
      heading: "Serving it: one guarded route, no public URL",
      body: [
        "There is no URL that serves a photo without a permission check. Every read goes through one route handler:",
        {
          type: "code",
          lang: "ts",
          code: `export async function GET(request: Request, ctx: RouteContext<"/api/admin/photos/[id]">) {
  const g = await guard(request, "admin.access");
  if (isGuarded(g)) return g.response;
  const { id } = await ctx.params;
  if (!/^pho_[a-f0-9]{24}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const photo = await getPhoto(id).catch(() => null);
  if (!photo) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(Buffer.from(photo.data), {
    headers: {
      "content-type": photo.contentType,
      "cache-control": "private, max-age=300",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'",
    },
  });
}`,
          caption: "From src/app/api/admin/photos/[id]/route.ts.",
        },
        "Each header has a job. `private` keeps shared caches and CDNs from storing a copy. `nosniff` stops a browser from reinterpreting the bytes as something other than the declared image type. `default-src 'none'` means that even if a stored file were somehow opened as a document, it could load and run nothing. The id is checked against its exact format before any database call.",
        "An unauthenticated or non-admin request gets 404, not 401 or 403. The admin API does not advertise that it exists. An architecture test checks that every admin route handler begins with this guard.",
      ],
    },
    {
      heading: "Closing the side door on Supabase",
      body: [
        "The database is Postgres on Supabase, which also exposes tables through its Data API using the project's public keys. The application connects directly as the table owner and never uses that API, so the API is purely a risk. Row Level Security is enabled on every table with no policies at all. Anonymous and authenticated API roles can then read nothing, while the owner connection is unaffected. That is one of the patterns compared in [Two Ways to Use Supabase Row Level Security](/blog/two-ways-to-use-supabase-row-level-security), and the failure mode on the other side is in [Every Policy Was Correct, and Every Policy Was Inert](/blog/every-policy-was-correct-and-every-policy-was-inert).",
      ],
    },
    {
      heading: "When this stops being a good idea",
      body: [
        "The project documentation estimates each stored photo at roughly 150 to 400 KB. A free-tier Supabase database is 500 MB, so that is room for about 1,500 to 3,000 retained photos, less whatever the rest of the schema uses, before cleanup or a plan change is needed. That ceiling is fine for an internal tool in a testing phase. It would not be fine for a high-volume service.",
        "Other costs come with it. Every photo read passes through a function invocation instead of a CDN. Backups grow with the photo count. Large `bytea` values also make a careless `SELECT *` on the photos table expensive, which is one more reason to keep image bytes behind a single read path. If RPOMS AI ever handled real line volume, moving to a private bucket with signed, short-lived URLs would be the natural next step. It has not reached that point: there is no model active in production, and the tool has not been used on real line photos.",
      ],
    },
  ],
  related: [{ label: "RPOMS AI project", href: "/work/rpoms-ai" }],
};
