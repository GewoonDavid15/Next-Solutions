import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { SESSION_COOKIE, encodeSession, getSession, isAppRequest, sessionCookieOptions } from "@/lib/session";

/** Clients without Discord choose the name the team sees (Discord clients use their Discord name). */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.email) return NextResponse.json({ fout: "Alleen voor accounts met e-mail." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (!isAppRequest(request) && origin !== request.nextUrl.origin) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Niet beschikbaar." }, { status: 503 });
  const b = ((await request.json().catch(() => null)) ?? {}) as { naam?: unknown };
  const naam = typeof b.naam === "string" ? b.naam.trim().slice(0, 60) : "";
  const r = await botRequest("POST", "/email/naam", JSON.stringify({ gebruiker: session.id, naam })).catch(() => null);
  if (r?.status !== 200) return NextResponse.json(r?.data ?? { fout: "Er ging iets mis." }, { status: r?.status ?? 502 });
  const res = NextResponse.json({ ok: true, naam });
  if (!session.app) res.cookies.set(SESSION_COOKIE, encodeSession({ ...session, username: naam, globalName: naam }), sessionCookieOptions);
  return res;
}
