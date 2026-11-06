"use client";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import type { Appointment } from "@/lib/profile";
import { cn } from "@/lib/utils";

const when = (t: number) => new Date(t).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function AppointmentsTab() {
  const { data, error, loading, reload } = useBotData<{ afspraken: Appointment[]; slots: number }>("beheer/afspraken", 60_000);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const upcoming = (data?.afspraken ?? []).filter((a) => a.status === "gepland");
  const past = (data?.afspraken ?? []).filter((a) => a.status !== "gepland").reverse().slice(0, 30);

  async function cancel(a: Appointment) {
    if (!confirm(`Afspraak met ${a.naam} annuleren? De klant krijgt een DM.`)) return;
    try {
      await botApi("POST", "beheer/afspraak/annuleer", { id: a.id });
      setMessage({ kind: "success", text: "Afspraak geannuleerd." });
      reload();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
  }

  if (loading && !data) return <Loading />;
  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[["Gepland", upcoming.length], ["Vrije momenten", data?.slots ?? 0], ["Afgelopen 90 dagen", past.length]].map(([l, n]) => (
          <div key={l as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>
      <Panel title="Komende afspraken" icon={CalendarDays}>
        {!upcoming.length ? <p className="text-sm text-zinc-500">Geen geplande afspraken. Je beschikbaarheid stel je in bij Instellingen → afspraken.</p> : (
          <ul className="divide-y divide-white/5">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-40 shrink-0 text-sm font-medium text-brand-200">{when(a.start)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-white">{a.naam} • {a.onderwerp}</span>
                  {a.notitie && <span className="block truncate text-xs text-zinc-500">{a.notitie}</span>}
                </span>
                <Button size="sm" variant="ghost" onClick={() => cancel(a)}><X /> Annuleren</Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {past.length > 0 && (
        <Panel title="Eerder">
          <ul className="space-y-1 text-sm">
            {past.map((a) => (
              <li key={a.id} className={cn("flex gap-3", a.status === "geannuleerd" && "text-zinc-500 line-through")}>
                <span className="w-40 shrink-0">{when(a.start)}</span><span>{a.naam} • {a.onderwerp}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
