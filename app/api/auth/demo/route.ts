import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, encodeSession, sessionCookieOptions, portalPath } from "@/lib/session";

/** Demo login so the dashboard mockup can be explored without Discord credentials. */
export function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL(portalPath(request), request.nextUrl.origin), 303);
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ id: "0", username: "demo", globalName: "Demo Klant", avatar: null, demo: true }),
    sessionCookieOptions,
  );
  return res;
}
