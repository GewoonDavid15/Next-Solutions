import "server-only";
import { getSession, type SessionUser } from "@/lib/session";

/**
 * Admins are listed by Discord user-id in ADMIN_DISCORD_IDS, comma separated.
 * Keeping it in an environment variable means admin rights cannot be granted
 * by anything a visitor controls.
 */
function adminIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminId(discordId: string): boolean {
  const ids = adminIds();
  return ids.length > 0 && ids.includes(discordId);
}

/** The signed-in user if they are an admin, otherwise null. Demo sessions never qualify. */
export async function getAdmin(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.demo) return null;
  return isAdminId(session.id) ? session : null;
}

export const hasAdmins = () => adminIds().length > 0;
