import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #090d16 0%, #0e1e38 55%, #081221 100%)",
          padding: "64px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #22d3ee, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              AT
            </div>
            <span style={{ fontSize: "34px", fontWeight: 800 }}>
              AshuTeacher
            </span>
          </div>

          <div
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(34, 211, 238, 0.16)",
              border: "1px solid rgba(34, 211, 238, 0.45)",
              color: "#67e8f9",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            30 Free Study Credits on Sign-Up
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "62px",
              fontWeight: 900,
              lineHeight: 1.12,
              maxWidth: "980px",
            }}
          >
            AI Interactive Blackboard, Exam Solver & Voice Tutor
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#94a3b8",
              maxWidth: "920px",
              lineHeight: 1.4,
            }}
          >
            Paste any tough question or PDF | Step-by-step LaTeX solutions | All 22 Indian &amp; 60+ Global Languages | Courses, quizzes &amp; 3D flashcards
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            fontSize: "20px",
            color: "#cbd5e1",
          }}
        >
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.07)",
            }}
          >
            Powered by Gemini 3 Flash
          </span>
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.07)",
            }}
          >
            KaTeX Math &amp; Flowcharts
          </span>
          <span
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.07)",
            }}
          >
            English | Hindi | Odia + 11 More
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
