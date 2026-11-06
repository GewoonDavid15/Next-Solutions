"use client";

import { Loader2, MessageSquare, Paperclip, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  t: number;
  auteur: { id: string; naam: string; avatar: string | null; bot: boolean };
  via: "team" | "klant" | null;
  tekst: string;
  bijlagen: { naam: string; url: string; afbeelding: boolean }[];
}

const texts = {
  nl: {
    show: "Berichten", hide: "Verbergen", you: "Jij", placeholder: "Typ je bericht… (Ctrl+Enter om te versturen)", send: "Versturen",
    empty: "Nog geen berichten.", failed: "Kon de berichten niet laden.", note: "Je bericht komt direct in je ticket in Discord.",
  },
  en: {
    show: "Messages", hide: "Hide", you: "You", placeholder: "Type your message… (Ctrl+Enter to send)", send: "Send",
    empty: "No messages yet.", failed: "Could not load the messages.", note: "Your message goes straight into your ticket in Discord.",
  },
};

/** Lets a client read and answer their open ticket without leaving the portal. */
export function TicketChat({ ticketId, userId }: { ticketId: string; userId: string }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/portaal/ticket/berichten?id=${ticketId}`, { cache: "no-store" }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { berichten?: Message[]; fout?: string } | null;
    if (res?.ok && data?.berichten) {
      setMessages(data.berichten);
      setError("");
    } else setError(data?.fout ?? tx.failed);
  }, [ticketId, tx.failed]);

  useEffect(() => {
    if (!open) return;
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 6000);
    return () => clearInterval(timer);
  }, [open, load]);

  const count = messages?.length ?? 0;
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [count]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/portaal/ticket/berichten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, tekst: text }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (Message & { fout?: string }) | null;
    if (res?.ok && data?.id) {
      setMessages((m) => [...(m ?? []), data]);
      setText("");
      setError("");
    } else setError(data?.fout ?? tx.failed);
    setBusy(false);
  }

  return (
    <div className="mt-3">
      <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? <X /> : <MessageSquare />} {open ? tx.hide : tx.show}
      </Button>
      {open && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div ref={box} className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {!messages && !error && <Loader2 className="mx-auto size-5 animate-spin text-zinc-500" />}
            {messages?.map((m) => {
              const mine = m.auteur.id === userId;
              return (
                <div key={m.id} className={cn("flex flex-col", mine && "items-end")}>
                  <p className="text-[11px] text-zinc-500">
                    {mine ? tx.you : m.auteur.naam} • {new Date(m.t).toLocaleString(locale === "en" ? "en-GB" : "nl-NL", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  {m.tekst && (
                    <p className={cn("mt-0.5 max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm", mine ? "bg-brand-600/20 text-white" : m.auteur.bot ? "border border-white/10 text-zinc-400" : "bg-white/[0.06] text-zinc-200")}>
                      {m.tekst}
                    </p>
                  )}
                  {m.bijlagen.map((b) => (
                    <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-300 hover:underline">
                      <Paperclip className="size-3" /> {b.naam}
                    </a>
                  ))}
                </div>
              );
            })}
            {messages && !messages.length && <p className="text-center text-sm text-zinc-500">{tx.empty}</p>}
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
          <div className="mt-3 flex items-end gap-2">
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
              placeholder={tx.placeholder}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <Button size="sm" onClick={send} disabled={busy || !text.trim()} aria-label={tx.send}>
              {busy ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">{tx.note}</p>
        </div>
      )}
    </div>
  );
}
