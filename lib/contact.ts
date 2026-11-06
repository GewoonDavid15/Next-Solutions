export const departmentOptions = [
  { value: "software", label: "Software" },
  { value: "game", label: "Game Development" },
  { value: "media", label: "Media & Social" },
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
    { value: "social", label: "Social Media Management" },
    { value: "content", label: "Content creatie" },
    { value: "strategie", label: "Strategie & groei" },
    { value: "branding", label: "Branding" },
    { value: "uiux", label: "UI/UX Design" },
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

const validationMessages = {
  nl: {
    department: "Kies een afdeling",
    service: "Kies een dienst",
    budget: "Kies een budget",
    timeline: "Kies een planning",
    descriptionShort: "Beschrijf je project in minimaal 20 tekens",
    descriptionLong: "Maximaal 2000 tekens",
    name: "Vul je naam in",
    email: "Vul een geldig e-mailadres in",
    discord: "Ongeldige Discord-naam",
  },
  en: {
    department: "Choose a department",
    service: "Choose a service",
    budget: "Choose a budget",
    timeline: "Choose a timeline",
    descriptionShort: "Describe your project in at least 20 characters",
    descriptionLong: "2000 characters at most",
    name: "Enter your name",
    email: "Enter a valid email address",
    discord: "Invalid Discord name",
  },
};

/** Shared validation used by both the client form and the API route. Returns field → message. */
export function validateStep(step: number, data: QuoteRequest, locale: "nl" | "en" = "nl"): Partial<Record<keyof QuoteRequest, string>> {
  const m = validationMessages[locale];
  const e: Partial<Record<keyof QuoteRequest, string>> = {};
  if (step === 0) {
    if (!departmentOptions.some((o) => o.value === data.department)) e.department = m.department;
    if (!serviceOptions[data.department]?.some((o) => o.value === data.service)) e.service = m.service;
  }
  if (step === 1) {
    if (!budgetOptions.some((o) => o.value === data.budget)) e.budget = m.budget;
    if (!timelineOptions.some((o) => o.value === data.timeline)) e.timeline = m.timeline;
    if (data.description.trim().length < 20) e.description = m.descriptionShort;
    if (data.description.length > 2000) e.description = m.descriptionLong;
  }
  if (step === 2) {
    if (data.name.trim().length < 2) e.name = m.name;
    if (!EMAIL.test(data.email)) e.email = m.email;
    if (data.discord.length > 40) e.discord = m.discord;
  }
  return e;
}

/** Option labels per language (the values are the same in both, so the API validates either). */
const optionLabelsEn: Record<string, string> = {
  "website": "Website / Web app",
  "automation": "Automation",
  "hosting": "Hosting & Management",
  "content": "Content creation",
  "strategie": "Strategy & growth",
  "<250": "Up to €250",
  "250-1000": "€250 – €1,000",
  "1000-5000": "€1,000 – €5,000",
  "5000+": "€5,000+",
  "asap": "As soon as possible",
  "1-month": "Within a month",
  "1-3-months": "1 – 3 months",
  "flexible": "Flexible",
};

const translate = (opts: { value: string; label: string }[]) => opts.map((o) => ({ ...o, label: optionLabelsEn[o.value] ?? o.label }));

export function getQuoteOptions(locale: "nl" | "en") {
  if (locale === "nl") return { departmentOptions, serviceOptions, budgetOptions, timelineOptions };
  return {
    departmentOptions,
    serviceOptions: Object.fromEntries(Object.entries(serviceOptions).map(([k, v]) => [k, translate(v)])),
    budgetOptions: translate(budgetOptions),
    timelineOptions: translate(timelineOptions),
  };
}

export type QuoteOptions = ReturnType<typeof getQuoteOptions>;

export const labelFor = (opts: { value: string; label: string }[], v: string) => opts.find((o) => o.value === v)?.label ?? v;
