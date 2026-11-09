import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Error reports from the browser, forwarded to the bot. At most 20 per visitor per hour. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(await headers(), "fout"), 20, 60 * 60 * 1000);
  if (!limit.allowed || !isBotApiConfigured()) return new NextResponse(null, { status: 204 });
  const raw = await request.text().catch(() => "");
  if (raw.length > 8000) return new NextResponse(null, { status: 413 });
  let b: Record<string, unknown> = {};
  try { b = JSON.parse(raw) as Record<string, unknown>; } catch { return new NextResponse(null, { status: 400 }); }
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  const pad = str(b.pad, 200);
  if (!pad?.startsWith("/")) return new NextResponse(null, { status: 400 });
  await botRequest("POST", "/fout", JSON.stringify({ bron: b.bron === "app" ? "app" : "browser", bericht: str(b.bericht, 500), pad, stack: str(b.stack, 3000), digest: str(b.digest, 40), browser: str(b.browser, 60) })).catch(() => null);
  return new NextResponse(null, { status: 204 });
}
