import { NextResponse, type NextRequest } from "next/server";
import { getTranscript } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/**
 * Shows the HTML transcript of one of the logged-in client's closed tickets.
 * The bot only returns it to the ticket owner. The page is served in a sandbox
 * without scripts, so nothing inside a transcript can run in the visitor's browser.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin));

  const { id } = await params;
  const html = await getTranscript(id, session.id);
  if (!html) return new NextResponse("Transcript niet gevonden.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "sandbox; default-src 'none'; img-src https: data:; media-src https:; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
