"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Gamepad2, Loader2, PartyPopper, Send, Sparkles, Code2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { emptyQuote, getQuoteOptions, labelFor, validateStep, type QuoteRequest } from "@/lib/contact";
import { fmt } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    steps: ["Afdeling", "Project", "Gegevens", "Overzicht"],
    checkData: "Controleer je gegevens en probeer opnieuw.",
    failed: "Er ging iets mis.",
    sentTitle: "Aanvraag verstuurd!",
    sentText: "Bedankt {name}. We nemen meestal binnen 24 uur contact op via {via}e-mail.",
    sentVia: "Discord of ",
    again: "Nieuwe aanvraag",
    department: "Voor welke afdeling is je aanvraag?",
    chooseDepartment: "Kies een afdeling",
    service: "Welke dienst?",
    chooseService: "Kies een dienst",
    departmentFirst: "Kies eerst een afdeling",
    budget: "Budget",
    chooseBudget: "Kies een budget",
    timeline: "Planning",
    when: "Wanneer?",
    about: "Vertel ons over je project",
    aboutPlaceholder: "Wat wil je bouwen, voor wie, en welke features zijn belangrijk?",
    name: "Naam",
    namePlaceholder: "Jouw naam",
    email: "E-mail",
    emailPlaceholder: "jij@voorbeeld.nl",
    discord: "Discord gebruikersnaam (optioneel)",
    discordPlaceholder: "bijv. nexify",
    review: "Klopt alles?",
    serviceShort: "Dienst",
    departmentShort: "Afdeling",
    description: "Omschrijving",
    back: "Terug",
    next: "Volgende",
    sending: "Versturen…",
    send: "Verstuur aanvraag",
  },
  en: {
    steps: ["Department", "Project", "Details", "Summary"],
    checkData: "Check your details and try again.",
    failed: "Something went wrong.",
    sentTitle: "Request sent!",
    sentText: "Thanks {name}. We usually get in touch within 24 hours via {via}email.",
    sentVia: "Discord or ",
    again: "New request",
    department: "Which department is your request for?",
    chooseDepartment: "Choose a department",
    service: "Which service?",
    chooseService: "Choose a service",
    departmentFirst: "Choose a department first",
    budget: "Budget",
    chooseBudget: "Choose a budget",
    timeline: "Timeline",
    when: "When?",
    about: "Tell us about your project",
    aboutPlaceholder: "What do you want to build, for whom, and which features matter?",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    discord: "Discord username (optional)",
    discordPlaceholder: "e.g. nexify",
    review: "Is everything correct?",
    serviceShort: "Service",
    departmentShort: "Department",
    description: "Description",
    back: "Back",
    next: "Next",
    sending: "Sending…",
    send: "Send request",
  },
};
const deptIcons = { software: Code2, game: Gamepad2, media: Sparkles } as const;

type Errors = Partial<Record<keyof QuoteRequest, string>>;

export function QuoteForm({ initialDepartment = "" }: { initialDepartment?: string } = {}) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const steps = tx.steps;
  const { departmentOptions, serviceOptions, budgetOptions, timelineOptions } = getQuoteOptions(locale);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<QuoteRequest>({ ...emptyQuote, department: initialDepartment });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const set = <K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) => {
    setData((d) => ({ ...d, [key]: value, ...(key === "department" ? { service: "" } : {}) }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const go = (to: number) => {
    if (to > step) {
      const e = validateStep(step, data, locale);
      if (Object.keys(e).length) return setErrors(e);
    }
    setDirection(to > step ? 1 : -1);
    setStep(to);
  };

  const submit = async () => {
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? tx.checkData);
      setStatus("sent");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : tx.failed);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-10 text-center sm:p-14">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
          className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-gradient shadow-glow-lg"
        >
          <PartyPopper className="size-9 text-ink" />
        </motion.div>
        <h2 className="mt-6 text-3xl font-semibold">{tx.sentTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">
          {fmt(tx.sentText, { name: data.name.split(" ")[0], via: data.discord ? tx.sentVia : "" })}
        </p>
        <Button className="mt-8" variant="secondary" onClick={() => { setData(emptyQuote); setStep(0); setStatus("idle"); }}>
          {tx.again}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-10">
      {/* Stepper */}
      <ol className="mb-10 flex items-center">
        {steps.map((label, i) => (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <button
              type="button"
              onClick={() => i < step && go(i)}
              disabled={i >= step}
              className="flex items-center gap-2 disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl border font-display text-sm transition-all duration-300",
                  i < step && "border-brand-500 bg-brand-600 text-ink",
                  i === step && "border-brand-500 bg-brand-600/20 text-white shadow-glow",
                  i > step && "border-white/10 text-zinc-500",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-sm sm:block", i <= step ? "text-white" : "text-zinc-500")}>{label}</span>
            </button>
            {i < steps.length - 1 && (
              <span className="mx-2 h-px flex-1 overflow-hidden bg-white/10 sm:mx-4">
                <motion.span className="block h-full bg-brand-gradient" initial={false} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
              </span>
            )}
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) go(step + 1);
          else submit();
        }}
      >
        <div className="relative min-h-[320px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <Field label={tx.department} error={errors.department} htmlFor="department">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {departmentOptions.map((o) => {
                        const Icon = deptIcons[o.value as keyof typeof deptIcons];
                        const active = data.department === o.value;
                        return (
                          <button
                            type="button"
                            key={o.value}
                            onClick={() => set("department", o.value)}
                            aria-pressed={active}
                            className={cn(
                              "flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5",
                              active ? "border-brand-500 bg-brand-600/15 shadow-glow" : "border-white/10 bg-white/[0.02] hover:border-brand-500/40",
                            )}
                          >
                            <Icon className={cn("size-7", active ? "text-brand-300" : "text-zinc-400")} />
                            <span className="font-display text-sm text-white">{o.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 sm:hidden">
                      <Select id="department" value={data.department} onValueChange={(v) => set("department", v)} placeholder={tx.chooseDepartment} options={departmentOptions} />
                    </div>
                  </Field>
                  <Field label={tx.service} error={errors.service} htmlFor="service">
                    <Select
                      id="service"
                      value={data.service}
                      onValueChange={(v) => set("service", v)}
                      placeholder={data.department ? tx.chooseService : tx.departmentFirst}
                      options={serviceOptions[data.department] ?? []}
                      invalid={!!errors.service}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label={tx.budget} error={errors.budget} htmlFor="budget">
                      <Select id="budget" value={data.budget} onValueChange={(v) => set("budget", v)} placeholder={tx.chooseBudget} options={budgetOptions} invalid={!!errors.budget} />
                    </Field>
                    <Field label={tx.timeline} error={errors.timeline} htmlFor="timeline">
                      <Select id="timeline" value={data.timeline} onValueChange={(v) => set("timeline", v)} placeholder={tx.when} options={timelineOptions} invalid={!!errors.timeline} />
                    </Field>
                  </div>
                  <Field label={tx.about} error={errors.description} htmlFor="description">
                    <textarea
                      id="description"
                      rows={6}
                      value={data.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder={tx.aboutPlaceholder}
                      className={inputClass(!!errors.description, "resize-none py-3")}
                    />
                    <p className="mt-1 text-right text-xs text-zinc-500">{data.description.length}/2000</p>
                  </Field>
                </>
              )}

              {step === 2 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label={tx.name} error={errors.name} htmlFor="name">
                    <input id="name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} placeholder={tx.namePlaceholder} />
                  </Field>
                  <Field label={tx.email} error={errors.email} htmlFor="email">
                    <input id="email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} className={inputClass(!!errors.email)} placeholder={tx.emailPlaceholder} />
                  </Field>
                  <Field label={tx.discord} error={errors.discord} htmlFor="discord" className="sm:col-span-2">
                    <input id="discord" value={data.discord} onChange={(e) => set("discord", e.target.value)} className={inputClass(!!errors.discord)} placeholder={tx.discordPlaceholder} />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold">{tx.review}</h2>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      [tx.departmentShort, labelFor(departmentOptions, data.department)],
                      [tx.serviceShort, labelFor(serviceOptions[data.department] ?? [], data.service)],
                      [tx.budget, labelFor(budgetOptions, data.budget)],
                      [tx.timeline, labelFor(timelineOptions, data.timeline)],
                      [tx.name, data.name],
                      [tx.email, data.email],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <dt className="text-xs uppercase tracking-wider text-zinc-500">{k}</dt>
                        <dd className="mt-1 break-words text-white">{v}</dd>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">{tx.description}</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-300">{data.description}</dd>
                    </div>
                  </dl>
                  {status === "error" && <p role="alert" className="mt-4 text-sm text-rose-300">{serverError}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
          <Button type="button" variant="ghost" onClick={() => go(step - 1)} className={cn(step === 0 && "invisible")}>
            <ArrowLeft /> {tx.back}
          </Button>
          <Button type="submit" disabled={status === "sending"}>
            {step < 3 ? (
              <>{tx.next} <ArrowRight className="transition-transform group-hover:translate-x-1" /></>
            ) : status === "sending" ? (
              <><Loader2 className="animate-spin" /> {tx.sending}</>
            ) : (
              <><Send /> {tx.send}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function inputClass(invalid: boolean, extra = "") {
  return cn(
    "w-full rounded-2xl border bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 transition-colors hover:border-brand-500/40 focus:border-brand-500 focus:outline-none",
    extra || "h-12",
    invalid ? "border-rose-500/60" : "border-white/10",
  );
}

function Field({ label, error, htmlFor, className, children }: { label: string; error?: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block font-display text-sm text-zinc-200">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-rose-300">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
