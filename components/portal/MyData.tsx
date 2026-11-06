"use client";

import { Check, Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: {
    title: "Mijn gegevens", intro: "Download een kopie van alles wat we over je bewaren, of vraag ons om je gegevens te verwijderen.",
    download: "Download mijn gegevens (JSON)", remove: "Gegevens laten verwijderen", what: "Wat wil je laten verwijderen? (leeg = alles)",
    note: "Gegevens over betalingen moeten we volgens de wet nog een tijd bewaren. We laten je weten wat we hebben verwijderd.",
    send: "Verzoek versturen", cancel: "Annuleren", sent: "Je verzoek is verstuurd. We nemen binnen dertig dagen contact met je op via Discord.", failed: "Er ging iets mis.", privacy: "Lees de privacyverklaring",
  },
  en: {
    title: "My data", intro: "Download a copy of everything we store about you, or ask us to delete your data.",
    download: "Download my data (JSON)", remove: "Request deletion", what: "What would you like us to delete? (empty = everything)",
    note: "By law we have to keep payment records for a while. We'll let you know what we deleted.",
    send: "Send request", cancel: "Cancel", sent: "Your request has been sent. We'll contact you on Discord within thirty days.", failed: "Something went wrong.", privacy: "Read the privacy policy",
  },
};

export function MyData() {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function send() {
    setState("busy"); setError("");
    const res = await fetch("/api/portaal/gegevens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toelichting: text }) }).catch(() => null);
    if (res?.ok) setState("done"); else { setError(tx.failed); setState("idle"); }
  }

  return (
    <div className="glass max-w-2xl rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-brand-300" /> {tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro} <Link href={lp("/privacy")} className="text-brand-300 hover:underline">{tx.privacy}</Link></p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary"><a href="/api/portaal/gegevens" download><Download /> {tx.download}</a></Button>
        {state !== "done" && !open && <Button size="sm" variant="ghost" onClick={() => setOpen(true)}><Trash2 /> {tx.remove}</Button>}
      </div>
      {open && state !== "done" && (
        <div className="mt-4 space-y-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} placeholder={tx.what} className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm" />
          <p className="text-xs text-zinc-500">{tx.note}</p>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={send} disabled={state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />} {tx.send}</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>{tx.cancel}</Button>
          </div>
        </div>
      )}
      {state === "done" && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-300"><Check className="size-4" /> {tx.sent}</p>}
    </div>
  );
}
