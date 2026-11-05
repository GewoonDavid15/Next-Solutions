"use client";

import { Bot, Bug, Clock, Cpu, FolderKanban, Gauge, Globe, RefreshCw, Server, Ticket, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Charts } from "@/components/dashboard/Charts";
import { Loading, Notice, Panel, RestartButton } from "@/components/dashboard/ui";
import { botApi, formatDuration, type Overview } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const serviceStyle: Record<string, string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  outage: "bg-rose-400",
  onbekend: "bg-zinc-500",
};

function Stat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function OverviewTab() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      setData(await botApi<Overview>("GET", "overzicht"));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15_000);
    return () => clearInterval(timer);
  }, [load]);

  if (!data) return error ? <Notice>{error}</Notice> : <Loading />;
  const { bot, server, modules, tickets, diensten, bugs, projecten, invites } = data;

  return (
    <div className="space-y-6">
      {error && <Notice>{error} (laatst bekende gegevens worden getoond)</Notice>}

      <Panel
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={load} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <RefreshCw className="size-4" /> Vernieuwen
            </button>
            <RestartButton />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          {bot.avatar ? (
            <Image src={bot.avatar} alt="" width={56} height={56} className="size-14 rounded-2xl" unoptimized />
          ) : (
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-600/20">
              <Bot className="size-7 text-brand-300" />
            </span>
          )}
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className={cn("size-2.5 rounded-full", bot.online ? "bg-emerald-400" : "bg-rose-400")} />
              {bot.tag ?? "Bot"} {bot.online ? "is online" : "is offline"}
            </p>
            <p className="text-sm text-zinc-400">
              Online sinds {formatDuration(now - bot.opgestartOp)} • {server ? `${server.naam} (${server.leden} leden)` : "geen server"}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Ping" value={typeof bot.ping === "number" && bot.ping >= 0 ? `${bot.ping} ms` : "—"} icon={Gauge} />
          <Stat label="RAM" value={`${bot.ramMb} MB`} icon={Cpu} />
          <Stat label="Scripts" value={`${modules.geladen}/${modules.totaal}`} icon={Server} />
          <Stat label="Versies" value={<span className="text-base">Node {bot.node} • d.js {bot.discordJs}</span>} icon={Bot} />
        </div>
        {(modules.fout > 0 || modules.uit > 0) && (
          <p className="mt-3 text-sm text-zinc-400">
            {modules.fout > 0 && <span className="text-rose-300">{modules.fout} script(s) met een fout. </span>}
            {modules.uit > 0 && <span>{modules.uit} script(s) uitgeschakeld.</span>} Zie het tabblad Scripts.
          </p>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Tickets" icon={Ticket}>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Open" value={tickets.open} icon={Ticket} />
            <Stat label="Reactietijd" value={tickets.reactietijdMs !== null ? formatDuration(tickets.reactietijdMs) : "—"} icon={Clock} />
            <Stat label="Vandaag gesloten" value={tickets.vandaagGesloten} icon={Users} />
            <Stat label="Totaal gesloten" value={tickets.totaalGesloten} icon={Users} />
          </div>
          {Object.keys(tickets.perAfdeling).length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-zinc-400">
              {Object.entries(tickets.perAfdeling).map(([afd, n]) => (
                <li key={afd} className="flex justify-between">
                  <span className="capitalize">{afd}</span> <span className="text-white">{n} open</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Diensten" icon={Server}>
          {diensten.length === 0 ? (
            <p className="text-sm text-zinc-400">Nog geen gegevens van de statuspage.</p>
          ) : (
            <ul className="space-y-2">
              {diensten.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", serviceStyle[d.status] ?? serviceStyle.onbekend)} /> {d.id}
                  </span>
                  <span className="text-zinc-400">{d.ms !== null ? `${d.ms} ms` : d.status}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Open bugs" value={`${bugs.open}/${bugs.totaal}`} icon={Bug} />
            <Stat label="Actieve projecten" value={`${projecten.actief}/${projecten.totaal}`} icon={FolderKanban} />
          </div>
        </Panel>
      </div>

      {invites && (
        <Panel title="Invites" icon={UserPlus}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Joins vandaag" value={invites.vandaag} icon={UserPlus} />
            <Stat label="Joins deze week" value={invites.week} icon={UserPlus} />
            <Stat label="Vertrokken" value={invites.vertrokken} icon={Users} />
            <Stat label="Nep-accounts" value={invites.nep} icon={Bug} />
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Top uitnodigers</p>
              {invites.top.length === 0 ? (
                <p className="text-sm text-zinc-400">Nog niemand.</p>
              ) : (
                <ol className="space-y-1.5 text-sm">
                  {invites.top.map((r, i) => (
                    <li key={r.id} className="flex justify-between gap-3">
                      <span className="truncate"><span className="text-zinc-500">{i + 1}.</span> {r.naam}</span>
                      <span className="shrink-0 text-white" title={`${r.echt} actief, ${r.weg} vertrokken, ${r.nep} nep, ${r.bonus} bonus`}>{r.totaal}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Waar komen leden vandaan</p>
              <ul className="space-y-1.5 text-sm">
                {Object.entries(invites.perBron).sort(([, a], [, b]) => b - a).map(([bron, n]) => (
                  <li key={bron} className="flex justify-between gap-3">
                    <span className="flex items-center gap-1.5 truncate">{bron === "Website" ? <Globe className="size-3.5 text-brand-300" /> : null}{bron}</span>
                    <span className="text-white">{n}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-zinc-500">Labels per link stel je in onder Instellingen → invites → LINK_LABELS.</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Laatste joins</p>
              <ul className="space-y-1.5 text-sm">
                {invites.recent.map((j) => (
                  <li key={`${j.id}-${j.t}`} className="flex justify-between gap-3">
                    <span className={cn("truncate", j.weg && "text-zinc-500 line-through")}>
                      {j.naam}
                      {j.nep && <span className="ml-1 text-xs text-amber-300">nep</span>}
                    </span>
                    <span className="shrink-0 truncate text-zinc-400">{j.bron ?? j.door ?? "onbekend"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      <Charts />
    </div>
  );
}
