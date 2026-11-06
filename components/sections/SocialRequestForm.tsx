"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "X", "Facebook"];
const GOALS = {
  nl: ["Meer volgers", "Meer klanten of verkoop", "Meer bereik en naamsbekendheid", "Tijd besparen", "Professionelere uitstraling"],
  en: ["More followers", "More customers or sales", "More reach and awareness", "Saving time", "A more professional look"],
};
const PACKAGES = ["Social Start", "Social Groei", "Content op maat"];

const texts = {
  nl: {
    title: "Laat je accounts bekijken", intro: "Vertel welke platformen je gebruikt en zet de links erbij. We kijken ernaar en komen met een voorstel op maat.",
    platforms: "Op welke platformen?", accounts: "Links of @namen van je accounts (optioneel)", goal: "Wat is je belangrijkste doel?", pkg: "Interesse in een pakket? (optioneel)", none: "Weet ik nog niet",
    note: "Nog iets wat we moeten weten? (optioneel)", name: "Naam", email: "E-mailadres", send: "Aanvraag versturen", sent: "Ontvangen! We kijken naar je accounts en nemen snel contact met je op.", failed: "Er ging iets mis.",
  },
  en: {
    title: "Let us look at your accounts", intro: "Tell us which platforms you use and add the links. We'll take a look and come back with a tailored proposal.",
    platforms: "Which platforms?", accounts: "Links or @handles of your accounts (optional)", goal: "What's your main goal?", pkg: "Interested in a package? (optional)", none: "Not sure yet",
    note: "Anything else we should know? (optional)", name: "Name", email: "Email address", send: "Send request", sent: "Received! We'll look at your accounts and get back to you soon.", failed: "Something went wrong.",
  },
};

const field = "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function SocialRequestForm() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [goalIndex, setGoalIndex] = useState(0);
  const [form, setForm] = useState({ accounts: "", pakket: "", notitie: "", naam: "", email: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setError("");
    const res = await fetch("/api/social-aanvraag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The goal is always sent in Dutch, so the team reads it the same way
      body: JSON.stringify({ ...form, platforms, goal: GOALS.nl[goalIndex], locale }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res?.ok && json?.ok) setState("done"); else { setError(json?.error ?? tx.failed); setState("idle"); }
  }

  if (state === "done") {
    return <div className="glass rounded-3xl p-10 text-center"><CheckCircle2 className="mx-auto size-12 text-brand-300" /><p className="mt-4 text-lg text-white">{tx.sent}</p></div>;
  }

  return (
    <form onSubmit={submit} className="glass space-y-6 rounded-3xl p-6 sm:p-10">
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">{tx.title}</h2>
        <p className="mt-2 text-zinc-400">{tx.intro}</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm text-zinc-400">{tx.platforms}</legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const on = platforms.includes(p);
            return (
              <button key={p} type="button" aria-pressed={on} onClick={() => setPlatforms((l) => (on ? l.filter((x) => x !== p) : [...l, p]))}
                className={cn("rounded-2xl border px-4 py-2 text-sm transition", on ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")}>
                {p}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{tx.accounts}</span>
        <textarea value={form.accounts} onChange={(e) => set("accounts", e.target.value)} rows={3} maxLength={600} placeholder="instagram.com/jouwmerk&#10;@jouwmerk op TikTok" className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.goal}</span>
          <select value={goalIndex} onChange={(e) => setGoalIndex(Number(e.target.value))} className={field}>
            {GOALS[locale].map((g, i) => <option key={g} value={i}>{g}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.pkg}</span>
          <select value={form.pakket} onChange={(e) => set("pakket", e.target.value)} className={field}>
            <option value="">{tx.none}</option>
            {PACKAGES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{tx.note}</span>
        <textarea value={form.notitie} onChange={(e) => set("notitie", e.target.value)} rows={3} maxLength={1000} className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.name}</span>
          <input required value={form.naam} onChange={(e) => set("naam", e.target.value)} maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.email}</span>
          <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={120} autoComplete="email" className={field} />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <Button type="submit" size="lg" disabled={state === "busy" || platforms.length === 0}>
        {state === "busy" ? <Loader2 className="animate-spin" /> : <Send />} {tx.send}
      </Button>
    </form>
  );
}
