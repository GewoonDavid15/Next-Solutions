"use client";

import { CalendarDays, CalendarPlus, Check, Clock, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import type { Appointment } from "@/lib/profile";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    title: "Afspraken", intro: "Plan een (Discord-)call met het team. Tijden zijn Nederlandse tijd.", plan: "Afspraak plannen", day: "Kies een dag", time: "Kies een tijd", topic: "Onderwerp", note: "Wat wil je bespreken? (optioneel)",
    book: "Inplannen", booked: "Gepland! Je krijgt een DM ter bevestiging en een uur van tevoren een herinnering.", yours: "Jouw afspraken", none: "Je hebt nog geen afspraken.", cancel: "Annuleren", cancelled: "geannuleerd", done: "afgerond", planned: "gepland",
    noSlots: "Er zijn op dit moment geen vrije momenten. Open gerust een ticket.", off: "Afspraken plannen staat even uit.", failed: "Er ging iets mis.", minutes: "min",
  },
  en: {
    title: "Appointments", intro: "Schedule a (Discord) call with the team. Times are Dutch time (CET).", plan: "Schedule a call", day: "Pick a day", time: "Pick a time", topic: "Topic", note: "What would you like to discuss? (optional)",
    book: "Schedule", booked: "Scheduled! You'll get a DM to confirm and a reminder an hour before.", yours: "Your appointments", none: "You have no appointments yet.", cancel: "Cancel", cancelled: "cancelled", done: "done", planned: "scheduled",
    noSlots: "There are no free slots right now. Feel free to open a ticket.", off: "Scheduling is temporarily off.", failed: "Something went wrong.", minutes: "min",
  },
};

interface Data { aan: boolean; slots: number[]; duur: number; onderwerpen: string[]; afspraken: Appointment[] }

export function AppointmentsPanel() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const loc = locale === "en" ? "en-GB" : "nl-NL";
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/portaal/afspraken", { cache: "no-store" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (Data & { fout?: string }) | null;
    if (res?.ok && json) { setData(json); setTopic((t) => t || json.onderwerpen[0] || ""); } else setError(json?.fout ?? tx.failed);
  }, [tx.failed]);
  useEffect(() => { load(); }, [load]);

  const dayKey = (t: number) => new Date(t).toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
  const days = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const s of data?.slots ?? []) map.set(dayKey(s), [...(map.get(dayKey(s)) ?? []), s]);
    return [...map];
  }, [data]);
  const activeDay = day ?? days[0]?.[0] ?? null;
  const times = days.find(([d]) => d === activeDay)?.[1] ?? [];

  async function book() {
    if (!slot) return;
    setBusy(true); setError(""); setMessage("");
    const res = await fetch("/api/portaal/afspraken", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: slot, onderwerp: topic, notitie: note }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { fout?: string } | null;
    if (res?.ok) { setMessage(tx.booked); setSlot(null); setNote(""); await load(); } else setError(json?.fout ?? tx.failed);
    setBusy(false);
  }

  async function cancel(id: string) {
    if (!confirm(`${tx.cancel}?`)) return;
    const res = await fetch(`/api/portaal/afspraken?id=${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) load(); else setError(tx.failed);
  }

  const fmtDay = (k: string) => new Date(`${k}T12:00:00`).toLocaleDateString(loc, { weekday: "short", day: "numeric", month: "short" });
  const fmtTime = (t: number) => new Date(t).toLocaleTimeString(loc, { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
  const fmtFull = (t: number) => new Date(t).toLocaleString(loc, { timeZone: "Europe/Amsterdam", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="size-5 text-brand-300" /> {tx.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      </div>
      {!data && !error && <Loader2 className="size-5 animate-spin text-zinc-500" />}
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {message && <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"><Check className="size-4" /> {message}</p>}

      {data && (
        <div className="glass rounded-3xl p-5 sm:p-6">
          <h3 className="flex items-center gap-2 font-semibold"><CalendarPlus className="size-5 text-brand-300" /> {tx.plan}</h3>
          {!data.aan ? <p className="mt-3 text-sm text-zinc-400">{tx.off}</p> : days.length === 0 ? <p className="mt-3 text-sm text-zinc-400">{tx.noSlots}</p> : (
            <div className="mt-4 space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{tx.day}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.map(([d, list]) => (
                    <button key={d} type="button" onClick={() => { setDay(d); setSlot(null); }} className={cn("shrink-0 rounded-2xl border px-3 py-2 text-left text-sm", d === activeDay ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")}>
                      {fmtDay(d)}<span className="block text-[11px] text-zinc-500">{list.length}×</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{tx.time} ({data.duur} {tx.minutes})</p>
                <div className="flex flex-wrap gap-2">
                  {times.map((t) => (
                    <button key={t} type="button" onClick={() => setSlot(t)} className={cn("rounded-xl border px-3 py-1.5 text-sm tabular-nums", slot === t ? "border-brand-500/60 bg-brand-500 font-semibold text-ink" : "border-white/10 text-zinc-200 hover:border-white/25")}>
                      {fmtTime(t)}
                    </button>
                  ))}
                </div>
              </div>
              {slot && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-zinc-400">{tx.topic}</span>
                    <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm">
                      {data.onderwerpen.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="mb-1 block text-zinc-400">{tx.note}</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm" />
                  </label>
                  <div className="sm:col-span-2">
                    <Button onClick={book} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <CalendarPlus />} {tx.book}: {fmtFull(slot)}</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {data && (
        <div>
          <h3 className="font-semibold">{tx.yours}</h3>
          {data.afspraken.length === 0 ? <p className="mt-2 text-sm text-zinc-400">{tx.none}</p> : (
            <ul className="mt-3 space-y-2">
              {data.afspraken.map((a) => (
                <li key={a.id} className={cn("glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4", a.status !== "gepland" && "opacity-60")}>
                  <span>
                    <span className="block font-medium text-white">{a.onderwerp}</span>
                    <span className="flex items-center gap-1.5 text-sm text-zinc-400"><Clock className="size-3.5" /> {fmtFull(a.start)} • {a.status === "gepland" ? tx.planned : a.status === "afgerond" ? tx.done : tx.cancelled}</span>
                  </span>
                  {a.status === "gepland" && <Button size="sm" variant="ghost" onClick={() => cancel(a.id)}><X /> {tx.cancel}</Button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
