import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Push notifications: status and public key (GET), turn on/off or send a test (POST). */
export const GET = (request: NextRequest) =>
  portalRoute(request, false, (s) => {
    const endpoint = request.nextUrl.searchParams.get("endpoint");
    return bot("GET", `/klant/push?gebruiker=${s.id}${endpoint ? `&endpoint=${encodeURIComponent(endpoint.slice(0, 1000))}` : ""}`);
  });

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ actie: string; abonnement: unknown; endpoint: string }>(request);
    if (b.actie === "aan") return bot("POST", "/klant/push", { gebruiker: s.id, abonnement: b.abonnement });
    if (b.actie === "uit") return bot("POST", "/klant/push/uit", { gebruiker: s.id, endpoint: typeof b.endpoint === "string" ? b.endpoint.slice(0, 1000) : null });
    if (b.actie === "test") return bot("POST", "/klant/push/test", { gebruiker: s.id });
    return { status: 400, data: { fout: "Onbekende actie." } };
  });

export const dynamic = "force-dynamic";
