"use client";

import { Eye, Filter } from "lucide-react";
import { BarChart } from "@/components/dashboard/BarChart";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { useBotData } from "@/lib/beheer";

interface Funnel {
  perDag: { dag: string; bezoeken: number; paginas: number; aanvragen: number; offertes: number; betaald: number }[];
  totaal: { bezoeken: number; paginas: number; aanvragen: number; offertes: number; betaald: number };
  events: Record<string, number>;
  topPaginas: { pad: string; n: number }[];
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "–");

/** Website visits to paid quotes, from our own cookieless counter and the bot's data. */
export function FunnelPanel({ days }: { days: number }) {
  const { data, error, loading } = useBotData<Funnel>(`beheer/funnel?dagen=${days}`, 5 * 60_000);
  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  if (!data) return null;
  const t = data.totaal;
  const steps = [
    { label: "Bezoeken", value: t.bezoeken, rate: null },
    { label: "Aanvragen", value: t.aanvragen, rate: pct(t.aanvragen, t.bezoeken) },
    { label: "Offertes", value: t.offertes, rate: pct(t.offertes, t.aanvragen) },
    { label: "Betaald", value: t.betaald, rate: pct(t.betaald, t.offertes) },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Van bezoek tot betaling" icon={Filter}>
        <div className="space-y-3">
          {steps.map((s) => (
            <div key={s.label}>
              <div className="flex items-baseline justify-between text-sm"><span className="text-zinc-300">{s.label}</span><span><b className="text-white">{s.value.toLocaleString("nl-NL")}</b>{s.rate && <span className="ml-2 text-xs text-zinc-500">{s.rate} van de vorige stap</span>}</span></div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.max(1, (s.value / max) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-6"><BarChart rows={data.perDag} series={[{ key: "bezoeken", label: "Bezoeken", color: "#6E9BFF" }, { key: "aanvragen", label: "Aanvragen", color: "#C6F432" }]} height={120} /></div>
        <p className="mt-3 text-xs text-zinc-500">
          Eigen telling zonder cookies: één bezoek per browsertabblad. Calculator gebruikt: {data.events.calculator ?? 0}× • offerteformulier verstuurd: {data.events.offerteformulier ?? 0}× • social-formulier: {data.events.socialformulier ?? 0}×.
          Meer detail (landen, apparaten, bronnen) zie je in Vercel → Analytics.
        </p>
      </Panel>
      <Panel title="Meest bekeken pagina's" icon={Eye}>
        {!data.topPaginas.length ? <p className="text-sm text-zinc-500">Nog geen bezoeken geteld.</p> : (
          <ol className="space-y-1.5 text-sm">
            {data.topPaginas.map((p) => <li key={p.pad} className="flex justify-between gap-3"><span className="truncate font-mono text-xs text-zinc-300">{p.pad}</span><span className="tabular-nums text-zinc-400">{p.n.toLocaleString("nl-NL")}</span></li>)}
          </ol>
        )}
      </Panel>
    </div>
  );
}
