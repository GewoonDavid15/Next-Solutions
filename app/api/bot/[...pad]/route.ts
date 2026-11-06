import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { avatarUrl, getSession } from "@/lib/session";

/** Endpoints of the bot that the dashboard may reach, per HTTP method. */
const ALLOWED: Record<string, string[]> = {
  GET: [
    "overzicht", "logs", "server", "instellingen", "modules", "modules/code", "geschiedenis", "wijzigingen",
    "beheer/tickets", "beheer/ticket", "beheer/transcript", "beheer/offertes", "beheer/giveaways", "beheer/verificatie",
    "beheer/rollen", "beheer/leden", "beheer/lid", "beheer/logbestanden", "beheer/log", "beheer/backups", "beheer/stats",
    "beheer/moderatie", "beheer/kanalen",
  ],
  PUT: ["instellingen", "modules/code"],
  POST: [
    "instellingen/reset", "modules/status", "acties/herstart", "wijzigingen/terugdraaien",
    "beheer/ticket/reageer", "beheer/ticket/sluit", "beheer/offerte/betaald", "beheer/offerte/intrekken", "beheer/lead",
    "beheer/giveaway/start", "beheer/giveaway/einde", "beheer/giveaway/reroll", "beheer/lid/rol", "beheer/backups/maak",
    "beheer/lid/moderatie", "beheer/aankondiging", "beheer/melding/test", "beheer/backups/extern",
  ],
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

  let body = request.method === "GET" ? undefined : await request.text();
  if (body && body.length > MAX_BODY) return NextResponse.json({ fout: "Verzoek te groot (max. 1 MB)." }, { status: 413 });

  // Management actions are signed with the name of whoever is logged in, so Discord shows who did it.
  if (endpoint.startsWith("beheer/") && request.method === "POST" && session) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = body ? (JSON.parse(body) as Record<string, unknown>) : {};
    } catch {
      return NextResponse.json({ fout: "Ongeldige JSON." }, { status: 400 });
    }
    body = JSON.stringify({ ...parsed, naam: session.globalName ?? session.username, userId: session.id, avatar: avatarUrl(session) });
  }

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
