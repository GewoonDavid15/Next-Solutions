import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { getSession, isAppRequest } from "@/lib/session";

/** Sends an application for a vacancy to the bot, for the logged-in Discord user. */

const lastRequest = new Map<string, number>();

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 });

  const origin = request.headers.get("origin");
  if (!isAppRequest(request) && (!origin || origin !== request.nextUrl.origin)) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Solliciteren is tijdelijk niet mogelijk." }, { status: 503 });

  if (Date.now() - (lastRequest.get(session.id) ?? 0) < 60_000) {
    return NextResponse.json({ fout: "Je hebt net al gesolliciteerd. Wacht een minuut." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { vacature?: unknown; antwoorden?: unknown } | null;
  const vacature = typeof body?.vacature === "string" ? body.vacature : "";
  const antwoorden = Array.isArray(body?.antwoorden) ? body.antwoorden : null;
  if (!/^[\w-]{1,40}$/.test(vacature) || !antwoorden || antwoorden.length > 10) return NextResponse.json({ fout: "Ongeldige sollicitatie." }, { status: 400 });
  if (antwoorden.some((a) => typeof a !== "string" || a.trim().length < 2 || a.length > 1000)) {
    return NextResponse.json({ fout: "Beantwoord elke vraag (maximaal 1000 tekens per antwoord)." }, { status: 400 });
  }

  lastRequest.set(session.id, Date.now());
  try {
    const { status, data } = await botRequest("POST", "/sollicitaties", JSON.stringify({ gebruiker: session.id, vacature, antwoorden }));
    if (status !== 200) lastRequest.delete(session.id);
    return NextResponse.json(data, { status });
  } catch {
    lastRequest.delete(session.id);
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Probeer het later opnieuw." }, { status: 502 });
  }
}
