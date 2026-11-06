import { NextResponse, type NextRequest } from "next/server";
import { isBotApiConfigured, isDashboardOwner, signedFetch } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** Downloads a log file or back-up from the bot. Owner only, like the rest of the dashboard. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!isDashboardOwner(session)) return NextResponse.json({ fout: "Niet gevonden." }, { status: 404 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "De bot is niet gekoppeld." }, { status: 503 });

  const kind = request.nextUrl.searchParams.get("soort");
  const day = request.nextUrl.searchParams.get("dag") ?? "";
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const valid = kind === "bon" ? /^[\w-]{1,40}$/.test(id) : /^\d{4}-\d{2}-\d{2}$/.test(day) && (kind === "log" || kind === "backup");
  if (!valid) return NextResponse.json({ fout: "Ongeldig verzoek." }, { status: 400 });
  const path = kind === "bon" ? `/beheer/bon?id=${id}` : `/beheer/${kind}/download?dag=${day}`;

  try {
    const res = await signedFetch("GET", path, undefined, 60_000);
    if (!res.ok || !res.body) {
      const data = (await res.json().catch(() => ({}))) as { fout?: string };
      return NextResponse.json({ fout: data.fout ?? "Download mislukt." }, { status: res.status || 502 });
    }
    return new Response(res.body, {
      headers: {
        "Content-Type": kind === "log" ? "text/plain; charset=utf-8" : kind === "bon" ? "application/pdf" : "application/json; charset=utf-8",
        "Content-Disposition": res.headers.get("content-disposition") ?? `attachment; filename="${kind}-${day}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ fout: "De bot is niet bereikbaar." }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
