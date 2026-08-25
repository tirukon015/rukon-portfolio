import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070a",
          borderRadius: 6,
          color: "#4fb2e0",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: -0.5,
        }}
      >
        TIR
      </div>
    ),
    { ...size }
  );
}
