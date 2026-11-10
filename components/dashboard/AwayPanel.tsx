"use client";

import { Palmtree } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading, Notice, Panel, Toggle, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";

interface Away { aan: boolean; bericht: string; berichtEn: string; tot: number | null; tekst: string }

/** Away mode: a bar on the website and an automatic message in new tickets. */
export function AwayPanel() {
  const { data, error, loading, setData } = useBotData<Away>("beheer/afwezig");
  const [on, setOn] = useState(false);
  const [until, setUntil] = useState("");
  const [msg, setMsg] = useState("");
  const [msgEn, setMsgEn] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const [fout, setFout] = useState("");

  useEffect(() => {
    if (!data) return;
    setOn(data.aan);
    setUntil(data.tot ? new Date(data.tot).toISOString().slice(0, 10) : "");
    setMsg(data.bericht);
    setMsgEn(data.berichtEn);
  }, [data]);

  async function save(aan = on) {
    setState("busy"); setFout("");
    try {
      // End of the chosen day, Dutch time
      const tot = until ? new Date(`${until}T23:59:00+01:00`).getTime() : null;
      const r = await botApi<Away>("POST", "beheer/afwezig", { aan, tot, bericht: msg, berichtEn: msgEn });
      setData(r);
      setState("saved");
    } catch (e) { setFout((e as Error).message); setState("idle"); }
  }

  if (loading && !data) return <Loading />;
  if (error) return <Notice>{error}</Notice>;
  return (
    <Panel title="Afwezig-modus" icon={Palmtree} actions={<Toggle checked={on} label="Afwezig" onChange={(v) => { setOn(v); save(v); }} />}>
      <p className="text-sm text-zinc-400">{on ? <>Staat <b className="text-amber-200">aan</b>: de site toont een balk en nieuwe tickets krijgen dit bericht: “{data?.tekst}”</> : "Op vakantie of ziek? Zet dit aan: de website toont een balk en elk nieuw ticket krijgt automatisch een bericht. Herinneringen en opvolg-mails staan dan op pauze."}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="text-sm text-zinc-300">Terug op (optioneel)<input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={inputClass} /></label>
        <label className="text-sm text-zinc-300">Eigen bericht (optioneel, anders automatisch)<input value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={300} className={inputClass} placeholder="We zijn op vakantie tot ..." /></label>
        <span className="hidden sm:block" />
        <label className="text-sm text-zinc-300">Engels (optioneel)<input value={msgEn} onChange={(e) => setMsgEn(e.target.value)} maxLength={300} className={inputClass} placeholder="We're on holiday until ..." /></label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" variant="secondary" onClick={() => save()} disabled={state === "busy"}>Opslaan</Button>
        {state === "saved" && <span className="text-xs text-emerald-300">Opgeslagen</span>}
        {fout && <span className="text-xs text-rose-300">{fout}</span>}
      </div>
    </Panel>
  );
}
