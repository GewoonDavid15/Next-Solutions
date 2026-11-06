"use client";

import { Eye, ImageIcon, Link2, Loader2, Megaphone, Plus, Send, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, type Role } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface Channel { id: string; naam: string; categorie: string | null; aankondiging: boolean }
interface Draft { kanaalId: string; titel: string; tekst: string; kleur: string; afbeelding: string; voettekst: string; ping: string; publiceer: boolean; knoppen: { label: string; url: string }[] }

const EMPTY: Draft = { kanaalId: "", titel: "", tekst: "", kleur: "#C6F432", afbeelding: "", voettekst: "", ping: "", publiceer: true, knoppen: [] };
const COLORS = ["#C6F432", "#6E9BFF", "#FFB547", "#FF6B6B", "#FF9B5E", "#7D8494"];
const STORE = "ns-aankondiging-concept";

/** Discord-style markdown for the preview: bold, italic, underline, code, links, headings, quotes, lists. */
function inline(text: string, key: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/\S+))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[2]) parts.push(<strong key={k}>{m[2]}</strong>);
    else if (m[3]) parts.push(<u key={k}>{m[3]}</u>);
    else if (m[4]) parts.push(<em key={k}>{m[4]}</em>);
    else if (m[5]) parts.push(<code key={k} className="rounded bg-black/40 px-1 text-[85%]">{m[5]}</code>);
    else if (m[6]) parts.push(<span key={k} className="text-[#00A8FC]">{m[6]}</span>);
    else if (m[8]) parts.push(<span key={k} className="text-[#00A8FC]">{m[8]}</span>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const k = `l${i}`;
        if (line.startsWith("### ")) return <p key={k} className="mt-1 text-base font-bold text-white">{inline(line.slice(4), k)}</p>;
        if (line.startsWith("## ")) return <p key={k} className="mt-1 text-xl font-bold text-white">{inline(line.slice(3), k)}</p>;
        if (line.startsWith("# ")) return <p key={k} className="mt-1 text-2xl font-bold text-white">{inline(line.slice(2), k)}</p>;
        if (line.startsWith("-# ")) return <p key={k} className="text-xs text-[#949BA4]">{inline(line.slice(3), k)}</p>;
        if (line.startsWith("> ")) return <p key={k} className="border-l-4 border-[#4E5058] pl-3">{inline(line.slice(2), k)}</p>;
        if (/^[-*] /.test(line)) return <p key={k} className="pl-4">• {inline(line.slice(2), k)}</p>;
        if (!line.trim()) return <p key={k} className="h-3" />;
        return <p key={k}>{inline(line, k)}</p>;
      })}
    </>
  );
}

function Preview({ draft, roles, botName }: { draft: Draft; roles: Role[]; botName: string }) {
  const ping = draft.ping === "everyone" ? "@everyone" : draft.ping === "here" ? "@here" : roles.find((r) => r.id === draft.ping)?.naam;
  return (
    <div className="rounded-2xl bg-[#313338] p-4 font-[system-ui] text-[15px] leading-snug text-[#DBDEE1]">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#C6F432] text-sm font-bold text-[#0A0C10]">NS</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-medium text-white">{botName}</span>
            <span className="ml-1 rounded bg-[#5865F2] px-1 text-[10px] font-semibold text-white">APP</span>
            <span className="ml-2 text-xs text-[#949BA4]">vandaag om {new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
          </p>
          {ping && <p className="mt-1"><span className="rounded bg-[#5865F2]/30 px-1 text-[#C9CDFB]">{ping.startsWith("@") ? ping : `@${ping}`}</span></p>}
          <div className="mt-1 max-w-[520px] overflow-hidden rounded-lg border-l-4 bg-[#2B2D31] p-4" style={{ borderColor: draft.kleur }}>
            {draft.titel && <p className="text-xl font-bold text-white">{draft.titel}</p>}
            {draft.tekst && <div className={cn(draft.titel && "mt-2")}><Markdown text={draft.tekst} /></div>}
            {draft.afbeelding && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.afbeelding} alt="" className="mt-3 max-h-64 w-full rounded-lg object-cover" />
            )}
            {draft.knoppen.filter((k) => k.label).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.knoppen.filter((k) => k.label).map((k, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded bg-[#4E5058] px-4 py-1.5 text-sm text-white">{k.label} <Link2 className="size-3" /></span>
                ))}
              </div>
            )}
            {draft.voettekst && <p className="mt-3 text-xs text-[#949BA4]">{draft.voettekst}</p>}
            {!draft.titel && !draft.tekst && <p className="text-sm italic text-[#949BA4]">Begin met typen om je bericht te zien…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsTab() {
  const { data, error, loading } = useBotData<{ kanalen: Channel[]; rollen: Role[] }>("beheer/kanalen");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string; link?: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // A draft is kept in this browser, so a refresh does not lose your text
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved) setDraft({ ...EMPTY, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const channel = data?.kanalen.find((c) => c.id === draft.kanaalId);

  async function post() {
    setBusy(true);
    setMessage(null);
    try {
      const { link } = await botApi<{ link: string }>("POST", "beheer/aankondiging", { ...draft, ping: draft.ping || null });
      setMessage({ kind: "success", text: `Geplaatst in #${channel?.naam}.`, link });
      setDraft({ ...EMPTY, kanaalId: draft.kanaalId, kleur: draft.kleur });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setBusy(false);
    setConfirming(false);
  }

  if (loading && !data) return <Loading />;
  const groups = new Map<string, Channel[]>();
  for (const c of data?.kanalen ?? []) groups.set(c.categorie ?? "Zonder categorie", [...(groups.get(c.categorie ?? "Zonder categorie") ?? []), c]);
  const canPost = draft.kanaalId && (draft.titel.trim() || draft.tekst.trim());

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Aankondiging opstellen" icon={Megaphone}>
        {error && <Notice>{error}</Notice>}
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Kanaal</span>
            <select value={draft.kanaalId} onChange={(e) => set("kanaalId", e.target.value)} className={inputClass}>
              <option value="">Kies een kanaal…</option>
              {[...groups].map(([cat, list]) => (
                <optgroup key={cat} label={cat}>
                  {list.map((c) => <option key={c.id} value={c.id}>#{c.naam}{c.aankondiging ? " (aankondigingen)" : ""}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Titel</span>
            <input value={draft.titel} onChange={(e) => set("titel", e.target.value)} maxLength={200} placeholder="bijv. Nieuw: tickets via de website!" className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Tekst <span className="text-zinc-500">(Discord-opmaak: **vet**, *schuin*, - lijst, ### kopje, -# klein)</span></span>
            <textarea value={draft.tekst} onChange={(e) => set("tekst", e.target.value)} rows={8} maxLength={3500} className={cn(inputClass, "font-mono")} />
            <span className="mt-1 block text-right text-[11px] text-zinc-500">{draft.tekst.length}/3500</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-sm">
              <span className="mb-1 block text-zinc-400">Kleur</span>
              <div className="flex flex-wrap items-center gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => set("kleur", c)} aria-label={`Kleur ${c}`} className={cn("size-7 rounded-full border-2", draft.kleur === c ? "border-white" : "border-transparent")} style={{ background: c }} />
                ))}
                <input type="color" value={draft.kleur} onChange={(e) => set("kleur", e.target.value)} className="size-7 cursor-pointer rounded-full bg-transparent" aria-label="Eigen kleur" />
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Ping</span>
              <select value={draft.ping} onChange={(e) => set("ping", e.target.value)} className={inputClass}>
                <option value="">Niemand</option>
                <option value="everyone">@everyone</option>
                <option value="here">@here</option>
                {data?.rollen.filter((r) => !r.naam.startsWith("─")).map((r) => <option key={r.id} value={r.id}>@{r.naam}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 flex items-center gap-1.5 text-zinc-400"><ImageIcon className="size-4" /> Afbeelding (optioneel, https-link)</span>
            <input value={draft.afbeelding} onChange={(e) => set("afbeelding", e.target.value.trim())} placeholder="https://…" className={inputClass} />
          </label>
          <div className="text-sm">
            <span className="mb-1 flex items-center gap-1.5 text-zinc-400"><Link2 className="size-4" /> Knoppen met een link (max. 5)</span>
            <div className="space-y-2">
              {draft.knoppen.map((k, i) => (
                <div key={i} className="flex gap-2">
                  <input value={k.label} onChange={(e) => set("knoppen", draft.knoppen.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Tekst" maxLength={80} className={inputClass} />
                  <input value={k.url} onChange={(e) => set("knoppen", draft.knoppen.map((x, j) => (j === i ? { ...x, url: e.target.value.trim() } : x)))} placeholder="https://…" className={inputClass} />
                  <button type="button" onClick={() => set("knoppen", draft.knoppen.filter((_, j) => j !== i))} className="rounded-xl px-2 text-zinc-500 hover:text-rose-300" aria-label="Knop verwijderen"><Trash2 className="size-4" /></button>
                </div>
              ))}
              {draft.knoppen.length < 5 && (
                <button type="button" onClick={() => set("knoppen", [...draft.knoppen, { label: "", url: "" }])} className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-white"><Plus className="size-4" /> Knop toevoegen</button>
              )}
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Voettekst (optioneel)</span>
            <input value={draft.voettekst} onChange={(e) => set("voettekst", e.target.value)} maxLength={200} placeholder="bijv. Team Next Solutions" className={inputClass} />
          </label>
          {channel?.aankondiging && (
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" checked={draft.publiceer} onChange={(e) => set("publiceer", e.target.checked)} className="accent-[#C6F432]" /> Ook publiceren naar servers die dit kanaal volgen
            </label>
          )}
          {message && (
            <Notice kind={message.kind}>
              {message.text} {message.link && <a href={message.link} target="_blank" rel="noreferrer" className="underline">Bekijk in Discord</a>}
            </Notice>
          )}
          <div className="flex flex-wrap gap-2">
            {confirming ? (
              <>
                <Button onClick={post} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Send />} Ja, plaats in #{channel?.naam}</Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>Annuleren</Button>
              </>
            ) : (
              <Button onClick={() => setConfirming(true)} disabled={!canPost}><Send /> Plaatsen</Button>
            )}
            <Button variant="ghost" onClick={() => setDraft({ ...EMPTY, kanaalId: draft.kanaalId })}>Leegmaken</Button>
          </div>
        </div>
      </Panel>
      <div className="xl:sticky xl:top-28 xl:self-start">
        <Panel title="Voorbeeld" icon={Eye}>
          <Preview draft={draft} roles={data?.rollen ?? []} botName="Next Solutions Core" />
          <p className="mt-3 text-xs text-zinc-500">Zo ongeveer ziet het eruit in Discord. Je concept wordt in deze browser bewaard.</p>
        </Panel>
      </div>
    </div>
  );
}
