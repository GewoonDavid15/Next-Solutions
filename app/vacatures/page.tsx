import { Briefcase, CheckCircle2 } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { ApplyForm } from "@/components/live/ApplyForm";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { getVacancies } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/vacatures", "Vacancies", "Work on Discord bots, websites, games and designs at Next Solutions.")
    : pageMetadata("/vacatures", "Vacatures", "Werk mee aan Discord bots, websites, games en designs bij Next Solutions.");
}

export const dynamic = "force-dynamic";

export default async function VacaturesPage() {
  const [vacancies, session] = await Promise.all([getVacancies(), getSession()]);
  const loggedIn = Boolean(session && !session.demo);
  const { locale } = await getI18n();
  const en = locale === "en";

  return (
    <>
      <PageHeader
        eyebrow={en ? "Vacancies" : "Vacatures"}
        title={en ? <>Help build <span className="text-gradient">Next Solutions</span></> : <>Bouw mee aan <span className="text-gradient">Next Solutions</span></>}
        description={
          en
            ? "We're looking for developers, designers and supporters who are just as excited about Discord, web and games as we are. You apply with your Discord account. Note: our team works in Dutch, so vacancies are listed in Dutch."
            : "We zoeken developers, designers en supporters die net zo enthousiast zijn over Discord, web en games als wij. Solliciteren gaat met je Discord-account."
        }
      />

      <section className="pb-16">
        <div className="container max-w-4xl space-y-6">
          {!vacancies || vacancies.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              <Briefcase className="mx-auto size-8 text-brand-300" />
              <p className="mt-3 font-display text-xl text-white">{vacancies ? (en ? "No vacancies at the moment" : "Op dit moment geen vacatures") : en ? "Vacancies temporarily unavailable" : "Vacatures tijdelijk niet beschikbaar"}</p>
              <p className="mt-2 text-sm text-zinc-400">{en ? "Keep an eye on our Discord: we announce new vacancies there first." : "Houd onze Discord in de gaten: nieuwe vacatures kondigen we daar als eerste aan."}</p>
            </div>
          ) : (
            vacancies.map((v, i) => (
              <FadeUp key={v.id} delay={i * 0.05}>
                <article className="glass rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl text-white">{v.titel}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{v.afdeling}</p>
                    </div>
                    <Badge>{v.soort}</Badge>
                  </div>
                  <p className="mt-4 text-zinc-300">{v.omschrijving}</p>
                  {v.eisen.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {v.eisen.map((e) => (
                        <li key={e} className="flex items-start gap-2 text-sm text-zinc-400">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-300" /> {e}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6">
                    <ApplyForm vacancy={v} loggedIn={loggedIn} discordInvite={site.discordInvite} />
                  </div>
                </article>
              </FadeUp>
            ))
          )}
        </div>
      </section>
    </>
  );
}
