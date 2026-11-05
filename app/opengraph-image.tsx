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
          background: "linear-gradient(135deg, #0A0C10 0%, #11141B 60%, #0A0C10 100%)",
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
            background: "#C6F432",
            opacity: 0.12,
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
            background: "#C6F432",
            opacity: 0.08,
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
              background: "#C6F432",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 52 52">
              <path d="M17 15 L29 26 L17 37 M27 15 L39 26 L27 37" fill="none" stroke="#0A0C10" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: "flex", color: "white", fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
            NEXT SOLUTIONS
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
            border: "1px solid rgba(198,244,50,0.35)",
            background: "rgba(198,244,50,0.08)",
            color: "#DAF96A",
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
