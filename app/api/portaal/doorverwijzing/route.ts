import type { NextRequest } from "next/server";
import { bot, portalRoute } from "@/lib/portal-route";

/** The logged-in member's referral link and who came in through it. */
export const GET = (request: NextRequest) => portalRoute(request, false, (s) => bot("GET", `/klant/doorverwijzing?gebruiker=${s.id}`));

export const dynamic = "force-dynamic";
