import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import {
  HINT_COOKIE,
  RETURN_COOKIE,
  SESSION_COOKIE,
  STATE_COOKIE,
  encodeSession,
  isOAuthConfigured,
  redirectUri,
  portalPath,
  safeReturnPath,
  sessionCookieOptions,
} from "@/lib/session";

/** Step 2 of Discord OAuth2: exchange the code, fetch the user and set a signed session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`${portalPath(request, request.cookies.get(RETURN_COOKIE)?.value)}?error=${reason}`, origin));
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  if (!isOAuthConfigured()) return fail("not_configured");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !storedState || state !== storedState) return fail("invalid_state");

  try {
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(origin),
      }),
    });
    if (!tokenRes.ok) return fail("token_exchange");
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) return fail("user_fetch");
    const user = (await userRes.json()) as { id: string; username: string; global_name: string | null; avatar: string | null; premium_type?: number };

    // Nitro is only visible through the user's own login: pass it on to the profile in the bot (best effort)
    if (isBotApiConfigured()) {
      await botRequest("POST", "/klant/profiel/sync", JSON.stringify({ gebruiker: user.id, nitro: user.premium_type ?? 0, gebruikersnaam: user.username })).catch(() => null);
    }

    const res = NextResponse.redirect(new URL(safeReturnPath(request.cookies.get(RETURN_COOKIE)?.value), origin));
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(RETURN_COOKIE);
    res.cookies.set(
      SESSION_COOKIE,
      encodeSession({ id: user.id, username: user.username, globalName: user.global_name, avatar: user.avatar }),
      sessionCookieOptions,
    );
    res.cookies.set(HINT_COOKIE, "1", { ...sessionCookieOptions, httpOnly: false });
    return res;
  } catch {
    return fail("network");
  }
}
