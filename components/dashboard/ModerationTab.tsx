"use client";

import { Ban, Clock, Gavel, ShieldAlert, Unlock, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface AutomodItem { t: number; userId: string; naam: string; avatar: string | null; kanaal: string | null; type: string; reden: string; detail: string; inhoud: string; timeoutMin: number; opgeruimd: number }
interface ModAction { t: number; actie: string; userId: string; naam: string; reden: string; minuten: number | null; door: string }
interface Overview {
  automod: AutomodItem[];
  acties: ModAction[];
  bans: { id: string; naam: string; avatar: string | null; reden: string | null }[];
  timeouts: { id: string; naam: string; avatar: string | null; tot: number }[];
}

const ACTION_LABEL: Record<string, string> = { timeout: "⏳ Time-out", untimeout: "🔓 Time-out opgeheven", kick: "👢 Kick", ban: "🔨 Ban", unban: "♻️ Ban opgeheven" };

function Face({ src, name }: { src: string | null; name: string }) {
  return src ? <Image src={src} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" unoptimized /> : <UserRound className="size-8 shrink-0 text-zinc-600" aria-label={name} />;
}

export function ModerationTab() {
  const { data, error, loading, reload } = useBotData<Overview>("beheer/moderatie", 30_000);
  const [filter, setFilter] = useState("alles");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function undo(id: string, actie: "unban" | "untimeout", name: string) {
    setBusy(id);
    setMessage(null);
    try {
      await botApi("POST", "beheer/lid/moderatie", { id, actie, reden: "Opgeheven via het dashboard" });
      setMessage({ kind: "success", text: actie === "unban" ? `Ban van ${name} opgeheven.` : `Time-out van ${name} opgeheven.` });
      reload();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setBusy(null);
  }

  if (loading && !data) return <Loading />;
  const types = [...new Set(data?.automod.map((a) => a.reden) ?? [])];
  const automod = (data?.automod ?? []).filter((a) => filter === "alles" || a.reden === filter);
  const today = (data?.automod ?? []).filter((a) => Date.now() - a.t < 86_400_000).length;

  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["AutoMod vandaag", today],
          ["AutoMod totaal", data?.automod.length ?? 0],
          ["Actieve time-outs", data?.timeouts.length ?? 0],
          ["Bans", data?.bans.length ?? 0],
        ].map(([l, n]) => (
          <div key={l as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Tegengehouden door AutoMod"
        icon={ShieldAlert}
        actions={
          types.length > 1 && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-sm">
              <option value="alles">Alles</option>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          )
        }
      >
        {!automod.length ? (
          <p className="text-sm text-zinc-500">Nog niets tegengehouden. Alles wat AutoMod vanaf nu verwijdert, verschijnt hier.</p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-white/5 overflow-y-auto">
            {automod.map((a, i) => (
              <li key={`${a.t}-${i}`} className="flex gap-3 py-3">
                <Face src={a.avatar} name={a.naam} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.naam}</span> <span className="text-zinc-500">in #{a.kanaal ?? "?"}</span>
                    <span className="ml-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200">{a.reden}</span>
                    {a.timeoutMin > 0 && <span className="ml-1 rounded-full border border-amber-400/30 px-2 py-0.5 text-[11px] text-amber-200">time-out {a.timeoutMin} min</span>}
                  </p>
                  <p className="mt-1 break-words rounded-xl bg-black/30 px-3 py-2 font-mono text-xs text-zinc-400">{a.inhoud || <i>leeg bericht</i>}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{a.detail} • <span title={dateTime(a.t)}>{timeAgo(a.t)}</span>{a.opgeruimd ? ` • ${a.opgeruimd} bericht(en) elders opgeruimd` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Actieve time-outs" icon={Clock}>
          {!data?.timeouts.length ? <p className="text-sm text-zinc-500">Niemand heeft nu een time-out.</p> : (
            <ul className="space-y-2">
              {data.timeouts.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <Face src={t.avatar} name={t.naam} />
                  <span className="min-w-0 flex-1 truncate text-sm">{t.naam} <span className="text-xs text-zinc-500">• tot {dateTime(t.tot)}</span></span>
                  <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => undo(t.id, "untimeout", t.naam)}><Unlock /> Opheffen</Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Bans" icon={Ban}>
          {!data?.bans.length ? <p className="text-sm text-zinc-500">Niemand is verbannen.</p> : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {data.bans.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <Face src={b.avatar} name={b.naam} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{b.naam}</span>
                    {b.reden && <span className="block truncate text-xs text-zinc-500">{b.reden}</span>}
                  </span>
                  <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => confirm(`Ban van ${b.naam} opheffen?`) && undo(b.id, "unban", b.naam)}><Unlock /> Opheffen</Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Acties via het dashboard" icon={Gavel}>
        {!data?.acties.length ? <p className="text-sm text-zinc-500">Nog geen acties. Modereer een lid via Leden → kies een lid → Moderatie.</p> : (
          <ul className="divide-y divide-white/5 text-sm">
            {data.acties.map((a, i) => (
              <li key={`${a.t}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <span className={cn("rounded-full px-2 py-0.5 text-xs", a.actie.startsWith("un") ? "bg-emerald-500/10 text-emerald-200" : "bg-rose-500/10 text-rose-200")}>{ACTION_LABEL[a.actie] ?? a.actie}</span>
                <span className="font-medium">{a.naam}</span>
                {a.minuten && <span className="text-zinc-500">{a.minuten} min</span>}
                <span className="min-w-0 flex-1 truncate text-zinc-400">{a.reden || "geen reden"}</span>
                <span className="text-xs text-zinc-500">door {a.door} • {timeAgo(a.t)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
