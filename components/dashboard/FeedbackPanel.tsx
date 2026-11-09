"use client";

import { CheckCircle2, MapPin, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { PinnedImage, type Pin } from "@/components/portal/DesignFeedback";
import { Button } from "@/components/ui/Button";
import { timeAgo, useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface FeedbackFile { bestandId: string; klantId: string; naam: string; open: number; totaal: number; laatste: number; pins: Pin[] }

/** Clients' pins on designs: see where they are, answer and mark as done. */
export function FeedbackPanel() {
  const { data, error, loading, reload } = useBotData<{ bestanden: FeedbackFile[] }>("beheer/feedback", 2 * 60_000);
  const [open, setOpen] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [reply, setReply] = useState<Record<string, string>>({});

  async function answer(file: FeedbackFile, pin: Pin, opgelost?: boolean) {
    await botApi("POST", "beheer/feedback/reageer", { bestand: file.bestandId, pin: pin.id, tekst: reply[pin.id] ?? "", ...(opgelost === undefined ? {} : { opgelost }) }).catch(() => null);
    setReply((r) => ({ ...r, [pin.id]: "" }));
    reload();
  }

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  const files = data?.bestanden ?? [];
  return (
    <Panel title="Feedback op ontwerpen" icon={MapPin}>
      {!files.length ? <p className="text-sm text-zinc-400">Nog geen feedback. Klanten plaatsen speldjes op afbeeldingen die je met /bestand voor ze klaarzet.</p> : (
        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f.bestandId} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <button type="button" onClick={() => setOpen(open === f.bestandId ? null : f.bestandId)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open === f.bestandId}>
                <span className="min-w-0"><b className="block truncate text-white">{f.naam}</b><span className="text-xs text-zinc-500">klant {f.klantId} • {timeAgo(f.laatste)}</span></span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", f.open ? "bg-brand-500/15 text-brand-200" : "bg-emerald-500/15 text-emerald-200")}>{f.open ? `${f.open} open` : "alles verwerkt"}</span>
              </button>
              {open === f.bestandId && (
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <PinnedImage src={`/api/bot-download?soort=bestand&id=${f.bestandId}&klant=${f.klantId}`} pins={f.pins} active={active} setActive={setActive} editable={false} />
                  <ol className="space-y-2 text-sm">
                    {f.pins.map((p, i) => (
                      <li key={p.id} onMouseEnter={() => setActive(p.id)} className={cn("rounded-xl border p-3", active === p.id ? "border-brand-500/50" : "border-white/10", p.opgelost && "opacity-60")}>
                        <p><b className="text-brand-300">#{i + 1}</b> {p.tekst} <span className="text-xs text-zinc-500">• {p.naam}, {timeAgo(p.t)}</span></p>
                        {p.antwoorden.map((a, j) => <p key={j} className="mt-1.5 rounded-lg bg-white/5 px-2 py-1 text-zinc-300"><b>{a.naam}:</b> {a.tekst}</p>)}
                        <div className="mt-2 flex gap-2">
                          <input value={reply[p.id] ?? ""} onChange={(e) => setReply((r) => ({ ...r, [p.id]: e.target.value }))} placeholder="Reageer..." maxLength={500} className={cn(inputClass, "py-1.5")} />
                          <Button size="sm" variant="secondary" disabled={!reply[p.id]?.trim()} onClick={() => answer(f, p)} aria-label="Versturen"><Send /></Button>
                          {p.opgelost
                            ? <Button size="sm" variant="ghost" onClick={() => answer(f, p, false)} aria-label="Heropenen"><RotateCcw /></Button>
                            : <Button size="sm" variant="secondary" onClick={() => answer(f, p, true)} title="Verwerkt"><CheckCircle2 /></Button>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
