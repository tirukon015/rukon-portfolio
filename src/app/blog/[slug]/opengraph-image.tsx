import { ImageResponse } from "next/og";
import { getPost, posts } from "@/content/posts";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

/**
 * Per-article share card.
 *
 * Same palette and type pairing as the site-wide card, with the article title
 * as the headline so a shared link says what the article is rather than who
 * wrote it. Text only, no remote fonts, so it renders identically everywhere.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  const category = post?.category ?? "Writing";
  const long = title.length > 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070a",
          padding: "64px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(79, 178, 224, 0.12)",
              color: "#4fb2e0",
              fontSize: 17,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {site.initials}
          </div>
          <div style={{ color: "#626b74", fontSize: 20, fontFamily: "monospace", letterSpacing: 2 }}>
            {site.domain.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#4fb2e0", fontSize: 22, fontFamily: "monospace", letterSpacing: 3 }}>
            {category.toUpperCase()}
          </div>
          <div
            style={{
              marginTop: 18,
              color: "#edf1f4",
              fontSize: long ? 52 : 62,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.08,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "#99a3ad", fontSize: 22 }}>
          <div>{site.name}</div>
          <div style={{ fontFamily: "monospace", color: "#626b74" }}>{post?.date ?? ""}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
