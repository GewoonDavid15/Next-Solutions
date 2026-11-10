import { NextResponse } from "next/server";
import { getPublicData } from "@/lib/bot-api";

/** Away mode for the bar on the website (fetched by the browser, so pages never wait for the bot). */
export async function GET() {
  const live = await getPublicData();
  const a = live?.afwezig?.aan ? { tekst: live.afwezig.tekst, tekstEn: live.afwezig.tekstEn } : null;
  return NextResponse.json(a, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
}
export const dynamic = "force-dynamic";
