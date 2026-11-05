"use client";

import { LineChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Notice, Panel } from "@/components/dashboard/ui";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface Point {
  t: number;
  leden: number;
  openTickets: number;
  gesloten: number;
  ping: number | null;
  ramMb: number;
}

const RANGES = [
  { id: "24u", label: "24 uur", ms: 24 * 3_600_000 },
  { id: "7d", label: "7 dagen", ms: 7 * 24 * 3_600_000 },
  { id: "30d", label: "30 dagen", ms: 30 * 24 * 3_600_000 },
] as const;

const SERIES = [
  { key: "leden", label: "Leden", stroke: "#C6F432", unit: "" },
  { key: "openTickets", label: "Open tickets", stroke: "#FFB547", unit: "" },
  { key: "ping", label: "Ping", stroke: "#FF9B5E", unit: " ms" },
  { key: "ramMb", label: "RAM", stroke: "#6E9BFF", unit: " MB" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

/** Small SVG line chart with min/max labels and a hover tooltip. */
function Sparkline({ points, stroke, unit, label }: { points: { t: number; v: number }[]; stroke: string; unit: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 140;
  const PAD = 6;

  if (points.length < 2) return <p className="py-10 text-center text-sm text-zinc-500">Nog te weinig gegevens. Elk kwartier komt er een punt bij.</p>;

  const values = points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const x = (t: number) => PAD + ((t - t0) / (t1 - t0 || 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(t1).toFixed(1)},${H} L${x(t0).toFixed(1)},${H} Z`;
  const active = hover !== null ? points[hover] : points[points.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-2xl text-white">
          {Math.round(active.v)}
          <span className="text-sm text-zinc-400">{unit}</span>
        </p>
        <p className="text-xs text-zinc-500">
          {new Date(active.t).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-36 w-full touch-none"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: van ${Math.round(min)} tot ${Math.round(max)}${unit}`}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const tt = t0 + ((e.clientX - rect.left) / rect.width) * (t1 - t0);
          let best = 0;
          points.forEach((p, i) => {
            if (Math.abs(p.t - tt) < Math.abs(points[best].t - tt)) best = i;
          });
          setHover(best);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <path d={area} fill={stroke} opacity={0.12} />
        <path d={line} fill="none" stroke={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {hover !== null && <line x1={x(active.t)} x2={x(active.t)} y1={0} y2={H} stroke="white" strokeOpacity={0.25} vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="flex justify-between text-[11px] text-zinc-500">
        <span>min {Math.round(min)}{unit}</span>
        <span>max {Math.round(max)}{unit}</span>
      </div>
    </div>
  );
}

export function Charts() {
  const [data, setData] = useState<Point[] | null>(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("7d");

  useEffect(() => {
    botApi<{ punten: Point[] }>("GET", "geschiedenis")
      .then((d) => setData(d.punten))
      .catch((err: Error) => setError(err.message));
  }, []);

  const visible = useMemo(() => {
    const ms = RANGES.find((r) => r.id === range)!.ms;
    return (data ?? []).filter((p) => p.t >= Date.now() - ms);
  }, [data, range]);

  const series = (key: SeriesKey) =>
    visible.filter((p) => typeof p[key] === "number").map((p) => ({ t: p.t, v: p[key] as number }));

  return (
    <Panel
      title="Geschiedenis"
      icon={LineChart}
      actions={
        <div className="flex gap-1 rounded-2xl bg-white/[0.03] p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={cn("rounded-xl px-3 py-1.5 text-xs", range === r.id ? "bg-brand-600/30 text-white" : "text-zinc-400 hover:text-white")}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {error ? (
        <Notice>{error}</Notice>
      ) : !data ? (
        <p className="py-6 text-sm text-zinc-400">Laden...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {SERIES.map((s) => (
            <div key={s.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <span className="size-2 rounded-full" style={{ background: s.stroke }} /> {s.label}
              </p>
              <Sparkline points={series(s.key)} stroke={s.stroke} unit={s.unit} label={s.label} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
