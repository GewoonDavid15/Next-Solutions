"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Gamepad2, Loader2, PartyPopper, Send, Sparkles, Code2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  budgetOptions,
  departmentOptions,
  emptyQuote,
  labelFor,
  serviceOptions,
  timelineOptions,
  validateStep,
  type QuoteRequest,
} from "@/lib/contact";
import { cn } from "@/lib/utils";

const steps = ["Afdeling", "Project", "Gegevens", "Overzicht"];
const deptIcons = { software: Code2, game: Gamepad2, media: Sparkles } as const;

type Errors = Partial<Record<keyof QuoteRequest, string>>;

export function QuoteForm({ initialDepartment = "" }: { initialDepartment?: string } = {}) {
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
      const e = validateStep(step, data);
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
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Controleer je gegevens en probeer opnieuw.");
      setStatus("sent");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Er ging iets mis.");
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
          <PartyPopper className="size-9 text-white" />
        </motion.div>
        <h2 className="mt-6 text-3xl font-semibold">Aanvraag verstuurd!</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">
          Bedankt {data.name.split(" ")[0]}. We nemen binnen 24 uur contact op via {data.discord ? "Discord of " : ""}e-mail.
        </p>
        <Button className="mt-8" variant="secondary" onClick={() => { setData(emptyQuote); setStep(0); setStatus("idle"); }}>
          Nieuwe aanvraag
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
                  i < step && "border-brand-500 bg-brand-600 text-white",
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
                  <Field label="Voor welke afdeling is je aanvraag?" error={errors.department} htmlFor="department">
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
                      <Select id="department" value={data.department} onValueChange={(v) => set("department", v)} placeholder="Kies een afdeling" options={departmentOptions} />
                    </div>
                  </Field>
                  <Field label="Welke dienst?" error={errors.service} htmlFor="service">
                    <Select
                      id="service"
                      value={data.service}
                      onValueChange={(v) => set("service", v)}
                      placeholder={data.department ? "Kies een dienst" : "Kies eerst een afdeling"}
                      options={serviceOptions[data.department] ?? []}
                      invalid={!!errors.service}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Budget" error={errors.budget} htmlFor="budget">
                      <Select id="budget" value={data.budget} onValueChange={(v) => set("budget", v)} placeholder="Kies een budget" options={budgetOptions} invalid={!!errors.budget} />
                    </Field>
                    <Field label="Planning" error={errors.timeline} htmlFor="timeline">
                      <Select id="timeline" value={data.timeline} onValueChange={(v) => set("timeline", v)} placeholder="Wanneer?" options={timelineOptions} invalid={!!errors.timeline} />
                    </Field>
                  </div>
                  <Field label="Vertel ons over je project" error={errors.description} htmlFor="description">
                    <textarea
                      id="description"
                      rows={6}
                      value={data.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Wat wil je bouwen, voor wie, en welke features zijn belangrijk?"
                      className={inputClass(!!errors.description, "resize-none py-3")}
                    />
                    <p className="mt-1 text-right text-xs text-zinc-500">{data.description.length}/2000</p>
                  </Field>
                </>
              )}

              {step === 2 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Naam" error={errors.name} htmlFor="name">
                    <input id="name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} placeholder="Jouw naam" />
                  </Field>
                  <Field label="E-mail" error={errors.email} htmlFor="email">
                    <input id="email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} className={inputClass(!!errors.email)} placeholder="jij@voorbeeld.nl" />
                  </Field>
                  <Field label="Discord gebruikersnaam (optioneel)" error={errors.discord} htmlFor="discord" className="sm:col-span-2">
                    <input id="discord" value={data.discord} onChange={(e) => set("discord", e.target.value)} className={inputClass(!!errors.discord)} placeholder="bijv. nexify" />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold">Klopt alles?</h2>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Afdeling", labelFor(departmentOptions, data.department)],
                      ["Dienst", labelFor(serviceOptions[data.department] ?? [], data.service)],
                      ["Budget", labelFor(budgetOptions, data.budget)],
                      ["Planning", labelFor(timelineOptions, data.timeline)],
                      ["Naam", data.name],
                      ["E-mail", data.email],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <dt className="text-xs uppercase tracking-wider text-zinc-500">{k}</dt>
                        <dd className="mt-1 break-words text-white">{v}</dd>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">Omschrijving</dt>
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
            <ArrowLeft /> Terug
          </Button>
          <Button type="submit" disabled={status === "sending"}>
            {step < 3 ? (
              <>Volgende <ArrowRight className="transition-transform group-hover:translate-x-1" /></>
            ) : status === "sending" ? (
              <><Loader2 className="animate-spin" /> Versturen…</>
            ) : (
              <><Send /> Verstuur aanvraag</>
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
