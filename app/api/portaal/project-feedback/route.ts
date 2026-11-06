import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Approve a project phase or ask for a revision; the bot posts it in the project channel. */
export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ id: string; soort: string; tekst: string }>(request);
    if (typeof b.id !== "string" || !/^\d{17,20}$/.test(b.id)) return { status: 400, data: { fout: "Ongeldig project." } };
    return bot("POST", "/klant/project/feedback", { gebruiker: s.id, naam: s.globalName ?? s.username, id: b.id, soort: b.soort, tekst: typeof b.tekst === "string" ? b.tekst.slice(0, 1500) : "" });
  });
