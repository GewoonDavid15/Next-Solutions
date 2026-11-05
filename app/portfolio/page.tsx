import { CallToAction } from "@/components/sections/CallToAction";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return pageMetadata(
    "/portfolio",
    "Portfolio",
    locale === "en" ? "A selection of bots, websites and servers we built for our clients." : "Een selectie van bots, websites en servers die we bouwden voor onze klanten.",
  );
}

export default async function PortfolioPage() {
  const { locale, content } = await getI18n();
  const en = locale === "en";
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={en ? <>Work we are <span className="text-gradient">proud</span> of</> : <>Werk waar we <span className="text-gradient">trots</span> op zijn</>}
        description={
          en
            ? "From community bots with thousands of users to complete game networks. Filter by category and discover what we built."
            : "Van community bots met duizenden gebruikers tot complete game-netwerken. Filter op categorie en ontdek wat we bouwden."
        }
      />
      <section className="pb-12">
        <div className="container">
          <PortfolioGrid projects={content.projects} filters={content.projectFilters} />
        </div>
      </section>
      <CallToAction />
    </>
  );
}
