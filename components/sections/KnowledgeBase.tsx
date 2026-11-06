"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { articles, CATEGORIES, type Article } from "@/lib/kennisbank";
import { cn } from "@/lib/utils";

/** Searchable overview of the help articles. */
export function KnowledgeBase() {
  const { locale, lp } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Article["categorie"] | "alle">("alle");
  const en = locale === "en";

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return articles.filter((a) => (cat === "alle" || a.categorie === cat) && words.every((w) => `${a.titel[locale]} ${a.samenvatting[locale]} ${a.inhoud[locale]}`.toLowerCase().includes(w)));
  }, [q, cat, locale]);

  return (
    <div>
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? "Search, e.g. pay, ticket, profile…" : "Zoek, bijv. betalen, ticket, profiel…"} aria-label={en ? "Search the knowledge base" : "Zoek in de kennisbank"}
          className="w-full rounded-3xl border border-white/10 bg-black/30 py-4 pl-14 pr-5 text-base text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {(["alle", ...Object.keys(CATEGORIES)] as const).map((c) => (
          <button key={c} type="button" onClick={() => setCat(c as typeof cat)} className={cn("rounded-full border px-4 py-1.5 text-sm", cat === c ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400 hover:text-white")}>
            {c === "alle" ? (en ? "All" : "Alles") : CATEGORIES[c as Article["categorie"]][locale]}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {results.map((a) => (
          <Link key={a.slug} href={lp(`/kennisbank/${a.slug}`)} className="glass group flex gap-4 rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-brand-500/40">
            <span className="text-3xl" aria-hidden>{a.icon}</span>
            <span>
              <span className="text-xs uppercase tracking-wide text-brand-300">{CATEGORIES[a.categorie][locale]}</span>
              <span className="mt-1 block text-lg font-semibold text-white group-hover:text-brand-100">{a.titel[locale]}</span>
              <span className="mt-1 block text-sm text-zinc-400">{a.samenvatting[locale]}</span>
            </span>
          </Link>
        ))}
      </div>
      {results.length === 0 && <p className="mt-10 text-center text-zinc-400">{en ? "Nothing found. Open a ticket and we'll help you." : "Niets gevonden. Open een ticket, dan helpen we je."}</p>}
    </div>
  );
}
