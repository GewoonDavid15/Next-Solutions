import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";
import { avatarUrl } from "@/lib/session";

/** Write a review from the client portal. The bot checks the client has worked with us. */
export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ sterren: number; tekst: string; context: string }>(request);
    return bot("POST", "/klant/review", {
      gebruiker: s.id,
      naam: s.globalName ?? s.username,
      avatar: avatarUrl(s),
      sterren: Number(b.sterren),
      tekst: typeof b.tekst === "string" ? b.tekst.slice(0, 500) : "",
      context: typeof b.context === "string" ? b.context.slice(0, 80) : "",
    });
  });
