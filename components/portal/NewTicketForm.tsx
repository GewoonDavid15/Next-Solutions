"use client";

import { CheckCircle2, Loader2, Send, Ticket, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import type { TicketDepartment } from "@/lib/live";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

const texts = {
  nl: {
    failed: "Er ging iets mis. Probeer het opnieuw.", failedShort: "Er ging iets mis.", open: "Ticket openen", title: "Nieuw ticket", close: "Sluiten",
    existing: "Je had al een open ticket bij deze afdeling. Ga daar verder.",
    opened: "Je ticket is geopend in onze Discord! Het team reageert daar zo snel mogelijk.",
    openInDiscord: "Ticket openen in Discord", department: "Afdeling", subject: "Onderwerp", description: "Omschrijving",
    join: "Join de server", note: "Je ticket verschijnt als privékanaal in onze Discord. Je moet daarvoor lid zijn van de server.",
  },
  en: {
    failed: "Something went wrong. Please try again.", failedShort: "Something went wrong.", open: "Open ticket", title: "New ticket", close: "Close",
    existing: "You already had an open ticket with this department. Continue there.",
    opened: "Your ticket has been opened in our Discord! The team will reply there as soon as possible.",
    openInDiscord: "Open ticket in Discord", department: "Department", subject: "Subject", description: "Description",
    join: "Join the server", note: "Your ticket appears as a private channel in our Discord (in Dutch or English). You need to be a member of the server.",
  },
};

/** Opens a Discord ticket straight from the client portal. */
export function NewTicketForm({ departments, discordInvite }: { departments: TicketDepartment[]; discordInvite: string }) {
  const { locale } = useI18n();
  const tx = texts[locale];
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
    const data = ((await res?.json().catch(() => null)) ?? { fout: tx.failed }) as { link?: string; bestaand?: boolean; fout?: string };
    if (res?.ok && data.link) {
      setResult(data);
      setState("done");
      setSubject("");
      setDetails("");
    } else {
      setResult({ fout: data.fout ?? tx.failedShort, notInServer: res?.status === 409 });
      setState("error");
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={departments.length === 0}>
        <Ticket /> {tx.open}
      </Button>
    );
  }

  return (
    <div className="glass mt-4 rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg text-white"><Ticket className="size-5 text-brand-300" /> {tx.title}</h3>
        <button type="button" onClick={() => { setOpen(false); setState("idle"); }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label={tx.close}>
          <X className="size-4" />
        </button>
      </div>

      {state === "done" ? (
        <div className="mt-4 space-y-4">
          <p role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {result.bestaand ? tx.existing : tx.opened}
          </p>
          <Button asChild variant="discord">
            <a href={result.link} target="_blank" rel="noopener noreferrer"><DiscordIcon className="size-4" /> {tx.openInDiscord}</a>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-300">{tx.department}</legend>
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
            {tx.subject}
            <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} minLength={3} maxLength={100} required placeholder={locale === "nl" ? dep?.onderwerpVoorbeeld : undefined} />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
            {(locale === "nl" && dep?.detailsLabel) || tx.description}
            <textarea className={cn(field, "min-h-32")} value={details} onChange={(e) => setDetails(e.target.value)} minLength={10} maxLength={1500} required placeholder={locale === "nl" ? dep?.detailsVoorbeeld : undefined} />
            <span className="block text-right text-xs font-normal text-zinc-500">{details.length}/1500</span>
          </label>
          {state === "error" && (
            <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {result.fout}{" "}
              {result.notInServer && (
                <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="underline">{tx.join}</a>
              )}
            </p>
          )}
          <Button type="submit" disabled={state === "busy" || !department}>
            {state === "busy" ? <Loader2 className="animate-spin" /> : <Send />} {tx.open}
          </Button>
          <p className="text-xs text-zinc-500">{tx.note}</p>
        </form>
      )}
    </div>
  );
}
