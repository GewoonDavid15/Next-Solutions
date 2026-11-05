import type { Locale } from "@/lib/i18n/config";
import { departmentsEn, faqEn, processEn, projectFiltersEn, projectsEn, resultValuesEn, servicesEn, statsEn, timelineEn, valuesEn } from "@/lib/content-en";
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
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  tags: string[];
  /** Relative height for the masonry mockup */
  size: "sm" | "md" | "lg";
  accent: string;
  /** Case study content for /portfolio/[slug] */
  year: number;
  duration: string;
  summary: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string }[];
  stack: string[];
}

export const projectFilters: { id: "all" | ProjectCategory; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "bots", label: "Bots" },
  { id: "websites", label: "Websites" },
  { id: "servers", label: "Servers" },
];

export const projects: Project[] = [
  {
    id: 1,
    slug: "aurora-ticket-bot",
    title: "Aurora Ticket Bot",
    client: "Aurora RP",
    category: "bots",
    tags: ["Discord.js", "Postgres"],
    size: "md",
    accent: "from-violet-600 to-indigo-600",
    year: 2026,
    duration: "3 weken",
    summary:
      "Een ticketsysteem waarmee een roleplay-community van duizenden leden support afhandelt zonder het overzicht te verliezen.",
    challenge:
      "Supportvragen kwamen binnen via DM's en losse kanalen. Niets was terug te vinden, meerdere staffleden werkten langs elkaar heen en er was geen zicht op hoe lang iemand op antwoord wachtte.",
    solution:
      "Een bot die per vraag een eigen kanaal opent met de juiste rollen, categorieën en een transcript bij sluiting. Staff ziet in een dashboard de wachttijden, en terugkerende vragen worden afgevangen met knoppen in plaats van tekst.",
    results: [
      { label: "Gemiddelde reactietijd", value: "15 min" },
      { label: "Tickets per maand", value: "900+" },
      { label: "Handmatig werk", value: "-60%" },
    ],
    stack: ["Discord.js", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: 2,
    slug: "pixel-studio",
    title: "Pixel Studio",
    client: "Pixel Media",
    category: "websites",
    tags: ["Next.js", "Framer"],
    size: "lg",
    accent: "from-fuchsia-600 to-purple-700",
    year: 2026,
    duration: "5 weken",
    summary:
      "Portfoliosite voor een mediastudio, waarin het werk zelf de hoofdrol speelt in plaats van de tekst eromheen.",
    challenge:
      "De oude site was een trage pagina-bouwer vol plugins. Laden duurde seconden, beheer was omslachtig en op mobiel viel de opmaak uit elkaar.",
    solution:
      "Een nieuwe site in Next.js met een headless CMS, zodat de studio zelf cases toevoegt. Beelden worden automatisch geoptimaliseerd en animaties zijn bewust licht gehouden, zodat het werk opvalt en niet de effecten.",
    results: [
      { label: "Lighthouse performance", value: "98" },
      { label: "Laadtijd", value: "0,8 s" },
      { label: "Aanvragen", value: "+40%" },
    ],
    stack: ["Next.js", "Tailwind CSS", "Framer Motion", "Sanity"],
  },
  {
    id: 3,
    slug: "skyline-network",
    title: "Skyline Network",
    client: "Skyline MC",
    category: "servers",
    tags: ["Velocity", "Paper"],
    size: "sm",
    accent: "from-emerald-500 to-teal-600",
    year: 2025,
    duration: "4 weken",
    summary:
      "Een Minecraft-netwerk waarin spelers tussen gamemodes springen zonder ooit een verbinding te verliezen.",
    challenge:
      "Losse servers betekenden losse werelden: spelers moesten opnieuw inloggen, ranks en balansen liepen uiteen en bij meer dan honderd spelers liep de tickrate onderuit.",
    solution:
      "Een Velocity-proxy voor de hele vloot, met gedeelde data in een centrale database en een eigen plugin die ranks en economie synchroniseert. Daarnaast tuning van de Paper-configuratie en een anti-cheat die op elke backend meeluistert.",
    results: [
      { label: "Tickrate bij piek", value: "20 TPS" },
      { label: "Gelijktijdige spelers", value: "450" },
      { label: "Uptime", value: "99,9%" },
    ],
    stack: ["Velocity", "Paper", "Java", "Redis", "MariaDB"],
  },
  {
    id: 4,
    slug: "nova-economy",
    title: "Nova Economy",
    client: "Nova Community",
    category: "bots",
    tags: ["Python", "Redis"],
    size: "sm",
    accent: "from-purple-600 to-pink-600",
    year: 2025,
    duration: "2 weken",
    summary:
      "Een economiebot die een community actief houdt met dagelijkse beloningen, een winkel en een ranglijst.",
    challenge:
      "De server was stil buiten events om. Er was geen reden om dagelijks terug te komen en geen manier om actieve leden te belonen.",
    solution:
      "Een bot met valuta, dagelijkse streaks, een winkel voor rollen en kleuren, en seizoensgebonden ranglijsten. Alle saldi draaien via Redis, zodat ook tijdens drukke events niets vastloopt.",
    results: [
      { label: "Dagelijks actieve leden", value: "+35%" },
      { label: "Berichten per dag", value: "+1.200" },
      { label: "Commands per dag", value: "4.000" },
    ],
    stack: ["Python", "discord.py", "Redis", "PostgreSQL"],
  },
  {
    id: 5,
    slug: "velocity-garage",
    title: "Velocity Garage",
    client: "City Life RP",
    category: "servers",
    tags: ["FiveM", "QBCore"],
    size: "lg",
    accent: "from-orange-500 to-rose-600",
    year: 2026,
    duration: "3 weken",
    summary:
      "Een garagesysteem voor FiveM waarin spelers hun voertuigen beheren, opslaan en upgraden via een eigen interface.",
    challenge:
      "Het bestaande garagescript kostte bij elke spawn merkbaar prestatie en liet voertuigen soms verdwijnen. De interface was bovendien niet te rijmen met de huisstijl van de server.",
    solution:
      "Een herschreven resource op QBCore met een eigen NUI, waarin voertuigen per garage worden getoond met staat, schade en opslagkosten. Queries draaien asynchroon en de resource komt in rust niet boven 0.00ms uit.",
    results: [
      { label: "Resmon in rust", value: "0.00 ms" },
      { label: "Verloren voertuigen", value: "0" },
      { label: "Laadtijd garage", value: "<200 ms" },
    ],
    stack: ["Lua", "QBCore", "MySQL", "React (NUI)"],
  },
  {
    id: 6,
    slug: "lumen-dashboard",
    title: "Lumen Dashboard",
    client: "Lumen SaaS",
    category: "websites",
    tags: ["React", "tRPC"],
    size: "md",
    accent: "from-sky-500 to-indigo-600",
    year: 2026,
    duration: "7 weken",
    summary:
      "Een analytics-dashboard waarin klanten hun verbruik, facturen en teamleden op één plek beheren.",
    challenge:
      "Klantgegevens stonden verspreid over een adminpaneel, losse exports en e-mail. Elke vraag over verbruik kwam bij support terecht.",
    solution:
      "Een self-service dashboard met grafieken per periode, facturen om te downloaden en rollenbeheer per team. Type-veilig van database tot interface via tRPC, zodat een wijziging in het datamodel meteen zichtbaar is in de code.",
    results: [
      { label: "Supportvragen", value: "-45%" },
      { label: "Tijd tot inzicht", value: "2 klikken" },
      { label: "Teams in gebruik", value: "120" },
    ],
    stack: ["React", "tRPC", "Prisma", "PostgreSQL"],
  },
  {
    id: 7,
    slug: "guardian-mod",
    title: "Guardian Mod",
    client: "Esports NL",
    category: "bots",
    tags: ["TypeScript", "AI"],
    size: "lg",
    accent: "from-violet-500 to-fuchsia-600",
    year: 2026,
    duration: "4 weken",
    summary:
      "Een moderatiebot die spam en scamlinks tegenhoudt voordat een menselijke moderator ze ziet.",
    challenge:
      "Tijdens toernooien groeide de server sneller dan het moderatieteam aankon. Scamlinks en spamgolven bleven minutenlang staan, precies wanneer het druk was.",
    solution:
      "Een bot die berichten beoordeelt op inhoud, linkreputatie en het gedrag van het account. Twijfelgevallen gaan naar een wachtrij voor moderators in plaats van direct verwijderd te worden, met een logboek waarin elke beslissing terug te zien is.",
    results: [
      { label: "Scamlinks tegengehouden", value: "99,2%" },
      { label: "Reactietijd", value: "<1 s" },
      { label: "Onterechte acties", value: "0,3%" },
    ],
    stack: ["TypeScript", "Discord.js", "Cloudflare Workers"],
  },
  {
    id: 8,
    slug: "craftopia-survival",
    title: "Craftopia Survival",
    client: "Craftopia",
    category: "servers",
    tags: ["Spigot", "Custom"],
    size: "md",
    accent: "from-lime-500 to-emerald-600",
    year: 2025,
    duration: "6 weken",
    summary:
      "Een survivalserver met eigen mechanics: skills, quests en een spelersmarkt die de economie in balans houdt.",
    challenge:
      "Standaard survival was na een week uitgespeeld. Spelers haakten af zodra ze alles hadden, en de economie liep leeg door onbeperkte verkoop aan de server.",
    solution:
      "Een eigen plugin met skills die je traint door te spelen, quests die meegroeien met je voortgang, en een markt waarop spelers onderling handelen in plaats van met een bodemloze shop.",
    results: [
      { label: "Spelers na 30 dagen", value: "+70%" },
      { label: "Gemiddelde sessie", value: "85 min" },
      { label: "Quests voltooid", value: "25.000" },
    ],
    stack: ["Java", "Spigot", "MySQL"],
  },
  {
    id: 9,
    slug: "orbit-landing",
    title: "Orbit Landing",
    client: "Orbit Labs",
    category: "websites",
    tags: ["Next.js", "Tailwind"],
    size: "sm",
    accent: "from-indigo-500 to-violet-700",
    year: 2026,
    duration: "2 weken",
    summary:
      "Een landingspagina voor een productlancering, gebouwd om bezoekers om te zetten in aanmeldingen.",
    challenge:
      "De lancering stond over twee weken gepland en er was nog geen pagina. Het verhaal moest in één scroll duidelijk zijn, ook voor wie het product nog nooit had gezien.",
    solution:
      "Eén pagina met een heldere opbouw: wat het is, voor wie, en wat het kost. Het aanmeldformulier staat bovenaan en keert onderaan terug, met A/B-tests op de kop en de knoptekst.",
    results: [
      { label: "Conversie", value: "8,4%" },
      { label: "Aanmeldingen week 1", value: "2.100" },
      { label: "Opgeleverd in", value: "11 dagen" },
    ],
    stack: ["Next.js", "Tailwind CSS", "Vercel Analytics"],
  },
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

// ── Translations ─────────────────────────────────────────────────────────────

/** All content in one language. Dutch is the source; English swaps the texts and keeps icons, colours and slugs. */
export function getContent(locale: Locale) {
  if (locale === "nl") return { departments, services, projectFilters, projects, stats, process, faq, values, timeline, team };
  return {
    departments: departments.map((d) => ({ ...d, ...departmentsEn[d.id] })),
    services: services.map((s, i) => ({ ...s, ...servicesEn[i] })),
    projectFilters: projectFilters.map((f) => ({ ...f, label: projectFiltersEn[f.id] ?? f.label })),
    projects: projects.map((p) => {
      const en = projectsEn[p.slug];
      if (!en) return p;
      return {
        ...p,
        duration: en.duration,
        summary: en.summary,
        challenge: en.challenge,
        solution: en.solution,
        results: p.results.map((r, i) => ({ label: en.results[i] ?? r.label, value: resultValuesEn[r.value] ?? r.value })),
      };
    }),
    stats: stats.map((s, i) => ({ ...s, label: statsEn[i] ?? s.label })),
    process: process.map((p, i) => ({ ...p, ...processEn[i] })),
    faq: faqEn,
    values: values.map((v, i) => ({ ...v, ...valuesEn[i] })),
    timeline: timeline.map((t, i) => ({ ...t, ...timelineEn[i] })),
    team,
  };
}

export type Content = ReturnType<typeof getContent>;
export const values = [
  {
    title: "Eerlijk over wat kan",
    text: "Liever een scherpe planning die klopt dan een mooie belofte die we niet halen. Kan iets niet binnen je budget, dan zeggen we dat meteen.",
  },
  {
    title: "Code die blijft staan",
    text: "We bouwen alsof iemand anders het morgen moet onderhouden. Leesbaar, getest en gedocumenteerd, ook als het sneller kan.",
  },
  {
    title: "Korte lijnen",
    text: "Geen ticketsysteem waar je in verdwijnt. Je praat rechtstreeks met de mensen die aan je project werken, via je eigen kanaal in onze Discord.",
  },
  {
    title: "Gebouwd voor communities",
    text: "We komen zelf uit de wereld van Discord servers en game communities. We weten wat spelers verwachten en waar ze op afhaken.",
  },
];

export const timeline = [
  { year: "2021", title: "Begonnen als hobby", text: "Twee vrienden bouwen Discord bots voor hun eigen server. De eerste vragen van buitenaf komen binnen." },
  { year: "2023", title: "Eerste betaalde opdrachten", text: "Een vaste stroom klanten uit de FiveM- en Minecraft-wereld. Het team groeit naar vier mensen." },
  { year: "2025", title: "Next Solutions", text: "De drie afdelingen worden opgezet: Software, Game Development en Media, met een eigen klantportaal." },
  { year: "2026", title: "Waar we nu staan", text: "Een community van duizenden leden en honderden opgeleverde projecten." },
];

export const team = [
  { name: "Davey", role: "Founder & Lead Developer", focus: "Software", initial: "D", gradient: "from-violet-500 to-indigo-600" },
  { name: "Sem", role: "Game Developer", focus: "Game", initial: "S", gradient: "from-fuchsia-500 to-purple-600" },
  { name: "Noor", role: "Designer", focus: "Media", initial: "N", gradient: "from-purple-500 to-pink-500" },
  { name: "Tim", role: "Backend Developer", focus: "Software", initial: "T", gradient: "from-indigo-500 to-violet-600" },
];
