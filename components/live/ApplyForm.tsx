"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import type { Vacancy } from "@/lib/live";

const field =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

/** Application form for one vacancy. Visitors who are not logged in first log in with Discord. */
export function ApplyForm({ vacancy, loggedIn, discordInvite }: { vacancy: Vacancy; loggedIn: boolean; discordInvite: string }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(() => vacancy.vragen.map(() => ""));
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<{ text: string; notInServer?: boolean } | null>(null);

  if (!loggedIn) {
    return (
      <Button asChild variant="discord" size="sm">
        <a href="/api/auth/discord?terug=/vacatures"><DiscordIcon className="size-4" /> Log in om te solliciteren</a>
      </Button>
    );
  }

  if (state === "done") {
    return (
      <p role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Bedankt! Je sollicitatie is verstuurd. Je krijgt een DM van onze bot zodra er nieuws is, en je ziet de status in je klantportaal.
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Send /> Solliciteren
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/portaal/sollicitatie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vacature: vacancy.id, antwoorden: answers }),
    }).catch(() => null);
    const data = ((await res?.json().catch(() => null)) ?? {}) as { fout?: string };
    if (res?.ok) {
      setState("done");
    } else {
      setError({ text: data.fout ?? "Er ging iets mis. Probeer het opnieuw.", notInServer: res?.status === 409 });
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      {vacancy.vragen.map((q, i) => (
        <label key={q} className="block space-y-1.5 text-sm font-medium text-zinc-300">
          {q}
          <textarea
            className={`${field} min-h-24`}
            value={answers[i]}
            onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
            minLength={2}
            maxLength={1000}
            required
          />
        </label>
      ))}
      {state === "error" && error && (
        <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error.text}{" "}
          {error.notInServer && (
            <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="underline">Join de server</a>
          )}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={state === "busy"}>
          {state === "busy" ? <Loader2 className="animate-spin" /> : <Send />} Versturen
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Annuleren
        </Button>
      </div>
      <p className="text-xs text-zinc-500">Je sollicitatie gaat met je Discord-naam naar ons team. We reageren via een DM van de bot.</p>
    </form>
  );
}
