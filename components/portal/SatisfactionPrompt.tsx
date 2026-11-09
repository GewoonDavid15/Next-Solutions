"use client";

import { Loader2, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { ReviewForm } from "@/components/portal/ReviewForm";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Question { id: string; project: string }

const texts = {
  nl: { title: "Hoe tevreden ben je over {p}?", low: "Helemaal niet", high: "Heel erg", note: "Wat kan er beter? (optioneel)", send: "Versturen", thanks: "Bedankt voor je antwoord!", review: "Fijn dat je zo tevreden bent! Wil je dat ook in een review vertellen?", failed: "Er ging iets mis." },
  en: { title: "How satisfied are you with {p}?", low: "Not at all", high: "Very", note: "What could be better? (optional)", send: "Send", thanks: "Thanks for your answer!", review: "Great to hear! Would you share that in a review?", failed: "Something went wrong." },
};

/** After a project is delivered: "How satisfied are you, 1-10?". A 9 or 10 leads straight to the review form. */
export function SatisfactionPrompt() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [q, setQ] = useState<Question | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "review">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/portaal/tevredenheid", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d: { vragen?: Question[] } | null) => setQ(d?.vragen?.[0] ?? null)).catch(() => {});
  }, []);

  if (!q) return null;
  if (state === "review") return <div className="space-y-3"><p className="text-sm text-emerald-300">{tx.review}</p><ReviewForm /></div>;
  if (state === "done") return <p role="status" className="glass rounded-3xl p-5 text-sm text-emerald-300">{tx.thanks}</p>;

  async function send() {
    setState("busy");
    const res = await fetch("/api/portaal/tevredenheid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q!.id, score, opmerking: note }) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { vraagReview?: boolean; fout?: string } | null;
    if (res?.ok) setState(data?.vraagReview ? "review" : "done");
    else { setError(data?.fout ?? tx.failed); setState("idle"); }
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><Smile className="size-5 text-brand-300" /> {tx.title.replace("{p}", q.project)}</h3>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" onClick={() => setScore(n)} aria-pressed={score === n}
            className={cn("h-11 rounded-xl border text-sm font-semibold transition", score === n ? "border-brand-400 bg-brand-500 text-ink" : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-brand-500/50")}>{n}</button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-zinc-500"><span>{tx.low}</span><span>{tx.high}</span></div>
      {score !== null && (
        <div className="mt-4 space-y-3">
          {score < 9 && <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={2} placeholder={tx.note} className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-brand-500/60 focus:outline-none" />}
          <Button size="sm" onClick={send} disabled={state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />} {tx.send}</Button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
