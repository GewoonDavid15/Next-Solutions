"use client";

import { BarChart3, FileSignature, Mail, ShieldCheck, Star, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { botApi } from "@/lib/dashboard";
import { useState } from "react";
import { BarChart } from "@/components/dashboard/BarChart";
import { ErrorsPanel } from "@/components/dashboard/ErrorsPanel";
import { SatisfactionPanel } from "@/components/dashboard/SatisfactionPanel";
import { FunnelPanel } from "@/components/dashboard/FunnelPanel";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { useBotData, type DayStats } from "@/lib/beheer";
import { cn } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;

export function StatsTab() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const week = useBotData<{ cijfers: Record<string, number | null | { naam: string; level: number }[]> }>("beheer/weekrapport");
  const [sent, setSent] = useState("");
  const { data, error, loading } = useBotData<{ dagen: DayStats[] }>(`beheer/stats?dagen=${range}`, 5 * 60_000);
  const rows = data?.dagen ?? [];
  const sum = (k: keyof DayStats) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const reviewed = rows.filter((r) => r.reviews);
  const avgStars = reviewed.length ? reviewed.reduce((s, r) => s + (r.sterren ?? 0) * r.reviews, 0) / sum("reviews") : null;
  const growth = sum("joins") - sum("leaves");

  const cards = [
    { label: "Nieuwe leden", value: sum("joins"), sub: `${growth >= 0 ? "+" : ""}${growth} netto`, icon: Users },
    { label: "Tickets geopend", value: sum("ticketsOpen"), sub: `${sum("ticketsDicht")} gesloten`, icon: Ticket },
    { label: "Offertes", value: sum("offertes"), sub: `${sum("betaald")} betaald`, icon: FileSignature },
    { label: "Reviews", value: sum("reviews"), sub: avgStars ? `gemiddeld ${avgStars.toFixed(1).replace(".", ",")} ★` : "nog geen", icon: Star },
    { label: "Verificaties", value: sum("verificaties"), sub: "captcha gehaald", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><BarChart3 className="size-5 text-brand-300" /> Statistieken</h2>
        <div className="flex gap-1 rounded-2xl border border-white/10 p-1">
          {RANGES.map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)} className={cn("rounded-xl px-3 py-1 text-sm", range === r ? "bg-brand-600/20 text-white" : "text-zinc-400 hover:text-white")}>
              {r} dagen
            </button>
          ))}
        </div>
      </div>
      <FunnelPanel days={range} />
      <ErrorsPanel />
      <SatisfactionPanel />
      {week.data && (
        <Panel title="Afgelopen 7 dagen" icon={Mail} actions={
          <Button size="sm" variant="secondary" onClick={() => botApi("POST", "beheer/weekrapport/stuur").then(() => setSent("Verstuurd als DM.")).catch((e) => setSent((e as Error).message))}>
            <Mail /> Stuur als DM
          </Button>
        }>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {([
              ["Nieuwe leden", week.data.cijfers.nieuweLeden], ["Tickets gesloten", week.data.cijfers.ticketsGesloten], ["Offertes betaald", week.data.cijfers.offertesBetaald],
              ["Omzet", `€ ${Number(week.data.cijfers.omzet ?? 0).toLocaleString("nl-NL")}`], ["Abonnementen", week.data.cijfers.abonnementen], ["Per maand (MRR)", `€ ${Number(week.data.cijfers.mrr ?? 0).toLocaleString("nl-NL")}`],
              ["Tevreden klanten", week.data.cijfers.tevreden === null ? "–" : `${week.data.cijfers.tevreden}%`],
            ] as [string, unknown][]).map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-white/10 p-3"><p className="text-xs text-zinc-500">{l}</p><p className="mt-0.5 text-lg font-semibold">{String(v ?? "–")}</p></div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">Elke maandagochtend krijg je dit overzicht als DM. Tevredenheid = het deel van de reviews met 4 of 5 sterren.{sent && ` • ${sent}`}</p>
        </Panel>
      )}
      {error && <Notice>{error}</Notice>}
      {loading && !data && <Loading />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {cards.map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500"><Icon className="size-3.5" /> {label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
                <p className="text-xs text-zinc-500">{sub}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Leden erbij en eraf" icon={Users}>
              <BarChart rows={rows} series={[{ key: "joins", label: "Erbij", color: "#C6F432" }, { key: "leaves", label: "Vertrokken", color: "#FF6B6B" }]} />
            </Panel>
            <Panel title="Tickets" icon={Ticket}>
              <BarChart rows={rows} series={[{ key: "ticketsOpen", label: "Geopend", color: "#FFB547" }, { key: "ticketsDicht", label: "Gesloten", color: "#6E9BFF" }]} />
            </Panel>
            <Panel title="Offertes" icon={FileSignature}>
              <BarChart rows={rows} series={[{ key: "offertes", label: "Gemaakt", color: "#6E9BFF" }, { key: "betaald", label: "Betaald", color: "#C6F432" }]} />
            </Panel>
            <Panel title="Reviews en verificaties" icon={Star}>
              <BarChart rows={rows} series={[{ key: "reviews", label: "Reviews", color: "#FFB547" }, { key: "verificaties", label: "Verificaties", color: "#FF9B5E" }]} />
            </Panel>
          </div>
          <p className="text-xs text-zinc-500">Leden worden geteld vanaf het moment dat invite-tracking aanstond. Tickets tellen vanaf de bewaarde transcripts.</p>
        </>
      )}
    </div>
  );
}
