import { NextResponse, type NextRequest } from "next/server";
import { isBotApiConfigured, signedFetch } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** Downloads the payment receipt (PDF) of one of the logged-in client's paid quotes. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin));
  const { id } = await params;
  if (!isBotApiConfigured() || !/^[\w-]{1,40}$/.test(id)) return new NextResponse("Niet gevonden.", { status: 404 });

  const res = await signedFetch("GET", `/klant/bon?id=${id}&gebruiker=${session.id}`, undefined, 30_000).catch(() => null);
  if (!res?.ok || !res.body) return new NextResponse("Betaalbewijs niet gevonden.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
