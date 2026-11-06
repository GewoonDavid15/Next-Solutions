import { ArrowRight, Bot, Code2, Gamepad2, Handshake, MessageSquare, Palette, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicData } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/nexify", "Nexify", "Meet Nexify, the founder and maker behind Next Solutions: software, games and media for communities.")
    : pageMetadata("/nexify", "Nexify", "Maak kennis met Nexify, de oprichter en maker achter Next Solutions: software, games en media voor communities.");
}

export const revalidate = 300;

const texts = {
  nl: {
    eyebrow: "De maker",
    role: "Oprichter van Next Solutions",
    intro: "Ik ben Nexify. Ik bouw Discord bots, websites, game-scripts en designs voor communities, en ik heb Next Solutions opgezet om dat goed, snel en eerlijk te doen.",
    talk: "Praat met me op Discord",
    quote: "Offerte aanvragen",
    builtEyebrow: "Wat ik bouw",
    builtTitle: ["Drie disciplines, ", "één", " aanspreekpunt"],
    builtIntro: "Je project gaat niet van hand tot hand. Ik denk mee, bouw het en lever het op.",
    disciplines: [
      { icon: Code2, title: "Software", text: "Discord bots met dashboards, websites en web-apps, automatisering en koppelingen tussen systemen." },
      { icon: Gamepad2, title: "Game Development", text: "FiveM-scripts, Minecraft-servers en plugins, en systemen die je community langer laten spelen." },
      { icon: Palette, title: "Media", text: "Logo's, huisstijlen, banners en alles wat je server of merk een eigen gezicht geeft." },
    ],
    proofEyebrow: "Zelf gebouwd",
    proofTitle: "Wat je hier ziet, heb ik gemaakt",
    proofText: "Deze website, het klantportaal en de Discord-bot achter onze server zijn van mij. De bot regelt tickets, offertes, verificatie, giveaways, invite-tracking, reviews en meer, en praat live met deze site.",
    proof: ["Website & klantportaal", "Discord-bot met webdashboard", "Tickets, offertes en betalingen in Discord", "Verificatie, giveaways en invite-tracking"],
    howEyebrow: "Hoe ik werk",
    howTitle: ["Afspraken waar je ", "op kunt", " bouwen"],
    how: [
      { icon: MessageSquare, title: "Direct contact", text: "Je praat met mij, in je eigen ticket in onze Discord. Geen tussenpersonen." },
      { icon: Handshake, title: "Eerlijk advies", text: "Past iets niet bij je project of budget, dan zeg ik dat. Ik neem alleen werk aan dat ik goed kan doen." },
      { icon: Zap, title: "Tempo zonder haast", text: "Snel waar het kan, grondig waar het moet. Je volgt de voortgang live in het klantportaal." },
      { icon: ShieldCheck, title: "Netjes opgeleverd", text: "Werkende code, duidelijke uitleg en nazorg. Je weet precies wat je krijgt." },
    ],
    toolkitEyebrow: "Toolkit",
    toolkitTitle: "Waar ik mee werk",
    ctaTitle: "Iets bouwen samen?",
    ctaText: "Vertel me over je idee. Een gesprek kost niets en je hoort snel van me.",
  },
  en: {
    eyebrow: "The maker",
    role: "Founder of Next Solutions",
    intro: "I'm Nexify. I build Discord bots, websites, game scripts and designs for communities, and I started Next Solutions to do that well, fast and honestly.",
    talk: "Talk to me on Discord",
    quote: "Request a quote",
    builtEyebrow: "What I build",
    builtTitle: ["Three disciplines, ", "one", " point of contact"],
    builtIntro: "Your project isn't passed from hand to hand. I think along, build it and deliver it.",
    disciplines: [
      { icon: Code2, title: "Software", text: "Discord bots with dashboards, websites and web apps, automation and integrations between systems." },
      { icon: Gamepad2, title: "Game Development", text: "FiveM scripts, Minecraft servers and plugins, and systems that keep your community playing longer." },
      { icon: Palette, title: "Media", text: "Logos, brand identities, banners and everything that gives your server or brand its own face." },
    ],
    proofEyebrow: "Built myself",
    proofTitle: "What you see here, I made",
    proofText: "This website, the client portal and the Discord bot behind our server are mine. The bot handles tickets, quotes, verification, giveaways, invite tracking, reviews and more, and talks live to this site.",
    proof: ["Website & client portal", "Discord bot with web dashboard", "Tickets, quotes and payments in Discord", "Verification, giveaways and invite tracking"],
    howEyebrow: "How I work",
    howTitle: ["Agreements you can ", "build", " on"],
    how: [
      { icon: MessageSquare, title: "Direct contact", text: "You talk to me, in your own ticket in our Discord. No middlemen." },
      { icon: Handshake, title: "Honest advice", text: "If something doesn't fit your project or budget, I'll tell you. I only take on work I can do well." },
      { icon: Zap, title: "Pace without rush", text: "Fast where possible, thorough where needed. You follow the progress live in the client portal." },
      { icon: ShieldCheck, title: "Delivered properly", text: "Working code, clear explanations and aftercare. You know exactly what you get." },
    ],
    toolkitEyebrow: "Toolkit",
    toolkitTitle: "What I work with",
    ctaTitle: "Build something together?",
    ctaText: "Tell me about your idea. A conversation costs nothing and you'll hear from me soon.",
  },
};

const TOOLKIT = ["discord.js", "Node.js", "TypeScript", "Next.js", "React", "Tailwind CSS", "Lua (FiveM)", "Java (Minecraft)", "REST & webhooks"];

export default async function NexifyPage() {
  const [{ locale, lp }, live] = await Promise.all([getI18n(), getPublicData()]);
  const tx = texts[locale];
  // The founder is the highest role in the team list from the bot; use their Discord avatar when available
  const founder = live?.team?.find((m) => /nexify/i.test(m.naam)) ?? live?.team?.[0] ?? null;

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 size-[520px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="container relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <FadeUp>
              <div className="relative">
                <span aria-hidden className="absolute -inset-3 animate-pulse-glow rounded-[2.25rem] bg-brand-500/20 blur-xl" />
                {founder?.avatar ? (
                  <Image src={founder.avatar} alt="Nexify" width={128} height={128} priority unoptimized className="relative size-32 rounded-[2rem] border border-brand-500/40 object-cover shadow-glow" />
                ) : (
                  <span className="relative grid size-32 place-items-center rounded-[2rem] bg-gradient-to-br from-brand-200 via-brand-500 to-brand-700 font-display text-6xl font-bold text-ink shadow-glow">N</span>
                )}
              </div>
            </FadeUp>
            <FadeUp delay={0.05}>
              <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-200">
                <Sparkles className="size-3.5" /> {tx.eyebrow}
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-5 font-display text-6xl font-bold tracking-tight sm:text-7xl" style={{ fontStretch: "112%" }}>
                <span className="text-gradient">Nexify</span>
              </h1>
              <p className="mt-2 text-lg text-zinc-400">{tx.role}</p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-zinc-300">{tx.intro}</p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild variant="discord" size="lg">
                  <a href={site.discordInvite} target="_blank" rel="noopener noreferrer"><DiscordIcon className="size-5" /> {tx.talk}</a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href={lp("/contact")}>{tx.quote} <ArrowRight /></Link>
                </Button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={tx.builtEyebrow} title={<>{tx.builtTitle[0]}<span className="text-gradient">{tx.builtTitle[1]}</span>{tx.builtTitle[2]}</>} description={tx.builtIntro} />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {tx.disciplines.map(({ icon: Icon, title, text }) => (
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

      <section className="section">
        <div className="container">
          <FadeUp>
            <Card className="grid gap-8 overflow-hidden md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">{tx.proofEyebrow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{tx.proofTitle}</h2>
                <p className="mt-4 leading-relaxed text-zinc-400">{tx.proofText}</p>
              </div>
              <ul className="space-y-3">
                {tx.proof.map((p) => (
                  <li key={p} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <Bot className="size-5 shrink-0 text-brand-300" /> <span className="text-zinc-200">{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow={tx.howEyebrow} title={<>{tx.howTitle[0]}<span className="text-gradient">{tx.howTitle[1]}</span>{tx.howTitle[2]}</>} />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tx.how.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <Card className="h-full">
                  <Icon className="size-6 text-brand-300" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-4xl text-center">
          <SectionHeading eyebrow={tx.toolkitEyebrow} title={tx.toolkitTitle} />
          <FadeUp>
            <ul className="flex flex-wrap justify-center gap-2">
              {TOOLKIT.map((tool) => (
                <li key={tool} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-brand-500/40 hover:text-white">{tool}</li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      <CallToAction title={tx.ctaTitle} description={tx.ctaText} />
    </>
  );
}
