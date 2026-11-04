import {
  Bot,
  Brush,
  Code2,
  Gamepad2,
  Globe,
  LayoutTemplate,
  Megaphone,
  Pickaxe,
  Server,
  Sparkles,
  Car,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type DepartmentId = "software" | "game" | "media";

export interface Department {
  id: DepartmentId;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

export const departments: Department[] = [
  {
    id: "software",
    title: "Software",
    tagline: "Bots, web & automatisering",
    description:
      "Van krachtige Discord bots tot razendsnelle web-apps. Schaalbare code, strak gebouwd met moderne stacks.",
    icon: Code2,
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    id: "game",
    title: "Game Development",
    tagline: "FiveM & Minecraft",
    description:
      "Unieke FiveM scripts en volledig geconfigureerde Minecraft netwerken die spelers vasthouden.",
    icon: Gamepad2,
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "media",
    title: "Media",
    tagline: "Branding & UI/UX",
    description:
      "Een merk dat blijft hangen. Logo's, huisstijlen en interfaces die net zo goed werken als ze eruitzien.",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
];

export interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  department: DepartmentId;
  from: string;
}

export const services: Service[] = [
  {
    title: "Discord Bots",
    description: "Maatwerk bots met moderatie, tickets, economie, dashboards en integraties met je eigen API's.",
    icon: Bot,
    features: ["Slash commands", "Web dashboard", "24/7 hosting", "Database koppeling"],
    department: "software",
    from: "€ 149",
  },
  {
    title: "Websites & Web-apps",
    description: "Snelle, SEO-vriendelijke sites en applicaties gebouwd met Next.js, TypeScript en Tailwind.",
    icon: Globe,
    features: ["Next.js / React", "CMS integratie", "Animaties", "Performance 95+"],
    department: "software",
    from: "€ 499",
  },
  {
    title: "Automatisering",
    description: "Koppel je tools aan elkaar. Webhooks, API's en workflows die je uren werk per week besparen.",
    icon: Workflow,
    features: ["API integraties", "Webhooks", "Cron jobs", "Monitoring"],
    department: "software",
    from: "€ 199",
  },
  {
    title: "FiveM Scripts",
    description: "Geoptimaliseerde ESX/QBCore scripts met strakke NUI-interfaces en 0.00ms idle resmon.",
    icon: Car,
    features: ["ESX & QBCore", "Custom NUI", "Geoptimaliseerd", "Escrow support"],
    department: "game",
    from: "€ 79",
  },
  {
    title: "Minecraft Servers",
    description: "Complete netwerken: setup, plugins, custom configuratie, anti-cheat en performance tuning.",
    icon: Pickaxe,
    features: ["Velocity / Paper", "Custom plugins", "Anti-cheat", "Server tuning"],
    department: "game",
    from: "€ 129",
  },
  {
    title: "Server Hosting & Beheer",
    description: "Beheerde game- en botservers met monitoring, backups en DDoS-bescherming.",
    icon: Server,
    features: ["Daily backups", "DDoS protectie", "99.9% uptime", "Support"],
    department: "game",
    from: "€ 15 /mnd",
  },
  {
    title: "Branding",
    description: "Logo, kleurenpalet, typografie en een complete brand guide voor een consistente uitstraling.",
    icon: Brush,
    features: ["Logo ontwerp", "Brand guide", "Social kit", "Merchandise"],
    department: "media",
    from: "€ 249",
  },
  {
    title: "UI/UX Design",
    description: "Interfaces ontworpen rond je gebruiker, van wireframe tot pixel-perfect Figma prototype.",
    icon: LayoutTemplate,
    features: ["Wireframes", "Figma prototypes", "Design systems", "User testing"],
    department: "media",
    from: "€ 349",
  },
  {
    title: "Content & Socials",
    description: "Trailers, banners, thumbnails en social content die opvallen in elke feed.",
    icon: Megaphone,
    features: ["Trailers", "Thumbnails", "Banners", "Motion graphics"],
    department: "media",
    from: "€ 59",
  },
];

export type ProjectCategory = "bots" | "websites" | "servers";

export interface Project {
  id: number;
  title: string;
  client: string;
  category: ProjectCategory;
  tags: string[];
  /** Relative height for the masonry mockup */
  size: "sm" | "md" | "lg";
  accent: string;
}

export const projectFilters: { id: "all" | ProjectCategory; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "bots", label: "Bots" },
  { id: "websites", label: "Websites" },
  { id: "servers", label: "Servers" },
];

export const projects: Project[] = [
  { id: 1, title: "Aurora Ticket Bot", client: "Aurora RP", category: "bots", tags: ["Discord.js", "Postgres"], size: "md", accent: "from-violet-600 to-indigo-600" },
  { id: 2, title: "Pixel Studio", client: "Pixel Media", category: "websites", tags: ["Next.js", "Framer"], size: "lg", accent: "from-fuchsia-600 to-purple-700" },
  { id: 3, title: "Skyline Network", client: "Skyline MC", category: "servers", tags: ["Velocity", "Paper"], size: "sm", accent: "from-emerald-500 to-teal-600" },
  { id: 4, title: "Nova Economy", client: "Nova Community", category: "bots", tags: ["Python", "Redis"], size: "sm", accent: "from-purple-600 to-pink-600" },
  { id: 5, title: "Velocity Garage", client: "City Life RP", category: "servers", tags: ["FiveM", "QBCore"], size: "lg", accent: "from-orange-500 to-rose-600" },
  { id: 6, title: "Lumen Dashboard", client: "Lumen SaaS", category: "websites", tags: ["React", "tRPC"], size: "md", accent: "from-sky-500 to-indigo-600" },
  { id: 7, title: "Guardian Mod", client: "Esports NL", category: "bots", tags: ["TypeScript", "AI"], size: "lg", accent: "from-violet-500 to-fuchsia-600" },
  { id: 8, title: "Craftopia Survival", client: "Craftopia", category: "servers", tags: ["Spigot", "Custom"], size: "md", accent: "from-lime-500 to-emerald-600" },
  { id: 9, title: "Orbit Landing", client: "Orbit Labs", category: "websites", tags: ["Next.js", "Tailwind"], size: "sm", accent: "from-indigo-500 to-violet-700" },
];

export const stats = [
  { label: "Community leden", value: 4280, suffix: "+" },
  { label: "Projecten opgeleverd", value: 350, suffix: "+" },
  { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
];

export const process = [
  { step: "01", title: "Kennismaking", text: "We bespreken je idee, doelen en budget in onze Discord of via een call." },
  { step: "02", title: "Ontwerp & Plan", text: "Je ontvangt een helder voorstel met planning, mockups en vaste prijs." },
  { step: "03", title: "Bouwen", text: "We bouwen in sprints. Via het klantportaal volg je elke stap live mee." },
  { step: "04", title: "Lancering", text: "Oplevering, deployment en nazorg. We blijven bereikbaar voor support." },
];

export const faq = [
  {
    question: "Hoe lang duurt een gemiddeld project?",
    answer:
      "Een Discord bot of FiveM script staat er meestal binnen één tot twee weken. Een complete website rekenen we op drie tot zes weken, afhankelijk van de omvang en hoe snel we content en feedback ontvangen. Bij de offerte krijg je altijd een concrete planning.",
  },
  {
    question: "Wat kost het precies?",
    answer:
      "Op de dienstenpagina staan richtprijzen per dienst. Na een korte kennismaking krijg je een vaste prijs, zodat je nooit voor verrassingen komt te staan. Grotere projecten splitsen we op in fases met een eigen deelbedrag.",
  },
  {
    question: "Blijf ik eigenaar van de code?",
    answer:
      "Ja. Na de laatste betaling is alle code en het ontwerp van jou, inclusief de repository. Bij FiveM scripts kun je kiezen voor escrow-beveiliging als je het werk zelf gaat doorverkopen.",
  },
  {
    question: "Bieden jullie ook onderhoud aan na de oplevering?",
    answer:
      "Dat kan. Je krijgt standaard dertig dagen nazorg op bugs. Daarna kun je een onderhoudsabonnement afnemen voor updates, monitoring, backups en support via onze Discord.",
  },
  {
    question: "Hoe verloopt de communicatie tijdens het project?",
    answer:
      "Het grootste deel loopt via een eigen kanaal in onze Discord, zodat je ons direct kunt bereiken. In het klantportaal zie je daarnaast de status van je project en je openstaande tickets.",
  },
  {
    question: "Kan ik ook losse onderdelen afnemen?",
    answer:
      "Zeker. Alles is modulair. Wil je alleen een logo, alleen een bot of alleen de hosting, dan regelen we dat. Combineer je meerdere diensten, dan stemmen we het ontwerp op elkaar af.",
  },
];
