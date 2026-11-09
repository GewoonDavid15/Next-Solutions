import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Outage notifications by email: subscribe (with a confirmation mail), confirm or unsubscribe. */
export async function POST(request: Request) {
  const b = ((await request.json().catch(() => null)) ?? {}) as { actie?: unknown; email?: unknown; token?: unknown; taal?: unknown };
  const en = b.taal === "en";
  if (!isBotApiConfigured()) return NextResponse.json({ fout: en ? "Not available right now." : "Nu niet beschikbaar." }, { status: 503 });
  if (b.actie === "bevestig" || b.actie === "afmelden") {
    const token = typeof b.token === "string" && /^[a-f0-9]{40}$/.test(b.token) ? b.token : null;
    if (!token) return NextResponse.json({ fout: en ? "Invalid link." : "Ongeldige link." }, { status: 400 });
    const r = await botRequest("POST", `/status/${b.actie}`, JSON.stringify({ token })).catch(() => null);
    return NextResponse.json(r?.data ?? { fout: "Fout" }, { status: r?.status ?? 502 });
  }
  const limit = rateLimit(clientKey(await headers(), "status"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ fout: en ? "Please try again later." : "Probeer het later opnieuw." }, { status: 429 });
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 254) : "";
  const r = await botRequest("POST", "/status/aanmelden", JSON.stringify({ email, taal: en ? "en" : "nl" })).catch(() => null);
  return NextResponse.json(r?.data ?? { fout: en ? "Something went wrong." : "Er ging iets mis." }, { status: r?.status ?? 502 });
}
