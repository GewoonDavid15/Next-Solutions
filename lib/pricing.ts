import type { DepartmentId } from "@/lib/data";

export interface Package {
  id: string;
  name: string;
  department: DepartmentId;
  tagline: string;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  delivery: string;
}

export const packages: Package[] = [
  {
    id: "starter",
    name: "Starter",
    department: "software",
    tagline: "Voor wie klein begint met één duidelijke wens.",
    features: [
      "Eén Discord bot of eenvoudige landingspagina",
      "Tot 5 commando's of 3 secties",
      "Basis huisstijl toegepast",
      "30 dagen nazorg op bugs",
    ],
    notIncluded: ["Eigen dashboard", "Databasekoppeling"],
    delivery: "1 tot 2 weken",
  },
  {
    id: "professional",
    name: "Professional",
    department: "software",
    tagline: "Onze aanrader voor serieuze projecten.",
    features: [
      "Bot of website op maat, volledig eigen ontwerp",
      "Databasekoppeling en web dashboard",
      "Koppelingen met je bestaande tools",
      "Eigen kanaal in onze Discord",
      "60 dagen nazorg",
    ],
    popular: true,
    delivery: "3 tot 5 weken",
  },
  {
    id: "complete",
    name: "Compleet",
    department: "software",
    tagline: "Meerdere onderdelen die op elkaar aansluiten.",
    features: [
      "Alles uit Professional",
      "Meerdere diensten gecombineerd",
      "Branding en UI/UX inbegrepen",
      "Hosting en beheer het eerste jaar",
      "Vaste contactpersoon",
      "90 dagen nazorg",
    ],
    delivery: "In fases, in overleg",
  },
];

export const gamePackages: Package[] = [
  {
    id: "script",
    name: "Los script",
    department: "game",
    tagline: "Eén FiveM-script of Minecraft-plugin op maat.",
    features: ["Eén resource of plugin", "Eigen interface", "Geoptimaliseerd op performance", "30 dagen nazorg"],
    delivery: "1 tot 2 weken",
  },
  {
    id: "server",
    name: "Serveropzet",
    department: "game",
    tagline: "Een complete server die klaar is voor spelers.",
    features: [
      "Volledige installatie en configuratie",
      "Tot 5 scripts of plugins op maat",
      "Anti-cheat en performance tuning",
      "Overdracht met documentatie",
      "60 dagen nazorg",
    ],
    popular: true,
    delivery: "3 tot 6 weken",
  },
  {
    id: "hosting",
    name: "Hosting & beheer",
    department: "game",
    tagline: "Wij houden je server draaiend, jij richt je op je community.",
    features: [
      "Beheerde hosting met DDoS-bescherming",
      "Dagelijkse back-ups",
      "Updates en monitoring",
      "Support via Discord",
      "Maandelijks opzegbaar",
    ],
    delivery: "Binnen 48 uur actief",
  },
];

export const mediaPackages: Package[] = [
  {
    id: "logo",
    name: "Logo",
    department: "media",
    tagline: "Een herkenbaar merkteken, zonder poespas.",
    features: ["3 richtingen om uit te kiezen", "2 feedbackrondes", "Bestanden voor web en print", "Kleurvarianten"],
    delivery: "1 week",
  },
  {
    id: "huisstijl",
    name: "Huisstijl",
    department: "media",
    tagline: "Alles wat je nodig hebt om consistent voor de dag te komen.",
    features: [
      "Logo met alle varianten",
      "Kleurenpalet en typografie",
      "Brand guide als pdf",
      "Social media kit",
      "Discord-server styling",
    ],
    popular: true,
    delivery: "2 tot 3 weken",
  },
  {
    id: "uiux",
    name: "UI/UX ontwerp",
    department: "media",
    tagline: "Een doordacht ontwerp voordat er een regel code wordt geschreven.",
    features: [
      "Gebruikersonderzoek en wireframes",
      "Klikbaar prototype in Figma",
      "Design system met componenten",
      "Overdracht aan je developers",
    ],
    delivery: "3 tot 4 weken",
  },
];

export const pricingFaq = [
  {
    question: "Waarom staan er geen prijzen bij de pakketten?",
    answer:
      "Geen project is hetzelfde. Een bot met vijf commando's is iets anders dan een bot met een eigen dashboard en database. Daarom maken we voor elk project een prijs op maat, in plaats van een bedrag te noemen dat in de praktijk toch niet klopt.",
  },
  {
    question: "Hoe kom ik aan een prijs?",
    answer:
      "Vul het offerteformulier in of open een ticket in onze Discord. Je krijgt meestal binnen 24 uur een reactie, en na een korte kennismaking een vaste prijs met planning.",
  },
  {
    question: "Wat als mijn project tussen twee pakketten in valt?",
    answer:
      "Geen probleem. De pakketten laten zien wat we doen en hoe groot een project ongeveer is. We rekenen altijd af op wat je echt nodig hebt.",
  },
  {
    question: "Hoe en wanneer betaal ik?",
    answer:
      "Je betaalt de volledige prijs in één keer via Discord, op het moment dat in je offerte staat. Er is geen aanbetaling en er zijn geen deelbetalingen.",
  },
  {
    question: "Wat gebeurt er als ik later iets wil toevoegen?",
    answer:
      "Dan bespreken we eerst wat het kost voordat we eraan beginnen. Je komt nooit achteraf voor verrassingen te staan.",
  },
  {
    question: "Krijg ik de code in eigendom?",
    answer:
      "Ja. Zodra je hebt betaald is alles van jou, inclusief de repository. Je zit nergens aan vast en kunt met iedere andere partij verder.",
  },
];

/** Maps a package id from /prijzen to the department the quote form should open on. */
export function departmentForPackage(id: string | undefined): DepartmentId | "" {
  if (!id) return "";
  const all = [...packages, ...gamePackages, ...mediaPackages];
  return all.find((p) => p.id === id)?.department ?? "";
}

// ── English ──────────────────────────────────────────────────────────────────
// Only the words; ids, departments and the "popular" flag are shared with the Dutch packages.
type PackageText = Pick<Package, "tagline" | "features" | "delivery"> & Partial<Pick<Package, "name" | "notIncluded">>;

const packagesEn: Record<string, PackageText> = {
  starter: {
    tagline: "For those starting small with one clear wish.",
    features: ["One Discord bot or simple landing page", "Up to 5 commands or 3 sections", "Basic brand styling applied", "30 days of bug aftercare"],
    notIncluded: ["Own dashboard", "Database integration"],
    delivery: "1 to 2 weeks",
  },
  professional: {
    tagline: "Our recommendation for serious projects.",
    features: ["Custom bot or website, fully own design", "Database integration and web dashboard", "Integrations with your existing tools", "Your own channel in our Discord", "60 days of aftercare"],
    delivery: "3 to 5 weeks",
  },
  complete: {
    name: "Complete",
    tagline: "Several parts that fit together.",
    features: ["Everything in Professional", "Several services combined", "Branding and UI/UX included", "Hosting and management for the first year", "Dedicated contact person", "90 days of aftercare"],
    delivery: "In phases, by agreement",
  },
  script: {
    name: "Single script",
    tagline: "One custom FiveM script or Minecraft plugin.",
    features: ["One resource or plugin", "Custom interface", "Optimised for performance", "30 days of aftercare"],
    delivery: "1 to 2 weeks",
  },
  server: {
    name: "Server setup",
    tagline: "A complete server, ready for players.",
    features: ["Full installation and configuration", "Up to 5 custom scripts or plugins", "Anti-cheat and performance tuning", "Handover with documentation", "60 days of aftercare"],
    delivery: "3 to 6 weeks",
  },
  hosting: {
    name: "Hosting & management",
    tagline: "We keep your server running, you focus on your community.",
    features: ["Managed hosting with DDoS protection", "Daily backups", "Updates and monitoring", "Support via Discord", "Cancel monthly"],
    delivery: "Live within 48 hours",
  },
  logo: {
    tagline: "A recognisable mark, without the fuss.",
    features: ["3 directions to choose from", "2 feedback rounds", "Files for web and print", "Colour variants"],
    delivery: "1 week",
  },
  huisstijl: {
    name: "Brand identity",
    tagline: "Everything you need to show up consistently.",
    features: ["Logo with all variants", "Colour palette and typography", "Brand guide as PDF", "Social media kit", "Discord server styling"],
    delivery: "2 to 3 weeks",
  },
  uiux: {
    name: "UI/UX design",
    tagline: "A well thought-out design before a single line of code is written.",
    features: ["User research and wireframes", "Clickable prototype in Figma", "Design system with components", "Handover to your developers"],
    delivery: "3 to 4 weeks",
  },
};

const pricingFaqEn = [
  {
    question: "Why are there no prices on the packages?",
    answer:
      "No two projects are the same. A bot with five commands is different from a bot with its own dashboard and database. So we make a custom price for every project, instead of naming an amount that wouldn't be right in practice.",
  },
  {
    question: "How do I get a price?",
    answer:
      "Fill in the quote form or open a ticket in our Discord. You usually hear back within 24 hours, and after a short introduction you get a fixed price with a schedule.",
  },
  {
    question: "What if my project falls between two packages?",
    answer: "No problem. The packages show what we do and roughly how big a project is. We always charge for what you actually need.",
  },
  {
    question: "How and when do I pay?",
    answer: "You pay the full price in one go through Discord, at the moment stated in your quote. There is no deposit and there are no instalments.",
  },
  {
    question: "What if I want to add something later?",
    answer: "Then we first discuss what it costs before we start. You will never face surprises afterwards.",
  },
  {
    question: "Do I own the code?",
    answer: "Yes. Once you have paid, everything is yours, including the repository. You're not tied to anything and can continue with any other party.",
  },
];

/** Packages and pricing FAQ in the requested language. */
export function getPricing(locale: "nl" | "en") {
  if (locale === "nl") return { packages, gamePackages, mediaPackages, pricingFaq };
  const tr = (list: Package[]) => list.map((p) => ({ ...p, ...packagesEn[p.id] }));
  return { packages: tr(packages), gamePackages: tr(gamePackages), mediaPackages: tr(mediaPackages), pricingFaq: pricingFaqEn };
}
