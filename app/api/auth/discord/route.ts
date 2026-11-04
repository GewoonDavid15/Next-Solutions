import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { RETURN_COOKIE, STATE_COOKIE, isOAuthConfigured, redirectUri, safeReturnPath } from "@/lib/session";

/** Step 1 of Discord OAuth2: redirect the user to Discord's consent screen. */
export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!isOAuthConfigured()) {
    return NextResponse.redirect(new URL("/klantportaal?error=not_configured", origin));
  }

  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "identify",
    state,
    prompt: "none",
  });

  const response = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
  // Where to go after logging in, e.g. back to /vacatures
  const back = request.nextUrl.searchParams.get("terug");
  if (back) {
    response.cookies.set(RETURN_COOKIE, safeReturnPath(back), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  }
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
