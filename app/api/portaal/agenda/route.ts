import type { NextRequest } from "next/server";
import { bot, portalRoute } from "@/lib/portal-route";

/** The member's private calendar link (GET), or a new one that replaces the old link (POST). */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/agenda/sleutel?gebruiker=${s.id}`));
export const POST = (request: NextRequest) => portalRoute(request, true, (s) => bot("POST", "/klant/agenda/sleutel", { gebruiker: s.id }));

export const dynamic = "force-dynamic";
