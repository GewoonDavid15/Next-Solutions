import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Own profile: read (with Discord data, badges and level) and update bio, links and visibility. */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/profiel?gebruiker=${s.id}`));

export const PUT = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const { velden } = await readJson<{ velden: Record<string, unknown> }>(request);
    return bot("PUT", "/klant/profiel", { gebruiker: s.id, velden: velden ?? {} });
  });

export const dynamic = "force-dynamic";
