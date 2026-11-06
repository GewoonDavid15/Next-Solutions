import { ImageResponse } from "next/og";

/** App icons for the installable portal (PWA): 192, 512 and a full-bleed "maskable" version for Android. */
const SIZES: Record<string, { size: number; maskable: boolean }> = {
  "192.png": { size: 192, maskable: false },
  "512.png": { size: 512, maskable: false },
  "maskable-512.png": { size: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(SIZES).map((naam) => ({ naam }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ naam: string }> }) {
  const spec = SIZES[(await params).naam];
  if (!spec) return new Response("Niet gevonden.", { status: 404 });
  const { size, maskable } = spec;
  // The maskable icon keeps the mark inside the inner 60% safe zone and fills the whole square
  const mark = Math.round(size * (maskable ? 0.55 : 0.8));
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: maskable ? "#C6F432" : "transparent" }}>
        <div style={{ width: maskable ? size : size, height: maskable ? size : size, borderRadius: maskable ? 0 : size * 0.23, background: "#C6F432", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={mark} height={mark} viewBox="12 10 32 32">
            <path d="M17 15 L29 26 L17 37 M27 15 L39 26 L27 37" fill="none" stroke="#0A0C10" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
