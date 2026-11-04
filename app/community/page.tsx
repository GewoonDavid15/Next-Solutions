import type { Metadata } from "next";
import { Gift, Headphones, MessageSquare, Rocket } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DiscordWidget } from "@/components/sections/DiscordWidget";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCommunityStats } from "@/lib/discord";

export const metadata: Metadata = {
  title: "Community",
  description: "Join de Next Solutions Discord: support, showcases, giveaways en directe lijn met ons team.",
};

export const revalidate = 60;

const perks = [
  { icon: Headphones, title: "Snelle support", text: "Tickets worden gemiddeld binnen 15 minuten opgepakt." },
  { icon: Rocket, title: "Sneak peeks", text: "Zie als eerste nieuwe scripts, bots en releases." },
  { icon: Gift, title: "Giveaways", text: "Maandelijkse giveaways van scripts, Nitro en kortingen." },
  { icon: MessageSquare, title: "Netwerk", text: "Connect met developers, designers en server-owners." },
];

export default async function CommunityPage() {
  const stats = await getCommunityStats();

  return (
    <>
      <PageHeader
        eyebrow="Discord Hub"
        title={<>De <span className="text-gradient">community</span> achter Next Solutions</>}
        description="Onze Discord is het kloppend hart van alles wat we doen. Stel vragen, deel je projecten en volg ons werk live."
      />

      <section className="pb-12">
        <div className="container grid items-start gap-10 lg:grid-cols-5">
          <FadeUp className="lg:col-span-3">
            <DiscordWidget initial={stats} />
          </FadeUp>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {perks.map(({ icon: Icon, title, text }) => (
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
