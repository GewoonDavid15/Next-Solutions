import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/klantportaal", request.nextUrl.origin), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
