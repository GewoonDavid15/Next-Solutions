"use client";

import { FileStack, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";

export interface OfferTemplate { id: string; naam: string; titel: string; prijs: string; onderdelen: string[]; levertijd: string | null; opmerking: string | null }
const empty = { id: "", naam: "", titel: "", prijs: "", onderdelen: "", levertijd: "", opmerking: "" };

/** Fixed quotes per service, placed in a ticket with one tap from the app. */
export function OfferTemplatesPanel() {
  const { data, error, loading, reload } = useBotData<{ sjablonen: OfferTemplate[] }>("beheer/offerte/sjablonen");
  const [form, setForm] = useState(empty);
  const [fout, setFout] = useState("");
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setFout("");
    try {
      await botApi("POST", "beheer/offerte/sjabloon", { ...form, id: form.id || undefined, onderdelen: form.onderdelen.split("\n") });
      setForm(empty);
      reload();
    } catch (e) { setFout((e as Error).message); }
  }

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  return (
    <Panel title="Offerte-sjablonen" icon={FileStack}>
      <p className="mb-3 text-sm text-zinc-400">Vaste offertes per dienst. In de app kies je er een bij “Offerte maken” in een ticket; daarna pas je zo nodig nog iets aan.</p>
      {data?.sjablonen.length ? (
        <ul className="mb-4 space-y-2 text-sm">
          {data.sjablonen.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <span className="min-w-0"><b className="text-white">{s.naam}</b> <span className="text-zinc-400">• {s.titel} • {s.prijs} • {s.onderdelen.length} onderdelen</span></span>
              <span className="flex shrink-0 gap-1">
                <button type="button" aria-label="Bewerken" onClick={() => setForm({ id: s.id, naam: s.naam, titel: s.titel, prijs: s.prijs, onderdelen: s.onderdelen.join("\n"), levertijd: s.levertijd ?? "", opmerking: s.opmerking ?? "" })} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"><Pencil className="size-4" /></button>
                <button type="button" aria-label="Verwijderen" onClick={async () => { if (confirm(`Sjabloon "${s.naam}" verwijderen?`)) { await botApi("POST", "beheer/offerte/sjabloon/verwijder", { id: s.id }).catch(() => null); reload(); } }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-rose-300"><Trash2 className="size-4" /></button>
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="mb-4 text-sm text-zinc-500">Nog geen sjablonen.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={form.naam} onChange={(e) => set("naam", e.target.value)} placeholder="Naam (bijv. Discord-bot basis)" className={inputClass} maxLength={60} />
        <input value={form.titel} onChange={(e) => set("titel", e.target.value)} placeholder="Titel op de offerte" className={inputClass} maxLength={100} />
        <input value={form.prijs} onChange={(e) => set("prijs", e.target.value)} placeholder="Prijs (bijv. € 250)" className={inputClass} maxLength={60} />
        <input value={form.levertijd} onChange={(e) => set("levertijd", e.target.value)} placeholder="Levertijd (optioneel)" className={inputClass} maxLength={60} />
        <textarea value={form.onderdelen} onChange={(e) => set("onderdelen", e.target.value)} placeholder="Onderdelen, één per regel" rows={3} className={`${inputClass} sm:col-span-2`} />
        <input value={form.opmerking} onChange={(e) => set("opmerking", e.target.value)} placeholder="Opmerking (optioneel)" className={`${inputClass} sm:col-span-2`} maxLength={500} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={!form.naam.trim() || !form.titel.trim() || !form.prijs.trim() || !form.onderdelen.trim()}>{form.id ? "Wijzigingen opslaan" : "Sjabloon toevoegen"}</Button>
        {form.id && <Button size="sm" variant="ghost" onClick={() => setForm(empty)}>Annuleren</Button>}
        {fout && <span className="text-xs text-rose-300">{fout}</span>}
      </div>
    </Panel>
  );
}
