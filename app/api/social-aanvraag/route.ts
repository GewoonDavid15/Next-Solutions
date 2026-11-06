import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

/** Social media request from /social-media: arrives in Discord as a lead with the accounts attached. */

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "X", "Facebook"];
const GOALS = ["Meer volgers", "Meer klanten of verkoop", "Meer bereik en naamsbekendheid", "Tijd besparen", "Professionelere uitstraling"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const en = b?.locale === "en";
  const err = (nl: string, e: string, status = 400) => NextResponse.json({ ok: false, error: en ? e : nl }, { status });

  const platforms = Array.isArray(b?.platforms) ? b.platforms.filter((p): p is string => typeof p === "string" && PLATFORMS.includes(p)) : [];
  const accounts = typeof b?.accounts === "string" ? b.accounts.trim().slice(0, 600) : "";
  const goal = typeof b?.goal === "string" && GOALS.includes(b.goal) ? b.goal : "";
  const pkg = typeof b?.pakket === "string" ? b.pakket.slice(0, 40) : "";
  const note = typeof b?.notitie === "string" ? b.notitie.trim().slice(0, 1000) : "";
  const name = typeof b?.naam === "string" ? b.naam.trim().slice(0, 100) : "";
  const email = typeof b?.email === "string" ? b.email.trim().slice(0, 120) : "";

  if (!platforms.length) return err("Kies minstens één platform.", "Pick at least one platform.");
  if (name.length < 2) return err("Vul je naam in.", "Enter your name.");
  if (!EMAIL.test(email)) return err("Vul een geldig e-mailadres in.", "Enter a valid email address.");

  const limit = rateLimit(clientKey(await headers(), "social"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return err("Je hebt net al een aanvraag verstuurd. Probeer het over een uur opnieuw.", "You just sent a request. Please try again in an hour.", 429);
  if (!isBotApiConfigured()) return err("Versturen lukt nu niet. Neem contact op via Discord.", "Sending failed. Please contact us on Discord.", 503);

  const session = await getSession();
  const omschrijving = [
    `Platformen: ${platforms.join(", ")}`,
    goal && `Doel: ${goal}`,
    pkg && `Interesse in: ${pkg}`,
    accounts && `Accounts:\n${accounts}`,
    note && `Toelichting:\n${note}`,
  ].filter(Boolean).join("\n\n");

  const res = await botRequest(
    "POST",
    "/leads",
    JSON.stringify({
      afdelingId: "media",
      afdeling: "Media & Social",
      dienst: pkg ? `Social media (${pkg})` : "Social media",
      budget: "-",
      planning: "-",
      omschrijving,
      naam: name,
      email,
      discord: "",
      discordId: session && !session.demo ? session.id : null,
      taal: en ? "en" : "nl",
    }),
  ).catch(() => null);
  if (res?.status !== 200) return err("Versturen mislukt, probeer het later opnieuw of neem contact op via Discord.", "Sending failed, please try again later or contact us on Discord.", 502);
  return NextResponse.json({ ok: true });
}
