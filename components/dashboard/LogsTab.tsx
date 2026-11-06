"use client";

import { Archive, BellRing, CloudUpload, Download, FileText, HardDriveDownload, Loader2, Save, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, formatBytes } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const lineStyle = (line: string) =>
  /\bERROR\b|❌/.test(line) ? "text-rose-300" : /\bWARN\b|⚠️/.test(line) ? "text-amber-300" : "text-zinc-300";

export function LogsTab() {
  const files = useBotData<{ bestanden: { dag: string; grootte: number }[] }>("beheer/logbestanden");
  const backups = useBotData<{ backups: { dag: string; bestanden: number; grootte: number }[]; laatste: string | null }>("beheer/backups");
  const [day, setDay] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [making, setMaking] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!day && files.data?.bestanden[0]) setDay(files.data.bestanden[0].dag);
  }, [files.data, day]);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ dag: day ?? "", zoek: debounced, niveau: onlyErrors ? "fout" : "" });
  const log = useBotData<{ totaal: number; gevonden: number; regels: string[] }>(day ? `beheer/log?${params}` : null);

  async function action(path: string, success: (r: { dag?: string; grootte?: number }) => string) {
    setMaking(true);
    setMessage(null);
    try {
      const r = await botApi<{ dag?: string; grootte?: number }>("POST", path);
      setMessage({ kind: "success", text: success(r) });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setMaking(false);
  }

  async function makeBackup() {
    setMaking(true);
    setMessage(null);
    try {
      const r = await botApi<{ dag: string; aantal: number }>("POST", "beheer/backups/maak");
      setMessage({ kind: "success", text: `Back-up gemaakt: ${r.aantal} bestand(en) in ${r.dag}.` });
      backups.reload();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setMaking(false);
  }

  return (
    <div className="space-y-6">
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <Panel
        title="Logbestanden"
        icon={FileText}
        actions={
          day && (
            <a href={`/api/bot-download?soort=log&dag=${day}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <Download className="size-4" /> Download {day}
            </a>
          )
        }
      >
        {files.error && <Notice>{files.error}</Notice>}
        {!files.data && !files.error && <Loading />}
        {files.data && !files.data.bestanden.length && <p className="text-sm text-zinc-500">Nog geen logbestanden.</p>}
        {files.data && files.data.bestanden.length > 0 && (
          <>
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {files.data.bestanden.map((f) => (
                <button key={f.dag} type="button" onClick={() => setDay(f.dag)} className={cn("shrink-0 rounded-xl border px-3 py-1.5 text-left text-xs", day === f.dag ? "border-brand-500/50 bg-brand-600/15 text-white" : "border-white/10 text-zinc-400 hover:text-white")}>
                  {new Date(`${f.dag}T12:00:00`).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                  <span className="block text-[10px] text-zinc-500">{formatBytes(f.grootte)}</span>
                </button>
              ))}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek in de log, bijv. TICKET of een gebruikersnaam" className={cn(inputClass, "pl-9")} />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} className="accent-[#C6F432]" /> Alleen fouten en waarschuwingen
              </label>
              {log.data && <span className="text-xs text-zinc-500">{log.data.gevonden} van {log.data.totaal} regels</span>}
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed">
              {log.loading && !log.data && <Loader2 className="size-4 animate-spin text-zinc-500" />}
              {log.error && <Notice>{log.error}</Notice>}
              {log.data?.regels.map((line, i) => (
                <div key={i} className={cn("whitespace-pre-wrap break-all", lineStyle(line))}>{line}</div>
              ))}
              {log.data && !log.data.regels.length && <p className="text-zinc-500">Niets gevonden.</p>}
              {log.data && log.data.gevonden > log.data.regels.length && <p className="mt-2 text-zinc-500">Alleen de laatste {log.data.regels.length} regels worden getoond. Download het bestand voor alles.</p>}
            </div>
          </>
        )}
      </Panel>

      <Panel
        title="Back-ups"
        icon={Archive}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={makeBackup} disabled={making}>
              {making ? <Loader2 className="animate-spin" /> : <Save />} Nu back-up maken
            </Button>
            <Button size="sm" variant="secondary" disabled={making} onClick={() => action("beheer/backups/extern", (r) => `Back-up van ${r.dag} staat in het privékanaal 🔒・backups in Discord.`)}>
              <CloudUpload /> Naar Discord sturen
            </Button>
            <Button size="sm" variant="ghost" disabled={making} onClick={() => action("beheer/melding/test", () => "Testmelding verstuurd. Je krijgt hem als DM van de bot.")}>
              <BellRing /> Testmelding
            </Button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-zinc-400">Elke dag maakt de bot automatisch een back-up van alle gegevens (tickets, offertes, invites, reviews en meer) en zet hij een kopie in het privékanaal 🔒・backups in Discord, zodat je niets kwijt bent als de server crasht. Je kunt een back-up hier ook als één JSON-bestand downloaden.</p>
        {backups.error && <Notice>{backups.error}</Notice>}
        {!backups.data && !backups.error && <Loading />}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {backups.data?.backups.map((b) => (
            <div key={b.dag} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div>
                <p className="text-sm font-medium">
                  {new Date(`${b.dag}T12:00:00`).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
                  {backups.data?.laatste === b.dag && <span className="ml-2 rounded-full bg-brand-600/20 px-1.5 text-[10px] text-brand-200">laatste</span>}
                </p>
                <p className="text-xs text-zinc-500">{b.bestanden} bestanden • {formatBytes(b.grootte)}</p>
              </div>
              <a href={`/api/bot-download?soort=backup&dag=${b.dag}`} className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label={`Back-up van ${b.dag} downloaden`}>
                <HardDriveDownload className="size-4" />
              </a>
            </div>
          ))}
        </div>
        {backups.data && !backups.data.backups.length && <p className="text-sm text-zinc-500">Nog geen back-ups.</p>}
      </Panel>
    </div>
  );
}
