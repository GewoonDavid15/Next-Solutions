"use client";

import { MailWarning, Smile } from "lucide-react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { dateTime, timeAgo, useBotData } from "@/lib/beheer";
import { cn } from "@/lib/utils";

interface Satisfaction {
  gemiddelde: number | null;
  nps: number | null;
  aantal: number;
  openstaand: number;
  antwoorden: { id: string; project: string; klantId: string; score: number | null; opmerking: string | null; beantwoord: number | null; gevraagd: number | null }[];
}
interface Outages { abonnees: number; storingen: { id: string; soort: "website" | "bot"; start: number; eind: number | null }[] }

/** Satisfaction after delivery (NPS) and outage history with the number of email subscribers. */
export function SatisfactionPanel() {
  const s = useBotData<Satisfaction>("beheer/tevredenheid", 5 * 60_000);
  const o = useBotData<Outages>("beheer/storing", 5 * 60_000);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Tevredenheid na oplevering" icon={Smile}>
        {s.error ? <Notice>{s.error}</Notice> : !s.data ? <Loading /> : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3"><p className="text-2xl font-bold text-white">{s.data.gemiddelde ?? "–"}</p><p className="text-xs text-zinc-500">gemiddeld cijfer</p></div>
              <div className="rounded-2xl bg-white/5 p-3"><p className={cn("text-2xl font-bold", (s.data.nps ?? 0) >= 0 ? "text-brand-300" : "text-rose-300")}>{s.data.nps ?? "–"}</p><p className="text-xs text-zinc-500">NPS</p></div>
              <div className="rounded-2xl bg-white/5 p-3"><p className="text-2xl font-bold text-white">{s.data.aantal}</p><p className="text-xs text-zinc-500">antwoorden ({s.data.openstaand} open)</p></div>
            </div>
            {!s.data.antwoorden.length ? <p className="text-sm text-zinc-400">Na elke oplevering (100%) krijgt de klant na een dag de vraag hoe tevreden hij is.</p> : (
              <ul className="max-h-72 space-y-2 overflow-y-auto text-sm">
                {s.data.antwoorden.map((a) => (
                  <li key={a.id} className="rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className={cn("mr-2 font-bold", a.score === null ? "text-zinc-500" : a.score >= 9 ? "text-brand-300" : a.score <= 6 ? "text-rose-300" : "text-amber-200")}>{a.score ?? "?"}{a.score !== null && "/10"}</span>
                    <b className="text-white">{a.project}</b> <span className="text-xs text-zinc-500">• {a.beantwoord ? timeAgo(a.beantwoord) : a.gevraagd ? "gevraagd, nog geen antwoord" : "wordt binnenkort gevraagd"}</span>
                    {a.opmerking && <p className="mt-1 text-zinc-300">{a.opmerking}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
      <Panel title="Storingen" icon={MailWarning}>
        {o.error ? <Notice>{o.error}</Notice> : !o.data ? <Loading /> : (
          <>
            <p className="mb-3 text-sm text-zinc-400"><b className="text-white">{o.data.abonnees}</b> bezoekers krijgen een mail bij een storing (aanmelden op /status).</p>
            {!o.data.storingen.length ? <p className="text-sm text-zinc-500">Geen storingen gemeten. 🎉</p> : (
              <ul className="space-y-1.5 text-sm">
                {o.data.storingen.map((x) => (
                  <li key={x.id} className="flex justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                    <span>{x.soort === "website" ? "🌐 Website" : "🤖 Bot"} • {dateTime(x.start)}</span>
                    <span className={x.eind ? "text-zinc-400" : "text-rose-300"}>{x.eind ? `${Math.max(1, Math.round((x.eind - x.start) / 60000))} min` : "nu"}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
