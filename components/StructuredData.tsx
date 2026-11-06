import { site } from "@/lib/site";

/**
 * JSON-LD for search engines. Rendered server-side so crawlers read it
 * without executing any JavaScript.
 */
/** rating: real reviews from the bot. Only added when there are reviews, never made up. */
export function OrganizationSchema({ rating }: { rating?: { average: number; count: number } | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    areaServed: "NL",
    knowsLanguage: ["nl", "en"],
    sameAs: [site.discordInvite, ...Object.values(site.socials)].filter(Boolean),
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Software Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Game Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Media & Branding" } },
    ],
    ...(rating && rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Math.round(rating.average * 10) / 10, reviewCount: rating.count, bestRating: 5, worstRating: 1 } }
      : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FaqSchema({ items }: { items: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
