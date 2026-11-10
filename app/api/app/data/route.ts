import { NextResponse } from "next/server";
import { botRequest, getClientData, getClientProfile, getTicketDepartments, isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { avatarUrl, getSession } from "@/lib/session";
import { VOORWAARDEN_VERSIE } from "@/lib/voorwaarden";

/** Everything the Android app shows on its main screens, in one request. */
export async function GET() {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log opnieuw in." }, { status: 401 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Niet beschikbaar." }, { status: 503 });
  const [data, profiel, afdelingen, meldingen, social, tevredenheid] = await Promise.all([
    getClientData(session.id),
    getClientProfile(session.id),
    getTicketDepartments(),
    botRequest("GET", `/klant/meldingen?gebruiker=${session.id}`).then((r) => (r.status === 200 ? r.data : null)).catch(() => null),
    botRequest("GET", `/klant/social?gebruiker=${session.id}`).then((r) => (r.status === 200 ? r.data : null)).catch(() => null),
    botRequest("GET", `/klant/tevredenheid?gebruiker=${session.id}`).then((r) => (r.status === 200 ? r.data : null)).catch(() => null),
  ]);
  if (!data) return NextResponse.json({ fout: "De bot is even niet bereikbaar. Probeer het zo opnieuw." }, { status: 502 });
  return NextResponse.json(
    {
      gebruiker: { id: session.id, naam: session.globalName ?? session.username, gebruikersnaam: session.username, avatar: session.email ? null : avatarUrl(session), email: session.email ?? null },
      ...data,
      profiel,
      afdelingen,
      meldingen: meldingen ?? { meldingen: [], ongelezen: 0 },
      social,
      tevredenheid: (tevredenheid as { vragen?: unknown[] } | null)?.vragen ?? [],
      voorwaardenVersie: VOORWAARDEN_VERSIE,
      eigenaar: isDashboardOwner(session),
      kanReviewen: (data.transcripts?.length ?? 0) > 0 || data.projecten.length > 0 || (data.offertes ?? []).some((o) => o.betaald),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const dynamic = "force-dynamic";
