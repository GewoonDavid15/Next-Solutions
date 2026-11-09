"use client";

import { FeedbackPanel } from "@/components/dashboard/FeedbackPanel";
import { FolderKanban } from "lucide-react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { useBotData } from "@/lib/beheer";
import { cn } from "@/lib/utils";

interface Row { id: string; naam: string; klant: string | null; fase: string | null; percentage: number | null; deadline: number | null; omzet: number | null; checklist: { klaar: number; totaal: number } | null; bestaat: boolean }

const eur = (n: number) => `€ ${n.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`;

export function ProjectsTab() {
  const { data, error, loading } = useBotData<{ projecten: Row[] }>("beheer/projecten", 60_000);
  if (loading && !data) return <Loading />;
  const rows = data?.projecten ?? [];
  const lopend = rows.filter((r) => r.percentage !== null && r.percentage < 100).length;
  const omzet = rows.reduce((s, r) => s + (r.omzet ?? 0), 0);

  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[["Projecten", rows.length], ["Lopend", lopend], ["Omzet (betaald)", eur(omzet)]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{l}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div>
        ))}
      </div>
      <Panel title="Projecten" icon={FolderKanban}>
        {!rows.length ? <p className="text-sm text-zinc-500">Nog geen projecten. Na een betaalde offerte start de bot automatisch het project en de checklist.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500"><tr><th className="pb-2">Project</th><th className="pb-2">Status</th><th className="pb-2">Checklist</th><th className="pb-2 text-right">Omzet</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.id} className={cn(!r.bestaat && "opacity-50")}>
                    <td className="py-2.5 pr-3"><p className="font-medium">{r.naam}</p><p className="text-xs text-zinc-500">{r.klant ?? "–"}{r.deadline ? ` • deadline ${new Date(r.deadline).toLocaleDateString("nl-NL")}` : ""}</p></td>
                    <td className="py-2.5 pr-3 text-xs">{r.fase ? <>{r.fase}<span className="block text-zinc-500">{r.percentage}%</span></> : "–"}</td>
                    <td className="py-2.5 pr-3 text-xs">{r.checklist ? <span className={r.checklist.klaar === r.checklist.totaal ? "text-emerald-300" : "text-zinc-300"}>{r.checklist.klaar}/{r.checklist.totaal}</span> : "–"}</td>
                    <td className="py-2.5 text-right tabular-nums">{r.omzet ? eur(r.omzet) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <FeedbackPanel />
    </div>
  );
}
