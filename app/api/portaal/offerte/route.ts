import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** The logged-in client accepts one of their own quotes. The bot checks the quote belongs to them. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Niet beschikbaar." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" && /^[\w-]{1,40}$/.test(body.id) ? body.id : null;
  if (!id) return NextResponse.json({ fout: "Ongeldige offerte." }, { status: 400 });

  try {
    const { status, data } = await botRequest("POST", "/klant/offerte/akkoord", JSON.stringify({ id, gebruiker: session.id }));
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Geef akkoord in je ticket in Discord." }, { status: 502 });
  }
}
