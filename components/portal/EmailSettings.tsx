"use client";

import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/i18n/config";
import type { ClientEmailStatus } from "@/lib/live";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    failed: "Er ging iets mis.",
    sent: "We hebben een bevestigingsmail gestuurd naar {email}. Klik op de knop in die mail.",
    confirmOff: "Alle e-mailmeldingen uitzetten? Je e-mailadres wordt dan verwijderd.",
    off: "Je bent afgemeld en je e-mailadres is verwijderd.",
    title: "E-mailmeldingen",
    intro: "Naast een DM van onze bot kun je updates ook per e-mail krijgen.",
    onFor: "Aan voor {email}",
    allOff: "Alle e-mailmeldingen uitzetten",
    placeholder: "jouw@email.nl",
    address: "E-mailadres",
    resend: "Opnieuw versturen",
    enable: "Aanzetten",
    waiting: "Wacht op bevestiging: kijk in de inbox (of spam) van {email}.",
  },
  en: {
    failed: "Something went wrong.",
    sent: "We've sent a confirmation email to {email}. Click the button in that email.",
    confirmOff: "Turn off all email notifications? Your email address will then be removed.",
    off: "You've been unsubscribed and your email address has been removed.",
    title: "Email notifications",
    intro: "Besides a DM from our bot, you can also receive updates by email. The emails themselves are in Dutch.",
    onFor: "On for {email}",
    allOff: "Turn off all email notifications",
    placeholder: "you@email.com",
    address: "Email address",
    resend: "Send again",
    enable: "Turn on",
    waiting: "Awaiting confirmation: check the inbox (or spam) of {email}.",
  },
};

/** Email notifications in the client portal: opt in with a confirmation mail, choose which ones, opt out. */
export function EmailSettings({ initial }: { initial: ClientEmailStatus }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [status, setStatus] = useState(initial);
  const [email, setEmail] = useState(initial.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function call(body: object) {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/portaal/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = ((await res?.json().catch(() => null)) ?? {}) as { fout?: string };
    setBusy(false);
    if (!res?.ok) setMessage({ kind: "error", text: data.fout ?? tx.failed });
    return Boolean(res?.ok);
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (await call({ actie: "aanmelden", email })) {
      setStatus({ ...status, email, bevestigd: false });
      setMessage({ kind: "ok", text: fmt(tx.sent, { email }) });
    }
  }

  async function unsubscribe() {
    if (!window.confirm(tx.confirmOff)) return;
    if (await call({ actie: "afmelden" })) {
      setStatus({ ...status, email: null, bevestigd: false });
      setEmail("");
      setMessage({ kind: "ok", text: tx.off });
    }
  }

  async function toggle(type: string, on: boolean) {
    const voorkeuren = { ...status.voorkeuren, [type]: on };
    setStatus({ ...status, voorkeuren });
    if (!(await call({ actie: "voorkeuren", voorkeuren }))) setStatus(status);
  }

  if (!status.beschikbaar) return null;

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><Mail className="size-5 text-brand-300" /> {tx.title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>

      {status.email && status.bevestigd ? (
        <div className="mt-4 space-y-4">
          <p className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="size-4" /> {fmt(tx.onFor, { email: status.email })}</p>
          <ul className="space-y-2">
            {Object.entries(status.soorten).map(([type, label]) => (
              <li key={type} className="flex items-center justify-between gap-4 text-sm text-zinc-300">
                {label}
                <button
                  type="button"
                  role="switch"
                  aria-checked={status.voorkeuren[type] !== false}
                  aria-label={label}
                  disabled={busy}
                  onClick={() => toggle(type, status.voorkeuren[type] === false)}
                  className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition disabled:opacity-50", status.voorkeuren[type] !== false ? "border-brand-500/60 bg-brand-600" : "border-white/15 bg-white/10")}
                >
                  <span className={cn("inline-block size-4 rounded-full bg-white transition", status.voorkeuren[type] !== false ? "translate-x-6" : "translate-x-1")} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={unsubscribe} disabled={busy} className="text-sm text-zinc-400 underline hover:text-white">{tx.allOff}</button>
        </div>
      ) : (
        <form onSubmit={subscribe} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tx.placeholder}
            aria-label={tx.address}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <Button type="submit" size="sm" disabled={busy} className="h-11 shrink-0">
            {busy ? <Loader2 className="animate-spin" /> : <Mail />} {status.email ? tx.resend : tx.enable}
          </Button>
        </form>
      )}
      {status.email && !status.bevestigd && !message && <p className="mt-3 text-sm text-amber-300">{fmt(tx.waiting, { email: status.email })}</p>}
      {message && <p role={message.kind === "error" ? "alert" : "status"} className={cn("mt-3 text-sm", message.kind === "error" ? "text-rose-300" : "text-emerald-300")}>{message.text}</p>}
    </div>
  );
}
