export const departmentOptions = [
  { value: "software", label: "Software" },
  { value: "game", label: "Game Development" },
  { value: "media", label: "Media" },
];

export const serviceOptions: Record<string, { value: string; label: string }[]> = {
  software: [
    { value: "discord-bot", label: "Discord Bot" },
    { value: "website", label: "Website / Web-app" },
    { value: "automation", label: "Automatisering" },
  ],
  game: [
    { value: "fivem", label: "FiveM Script" },
    { value: "minecraft", label: "Minecraft Server" },
    { value: "hosting", label: "Hosting & Beheer" },
  ],
  media: [
    { value: "branding", label: "Branding" },
    { value: "uiux", label: "UI/UX Design" },
    { value: "content", label: "Content & Socials" },
  ],
};

export const budgetOptions = [
  { value: "<250", label: "Tot € 250" },
  { value: "250-1000", label: "€ 250 – € 1.000" },
  { value: "1000-5000", label: "€ 1.000 – € 5.000" },
  { value: "5000+", label: "€ 5.000+" },
];

export const timelineOptions = [
  { value: "asap", label: "Zo snel mogelijk" },
  { value: "1-month", label: "Binnen een maand" },
  { value: "1-3-months", label: "1 – 3 maanden" },
  { value: "flexible", label: "Flexibel" },
];

export interface QuoteRequest {
  department: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  name: string;
  email: string;
  discord: string;
}

export const emptyQuote: QuoteRequest = {
  department: "",
  service: "",
  budget: "",
  timeline: "",
  description: "",
  name: "",
  email: "",
  discord: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared validation used by both the client form and the API route. Returns field → message. */
export function validateStep(step: number, data: QuoteRequest): Partial<Record<keyof QuoteRequest, string>> {
  const e: Partial<Record<keyof QuoteRequest, string>> = {};
  if (step === 0) {
    if (!departmentOptions.some((o) => o.value === data.department)) e.department = "Kies een afdeling";
    if (!serviceOptions[data.department]?.some((o) => o.value === data.service)) e.service = "Kies een dienst";
  }
  if (step === 1) {
    if (!budgetOptions.some((o) => o.value === data.budget)) e.budget = "Kies een budget";
    if (!timelineOptions.some((o) => o.value === data.timeline)) e.timeline = "Kies een planning";
    if (data.description.trim().length < 20) e.description = "Beschrijf je project in minimaal 20 tekens";
    if (data.description.length > 2000) e.description = "Maximaal 2000 tekens";
  }
  if (step === 2) {
    if (data.name.trim().length < 2) e.name = "Vul je naam in";
    if (!EMAIL.test(data.email)) e.email = "Vul een geldig e-mailadres in";
    if (data.discord.length > 40) e.discord = "Ongeldige Discord-naam";
  }
  return e;
}

export const labelFor = (opts: { value: string; label: string }[], v: string) => opts.find((o) => o.value === v)?.label ?? v;
