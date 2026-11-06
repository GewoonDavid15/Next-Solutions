import { ArrowLeft, ArrowRight, Check, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/live/ReviewCard";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { FaqSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { FaqAccordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicData } from "@/lib/bot-api";
import { servicePageBySlug, servicePages } from "@/lib/dienst-paginas";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { getPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale, content }] = await Promise.all([params, getI18n()]);
  const found = servicePageBySlug(slug);
  if (!found) return {};
  const service = content.services[found.index];
  return pageMetadata(`/diensten/${slug}`, service.title, found.page.intro[locale]);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale, content, lp }, live] = await Promise.all([params, getI18n(), getPublicData()]);
  const found = servicePageBySlug(slug);
  if (!found) notFound();
  const { page, index } = found;
  const en = locale === "en";
  const service = content.services[index];
  const dept = content.departments.find((d) => d.id === service.department)!;
  const Icon = service.icon;
  const pricing = getPricing(locale);
  const packages = (service.department === "software" ? pricing.packages : service.department === "game" ? pricing.gamePackages : pricing.mediaPackages).slice(0, 3);
  const reviews = (live?.reviews?.recent ?? []).filter((r) => page.woorden.some((w) => `${r.context ?? ""} ${r.tekst ?? ""}`.toLowerCase().includes(w))).slice(0, 3);
  const related = servicePages.map((p, i) => ({ p, s: content.services[i] })).filter(({ s, p }) => s.department === service.department && p.slug !== slug);
  const contactHref = page.contact === "social" || page.contact === "content" || page.contact === "strategie" ? lp("/social-media") + "#aanvraag" : `${lp("/contact")}?afdeling=${service.department}&dienst=${page.contact}`;
  const faq = page.faq[locale];

  return (
    <>
      <FaqSchema items={faq} />
      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 size-[480px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="container relative max-w-4xl">
          <Link href={lp("/diensten")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> {en ? "All services" : "Alle diensten"}</Link>
          <FadeUp>
            <div className="mt-8 flex items-center gap-4">
              <span className={cn("grid size-14 place-items-center rounded-2xl bg-gradient-to-br shadow-glow", dept.gradient)}><Icon className="size-7 text-ink" /></span>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">{dept.title}</p>
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-tight sm:text-6xl" style={{ fontStretch: "112%" }}>{service.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">{page.intro[locale]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href={contactHref}>{en ? "Request a quote" : "Offerte aanvragen"} <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="secondary"><Link href={`${lp("/prijzen")}#${service.department}`}>{en ? "View packages" : "Bekijk pakketten"}</Link></Button>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="section">
        <div className="container grid max-w-5xl gap-6 md:grid-cols-2">
          <FadeUp>
            <Card className="h-full">
              <h2 className="text-xl font-semibold">{en ? "What you get" : "Wat je krijgt"}</h2>
              <ul className="mt-4 space-y-3">{service.features.map((f) => <li key={f} className="flex items-start gap-3 text-zinc-200"><Check className="mt-0.5 size-5 shrink-0 text-brand-300" /> {f}</li>)}</ul>
              <p className="mt-4 text-sm text-zinc-400">{service.description}</p>
            </Card>
          </FadeUp>
          <FadeUp delay={0.05}>
            <Card className="h-full">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Users className="size-5 text-brand-300" /> {en ? "Who it's for" : "Voor wie"}</h2>
              <ul className="mt-4 space-y-3">{page.voorWie[locale].map((f) => <li key={f} className="flex items-start gap-3 text-zinc-200"><Check className="mt-0.5 size-5 shrink-0 text-brand-300" /> {f}</li>)}</ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section">
          <div className="container max-w-5xl">
            <SectionHeading eyebrow="Reviews" title={en ? "What clients say" : "Wat klanten zeggen"} />
            <Stagger className="grid gap-6 md:grid-cols-3">{reviews.map((r) => <StaggerItem key={r.id}><ReviewCard review={r} locale={locale} /></StaggerItem>)}</Stagger>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container max-w-5xl">
          <SectionHeading eyebrow={en ? "Packages" : "Pakketten"} title={en ? `${dept.title}: pick your package` : `${dept.title}: kies je pakket`} description={en ? "Prices on request. Every quote is tailored." : "Prijzen op aanvraag. Elke offerte is op maat."} />
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((p) => (
              <Card key={p.id} className={cn("h-full", p.popular && "border-brand-500/50")}>
                <p className="font-display text-xl font-semibold">{p.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{p.tagline}</p>
                <ul className="mt-4 space-y-2 text-sm">{p.features.slice(0, 4).map((f) => <li key={f} className="flex items-start gap-2 text-zinc-300"><Check className="mt-0.5 size-4 shrink-0 text-brand-300" /> {f}</li>)}</ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow={en ? "Questions" : "Vragen"} title={en ? "Good to know" : "Goed om te weten"} />
          <FaqAccordion items={faq} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-8">
          <div className="container max-w-5xl">
            <h2 className="text-lg font-semibold">{en ? `More in ${dept.title}` : `Meer in ${dept.title}`}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map(({ p, s }) => <Link key={p.slug} href={lp(`/diensten/${p.slug}`)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-brand-500/40 hover:text-white">{s.title}</Link>)}
            </div>
          </div>
        </section>
      )}

      <CallToAction />
    </>
  );
}
