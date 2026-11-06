import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/**
 * Health check for an uptime monitor (for example UptimeRobot).
 * 200 = website and bot are fine, 503 = the bot does not answer or is not connected to Discord.
 * The monitor then sends a push notification or email.
 */
export async function GET() {
  const started = Date.now();
  if (!isBotApiConfigured()) return NextResponse.json({ website: "ok", bot: "niet gekoppeld" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const { status, data } = await botRequest("GET", "/publiek");
    const online = status === 200 && (data as { bot?: { online?: boolean } }).bot?.online === true;
    return NextResponse.json(
      { website: "ok", bot: online ? "online" : "offline", ms: Date.now() - started },
      { status: online ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ website: "ok", bot: "onbereikbaar", ms: Date.now() - started }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export const dynamic = "force-dynamic";
