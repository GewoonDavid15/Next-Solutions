import type { Metadata } from "next";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { CrowdCard } from "@/components/live/CrowdCard";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";
import { formatMinutes } from "@/lib/live";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Offerte",
  description: "Vraag in drie stappen een vrijblijvende offerte aan voor Media, Software of Game Development.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  // Live crowd level and response time from the Discord bot (falls back to the static text)
  const live = await getPublicData();
  const tickets = live?.tickets ?? null;
  const responseText = tickets?.reactietijdMs != null ? `Recent ± ${formatMinutes(tickets.reactietijdMs)}` : "Gemiddeld binnen 24 uur";

  const channels = [
    { icon: DiscordIcon, title: "Discord", text: "Open een ticket in onze server", href: site.discordInvite },
    { icon: Mail, title: "E-mail", text: site.email, href: `mailto:${site.email}` },
    { icon: Clock, title: "Reactietijd", text: responseText, href: undefined },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Laten we iets <span className="text-gradient">moois</span> bouwen</>}
        description="Vul het formulier in en ontvang binnen 24 uur een vrijblijvende offerte op maat."
      />
      <section className="pb-12">
        <div className="container grid gap-8 lg:grid-cols-3">
          <FadeUp className="lg:col-span-2">
            <QuoteForm />
          </FadeUp>
          <FadeUp delay={0.15} className="space-y-4">
            {tickets && <CrowdCard tickets={tickets} />}
            {channels.map(({ icon: Icon, title, text, href }) => {
              const content = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600/15 text-brand-300">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-white">{title}</p>
                    <p className="truncate text-sm text-zinc-400">{text}</p>
                  </div>
                </>
              );
              return href ? (
                <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="glass flex items-center gap-4 rounded-3xl p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-glow">
                  {content}
                </a>
              ) : (
                <div key={title} className="glass flex items-center gap-4 rounded-3xl p-5">{content}</div>
              );
            })}
            <div className="glass rounded-3xl p-6">
              <MessageCircle className="size-6 text-brand-400" />
              <p className="mt-3 font-display text-lg text-white">Liever eerst sparren?</p>
              <p className="mt-1 text-sm text-zinc-400">Plan een gratis kennismakingscall van 15 minuten via onze Discord.</p>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
