import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { FaqSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { Card } from "@/components/ui/Card";
import { FaqAccordion } from "@/components/ui/Accordion";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/diensten", "Services", "Discord bots, websites, FiveM scripts, Minecraft servers, branding and UI/UX design.")
    : pageMetadata("/diensten", "Diensten", "Discord bots, websites, FiveM scripts, Minecraft servers, branding en UI/UX design.");
}

export default async function DienstenPage() {
  const { locale, content, lp } = await getI18n();
  const en = locale === "en";
  return (
    <>
      <FaqSchema items={content.faq} />
      <PageHeader
        eyebrow={en ? "Our services" : "Onze diensten"}
        title={
          en ? <>Everything you need to <span className="text-gradient">grow</span></> : <>Alles wat je nodig hebt om te <span className="text-gradient">groeien</span></>
        }
        description={
          en
            ? "Software, Game Development and Media — combined modularly into exactly the package your project needs."
            : "Software, Game Development en Media — modulair samen te stellen tot precies het pakket dat jouw project nodig heeft."
        }
      />

      {content.departments.map((dept) => {
        const items = content.services.filter((s) => s.department === dept.id);
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
                {items.map(({ title, description, icon: ServiceIcon, features, department }) => (
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
                      <div className="mt-auto pt-6">
                        <Link href={lp(`/contact?afdeling=${department}`)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition-colors hover:text-white">
                          {en ? "Price on request" : "Prijs op aanvraag"} <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        );
      })}

      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading
            eyebrow={en ? "Frequently asked questions" : "Veelgestelde vragen"}
            title={en ? "Good to know" : "Goed om te weten"}
            description={en ? "Is your question not listed? Feel free to ask it in our Discord." : "Staat je vraag er niet tussen? Stel hem gerust in onze Discord."}
          />
          <FadeUp>
            <FaqAccordion items={content.faq} />
          </FadeUp>
        </div>
      </section>

      <CallToAction
        title={en ? "Didn't find what you're looking for?" : "Niet gevonden wat je zoekt?"}
        description={en ? "We also build fully custom work. Tell us what you have in mind." : "We bouwen ook volledig maatwerk. Vertel ons wat je in gedachten hebt."}
      />
    </>
  );
}
