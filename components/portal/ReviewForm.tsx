"use client";

import { Check, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const texts = {
  nl: { title: "Schrijf een review", intro: "Hoe was het werken met Next Solutions? Je review verschijnt op de website en in onze Discord.", text: "Je ervaring (optioneel)", context: "Waarvoor? (bijv. Discord bot)", send: "Review plaatsen", thanks: "Bedankt voor je review! 💚", failed: "Er ging iets mis." },
  en: { title: "Write a review", intro: "How was working with Next Solutions? Your review appears on the website and in our Discord.", text: "Your experience (optional)", context: "What for? (e.g. Discord bot)", send: "Post review", thanks: "Thank you for your review! 💚", failed: "Something went wrong." },
};

export function ReviewForm() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function send() {
    setState("busy"); setError("");
    const res = await fetch("/api/portaal/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sterren: stars, tekst: text, context }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { fout?: string } | null;
    if (res?.ok) setState("done"); else { setError(json?.fout ?? tx.failed); setState("idle"); }
  }

  if (state === "done") return <div className="glass rounded-3xl p-6"><p className="flex items-center gap-2 text-emerald-200"><Check className="size-5" /> {tx.thanks}</p></div>;

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><Star className="size-5 text-amber-300" /> {tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      <div className="mt-4 flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Sterren">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n}`} onMouseEnter={() => setHover(n)} onClick={() => setStars(n)}>
            <Star className={cn("size-8 transition", (hover || stars) >= n ? "fill-amber-300 text-amber-300" : "text-zinc-600")} />
          </button>
        ))}
      </div>
      {stars > 0 && (
        <div className="mt-4 space-y-3">
          <input value={context} onChange={(e) => setContext(e.target.value)} maxLength={80} placeholder={tx.context} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} placeholder={tx.text} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm" />
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <Button onClick={send} disabled={state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />} {tx.send}</Button>
        </div>
      )}
    </div>
  );
}
