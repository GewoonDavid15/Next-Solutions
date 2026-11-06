import { ArrowRight, BarChart3, CalendarCheck, Check, Clapperboard, MessageCircle, Search, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SocialRequestForm } from "@/components/sections/SocialRequestForm";
import { FaqSchema } from "@/components/StructuredData";
import { FaqAccordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InstagramIcon, XIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { getPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/social-media", "Social media management", "We run your Instagram, TikTok, YouTube, LinkedIn, X and Facebook: strategy, content (Reels, TikToks, Shorts) and community management.")
    : pageMetadata("/social-media", "Social media beheer", "Wij runnen je Instagram, TikTok, YouTube, LinkedIn, X en Facebook: strategie, content (Reels, TikToks, Shorts) en community management.");
}

const PLATFORMS = [
  { name: "Instagram", icon: InstagramIcon },
  { name: "TikTok", icon: null },
  { name: "YouTube", icon: YoutubeIcon },
  { name: "LinkedIn", icon: null },
  { name: "X", icon: XIcon },
  { name: "Facebook", icon: null },
];

const texts = {
  nl: {
    eyebrow: "Media & Social",
    title: ["Jouw socials, ", "geregeld", "."],
    intro: "Wij bedenken de strategie, maken de content en beheren je accounts. Jij ziet je merk groeien en houdt tijd over voor de rest.",
    cta: "Laat je accounts bekijken", packagesCta: "Bekijk de pakketten",
    whatEyebrow: "Wat we doen", whatTitle: ["Alles voor je socials op ", "één", " plek"],
    what: [
      { icon: CalendarCheck, title: "Social Media Management", text: "Contentkalender, inplannen en posten, reageren op comments en DM's. Jouw accounts blijven actief, ook als jij geen tijd hebt." },
      { icon: Clapperboard, title: "Content creatie", text: "Reels, TikToks, Shorts, carrousels en posts. Gemonteerd, ondertiteld en afgestemd op elk platform." },
      { icon: TrendingUp, title: "Strategie & groei", text: "Doelgroep, contentpijlers, concurrentie en een plan per platform. We sturen bij op basis van wat werkt." },
    ],
    howEyebrow: "Zo werken we", howTitle: ["Van eerste blik tot ", "groei", ""],
    how: [
      { icon: Search, title: "Kennismaken & analyse", text: "We kijken naar je huidige accounts, doelgroep en concurrenten." },
      { icon: Sparkles, title: "Strategie & plan", text: "Je krijgt een contentplan met pijlers, formats en een planning." },
      { icon: Clapperboard, title: "Content maken", text: "Wij maken de content. Jij keurt de kalender goed voordat er iets online gaat." },
      { icon: MessageCircle, title: "Posten & community", text: "We plannen in, posten en houden je comments en DM's bij (pakketafhankelijk)." },
      { icon: BarChart3, title: "Rapport & bijsturen", text: "Elke maand een rapport: wat werkte, wat niet, en wat we de volgende maand doen." },
    ],
    monthEyebrow: "Elke maand", monthTitle: "Wat je van ons krijgt",
    month: ["Een contentkalender om goed te keuren", "Content die past bij je merk en platform", "Posts die op het juiste moment online gaan", "Een rapport met resultaten en advies", "Direct contact via je eigen ticket in Discord", "Alle voortgang en bestanden in je klantportaal"],
    pkgEyebrow: "Pakketten", pkgTitle: "Kies wat bij je past", pkgNote: "Prijzen op aanvraag, afgestemd op het aantal platformen en de hoeveelheid content.", popular: "Populair", choose: "Aanvragen",
    faqTitle: "Veelgestelde vragen",
    faq: [
      { question: "Op welke platformen werken jullie?", answer: "Instagram, TikTok, YouTube, LinkedIn, X en Facebook. Je kiest zelf met welke je begint." },
      { question: "Moeten jullie mijn wachtwoord hebben?", answer: "Liefst niet. We spreken samen af hoe we toegang krijgen, bijvoorbeeld door ons toe te voegen als beheerder of teamlid via de zakelijke tools van het platform. Zo houd jij altijd de controle." },
      { question: "Gaat er iets online zonder dat ik het heb gezien?", answer: "Nee. Je keurt de contentkalender goed voordat we posten. Wil je bij elke post meekijken, dan spreken we dat af." },
      { question: "Maken jullie ook video's?", answer: "Ja. Reels, TikToks en YouTube Shorts monteren we inclusief ondertiteling. Lever je eigen beeldmateriaal aan, of we bespreken samen wat er nodig is." },
      { question: "Hoe zie ik of het werkt?", answer: "Elke maand krijg je een rapport met de belangrijkste cijfers per platform en ons advies voor de volgende maand. Alles staat ook in je klantportaal." },
      { question: "Kan ik ook alleen losse content laten maken?", answer: "Zeker. Met Content op maat bestel je per opdracht, zonder abonnement." },
    ],
    brandTitle: "Nog geen sterke huisstijl?", brandText: "Social media werkt het best met een herkenbaar merk. We maken ook logo's, huisstijlen en designs.", brandCta: "Bekijk branding",
  },
  en: {
    eyebrow: "Media & Social",
    title: ["Your socials, ", "sorted", "."],
    intro: "We come up with the strategy, create the content and manage your accounts. You watch your brand grow and keep time for everything else.",
    cta: "Let us look at your accounts", packagesCta: "View the packages",
    whatEyebrow: "What we do", whatTitle: ["Everything for your socials in ", "one", " place"],
    what: [
      { icon: CalendarCheck, title: "Social Media Management", text: "Content calendar, scheduling and posting, replying to comments and DMs. Your accounts stay active, even when you're busy." },
      { icon: Clapperboard, title: "Content creation", text: "Reels, TikToks, Shorts, carousels and posts. Edited, subtitled and tailored to every platform." },
      { icon: TrendingUp, title: "Strategy & growth", text: "Audience, content pillars, competitors and a plan per platform. We adjust based on what works." },
    ],
    howEyebrow: "How we work", howTitle: ["From first look to ", "growth", ""],
    how: [
      { icon: Search, title: "Intro & analysis", text: "We look at your current accounts, audience and competitors." },
      { icon: Sparkles, title: "Strategy & plan", text: "You get a content plan with pillars, formats and a schedule." },
      { icon: Clapperboard, title: "Creating content", text: "We create the content. You approve the calendar before anything goes live." },
      { icon: MessageCircle, title: "Posting & community", text: "We schedule, post and keep up with your comments and DMs (depending on the package)." },
      { icon: BarChart3, title: "Report & adjust", text: "A monthly report: what worked, what didn't, and what we'll do next month." },
    ],
    monthEyebrow: "Every month", monthTitle: "What you get from us",
    month: ["A content calendar to approve", "Content that fits your brand and platform", "Posts that go live at the right moment", "A report with results and advice", "Direct contact through your own ticket in Discord", "All progress and files in your client portal"],
    pkgEyebrow: "Packages", pkgTitle: "Pick what suits you", pkgNote: "Prices on request, based on the number of platforms and the amount of content.", popular: "Popular", choose: "Request",
    faqTitle: "Frequently asked questions",
    faq: [
      { question: "Which platforms do you work on?", answer: "Instagram, TikTok, YouTube, LinkedIn, X and Facebook. You choose which ones to start with." },
      { question: "Do you need my password?", answer: "Preferably not. We agree together how we get access, for example by adding us as an admin or team member through the platform's business tools. That way you always stay in control." },
      { question: "Does anything go live without me seeing it?", answer: "No. You approve the content calendar before we post. If you want to review every post, we'll agree on that." },
      { question: "Do you make videos too?", answer: "Yes. We edit Reels, TikToks and YouTube Shorts including subtitles. Send us your own footage, or we'll discuss together what's needed." },
      { question: "How do I see whether it works?", answer: "Every month you get a report with the key numbers per platform and our advice for next month. Everything is also in your client portal." },
      { question: "Can I order standalone content only?", answer: "Of course. With Custom content you order per job, without a subscription." },
    ],
    brandTitle: "No strong brand identity yet?", brandText: "Social media works best with a recognisable brand. We also make logos, brand identities and designs.", brandCta: "View branding",
  },
};

export default async function SocialMediaPage() {
  const { locale, lp } = await getI18n();
  const tx = texts[locale];
  const social = getPricing(locale).mediaPackages.filter((p) => ["social-start", "social-groei", "content"].includes(p.id));

  return (
    <>
      <FaqSchema items={tx.faq} />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-20 size-[560px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="container relative text-center">
          <FadeUp>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-200">{tx.eyebrow}</p>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold tracking-tight sm:text-7xl" style={{ fontStretch: "112%" }}>
              {tx.title[0]}<span className="text-gradient">{tx.title[1]}</span>{tx.title[2]}
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">{tx.intro}</p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><a href="#aanvraag">{tx.cta} <ArrowRight /></a></Button>
              <Button asChild size="lg" variant="secondary"><a href="#pakketten">{tx.packagesCta}</a></Button>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
              {PLATFORMS.map(({ name, icon: Icon }) => (
                <li key={name} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200">
                  {Icon ? <Icon className="size-4" /> : <span className="size-1.5 rounded-full bg-brand-400" />} {name}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      {/* What we do */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={tx.whatEyebrow} title={<>{tx.whatTitle[0]}<span className="text-gradient">{tx.whatTitle[1]}</span>{tx.whatTitle[2]}</>} />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {tx.what.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <Card interactive className="h-full">
                  <span className="grid size-12 place-items-center rounded-2xl border border-brand-500/30 bg-brand-600/15"><Icon className="size-6 text-brand-300" /></span>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-400">{text}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How we work */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={tx.howEyebrow} title={<>{tx.howTitle[0]}<span className="text-gradient">{tx.howTitle[1]}</span>{tx.howTitle[2]}</>} />
          <Stagger className="grid gap-4 md:grid-cols-5">
            {tx.how.map(({ icon: Icon, title, text }, i) => (
              <StaggerItem key={title}>
                <div className="glass relative h-full rounded-3xl p-5">
                  <span className="font-display text-sm text-brand-300">0{i + 1}</span>
                  <Icon className="mt-3 size-6 text-brand-300" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Every month */}
      <section className="section">
        <div className="container max-w-4xl">
          <FadeUp>
            <Card className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">{tx.monthEyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold">{tx.monthTitle}</h2>
              </div>
              <ul className="space-y-3">
                {tx.month.map((m) => <li key={m} className="flex items-start gap-3 text-zinc-200"><Check className="mt-0.5 size-5 shrink-0 text-brand-300" /> {m}</li>)}
              </ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Packages */}
      <section id="pakketten" className="section scroll-mt-28">
        <div className="container">
          <SectionHeading eyebrow={tx.pkgEyebrow} title={tx.pkgTitle} description={tx.pkgNote} />
          <Stagger className="grid items-stretch gap-6 lg:grid-cols-3">
            {social.map((pkg) => (
              <StaggerItem key={pkg.id} className="h-full">
                <div className={cn("glass relative flex h-full flex-col rounded-3xl p-7", pkg.popular && "border-brand-500/50 shadow-glow")}>
                  {pkg.popular && <span className="absolute -top-3 left-7 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-ink">{tx.popular}</span>}
                  <h3 className="font-display text-2xl font-semibold">{pkg.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{pkg.tagline}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {pkg.features.map((f) => <li key={f} className="flex items-start gap-2 text-zinc-200"><Check className="mt-0.5 size-4 shrink-0 text-brand-300" /> {f}</li>)}
                    {pkg.notIncluded?.map((f) => <li key={f} className="flex items-start gap-2 text-zinc-500 line-through decoration-zinc-600">{f}</li>)}
                  </ul>
                  <p className="mt-6 text-xs text-zinc-500">{pkg.delivery}</p>
                  <Button asChild className="mt-4" variant={pkg.popular ? "primary" : "secondary"}><a href="#aanvraag">{tx.choose}</a></Button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Request form */}
      <section id="aanvraag" className="section scroll-mt-28">
        <div className="container max-w-3xl"><FadeUp><SocialRequestForm /></FadeUp></div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading title={tx.faqTitle} />
          <FaqAccordion items={tx.faq} />
        </div>
      </section>

      {/* Branding */}
      <section className="pb-24">
        <div className="container max-w-3xl">
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-brand-500/30 bg-brand-600/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">{tx.brandTitle}</p>
              <p className="mt-1 text-sm text-zinc-300">{tx.brandText}</p>
            </div>
            <Button asChild variant="secondary" size="sm"><Link href={`${lp("/prijzen")}#media`}>{tx.brandCta} <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
