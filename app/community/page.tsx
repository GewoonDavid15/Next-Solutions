import { Gift, Headphones, MessageSquare, Rocket } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DiscordWidget } from "@/components/sections/DiscordWidget";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCommunityStats } from "@/lib/discord";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return pageMetadata(
    "/community",
    "Community",
    locale === "en"
      ? "Join the Next Solutions Discord: support, showcases, giveaways and a direct line to our team."
      : "Join de Next Solutions Discord: support, showcases, giveaways en directe lijn met ons team.",
  );
}

export const revalidate = 60;

const perks = {
  nl: [
    { icon: Headphones, title: "Snelle support", text: "Tickets worden gemiddeld binnen 15 minuten opgepakt." },
    { icon: Rocket, title: "Sneak peeks", text: "Zie als eerste nieuwe scripts, bots en releases." },
    { icon: Gift, title: "Giveaways", text: "Maandelijkse giveaways van scripts, Nitro en kortingen." },
    { icon: MessageSquare, title: "Netwerk", text: "Connect met developers, designers en server-owners." },
  ],
  en: [
    { icon: Headphones, title: "Fast support", text: "Tickets are picked up within 15 minutes on average." },
    { icon: Rocket, title: "Sneak peeks", text: "Be the first to see new scripts, bots and releases." },
    { icon: Gift, title: "Giveaways", text: "Monthly giveaways of scripts, Nitro and discounts." },
    { icon: MessageSquare, title: "Network", text: "Connect with developers, designers and server owners." },
  ],
};

export default async function CommunityPage() {
  const stats = await getCommunityStats();
  const { locale } = await getI18n();
  const en = locale === "en";

  return (
    <>
      <PageHeader
        eyebrow="Discord Hub"
        title={en ? <>The <span className="text-gradient">community</span> behind Next Solutions</> : <>De <span className="text-gradient">community</span> achter Next Solutions</>}
        description={
          en
            ? "Our Discord is the beating heart of everything we do. Ask questions, share your projects and follow our work live."
            : "Onze Discord is het kloppend hart van alles wat we doen. Stel vragen, deel je projecten en volg ons werk live."
        }
      />

      <section className="pb-12">
        <div className="container grid items-start gap-10 lg:grid-cols-5">
          <FadeUp className="lg:col-span-3">
            <DiscordWidget initial={stats} />
          </FadeUp>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {perks[locale].map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <Card interactive className="flex items-start gap-4 p-5 sm:p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600/15 text-brand-300">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{text}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
