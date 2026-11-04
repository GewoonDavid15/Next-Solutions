import "server-only";
import { createHash, createHmac } from "crypto";
import type { ClientData, PublicData } from "@/lib/live";
import type { SessionUser } from "@/lib/session";

/**
 * Talks to the dashboard API that runs inside the Discord bot (Systeem/dashboard-api.js).
 * Every request is signed with an HMAC of the shared secret, so the secret itself never
 * travels over the network and a captured request cannot be replayed after 60 seconds.
 */

export function isBotApiConfigured() {
  return Boolean(process.env.BOT_API_URL && (process.env.BOT_API_SECRET?.length ?? 0) >= 32);
}

/** Only the configured owner (a real Discord login, not the demo) may open the bot dashboard. */
export function isDashboardOwner(user: SessionUser | null) {
  const owner = process.env.DASHBOARD_OWNER_ID;
  return Boolean(user && owner && !user.demo && user.id === owner);
}

export interface BotResponse {
  status: number;
  data: unknown;
}

export async function botRequest(method: string, pathWithQuery: string, body?: string): Promise<BotResponse> {
  const base = process.env.BOT_API_URL!.replace(/\/+$/, "");
  const secret = process.env.BOT_API_SECRET!;
  const payload = body ?? "";
  const time = String(Date.now());
  const bodyHash = createHash("sha256").update(payload).digest("hex");
  const signature = createHmac("sha256", secret).update(`${time}\n${method}\n${pathWithQuery}\n${bodyHash}`).digest("hex");

  const res = await fetch(`${base}${pathWithQuery}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-ns-tijd": time,
      "x-ns-handtekening": signature,
    },
    body: payload || undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const data: unknown = await res.json().catch(() => ({ fout: "Ongeldig antwoord van de bot." }));
  return { status: res.status, data };
}

// Public data is shared by every visitor, so it is cached briefly instead of asking the bot on each page view.
let publicCache: { t: number; data: PublicData | null } = { t: 0, data: null };
const PUBLIC_TTL = 30_000;

/** Status, crowd level and team from the bot. Returns null when the bot is not configured or unreachable. */
export async function getPublicData(): Promise<PublicData | null> {
  if (!isBotApiConfigured()) return null;
  if (Date.now() - publicCache.t < PUBLIC_TTL) return publicCache.data;
  try {
    const { status, data } = await botRequest("GET", "/publiek");
    publicCache = { t: Date.now(), data: status === 200 ? (data as PublicData) : null };
  } catch {
    // Remember the failure for a short while so an offline bot does not slow down every page
    publicCache = { t: Date.now() - PUBLIC_TTL + 10_000, data: null };
  }
  return publicCache.data;
}

/** Projects, tickets and bug reports of one client (by Discord user ID). */
export async function getClientData(userId: string): Promise<ClientData | null> {
  if (!isBotApiConfigured() || !/^\d{17,20}$/.test(userId)) return null;
  try {
    const { status, data } = await botRequest("GET", `/klant?id=${userId}`);
    return status === 200 ? (data as ClientData) : null;
  } catch {
    return null;
  }
}
