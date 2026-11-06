"use client";

import { Clock, FolderKanban, Timer } from "lucide-react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { useBotData, timeAgo } from "@/lib/beheer";
import { cn } from "@/lib/utils";

interface Row { id: string; naam: string; klant: string | null; fase: string | null; percentage: number | null; deadline: number | null; uren: number; omzet: number | null; uurtarief: number | null; checklist: { klaar: number; totaal: number } | null; bestaat: boolean }

const eur = (n: number) => `€ ${n.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`;

export function ProjectsTab() {
  const { data, error, loading } = useBotData<{ projecten: Row[]; lopend: { naam: string; kanaal: string; sinds: number; notitie: string }[] }>("beheer/projecten", 60_000);
  if (loading && !data) return <Loading />;
  const rows = data?.projecten ?? [];
  const totaalUren = rows.reduce((s, r) => s + r.uren, 0);
  const totaalOmzet = rows.reduce((s, r) => s + (r.omzet ?? 0), 0);

  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Projecten", rows.length], ["Uren totaal", totaalUren.toLocaleString("nl-NL")], ["Omzet (betaald)", eur(totaalOmzet)], ["Gemiddeld uurtarief", totaalUren ? eur(totaalOmzet / totaalUren) : "–"]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{l}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div>
        ))}
      </div>
      {data && data.lopend.length > 0 && (
        <Panel title="Klok loopt" icon={Timer}>
          <ul className="space-y-1 text-sm">{data.lopend.map((l, i) => <li key={i}>⏱️ <b>{l.naam}</b> in #{l.kanaal} sinds {timeAgo(l.sinds)}{l.notitie ? ` • ${l.notitie}` : ""}</li>)}</ul>
        </Panel>
      )}
      <Panel title="Projecten & uren" icon={FolderKanban}>
        {!rows.length ? <p className="text-sm text-zinc-500">Nog geen projecten. Na een betaalde offerte start de bot automatisch het project en de checklist. Houd uren bij met <code>/tijd start</code> en <code>/tijd stop</code> in het projectkanaal.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500"><tr><th className="pb-2">Project</th><th className="pb-2">Status</th><th className="pb-2">Checklist</th><th className="pb-2 text-right">Uren</th><th className="pb-2 text-right">Omzet</th><th className="pb-2 text-right">Per uur</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.id} className={cn(!r.bestaat && "opacity-50")}>
                    <td className="py-2.5 pr-3"><p className="font-medium">{r.naam}</p><p className="text-xs text-zinc-500">{r.klant ?? "–"}{r.deadline ? ` • deadline ${new Date(r.deadline).toLocaleDateString("nl-NL")}` : ""}</p></td>
                    <td className="py-2.5 pr-3 text-xs">{r.fase ? <>{r.fase}<span className="block text-zinc-500">{r.percentage}%</span></> : "–"}</td>
                    <td className="py-2.5 pr-3 text-xs">{r.checklist ? <span className={r.checklist.klaar === r.checklist.totaal ? "text-emerald-300" : "text-zinc-300"}>{r.checklist.klaar}/{r.checklist.totaal}</span> : "–"}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums"><Clock className="mr-1 inline size-3 text-zinc-500" />{r.uren.toLocaleString("nl-NL")}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{r.omzet ? eur(r.omzet) : "–"}</td>
                    <td className={cn("py-2.5 text-right tabular-nums", r.uurtarief && r.uurtarief < 25 ? "text-amber-300" : "text-zinc-200")}>{r.uurtarief ? eur(r.uurtarief) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
