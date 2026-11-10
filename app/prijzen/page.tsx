import { Check, Clock, Minus, Sparkles } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { FaqSchema } from "@/components/StructuredData";
import { PriceCalculator } from "@/components/sections/PriceCalculator";
import { getCalculator } from "@/lib/bot-api";
import { CallToAction } from "@/components/sections/CallToAction";
import { FaqAccordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPricing, type Package } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/prijzen", "Packages", "Packages for Discord bots, websites, FiveM scripts, Minecraft servers and branding. Every price is custom, on request.")
    : pageMetadata("/prijzen", "Pakketten", "Pakketten voor Discord bots, websites, FiveM scripts, Minecraft servers en branding. Elke prijs op maat, op aanvraag.");
}

const texts = {
  nl: {
    eyebrow: "Pakketten",
    title: ["Heldere pakketten, ", "geen", " verrassingen"],
    intro: "Wat we per afdeling voor je kunnen doen. Elke prijs is op maat: je krijgt een vaste prijs voordat we beginnen.",
    note: "Prijzen op aanvraag.",
    included: "Bij elk pakket inbegrepen",
    includedList: ["Vaste prijs vooraf", "Eigen kanaal in onze Discord", "Code en ontwerp worden jouw eigendom", "Nazorg op bugs na oplevering"],
    faqEyebrow: "Over prijzen en betalen",
    faqTitle: "Veelgestelde vragen",
    faqIntro: "Staat je vraag er niet tussen? Stel hem in onze Discord, we antwoorden meestal dezelfde dag.",
    ctaTitle: "Benieuwd wat jouw project kost?",
    ctaText: "Vul het offerteformulier in. Je krijgt meestal binnen 24 uur een reactie en daarna een prijs op maat.",
    popular: "Aanrader",
    choose: "Kies {name}",
  },
  en: {
    eyebrow: "Packages",
    title: ["Clear packages, ", "no", " surprises"],
    intro: "What we can do for you per department. Every price is custom: you get a fixed price before we start.",
    note: "Prices on request.",
    included: "Included in every package",
    includedList: ["Fixed price up front", "Your own channel in our Discord", "Code and design become yours", "Bug aftercare after delivery"],
    faqEyebrow: "About pricing and payment",
    faqTitle: "Frequently asked questions",
    faqIntro: "Is your question not listed? Ask it in our Discord, we usually reply the same day.",
    ctaTitle: "Curious what your project costs?",
    ctaText: "Fill in the quote form. You usually hear back within 24 hours, followed by a tailored price.",
    popular: "Recommended",
    choose: "Choose {name}",
  },
};

export default async function PrijzenPage() {
  const [{ locale, content, lp }, calculator] = await Promise.all([getI18n(), getCalculator()]);
  const tx = texts[locale];
  const { packages, gamePackages, mediaPackages, pricingFaq } = getPricing(locale);
  const departments = content.departments;
  const groups = [
    { id: "software", items: packages },
    { id: "game", items: gamePackages },
    { id: "media", items: mediaPackages },
  ] as const;
  return (
    <>
      <FaqSchema items={pricingFaq} />
      <PageHeader
        eyebrow={tx.eyebrow}
        title={<>{tx.title[0]}<span className="text-gradient">{tx.title[1]}</span>{tx.title[2]}</>}
        description={tx.intro}
      >
        <p className="text-sm text-zinc-500">{tx.note}</p>
        <Link href={lp("/samenstellen")} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline">{locale === "en" ? "Or build your own package in 4 steps" : "Of stel zelf je pakket samen in 4 stappen"} →</Link>
      </PageHeader>

      {calculator && <PriceCalculator calculator={calculator} />}

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
                      <Icon className="size-6 text-ink" />
                    </span>
                    {dept.title}
                  </span>
                }
              />
              <Stagger className="grid items-stretch gap-6 lg:grid-cols-3">
                {items.map((pkg) => (
                  <StaggerItem key={pkg.id} className="h-full">
                    <PackageCard pkg={pkg} locale={locale} tx={tx} />
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
              <h2 className="text-2xl font-semibold sm:text-3xl">{tx.included}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tx.includedList.map((item) => (
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
            eyebrow={tx.faqEyebrow}
            title={tx.faqTitle}
            description={tx.faqIntro}
          />
          <FadeUp>
            <FaqAccordion items={pricingFaq} />
          </FadeUp>
        </div>
      </section>

      <CallToAction
        title={tx.ctaTitle}
        description={tx.ctaText}
      />
    </>
  );
}

function PackageCard({ pkg, locale, tx }: { pkg: Package; locale: Locale; tx: (typeof texts)["nl"] }) {
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
          <Sparkles className="size-3" /> {tx.popular}
        </Badge>
      )}
      <h3 className="text-xl font-semibold">{pkg.name}</h3>
      <p className="mt-1 text-sm text-zinc-400">{pkg.tagline}</p>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold text-white">{locale === "en" ? "On request" : "Op aanvraag"}</span>
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
          <Link href={localePath(locale, `/contact?pakket=${pkg.id}`)}>{tx.choose.replace("{name}", pkg.name)}</Link>
        </Button>
      </div>
    </Card>
  );
}
