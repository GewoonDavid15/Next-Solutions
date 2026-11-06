import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { checklists } from "@/lib/checklists";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/gratis", "Free checklists", "Practical checklists for your social media, Discord server and website. Free, no newsletter.")
    : pageMetadata("/gratis", "Gratis checklists", "Praktische checklists voor je social media, Discord-server en website. Gratis, zonder nieuwsbrief.");
}

export default async function FreePage() {
  const { locale, lp } = await getI18n();
  const en = locale === "en";
  return (
    <>
      <PageHeader
        eyebrow={en ? "Free" : "Gratis"}
        title={en ? <>Checklists you can <span className="text-gradient">use today</span></> : <>Checklists die je <span className="text-gradient">vandaag nog gebruikt</span></>}
        description={en ? "The same points we check for our own clients. Leave your name and email and we'll send you the link." : "Dezelfde punten die we bij onze eigen klanten nalopen. Laat je naam en e-mail achter en we sturen je de link."}
      />
      <section className="container pb-24">
        <Stagger className="grid gap-6 md:grid-cols-3">
          {checklists.map((c) => (
            <StaggerItem key={c.slug}>
              <Link href={lp(`/gratis/${c.slug}`)} className="group block h-full">
                <Card className="flex h-full flex-col p-6 transition group-hover:border-brand-500/40">
                  <span className="text-4xl" aria-hidden>{c.emoji}</span>
                  <h2 className="mt-4 text-xl font-semibold">{c.title[locale]}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{c.intro[locale]}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                    {en ? "Get the checklist" : "Download de checklist"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
