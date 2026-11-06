/** Social media client data from the bot (social.js): calendar, reports, uploads and subscription. */

export type PostStatus = "concept" | "ter-goedkeuring" | "goedgekeurd" | "aanpassing" | "gepland" | "geplaatst";

export interface SocialPost {
  id: string;
  klantId: string;
  platform: string;
  datum: number;
  type: string;
  titel: string;
  caption: string;
  media: string[];
  status: PostStatus;
  feedback: { t: number; besluit: string; tekst: string }[];
  bijgewerkt: number;
}

export interface PlatformStats {
  platform: string;
  volgers: number | null;
  groei: number | null;
  bereik: number | null;
  weergaven: number | null;
  interacties: number | null;
  posts: number | null;
}

export interface SocialReport {
  id: string;
  klantId: string;
  maand: string;
  maandNaam: string;
  platformen: PlatformStats[];
  hoogtepunten: string;
  advies: string;
  gepubliceerd: boolean;
  t: number;
}

export interface SocialUpload {
  id: string;
  klantId: string;
  soort: "bestand" | "link";
  naam: string;
  type: string | null;
  grootte: number | null;
  link: string | null;
  notitie: string;
  t: number;
}

export interface Subscription {
  id: string;
  klantId: string;
  pakket: string;
  prijs: string;
  platformen: string[];
  status: "actief" | "gepauzeerd" | "gestopt";
  start: number;
  volgendeBetaling: number;
  betalingen: { nr: number; periode: string; t: number; bedrag: string }[];
  betaalinstructie: string | null;
}

export interface ClientSocial {
  posts: SocialPost[];
  rapporten: SocialReport[];
  uploads: SocialUpload[];
  abonnement: Subscription | null;
  maxUploadMb: number;
}

export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "X", "Facebook"];

export const STATUS_LABEL: Record<PostStatus, { nl: string; en: string; cls: string }> = {
  concept: { nl: "Concept", en: "Draft", cls: "border-white/10 bg-white/5 text-zinc-400" },
  "ter-goedkeuring": { nl: "Ter goedkeuring", en: "Awaiting approval", cls: "border-amber-400/40 bg-amber-400/10 text-amber-200" },
  goedgekeurd: { nl: "Goedgekeurd", en: "Approved", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  aanpassing: { nl: "Aanpassing gevraagd", en: "Change requested", cls: "border-rose-400/30 bg-rose-400/10 text-rose-200" },
  gepland: { nl: "Ingepland", en: "Scheduled", cls: "border-sky-400/30 bg-sky-400/10 text-sky-200" },
  geplaatst: { nl: "Geplaatst", en: "Posted", cls: "border-brand-500/40 bg-brand-600/15 text-brand-100" },
};

export const TYPE_LABEL: Record<string, { nl: string; en: string }> = {
  post: { nl: "Post", en: "Post" },
  carrousel: { nl: "Carrousel", en: "Carousel" },
  reel: { nl: "Reel", en: "Reel" },
  story: { nl: "Story", en: "Story" },
  short: { nl: "Short", en: "Short" },
  video: { nl: "Video", en: "Video" },
};

export const fmtNumber = (n: number | null | undefined, locale: "nl" | "en" = "nl") => (n === null || n === undefined ? "–" : n.toLocaleString(locale === "en" ? "en-GB" : "nl-NL"));
