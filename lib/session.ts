import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ns_session";
export const STATE_COOKIE = "ns_oauth_state";
export const RETURN_COOKIE = "ns_return";

/** The client portal in the visitor's language (?taal=en, or a return path under /en). */
export function portalPath(request: { nextUrl: URL }, returnPath?: string | null) {
  const en = request.nextUrl.searchParams.get("taal") === "en" || returnPath?.startsWith("/en/") || returnPath === "/en";
  return en ? "/en/klantportaal" : "/klantportaal";
}

/** Only simple internal paths are allowed as return address after login (no open redirects). */
export function safeReturnPath(value: string | null | undefined) {
  return value && /^\/[a-z0-9/-]{0,80}$/i.test(value) && !value.startsWith("//") ? value : "/klantportaal";
}
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  demo?: boolean;
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return s ?? "dev-only-insecure-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const { user, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { user: SessionUser; exp: number };
    return exp > Date.now() ? user : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export function isOAuthConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
}

export function redirectUri(origin: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? origin}/api/auth/discord/callback`;
}

export function avatarUrl(user: SessionUser) {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
