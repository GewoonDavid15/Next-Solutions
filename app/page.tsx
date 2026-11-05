import { OrganizationSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { CoreServices } from "@/components/sections/CoreServices";
import { Hero } from "@/components/sections/Hero";
import { LiveStats } from "@/components/sections/LiveStats";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
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
      <LiveStats stats={content.stats} />
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
