import { faq } from "@/lib/data";
import { site } from "@/lib/site";

/**
 * JSON-LD for search engines. Rendered server-side so crawlers read it
 * without executing any JavaScript.
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    areaServed: "NL",
    knowsLanguage: ["nl", "en"],
    sameAs: [site.discordInvite],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Software Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Game Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Media & Branding" } },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FaqSchema({ items = faq }: { items?: { question: string; answer: string }[] } = {}) {
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
