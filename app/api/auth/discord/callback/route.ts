import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import {
  HINT_COOKIE,
  RETURN_COOKIE,
  SESSION_COOKIE,
  STATE_COOKIE,
  encodeSession,
  isOAuthConfigured,
  oauthConfig,
  portalPath,
  redirectUri,
  safeReturnPath,
  sessionCookieOptions,
} from "@/lib/session";

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  premium_type?: number;
}

const sameState = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Step 2 of Discord OAuth2: exchange the code, fetch the user and set a signed session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const returnPath = request.cookies.get(RETURN_COOKIE)?.value;
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`${portalPath(request, returnPath)}?error=${reason}`, origin));
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  if (!isOAuthConfigured()) return fail("not_configured");

  // The visitor clicked "Cancel" on Discord's screen (or Discord refused the request)
  const discordError = searchParams.get("error");
  if (discordError) {
    if (discordError !== "access_denied") console.error(`[OAuth] Discord gaf een fout terug: ${discordError} (${searchParams.get("error_description") ?? ""})`);
    return fail(discordError === "access_denied" ? "denied" : "discord_error");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state) return fail("invalid_state");
  if (!storedState) return fail("cookie_missing");
  if (!sameState(state, storedState)) return fail("invalid_state");

  try {
    const { clientId, clientSecret } = oauthConfig();
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(origin) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenRes.ok) {
      const body = (await tokenRes.json().catch(() => ({}))) as { error?: string; error_description?: string };
      // Shows up in the Vercel logs (never the secret itself)
      console.error(`[OAuth] Code inwisselen mislukt (${tokenRes.status}): ${body.error ?? "?"} ${body.error_description ?? ""}`);
      if (body.error === "invalid_client") return fail("client_config");
      if (/redirect_uri/i.test(body.error_description ?? "")) return fail("redirect_mismatch");
      if (body.error === "invalid_grant") return fail("expired_code");
      if (tokenRes.status === 429) return fail("rate_limited");
      return fail("token_exchange");
    }
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!userRes.ok) {
      console.error(`[OAuth] Gebruiker ophalen mislukt (${userRes.status})`);
      return fail("user_fetch");
    }
    const user = (await userRes.json()) as DiscordUser;

    // The access token is not needed anymore: revoke it right away (best effort)
    fetch("https://discord.com/api/v10/oauth2/token/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}` },
      body: new URLSearchParams({ token: access_token, token_type_hint: "access_token" }),
      signal: AbortSignal.timeout(5_000),
    }).catch(() => null);

    // Nitro is only visible through the user's own login: pass it on to the profile in the bot (best effort)
    if (isBotApiConfigured()) {
      await botRequest("POST", "/klant/profiel/sync", JSON.stringify({ gebruiker: user.id, nitro: user.premium_type ?? 0, gebruikersnaam: user.username })).catch(() => null);
    }

    const res = NextResponse.redirect(new URL(safeReturnPath(returnPath ?? portalPath(request)), origin));
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(RETURN_COOKIE);
    res.cookies.set(SESSION_COOKIE, encodeSession({ id: user.id, username: user.username, globalName: user.global_name, avatar: user.avatar }), sessionCookieOptions);
    res.cookies.set(HINT_COOKIE, "1", { ...sessionCookieOptions, httpOnly: false });
    return res;
  } catch (err) {
    console.error("[OAuth] Netwerkfout:", (err as Error).message);
    return fail("network");
  }
}
