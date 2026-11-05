import { OrganizationSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { CoreServices } from "@/components/sections/CoreServices";
import { Hero } from "@/components/sections/Hero";
import { LiveStats } from "@/components/sections/LiveStats";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { getPublicData } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { Suspense } from "react";

export async function generateMetadata() {
  const { t } = await getI18n();
  return pageMetadata("/", undefined, t.meta.description);
}

export default async function HomePage() {
  const { content } = await getI18n();
  return (
    <>
      <OrganizationSchema />
      <Hero />
      <Suspense fallback={<LiveStats services={content.services.length} uptime={null} />}>
        <LiveStatsWithUptime services={content.services.length} />
      </Suspense>
      <CoreServices />
      <ProcessSection />
      {/* Live reviews from the Discord bot; streamed in so the rest of the page is not delayed */}
      <Suspense fallback={null}>
        <ReviewsSection />
      </Suspense>
      <CallToAction />
    </>
  );
}

/** Average 30-day uptime of the services the bot monitors, or nothing when the bot has no data yet. */
async function LiveStatsWithUptime({ services }: { services: number }) {
  const measured = ((await getPublicData())?.diensten ?? []).map((d) => d.uptime30d).filter((u): u is number => u !== null);
  const uptime = measured.length ? Math.floor((measured.reduce((a, b) => a + b, 0) / measured.length) * 10) / 10 : null;
  return <LiveStats services={services} uptime={uptime} />;
}
