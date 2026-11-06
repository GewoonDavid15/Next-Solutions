"use client";

import { CalendarPlus, Check, Copy, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: {
    title: "In je eigen agenda", intro: "Je afspraken en je contentkalender automatisch in Google Agenda, Outlook of de agenda op je telefoon. Nieuwe items verschijnen vanzelf.",
    google: "Toevoegen aan Google Agenda", apple: "Apple / Outlook", copy: "Link kopiëren", copied: "Gekopieerd", download: "Eenmalig downloaden (.ics)",
    secret: "Deel deze link niet: iedereen met de link ziet je afspraken.", renew: "Nieuwe link maken", renewConfirm: "De oude link stopt dan met werken. Doorgaan?", items: "{n} items in je agenda",
  },
  en: {
    title: "In your own calendar", intro: "Your appointments and content calendar automatically in Google Calendar, Outlook or the calendar on your phone. New items show up by themselves.",
    google: "Add to Google Calendar", apple: "Apple / Outlook", copy: "Copy link", copied: "Copied", download: "Download once (.ics)",
    secret: "Do not share this link: anyone with it can see your appointments.", renew: "Create a new link", renewConfirm: "The old link will stop working. Continue?", items: "{n} items in your calendar",
  },
};

/** Private calendar feed (.ics) for appointments and the content calendar. */
export function CalendarSync({ userId }: { userId: string }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [key, setKey] = useState("");
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/portaal/agenda", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d: { aan?: boolean; sleutel?: string; aantal?: number } | null) => {
      if (d?.aan && d.sleutel) { setKey(d.sleutel); setCount(d.aantal ?? 0); }
    }).catch(() => {});
  }, []);

  if (!key) return null;
  const https = `${location.origin}/api/agenda/${userId}/${key}.ics`;
  const webcal = https.replace(/^https?:/, "webcal:");

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><CalendarPlus className="size-5 text-brand-300" /> {tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm"><a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer">{tx.google}</a></Button>
        <Button asChild size="sm" variant="secondary"><a href={webcal}>{tx.apple}</a></Button>
        <Button size="sm" variant="secondary" onClick={async () => { await navigator.clipboard.writeText(https).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check /> : <Copy />} {copied ? tx.copied : tx.copy}</Button>
        <Button asChild size="sm" variant="ghost"><a href={https} download="next-solutions.ics"><Download /> {tx.download}</a></Button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">{tx.items.replace("{n}", String(count))} • {tx.secret}{" "}
        <button type="button" className="underline hover:text-zinc-300" onClick={async () => {
          if (!confirm(tx.renewConfirm)) return;
          const r = await fetch("/api/portaal/agenda", { method: "POST" }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as { sleutel?: string } | null;
          if (r?.sleutel) setKey(r.sleutel);
        }}><RefreshCw className="mr-1 inline size-3" />{tx.renew}</button>
      </p>
    </div>
  );
}
