import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { departments, services } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Diensten",
  description: "Discord bots, websites, FiveM scripts, Minecraft servers, branding en UI/UX design.",
};

export default function DienstenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Onze diensten"
        title={<>Alles wat je nodig hebt om te <span className="text-gradient">groeien</span></>}
        description="Software, Game Development en Media — modulair samen te stellen tot precies het pakket dat jouw project nodig heeft."
      />

      {departments.map((dept) => {
        const items = services.filter((s) => s.department === dept.id);
        const Icon = dept.icon;
        return (
          <section key={dept.id} id={dept.id} className="scroll-mt-28 py-14 sm:py-20">
            <div className="container">
              <SectionHeading
                align="left"
                className="mb-10"
                eyebrow={dept.tagline}
                title={
                  <span className="flex items-center gap-4">
                    <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br shadow-glow", dept.gradient)}>
                      <Icon className="size-6 text-white" />
                    </span>
                    {dept.title}
                  </span>
                }
                description={dept.description}
              />
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ title, description, icon: ServiceIcon, features, from }) => (
                  <StaggerItem key={title}>
                    <Card interactive className="group flex h-full flex-col">
                      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-brand-500/30 bg-brand-600/15 text-brand-300 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <ServiceIcon className="size-6" />
                      </div>
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
                      <ul className="mt-5 space-y-2">
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                            <Check className="size-4 text-brand-400" /> {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto flex items-baseline gap-1.5 pt-6">
                        <span className="text-xs text-zinc-500">vanaf</span>
                        <span className="font-display text-2xl font-semibold text-white">{from}</span>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        );
      })}

      <CallToAction title={<>Niet gevonden wat je zoekt?</>} description="We bouwen ook volledig maatwerk. Vertel ons wat je in gedachten hebt." />
    </>
  );
}
