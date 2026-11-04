import { Clock } from "lucide-react";
import type { LiveTickets } from "@/lib/live";
import { formatMinutes } from "@/lib/live";
import { cn } from "@/lib/utils";

const LEVELS: Record<string, { dot: string; bar: string; width: string }> = {
  Rustig: { dot: "bg-emerald-400", bar: "bg-emerald-400", width: "w-1/4" },
  Normaal: { dot: "bg-amber-400", bar: "bg-amber-400", width: "w-1/2" },
  Druk: { dot: "bg-orange-400", bar: "bg-orange-400", width: "w-3/4" },
  "Zeer druk": { dot: "bg-rose-400", bar: "bg-rose-400", width: "w-full" },
};

/** Live crowd level of the support team, as shown in the Discord status panel. */
export function CrowdCard({ tickets, className }: { tickets: LiveTickets; className?: string }) {
  const level = LEVELS[tickets.drukte.naam] ?? LEVELS.Normaal;
  return (
    <div className={cn("glass rounded-3xl p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Live drukte support</p>
        <span className={cn("flex items-center gap-1.5 text-xs", tickets.geopend ? "text-emerald-300" : "text-zinc-400")}>
          <span className={cn("size-1.5 rounded-full", tickets.geopend ? "animate-pulse bg-emerald-400" : "bg-zinc-500")} />
          {tickets.geopend ? "Nu geopend" : "Nu gesloten"}
        </span>
      </div>
      <p className="mt-3 flex items-center gap-2 font-display text-2xl text-white">
        <span className={cn("size-3 rounded-full", level.dot)} /> {tickets.drukte.naam}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <div className={cn("h-full rounded-full", level.bar, level.width)} />
      </div>
      <p className="mt-3 text-sm text-zinc-400">{tickets.drukte.tekst}</p>
      <p className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
        <Clock className="size-4 text-brand-300" />
        {tickets.geopend ? `Verwachte reactie ${tickets.drukte.verwacht}` : "We reageren zodra we weer open zijn"}
      </p>
      {tickets.reactietijdMs !== null && (
        <p className="mt-1 pl-6 text-xs text-zinc-500">Recente tickets: ± {formatMinutes(tickets.reactietijdMs)} tot eerste reactie</p>
      )}
    </div>
  );
}
