import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Notification centre: list, and mark as read (all, or specific ids). */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/meldingen?gebruiker=${s.id}`));

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const { ids } = await readJson<{ ids: string[] }>(request);
    return bot("POST", "/klant/meldingen/gelezen", { gebruiker: s.id, ids: Array.isArray(ids) ? ids.slice(0, 100).map(String) : undefined });
  });

export const dynamic = "force-dynamic";
