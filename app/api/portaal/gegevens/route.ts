import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { bot, portalRoute, readJson } from "@/lib/portal-route";
import { getSession } from "@/lib/session";

/** "My data": download everything we store about the logged-in person (GET) or ask for deletion (POST). */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin));
  if (!isBotApiConfigured()) return new NextResponse("Niet beschikbaar.", { status: 503 });
  const { status, data } = await botRequest("GET", `/klant/export?gebruiker=${session.id}`).catch(() => ({ status: 502, data: null }));
  if (status !== 200 || !data) return new NextResponse("De bot is even niet bereikbaar. Probeer het later opnieuw.", { status: 502 });
  const body = JSON.stringify({ account: { id: session.id, gebruikersnaam: session.username, naam: session.globalName }, ...(data as object) }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="next-solutions-mijn-gegevens-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ toelichting: string }>(request);
    return bot("POST", "/klant/verwijderverzoek", { gebruiker: s.id, naam: s.globalName ?? s.username, toelichting: typeof b.toelichting === "string" ? b.toelichting.slice(0, 1000) : "" });
  });

export const dynamic = "force-dynamic";
