import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function AppIcon() {
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
          background: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #1d4ed8 100%)",
          borderRadius: "112px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "210px",
            fontWeight: 900,
            letterSpacing: "-8px",
            lineHeight: 1,
          }}
        >
          AT
        </div>
        <div
          style={{
            marginTop: "12px",
            fontSize: "44px",
            fontWeight: 800,
            letterSpacing: "4px",
            opacity: 0.92,
          }}
        >
          AI TUTOR
        </div>
      </div>
    ),
    { ...size }
  );
}
