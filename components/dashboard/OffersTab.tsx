"use client";

import { Ban, CheckCircle2, ExternalLink, FileSignature, Inbox, Mail, Ticket, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { Loading, Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime, type AdminOffer, type Lead } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<AdminOffer["status"], string> = {
  open: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  akkoord: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  betaald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  ingetrokken: "border-white/10 bg-white/5 text-zinc-400",
  verlopen: "border-white/10 bg-white/5 text-zinc-500",
};

const LEAD_STYLE: Record<Lead["status"], string> = {
  nieuw: "border-brand-500/40 bg-brand-600/15 text-brand-100",
  opgepakt: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  ticket: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  spam: "border-white/10 bg-white/5 text-zinc-500",
};

const FILTERS = ["alle", "open", "akkoord", "betaald", "ingetrokken", "verlopen"] as const;

export function OffersTab() {
  const { data, error, loading, reload } = useBotData<{ offertes: AdminOffer[]; leads: Lead[] }>("beheer/offertes", 30_000);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("alle");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [openLead, setOpenLead] = useState<string | null>(null);

  async function act(key: string, path: string, body: object, success: string) {
    setBusy(key);
    setMessage(null);
    try {
      const result = await botApi<{ ticketLink?: string | null }>("POST", path, body);
      setMessage({ kind: "success", text: result.ticketLink ? `${success} ${result.ticketLink}` : success });
      await reload();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
    setBusy(null);
  }

  if (loading && !data) return <Loading />;
  const offers = (data?.offertes ?? []).filter((o) => filter === "alle" || o.status === filter);
  const all = data?.offertes ?? [];
  const leads = data?.leads ?? [];
  const sum = (s: AdminOffer["status"]) => all.filter((o) => o.status === s).length;

  return (
    <div className="space-y-6">
      {error && <Notice>{error}</Notice>}
      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Nieuwe aanvragen", leads.filter((l) => l.status === "nieuw").length, "text-brand-200"],
          ["Wacht op akkoord", sum("open"), "text-sky-200"],
          ["Wacht op betaling", sum("akkoord"), "text-amber-200"],
          ["Betaald", sum("betaald"), "text-emerald-200"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
            <p className={cn("mt-1 text-2xl font-semibold", color as string)}>{value}</p>
          </div>
        ))}
      </div>

      <Panel title="Aanvragen van de website" icon={Inbox}>
        {!leads.length ? (
          <p className="text-sm text-zinc-500">Nog geen aanvragen. Aanvragen via het offerteformulier op de website verschijnen hier en in Discord.</p>
        ) : (
          <div className="space-y-2">
            {leads.map((l) => (
              <div key={l.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
                <button type="button" onClick={() => setOpenLead(openLead === l.id ? null : l.id)} className="flex w-full flex-wrap items-center gap-3 p-3 text-left">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", LEAD_STYLE[l.status])}>{l.status}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{l.naam} • {l.dienst}</span>
                    <span className="block truncate text-xs text-zinc-500">{l.afdeling} • {l.budget} • {l.planning}</span>
                  </span>
                  <span className="text-xs text-zinc-500" title={dateTime(l.t)}>{timeAgo(l.t)}</span>
                </button>
                {openLead === l.id && (
                  <div className="space-y-3 border-t border-white/10 p-3 text-sm">
                    <p className="whitespace-pre-wrap text-zinc-300">{l.omschrijving}</p>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-brand-300 hover:underline"><Mail className="size-3" /> {l.email}</a>
                      <span>Discord: {l.discordId ? `ingelogd (${l.discord || l.discordId})` : l.discord || "-"}</span>
                      <span>Taal: {l.taal === "en" ? "Engels" : "Nederlands"}</span>
                      {l.door && <span>Door {l.door}</span>}
                      {l.ticketLink && <a href={l.ticketLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-300 hover:underline"><ExternalLink className="size-3" /> ticket</a>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {l.status === "nieuw" ? (
                        <>
                          <Button size="sm" disabled={!l.discordId || busy !== null} onClick={() => act(l.id, "beheer/lead", { id: l.id, status: "ticket" }, "Ticket geopend:")} title={l.discordId ? undefined : "Deze aanvrager was niet ingelogd met Discord"}>
                            <Ticket /> Ticket openen
                          </Button>
                          <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => act(l.id, "beheer/lead", { id: l.id, status: "opgepakt" }, "Aanvraag staat op opgepakt.")}>
                            <CheckCircle2 /> Opgepakt
                          </Button>
                          <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => act(l.id, "beheer/lead", { id: l.id, status: "spam" }, "Gemarkeerd als spam.")}>
                            <Trash2 /> Spam
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => act(l.id, "beheer/lead", { id: l.id, status: "nieuw" }, "Terug op nieuw gezet.")}>
                          <Undo2 /> Terug naar nieuw
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Offertes"
        icon={FileSignature}
        actions={
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === f ? "bg-brand-600/25 text-white" : "text-zinc-400 hover:text-white")}>
                {f}
              </button>
            ))}
          </div>
        }
      >
        {!offers.length ? (
          <p className="text-sm text-zinc-500">Geen offertes{filter !== "alle" ? ` met status "${filter}"` : ""}. Maak er een met /offerte maak in een ticket.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 font-medium">Offerte</th>
                  <th className="pb-2 font-medium">Prijs</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Datum</th>
                  <th className="pb-2 text-right font-medium">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offers.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium">{o.titel}</p>
                      <p className="text-xs text-zinc-500">{o.nummer}</p>
                    </td>
                    <td className="py-2.5 pr-3">{o.prijs}</td>
                    <td className="py-2.5 pr-3">
                      <span className={cn("rounded-full border px-2 py-0.5 text-xs", STATUS_STYLE[o.status])}>{o.statusEmoji} {o.statusNaam}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-zinc-400">
                      {dateTime(o.t)}
                      {o.betaaldOp ? <span className="block text-emerald-300/80">betaald {timeAgo(o.betaaldOp)}</span> : o.status === "open" ? <span className="block">geldig tot {new Date(o.geldigTot).toLocaleDateString("nl-NL")}</span> : null}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        {o.status === "akkoord" && (
                          <Button size="sm" disabled={busy !== null} onClick={() => act(o.id, "beheer/offerte/betaald", { id: o.id }, `${o.nummer} staat op betaald. De klant krijgt bericht in het ticket.`)}>
                            <CheckCircle2 /> Betaald
                          </Button>
                        )}
                        {(o.status === "open" || o.status === "akkoord") && (
                          <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => confirm(`${o.nummer} intrekken?`) && act(o.id, "beheer/offerte/intrekken", { id: o.id }, `${o.nummer} is ingetrokken.`)}>
                            <Ban /> Intrekken
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
