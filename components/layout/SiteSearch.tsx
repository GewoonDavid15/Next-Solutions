"use client";

import { ArrowRight, CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface Item { s: string; t: string; d: string; h: string }

const texts = {
  nl: { open: "Zoeken (Ctrl+K)", placeholder: "Zoek naar diensten, artikelen, vragen...", empty: "Niets gevonden voor", hint: "Typ om te zoeken", close: "Sluiten", popular: "Populair" },
  en: { open: "Search (Ctrl+K)", placeholder: "Search services, articles, questions...", empty: "Nothing found for", hint: "Type to search", close: "Close", popular: "Popular" },
};

// Accents and case do not matter: "creatie" also finds "Creëren"
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function score(item: Item, words: string[]) {
  const title = norm(item.t);
  const body = norm(`${item.s} ${item.d}`);
  let total = 0;
  for (const w of words) {
    if (title.startsWith(w)) total += 6;
    else if (title.includes(` ${w}`)) total += 4;
    else if (title.includes(w)) total += 3;
    else if (body.includes(w)) total += 1;
    else return 0; // every word has to match somewhere
  }
  return total;
}

/** Site-wide search: button in the navbar, opens with Ctrl+K / ⌘K or "/". */
export function SiteSearch() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const show = useCallback(() => {
    setOpen(true);
    if (!items) fetch(`/api/zoekindex?taal=${locale}`).then((r) => r.json()).then(setItems).catch(() => setItems([]));
  }, [items, locale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 10);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const results = useMemo(() => {
    if (!items) return [];
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return items.filter((i) => i.s === "Dienst" || i.s === "Service").slice(0, 6);
    return items.map((i) => ({ i, n: score(i, words) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 12).map((x) => x.i);
  }, [items, q]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => { setOpen(false); setQ(""); };
  const go = (item: Item) => { close(); router.push(item.h); };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={tx.open}
        title={tx.open}
        className="inline-flex size-9 items-center justify-center gap-2 rounded-xl border border-white/10 text-zinc-300 transition-colors hover:border-brand-500/40 hover:text-white 2xl:w-auto 2xl:px-3"
      >
        <Search className="size-4" />
        <kbd className="hidden whitespace-nowrap rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px] text-zinc-400 2xl:inline">Ctrl K</kbd>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div role="dialog" aria-modal="true" aria-label={tx.open} className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="size-5 shrink-0 text-zinc-500" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                  else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                  else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
                }}
                placeholder={tx.placeholder}
                aria-label={tx.placeholder}
                role="combobox"
                aria-expanded="true"
                aria-controls="site-search-results"
                aria-activedescendant={results[active] ? `search-${active}` : undefined}
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none focus-visible:outline-none"
              />
              <button type="button" onClick={close} aria-label={tx.close} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"><X className="size-5" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!items ? <p className="flex items-center gap-2 p-4 text-sm text-zinc-400"><Loader2 className="size-4 animate-spin" /> …</p>
                : !results.length ? <p className="p-4 text-sm text-zinc-400">{tx.empty} “{q}”</p> : (
                <>
                  {!q && <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{tx.popular}</p>}
                  <ul id="site-search-results" role="listbox" ref={list}>
                    {results.map((r, i) => (
                      <li key={`${r.h}-${r.t}`} id={`search-${i}`} role="option" aria-selected={i === active} data-index={i}>
                        <button type="button" onMouseMove={() => setActive(i)} onClick={() => go(r)} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left", i === active ? "bg-brand-600/15" : "hover:bg-white/5")}>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">{r.t}</span>
                            <span className="block truncate text-xs text-zinc-500">{r.s}{r.d && ` • ${r.d}`}</span>
                          </span>
                          {i === active ? <CornerDownLeft className="size-4 shrink-0 text-brand-300" /> : <ArrowRight className="size-4 shrink-0 text-zinc-600" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
