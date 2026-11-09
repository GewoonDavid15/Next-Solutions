import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Design feedback: pins on an image from the client's files (GET ?bestand=), add (POST) or remove (POST actie=verwijder). */
export const GET = (request: NextRequest) =>
  portalRoute(request, false, (s) => {
    const bestand = request.nextUrl.searchParams.get("bestand") ?? "";
    if (!/^[a-f0-9]{10}$/.test(bestand)) return { status: 400, data: { fout: "Ongeldig bestand." } };
    return bot("GET", `/klant/feedback?gebruiker=${s.id}&bestand=${bestand}`);
  });

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ actie: string; bestand: string; pin: string; x: number; y: number; tekst: string }>(request);
    const bestand = typeof b.bestand === "string" && /^[a-f0-9]{10}$/.test(b.bestand) ? b.bestand : null;
    if (!bestand) return { status: 400, data: { fout: "Ongeldig bestand." } };
    if (b.actie === "verwijder") return bot("POST", "/klant/feedback/verwijder", { gebruiker: s.id, bestand, pin: String(b.pin ?? "") });
    return bot("POST", "/klant/feedback", { gebruiker: s.id, naam: s.globalName ?? s.username, bestand, x: Number(b.x), y: Number(b.y), tekst: typeof b.tekst === "string" ? b.tekst.slice(0, 500) : "" });
  });

export const dynamic = "force-dynamic";
