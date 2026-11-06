import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { checklistBySlug } from "@/lib/checklists";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Free checklist: stores name and email with the bot, which emails the link. Five per visitor per hour. */
export async function POST(request: Request) {
  const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const en = b.taal === "en";
  const fail = (nl: string, eng: string, status: number) => NextResponse.json({ ok: false, error: en ? eng : nl }, { status });
  const naam = typeof b.naam === "string" ? b.naam.trim().slice(0, 80) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 254) : "";
  const slug = typeof b.checklist === "string" ? b.checklist : "";
  if (!checklistBySlug(slug)) return fail("Deze checklist bestaat niet.", "This checklist does not exist.", 404);
  if (naam.length < 2 || !/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(email)) return fail("Vul je naam en een geldig e-mailadres in.", "Please enter your name and a valid email address.", 422);
  if (typeof b.website === "string" && b.website) return NextResponse.json({ ok: true }); // honeypot: bots fill every field
  const limit = rateLimit(clientKey(await headers(), "checklist"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return fail("Je hebt net al een checklist aangevraagd. Probeer het later opnieuw.", "You just requested a checklist. Please try again later.", 429);
  if (!isBotApiConfigured()) return NextResponse.json({ ok: true, verstuurd: false });
  const res = await botRequest("POST", "/checklist", JSON.stringify({ naam, email, checklist: slug, taal: en ? "en" : "nl" })).catch(() => null);
  if (!res || res.status >= 500) return NextResponse.json({ ok: true, verstuurd: false }); // the checklist itself still opens
  if (res.status !== 200) return fail("Controleer je gegevens en probeer het opnieuw.", "Please check your details and try again.", 422);
  return NextResponse.json({ ok: true, verstuurd: Boolean((res.data as { verstuurd?: boolean }).verstuurd) });
}
