"use client";

import { Archive, ExternalLink, FileText, Lock, MessageSquare, Paperclip, RefreshCw, Search, Send, Ticket, X, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime, type ClosedTicket, type OpenTicket, type TicketThread } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

/** Quick replies; {naam} becomes the first name of the client. */
const QUICK_REPLIES = [
  "Hoi {naam}! Bedankt voor je bericht, ik kijk er zo naar.",
  "Kun je wat meer details geven? Bijvoorbeeld voorbeelden, schermafbeeldingen of wat je precies in gedachten hebt.",
  "Top, dan zet ik een offerte voor je klaar. Die komt hier in het ticket.",
  "Is je vraag hiermee beantwoord? Dan sluit ik het ticket. Je kunt altijd een nieuw ticket openen.",
];

const waitingStyle: Record<string, string> = {
  klant: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  team: "bg-emerald-400/10 text-emerald-200 border-emerald-400/25",
  bot: "bg-white/5 text-zinc-400 border-white/10",
};

function Avatar({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  return src ? (
    <Image src={src} alt="" width={size} height={size} className="shrink-0 rounded-full" style={{ width: size, height: size }} unoptimized />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold" style={{ width: size, height: size }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Chat({ ticket, onClosed }: { ticket: OpenTicket; onClosed: () => void }) {
  const { data, error, reload, setData } = useBotData<TicketThread>(`beheer/ticket?id=${ticket.id}`, 5000);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const count = data?.berichten.length ?? 0;

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [count]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setSendError("");
    try {
      const message = await botApi<TicketThread["berichten"][number]>("POST", "beheer/ticket/reageer", { id: ticket.id, tekst: text });
      setData((d) => (d ? { ...d, berichten: [...d.berichten, message] } : d));
      setText("");
    } catch (err) {
      setSendError((err as Error).message);
    }
    setBusy(false);
  }

  async function close() {
    setBusy(true);
    try {
      await botApi("POST", "beheer/ticket/sluit", { id: ticket.id });
      onClosed();
    } catch (err) {
      setSendError((err as Error).message);
      setBusy(false);
    }
  }

  const firstName = ticket.eigenaar.naam.split(/\s+/)[0];

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {ticket.naam}
          </p>
          <p className="text-xs text-zinc-400">
            {ticket.eigenaar.naam} • {ticket.afdelingTitel} • {ticket.geclaimdDoor ? `geclaimd door ${ticket.geclaimdDoor}` : "niet geclaimd"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reload} className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Vernieuwen">
            <RefreshCw className="size-4" />
          </button>
          <a href={ticket.link} target="_blank" rel="noreferrer" className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Openen in Discord">
            <ExternalLink className="size-4" />
          </a>
          {confirmClose ? (
            <span className="flex items-center gap-1">
              <Button size="sm" variant="secondary" onClick={() => setConfirmClose(false)}>Nee</Button>
              <Button size="sm" onClick={close} disabled={busy}>Ja, sluiten</Button>
            </span>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setConfirmClose(true)}>
              <Lock /> Sluiten
            </Button>
          )}
        </div>
      </div>

      <div ref={box} className="flex-1 space-y-3 overflow-y-auto py-4 pr-1">
        {!data && !error && <Loading />}
        {error && <Notice>{error}</Notice>}
        {data?.berichten.map((m) => {
          const fromClient = m.via ? m.via === "klant" : m.auteur.id === data.eigenaarId;
          return (
            <div key={m.id} className={cn("flex gap-3", !fromClient && !m.auteur.bot && "flex-row-reverse text-right")}>
              <Avatar src={m.auteur.avatar} name={m.auteur.naam} />
              <div className={cn("min-w-0 max-w-[80%]", !fromClient && !m.auteur.bot && "items-end")}>
                <p className="text-xs text-zinc-500">
                  <span className={cn("font-medium", fromClient ? "text-amber-200" : m.auteur.bot ? "text-zinc-400" : "text-brand-300")}>{m.auteur.naam}</span>
                  {m.auteur.bot && <span className="ml-1 rounded bg-white/10 px-1 text-[10px]">BOT</span>}
                  {m.via && <span className="ml-1 rounded bg-brand-600/20 px-1 text-[10px] text-brand-200">via {m.via === "team" ? "dashboard" : "website"}</span>}
                  <span className="ml-2" title={dateTime(m.t)}>{timeAgo(m.t)}</span>
                </p>
                {m.tekst && (
                  <div
                    className={cn(
                      "mt-1 inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-sm",
                      m.auteur.bot ? "border border-white/10 bg-white/[0.02] text-zinc-300" : fromClient ? "bg-white/[0.06]" : "bg-brand-600/20 text-white",
                    )}
                  >
                    {m.tekst}
                  </div>
                )}
                {m.bijlagen.map((b) =>
                  b.afbeelding ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a key={b.url} href={b.url} target="_blank" rel="noreferrer"><img src={b.url} alt={b.naam} className="mt-1 max-h-56 rounded-xl" /></a>
                  ) : (
                    <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs text-brand-300 hover:underline">
                      <Paperclip className="size-3" /> {b.naam}
                    </a>
                  ),
                )}
              </div>
            </div>
          );
        })}
        {data && !data.berichten.length && <p className="py-8 text-center text-sm text-zinc-500">Nog geen berichten.</p>}
      </div>

      <div className="border-t border-white/10 pt-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(q.replace("{naam}", firstName))}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:border-brand-500/40 hover:text-white"
            >
              <Zap className="size-3" /> {q.slice(0, 32)}…
            </button>
          ))}
        </div>
        {sendError && <div className="mb-2"><Notice>{sendError}</Notice></div>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={1900}
            placeholder={`Antwoord aan ${firstName}… (Ctrl+Enter om te versturen)`}
            className={cn(inputClass, "min-h-[44px] resize-y")}
          />
          <Button onClick={send} disabled={busy || !text.trim()} aria-label="Versturen">
            <Send />
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">Je bericht verschijnt in Discord onder jouw naam, met &quot;via dashboard&quot;. De klant krijgt een melding.</p>
      </div>
    </div>
  );
}

function Transcript({ ticket, onClose }: { ticket: ClosedTicket; onClose: () => void }) {
  const { data, error } = useBotData<{ html: string }>(`beheer/transcript?id=${ticket.id}`);
  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <p className="truncate font-semibold">
          {ticket.naam} <span className="text-xs font-normal text-zinc-400">• gesloten {timeAgo(ticket.gesloten)}</span>
        </p>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Sluiten">
          <X className="size-4" />
        </button>
      </div>
      {error && <Notice>{error}</Notice>}
      {!data && !error && <Loading />}
      {data && <iframe title="Transcript" srcDoc={data.html} sandbox="" className="mt-3 w-full flex-1 rounded-2xl border border-white/10 bg-[#313338]" />}
    </div>
  );
}

export function TicketsTab() {
  const { data, error, loading, reload } = useBotData<{ open: OpenTicket[]; gesloten: ClosedTicket[] }>("beheer/tickets", 15_000);
  const [view, setView] = useState<"open" | "gesloten">("open");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("alle");
  const [selected, setSelected] = useState<string | null>(null);

  const departments = useMemo(() => [...new Set(data?.open.map((t) => t.afdelingTitel) ?? [])], [data]);
  const q = search.toLowerCase();
  const open = (data?.open ?? []).filter(
    (t) => (department === "alle" || t.afdelingTitel === department) && (!q || t.naam.includes(q) || t.eigenaar.naam.toLowerCase().includes(q)),
  );
  const closed = (data?.gesloten ?? []).filter((t) => !q || t.naam.includes(q) || (t.eigenaarNaam ?? "").toLowerCase().includes(q));
  const waiting = data?.open.filter((t) => t.laatsteVan === "klant").length ?? 0;

  const activeOpen = data?.open.find((t) => t.id === selected);
  const activeClosed = data?.gesloten.find((t) => t.id === selected);

  if (loading && !data) return <Loading />;

  return (
    <div className="space-y-4">
      {error && <Notice>{error}</Notice>}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Open</p>
          <p className="mt-1 text-2xl font-semibold">{data?.open.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">Klant wacht op antwoord</p>
          <p className="mt-1 text-2xl font-semibold">{waiting}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Gesloten (bewaard)</p>
          <p className="mt-1 text-2xl font-semibold">{data?.gesloten.length ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Panel className={cn(selected && "hidden lg:block")}>
          <div className="mb-3 flex gap-1 rounded-2xl border border-white/10 p-1">
            {(["open", "gesloten"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-sm", view === v ? "bg-brand-600/20 text-white" : "text-zinc-400 hover:text-white")}
              >
                {v === "open" ? <Ticket className="size-4" /> : <Archive className="size-4" />} {v === "open" ? "Open" : "Gesloten"}
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek op klant of ticket" className={cn(inputClass, "pl-9")} />
          </div>
          {view === "open" && departments.length > 1 && (
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={cn(inputClass, "mb-2")}>
              <option value="alle">Alle afdelingen</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          )}
          <div className="max-h-[60vh] space-y-1 overflow-y-auto">
            {view === "open" &&
              open.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", selected === t.id ? "bg-brand-600/15" : "hover:bg-white/[0.04]")}
                >
                  <Avatar src={t.eigenaar.avatar} name={t.eigenaar.naam} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.eigenaar.naam}</span>
                    <span className="block truncate text-xs text-zinc-500">{t.naam}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-zinc-500">{timeAgo(t.laatsteActiviteit)}</span>
                    {t.laatsteVan && (
                      <span className={cn("rounded-full border px-1.5 text-[10px]", waitingStyle[t.laatsteVan])}>
                        {t.laatsteVan === "klant" ? "wacht" : t.laatsteVan === "team" ? "beantwoord" : "bot"}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            {view === "gesloten" &&
              closed.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", selected === t.id ? "bg-brand-600/15" : "hover:bg-white/[0.04]")}
                >
                  <FileText className="size-5 shrink-0 text-zinc-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.eigenaarNaam ?? t.naam}</span>
                    <span className="block truncate text-xs text-zinc-500">{t.naam} • {t.berichten} berichten</span>
                  </span>
                  <span className="text-[11px] text-zinc-500">{timeAgo(t.gesloten)}</span>
                </button>
              ))}
            {view === "open" && !open.length && <p className="py-8 text-center text-sm text-zinc-500">Geen open tickets. Lekker rustig!</p>}
            {view === "gesloten" && !closed.length && <p className="py-8 text-center text-sm text-zinc-500">Nog geen gesloten tickets.</p>}
          </div>
        </Panel>

        <Panel className={cn(!selected && "hidden lg:block")}>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="mb-3 text-sm text-zinc-400 hover:text-white lg:hidden">
              ← Terug naar de lijst
            </button>
          )}
          {activeOpen ? (
            <Chat key={activeOpen.id} ticket={activeOpen} onClosed={() => { setSelected(null); setTimeout(reload, 7000); }} />
          ) : activeClosed ? (
            <Transcript key={activeClosed.id} ticket={activeClosed} onClose={() => setSelected(null)} />
          ) : (
            <div className="grid h-[50vh] place-items-center text-center text-sm text-zinc-500">
              <div>
                <MessageSquare className="mx-auto mb-3 size-8 text-zinc-600" />
                Kies een ticket om de berichten te lezen en te reageren.
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
