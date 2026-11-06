import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import {
  budgetOptions,
  departmentOptions,
  labelFor,
  serviceOptions,
  timelineOptions,
  validateStep,
  type QuoteRequest,
} from "@/lib/contact";

/** Five quote requests per IP per hour: enough for a retry, not for spamming the webhook. */
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  let body: Partial<QuoteRequest> & { locale?: string; indicatie?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const data: QuoteRequest = {
    department: String(body.department ?? ""),
    service: String(body.service ?? ""),
    budget: String(body.budget ?? ""),
    timeline: String(body.timeline ?? ""),
    description: String(body.description ?? ""),
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    discord: String(body.discord ?? ""),
  };

  const locale = body.locale === "en" ? "en" : "nl";
  const errors = { ...validateStep(0, data, locale), ...validateStep(1, data, locale), ...validateStep(2, data, locale) };
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  // Counted only once the form is valid, so a typo does not cost an attempt.
  const limit = rateLimit(clientKey(await headers(), "contact"), LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          locale === "en"
            ? "You just sent a request. Please try again in an hour, or contact us on Discord."
            : "Je hebt net al een aanvraag verstuurd. Probeer het over een uur opnieuw, of neem contact op via Discord.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // First choice: the bot posts the request as a lead in Discord, with buttons to open a ticket.
  // When the visitor is logged in with Discord, the bot can open that ticket for them straight away.
  if (isBotApiConfigured()) {
    const session = await getSession();
    const lead = await botRequest(
      "POST",
      "/leads",
      JSON.stringify({
        afdelingId: data.department,
        afdeling: labelFor(departmentOptions, data.department),
        dienst: labelFor(serviceOptions[data.department], data.service),
        budget: labelFor(budgetOptions, data.budget),
        planning: labelFor(timelineOptions, data.timeline),
        omschrijving: data.description,
        naam: data.name,
        email: data.email,
        discord: data.discord,
        discordId: session && !session.demo ? session.id : null,
        taal: locale,
        indicatie: typeof body.indicatie === "string" ? body.indicatie.slice(0, 80) : null,
      }),
    ).catch(() => null);
    if (lead?.status === 200) return NextResponse.json({ ok: true });
    // Bot offline or no leads channel: fall through to the webhook below.
  }

  const webhook = process.env.DISCORD_CONTACT_WEBHOOK_URL;
  if (!webhook && isBotApiConfigured()) {
    return NextResponse.json({ ok: false, error: locale === "en" ? "Sending failed, please try again later or contact us on Discord." : "Versturen mislukt, probeer het later opnieuw of neem contact op via Discord." }, { status: 502 });
  }
  if (webhook) {
    const clip = (s: string, n = 1000) => (s.length > n ? `${s.slice(0, n)}…` : s);
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Next Solutions Offertes",
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: `Nieuwe offerte: ${labelFor(serviceOptions[data.department], data.service)}`,
            color: 0xc6f432,
            fields: [
              { name: "Afdeling", value: labelFor(departmentOptions, data.department), inline: true },
              { name: "Budget", value: labelFor(budgetOptions, data.budget), inline: true },
              { name: "Planning", value: labelFor(timelineOptions, data.timeline), inline: true },
              { name: "Naam", value: clip(data.name, 100), inline: true },
              { name: "E-mail", value: clip(data.email, 100), inline: true },
              { name: "Discord", value: clip(data.discord || "—", 40), inline: true },
              { name: "Omschrijving", value: clip(data.description) },
              { name: "Taal", value: locale === "en" ? "🇬🇧 Engels" : "🇳🇱 Nederlands", inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    }).catch(() => null);
    if (!res?.ok) return NextResponse.json({ ok: false, error: locale === "en" ? "Sending failed, please try again later" : "Versturen mislukt, probeer het later opnieuw" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
