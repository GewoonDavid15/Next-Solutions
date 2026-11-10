"use client";

import { Loader2, UserRound } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

/** For clients who log in with email: the name the team sees in tickets and quotes. */
export function NameSettings({ name, email }: { name: string; email: string }) {
  const { locale } = useI18n();
  const en = locale === "en";
  const [value, setValue] = useState(name);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  async function save() {
    setState("busy");
    const r = await fetch("/api/portaal/naam", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ naam: value }) }).catch(() => null);
    setState(r?.ok ? "saved" : "error");
  }
  return (
    <div className="glass max-w-2xl rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><UserRound className="size-5 text-brand-300" /> {en ? "Your name" : "Je naam"}</h3>
      <p className="mt-1 text-sm text-zinc-400">{en ? `You log in with ${email}. This is the name our team sees.` : `Je logt in met ${email}. Deze naam ziet ons team.`}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={value} onChange={(e) => { setValue(e.target.value); setState("idle"); }} maxLength={60} autoComplete="name" className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-brand-500/60 focus:outline-none" aria-label={en ? "Your name" : "Je naam"} />
        <Button onClick={save} disabled={state === "busy" || value.trim().length < 2}>{state === "busy" && <Loader2 className="animate-spin" />} {en ? "Save" : "Opslaan"}</Button>
      </div>
      {state === "saved" && <p role="status" className="mt-2 text-sm text-emerald-300">{en ? "Saved." : "Opgeslagen."}</p>}
      {state === "error" && <p role="alert" className="mt-2 text-sm text-rose-300">{en ? "Saving failed." : "Opslaan mislukt."}</p>}
    </div>
  );
}
