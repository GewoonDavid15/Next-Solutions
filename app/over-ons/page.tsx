import { Quote } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/over-ons", "About us", "Who we are, how we work and why we build what we build.")
    : pageMetadata("/over-ons", "Over ons", "Wie we zijn, hoe we werken en waarom we bouwen wat we bouwen.");
}

const texts = {
  nl: {
    eyebrow: "Over ons",
    title: ["Eén maker, ", "drie", " disciplines"],
    intro: "Next Solutions bouwt software, games en merken voor communities. Opgezet en gerund door Nexify.",
    story1: "Next Solutions is opgezet door Nexify, met één doel: Discord bots, websites, game-scripts en designs die gewoon goed werken, zonder dat je er maanden op wacht.",
    story2: "We nemen werk aan waarvan we weten dat we het goed kunnen doen, en zeggen nee tegen de rest. Geen tussenlagen, geen accountmanagers: je praat rechtstreeks met de maker van je project, via je eigen kanaal in onze Discord.",
    valuesEyebrow: "Waar we voor staan",
    valuesTitle: ["Vier dingen die we ", "niet", " loslaten"],
    teamEyebrow: "Wie je spreekt",
    teamTitle: "De maker achter je project",
    teamIntro: "Je werkt rechtstreeks met de oprichter. Groeit het team, dan zie je dat hier en op de teampagina.",
    ctaTitle: "Benieuwd of we bij je passen?",
    ctaText: "Spring binnen in onze Discord en stel je vraag. Een gesprek kost niets.",
  },
  en: {
    eyebrow: "About us",
    title: ["One maker, ", "three", " disciplines"],
    intro: "Next Solutions builds software, games and brands for communities. Founded and run by Nexify.",
    story1: "Next Solutions was founded by Nexify with one goal: Discord bots, websites, game scripts and designs that simply work well, without you waiting months for them.",
    story2: "We take on work we know we can do well, and say no to the rest. No middlemen, no account managers: you talk directly to the maker of your project, through your own channel in our Discord.",
    valuesEyebrow: "What we stand for",
    valuesTitle: ["Four things we ", "never", " let go of"],
    teamEyebrow: "Who you talk to",
    teamTitle: "The maker behind your project",
    teamIntro: "You work directly with the founder. As the team grows, you'll see it here and on the team page.",
    ctaTitle: "Curious whether we're a good fit?",
    ctaText: "Drop by our Discord and ask your question. A conversation costs nothing.",
  },
};

export default async function OverOnsPage() {
  const { locale, content } = await getI18n();
  const tx = texts[locale];
  const { values, team } = content;
  return (
    <>
      <PageHeader
        eyebrow={tx.eyebrow}
        title={<>{tx.title[0]}<span className="text-gradient">{tx.title[1]}</span>{tx.title[2]}</>}
        description={tx.intro}
      />

      {/* Verhaal */}
      <section className="pb-12">
        <div className="container max-w-3xl">
          <FadeUp>
            <Card className="relative">
              <Quote aria-hidden className="absolute right-6 top-6 size-12 text-brand-500/20" />
              <p className="pr-12 text-lg leading-relaxed text-zinc-300">
                {tx.story1}
              </p>
              <p className="mt-4 leading-relaxed text-zinc-400">
                {tx.story2}
              </p>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Waar we voor staan */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={tx.valuesEyebrow}
            title={<>{tx.valuesTitle[0]}<span className="text-gradient">{tx.valuesTitle[1]}</span>{tx.valuesTitle[2]}</>}
          />
          <Stagger className="grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <StaggerItem key={v.title}>
                <Card interactive className="h-full">
                  <span className="font-display text-sm text-brand-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-xl font-semibold">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-400">{v.text}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>


      {/* Team */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={tx.teamEyebrow}
            title={tx.teamTitle}
            description={tx.teamIntro}
          />
          <Stagger className={cn("grid gap-6", team.length === 1 ? "mx-auto max-w-xs" : "sm:grid-cols-2 lg:grid-cols-4")}>
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <Card interactive className="group h-full text-center">
                  <span
                    className={cn(
                      "mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br font-display text-3xl font-semibold text-white shadow-glow transition-transform duration-300 group-hover:rotate-6",
                      member.gradient,
                    )}
                  >
                    {member.initial}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-zinc-400">{member.role}</p>
                  <span className="mt-3 inline-flex rounded-full border border-brand-500/20 bg-brand-600/10 px-2.5 py-1 text-xs text-brand-200">
                    {member.focus}
                  </span>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CallToAction
        title={tx.ctaTitle}
        description={tx.ctaText}
      />
    </>
  );
}
