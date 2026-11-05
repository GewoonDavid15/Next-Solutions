import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** Endpoints of the bot that the dashboard may reach, per HTTP method. */
const ALLOWED: Record<string, string[]> = {
  GET: ["overzicht", "logs", "server", "instellingen", "modules", "modules/code", "geschiedenis", "wijzigingen"],
  PUT: ["instellingen", "modules/code"],
  POST: ["instellingen/reset", "modules/status", "acties/herstart", "wijzigingen/terugdraaien"],
  DELETE: ["modules/code"],
};

const MAX_BODY = 1024 * 1024;

type Context = { params: Promise<{ pad: string[] }> };

async function forward(request: NextRequest, { params }: Context) {
  const session = await getSession();
  // Anyone who is not the owner gets a plain 404, so the dashboard does not reveal itself.
  if (!isDashboardOwner(session)) return NextResponse.json({ fout: "Niet gevonden." }, { status: 404 });

  // State-changing requests must come from this site (on top of the SameSite=Lax session cookie).
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin) {
      return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
    }
  }

  if (!isBotApiConfigured()) {
    return NextResponse.json({ fout: "BOT_API_URL en BOT_API_SECRET zijn nog niet ingesteld." }, { status: 503 });
  }

  const { pad } = await params;
  const endpoint = pad.join("/");
  if (!ALLOWED[request.method]?.includes(endpoint)) {
    return NextResponse.json({ fout: "Onbekend endpoint." }, { status: 404 });
  }

  const body = request.method === "GET" ? undefined : await request.text();
  if (body && body.length > MAX_BODY) return NextResponse.json({ fout: "Verzoek te groot (max. 1 MB)." }, { status: 413 });

  try {
    const { status, data } = await botRequest(request.method, `/${endpoint}${request.nextUrl.search}`, body);
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { fout: "De bot is niet bereikbaar. Staat hij aan en klopt BOT_API_URL?" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const dynamic = "force-dynamic";
export { forward as GET, forward as PUT, forward as POST, forward as DELETE };
