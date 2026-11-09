import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Satisfaction check after a project: open questions (GET) and answering one (POST). */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/tevredenheid?gebruiker=${s.id}`));
export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ id: string; score: number; opmerking: string }>(request);
    return bot("POST", "/klant/tevredenheid", { gebruiker: s.id, id: String(b.id ?? ""), score: Number(b.score), opmerking: typeof b.opmerking === "string" ? b.opmerking.slice(0, 1000) : "" });
  });

export const dynamic = "force-dynamic";
