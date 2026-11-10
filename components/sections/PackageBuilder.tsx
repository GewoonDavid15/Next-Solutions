"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { trackEvent } from "@/components/layout/Tracker";
import { Button } from "@/components/ui/Button";
import { getQuoteOptions, labelFor } from "@/lib/contact";
import { featureOptions } from "@/lib/samensteller";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    steps: ["Wat", "Onderdelen", "Planning", "Gegevens"], what: "Waar kunnen we je mee helpen?", parts: "Wat moet erin zitten?", partsHint: "Kies alles wat van toepassing is. Twijfel je? Laat het dan open.",
    extra: "Nog iets wat we moeten weten? (optioneel)", budget: "Budget", timeline: "Wanneer wil je starten?", name: "Naam", email: "E-mailadres", discord: "Discord-naam (optioneel)",
    back: "Terug", next: "Volgende", send: "Voorstel aanvragen", summary: "Je keuze", done: "Ontvangen! We sturen je binnen één werkdag een voorstel op maat.", failed: "Versturen mislukt. Probeer het opnieuw of neem contact op via Discord.",
  },
  en: {
    steps: ["What", "Parts", "Planning", "Details"], what: "What can we help you with?", parts: "What should it include?", partsHint: "Pick everything that applies. Not sure? Leave it open.",
    extra: "Anything else we should know? (optional)", budget: "Budget", timeline: "When do you want to start?", name: "Name", email: "Email address", discord: "Discord name (optional)",
    back: "Back", next: "Next", send: "Request a proposal", summary: "Your choice", done: "Received! We'll send you a tailored proposal within one working day.", failed: "Sending failed. Please try again or contact us on Discord.",
  },
};

const field = "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

/** Four steps: service, building blocks, budget/planning, contact. Sends a normal quote request. */
export function PackageBuilder() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const opts = useMemo(() => getQuoteOptions(locale), [locale]);
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState("");
  const [service, setService] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  const features = featureOptions[service] ?? [];
  const canNext = [Boolean(dept && service), true, Boolean(budget && timeline), name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email)][step];

  async function send() {
    setState("busy");
    setError("");
    const description = [
      locale === "en" ? "Put together with the package builder:" : "Samengesteld met de pakket-samensteller:",
      ...(parts.length ? parts.map((p) => `- ${p}`) : [locale === "en" ? "- (no parts chosen yet)" : "- (nog geen onderdelen gekozen)"]),
      extra.trim() && `\n${extra.trim()}`,
    ].filter(Boolean).join("\n");
    const res = await fetch("/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department: dept, service, budget, timeline, description, name, email, discord, locale, indicatie: locale === "en" ? "Package builder" : "Pakket-samensteller" }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Record<string, string> } | null;
    if (res?.ok && data?.ok) { setState("done"); trackEvent("offerteformulier"); }
    else { setError(data?.error ?? Object.values(data?.errors ?? {})[0] ?? tx.failed); setState("idle"); }
  }

  if (state === "done") return <div className="glass rounded-3xl p-8 text-center"><CheckCircle2 className="mx-auto size-12 text-brand-300" /><p className="mt-4 text-lg font-semibold">{tx.done}</p></div>;

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Stappen">
        {tx.steps.map((s, i) => (
          <li key={s} className={cn("rounded-full py-1.5 text-center text-xs font-semibold", i === step ? "bg-brand-500 text-ink" : i < step ? "bg-brand-500/20 text-brand-200" : "bg-white/5 text-zinc-500")} aria-current={i === step ? "step" : undefined}>
            {i < step ? <Check className="mx-auto size-4" /> : `${i + 1}. ${s}`}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">{tx.what}</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {opts.departmentOptions.map((d) => (
              <button key={d.value} type="button" onClick={() => { setDept(d.value); setService(""); setParts([]); }} className={cn("rounded-2xl border p-4 text-left text-sm font-semibold transition", dept === d.value ? "border-brand-400 bg-brand-500/10 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")} aria-pressed={dept === d.value}>{d.label}</button>
            ))}
          </div>
          {dept && (
            <div className="flex flex-wrap gap-2">
              {opts.serviceOptions[dept]?.map((s) => (
                <button key={s.value} type="button" onClick={() => { setService(s.value); setParts([]); }} className={cn("rounded-full border px-4 py-2 text-sm transition", service === s.value ? "border-brand-400 bg-brand-500 text-ink" : "border-white/10 text-zinc-300 hover:border-white/25")} aria-pressed={service === s.value}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{tx.parts}</h2>
          <p className="text-sm text-zinc-400">{tx.partsHint}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => {
              const label = f[locale];
              const on = parts.includes(label);
              return (
                <label key={label} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition", on ? "border-brand-400 bg-brand-500/10" : "border-white/10 hover:border-white/25")}>
                  <input type="checkbox" checked={on} onChange={() => setParts((p) => (on ? p.filter((x) => x !== label) : [...p, label]))} className="accent-brand-500" /> {label}
                </label>
              );
            })}
          </div>
          <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={3} maxLength={1500} placeholder={tx.extra} className={field} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-lg font-semibold">{tx.budget}</h2>
            <div className="grid gap-2 sm:grid-cols-2">{opts.budgetOptions.map((b) => <button key={b.value} type="button" onClick={() => setBudget(b.value)} aria-pressed={budget === b.value} className={cn("rounded-2xl border p-3 text-sm transition", budget === b.value ? "border-brand-400 bg-brand-500/10 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")}>{b.label}</button>)}</div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">{tx.timeline}</h2>
            <div className="grid gap-2 sm:grid-cols-2">{opts.timelineOptions.map((tl) => <button key={tl.value} type="button" onClick={() => setTimeline(tl.value)} aria-pressed={timeline === tl.value} className={cn("rounded-2xl border p-3 text-sm transition", timeline === tl.value ? "border-brand-400 bg-brand-500/10 text-white" : "border-white/10 text-zinc-300 hover:border-white/25")}>{tl.label}</button>)}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/[0.03] p-4 text-sm">
            <p className="font-semibold text-white">{tx.summary}</p>
            <p className="mt-1 text-zinc-300">{labelFor(opts.serviceOptions[dept] ?? [], service)} • {labelFor(opts.budgetOptions, budget)} • {labelFor(opts.timelineOptions, timeline)}</p>
            {parts.length > 0 && <p className="mt-1 text-zinc-400">{parts.join(", ")}</p>}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tx.name} autoComplete="name" maxLength={100} className={field} aria-label={tx.name} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx.email} autoComplete="email" maxLength={120} className={field} aria-label={tx.email} />
          <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder={tx.discord} maxLength={40} className={field} aria-label={tx.discord} />
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        </div>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}><ArrowLeft /> {tx.back}</Button>
        {step < 3
          ? <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>{tx.next} <ArrowRight /></Button>
          : <Button onClick={send} disabled={!canNext || state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />} {tx.send}</Button>}
      </div>
    </div>
  );
}
