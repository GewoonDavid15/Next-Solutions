import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/**
 * Cookieless visitor count: the browser reports a visit or page view, the bot keeps daily counters.
 * Nothing that identifies a person is stored or forwarded (no IP address, no user agent).
 */
const EVENTS = new Set(["bezoek", "pagina", "calculator", "offerteformulier", "socialformulier", "checklist"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { e?: unknown; p?: unknown } | null;
  const e = typeof body?.e === "string" && EVENTS.has(body.e) ? body.e : null;
  const p = typeof body?.p === "string" && /^\/[a-z0-9/_-]{0,80}$/i.test(body.p) ? body.p : undefined;
  if (e && isBotApiConfigured()) await botRequest("POST", "/track", JSON.stringify({ e, p })).catch(() => null);
  return new NextResponse(null, { status: 204 });
}
