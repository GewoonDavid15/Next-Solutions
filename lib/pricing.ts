import type { DepartmentId } from "@/lib/data";

export interface Package {
  id: string;
  name: string;
  department: DepartmentId;
  price: string;
  period?: string;
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
    price: "€ 349",
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
    price: "€ 1.249",
    tagline: "Onze meestgekozen aanpak voor serieuze projecten.",
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
    price: "Op maat",
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
    price: "€ 129",
    tagline: "Eén FiveM-script of Minecraft-plugin op maat.",
    features: ["Eén resource of plugin", "Eigen interface", "Geoptimaliseerd op performance", "30 dagen nazorg"],
    delivery: "1 tot 2 weken",
  },
  {
    id: "server",
    name: "Serveropzet",
    department: "game",
    price: "€ 899",
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
    price: "€ 49",
    period: "per maand",
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
    price: "€ 249",
    tagline: "Een herkenbaar merkteken, zonder poespas.",
    features: ["3 richtingen om uit te kiezen", "2 feedbackrondes", "Bestanden voor web en print", "Kleurvarianten"],
    delivery: "1 week",
  },
  {
    id: "huisstijl",
    name: "Huisstijl",
    department: "media",
    price: "€ 749",
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
    price: "€ 1.199",
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
    question: "Zijn de prijzen inclusief btw?",
    answer:
      "Nee, alle genoemde bedragen zijn exclusief 21 procent btw. Ben je een zakelijke klant binnen de EU met een geldig btw-nummer, dan verleggen we de btw.",
  },
  {
    question: "Wat als mijn project tussen twee pakketten in valt?",
    answer:
      "Dan maken we een offerte op maat. De pakketten zijn een richtlijn om je een idee van de orde van grootte te geven; we rekenen altijd af op wat je daadwerkelijk nodig hebt.",
  },
  {
    question: "Moet ik vooraf betalen?",
    answer:
      "Bij projecten vanaf duizend euro vragen we vijftig procent aanbetaling, de rest bij oplevering. Kleinere opdrachten factureren we in één keer achteraf.",
  },
  {
    question: "Wat gebeurt er als ik later iets wil toevoegen?",
    answer:
      "Dan bespreken we eerst wat het kost voordat we eraan beginnen. Je komt nooit achteraf voor verrassingen te staan.",
  },
  {
    question: "Zitten er terugkerende kosten aan vast?",
    answer:
      "Alleen als je daarvoor kiest. Hosting en onderhoud zijn losse abonnementen die je maandelijks kunt opzeggen. Een eenmalig project blijft eenmalig.",
  },
  {
    question: "Krijg ik de code in eigendom?",
    answer:
      "Ja. Na de laatste betaling is alles van jou, inclusief de repository. Je zit nergens aan vast en kunt met iedere andere partij verder.",
  },
];

/** Maps a package id from /prijzen to the department the quote form should open on. */
export function departmentForPackage(id: string | undefined): DepartmentId | "" {
  if (!id) return "";
  const all = [...packages, ...gamePackages, ...mediaPackages];
  return all.find((p) => p.id === id)?.department ?? "";
}
