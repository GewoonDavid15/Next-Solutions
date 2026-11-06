"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calculator as CalcIcon, Check, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import type { Calculator } from "@/lib/bot-api";
import { trackEvent } from "@/components/layout/Tracker";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    eyebrow: "Prijscalculator", title: "Wat kost jouw project ongeveer?", intro: "Kies wat je nodig hebt en zie direct een indicatie. De echte prijs hoor je in je offerte, afgestemd op jouw project.",
    service: "1. Wat wil je laten maken?", options: "2. Wat moet erin?", rush: "Zo snel mogelijk", rushNote: "+{p}% spoedtoeslag",
    from: "Indicatie vanaf", note: "Dit is een indicatie, geen vaste prijs. Je betaalt pas na akkoord op je offerte.", cta: "Aanvraag met deze indicatie",
  },
  en: {
    eyebrow: "Price calculator", title: "Roughly what will your project cost?", intro: "Pick what you need and see an estimate straight away. The real price follows in your quote, tailored to your project.",
    service: "1. What do you want built?", options: "2. What should it include?", rush: "As soon as possible", rushNote: "+{p}% rush fee",
    from: "Estimate from", note: "This is an estimate, not a fixed price. You only pay after accepting your quote.", cta: "Request with this estimate",
  },
};

const euro = (n: number, locale: "nl" | "en") => new Intl.NumberFormat(locale === "en" ? "en-IE" : "nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** "Vanaf" price calculator. Prices come from the bot settings; the request goes to Discord as a lead. */
export function PriceCalculator({ calculator }: { calculator: Calculator }) {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  const [serviceId, setServiceId] = useState(calculator.diensten[0].id);
  const [picked, setPicked] = useState<string[]>([]);
  const [rush, setRush] = useState(false);
  const service = calculator.diensten.find((d) => d.id === serviceId) ?? calculator.diensten[0];

  const total = useMemo(() => {
    const base = service.vanaf + service.opties.filter((o) => picked.includes(o.id)).reduce((s, o) => s + o.prijs, 0);
    return Math.round(base * (rush ? 1 + calculator.spoedProcent / 100 : 1));
  }, [service, picked, rush, calculator.spoedProcent]);

  const chosen = service.opties.filter((o) => picked.includes(o.id)).map((o) => o.naam);
  const indicatie = `${euro(total, locale)}${chosen.length ? ` (${chosen.join(", ")})` : ""}${rush ? " + spoed" : ""}`;
  const href = `${lp("/contact")}?afdeling=${service.afdeling}&dienst=${service.id}${rush ? "&spoed=1" : ""}&indicatie=${encodeURIComponent(`vanaf ${indicatie}`)}`;

  return (
    <section id="calculator" className="section scroll-mt-28">
      <div className="container">
        <div className="glass mx-auto max-w-5xl overflow-hidden rounded-[2rem]">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-6 sm:p-10">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-300"><CalcIcon className="size-4" /> {tx.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{tx.title}</h2>
              <p className="mt-3 text-zinc-400">{tx.intro}</p>

              <p className="mt-8 text-sm font-semibold text-white">{tx.service}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {calculator.diensten.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => { setServiceId(d.id); setPicked([]); }}
                    aria-pressed={d.id === service.id}
                    className={cn("rounded-2xl border px-4 py-2 text-sm transition", d.id === service.id ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")}
                  >
                    {d.naam}
                  </button>
                ))}
              </div>

              {service.opties.length > 0 && (
                <>
                  <p className="mt-8 text-sm font-semibold text-white">{tx.options}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {service.opties.map((o) => {
                      const on = picked.includes(o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setPicked((p) => (on ? p.filter((x) => x !== o.id) : [...p, o.id]))}
                          aria-pressed={on}
                          className={cn("flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition", on ? "border-brand-500/60 bg-brand-600/15" : "border-white/10 hover:border-white/25")}
                        >
                          <span className="flex items-center gap-2">
                            <span className={cn("grid size-5 place-items-center rounded-md border", on ? "border-brand-400 bg-brand-500 text-ink" : "border-white/20")}>{on && <Check className="size-3.5" />}</span>
                            {o.naam}
                          </span>
                          <span className="text-zinc-400">+{euro(o.prijs, locale)}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {calculator.spoedProcent > 0 && (
                <button type="button" onClick={() => setRush((r) => !r)} aria-pressed={rush} className={cn("mt-6 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm", rush ? "border-amber-400/50 bg-amber-400/10 text-amber-100" : "border-white/10 text-zinc-400 hover:text-white")}>
                  <Zap className="size-4" /> {tx.rush} <span className="text-xs text-zinc-500">{tx.rushNote.replace("{p}", String(calculator.spoedProcent))}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col justify-between gap-6 border-t border-white/10 bg-brand-600/[0.06] p-6 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <p className="text-sm text-zinc-400">{tx.from}</p>
                <motion.p key={total} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-display text-5xl font-bold text-white">
                  {euro(total, locale)}
                </motion.p>
                <ul className="mt-5 space-y-1.5 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="size-4 text-brand-300" /> {service.naam}</li>
                  {chosen.map((c) => <li key={c} className="flex items-center gap-2"><Check className="size-4 text-brand-300" /> {c}</li>)}
                  {rush && <li className="flex items-center gap-2"><Zap className="size-4 text-amber-300" /> {tx.rush}</li>}
                </ul>
              </div>
              <div>
                <Button asChild size="lg" className="w-full" onClick={() => trackEvent("calculator")}>
                  <Link href={href}>{tx.cta} <ArrowRight /></Link>
                </Button>
                <p className="mt-3 text-xs text-zinc-500">{tx.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
