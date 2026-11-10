import { NextResponse, type NextRequest } from "next/server";
import { botRequest, isBotApiConfigured } from "@/lib/bot-api";
import { HINT_COOKIE, SESSION_COOKIE, decodeEmailLink, encodeLoginCode, encodeSession, safeReturnPath, sessionCookieOptions, type SessionUser } from "@/lib/session";

/** Step 2: the link from the email. Creates (or finds) the account and logs in, on the website or in the app. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const data = decodeEmailLink(request.nextUrl.searchParams.get("token") ?? "");
  const portal = data?.taal === "en" ? "/en/klantportaal" : "/klantportaal";
  if (!data) return NextResponse.redirect(new URL(`${portal}?error=email_link`, origin));
  if (!isBotApiConfigured()) return NextResponse.redirect(new URL(`${portal}?error=not_configured`, origin));
  const r = await botRequest("POST", "/email/account", JSON.stringify({ email: data.email })).catch(() => null);
  const acc = r?.status === 200 ? (r.data as { id: string; naam: string }) : null;
  if (!acc) return NextResponse.redirect(new URL(`${data.app ? "/app/login" : portal}?error=network`, origin));
  const user: SessionUser = { id: acc.id, username: acc.naam, globalName: acc.naam, avatar: null, email: data.email };
  if (data.app) return NextResponse.redirect(new URL(`/app/login?code=${encodeURIComponent(encodeLoginCode(user, data.app))}`, origin));
  const res = NextResponse.redirect(new URL(safeReturnPath(data.terug ?? portal), origin));
  res.cookies.set(SESSION_COOKIE, encodeSession(user), sessionCookieOptions);
  res.cookies.set(HINT_COOKIE, "1", { ...sessionCookieOptions, httpOnly: false });
  return res;
}

export const dynamic = "force-dynamic";
