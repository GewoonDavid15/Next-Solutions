"use client";

import { ArrowRight, Loader2, MessageCircleQuestion, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface Reply { zeker: boolean; antwoord: { titel: string; tekst: string; href: string } | null; bronnen: { titel: string; href: string }[] }
type Message = { from: "me"; text: string } | { from: "bot"; reply: Reply | null; error?: string };

const texts = {
  nl: {
    open: "Hulp nodig?", title: "Hulp-assistent", hello: "Hoi! Stel je vraag, bijvoorbeeld \"Hoe werkt betalen?\" of \"Hoe lang duurt een website?\". Ik zoek het antwoord in onze kennisbank.",
    placeholder: "Typ je vraag...", unsure: "Daar weet ik niet zeker het antwoord op. Misschien helpt een van deze pagina's:",
    none: "Ik kan daar niets over vinden.", ask: "Vraag het het team", more: "Lees verder", also: "Zie ook", failed: "Er ging iets mis, probeer het opnieuw.",
  },
  en: {
    open: "Need help?", title: "Help assistant", hello: "Hi! Ask your question, for example \"How does payment work?\" or \"How long does a website take?\". I'll look it up in our knowledge base.",
    placeholder: "Type your question...", unsure: "I'm not sure about that one. One of these pages might help:",
    none: "I can't find anything about that.", ask: "Ask the team", more: "Read more", also: "See also", failed: "Something went wrong, please try again.",
  },
};

/** Floating help assistant on the public pages. Not an AI: it only answers with our own help texts. */
export function HelpAssistant() {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages, open]);

  if (/^\/(en\/)?(dashboard|klantportaal\/feedback)/.test(pathname ?? "")) return null;

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const vraag = q.trim();
    if (vraag.length < 2 || busy) return;
    setQ("");
    setMessages((m) => [...m, { from: "me", text: vraag }]);
    setBusy(true);
    const r = await fetch("/api/assistent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vraag, taal: locale }) }).catch(() => null);
    const reply = (await r?.json().catch(() => null)) as Reply | null;
    setMessages((m) => [...m, r?.ok && reply ? { from: "bot", reply } : { from: "bot", reply: null, error: tx.failed }]);
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={tx.open}
        className="fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-2xl bg-brand-gradient px-4 font-semibold text-ink shadow-glow transition hover:-translate-y-0.5"
      >
        {open ? <X className="size-5" /> : <MessageCircleQuestion className="size-5" />}
        <span className="hidden sm:inline">{tx.open}</span>
      </button>
      {open && (
        <div role="dialog" aria-label={tx.title} className="fixed bottom-20 right-4 z-50 flex h-[min(560px,75svh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218] shadow-2xl sm:right-6">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="flex items-center gap-2 font-semibold"><MessageCircleQuestion className="size-5 text-brand-300" /> {tx.title}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Sluiten" className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white"><X className="size-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
            <p className="rounded-2xl bg-white/5 p-3 text-zinc-200">{tx.hello}</p>
            {messages.map((m, i) => m.from === "me" ? (
              <p key={i} className="ml-auto max-w-[85%] rounded-2xl bg-brand-600/20 p-3 text-white">{m.text}</p>
            ) : (
              <div key={i} className="max-w-[92%] space-y-2 rounded-2xl bg-white/5 p-3 text-zinc-200">
                {m.error ? <p className="text-rose-300">{m.error}</p> : m.reply?.zeker && m.reply.antwoord ? (
                  <>
                    <p className="font-semibold text-white">{m.reply.antwoord.titel}</p>
                    <p className="whitespace-pre-line">{m.reply.antwoord.tekst}</p>
                    <Link href={m.reply.antwoord.href} className="inline-flex items-center gap-1 text-brand-300 hover:underline">{tx.more} <ArrowRight className="size-3.5" /></Link>
                    {m.reply.bronnen.filter((b) => b.href !== m.reply!.antwoord!.href).length > 0 && (
                      <p className="text-xs text-zinc-500">{tx.also}: {m.reply.bronnen.filter((b) => b.href !== m.reply!.antwoord!.href).map((b, j) => <span key={b.href}>{j > 0 && " • "}<Link href={b.href} className="text-zinc-300 underline">{b.titel}</Link></span>)}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p>{m.reply?.bronnen.length ? tx.unsure : tx.none}</p>
                    {m.reply?.bronnen.map((b) => <Link key={b.href} href={b.href} className="block text-brand-300 hover:underline">{b.titel}</Link>)}
                  </>
                )}
                {!m.error && !m.reply?.zeker && <Link href={lp("/contact")} className={cn("inline-flex items-center gap-1 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-ink")}>{tx.ask} <ArrowRight className="size-3.5" /></Link>}
              </div>
            ))}
            {busy && <Loader2 className="size-4 animate-spin text-zinc-400" />}
            <div ref={end} />
          </div>
          <form onSubmit={ask} className="flex gap-2 border-t border-white/10 p-3">
            <label className="flex-1">
              <span className="sr-only">{tx.placeholder}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder={tx.placeholder} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-brand-500/60 focus:outline-none" />
            </label>
            <button type="submit" disabled={busy || q.trim().length < 2} aria-label="Versturen" className="grid size-10 place-items-center rounded-xl bg-brand-500 text-ink disabled:opacity-40"><Send className="size-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
