import { KnowledgeBase } from "@/components/sections/KnowledgeBase";
import { FaqSchema } from "@/components/StructuredData";
import { PageHeader } from "@/components/ui/PageHeader";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { articles } from "@/lib/kennisbank";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/kennisbank", "Knowledge base", "Answers about projects, quotes, payment, tickets, the client portal and our Discord.")
    : pageMetadata("/kennisbank", "Kennisbank", "Antwoorden over projecten, offertes, betalen, tickets, het klantportaal en onze Discord.");
}

export default async function KennisbankPage() {
  const { locale } = await getI18n();
  const en = locale === "en";
  return (
    <>
      <FaqSchema items={articles.map((a) => ({ question: a.titel[locale], answer: a.samenvatting[locale] }))} />
      <PageHeader
        eyebrow={en ? "Knowledge base" : "Kennisbank"}
        title={en ? <>How can we <span className="text-gradient">help</span>?</> : <>Waarmee kunnen we <span className="text-gradient">helpen</span>?</>}
        description={en ? "Everything about working with us: from your first quote to your public profile." : "Alles over samenwerken met ons: van je eerste offerte tot je openbare profiel."}
      />
      <section className="pb-20">
        <div className="container max-w-5xl"><KnowledgeBase /></div>
      </section>
    </>
  );
}
