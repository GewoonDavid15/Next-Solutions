"use client";

import { Ban, Clock, DoorOpen, Loader2, Unlock } from "lucide-react";
import { useState } from "react";
import { Notice, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const DURATIONS = [
  [10, "10 minuten"],
  [60, "1 uur"],
  [360, "6 uur"],
  [1440, "1 dag"],
  [10080, "1 week"],
] as const;

type Action = "timeout" | "untimeout" | "kick" | "ban";

/** Time-out, kick or ban one member with a reason. Shown in the member details. */
export function ModerateForm({ id, name, timedOut, onDone }: { id: string; name: string; timedOut: boolean; onDone: (msg: string) => void }) {
  const [action, setAction] = useState<Action | null>(null);
  const [minutes, setMinutes] = useState(60);
  const [reason, setReason] = useState("");
  const [deleteHours, setDeleteHours] = useState(0);
  const [dm, setDm] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(a: Action) {
    setBusy(true);
    setError("");
    try {
      await botApi("POST", "beheer/lid/moderatie", { id, actie: a, minuten: minutes, reden: reason, verwijderUren: deleteHours, dm });
      onDone({ timeout: `${name} heeft een time-out gekregen.`, untimeout: `Time-out van ${name} opgeheven.`, kick: `${name} is uit de server gezet.`, ban: `${name} is verbannen.` }[a]);
      setAction(null);
      setReason("");
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  const buttons: { a: Action; label: string; icon: typeof Clock; danger?: boolean }[] = [
    timedOut ? { a: "untimeout", label: "Time-out opheffen", icon: Unlock } : { a: "timeout", label: "Time-out", icon: Clock },
    { a: "kick", label: "Kick", icon: DoorOpen, danger: true },
    { a: "ban", label: "Ban", icon: Ban, danger: true },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ a, label, icon: Icon, danger }) => (
          <button
            key={a}
            type="button"
            onClick={() => (a === "untimeout" ? run(a) : setAction(action === a ? null : a))}
            disabled={busy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition",
              action === a ? "border-rose-400/50 bg-rose-500/15 text-white" : danger ? "border-rose-400/20 text-rose-200 hover:bg-rose-500/10" : "border-white/10 text-zinc-300 hover:bg-white/5",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      {action && action !== "untimeout" && (
        <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          {action === "timeout" && (
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Duur</span>
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={inputClass}>
                {DURATIONS.map(([m, l]) => <option key={m} value={m}>{l}</option>)}
              </select>
            </label>
          )}
          {action === "ban" && (
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Berichten verwijderen van de afgelopen</span>
              <select value={deleteHours} onChange={(e) => setDeleteHours(Number(e.target.value))} className={inputClass}>
                <option value={0}>Niets verwijderen</option>
                <option value={1}>1 uur</option>
                <option value={24}>24 uur</option>
                <option value={168}>7 dagen</option>
              </select>
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Reden</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={400} placeholder="Komt in de audit-log en de bot-logs" className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={dm} onChange={(e) => setDm(e.target.checked)} className="accent-[#C6F432]" /> Stuur {name} een DM met de reden
          </label>
          {error && <Notice>{error}</Notice>}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => run(action)} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Bevestigen
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAction(null)}>Annuleren</Button>
          </div>
        </div>
      )}
      {!action && error && <div className="mt-2"><Notice>{error}</Notice></div>}
    </div>
  );
}
