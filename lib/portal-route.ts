import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { getSession, isAppRequest, type SessionUser } from "@/lib/session";

/**
 * Shared guard for client-portal API routes: logged in with Discord (not demo), same-origin for writes,
 * bot configured. Calls `run` with the session and turns the bot answer into a response.
 */
export async function portalRoute(
  request: NextRequest,
  write: boolean,
  run: (session: SessionUser) => Promise<{ status: number; data: unknown }> | { status: number; data: unknown },
) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 });
  if (write) {
    const origin = request.headers.get("origin");
    if (!isAppRequest(request) && (!origin || origin !== request.nextUrl.origin)) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
  }
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "Niet beschikbaar." }, { status: 503 });
  try {
    const { status, data } = await run(session);
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Probeer het zo opnieuw." }, { status: 502 });
  }
}

export const bot = (method: string, path: string, body?: unknown) => botRequest(method, path, body === undefined ? undefined : JSON.stringify(body));

export async function readJson<T>(request: NextRequest): Promise<Partial<T>> {
  return ((await request.json().catch(() => null)) ?? {}) as Partial<T>;
}
