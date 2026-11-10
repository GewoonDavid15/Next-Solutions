import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { canonicalOrigin, encodeEmailLink, safeReturnPath } from "@/lib/session";

/** Step 1 of logging in with email: the bot emails a signed link that is valid for 15 minutes. */
export async function POST(request: Request) {
  const b = ((await request.json().catch(() => null)) ?? {}) as { email?: unknown; taal?: unknown; app?: unknown; terug?: unknown };
  const en = b.taal === "en";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase().slice(0, 254) : "";
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(email)) return NextResponse.json({ fout: en ? "Please enter a valid email address." : "Vul een geldig e-mailadres in." }, { status: 400 });
  const limit = rateLimit(clientKey(await headers(), "email-login"), 5, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ fout: en ? "Too many attempts. Try again in 15 minutes." : "Te veel pogingen. Probeer het over 15 minuten opnieuw." }, { status: 429 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: en ? "Not available right now." : "Nu niet beschikbaar." }, { status: 503 });
  const app = typeof b.app === "string" && /^[A-Za-z0-9_-]{43}$/.test(b.app) ? b.app : undefined;
  const terug = typeof b.terug === "string" ? safeReturnPath(b.terug) : undefined;
  const token = encodeEmailLink(email, { app, terug, taal: en ? "en" : "nl" });
  const link = `${canonicalOrigin(new URL(request.url).origin)}/api/auth/email/callback?token=${encodeURIComponent(token)}`;
  const r = await botRequest("POST", "/email/inloglink", JSON.stringify({ email, link, taal: en ? "en" : "nl" })).catch(() => null);
  if (r?.status !== 200) return NextResponse.json({ fout: (r?.data as { fout?: string } | undefined)?.fout ?? (en ? "Sending failed." : "Versturen mislukt.") }, { status: r?.status ?? 502 });
  return NextResponse.json({ ok: true });
}
