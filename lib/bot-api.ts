import "server-only";
import { createHash, createHmac } from "crypto";
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
