import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Prompt Generator by ItsDad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a5b4fc",
            marginBottom: 24,
          }}
        >
          ItsDad
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, textAlign: "center", padding: "0 60px" }}>
          AI Prompt Generator
        </div>
        <div style={{ fontSize: 32, color: "#cbd5e1", marginTop: 20 }}>
          Top 5 AI prompts for any topic — instantly
        </div>
      </div>
    ),
    { ...size }
  );
}
