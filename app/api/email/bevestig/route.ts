import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/** Confirms an email address. Triggered by the button on /klantportaal/email (not by merely opening the link). */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  const back = (result: string, message = "") =>
    NextResponse.redirect(new URL(`/klantportaal/email?resultaat=${result}${message ? `&melding=${encodeURIComponent(message)}` : ""}`, request.nextUrl.origin), 303);

  if (!/^[a-f0-9]{48}$/.test(token)) return back("fout", "Deze link is ongeldig.");
  if (!isBotApiConfigured()) return back("fout", "E-mailmeldingen zijn nog niet beschikbaar.");
  try {
    const { status, data } = await botRequest("POST", "/email/bevestig", JSON.stringify({ token }));
    return status === 200 ? back("ok") : back("fout", (data as { fout?: string }).fout ?? "Bevestigen is mislukt.");
  } catch {
    return back("fout", "De bot is even niet bereikbaar. Probeer het later opnieuw.");
  }
}
