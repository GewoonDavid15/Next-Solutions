"use client";

import { Lightbulb, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface Suggestion { id: string; nr: number; naam: string; avatar: string | null; tekst: string; t: number; ja: number; nee: number; status: string; reactie: string }
interface LevelRow { plek: number; id: string; naam: string; avatar: string | null; xp: number; berichten: number; voiceMin: number; level: number; procent: number }

function SuggestionRow({ s, statussen, onSaved }: { s: Suggestion; statussen: Record<string, { naam: string; emoji: string }>; onSaved: () => void }) {
  const [status, setStatus] = useState(s.status);
  const [reactie, setReactie] = useState(s.reactie);
  const [busy, setBusy] = useState(false);
  const changed = status !== s.status || reactie !== s.reactie;
  async function save() {
    setBusy(true);
    await botApi("POST", "beheer/suggestie", { id: s.id, status, reactie }).catch(() => null);
    setBusy(false);
    onSaved();
  }
  return (
    <li className="space-y-2 py-4">
      <div className="flex items-start gap-3">
        <span className="flex shrink-0 flex-col items-center rounded-xl border border-white/10 px-2 py-1 text-xs"><ThumbsUp className="size-3.5 text-emerald-300" />{s.ja}<ThumbsDown className="mt-1 size-3.5 text-rose-300" />{s.nee}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white">#{s.nr} {s.tekst}</p>
          <p className="text-xs text-zinc-500">{s.naam} • {timeAgo(s.t)} • score {s.ja - s.nee >= 0 ? "+" : ""}{s.ja - s.nee}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-12">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(inputClass, "w-auto py-1.5")}>{Object.entries(statussen).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.naam}</option>)}</select>
        <input value={reactie} onChange={(e) => setReactie(e.target.value)} maxLength={500} placeholder="Reactie van het team (optioneel)" className={cn(inputClass, "min-w-[200px] flex-1 py-1.5")} />
        {changed && <Button size="sm" onClick={save} disabled={busy}>Opslaan</Button>}
      </div>
    </li>
  );
}

export function CommunityExtraTab() {
  const sugg = useBotData<{ suggesties: Suggestion[]; statussen: Record<string, { naam: string; emoji: string }> }>("beheer/suggesties", 60_000);
  const levels = useBotData<{ top: LevelRow[]; totaal: number }>("beheer/levels", 60_000);
  const [sort, setSort] = useState<"score" | "nieuw">("score");
  const list = [...(sugg.data?.suggesties ?? [])].sort((a, b) => (sort === "score" ? b.ja - b.nee - (a.ja - a.nee) : b.t - a.t));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Panel title="Suggesties" icon={Lightbulb} actions={
        <div className="flex gap-1">{(["score", "nieuw"] as const).map((s) => <button key={s} type="button" onClick={() => setSort(s)} className={cn("rounded-full px-3 py-1 text-xs", sort === s ? "bg-brand-600/25 text-white" : "text-zinc-400")}>{s === "score" ? "Populairst" : "Nieuwst"}</button>)}</div>
      }>
        {sugg.error && <Notice>{sugg.error}</Notice>}
        {!sugg.data && !sugg.error && <Loading />}
        {sugg.data && !list.length && <p className="text-sm text-zinc-500">Nog geen suggesties. Leden typen hun idee in #💡・suggesties.</p>}
        <ul className="divide-y divide-white/5">{list.map((s) => <SuggestionRow key={s.id} s={s} statussen={sugg.data!.statussen} onSaved={sugg.reload} />)}</ul>
      </Panel>
      <Panel title={`Levels${levels.data ? ` • ${levels.data.totaal} leden` : ""}`} icon={Trophy}>
        {levels.error && <Notice>{levels.error}</Notice>}
        {!levels.data && !levels.error && <Loading />}
        {levels.data && !levels.data.top.length && <p className="text-sm text-zinc-500">Nog niemand heeft XP.</p>}
        <ol className="space-y-2">
          {levels.data?.top.map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <span className="w-6 text-right text-sm text-zinc-500">{l.plek}</span>
              {l.avatar ? <Image src={l.avatar} alt="" width={28} height={28} className="size-7 rounded-full" unoptimized /> : <span className="size-7 rounded-full bg-white/10" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{l.naam}</span>
                <span className="block h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-brand-gradient" style={{ width: `${l.procent}%` }} /></span>
              </span>
              <span className="text-right text-xs"><b className="text-white">Lvl {l.level}</b><span className="block text-zinc-500">{l.xp} XP</span></span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
