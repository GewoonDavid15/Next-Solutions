"use client";

import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { timeAgo, useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

/** Private note about a client (never visible to the client), shown with every ticket. */
export function ClientNote({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const { data } = useBotData<{ tekst: string; bijgewerkt: number | null; door: string | null }>(`beheer/klant/notitie?id=${userId}`);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setText(data?.tekst ?? ""); }, [data]);

  return (
    <div className={cn("rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] text-sm", compact ? "p-2.5" : "p-3")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-2 text-left" aria-expanded={open}>
        <StickyNote className="mt-0.5 size-4 shrink-0 text-amber-300" />
        <span className="min-w-0 flex-1 text-amber-100">{data?.tekst ? <span className="whitespace-pre-line">{open ? "Klantnotitie (alleen voor het team)" : data.tekst}</span> : <span className="text-amber-200/70">Notitie over deze klant toevoegen (alleen voor het team)</span>}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <textarea value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} rows={3} maxLength={3000} className={inputClass} placeholder="Bijv. wil alles in het Engels, betaalt altijd snel..." />
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={async () => { await botApi("POST", "beheer/klant/notitie", { id: userId, tekst: text }).catch(() => null); setSaved(true); }}>Opslaan</Button>
            {saved && <span className="text-xs text-emerald-300">Opgeslagen</span>}
            {data?.bijgewerkt && <span className="text-xs text-zinc-500">bijgewerkt {timeAgo(data.bijgewerkt)}{data.door ? ` door ${data.door}` : ""}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
