"use client";

import { Download, ExternalLink, Handshake, KanbanSquare, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { dateTime, timeAgo, useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type Fase = "nieuw" | "gesprek" | "offerte" | "betaald" | "afgerond" | "afgewezen";

interface Lead {
  id: string;
  t: number;
  naam: string;
  email: string;
  dienst: string;
  afdeling: string;
  budget: string;
  planning: string;
  omschrijving: string;
  discordId: string | null;
  discord: string;
  indicatie: string | null;
  taal: "nl" | "en";
  fase: Fase;
  faseOp: number;
  notitie: string;
  ref: string | null;
  ticketLink: string | null;
}

interface Groei {
  downloads: { id: string; t: number; naam: string; email: string; checklist: string; titel: string; taal: string }[];
  perChecklist: Record<string, number>;
  doorverwijzers: { userId: string; code: string; aanvragen: number; klanten: number; laatste: number | null }[];
  beloning: string | null;
}

const FASES: { id: Fase; label: string; kleur: string }[] = [
  { id: "nieuw", label: "Nieuw", kleur: "bg-sky-400" },
  { id: "gesprek", label: "In gesprek", kleur: "bg-violet-400" },
  { id: "offerte", label: "Offerte", kleur: "bg-amber-400" },
  { id: "betaald", label: "Betaald", kleur: "bg-brand-400" },
  { id: "afgerond", label: "Afgerond", kleur: "bg-emerald-400" },
  { id: "afgewezen", label: "Afgewezen", kleur: "bg-zinc-500" },
];

/** Sales pipeline: every website request as a card that moves from new to done. */
export function PipelineTab() {
  const { data, error, loading, setData } = useBotData<{ leads: Lead[] }>("beheer/leads", 60_000);
  const groei = useBotData<Groei>("beheer/groei", 5 * 60_000);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Lead | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<Fase | null>(null);
  const [fout, setFout] = useState("");
  const [toonAfgewezen, setToonAfgewezen] = useState(false);

  const leads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.leads ?? []).filter((l) => !q || `${l.naam} ${l.email} ${l.dienst} ${l.omschrijving} ${l.notitie}`.toLowerCase().includes(q));
  }, [data, query]);

  async function move(id: string, fase: Fase) {
    const before = data;
    setData((d) => (d ? { leads: d.leads.map((l) => (l.id === id ? { ...l, fase, faseOp: Date.now() } : l)) } : d));
    setOpen((o) => (o?.id === id ? { ...o, fase } : o));
    try {
      await botApi("POST", "beheer/lead/fase", { id, fase });
      setFout("");
    } catch (err) {
      setData(before);
      setFout((err as Error).message);
    }
  }

  async function saveNote(id: string, notitie: string) {
    await botApi("POST", "beheer/lead/fase", { id, notitie });
    setData((d) => (d ? { leads: d.leads.map((l) => (l.id === id ? { ...l, notitie } : l)) } : d));
    setOpen((o) => (o?.id === id ? { ...o, notitie } : o));
  }

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;

  const fases = FASES.filter((f) => toonAfgewezen || f.id !== "afgewezen");
  const open30 = (data?.leads ?? []).filter((l) => l.t > Date.now() - 30 * 86_400_000);
  const conversie = open30.length ? Math.round((open30.filter((l) => l.fase === "betaald" || l.fase === "afgerond").length / open30.length) * 100) : null;

  return (
    <div className="space-y-6">
      <Panel
        title="Pijplijn"
        icon={KanbanSquare}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Zoeken</span>
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-zinc-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op naam, dienst..." className={cn(inputClass, "w-56 pl-8")} />
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={toonAfgewezen} onChange={(e) => setToonAfgewezen(e.target.checked)} className="accent-brand-500" /> Afgewezen tonen
            </label>
          </div>
        }
      >
        <p className="mb-4 text-sm text-zinc-400">
          Sleep een kaart naar een andere kolom, of kies de fase op de kaart. Een offerte of betaling in Discord schuift de aanvraag vanzelf door.
          {conversie !== null && <> Laatste 30 dagen: <b className="text-white">{open30.length}</b> aanvragen, <b className="text-white">{conversie}%</b> werd klant.</>}
        </p>
        {fout && <div className="mb-4"><Notice>{fout}</Notice></div>}
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {fases.map((f) => {
            const items = leads.filter((l) => l.fase === f.id);
            return (
              <section
                key={f.id}
                aria-label={f.label}
                onDragOver={(e) => { e.preventDefault(); setOver(f.id); }}
                onDragLeave={() => setOver((o) => (o === f.id ? null : o))}
                onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, f.id); setDragging(null); }}
                className={cn("flex w-64 shrink-0 snap-start flex-col rounded-2xl border bg-black/20 p-2 transition", over === f.id ? "border-brand-400/60 bg-brand-500/5" : "border-white/10")}
              >
                <h3 className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
                  <span className="flex items-center gap-2"><span className={cn("size-2 rounded-full", f.kleur)} /> {f.label}</span>
                  <span className="text-xs text-zinc-500">{items.length}</span>
                </h3>
                <div className="mt-1 flex min-h-24 flex-col gap-2">
                  {items.map((l) => (
                    <article
                      key={l.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", l.id); setDragging(l.id); }}
                      onDragEnd={() => setDragging(null)}
                      className={cn("cursor-grab rounded-xl border border-white/10 bg-[#141821] p-3 text-sm active:cursor-grabbing", dragging === l.id && "opacity-40")}
                    >
                      <button type="button" onClick={() => setOpen(l)} className="block w-full text-left">
                        <p className="font-semibold text-white">{l.naam}</p>
                        <p className="truncate text-xs text-zinc-400">{l.dienst}</p>
                        <p className="mt-1 text-[11px] text-zinc-500">{timeAgo(l.t)}{l.ref && " • via doorverwijzing"}{l.notitie && " • 📝"}</p>
                      </button>
                      <label className="mt-2 block">
                        <span className="sr-only">Fase van {l.naam}</span>
                        <select value={l.fase} onChange={(e) => move(l.id, e.target.value as Fase)} className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-zinc-300">
                          {FASES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                        </select>
                      </label>
                    </article>
                  ))}
                  {!items.length && <p className="px-2 py-4 text-center text-xs text-zinc-600">Leeg</p>}
                </div>
              </section>
            );
          })}
        </div>
      </Panel>

      {open && <LeadDetail key={open.id} lead={open} onClose={() => setOpen(null)} onSave={saveNote} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Checklist-downloads" icon={Download}>
          {groei.error ? <Notice>{groei.error}</Notice> : !groei.data ? <Loading /> : (
            <>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                {Object.entries(groei.data.perChecklist).map(([k, n]) => <span key={k} className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">{k}: <b className="text-white">{n}</b></span>)}
              </div>
              {!groei.data.downloads.length ? <p className="text-sm text-zinc-500">Nog geen downloads.</p> : (
                <ul className="max-h-80 space-y-1.5 overflow-y-auto text-sm">
                  {groei.data.downloads.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                      <span className="min-w-0"><b className="text-white">{d.naam}</b> <a href={`mailto:${d.email}`} className="text-brand-300 hover:underline">{d.email}</a><span className="block truncate text-xs text-zinc-500">{d.titel} • {dateTime(d.t)}</span></span>
                      <button type="button" aria-label={`Download van ${d.naam} verwijderen`} title="Verwijderen" onClick={async () => { if (!confirm(`Gegevens van ${d.naam} verwijderen?`)) return; await botApi("POST", "beheer/download/verwijder", { id: d.id }).catch(() => null); groei.reload(); }} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-rose-300"><Trash2 className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Panel>
        <Panel title="Doorverwijzers" icon={Handshake}>
          {groei.error ? <Notice>{groei.error}</Notice> : !groei.data ? <Loading /> : (
            <>
              <p className="mb-3 text-xs text-zinc-500">Beloning per nieuwe klant: {groei.data.beloning ?? "nog niet ingesteld (Instellingen → groei → BELONING). Klanten zien nu: 'spreken we samen af'."}</p>
              {!groei.data.doorverwijzers.length ? <p className="text-sm text-zinc-500">Nog niemand heeft iemand doorverwezen.</p> : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-zinc-500"><tr><th className="py-1 font-medium">Lid</th><th className="font-medium">Aanvragen</th><th className="font-medium">Klanten</th><th className="font-medium">Laatste</th></tr></thead>
                  <tbody>
                    {groei.data.doorverwijzers.map((d) => (
                      <tr key={d.userId} className="border-t border-white/5">
                        <td className="py-1.5 font-mono text-xs text-zinc-300">{d.userId}</td>
                        <td>{d.aanvragen}</td>
                        <td className="font-semibold text-brand-300">{d.klanten}</td>
                        <td className="text-xs text-zinc-500">{d.laatste ? timeAgo(d.laatste) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

function LeadDetail({ lead: l, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (id: string, notitie: string) => Promise<void> }) {
  const [note, setNote] = useState(l.notitie);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  return (
    <Panel
      title={l.naam}
      actions={<button type="button" onClick={onClose} aria-label="Sluiten" className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"><X className="size-5" /></button>}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-zinc-500">Dienst</dt><dd>{l.dienst} <span className="text-zinc-500">({l.afdeling})</span></dd>
          <dt className="text-zinc-500">E-mail</dt><dd><a href={`mailto:${l.email}`} className="text-brand-300 hover:underline">{l.email}</a></dd>
          <dt className="text-zinc-500">Discord</dt><dd>{l.discordId ? <span className="font-mono text-xs">{l.discordId} (ingelogd)</span> : l.discord || "-"}</dd>
          <dt className="text-zinc-500">Budget</dt><dd>{l.budget}</dd>
          <dt className="text-zinc-500">Planning</dt><dd>{l.planning}</dd>
          {l.indicatie && <><dt className="text-zinc-500">Calculator</dt><dd>{l.indicatie}</dd></>}
          <dt className="text-zinc-500">Ontvangen</dt><dd>{dateTime(l.t)}</dd>
          <dt className="text-zinc-500">Taal</dt><dd>{l.taal === "en" ? "Engels" : "Nederlands"}</dd>
          {l.ref && <><dt className="text-zinc-500">Via</dt><dd>doorverwijzing ({l.ref})</dd></>}
          {l.ticketLink && <><dt className="text-zinc-500">Ticket</dt><dd><a href={l.ticketLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-300 hover:underline">Openen in Discord <ExternalLink className="size-3" /></a></dd></>}
        </dl>
        <div>
          <p className="whitespace-pre-line rounded-xl bg-black/30 p-3 text-sm text-zinc-200">{l.omschrijving}</p>
          <label className="mt-4 block text-sm font-medium text-zinc-300" htmlFor={`note-${l.id}`}>Eigen notitie</label>
          <textarea id={`note-${l.id}`} value={note} onChange={(e) => { setNote(e.target.value); setState("idle"); }} rows={3} maxLength={1000} className={cn(inputClass, "mt-1")} placeholder="Bijv. belafspraak donderdag, wil eerst een voorbeeld zien..." />
          <div className="mt-2 flex items-center gap-3">
            <Button size="sm" disabled={state === "busy" || note === l.notitie} onClick={async () => { setState("busy"); try { await onSave(l.id, note); setState("saved"); } catch { setState("error"); } }}>Notitie opslaan</Button>
            {state === "saved" && <span className="text-xs text-emerald-300">Opgeslagen</span>}
            {state === "error" && <span className="text-xs text-rose-300">Opslaan mislukt</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}
