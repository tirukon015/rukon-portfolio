import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}: ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default share card.
 *
 * Uses the site's own dark palette and mono/sans pairing so a shared link looks
 * like the site it points at. Text only, with no remote fonts or images, so it
 * renders identically everywhere and costs nothing to generate.
 */
export default function OpengraphImage() {
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
          padding: "72px 80px",
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
          <div
            style={{
              color: "#626b74",
              fontSize: 20,
              fontFamily: "monospace",
              letterSpacing: 2,
            }}
          >
            {site.domain.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#edf1f4",
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 20,
              color: "#4fb2e0",
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              marginTop: 26,
              color: "#99a3ad",
              fontSize: 25,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            Production &amp; operations systems · AI applications · Technical SEO
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#626b74",
            fontSize: 21,
            fontFamily: "monospace",
          }}
        >
          {site.location}
        </div>
      </div>
    ),
    { ...size }
  );
}
