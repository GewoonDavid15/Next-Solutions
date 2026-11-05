import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/**
 * Unsubscribes from all email notifications. Works from the button on /afmelden (form with the token)
 * and from "one-click unsubscribe" in mail apps (RFC 8058: POST with the token in the URL).
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? request.nextUrl.searchParams.get("token") ?? "");
  const fromForm = Boolean(form?.get("token"));

  let ok = false;
  if (/^[a-f0-9]{48}$/.test(token) && isBotApiConfigured()) {
    try {
      const { status } = await botRequest("POST", "/email/afmelden", JSON.stringify({ token }));
      ok = status === 200;
    } catch {
      ok = false;
    }
  }

  if (fromForm) return NextResponse.redirect(new URL(`${request.nextUrl.searchParams.get("taal") === "en" ? "/en" : ""}/afmelden?gedaan=${ok ? "1" : "0"}`, request.nextUrl.origin), 303);
  return new NextResponse(ok ? "Afgemeld." : "Afmelden mislukt.", { status: ok ? 200 : 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
