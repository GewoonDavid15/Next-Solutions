import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Appointments: free slots plus your own appointments (GET), book (POST), cancel (DELETE ?id=). */
export const GET = (request: NextRequest) =>
  portalRoute(request, false, async (s) => {
    const [slots, own] = await Promise.all([bot("GET", "/afspraken/slots"), bot("GET", `/klant/afspraken?gebruiker=${s.id}`)]);
    if (slots.status !== 200) return slots;
    return { status: 200, data: { ...(slots.data as object), ...(own.data as object) } };
  });

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ start: number; onderwerp: string; notitie: string }>(request);
    return bot("POST", "/klant/afspraak", { gebruiker: s.id, naam: s.globalName ?? s.username, start: Number(b.start), onderwerp: String(b.onderwerp ?? ""), notitie: String(b.notitie ?? "").slice(0, 500) });
  });

export const DELETE = (request: NextRequest) =>
  portalRoute(request, true, (s) => bot("POST", "/klant/afspraak/annuleer", { gebruiker: s.id, id: request.nextUrl.searchParams.get("id") ?? "" }));

export const dynamic = "force-dynamic";
