"use client";

import { CheckCircle2, Loader2, Send, Ticket, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import type { TicketDepartment } from "@/lib/live";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

/** Opens a Discord ticket straight from the client portal. */
export function NewTicketForm({ departments, discordInvite }: { departments: TicketDepartment[]; discordInvite: string }) {
  const [open, setOpen] = useState(false);
  const [department, setDepartment] = useState(departments[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [result, setResult] = useState<{ link?: string; bestaand?: boolean; fout?: string; notInServer?: boolean }>({});

  const dep = departments.find((d) => d.id === department);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/portaal/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ afdeling: department, onderwerp: subject, details }),
    }).catch(() => null);
    const data = ((await res?.json().catch(() => null)) ?? { fout: "Er ging iets mis. Probeer het opnieuw." }) as { link?: string; bestaand?: boolean; fout?: string };
    if (res?.ok && data.link) {
      setResult(data);
      setState("done");
      setSubject("");
      setDetails("");
    } else {
      setResult({ fout: data.fout ?? "Er ging iets mis.", notInServer: res?.status === 409 });
      setState("error");
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={departments.length === 0}>
        <Ticket /> Ticket openen
      </Button>
    );
  }

  return (
    <div className="glass mt-4 rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg text-white"><Ticket className="size-5 text-brand-300" /> Nieuw ticket</h3>
        <button type="button" onClick={() => { setOpen(false); setState("idle"); }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Sluiten">
          <X className="size-4" />
        </button>
      </div>

      {state === "done" ? (
        <div className="mt-4 space-y-4">
          <p role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {result.bestaand ? "Je had al een open ticket bij deze afdeling. Ga daar verder." : "Je ticket is geopend in onze Discord! Het team reageert daar zo snel mogelijk."}
          </p>
          <Button asChild variant="discord">
            <a href={result.link} target="_blank" rel="noopener noreferrer"><DiscordIcon className="size-4" /> Ticket openen in Discord</a>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-300">Afdeling</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((d) => (
                <label
                  key={d.id}
                  className={cn(
                    "cursor-pointer rounded-2xl border px-4 py-3 text-sm transition",
                    department === d.id ? "border-brand-500/60 bg-brand-600/15 text-white" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  <input type="radio" name="afdeling" value={d.id} checked={department === d.id} onChange={() => setDepartment(d.id)} className="sr-only" />
                  <span className="block font-medium">{d.emoji} {d.titel}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{d.kort}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
            Onderwerp
            <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} minLength={3} maxLength={100} required placeholder={dep?.onderwerpVoorbeeld} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
            {dep?.detailsLabel ?? "Omschrijving"}
            <textarea className={cn(field, "min-h-32")} value={details} onChange={(e) => setDetails(e.target.value)} minLength={10} maxLength={1500} required placeholder={dep?.detailsVoorbeeld} />
            <span className="block text-right text-xs font-normal text-zinc-500">{details.length}/1500</span>
          </label>
          {state === "error" && (
            <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {result.fout}{" "}
              {result.notInServer && (
                <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="underline">Join de server</a>
              )}
            </p>
          )}
          <Button type="submit" disabled={state === "busy" || !department}>
            {state === "busy" ? <Loader2 className="animate-spin" /> : <Send />} Ticket openen
          </Button>
          <p className="text-xs text-zinc-500">Je ticket verschijnt als privékanaal in onze Discord. Je moet daarvoor lid zijn van de server.</p>
        </form>
      )}
    </div>
  );
}
