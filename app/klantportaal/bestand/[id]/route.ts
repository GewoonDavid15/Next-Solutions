import { NextResponse, type NextRequest } from "next/server";
import { getClientFile } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/**
 * Downloads one of the logged-in client's files. The bot only hands it out to the client it
 * belongs to. Files are always sent as a download (never shown inline), so an uploaded HTML
 * or SVG file cannot run anything on this website.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin));

  const { id } = await params;
  const file = await getClientFile(id, session.id);
  if (!file?.body) return new NextResponse("Bestand niet gevonden.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": file.headers.get("content-disposition") ?? "attachment",
      ...(file.headers.get("content-length") ? { "Content-Length": file.headers.get("content-length")! } : {}),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
