/** Types and a small fetch helper for the bot dashboard (client side). */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

export interface Overview {
  bot: {
    online: boolean;
    tag: string | null;
    id: string | null;
    avatar: string | null;
    ping: number | null;
    opgestartOp: number;
    node: string;
    discordJs: string;
    ramMb: number;
    heapMb: number;
  };
  server: { id: string; naam: string; icoon: string | null; leden: number } | null;
  modules: { totaal: number; geladen: number; fout: number; uit: number };
  tickets: {
    open: number;
    perAfdeling: Record<string, number>;
    vandaagGesloten: number;
    totaalGesloten: number;
    reactietijdMs: number | null;
  };
  diensten: { id: string; status: string; ms: number | null }[];
  bugs: { open: number; totaal: number };
  projecten: { actief: number; totaal: number };
}

export interface LogLine {
  id: number;
  t: number;
  niveau: "log" | "warn" | "error";
  tekst: string;
}

export interface ServerInfo {
  kanalen: { id: string; naam: string; type: "tekst" | "voice" | "categorie" | "forum"; categorie: string | null }[];
  rollen: { id: string; naam: string; kleur: string }[];
}

export interface SettingsSystem {
  naam: string;
  beschrijving: string;
  waarden: Record<string, Json>;
  standaard: Record<string, Json>;
}

export interface ModuleInfo {
  bestand: string;
  status: "geladen" | "uit" | "fout" | "overgeslagen" | "nieuw";
  fout: string | null;
  aanNaHerstart: boolean;
  beschermd: boolean;
  grootte: number;
}

export class BotError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Calls the bot through the site's own proxy route (/api/bot/...). */
export async function botApi<T>(method: "GET" | "PUT" | "POST" | "DELETE", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/bot/${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { fout?: string };
  if (!res.ok) throw new BotError(data.fout ?? `Fout ${res.status}`, res.status);
  return data;
}

export function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return [d && `${d}d`, h && `${h}u`, `${m}m`].filter(Boolean).join(" ");
}

/** "LOGS_KANAAL_ID" -> "Logs kanaal ID" */
export function humanizeKey(key: string) {
  if (/^\d+$/.test(key)) return key;
  const text = key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\bid\b/g, "ID")
    .replace(/\bids\b/g, "ID's")
    .replace(/\bms\b/g, "(ms)")
    .replace(/\bmin\b/g, "(min)")
    .replace(/\bsec\b/g, "(sec)");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
