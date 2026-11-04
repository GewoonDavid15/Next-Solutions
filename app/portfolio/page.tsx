import type { Metadata } from "next";
import { CallToAction } from "@/components/sections/CallToAction";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Een selectie van bots, websites en servers die we bouwden voor onze klanten.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={<>Werk waar we <span className="text-gradient">trots</span> op zijn</>}
        description="Van community bots met duizenden gebruikers tot complete game-netwerken. Filter op categorie en ontdek wat we bouwden."
      />
      <section className="pb-12">
        <div className="container">
          <PortfolioGrid />
        </div>
      </section>
      <CallToAction />
    </>
  );
}
