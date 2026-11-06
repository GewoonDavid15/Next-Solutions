/** Profile, badges, notifications and appointments from the Discord bot (profielen.js and afspraken.js). */

export interface Badge {
  id: string;
  naam: string;
  emoji: string;
  uitleg: string;
  behaald: boolean;
}

export interface Profile {
  id: string;
  handle: string | null;
  openbaar: boolean;
  discord: {
    naam: string;
    gebruikersnaam: string;
    avatar: string;
    banner: string | null;
    accentKleur: string | null;
    decoratie: string | null;
    naamplaatje: string | null;
    servertag: { tag: string; badge: string | null } | null;
    accountSinds: number;
    lidSinds: number | null;
    boostSinds?: number | null;
    rollen?: { id: string; naam: string; kleur: string | null }[];
    nitro: boolean;
  };
  bio: string;
  tagline: string;
  bedrijf: string;
  website: string;
  socials: Partial<Record<"github" | "x" | "instagram" | "youtube" | "tiktok" | "twitch", string>>;
  kleur: string | null;
  badges: Badge[];
  niveau: { level: number; titel: string; xp: number; huidig: number; volgende: number; procent: number };
  /** Activity level in the Discord server (messages and voice) */
  activiteit?: { level: number; xp: number; procent: number; plek: number | null; berichten: number; voiceMin: number } | null;
  stats: { projecten: number; opgeleverd: number; offertesBetaald: number; reviews: number; invites: number; tickets?: number };
  reviews: { id: number; sterren: number; tekst: string | null; context: string; t: number }[];
  opgeleverd: { naam: string; t: number | null }[];
}

export interface Notification {
  id: string;
  t: number;
  soort: "ticket" | "project" | "bestand" | "offerte" | "bug" | "sollicitatie" | "afspraak" | string;
  titel: string;
  tekst: string;
  link: string | null;
  gelezen: boolean;
}

export interface Appointment {
  id: string;
  start: number;
  eind: number;
  onderwerp: string;
  notitie: string;
  status: "gepland" | "geannuleerd" | "afgerond";
  naam: string;
  userId: string;
}

export const SOCIAL_LINKS: Record<string, (v: string) => string> = {
  github: (v) => `https://github.com/${v}`,
  x: (v) => `https://x.com/${v}`,
  instagram: (v) => `https://instagram.com/${v}`,
  youtube: (v) => `https://youtube.com/@${v}`,
  tiktok: (v) => `https://tiktok.com/@${v}`,
  twitch: (v) => `https://twitch.tv/${v}`,
};
