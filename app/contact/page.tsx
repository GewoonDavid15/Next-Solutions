import { Clock, Mail, MessageCircle } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { CrowdCard } from "@/components/live/CrowdCard";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";
import { formatMinutes } from "@/lib/live";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { departmentForPackage } from "@/lib/pricing";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/contact", "Contact & Quote", "Request a no-obligation quote for Media, Software or Game Development in three steps.")
    : pageMetadata("/contact", "Contact & Offerte", "Vraag in drie stappen een vrijblijvende offerte aan voor Media, Software of Game Development.");
}

export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ pakket?: string; afdeling?: string; dienst?: string; indicatie?: string; spoed?: string }> }) {
  // Arriving from a package on /prijzen preselects the matching department.
  // Arriving from a service on /diensten does the same.
  const { pakket, afdeling, dienst, indicatie, spoed } = await searchParams;
  const initialDepartment = departmentForPackage(pakket) || (["software", "game", "media"].includes(afdeling ?? "") ? afdeling! : "");

  // Live crowd level and response time from the Discord bot (falls back to the static text)
  const live = await getPublicData();
  const { locale } = await getI18n();
  const en = locale === "en";
  const tickets = live?.tickets ?? null;
  const responseText =
    tickets?.reactietijdMs != null ? `Recent ± ${formatMinutes(tickets.reactietijdMs, locale)}` : en ? "Usually within 24 hours" : "Meestal binnen 24 uur";

  const channels = [
    { icon: DiscordIcon, title: "Discord", text: en ? "Open a ticket in our server" : "Open een ticket in onze server", href: site.discordInvite },
    { icon: Mail, title: en ? "Email" : "E-mail", text: site.email, href: `mailto:${site.email}` },
    { icon: Clock, title: en ? "Response time" : "Reactietijd", text: responseText, href: undefined },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={en ? <>Let&apos;s build something <span className="text-gradient">great</span></> : <>Laten we iets <span className="text-gradient">moois</span> bouwen</>}
        description={en ? "Fill in the form. You usually hear back within 24 hours, followed by a tailored, no-obligation quote." : "Vul het formulier in. Je krijgt meestal binnen 24 uur een reactie, en daarna een vrijblijvende offerte op maat."}
      />
      <section className="pb-12">
        <div className="container grid gap-8 lg:grid-cols-3">
          <FadeUp className="lg:col-span-2">
            <QuoteForm
              initialDepartment={initialDepartment}
              initialService={typeof dienst === "string" ? dienst.slice(0, 40) : ""}
              estimate={typeof indicatie === "string" ? indicatie.slice(0, 160) : ""}
              rush={spoed === "1"}
            />
          </FadeUp>
          <FadeUp delay={0.15} className="space-y-4">
            {tickets && <CrowdCard tickets={tickets} locale={locale} />}
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
              <p className="mt-3 font-display text-lg text-white">{en ? "Prefer to talk first?" : "Liever eerst sparren?"}</p>
              <p className="mt-1 text-sm text-zinc-400">{en ? "Book a free 15-minute introduction call through our Discord." : "Plan een gratis kennismakingscall van 15 minuten via onze Discord."}</p>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
