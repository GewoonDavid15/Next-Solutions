"use client";

import { BellRing, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: {
    title: "Storingsmeldingen per e-mail", intro: "Krijg een mail als de website of onze Discord-bot een storing heeft, en als die is opgelost. Niets anders.",
    email: "E-mailadres", send: "Aanmelden", sent: "Bijna klaar! Bevestig je aanmelding via de mail die we je net stuurden.",
    confirmed: "Je bent aangemeld voor storingsmeldingen. ✅", unsubscribed: "Je bent afgemeld. Je krijgt geen storingsmeldingen meer.", failed: "Er ging iets mis.",
  },
  en: {
    title: "Outage notifications by email", intro: "Get an email when the website or our Discord bot has an outage, and when it is resolved. Nothing else.",
    email: "Email address", send: "Subscribe", sent: "Almost done! Confirm through the email we just sent you.",
    confirmed: "You are subscribed to outage notifications. ✅", unsubscribed: "You have been unsubscribed. You will not get outage notifications anymore.", failed: "Something went wrong.",
  },
};

export function StatusSubscribe() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Links from the emails: ?bevestig=token or ?afmelden=token
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const actie = p.has("bevestig") ? "bevestig" : p.has("afmelden") ? "afmelden" : null;
    if (!actie) return;
    fetch("/api/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actie, token: p.get(actie), taal: locale }) })
      .then(async (r) => { const d = (await r.json().catch(() => ({}))) as { fout?: string }; setMsg(r.ok ? { ok: true, text: actie === "bevestig" ? tx.confirmed : tx.unsubscribed } : { ok: false, text: d.fout ?? tx.failed }); })
      .catch(() => setMsg({ ok: false, text: tx.failed }));
    history.replaceState(null, "", location.pathname);
  }, [locale, tx.confirmed, tx.unsubscribed, tx.failed]);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, taal: locale }) }).catch(() => null);
    const d = (await r?.json().catch(() => null)) as { fout?: string } | null;
    setMsg(r?.ok ? { ok: true, text: tx.sent } : { ok: false, text: d?.fout ?? tx.failed });
    if (r?.ok) setEmail("");
    setState("idle");
  }

  return (
    <div className="glass mx-auto mt-10 max-w-2xl rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><BellRing className="size-5 text-brand-300" /> {tx.title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      <form onSubmit={subscribe} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">{tx.email}</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx.email} autoComplete="email" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-brand-500/60 focus:outline-none" />
        </label>
        <Button type="submit" disabled={state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />} {tx.send}</Button>
      </form>
      {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-rose-300"}>{msg.text}</p>}
    </div>
  );
}
