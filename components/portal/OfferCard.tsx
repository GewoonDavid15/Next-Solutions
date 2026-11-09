"use client";

import { CheckCircle2, ChevronDown, Loader2, Receipt } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import type { ClientOffer } from "@/lib/live";
import { cn } from "@/lib/utils";
import { voorwaardenLabel } from "@/lib/voorwaarden";

const texts = {
  nl: {
    details: "Details", included: "Wat je krijgt", delivery: "Levertijd", validUntil: "Geldig tot {date}",
    accept: "Akkoord geven", confirm: "Onderteken de offerte digitaal.", yes: "Ondertekenen en akkoord", no: "Annuleren",
    name: "Je volledige naam", terms: "Ik ga akkoord met deze offerte en de {link} (versie {version}).", termsLink: "algemene voorwaarden", signed: "Digitaal ondertekend door {name} op {date}",
    accepted: "Bedankt! Je hebt akkoord gegeven. Hieronder staat hoe je betaalt.", pay: "Betalen", receipt: "Betaalbewijs (PDF)", failed: "Er ging iets mis. Probeer het opnieuw of geef akkoord in je ticket.",
  },
  en: {
    details: "Details", included: "What you get", delivery: "Delivery time", validUntil: "Valid until {date}",
    accept: "Accept quote", confirm: "Sign the quote digitally.", yes: "Sign and accept", no: "Cancel",
    name: "Your full name", terms: "I accept this quote and the {link} (version {version}).", termsLink: "terms and conditions", signed: "Digitally signed by {name} on {date}",
    accepted: "Thank you! You accepted the quote. See below how to pay.", pay: "Payment", receipt: "Payment receipt (PDF)", failed: "Something went wrong. Please try again or accept in your ticket.",
  },
};

/** One quote in the client portal: details, accept button and payment instructions. */
export function OfferCard({ offer, dateLabel }: { offer: ClientOffer; dateLabel: string }) {
  const { locale, lp } = useI18n();
  const [signer, setSigner] = useState("");
  const [agreed, setAgreed] = useState(false);
  const tx = texts[locale];
  const [code, setCode] = useState(offer.code);
  const [open, setOpen] = useState(offer.code === "open" || offer.code === "akkoord");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const date = (t: number) => new Date(t).toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "long", year: "numeric" });

  async function accept() {
    setBusy(true);
    const res = await fetch("/api/portaal/offerte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: offer.id, ondertekenaar: signer.trim(), voorwaardenAkkoord: agreed }) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { fout?: string } | null;
    if (res?.ok) {
      setCode("akkoord");
      setMessage({ ok: true, text: tx.accepted });
      // The payment instruction comes from the bot; reload to show it
      setTimeout(() => window.location.reload(), 1500);
    } else setMessage({ ok: false, text: data?.fout ?? tx.failed });
    setBusy(false);
    setConfirming(false);
  }

  const paid = code === "betaald";
  return (
    <li className="glass rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{offer.titel}</p>
          <p className="mt-0.5 text-sm text-zinc-400">
            <span className="font-mono text-xs text-zinc-500">{offer.nummer}</span> • <b className="text-white">{offer.prijs}</b> • {dateLabel}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs", paid ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-brand-500/30 bg-brand-600/10 text-brand-200")}>
          {offer.statusEmoji} {code === offer.code ? offer.status : code}
        </span>
      </div>

      {(offer.onderdelen?.length || offer.levertijd) && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white" aria-expanded={open}>
          <ChevronDown className={cn("size-4 transition", open && "rotate-180")} /> {tx.details}
        </button>
      )}
      {open && (
        <div className="mt-2 space-y-2 text-sm">
          {offer.onderdelen && offer.onderdelen.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{tx.included}</p>
              <ul className="mt-1 space-y-1">
                {offer.onderdelen.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-zinc-300"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-300" /> {o}</li>
                ))}
              </ul>
            </div>
          )}
          {offer.levertijd && <p className="text-zinc-400"><span className="text-zinc-500">{tx.delivery}:</span> {offer.levertijd}</p>}
          {code === "open" && offer.geldigTot && <p className="text-xs text-zinc-500">{tx.validUntil.replace("{date}", date(offer.geldigTot))}</p>}
        </div>
      )}

      {code === "open" && offer.id && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {confirming ? (
            <div className="w-full space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">{tx.confirm}</p>
              <label className="block">
                <span className="text-xs text-zinc-400">{tx.name}</span>
                <input value={signer} onChange={(e) => setSigner(e.target.value)} maxLength={80} autoComplete="name" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-brand-500/60 focus:outline-none" />
              </label>
              <label className="flex items-start gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-brand-500" />
                <span>
                  {tx.terms.split("{link}")[0]}
                  <a href={lp("/voorwaarden")} target="_blank" rel="noreferrer" className="text-brand-300 underline">{tx.termsLink}</a>
                  {tx.terms.split("{link}")[1].replace("{version}", voorwaardenLabel(locale))}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={accept} disabled={busy || signer.trim().length < 2 || !agreed}>{busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {tx.yes}</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>{tx.no}</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={() => setConfirming(true)}><CheckCircle2 /> {tx.accept}</Button>
          )}
        </div>
      )}
      {offer.ondertekening?.naam && (
        <p className="mt-3 text-xs text-zinc-500">✍️ {tx.signed.replace("{name}", offer.ondertekening.naam).replace("{date}", date(offer.ondertekening.t))}</p>
      )}
      {code === "akkoord" && offer.betaalinstructie && (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 text-sm">
          <p className="font-medium text-amber-100">{tx.pay}</p>
          <p className="mt-1 whitespace-pre-wrap text-zinc-300">{offer.betaalinstructie}</p>
        </div>
      )}
      {paid && offer.id && (
        <a href={`/klantportaal/bon/${offer.id}`} className="mt-4 inline-flex items-center gap-2 text-sm text-brand-300 hover:text-white">
          <Receipt className="size-4" /> {tx.receipt}
        </a>
      )}
      {message && <p role={message.ok ? "status" : "alert"} className={cn("mt-3 text-sm", message.ok ? "text-emerald-300" : "text-rose-300")}>{message.text}</p>}
    </li>
  );
}
