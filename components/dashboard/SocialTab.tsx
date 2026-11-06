"use client";

import { BarChart3, CalendarDays, CreditCard, Download, ExternalLink, FileUp, Loader2, Megaphone, Pencil, Plus, Save, Search, Send, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, type MemberSummary } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { PLATFORMS, STATUS_LABEL, TYPE_LABEL, type PostStatus, type SocialPost, type SocialReport, type SocialUpload, type Subscription } from "@/lib/social";
import { cn } from "@/lib/utils";

interface Overview { klanten: { id: string; naam: string; teKeuren: number; aanpassing: number; nieuweUploads: number; abonnement: { pakket: string; status: string; volgendeBetaling: number; prijs: string } | null }[] }
interface ClientData { notities: { tekst: string; bijgewerkt: number | null }; klant: { id: string; naam: string }; posts: SocialPost[]; rapporten: SocialReport[]; uploads: SocialUpload[]; abonnement: Subscription | null; types: string[]; statussen: PostStatus[] }

const toLocalInput = (t: number) => { const d = new Date(t); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const when = (t: number) => new Date(t).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function AddClient({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<MemberSummary[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    const t = setTimeout(() => botApi<{ leden: MemberSummary[] }>("GET", `beheer/leden?q=${encodeURIComponent(q)}`).then((r) => setRes(r.leden.filter((m) => !m.bot).slice(0, 8))).catch(() => setRes([])), 300);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Klant toevoegen: zoek lid" className={cn(inputClass, "pl-9")} />
      </div>
      {res.length > 0 && (
        <ul className="mt-1 rounded-2xl border border-white/10 bg-black/40 p-1">
          {res.map((m) => <li key={m.id}><button type="button" onClick={() => { onPick(m.id); setQ(""); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5"><UserPlus className="size-4 text-brand-300" /> {m.naam} <span className="text-xs text-zinc-500">@{m.gebruikersnaam}</span></button></li>)}
        </ul>
      )}
    </div>
  );
}

function PostEditor({ klant, post, types, statussen, onSaved, onCancel }: { klant: string; post: SocialPost | null; types: string[]; statussen: PostStatus[]; onSaved: () => void; onCancel: () => void }) {
  const [f, setF] = useState({
    platform: post?.platform ?? "Instagram", type: post?.type ?? "post", datum: toLocalInput(post?.datum ?? Date.now() + 2 * 86_400_000),
    titel: post?.titel ?? "", caption: post?.caption ?? "", media: (post?.media ?? []).join("\n"), status: post?.status ?? ("ter-goedkeuring" as PostStatus),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true); setError("");
    try {
      await botApi("POST", "beheer/social/post", { ...f, id: post?.id, klant, datum: new Date(f.datum).getTime() });
      onSaved();
    } catch (err) { setError((err as Error).message); }
    setBusy(false);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-brand-500/30 bg-brand-600/[0.05] p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <select value={f.platform} onChange={(e) => set("platform", e.target.value)} className={inputClass}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
        <select value={f.type} onChange={(e) => set("type", e.target.value)} className={inputClass}>{types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]?.nl ?? t}</option>)}</select>
        <input type="datetime-local" value={f.datum} onChange={(e) => set("datum", e.target.value)} className={inputClass} />
        <select value={f.status} onChange={(e) => set("status", e.target.value as PostStatus)} className={inputClass}>{statussen.map((s) => <option key={s} value={s}>{STATUS_LABEL[s].nl}</option>)}</select>
      </div>
      <input value={f.titel} onChange={(e) => set("titel", e.target.value)} maxLength={120} placeholder="Titel, bijv. Reel: achter de schermen" className={inputClass} />
      <textarea value={f.caption} onChange={(e) => set("caption", e.target.value)} rows={4} maxLength={2200} placeholder="Caption / tekst bij de post" className={inputClass} />
      <textarea value={f.media} onChange={(e) => set("media", e.target.value)} rows={2} placeholder="Links naar beeld of video (één per regel, https://)" className={inputClass} />
      <p className="text-xs text-zinc-500">Zet de status op <b>Ter goedkeuring</b> om de klant een melding te sturen.</p>
      {error && <Notice>{error}</Notice>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={busy || !f.titel.trim()}>{busy ? <Loader2 className="animate-spin" /> : <Save />} Opslaan</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Annuleren</Button>
      </div>
    </div>
  );
}

function ReportEditor({ klant, reports, onSaved }: { klant: string; reports: SocialReport[]; onSaved: (msg: string) => void }) {
  const lastMonth = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();
  const [maand, setMaand] = useState(lastMonth);
  const existing = reports.find((r) => r.maand === maand);
  const [rows, setRows] = useState<Record<string, Record<string, string>>>({});
  const [hl, setHl] = useState("");
  const [advies, setAdvies] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const FIELDS = [["volgers", "Volgers"], ["bereik", "Bereik"], ["weergaven", "Weergaven"], ["interacties", "Interacties"], ["posts", "Posts"]] as const;

  useEffect(() => {
    const r = reports.find((x) => x.maand === maand);
    setRows(Object.fromEntries((r?.platformen ?? []).map((p) => [p.platform, Object.fromEntries(FIELDS.map(([k]) => [k, p[k] === null ? "" : String(p[k])]))])));
    setHl(r?.hoogtepunten ?? "");
    setAdvies(r?.advies ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maand, reports]);

  async function save(publiceer: boolean) {
    setBusy(true); setError("");
    try {
      await botApi("POST", "beheer/social/rapport", { klant, maand, publiceer, hoogtepunten: hl, advies, platformen: Object.entries(rows).map(([platform, v]) => ({ platform, ...v })) });
      onSaved(publiceer ? "Rapport gepubliceerd. De klant krijgt een melding en de PDF als DM." : "Rapport opgeslagen als concept.");
    } catch (err) { setError((err as Error).message); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input type="month" value={maand} onChange={(e) => setMaand(e.target.value)} className={cn(inputClass, "w-auto")} />
        {existing && <span className={cn("rounded-full border px-2 py-0.5 text-xs", existing.gepubliceerd ? "border-emerald-400/30 text-emerald-200" : "border-white/10 text-zinc-400")}>{existing.gepubliceerd ? "gepubliceerd" : "concept"}</span>}
        {existing?.gepubliceerd && <a href={`/api/bot-download?soort=rapport&id=${existing.id}`} className="inline-flex items-center gap-1 text-sm text-brand-300"><Download className="size-4" /> PDF</a>}
      </div>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button key={p} type="button" onClick={() => setRows((r) => { const n = { ...r }; if (n[p]) delete n[p]; else n[p] = {}; return n; })}
            className={cn("rounded-xl border px-3 py-1 text-sm", rows[p] ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400")}>{p}</button>
        ))}
      </div>
      {Object.keys(rows).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-xs text-zinc-500"><tr><th className="pb-2 text-left font-medium">Platform</th>{FIELDS.map(([, l]) => <th key={l} className="pb-2 text-left font-medium">{l}</th>)}</tr></thead>
            <tbody>
              {Object.entries(rows).map(([p, v]) => (
                <tr key={p}>
                  <td className="py-1 pr-2 font-medium">{p}</td>
                  {FIELDS.map(([k]) => <td key={k} className="py-1 pr-2"><input inputMode="numeric" value={v[k] ?? ""} onChange={(e) => setRows((r) => ({ ...r, [p]: { ...r[p], [k]: e.target.value.replace(/[^\d-]/g, "") } }))} className={cn(inputClass, "py-1.5")} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-zinc-500">Groei wordt automatisch berekend t.o.v. het rapport van de vorige maand.</p>
        </div>
      )}
      <textarea value={hl} onChange={(e) => setHl(e.target.value)} rows={3} maxLength={1500} placeholder="Hoogtepunten van deze maand" className={inputClass} />
      <textarea value={advies} onChange={(e) => setAdvies(e.target.value)} rows={3} maxLength={1500} placeholder="Advies voor volgende maand" className={inputClass} />
      {error && <Notice>{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => save(false)} disabled={busy}><Save /> Opslaan als concept</Button>
        <Button size="sm" onClick={() => save(true)} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Send />} {existing?.gepubliceerd ? "Bijwerken" : "Publiceren naar klant"}</Button>
      </div>
    </div>
  );
}

function SubscriptionEditor({ klant, sub, onSaved }: { klant: string; sub: Subscription | null; onSaved: (msg: string) => void }) {
  const [f, setF] = useState({ pakket: sub?.pakket ?? "Social Groei", prijs: sub?.prijs ?? "", platformen: sub?.platformen ?? ["Instagram"], status: sub?.status ?? "actief", volgendeBetaling: new Date(sub?.volgendeBetaling ?? Date.now()).toISOString().slice(0, 10), kanaalId: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true); setError("");
    try {
      await botApi("POST", "beheer/social/abonnement", { klant, ...f, volgendeBetaling: new Date(`${f.volgendeBetaling}T12:00:00`).getTime(), kanaalId: f.kanaalId || undefined });
      onSaved(sub ? "Abonnement bijgewerkt." : "Abonnement gestart. De klant krijgt een melding.");
    } catch (err) { setError((err as Error).message); }
    setBusy(false);
  }
  async function paid() {
    if (!confirm(`Betaling van ${f.prijs} ontvangen? De klant krijgt een betaalbewijs.`)) return;
    setBusy(true); setError("");
    try { await botApi("POST", "beheer/social/abonnement/betaald", { klant }); onSaved("Betaling verwerkt. Het betaalbewijs is als DM verstuurd."); } catch (err) { setError((err as Error).message); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block text-zinc-400">Pakket</span>
          <select value={f.pakket} onChange={(e) => set("pakket", e.target.value)} className={inputClass}>{["Social Start", "Social Groei", "Content op maat", "Maatwerk"].map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="text-sm"><span className="mb-1 block text-zinc-400">Prijs per maand</span><input value={f.prijs} onChange={(e) => set("prijs", e.target.value)} placeholder="bijv. € 150" className={inputClass} /></label>
        <label className="text-sm"><span className="mb-1 block text-zinc-400">Volgende betaling</span><input type="date" value={f.volgendeBetaling} onChange={(e) => set("volgendeBetaling", e.target.value)} className={inputClass} /></label>
        <label className="text-sm"><span className="mb-1 block text-zinc-400">Status</span>
          <select value={f.status} onChange={(e) => set("status", e.target.value as typeof f.status)} className={inputClass}><option value="actief">Actief</option><option value="gepauzeerd">Gepauzeerd</option><option value="gestopt">Gestopt</option></select>
        </label>
        <label className="text-sm sm:col-span-2"><span className="mb-1 block text-zinc-400">Ticketkanaal-ID voor herinneringen (optioneel)</span><input value={f.kanaalId} onChange={(e) => set("kanaalId", e.target.value.replace(/\D/g, ""))} placeholder="Leeg = alleen DM en melding" className={inputClass} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button key={p} type="button" onClick={() => set("platformen", f.platformen.includes(p) ? f.platformen.filter((x) => x !== p) : [...f.platformen, p])}
            className={cn("rounded-xl border px-3 py-1 text-sm", f.platformen.includes(p) ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400")}>{p}</button>
        ))}
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={busy}><Save /> {sub ? "Opslaan" : "Abonnement starten"}</Button>
        {sub && sub.status === "actief" && <Button size="sm" variant="secondary" onClick={paid} disabled={busy}><CreditCard /> Betaling ontvangen</Button>}
      </div>
      {sub && sub.betalingen.length > 0 && (
        <ul className="space-y-1 text-sm text-zinc-300">
          {sub.betalingen.map((b) => <li key={b.nr}>✅ <span className="capitalize">{b.periode}</span> • {b.bedrag} <span className="text-xs text-zinc-500">({timeAgo(b.t)})</span></li>)}
        </ul>
      )}
      <p className="text-xs text-zinc-500">De bot stuurt de klant {`${3}`} dagen voor de vervaldatum een herinnering (DM, melding en eventueel in het ticket) en waarschuwt jou als er te laat betaald wordt.</p>
    </div>
  );
}

function ClientManager({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { data, error, reload } = useBotData<ClientData>(`beheer/social?klant=${id}`);
  const [tab, setTab] = useState<"kalender" | "rapport" | "uploads" | "abonnement" | "notities">("kalender");
  const [notes, setNotes] = useState<string | null>(null);
  const [editing, setEditing] = useState<SocialPost | "nieuw" | null>(null);
  const [msg, setMsg] = useState("");
  const done = (m = "") => { setMsg(m); setEditing(null); reload(); onChanged(); };

  if (error) return <Notice>{error}</Notice>;
  if (!data) return <Loading />;
  const tabs = [["kalender", "Kalender", CalendarDays], ["rapport", "Maandrapport", BarChart3], ["uploads", `Uploads (${data.uploads.length})`, FileUp], ["abonnement", "Abonnement", CreditCard], ["notities", "Strategie & notities", Pencil]] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{data.klant.naam}</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([t, l, Icon]) => <button key={t} type="button" onClick={() => setTab(t)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm", tab === t ? "border-brand-500/50 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400")}><Icon className="size-4" /> {l}</button>)}
      </div>
      {msg && <Notice kind="success">{msg}</Notice>}

      {tab === "kalender" && (
        <div className="space-y-3">
          {editing ? <PostEditor klant={id} post={editing === "nieuw" ? null : editing} types={data.types} statussen={data.statussen} onSaved={() => done("Post opgeslagen.")} onCancel={() => setEditing(null)} />
            : <Button size="sm" onClick={() => setEditing("nieuw")}><Plus /> Post plannen</Button>}
          {data.posts.length === 0 ? <p className="text-sm text-zinc-500">Nog geen posts in de kalender.</p> : (
            <ul className="divide-y divide-white/5">
              {data.posts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="w-36 shrink-0 text-xs text-zinc-400">{when(p.datum)}</span>
                  <span className="w-20 shrink-0 text-xs text-zinc-300">{p.platform}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{TYPE_LABEL[p.type]?.nl}: {p.titel}{p.feedback.length > 0 && p.status === "aanpassing" && <span className="ml-2 text-xs text-rose-300">“{p.feedback[p.feedback.length - 1].tekst}”</span>}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_LABEL[p.status].cls)}>{STATUS_LABEL[p.status].nl}</span>
                  <button type="button" onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Bewerken"><Pencil className="size-4" /></button>
                  <button type="button" onClick={async () => { if (confirm("Post verwijderen?")) { await botApi("POST", "beheer/social/post/verwijder", { id: p.id }).catch(() => null); done("Post verwijderd."); } }} className="rounded-lg p-1.5 text-zinc-500 hover:text-rose-300" aria-label="Verwijderen"><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === "rapport" && <ReportEditor klant={id} reports={data.rapporten} onSaved={(m) => done(m)} />}
      {tab === "uploads" && (
        data.uploads.length === 0 ? <p className="text-sm text-zinc-500">Deze klant heeft nog niets aangeleverd.</p> : (
          <ul className="divide-y divide-white/5">
            {data.uploads.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1"><span className="block truncate">{u.naam}</span><span className="block truncate text-xs text-zinc-500">{timeAgo(u.t)}{u.grootte ? ` • ${(u.grootte / 1024 / 1024).toFixed(1)} MB` : ""}{u.notitie ? ` • ${u.notitie}` : ""}</span></span>
                <a href={`/api/bot-download?soort=upload&id=${u.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-300"><ExternalLink className="size-4" /> Openen</a>
              </li>
            ))}
          </ul>
        )
      )}
      {tab === "notities" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Alleen voor jou: doelgroep, contentpijlers, concurrenten, wat werkt en wat niet.</p>
          <textarea value={notes ?? data.notities.tekst} onChange={(e) => setNotes(e.target.value)} rows={14} maxLength={5000}
            placeholder={"Doelgroep:\nContentpijlers:\nConcurrenten (accounts):\nWat werkt goed:\nIdeeën:"} className={cn(inputClass, "font-mono")} />
          <div className="flex items-center gap-3">
            <Button size="sm" disabled={notes === null} onClick={async () => { await botApi("POST", "beheer/social/notities", { klant: id, tekst: notes ?? "" }).catch(() => null); setNotes(null); done("Notities opgeslagen."); }}><Save /> Opslaan</Button>
            {data.notities.bijgewerkt && <span className="text-xs text-zinc-500">Laatst bijgewerkt {timeAgo(data.notities.bijgewerkt)}</span>}
          </div>
          <p className="text-xs text-zinc-500">Tip: zet ideeën direct in de kalender met <code>/idee</code> in Discord.</p>
        </div>
      )}
      {tab === "abonnement" && <SubscriptionEditor key={data.abonnement?.id ?? "nieuw"} klant={id} sub={data.abonnement} onSaved={(m) => done(m)} />}
    </div>
  );
}

export function SocialTab() {
  const { data, error, loading, reload } = useBotData<Overview>("beheer/social", 60_000);
  const [selected, setSelected] = useState<string | null>(null);
  if (loading && !data) return <Loading />;
  const clients = data?.klanten ?? [];
  const allIds = selected && !clients.some((c) => c.id === selected) ? [...clients, { id: selected, naam: "Nieuwe klant", teKeuren: 0, aanpassing: 0, nieuweUploads: 0, abonnement: null }] : clients;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Panel title="Social klanten" icon={Megaphone}>
        {error && <Notice>{error}</Notice>}
        <AddClient onPick={(id) => setSelected(id)} />
        <ul className="mt-3 space-y-1">
          {allIds.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setSelected(c.id)} className={cn("w-full rounded-2xl p-3 text-left transition", selected === c.id ? "bg-brand-600/15" : "hover:bg-white/[0.04]")}>
                <span className="block text-sm font-medium">{c.naam}</span>
                <span className="mt-0.5 flex flex-wrap gap-1.5 text-[11px]">
                  {c.abonnement && <span className="text-zinc-400">{c.abonnement.pakket} • {c.abonnement.status}</span>}
                  {c.aanpassing > 0 && <span className="rounded-full bg-rose-500/15 px-1.5 text-rose-200">{c.aanpassing} aanpassing</span>}
                  {c.teKeuren > 0 && <span className="rounded-full bg-amber-400/15 px-1.5 text-amber-200">{c.teKeuren} te keuren</span>}
                  {c.nieuweUploads > 0 && <span className="rounded-full bg-brand-600/20 px-1.5 text-brand-200">{c.nieuweUploads} nieuw</span>}
                </span>
              </button>
            </li>
          ))}
          {!allIds.length && <p className="py-4 text-sm text-zinc-500">Nog geen social klanten. Zoek hierboven een lid om te beginnen.</p>}
        </ul>
      </Panel>
      <Panel>
        {selected ? <ClientManager key={selected} id={selected} onChanged={reload} /> : <p className="py-10 text-center text-sm text-zinc-500">Kies een klant of voeg er een toe.</p>}
      </Panel>
    </div>
  );
}
