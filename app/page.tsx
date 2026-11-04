import { OrganizationSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { CoreServices } from "@/components/sections/CoreServices";
import { Hero } from "@/components/sections/Hero";
import { LiveStats } from "@/components/sections/LiveStats";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <Hero />
      <LiveStats />
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
