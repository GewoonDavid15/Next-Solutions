"use client";

import { AlertTriangle, ShieldAlert, Siren, UserX } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface Warning { id: string; userId: string; naam: string; reden: string; punten: number; door: string; t: number }
interface Data {
  raid: { start: number; tot: number; aantal: number; door: string } | null;
  raids: { start: number; eind: number; leden: number; door: string; gestoptDoor: string }[];
  waarschuwingen: Warning[];
  ranglijst: { id: string; naam: string; punten: number }[];
  straffen: { punten: number; minuten: number }[];
  verloopDagen: number;
  raidAan: boolean;
}

export function SecurityTab() {
  const { data, error, loading, reload } = useBotData<Data>("beheer/veiligheid", 20_000);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function raid(actie: "start" | "stop" | "kick") {
    if (actie === "kick" && !confirm("Alle leden die tijdens deze raid joinden kicken?")) return;
    try {
      const r = await botApi<{ gekickt?: number }>("POST", "beheer/raid", { actie });
      setMsg({ kind: "success", text: actie === "start" ? "Raid-stand staat aan." : actie === "stop" ? "Raid-stand staat uit." : `${r.gekickt ?? 0} account(s) gekickt.` });
      reload();
    } catch (err) { setMsg({ kind: "error", text: (err as Error).message }); }
  }
  async function revoke(id: string) {
    await botApi("POST", "beheer/waarschuwing/intrekken", { id }).catch(() => null);
    reload();
  }

  if (loading && !data) return <Loading />;
  const d = data;
  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Panel title="Anti-raid" icon={Siren} className={cn(d?.raid && "border-rose-400/50")}>
        {d?.raid ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-rose-200"><AlertTriangle className="size-5" /> Raid-stand staat aan sinds {timeAgo(d.raid.start)} ({d.raid.aantal} nieuwe leden). Gaat vanzelf uit {timeAgo(d.raid.tot)}.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => raid("stop")}>Raid-stand uitzetten</Button>
              <Button size="sm" variant="secondary" onClick={() => raid("kick")}><UserX /> Nieuwe leden kicken</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">{d?.raidAan ? "Bewaking staat aan. Bij veel joins in korte tijd verhoogt de bot automatisch de verificatie en waarschuwt hij je." : "Automatische bewaking staat uit (Instellingen → veiligheid)."}</p>
            <Button size="sm" variant="secondary" onClick={() => raid("start")}><Siren /> Raid-stand nu aanzetten</Button>
          </div>
        )}
        {d && d.raids.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-zinc-500">{d.raids.map((r) => <li key={r.start}>{dateTime(r.start)} • {r.leden} joins • gestart {r.door} • gestopt door {r.gestoptDoor}</li>)}</ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Waarschuwingen" icon={ShieldAlert}>
          <p className="mb-3 text-xs text-zinc-500">
            Geef waarschuwingen met <code>/waarschuw</code> of via Leden → kies een lid. Punten verlopen na {d?.verloopDagen} dagen.
            Straffen: {d?.straffen.map((s) => `${s.punten} pt = ${s.minuten >= 1440 ? `${s.minuten / 1440} dag` : `${s.minuten} min`} time-out`).join(", ")}.
          </p>
          {!d?.waarschuwingen.length ? <p className="text-sm text-zinc-500">Nog geen waarschuwingen.</p> : (
            <ul className="divide-y divide-white/5">
              {d.waarschuwingen.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">{w.punten} pt</span>
                  <span className="font-medium">{w.naam}</span>
                  <span className="min-w-0 flex-1 truncate text-zinc-400">{w.reden}</span>
                  <span className="text-xs text-zinc-500">{w.door} • {timeAgo(w.t)}</span>
                  <button type="button" onClick={() => revoke(w.id)} className="text-xs text-zinc-500 hover:text-white">Intrekken</button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Meeste punten">
          {!d?.ranglijst.length ? <p className="text-sm text-zinc-500">Niemand heeft actieve punten.</p> : (
            <ol className="space-y-1.5 text-sm">{d.ranglijst.map((r) => <li key={r.id} className="flex justify-between"><span>{r.naam}</span><span className="font-semibold text-amber-200">{r.punten}</span></li>)}</ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
