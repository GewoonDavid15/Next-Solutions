import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { APP_COOKIE, RETURN_COOKIE, STATE_COOKIE, canonicalOrigin, isOAuthConfigured, oauthConfig, portalPath, redirectUri, safeReturnPath } from "@/lib/session";

const tempCookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 };

/** Step 1 of Discord OAuth2: send the visitor to Discord's consent screen. */
export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const back = request.nextUrl.searchParams.get("terug");

  if (!isOAuthConfigured()) {
    return NextResponse.redirect(new URL(`${portalPath(request, back)}?error=not_configured`, origin));
  }

  // Discord sends people back to the main address. Start there too, otherwise the security cookie
  // is set on a different domain (for example the .vercel.app address) and the login fails.
  const canonical = canonicalOrigin(origin);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  if (new URL(canonical).host !== host) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonical));
  }

  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: oauthConfig().clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "identify",
    state,
    // Skip the consent screen for people who already approved the site before
    prompt: "none",
  });

  const response = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
  response.cookies.set(STATE_COOKIE, state, tempCookie);
  // Where to go after logging in, e.g. back to /vacatures
  if (back) response.cookies.set(RETURN_COOKIE, safeReturnPath(back), tempCookie);
  else response.cookies.delete(RETURN_COOKIE);
  // Login from the Android app: remember its PKCE challenge, so only that app can use the result
  const app = request.nextUrl.searchParams.get("app");
  if (app && /^[A-Za-z0-9_-]{43}$/.test(app)) response.cookies.set(APP_COOKIE, app, tempCookie);
  else response.cookies.delete(APP_COOKIE);
  return response;
}
