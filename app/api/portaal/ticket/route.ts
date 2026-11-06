import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { getSession, isAppRequest } from "@/lib/session";

/** Opens a Discord ticket for the logged-in client, from the client portal. */

// One ticket per user per minute (per server instance) against accidental double submits and spam
const lastRequest = new Map<string, number>();

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 });

  const origin = request.headers.get("origin");
  if (!isAppRequest(request) && (!origin || origin !== request.nextUrl.origin)) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });

  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Tickets openen via de website is nog niet beschikbaar." }, { status: 503 });

  const last = lastRequest.get(session.id) ?? 0;
  if (Date.now() - last < 60_000) return NextResponse.json({ fout: "Je hebt net al een ticket geopend. Wacht een minuut." }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { afdeling?: unknown; onderwerp?: unknown; details?: unknown } | null;
  const afdeling = typeof body?.afdeling === "string" ? body.afdeling : "";
  const onderwerp = typeof body?.onderwerp === "string" ? body.onderwerp.trim() : "";
  const details = typeof body?.details === "string" ? body.details.trim() : "";
  if (!/^[\w-]{1,40}$/.test(afdeling)) return NextResponse.json({ fout: "Kies een afdeling." }, { status: 400 });
  if (onderwerp.length < 3 || onderwerp.length > 100) return NextResponse.json({ fout: "Het onderwerp moet 3 tot 100 tekens zijn." }, { status: 400 });
  if (details.length < 10 || details.length > 1500) return NextResponse.json({ fout: "De omschrijving moet 10 tot 1500 tekens zijn." }, { status: 400 });

  lastRequest.set(session.id, Date.now());
  try {
    const { status, data } = await botRequest("POST", "/tickets", JSON.stringify({ gebruiker: session.id, afdeling, onderwerp, details }));
    if (status !== 200) lastRequest.delete(session.id);
    return NextResponse.json(data, { status });
  } catch {
    lastRequest.delete(session.id);
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Probeer het later opnieuw of open een ticket in Discord." }, { status: 502 });
  }
}
