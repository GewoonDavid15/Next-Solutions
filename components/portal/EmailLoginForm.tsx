"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: { or: "of zonder Discord", email: "Je e-mailadres", send: "Stuur me een inloglink", sent: "Check je inbox! We hebben je een inloglink gestuurd (15 minuten geldig). Zie je niets? Kijk ook bij spam.", failed: "Er ging iets mis." },
  en: { or: "or without Discord", email: "Your email address", send: "Email me a login link", sent: "Check your inbox! We sent you a login link (valid for 15 minutes). Nothing there? Check your spam folder too.", failed: "Something went wrong." },
};

/** Log in with only an email address: for clients who don't use Discord. */
export function EmailLoginForm({ locale }: { locale: "nl" | "en" }) {
  const tx = texts[locale];
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    const r = await fetch("/api/auth/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, taal: locale, terug: locale === "en" ? "/en/klantportaal" : "/klantportaal" }) }).catch(() => null);
    const d = (await r?.json().catch(() => null)) as { fout?: string } | null;
    if (r?.ok) setState("sent");
    else { setError(d?.fout ?? tx.failed); setState("idle"); }
  }

  return (
    <div className="pt-2">
      <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-500"><span className="h-px flex-1 bg-white/10" />{tx.or}<span className="h-px flex-1 bg-white/10" /></p>
      {state === "sent" ? <p role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{tx.sent}</p> : (
        <form onSubmit={send} className="space-y-2">
          <label className="block">
            <span className="sr-only">{tx.email}</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx.email} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-brand-500/60 focus:outline-none" />
          </label>
          <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={state === "busy"}>{state === "busy" ? <Loader2 className="animate-spin" /> : <Mail />} {tx.send}</Button>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        </form>
      )}
    </div>
  );
}
