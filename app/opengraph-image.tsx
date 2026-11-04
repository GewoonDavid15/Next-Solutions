import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — Media, Software & Game Development`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, generated at build time. */
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
          background: "linear-gradient(135deg, #09090b 0%, #0f172a 55%, #1a0b2e 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#7C3AED",
            opacity: 0.35,
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -60,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "#9333EA",
            opacity: 0.3,
            filter: "blur(120px)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 28,
              background: "linear-gradient(135deg, #7C3AED, #9333EA)",
              color: "white",
              fontSize: 56,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ display: "flex", color: "white", fontSize: 72, fontWeight: 700 }}>
            Next<span style={{ color: "#a78bfa" }}>Solutions</span>
          </div>
        </div>
        <div style={{ marginTop: 32, color: "#a1a1aa", fontSize: 34, display: "flex" }}>
          Media · Software · Game Development
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            padding: "16px 36px",
            borderRadius: 24,
            border: "1px solid rgba(167,139,250,0.4)",
            background: "rgba(124,58,237,0.15)",
            color: "#ddd6fe",
            fontSize: 28,
          }}
        >
          Van idee tot lancering
        </div>
      </div>
    ),
    size,
  );
}
