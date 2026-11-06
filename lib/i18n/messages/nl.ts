/**
 * Shared interface texts (navigation, footer, buttons). Texts used by one component only live
 * next to that component as a `{ nl, en }` object. Placeholders like {name} are filled by fmt().
 */
export const nl = {
  meta: {
    title: "Next Solutions — Media, Software & Game Development",
    description:
      "Next Solutions is een digital agency voor social media, software en game development. Social media beheer, content, Discord bots, websites, FiveM scripts, Minecraft servers en branding.",
  },
  skipLink: "Naar inhoud",
  nav: {
    aria: "Hoofdnavigatie",
    links: { "/": "Home", "/diensten": "Diensten", "/prijzen": "Pakketten", "/over-ons": "Over ons", "/nieuws": "Nieuws", "/portfolio": "Portfolio", "/community": "Community", "/klantportaal": "Klantportaal", "/contact": "Contact", "/social-media": "Social media", "/nexify": "Nexify", "/kennisbank": "Kennisbank", "/team": "Team", "/reviews": "Reviews", "/vacatures": "Vacatures", "/status": "Status", "/gratis": "Gratis checklists", "/vergelijk": "Zelf doen of uitbesteden?" } as Record<string, string>,
    more: "Meer",
    portal: "Klantportaal",
    descriptions: { "/over-ons": "Ons verhaal en waar we voor staan", "/nexify": "De oprichter en maker", "/kennisbank": "Antwoorden op je vragen", "/team": "Wie je spreekt", "/reviews": "Wat klanten zeggen", "/nieuws": "Updates en artikelen", "/vacatures": "Werken bij Next Solutions", "/status": "Live status van onze diensten", "/portfolio": "Ons werk" } as Record<string, string>,
    quote: "Offerte aanvragen",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    language: "Taal",
    switchTo: "Switch to English",
  },
  footer: {
    tagline: "Digital agency voor Media, Software en Game Development. Wij bouwen de digitale ervaringen van morgen.",
    sitelinks: "Sitelinks",
    services: "Diensten",
    socials: "Socials",
    extra: { team: "Team", reviews: "Reviews", vacatures: "Vacatures", status: "Status" },
    rights: "Alle rechten voorbehouden.",
    privacy: "Privacy",
    terms: "Voorwaarden",
  },
  cta: {
    titleBefore: "Klaar om iets ",
    titleHighlight: "next-level",
    titleAfter: " te bouwen?",
    description: "Vertel ons over je idee. Je krijgt meestal binnen 24 uur een reactie in je inbox of Discord DM.",
    quote: "Offerte aanvragen",
    discord: "Praat met ons op Discord",
  },
};

export type Messages = typeof nl;
