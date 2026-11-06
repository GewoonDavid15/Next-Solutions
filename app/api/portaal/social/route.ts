import type { NextRequest } from "next/server";
import { bot, portalRoute, readJson } from "@/lib/portal-route";

/** Social media for the logged-in client: calendar, reports, uploads, subscription (GET) and approving posts (POST). */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/social?gebruiker=${s.id}`));

export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const b = await readJson<{ id: string; besluit: string; feedback: string }>(request);
    return bot("POST", "/klant/social/post/beoordeel", { gebruiker: s.id, id: String(b.id ?? ""), besluit: b.besluit, feedback: typeof b.feedback === "string" ? b.feedback.slice(0, 1000) : "" });
  });

export const dynamic = "force-dynamic";
