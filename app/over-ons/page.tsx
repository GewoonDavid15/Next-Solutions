import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { team, timeline, values } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Wie we zijn, hoe we werken en waarom we bouwen wat we bouwen.",
};

export default function OverOnsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Over ons"
        title={<>Een klein team met een <span className="text-gradient">grote</span> werkplaats</>}
        description="We begonnen met een bot voor onze eigen Discord. Inmiddels bouwen we software, games en merken voor communities door heel Nederland."
      />

      {/* Verhaal */}
      <section className="pb-12">
        <div className="container max-w-3xl">
          <FadeUp>
            <Card className="relative">
              <Quote aria-hidden className="absolute right-6 top-6 size-12 text-brand-500/20" />
              <p className="text-lg leading-relaxed text-zinc-300">
                Next Solutions ontstond uit frustratie. We zochten een partij die een fatsoenlijke Discord bot kon
                bouwen zonder er maanden over te doen, en vonden die niet. Dus bouwden we hem zelf.
              </p>
              <p className="mt-4 leading-relaxed text-zinc-400">
                Dat principe is gebleven. We nemen werk aan waarvan we weten dat we het goed kunnen doen, en zeggen nee
                tegen de rest. Geen tussenlagen, geen accountmanagers: je praat met de mensen die je project bouwen.
              </p>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Waar we voor staan */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Waar we voor staan"
            title={<>Vier dingen die we <span className="text-gradient">niet</span> loslaten</>}
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

      {/* Tijdlijn */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="Tijdlijn" title="Hoe we hier kwamen" />
          <ol className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-brand-500 before:via-brand-700 before:to-transparent">
            {timeline.map((item, i) => (
              <li key={item.year} className="relative pl-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 grid size-6 place-items-center rounded-full border border-brand-500/40 bg-ink"
                >
                  <span className="size-2 rounded-full bg-brand-500 shadow-glow" />
                </span>
                <FadeUp delay={i * 0.08}>
                  <span className="font-display text-sm text-brand-400">{item.year}</span>
                  <h3 className="mt-0.5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-1 leading-relaxed text-zinc-400">{item.text}</p>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Het team"
            title="De mensen achter je project"
            description="Klein genoeg om je naam te onthouden, groot genoeg om alle drie de disciplines te dekken."
          />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        title={<>Benieuwd of we bij je passen?</>}
        description="Spring binnen in onze Discord en stel je vraag. Een gesprek kost niets."
      />
    </>
  );
}
