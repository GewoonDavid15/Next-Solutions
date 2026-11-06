"use client";

import { Gift, PartyPopper, RotateCcw, ShieldCheck, Square, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart } from "@/components/dashboard/BarChart";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime, type AdminGiveaway, type ManagedRole, type VerificationStats } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const DURATIONS = [
  ["1u", "1 uur"],
  ["1d", "1 dag"],
  ["3d", "3 dagen"],
  ["1w", "1 week"],
  ["2w", "2 weken"],
] as const;

function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 86_400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" }));
}

function GiveawayForm({ roles, onStarted }: { roles: ManagedRole[]; onStarted: (msg: string) => void }) {
  const [form, setForm] = useState({ prijs: "", omschrijving: "", duur: "1w", aantal: 1, rolId: "", minInvites: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { id } = await botApi<{ id: string }>("POST", "beheer/giveaway/start", { ...form, rolId: form.rolId || null });
      onStarted(`Giveaway ${id} is gestart in Discord.`);
      setForm({ prijs: "", omschrijving: "", duur: "1w", aantal: 1, rolId: "", minInvites: 0 });
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={start} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-zinc-400">Prijs</span>
        <input required maxLength={100} value={form.prijs} onChange={(e) => set("prijs", e.target.value)} placeholder="bijv. Gratis Discord-bot (basis)" className={inputClass} />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block text-zinc-400">Omschrijving (optioneel)</span>
        <textarea maxLength={300} rows={2} value={form.omschrijving} onChange={(e) => set("omschrijving", e.target.value)} className={inputClass} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-zinc-400">Duur</span>
        <select value={form.duur} onChange={(e) => set("duur", e.target.value)} className={inputClass}>
          {DURATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-zinc-400">Aantal winnaars</span>
        <input type="number" min={1} max={20} value={form.aantal} onChange={(e) => set("aantal", Number(e.target.value))} className={inputClass} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-zinc-400">Alleen voor rol (optioneel)</span>
        <select value={form.rolId} onChange={(e) => set("rolId", e.target.value)} className={inputClass}>
          <option value="">Iedereen</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.naam}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-zinc-400">Minimaal aantal invites</span>
        <input type="number" min={0} max={1000} value={form.minInvites} onChange={(e) => set("minInvites", Number(e.target.value))} className={inputClass} />
      </label>
      {error && <div className="sm:col-span-2"><Notice>{error}</Notice></div>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy || !form.prijs.trim()}>
          <PartyPopper /> Giveaway starten
        </Button>
      </div>
    </form>
  );
}

export function CommunityTab() {
  const giveaways = useBotData<{ giveaways: AdminGiveaway[] }>("beheer/giveaways", 20_000);
  const verification = useBotData<VerificationStats>("beheer/verificatie", 60_000);
  const roles = useBotData<{ rollen: ManagedRole[] }>("beheer/rollen");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const days = useMemo(() => lastDays(30), []);
  const chart = days.map((dag) => ({
    dag,
    geslaagd: verification.data?.perDag.geslaagd[dag] ?? 0,
    mislukt: verification.data?.perDag.mislukt[dag] ?? 0,
  }));
  const roleName = (id: string | null) => (id ? roles.data?.rollen.find((r) => r.id === id)?.naam ?? "rol" : null);

  async function act(id: string, action: "einde" | "reroll") {
    setBusy(id);
    setMessage(null);
    try {
      await botApi("POST", `beheer/giveaway/${action}`, { id });
      setMessage({ kind: "success", text: action === "einde" ? "Giveaway beëindigd en winnaars getrokken." : "Nieuwe winnaar getrokken." });
      giveaways.reload();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setBusy(null);
  }

  const list = giveaways.data?.giveaways ?? [];
  const running = list.filter((g) => g.status === "loopt");
  const v = verification.data;
  const total30 = chart.reduce((s, d) => s + d.geslaagd, 0);
  const failed30 = chart.reduce((s, d) => s + d.mislukt, 0);

  return (
    <div className="space-y-6">
      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nieuwe giveaway" icon={Gift}>
          <GiveawayForm roles={(roles.data?.rollen ?? []).filter((r) => !r.naam.startsWith("─"))} onStarted={(text) => { setMessage({ kind: "success", text }); giveaways.reload(); }} />
        </Panel>

        <Panel title="Verificatie" icon={ShieldCheck} actions={v && <span className={cn("rounded-full border px-2 py-0.5 text-xs", v.actief ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-zinc-400")}>{v.actief ? "aan" : "uit"}</span>}>
          {verification.error && <Notice>{verification.error}</Notice>}
          {!v && !verification.error && <Loading />}
          {v && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Geverifieerd", v.geverifieerd],
                  ["Nog niet", v.nietGeverifieerd],
                  ["Gelukt (30d)", total30],
                  ["Mislukte pogingen", failed30],
                ].map(([l, n]) => (
                  <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">{l}</p>
                    <p className="mt-1 text-xl font-semibold">{n}</p>
                  </div>
                ))}
              </div>
              <BarChart rows={chart} series={[{ key: "geslaagd", label: "Gelukt", color: "#C6F432" }, { key: "mislukt", label: "Mislukt", color: "#FF6B6B" }]} height={120} />
              <p className="text-xs text-zinc-500">{v.afgeschermd} categorie(ën) alleen zichtbaar na verificatie. Aan- of uitzetten kan bij Instellingen → verificatie.</p>
            </div>
          )}
        </Panel>
      </div>

      <Panel title={`Giveaways${running.length ? ` • ${running.length} lopend` : ""}`} icon={Trophy}>
        {giveaways.error && <Notice>{giveaways.error}</Notice>}
        {!giveaways.data && !giveaways.error && <Loading />}
        {giveaways.data && !list.length && <p className="text-sm text-zinc-500">Nog geen giveaways. Start er hierboven een.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((g) => (
            <div key={g.id} className={cn("rounded-2xl border p-4", g.status === "loopt" ? "border-brand-500/30 bg-brand-600/[0.06]" : "border-white/10 bg-white/[0.02]")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{g.prijs}</p>
                  <p className="text-xs text-zinc-500">
                    <code>{g.id}</code> • {g.deelnemers} deelnemer(s) • {g.aantal} winnaar(s)
                    {g.rolId && ` • alleen ${roleName(g.rolId)}`}
                    {g.minInvites > 0 && ` • ${g.minInvites}+ invites`}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs", g.status === "loopt" ? "border-emerald-400/30 text-emerald-200" : "border-white/10 text-zinc-400")}>
                  {g.status === "loopt" ? `eindigt ${timeAgo(g.eindigt)}` : "afgelopen"}
                </span>
              </div>
              {g.status === "afgelopen" && (
                <p className="mt-2 text-sm text-zinc-300">🏆 {g.winnaars.length ? `${g.winnaars.length} winnaar(s) getrokken` : "geen geldige deelnemers"} • {dateTime(g.eindigt)}</p>
              )}
              <div className="mt-3 flex gap-2">
                {g.status === "loopt" ? (
                  <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => confirm(`"${g.prijs}" nu beëindigen?`) && act(g.id, "einde")}>
                    <Square /> Nu beëindigen
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled={busy !== null || !g.deelnemers} onClick={() => act(g.id, "reroll")}>
                    <RotateCcw /> Nieuwe winnaar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
