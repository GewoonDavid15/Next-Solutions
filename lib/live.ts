/** Live data that the Discord bot shares with the website (status page, contact page, team, client portal). */

export interface LiveService {
  id: string;
  naam: string;
  emoji: string;
  label: string;
  status: "operational" | "degraded" | "outage" | "onbekend";
  ms: number | null;
  sinds: number | null;
  uptime24u: number | null;
  uptime30d: number | null;
  /** Last 24 hours, oldest first: "ok", "deels" (short disruption), "storing" or null (no data) */
  uren: ("ok" | "deels" | "storing" | null)[];
}

export interface LiveTickets {
  open: number;
  wachtend: number;
  inBehandeling: number;
  drukte: { naam: string; emoji: string; kleur: number; tekst: string; verwacht: string };
  geopend: boolean;
  openingstijden: Record<string, [string, string] | null>;
  reactietijdMs: number | null;
  vandaagGesloten: number;
  totaalGesloten: number;
  afdelingen: { id: string; titel: string; emoji: string; kort: string; open: number }[];
}

export interface TeamMember {
  id: string;
  naam: string;
  avatar: string | null;
  functie: string;
  bio: string | null;
  skills: string[];
  afdelingen: string[];
}

export interface Review {
  id: number;
  naam: string;
  avatar: string | null;
  sterren: number;
  tekst: string;
  context: string;
  bron: "ticket" | "project";
  t: number;
}

export interface ReviewSummary {
  aantal: number;
  gemiddelde: number | null;
  /** Number of reviews with 1..5 stars */
  verdeling: number[];
  recent: Review[];
}

export interface PublicData {
  bot: { online: boolean; ping: number | null };
  server: { naam: string; icoon: string | null; leden: number } | null;
  tickets: LiveTickets | null;
  diensten: LiveService[];
  incidenten: { dienst: string; start: number; eind: number | null }[];
  reviews: ReviewSummary | null;
  team: TeamMember[];
  /** Invite leaderboard (missing when the bot runs an older version) */
  invites?: PublicInvites | null;
  /** Running giveaways (missing when the bot runs an older version) */
  giveaways?: PublicGiveaway[];
  /** Most active members (levels), missing on older bot versions */
  levels?: { id: string; naam: string; avatar: string | null; xp: number; level: number }[];
}

export interface PublicGiveaway {
  prijs: string;
  eindigt: number;
  deelnemers: number;
  winnaars: number;
}

export interface OfferSignature {
  naam?: string;
  voorwaarden?: string;
  bron: "website" | "app" | "discord";
  t: number;
}

export interface ClientOffer {
  /** Digital acceptance: who, when and which version of the terms (missing for older quotes) */
  ondertekening?: OfferSignature | null;
  /** Missing when the bot runs an older version */
  id?: string;
  /** open | akkoord | betaald | ingetrokken | verlopen */
  code?: string;
  levertijd?: string | null;
  onderdelen?: string[];
  geldigTot?: number;
  /** Only filled in once the client has accepted */
  betaalinstructie?: string | null;
  nummer: string;
  titel: string;
  prijs: string;
  status: string;
  statusEmoji: string;
  t: number;
  betaald: boolean;
}

export interface PublicInvites {
  /** Members still in the server who joined through someone's invite */
  totaal: number;
  top: { naam: string; avatar: string | null; invites: number }[];
  beloningen: { invites: number; rol: string | null }[];
}

export interface ClientInvites {
  echt: number;
  weg: number;
  nep: number;
  bonus: number;
  totaal: number;
  plek: number | null;
  volgende: { invites: number; rol: string | null } | null;
  links: { code: string; uses: number; label: string | null }[];
}

export interface ClientProject {
  id: string;
  naam: string;
  fase: number;
  faseNaam: string;
  faseEmoji: string;
  fases: { nr: number; naam: string; emoji: string }[];
  percentage: number;
  notitie: string;
  deadline: number | null;
  bijgewerkt: number | null;
  geschiedenis: { t: number; percentage: number; notitie: string; faseNaam: string }[];
}

export interface ClientTicket {
  id: string;
  naam: string;
  afdeling: string;
  emoji: string;
  geopend: number;
  geclaimdDoor: string | null;
  link: string;
}

export interface ClientBug {
  nr: number;
  titel: string;
  status: string;
  statusEmoji: string;
  afgesloten: boolean;
  aangemaakt: number;
  bijgewerkt: number;
  reactie: string | null;
}

export interface ClientTranscript {
  id: string;
  naam: string;
  afdeling: string;
  emoji: string;
  geopend: number;
  gesloten: number;
  berichten: number;
}

export interface ClientData {
  projecten: ClientProject[];
  tickets: ClientTicket[];
  /** Closed tickets of this client (missing when the bot runs an older version) */
  transcripts?: ClientTranscript[];
  sollicitaties?: ClientApplication[];
  bestanden?: ClientFile[];
  email?: ClientEmailStatus | null;
  bugs: ClientBug[];
  invites?: ClientInvites | null;
  offertes?: ClientOffer[];
}

export const DAYS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
export const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Lang = "nl" | "en";

/** Decimal comma in Dutch, decimal point in English. */
export const decimal = (n: number, digits: number, locale: Lang = "nl") => (locale === "en" ? n.toFixed(digits) : n.toFixed(digits).replace(".", ","));

export function formatUptime(pct: number | null, locale: Lang = "nl") {
  if (pct === null) return "—";
  return pct >= 99.995 ? "100%" : `${decimal(pct, 2, locale)}%`;
}

export function formatMinutes(ms: number, locale: Lang = "nl") {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (locale === "en") return m ? `${h} h ${m} min` : `${h} ${h === 1 ? "hour" : "hours"}`;
  return m ? `${h} u ${m} min` : `${h} uur`;
}

/** English versions of the bot's crowd levels (lib/ticket.js DRUKTE). Unknown levels keep the bot's Dutch text. */
export const CROWD_EN: Record<string, { naam: string; tekst: string; verwacht: string }> = {
  Rustig: { naam: "Quiet", tekst: "It's quiet. You'll be helped quickly!", verwacht: "within 30 minutes" },
  Normaal: { naam: "Normal", tekst: "Normal activity. We'll help you as soon as possible.", verwacht: "within 1 to 2 hours" },
  Druk: { naam: "Busy", tekst: "It's busy. Response times may be a little longer.", verwacht: "within 2 to 4 hours" },
  "Zeer druk": { naam: "Very busy", tekst: "It's very busy. Thank you for your patience!", verwacht: "within 24 hours" },
};

export function formatDate(ms: number, withTime = false, locale: Lang = "nl") {
  return new Date(ms).toLocaleString(locale === "en" ? "en-GB" : "nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "long",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export interface TicketDepartment {
  id: string;
  titel: string;
  emoji: string;
  kort: string;
  onderwerpVoorbeeld: string;
  detailsLabel: string;
  detailsVoorbeeld: string;
}

export interface Vacancy {
  id: string;
  titel: string;
  afdeling: string;
  soort: string;
  omschrijving: string;
  eisen: string[];
  vragen: string[];
}

export interface ClientApplication {
  id: number;
  titel: string;
  status: string;
  statusEmoji: string;
  afgesloten: boolean;
  t: number;
}

export interface ClientFile {
  id: string;
  naam: string;
  grootte: number;
  type: string;
  beschrijving: string | null;
  project: string | null;
  t: number;
}

export function formatSize(bytes: number, locale: Lang = "nl") {
  return bytes >= 1024 * 1024 ? `${decimal(bytes / 1024 / 1024, 1, locale)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface ClientEmailStatus {
  /** false when the bot has no RESEND_API_KEY */
  beschikbaar: boolean;
  email: string | null;
  bevestigd: boolean;
  voorkeuren: Record<string, boolean>;
  /** Notification type -> label */
  soorten: Record<string, string>;
}
