import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
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
  let body: Partial<QuoteRequest>;
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

  const errors = { ...validateStep(0, data), ...validateStep(1, data), ...validateStep(2, data) };
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  // Counted only once the form is valid, so a typo does not cost an attempt.
  const limit = rateLimit(clientKey(await headers(), "contact"), LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Je hebt net al een aanvraag verstuurd. Probeer het over een uur opnieuw, of neem contact op via Discord." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const webhook = process.env.DISCORD_CONTACT_WEBHOOK_URL;
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
            color: 0x7c3aed,
            fields: [
              { name: "Afdeling", value: labelFor(departmentOptions, data.department), inline: true },
              { name: "Budget", value: labelFor(budgetOptions, data.budget), inline: true },
              { name: "Planning", value: labelFor(timelineOptions, data.timeline), inline: true },
              { name: "Naam", value: clip(data.name, 100), inline: true },
              { name: "E-mail", value: clip(data.email, 100), inline: true },
              { name: "Discord", value: clip(data.discord || "—", 40), inline: true },
              { name: "Omschrijving", value: clip(data.description) },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    }).catch(() => null);
    if (!res?.ok) return NextResponse.json({ ok: false, error: "Versturen mislukt, probeer het later opnieuw" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
