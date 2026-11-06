"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Typewriter } from "@/components/motion/Typewriter";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { site } from "@/lib/site";
import { HeroBackground } from "./HeroBackground";

const ease = [0.22, 1, 0.36, 1] as const;

const texts = {
  nl: {
    badge: "Nu beschikbaar voor nieuwe projecten",
    heading: "Wij bouwen",
    words: ["Discord Bots.", "Websites.", "Social Media.", "FiveM Scripts.", "Content.", "Merken."],
    intro: ["Next Solutions is jouw partner in ", ", ", " en ", ". Van idee tot lancering — strak ontworpen, razendsnel gebouwd."],
    start: "Start je project",
    discord: "Join onze Discord",
    scroll: "Scroll naar diensten",
  },
  en: {
    badge: "Now available for new projects",
    heading: "We build",
    words: ["Discord Bots.", "Websites.", "Social Media.", "FiveM Scripts.", "Content.", "Brands."],
    intro: ["Next Solutions is your partner in ", ", ", " and ", ". From idea to launch — sharply designed, built at lightning speed."],
    start: "Start your project",
    discord: "Join our Discord",
    scroll: "Scroll to services",
  },
};

export function Hero() {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32">
      <HeroBackground />

      <div className="container relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-sm text-brand-200 backdrop-blur"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {tx.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
        >
          {tx.heading}
          <br />
          <Typewriter key={locale} words={tx.words} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-xl"
        >
          {tx.intro[0]}<span className="text-white">Media</span>{tx.intro[1]}
          <span className="text-white">Software</span>{tx.intro[2]}<span className="text-white">Game Development</span>{tx.intro[3]}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Button asChild size="lg">
            <Link href={lp("/contact")}>
              {tx.start} <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={site.discordInvite} target="_blank" rel="noopener noreferrer">
              <DiscordIcon className="size-5" /> {tx.discord}
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.a
        href="#diensten"
        aria-label={tx.scroll}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-white"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="size-7" />
      </motion.a>
    </section>
  );
}
