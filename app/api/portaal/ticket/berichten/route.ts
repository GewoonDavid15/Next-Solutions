import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { avatarUrl, getSession } from "@/lib/session";

/** Read and answer your own open ticket from the client portal. The bot checks the ticket is yours. */

const validId = (v: unknown): v is string => typeof v === "string" && /^\d{17,20}$/.test(v);
const lastMessage = new Map<string, number>();

async function guard(request: NextRequest, write: boolean) {
  const session = await getSession();
  if (!session || session.demo) return { error: NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 }) };
  if (write) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin) return { error: NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 }) };
  }
  if (!isBotApiConfigured()) return { error: NextResponse.json({ fout: "Niet beschikbaar." }, { status: 503 }) };
  return { session };
}

export async function GET(request: NextRequest) {
  const { session, error } = await guard(request, false);
  if (error) return error;
  const id = request.nextUrl.searchParams.get("id");
  if (!validId(id)) return NextResponse.json({ fout: "Ongeldig ticket." }, { status: 400 });
  try {
    const { status, data } = await botRequest("GET", `/klant/ticket?id=${id}&gebruiker=${session.id}`);
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ fout: "De bot is even niet bereikbaar." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await guard(request, true);
  if (error) return error;
  const body = (await request.json().catch(() => null)) as { id?: unknown; tekst?: unknown } | null;
  const tekst = typeof body?.tekst === "string" ? body.tekst.trim() : "";
  if (!validId(body?.id)) return NextResponse.json({ fout: "Ongeldig ticket." }, { status: 400 });
  if (!tekst || tekst.length > 1900) return NextResponse.json({ fout: "Je bericht moet 1 tot 1900 tekens zijn." }, { status: 400 });

  // A short pause between messages against accidental double sends and spam
  if (Date.now() - (lastMessage.get(session.id) ?? 0) < 3000) return NextResponse.json({ fout: "Even rustig aan, probeer het zo opnieuw." }, { status: 429 });
  lastMessage.set(session.id, Date.now());

  try {
    const { status, data } = await botRequest(
      "POST",
      "/klant/ticket/reageer",
      JSON.stringify({ id: body.id, gebruiker: session.id, tekst, naam: session.globalName ?? session.username, avatar: avatarUrl(session) }),
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Reageer in Discord." }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
