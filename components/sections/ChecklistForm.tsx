"use client";

import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { trackEvent } from "@/components/layout/Tracker";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: { name: "Je voornaam", email: "E-mailadres", send: "Stuur me de checklist", note: "We mailen je de link één keer. Geen nieuwsbrief, geen spam.", privacy: "Lees de privacyverklaring", failed: "Er ging iets mis, probeer het opnieuw." },
  en: { name: "Your first name", email: "Email address", send: "Send me the checklist", note: "We email you the link once. No newsletter, no spam.", privacy: "Read the privacy policy", failed: "Something went wrong, please try again." },
};

const field = "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function ChecklistForm({ slug }: { slug: string }) {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ naam, email, checklist: slug, taal: locale, website }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; verstuurd?: boolean };
      if (!res.ok || !data.ok) throw new Error(data.error ?? tx.failed);
      trackEvent("checklist");
      router.push(`${lp(`/gratis/${slug}/checklist`)}?welkom=${data.verstuurd ? "mail" : "1"}`);
    } catch (err) {
      setError((err as Error).message || tx.failed);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label className="block">
        <span className="sr-only">{tx.name}</span>
        <input required autoComplete="given-name" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder={tx.name} maxLength={80} className={field} />
      </label>
      <label className="block">
        <span className="sr-only">{tx.email}</span>
        <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx.email} maxLength={254} className={field} />
      </label>
      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" name="website" />
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />} {tx.send}
      </Button>
      <p className="text-xs text-zinc-500">{tx.note} <a href={lp("/privacy")} className="underline hover:text-zinc-300">{tx.privacy}</a>.</p>
    </form>
  );
}
