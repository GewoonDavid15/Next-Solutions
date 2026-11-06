"use client";

import { useState } from "react";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

/** Stacked bar chart per day with a hover readout. Data rows: { dag: "YYYY-MM-DD", [key]: number }. */
export function BarChart<T extends { dag: string }>({ rows, series, height = 160 }: { rows: T[]; series: BarSeries[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const value = (row: T, key: string) => Number((row as Record<string, unknown>)[key] ?? 0) || 0;
  const totals = rows.map((r) => series.reduce((s, x) => s + value(r, x.key), 0));
  const max = Math.max(1, ...totals);
  const active = hover ?? rows.length - 1;
  const row = rows[active];
  const label = (dag: string) => new Date(`${dag}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

  if (!rows.length) return null;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="text-zinc-400">{row ? label(row.dag) : ""}</span>
        <span className="flex flex-wrap gap-3">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-zinc-300">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.label}: <b className="font-semibold text-white">{row ? value(row, s.key) : 0}</b>
            </span>
          ))}
        </span>
      </div>
      <div className="flex items-end gap-[2px]" style={{ height }} onMouseLeave={() => setHover(null)} role="img" aria-label={`Grafiek: ${series.map((s) => s.label).join(", ")}`}>
        {rows.map((r, i) => (
          <div key={r.dag} className="flex h-full flex-1 cursor-default flex-col justify-end" onMouseEnter={() => setHover(i)}>
            <div className="flex flex-col-reverse overflow-hidden rounded-t-[3px]" style={{ height: `${(totals[i] / max) * 100}%`, minHeight: totals[i] ? 2 : 0, opacity: hover === null || hover === i ? 1 : 0.45 }}>
              {series.map((s) => (
                <div key={s.key} style={{ background: s.color, flexGrow: value(r, s.key) }} />
              ))}
            </div>
            {!totals[i] && <div className="h-[2px] rounded bg-white/10" />}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span>{label(rows[0].dag)}</span>
        <span>{label(rows[rows.length - 1].dag)}</span>
      </div>
    </div>
  );
}
