import { AlertTriangle, CheckCircle2, Clock, History, XCircle } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { CrowdCard } from "@/components/live/CrowdCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { fmt, type Locale } from "@/lib/i18n/config";
import { DAYS, DAYS_EN, formatDate, formatMinutes, formatUptime, type LiveService } from "@/lib/live";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return pageMetadata(
    "/status",
    "Status",
    locale === "en"
      ? "Live status of the Next Solutions website, client portal, Discord bot and support."
      : "Live status van de website, het klantportaal, de Discord bot en de support van Next Solutions.",
  );
}

export const dynamic = "force-dynamic";

const STATUS = {
  operational: { dot: "bg-emerald-400", text: "text-emerald-300" },
  degraded: { dot: "bg-amber-400", text: "text-amber-300" },
  outage: { dot: "bg-rose-400", text: "text-rose-300" },
  onbekend: { dot: "bg-zinc-500", text: "text-zinc-400" },
} as const;

const texts = {
  nl: {
    status: { operational: "Operationeel", degraded: "Verminderde prestaties", outage: "Storing", onbekend: "Wordt gecontroleerd" },
    outageAt: "Storing bij {names}", outageText: "We zijn op de hoogte en werken aan een oplossing.",
    degradedText: "Een of meer diensten reageren trager dan normaal.",
    allOk: "Alle systemen operationeel", allOkText: "Alles werkt zoals het hoort.",
    intro: "Automatisch gecontroleerd door onze Discord bot. Deze pagina toont de actuele status van al onze diensten.",
    unavailable: "Status tijdelijk niet beschikbaar",
    unavailableText: "We kunnen de monitor op dit moment niet bereiken. Probeer het over een paar minuten opnieuw of kijk in onze Discord.",
    perHour: "Status per uur, laatste 24 uur", hoursAgo: "{n} uur geleden", dayAgo: "24 uur geleden", uptime: "uptime (30 dagen)", now: "Nu",
    hours: "Openingstijden support", closed: "Gesloten", always: "Tickets openen kan altijd, ook buiten openingstijden.",
    incidents: "Recente storingen", noIncidents: "🎉 Geen storingen geregistreerd.", offline: "{time} offline", ongoing: "nog bezig",
  },
  en: {
    status: { operational: "Operational", degraded: "Degraded performance", outage: "Outage", onbekend: "Being checked" },
    outageAt: "Outage affecting {names}", outageText: "We're aware of it and working on a fix.",
    degradedText: "One or more services are responding more slowly than usual.",
    allOk: "All systems operational", allOkText: "Everything is working as it should.",
    intro: "Checked automatically by our Discord bot. This page shows the current status of all our services.",
    unavailable: "Status temporarily unavailable",
    unavailableText: "We can't reach the monitor right now. Please try again in a few minutes or check our Discord.",
    perHour: "Status per hour, last 24 hours", hoursAgo: "{n} hours ago", dayAgo: "24 hours ago", uptime: "uptime (30 days)", now: "Now",
    hours: "Support opening hours", closed: "Closed", always: "You can open a ticket any time, also outside opening hours.",
    incidents: "Recent incidents", noIncidents: "🎉 No incidents recorded.", offline: "{time} offline", ongoing: "ongoing",
  },
};

const HOUR = { ok: "bg-emerald-400/80", deels: "bg-amber-400/80", storing: "bg-rose-400/80" } as const;

function overall(services: LiveService[], locale: Locale) {
  const tx = texts[locale];
  const outage = services.filter((s) => s.status === "outage");
  if (outage.length) return { icon: XCircle, style: "border-rose-500/30 bg-rose-500/10 text-rose-100", title: fmt(tx.outageAt, { names: outage.map((s) => s.naam).join(", ") }), text: tx.outageText };
  if (services.some((s) => s.status === "degraded")) return { icon: AlertTriangle, style: "border-amber-500/30 bg-amber-500/10 text-amber-100", title: tx.status.degraded, text: tx.degradedText };
  return { icon: CheckCircle2, style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100", title: tx.allOk, text: tx.allOkText };
}

export default async function StatusPage() {
  const data = await getPublicData();
  const { locale } = await getI18n();
  const tx = texts[locale];
  const days = locale === "en" ? DAYS_EN : DAYS;

  return (
    <>
      <PageHeader
        eyebrow="Status"
        title={<>Live <span className="text-gradient">status</span></>}
        description={tx.intro}
      />

      <section className="pb-16">
        <div className="container max-w-4xl space-y-6">
          {!data ? (
            <div className="glass rounded-3xl p-8 text-center">
              <p className="font-display text-xl text-white">{tx.unavailable}</p>
              <p className="mt-2 text-sm text-zinc-400">{tx.unavailableText}</p>
            </div>
          ) : (
            <>
              {(() => {
                const o = overall(data.diensten, locale);
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
                    const key = s.status in STATUS ? s.status : "onbekend";
                    const st = STATUS[key];
                    return (
                      <div key={s.id} className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-white">
                            <span aria-hidden>{s.emoji}</span> {s.naam}
                            <span className="ml-2 font-sans text-sm text-zinc-500">{s.label}</span>
                          </p>
                          <p className={cn("flex items-center gap-2 text-sm", st.text)}>
                            <span className={cn("size-2 rounded-full", st.dot)} /> {tx.status[key]}
                          </p>
                        </div>
                        <div className="mt-3 flex gap-[3px]" aria-label={tx.perHour}>
                          {s.uren.map((u, i) => (
                            <span key={i} title={fmt(tx.hoursAgo, { n: 24 - i })} className={cn("h-8 flex-1 rounded-sm", u ? HOUR[u] : "bg-white/10")} />
                          ))}
                        </div>
                        <div className="mt-2 flex justify-center text-xs text-zinc-500 sm:justify-between">
                          <span className="hidden sm:inline">{tx.dayAgo}</span>
                          <span>
                            {formatUptime(s.uptime30d, locale)} {tx.uptime}{s.ms !== null && ` • ${s.ms} ms`}
                          </span>
                          <span className="hidden sm:inline">{tx.now}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FadeUp>

              <div className="grid gap-6 md:grid-cols-2">
                {data.tickets && (
                  <FadeUp delay={0.1}>
                    <CrowdCard tickets={data.tickets} className="h-full" locale={locale} />
                  </FadeUp>
                )}
                {data.tickets && (
                  <FadeUp delay={0.15}>
                    <div className="glass h-full rounded-3xl p-6">
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <Clock className="size-3.5" /> {tx.hours}
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                          const uren = data.tickets!.openingstijden[String(d)];
                          return (
                            <li key={d} className="flex justify-between">
                              <span className="text-zinc-400">{days[d]}</span>
                              <span className="text-white">{uren ? `${uren[0]} – ${uren[1]}` : tx.closed}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-3 text-xs text-zinc-500">{tx.always}</p>
                    </div>
                  </FadeUp>
                )}
              </div>

              <FadeUp delay={0.2}>
                <div className="glass rounded-3xl p-6">
                  <p className="flex items-center gap-2 font-display text-lg text-white">
                    <History className="size-5 text-brand-300" /> {tx.incidents}
                  </p>
                  {data.incidenten.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-400">{tx.noIncidents}</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {data.incidenten.map((i) => (
                        <li key={`${i.dienst}-${i.start}`} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                          <span className="text-white">{i.dienst}</span>
                          <span className="text-zinc-400">
                            {formatDate(i.start, true, locale)} • {i.eind ? fmt(tx.offline, { time: formatMinutes(i.eind - i.start, locale) }) : <span className="text-rose-300">{tx.ongoing}</span>}
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
