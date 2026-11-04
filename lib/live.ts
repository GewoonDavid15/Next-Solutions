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
  bugs: ClientBug[];
}

export const DAYS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

export function formatUptime(pct: number | null) {
  if (pct === null) return "—";
  return pct >= 99.995 ? "100%" : `${pct.toFixed(2).replace(".", ",")}%`;
}

export function formatMinutes(ms: number) {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} u ${m} min` : `${h} uur`;
}

export function formatDate(ms: number, withTime = false) {
  return new Date(ms).toLocaleString("nl-NL", {
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
