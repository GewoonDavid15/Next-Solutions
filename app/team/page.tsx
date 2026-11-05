import { Users } from "lucide-react";
import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return pageMetadata("/team", "Team", locale === "en" ? "Meet the developers and designers of Next Solutions." : "Maak kennis met de developers en designers van Next Solutions.");
}

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const data = await getPublicData();
  const team = data?.team ?? [];
  const { locale } = await getI18n();
  const en = locale === "en";

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title={en ? <>The people behind <span className="text-gradient">Next Solutions</span></> : <>De mensen achter <span className="text-gradient">Next Solutions</span></>}
        description={
          en
            ? "Developers, designers and game developers who make your project happen. You'll find all of us in our Discord."
            : "Developers, designers en game developers die jouw project waarmaken. Je vindt ons allemaal in onze Discord."
        }
      />

      <section className="pb-16">
        <div className="container">
          {team.length === 0 ? (
            <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
              <Users className="mx-auto size-8 text-brand-300" />
              <p className="mt-3 font-display text-xl text-white">{en ? "The team is loading" : "Het team wordt geladen"}</p>
              <p className="mt-2 text-sm text-zinc-400">{en ? "We can't load the team right now. Feel free to come and say hi in our Discord." : "We kunnen het team op dit moment niet ophalen. Kom gerust kennismaken in onze Discord."}</p>
            </div>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <StaggerItem key={m.id} className="glass flex flex-col rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    {m.avatar ? (
                      <Image src={m.avatar} alt="" width={64} height={64} className="size-16 rounded-2xl border border-white/10" />
                    ) : (
                      <span className="grid size-16 place-items-center rounded-2xl bg-brand-gradient font-display text-2xl text-white">{m.naam.charAt(0)}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg text-white">{m.naam}</p>
                      <p className="text-sm text-brand-200">{m.functie}</p>
                    </div>
                  </div>
                  {m.bio && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{m.bio}</p>}
                  {m.afdelingen.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {m.afdelingen.map((a) => (
                        <span key={a} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.skills.map((s) => (
                        <span key={s} className="rounded-full border border-brand-500/30 bg-brand-600/10 px-2.5 py-1 font-mono text-[11px] text-brand-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </StaggerItem>
              ))}
            </Stagger>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="discord" size="lg">
              <a href={site.discordInvite} target="_blank" rel="noopener noreferrer">
                <DiscordIcon className="size-5" /> {en ? "Meet us on Discord" : "Kom kennismaken in Discord"}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
