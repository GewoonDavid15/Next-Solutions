import { OrganizationSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { CoreServices } from "@/components/sections/CoreServices";
import { Hero } from "@/components/sections/Hero";
import { LiveStats } from "@/components/sections/LiveStats";
import { ProcessSection } from "@/components/sections/ProcessSection";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <Hero />
      <LiveStats />
      <CoreServices />
      <ProcessSection />
      <CallToAction />
    </>
  );
}
