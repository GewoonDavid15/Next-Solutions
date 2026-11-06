import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Project start checklist: read (GET) and tick off an item (POST). */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/onboarding?gebruiker=${s.id}`));

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ kanaalId: string; index: number; klaar: boolean }>(request);
    return bot("POST", "/klant/onboarding", { gebruiker: s.id, kanaalId: String(b.kanaalId ?? ""), index: Number(b.index), klaar: Boolean(b.klaar) });
  });

export const dynamic = "force-dynamic";
