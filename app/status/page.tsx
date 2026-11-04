import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, History, XCircle } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { CrowdCard } from "@/components/live/CrowdCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";
import { DAYS, formatDate, formatMinutes, formatUptime, type LiveService } from "@/lib/live";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status van de website, het klantportaal, de Discord bot en de support van Next Solutions.",
};

export const dynamic = "force-dynamic";

const STATUS = {
  operational: { label: "Operationeel", dot: "bg-emerald-400", text: "text-emerald-300" },
  degraded: { label: "Verminderde prestaties", dot: "bg-amber-400", text: "text-amber-300" },
  outage: { label: "Storing", dot: "bg-rose-400", text: "text-rose-300" },
  onbekend: { label: "Wordt gecontroleerd", dot: "bg-zinc-500", text: "text-zinc-400" },
} as const;

const HOUR = { ok: "bg-emerald-400/80", deels: "bg-amber-400/80", storing: "bg-rose-400/80" } as const;

function overall(services: LiveService[]) {
  const outage = services.filter((s) => s.status === "outage");
  if (outage.length) return { icon: XCircle, style: "border-rose-500/30 bg-rose-500/10 text-rose-100", title: `Storing bij ${outage.map((s) => s.naam).join(", ")}`, text: "We zijn op de hoogte en werken aan een oplossing." };
  if (services.some((s) => s.status === "degraded")) return { icon: AlertTriangle, style: "border-amber-500/30 bg-amber-500/10 text-amber-100", title: "Verminderde prestaties", text: "Een of meer diensten reageren trager dan normaal." };
  return { icon: CheckCircle2, style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100", title: "Alle systemen operationeel", text: "Alles werkt zoals het hoort." };
}

export default async function StatusPage() {
  const data = await getPublicData();

  return (
    <>
      <PageHeader
        eyebrow="Status"
        title={<>Live <span className="text-gradient">status</span></>}
        description="Automatisch gecontroleerd door onze Discord bot. Deze pagina toont de actuele status van al onze diensten."
      />

      <section className="pb-16">
        <div className="container max-w-4xl space-y-6">
          {!data ? (
            <div className="glass rounded-3xl p-8 text-center">
              <p className="font-display text-xl text-white">Status tijdelijk niet beschikbaar</p>
              <p className="mt-2 text-sm text-zinc-400">We kunnen de monitor op dit moment niet bereiken. Probeer het over een paar minuten opnieuw of kijk in onze Discord.</p>
            </div>
          ) : (
            <>
              {(() => {
                const o = overall(data.diensten);
                return (
                  <FadeUp>
                    <div className={cn("flex items-start gap-4 rounded-3xl border p-6", o.style)}>
                      <o.icon className="mt-0.5 size-7 shrink-0" />
                      <div>
                        <p className="font-display text-xl">{o.title}</p>
                        <p className="mt-1 text-sm opacity-80">{o.text}</p>
                      </div>
                    </div>
                  </FadeUp>
                );
              })()}

              <FadeUp delay={0.05}>
                <div className="glass divide-y divide-white/5 rounded-3xl">
                  {data.diensten.map((s) => {
                    const st = STATUS[s.status] ?? STATUS.onbekend;
                    return (
                      <div key={s.id} className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-white">
                            <span aria-hidden>{s.emoji}</span> {s.naam}
                            <span className="ml-2 font-sans text-sm text-zinc-500">{s.label}</span>
                          </p>
                          <p className={cn("flex items-center gap-2 text-sm", st.text)}>
                            <span className={cn("size-2 rounded-full", st.dot)} /> {st.label}
                          </p>
                        </div>
                        <div className="mt-3 flex gap-[3px]" aria-label="Status per uur, laatste 24 uur">
                          {s.uren.map((u, i) => (
                            <span key={i} title={`${24 - i} uur geleden`} className={cn("h-8 flex-1 rounded-sm", u ? HOUR[u] : "bg-white/10")} />
                          ))}
                        </div>
                        <div className="mt-2 flex justify-center text-xs text-zinc-500 sm:justify-between">
                          <span className="hidden sm:inline">24 uur geleden</span>
                          <span>
                            {formatUptime(s.uptime30d)} uptime (30 dagen){s.ms !== null && ` • ${s.ms} ms`}
                          </span>
                          <span className="hidden sm:inline">Nu</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FadeUp>

              <div className="grid gap-6 md:grid-cols-2">
                {data.tickets && (
                  <FadeUp delay={0.1}>
                    <CrowdCard tickets={data.tickets} className="h-full" />
                  </FadeUp>
                )}
                {data.tickets && (
                  <FadeUp delay={0.15}>
                    <div className="glass h-full rounded-3xl p-6">
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <Clock className="size-3.5" /> Openingstijden support
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                          const uren = data.tickets!.openingstijden[String(d)];
                          return (
                            <li key={d} className="flex justify-between">
                              <span className="text-zinc-400">{DAYS[d]}</span>
                              <span className="text-white">{uren ? `${uren[0]} – ${uren[1]}` : "Gesloten"}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-3 text-xs text-zinc-500">Tickets openen kan altijd, ook buiten openingstijden.</p>
                    </div>
                  </FadeUp>
                )}
              </div>

              <FadeUp delay={0.2}>
                <div className="glass rounded-3xl p-6">
                  <p className="flex items-center gap-2 font-display text-lg text-white">
                    <History className="size-5 text-brand-300" /> Recente storingen
                  </p>
                  {data.incidenten.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-400">🎉 Geen storingen geregistreerd.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {data.incidenten.map((i) => (
                        <li key={`${i.dienst}-${i.start}`} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                          <span className="text-white">{i.dienst}</span>
                          <span className="text-zinc-400">
                            {formatDate(i.start, true)} • {i.eind ? `${formatMinutes(i.eind - i.start)} offline` : <span className="text-rose-300">nog bezig</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FadeUp>
            </>
          )}
        </div>
      </section>
    </>
  );
}
