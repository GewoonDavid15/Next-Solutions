"use client";

import { Bug, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { dateTime, timeAgo, useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface SiteError {
  id: string;
  bron: "browser" | "server";
  bericht: string;
  pad: string;
  stack: string | null;
  digest: string | null;
  browser: string | null;
  aantal: number;
  eerste: number;
  laatste: number;
  opgelost: boolean;
}

/** Errors that visitors ran into on the website, grouped, newest first. */
export function ErrorsPanel() {
  const { data, error, loading, reload } = useBotData<{ fouten: SiteError[] }>("beheer/fouten", 2 * 60_000);
  const [open, setOpen] = useState<string | null>(null);
  const [showSolved, setShowSolved] = useState(false);

  async function mark(id: string, opgelost = true) {
    await botApi("POST", "beheer/fout/opgelost", { id, opgelost }).catch(() => null);
    reload();
  }

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  const all = data?.fouten ?? [];
  const list = all.filter((f) => showSolved || !f.opgelost);
  const openCount = all.filter((f) => !f.opgelost).length;

  return (
    <Panel
      title={`Foutmeldingen van de website${openCount ? ` (${openCount})` : ""}`}
      icon={Bug}
      actions={
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={showSolved} onChange={(e) => setShowSolved(e.target.checked)} className="accent-brand-500" /> Opgeloste tonen</label>
          {openCount > 1 && <Button size="sm" variant="secondary" onClick={() => mark("alles")}><Check /> Alles opgelost</Button>}
        </div>
      }
    >
      {!list.length ? (
        <p className="text-sm text-zinc-400">{all.length ? "Geen openstaande fouten. 🎉" : "Nog geen fouten gemeld. Gaat er iets mis op de site, dan zie je het hier en krijg je een DM."}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f) => (
            <li key={f.id} className={cn("rounded-2xl border border-white/10 bg-black/20 p-3 text-sm", f.opgelost && "opacity-60")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <button type="button" onClick={() => setOpen(open === f.id ? null : f.id)} className="min-w-0 flex-1 text-left" aria-expanded={open === f.id}>
                  <p className="break-words font-mono text-xs text-rose-200">{f.bericht}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    <span className={cn("mr-2 rounded px-1.5 py-0.5 font-semibold", f.bron === "server" ? "bg-amber-500/15 text-amber-200" : "bg-sky-500/15 text-sky-200")}>{f.bron}</span>
                    <span className="font-mono">{f.pad}</span> • {f.aantal}× • laatst {timeAgo(f.laatste)}{f.browser && ` • ${f.browser}`}
                  </p>
                </button>
                {f.opgelost
                  ? <Button size="sm" variant="ghost" onClick={() => mark(f.id, false)}><RotateCcw /> Heropenen</Button>
                  : <Button size="sm" variant="secondary" onClick={() => mark(f.id)}><Check /> Opgelost</Button>}
              </div>
              {open === f.id && (
                <div className="mt-3 space-y-1 text-xs text-zinc-400">
                  <p>Eerste keer: {dateTime(f.eerste)} • laatste keer: {dateTime(f.laatste)}{f.digest && ` • digest ${f.digest}`}</p>
                  {f.stack && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 font-mono text-[11px] text-zinc-300">{f.stack}</pre>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
