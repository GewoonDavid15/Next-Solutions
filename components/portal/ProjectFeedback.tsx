"use client";

import { Check, Loader2, RotateCcw, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: { title: "Feedback op deze fase", intro: "Tevreden met wat er nu staat, of moet er iets anders? Je feedback komt direct in het projectkanaal.", ok: "Akkoord", revise: "Revisie vragen", what: "Wat moet er anders?", send: "Versturen", sentOk: "Bedankt! Het team weet dat je akkoord bent.", sentRevise: "Verstuurd. Het team pakt je revisie op.", failed: "Er ging iets mis." },
  en: { title: "Feedback on this phase", intro: "Happy with what's there now, or should something change? Your feedback goes straight to the project channel.", ok: "Approve", revise: "Request revision", what: "What should change?", send: "Send", sentOk: "Thanks! The team knows you approve.", sentRevise: "Sent. The team will pick up your revision.", failed: "Something went wrong." },
};

export function ProjectFeedback({ projectId }: { projectId: string }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [mode, setMode] = useState<"idle" | "revisie">("idle");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function send(soort: "akkoord" | "revisie") {
    setBusy(true); setError("");
    const res = await fetch("/api/portaal/project-feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: projectId, soort, tekst: text }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { fout?: string } | null;
    if (res?.ok) setDone(soort === "akkoord" ? tx.sentOk : tx.sentRevise); else setError(json?.fout ?? tx.failed);
    setBusy(false);
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-semibold">{tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      {done ? <p className="mt-4 flex items-center gap-2 text-sm text-emerald-200"><Check className="size-4" /> {done}</p> : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => send("akkoord")} disabled={busy}>{busy && mode === "idle" ? <Loader2 className="animate-spin" /> : <ThumbsUp />} {tx.ok}</Button>
            <Button size="sm" variant="secondary" onClick={() => setMode("revisie")} disabled={busy}><RotateCcw /> {tx.revise}</Button>
          </div>
          {mode === "revisie" && (
            <div className="mt-4 space-y-3">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={1500} placeholder={tx.what} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm" />
              <Button size="sm" onClick={() => send("revisie")} disabled={busy || text.trim().length < 5}>{busy && <Loader2 className="animate-spin" />} {tx.send}</Button>
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        </>
      )}
    </div>
  );
}
