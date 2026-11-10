import { PackageBuilder } from "@/components/sections/PackageBuilder";
import { PageHeader } from "@/components/ui/PageHeader";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/samenstellen", "Build your package", "Put together what you need in four steps and receive a tailored proposal.")
    : pageMetadata("/samenstellen", "Stel je pakket samen", "Stel in vier stappen samen wat je nodig hebt en ontvang een voorstel op maat.");
}

export default async function BuilderPage() {
  const { locale } = await getI18n();
  const en = locale === "en";
  return (
    <>
      <PageHeader
        eyebrow={en ? "Package builder" : "Pakket samenstellen"}
        title={en ? <>Build <span className="text-gradient">your package</span></> : <>Stel <span className="text-gradient">je pakket</span> samen</>}
        description={en ? "Choose what you need in four steps. You'll receive a tailored proposal with a fixed price, no obligation." : "Kies in vier stappen wat je nodig hebt. Je krijgt een voorstel op maat met een vaste prijs, zonder verplichtingen."}
      />
      <section className="container max-w-3xl pb-24"><PackageBuilder /></section>
    </>
  );
}
