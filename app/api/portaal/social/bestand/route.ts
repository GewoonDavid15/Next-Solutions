import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured, signedFetch } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** Downloads for the client: a monthly report (PDF), a subscription receipt (PDF) or one of their uploads. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin));
  if (!isBotApiConfigured()) return new NextResponse("Niet beschikbaar.", { status: 503 });
  const p = request.nextUrl.searchParams;
  const soort = p.get("soort");
  const id = p.get("id") ?? "";
  const nr = p.get("nr") ?? "";

  if (soort === "upload") {
    if (!/^[a-f0-9]{8}$/.test(id)) return new NextResponse("Niet gevonden.", { status: 404 });
    const { status, data } = await botRequest("GET", `/klant/social/upload?id=${id}&gebruiker=${session.id}`).catch(() => ({ status: 502, data: {} }));
    const url = (data as { url?: string }).url;
    return status === 200 && url ? NextResponse.redirect(url) : new NextResponse("Bestand niet gevonden.", { status: 404 });
  }

  const path = soort === "rapport" && /^[a-f0-9]{8}$/.test(id) ? `/klant/social/rapport-pdf?id=${id}&gebruiker=${session.id}`
    : soort === "bon" && /^\d{1,4}$/.test(nr) ? `/klant/social/bon?nr=${nr}&gebruiker=${session.id}` : null;
  if (!path) return new NextResponse("Niet gevonden.", { status: 404 });
  const res = await signedFetch("GET", path, undefined, 30_000).catch(() => null);
  if (!res?.ok || !res.body) return new NextResponse("Niet gevonden.", { status: 404 });
  return new NextResponse(res.body, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": res.headers.get("content-disposition") ?? "attachment", "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" },
  });
}

export const dynamic = "force-dynamic";
