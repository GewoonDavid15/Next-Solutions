import { NextResponse, type NextRequest } from "next/server";
import { HINT_COOKIE, SESSION_COOKIE, portalPath } from "@/lib/session";

export function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL(portalPath(request), request.nextUrl.origin), 303);
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(HINT_COOKIE);
  return res;
}
