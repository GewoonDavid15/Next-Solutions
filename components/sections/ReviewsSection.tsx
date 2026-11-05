import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ReviewCard, Stars } from "@/components/live/ReviewCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicData } from "@/lib/bot-api";
import { getI18n } from "@/lib/i18n/server";
import { decimal } from "@/lib/live";

/** Latest client reviews from the Discord bot. Renders nothing until there are reviews. */
export async function ReviewsSection() {
  const { locale, lp } = await getI18n();
  const en = locale === "en";
  const reviews = (await getPublicData())?.reviews;
  if (!reviews || reviews.recent.length === 0 || reviews.gemiddelde === null) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Reviews"
          title={en ? "What clients say" : "Wat klanten zeggen"}
          description={
            en
              ? `An average of ${decimal(reviews.gemiddelde, 1, "en")} out of 5 stars from ${reviews.aantal} reviews, collected after every ticket and project.`
              : `Gemiddeld ${decimal(reviews.gemiddelde, 1)} van 5 sterren uit ${reviews.aantal} reviews, verzameld na elk ticket en project.`
          }
        />
        <div className="-mt-6 mb-10 flex justify-center">
          <Stars value={reviews.gemiddelde} locale={locale} />
        </div>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {reviews.recent.slice(0, 3).map((r) => (
            <StaggerItem key={r.id}>
              <ReviewCard review={r} locale={locale} />
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8 text-center">
          <Link href={lp("/reviews")} className="inline-flex items-center gap-2 text-sm text-brand-200 hover:text-white">
            {en ? "View all reviews" : "Alle reviews bekijken"} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
