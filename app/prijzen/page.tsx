import type { Metadata } from "next";
import { Check, Clock, Minus, Sparkles } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { FaqSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { FaqAccordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { departments } from "@/lib/data";
import { gamePackages, mediaPackages, packages, pricingFaq, type Package } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prijzen",
  description:
    "Wat kost een Discord bot, een website, een FiveM script of een huisstijl? Richtprijzen per pakket, zonder verrassingen achteraf.",
};

const groups = [
  { id: "software", items: packages },
  { id: "game", items: gamePackages },
  { id: "media", items: mediaPackages },
] as const;

export default function PrijzenPage() {
  return (
    <>
      <FaqSchema items={pricingFaq} />
      <PageHeader
        eyebrow="Prijzen"
        title={<>Heldere prijzen, <span className="text-gradient">geen</span> verrassingen</>}
        description="Richtprijzen per afdeling, zodat je weet waar je aan toe bent. Je krijgt altijd een vaste prijs voordat we beginnen."
      >
        <p className="text-sm text-zinc-500">Alle bedragen zijn exclusief btw.</p>
      </PageHeader>

      {groups.map(({ id, items }) => {
        const dept = departments.find((d) => d.id === id)!;
        const Icon = dept.icon;
        return (
          <section key={id} id={id} className="scroll-mt-28 py-12 sm:py-16">
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
              />
              <Stagger className="grid items-stretch gap-6 lg:grid-cols-3">
                {items.map((pkg) => (
                  <StaggerItem key={pkg.id} className="h-full">
                    <PackageCard pkg={pkg} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        );
      })}

      {/* Wat je altijd krijgt */}
      <section className="section">
        <div className="container">
          <FadeUp>
            <Card className="bg-gradient-to-br from-brand-700/20 to-transparent">
              <h2 className="text-2xl font-semibold sm:text-3xl">Bij elk pakket inbegrepen</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Vaste prijs vooraf",
                  "Eigen kanaal in onze Discord",
                  "Code en ontwerp worden jouw eigendom",
                  "Nazorg op bugs na oplevering",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-400" /> {item}
                  </li>
                ))}
              </ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Veelgestelde vragen */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading
            eyebrow="Over prijzen"
            title="Veelgestelde vragen"
            description="Staat je vraag er niet tussen? Stel hem in onze Discord, we antwoorden meestal dezelfde dag."
          />
          <FadeUp>
            <FaqAccordion items={pricingFaq} />
          </FadeUp>
        </div>
      </section>

      <CallToAction
        title={<>Benieuwd wat jouw project kost?</>}
        description="Vul het offerteformulier in en je hebt binnen 24 uur een prijs op maat."
      />
    </>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Card
      interactive
      className={cn(
        "flex h-full flex-col",
        pkg.popular && "border-brand-500/50 shadow-glow",
      )}
    >
      {pkg.popular && (
        <Badge className="mb-4 w-fit">
          <Sparkles className="size-3" /> Meest gekozen
        </Badge>
      )}
      <h3 className="text-xl font-semibold">{pkg.name}</h3>
      <p className="mt-1 text-sm text-zinc-400">{pkg.tagline}</p>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold text-white">{pkg.price}</span>
        {pkg.period && <span className="text-sm text-zinc-500">{pkg.period}</span>}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
        <Clock className="size-3.5" /> {pkg.delivery}
      </p>

      <ul className="mt-6 space-y-2.5">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-400" /> {f}
          </li>
        ))}
        {pkg.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
            <Minus className="mt-0.5 size-4 shrink-0" /> {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Button asChild variant={pkg.popular ? "primary" : "secondary"} className="w-full">
          <Link href={`/contact?pakket=${pkg.id}`}>Kies {pkg.name}</Link>
        </Button>
      </div>
    </Card>
  );
}
