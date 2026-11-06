import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Share card in the house style with a page title (used by the opengraph-image files). */
export function pageOg(title: string, eyebrow: string, subtitle?: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #0A0C10 0%, #11141B 60%, #0A0C10 100%)", position: "relative" }}>
        <div style={{ position: "absolute", top: -160, right: -100, width: 560, height: 560, borderRadius: "50%", background: "#C6F432", opacity: 0.12, filter: "blur(120px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "#C6F432" }}>
            <svg width="40" height="40" viewBox="0 0 52 52">
              <path d="M17 15 L29 26 L17 37 M27 15 L39 26 L27 37" fill="none" stroke="#0A0C10" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: "flex", color: "white", fontSize: 36, fontWeight: 800 }}>NEXT SOLUTIONS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#C6F432", fontSize: 30, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ display: "flex", marginTop: 16, color: "white", fontSize: title.length > 40 ? 64 : 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ display: "flex", marginTop: 24, color: "#a1a1aa", fontSize: 30, maxWidth: 980 }}>{subtitle.length > 120 ? `${subtitle.slice(0, 117)}…` : subtitle}</div>}
        </div>
        <div style={{ display: "flex", color: "#71717a", fontSize: 26 }}>nextsolutionshq.nl</div>
      </div>
    ),
    ogSize,
  );
}
