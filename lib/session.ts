import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "ns_session";
export const STATE_COOKIE = "ns_oauth_state";
export const RETURN_COOKIE = "ns_return";
/** Set while logging in from the Android app: holds the app's PKCE challenge. */
export const APP_COOKIE = "ns_app";

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
  /** Logged in through the Android app (token in the Authorization header instead of a cookie) */
  app?: boolean;
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

export function encodeSession(user: SessionUser, maxAgeSeconds = MAX_AGE) {
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + maxAgeSeconds * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Token for the Android app: same format as the session cookie, valid for 90 days. */
export const APP_TOKEN_DAYS = 90;
export const encodeAppToken = (user: SessionUser) => encodeSession({ ...user, demo: undefined, app: true }, APP_TOKEN_DAYS * 86_400);

/** The app token from an "Authorization: Bearer ..." header, when valid. */
export function appSessionFrom(authorization: string | null | undefined): SessionUser | null {
  const m = authorization?.match(/^Bearer\s+([A-Za-z0-9_.-]{20,2000})$/);
  const user = m ? decodeSession(m[1]) : null;
  return user?.app ? user : null;
}

/** True when a request comes from the app with a valid token (no cookies, so no cross-site risk). */
export const isAppRequest = (request: Request) => Boolean(appSessionFrom(request.headers.get("authorization")));

/**
 * One-time login code that the website hands to the app after the Discord login. It only works
 * together with the secret (PKCE verifier) the app made before the login, and only for two minutes.
 */
export function encodeLoginCode(user: SessionUser, challenge: string) {
  const payload = Buffer.from(JSON.stringify({ user, ch: challenge, exp: Date.now() + 120_000, soort: "app-login" })).toString("base64url");
  return `${payload}.${sign(`login:${payload}`)}`;
}

export function redeemLoginCode(code: string, verifier: string): SessionUser | null {
  const [payload, signature] = String(code).split(".");
  if (!payload || !signature || !/^[A-Za-z0-9_-]{43,128}$/.test(verifier)) return null;
  const expected = Buffer.from(sign(`login:${payload}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const { user, ch, exp, soort } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { user: SessionUser; ch: string; exp: number; soort: string };
    const hashed = createHash("sha256").update(verifier).digest("base64url");
    if (soort !== "app-login" || exp < Date.now() || hashed.length !== ch.length || !timingSafeEqual(Buffer.from(hashed), Buffer.from(ch))) return null;
    return user;
  } catch {
    return null;
  }
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
  const fromCookie = decodeSession(store.get(SESSION_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  // The Android app sends its token as a header
  return appSessionFrom((await headers()).get("authorization"));
}

/** Readable by scripts (holds no data): lets the navbar know it is worth asking for notifications. */
export const HINT_COOKIE = "ns_in";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

/** OAuth settings from the environment, trimmed: a pasted secret often ends with a space or newline. */
export function oauthConfig() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET?.trim() ?? "",
  };
}

export function isOAuthConfigured() {
  const { clientId, clientSecret } = oauthConfig();
  return Boolean(clientId && clientSecret);
}

/** The one address the site is meant to be used on (NEXT_PUBLIC_SITE_URL), without a trailing slash. */
export function canonicalOrigin(origin: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || origin).replace(/\/+$/, "");
}

export function redirectUri(origin: string) {
  return `${canonicalOrigin(origin)}/api/auth/discord/callback`;
}

export function avatarUrl(user: SessionUser) {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}
