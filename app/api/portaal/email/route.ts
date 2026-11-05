import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { getSession } from "@/lib/session";

/** Email notification settings of the logged-in client: subscribe, unsubscribe and preferences. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.demo) return NextResponse.json({ fout: "Log eerst in met Discord." }, { status: 401 });

  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return NextResponse.json({ fout: "Ongeldige herkomst." }, { status: 403 });
  if (!isBotApiConfigured()) return NextResponse.json({ fout: "E-mailmeldingen zijn nog niet beschikbaar." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { actie?: string; email?: unknown; voorkeuren?: unknown } | null;
  const call = (method: string, path: string, payload: object) => botRequest(method, path, JSON.stringify({ gebruiker: session.id, ...payload }));

  try {
    let res;
    if (body?.actie === "aanmelden" && typeof body.email === "string" && body.email.length <= 254) res = await call("POST", "/email/aanmelden", { email: body.email });
    else if (body?.actie === "afmelden") res = await call("POST", "/email/afmelden", {});
    else if (body?.actie === "voorkeuren" && body.voorkeuren && typeof body.voorkeuren === "object") res = await call("PUT", "/email/voorkeuren", { voorkeuren: body.voorkeuren });
    else return NextResponse.json({ fout: "Ongeldig verzoek." }, { status: 400 });
    return NextResponse.json(res.data, { status: res.status });
  } catch {
    return NextResponse.json({ fout: "De bot is even niet bereikbaar. Probeer het later opnieuw." }, { status: 502 });
  }
}
