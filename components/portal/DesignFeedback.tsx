"use client";

import { CheckCircle2, Loader2, MapPin, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface Pin {
  id: string;
  x: number;
  y: number;
  tekst: string;
  naam: string;
  rol: "klant" | "team";
  t: number;
  opgelost: boolean;
  antwoorden: { naam: string; tekst: string; t: number }[];
}

const texts = {
  nl: {
    intro: "Tik of klik op de plek in het ontwerp waar je iets over wilt zeggen, en typ je opmerking.",
    placeholder: "Bijv. dit knopje mag groter", save: "Plaatsen", cancel: "Annuleren", solved: "Verwerkt", remove: "Verwijderen",
    none: "Nog geen opmerkingen. Klik op het ontwerp om er een te plaatsen.", failed: "Er ging iets mis.", team: "Team",
  },
  en: {
    intro: "Tap or click the spot in the design you want to comment on, and type your note.",
    placeholder: "E.g. this button could be bigger", save: "Place", cancel: "Cancel", solved: "Done", remove: "Remove",
    none: "No comments yet. Click on the design to add one.", failed: "Something went wrong.", team: "Team",
  },
};

/**
 * Image with numbered pins. Clients add pins (`editable`); the dashboard shows the same image read-only
 * and answers through `renderPinActions`.
 */
export function PinnedImage({ src, pins, onAdd, active, setActive, editable }: {
  src: string;
  pins: Pin[];
  onAdd?: (x: number, y: number) => void;
  active: string | null;
  setActive: (id: string | null) => void;
  editable: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      {/* eslint-disable-next-line @next/next/no-img-element -- private file behind a session, not suited for next/image */}
      <img
        src={src}
        alt=""
        className={cn("block h-auto w-full select-none", editable && "cursor-crosshair")}
        onClick={(e) => {
          if (!editable || !onAdd) return;
          const r = e.currentTarget.getBoundingClientRect();
          onAdd((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
        draggable={false}
      />
      {pins.map((p, i) => (
        <button
          key={p.id}
          type="button"
          onClick={() => setActive(active === p.id ? null : p.id)}
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          aria-label={`#${i + 1}: ${p.tekst}`}
          className={cn(
            "absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-xs font-bold shadow-lg transition",
            p.opgelost ? "border-emerald-200 bg-emerald-500 text-white" : "border-white bg-brand-500 text-ink",
            active === p.id && "scale-125 ring-4 ring-white/40",
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export function DesignFeedback({ fileId }: { fileId: string }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [pins, setPins] = useState<Pin[] | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/portaal/feedback?bestand=${fileId}`, { cache: "no-store" }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { pins?: Pin[]; fout?: string } | null;
    if (res?.ok && data?.pins) setPins(data.pins);
    else setError(data?.fout ?? tx.failed);
  }, [fileId, tx.failed]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!draft || text.trim().length < 2) return;
    setBusy(true);
    const res = await fetch("/api/portaal/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bestand: fileId, x: draft.x, y: draft.y, tekst: text.trim() }) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { pin?: Pin; fout?: string } | null;
    if (res?.ok && data?.pin) { setPins((p) => [...(p ?? []), data.pin!]); setDraft(null); setText(""); setActive(data.pin.id); setError(""); }
    else setError(data?.fout ?? tx.failed);
    setBusy(false);
  }

  async function remove(id: string) {
    const res = await fetch("/api/portaal/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actie: "verwijder", bestand: fileId, pin: id }) }).catch(() => null);
    if (res?.ok) setPins((p) => (p ?? []).filter((x) => x.id !== id));
    else setError(((await res?.json().catch(() => null)) as { fout?: string } | null)?.fout ?? tx.failed);
  }

  if (!pins && !error) return <p className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="size-4 animate-spin" /> …</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <p className="mb-3 text-sm text-zinc-400">{tx.intro}</p>
        <PinnedImage src={`/klantportaal/bestand/${fileId}`} pins={[...(pins ?? []), ...(draft ? [{ id: "nieuw", x: draft.x, y: draft.y, tekst: "", naam: "", rol: "klant" as const, t: 0, opgelost: false, antwoorden: [] }] : [])]} onAdd={(x, y) => { setDraft({ x, y }); setActive("nieuw"); }} active={active} setActive={setActive} editable />
      </div>
      <div className="space-y-3">
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        {draft && (
          <div className="glass space-y-2 rounded-2xl p-4">
            <p className="flex items-center gap-2 text-sm font-medium"><MapPin className="size-4 text-brand-300" /> #{(pins?.length ?? 0) + 1}</p>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} placeholder={tx.placeholder} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-brand-500/60 focus:outline-none" />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={busy || text.trim().length < 2}>{busy ? <Loader2 className="animate-spin" /> : <MapPin />} {tx.save}</Button>
              <Button size="sm" variant="ghost" onClick={() => { setDraft(null); setText(""); }}><X /> {tx.cancel}</Button>
            </div>
          </div>
        )}
        {!pins?.length && !draft && <p className="text-sm text-zinc-500">{tx.none}</p>}
        <ol className="space-y-2">
          {(pins ?? []).map((p, i) => (
            <li key={p.id} className={cn("glass rounded-2xl p-3 text-sm", active === p.id && "border-brand-500/50")} onMouseEnter={() => setActive(p.id)}>
              <div className="flex items-start justify-between gap-2">
                <p><b className="text-brand-300">#{i + 1}</b> {p.tekst}</p>
                {p.opgelost ? <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="size-3.5" /> {tx.solved}</span>
                  : !p.antwoorden.length && <button type="button" onClick={() => remove(p.id)} aria-label={tx.remove} className="text-zinc-500 hover:text-rose-300"><Trash2 className="size-4" /></button>}
              </div>
              {p.antwoorden.map((a, j) => <p key={j} className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-300"><b className="text-white">{a.naam || tx.team}:</b> {a.tekst}</p>)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
