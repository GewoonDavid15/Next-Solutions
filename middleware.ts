import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_HEADER } from "@/lib/i18n/config";

/**
 * English pages live under /en. Instead of duplicating every page, /en/... is rewritten to the
 * same page, with a header telling the page to render in English.
 */
export function middleware(request: NextRequest) {
  const response = route(request);
  // Referral links (?ref=code): remember the code for 30 days, so a request sent later still counts
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[a-z0-9]{6,10}$/.test(ref)) {
    response.cookies.set("ns_ref", ref, { maxAge: 30 * 86_400, httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/" });
  }
  return response;
}

function route(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.delete(LOCALE_HEADER); // never trust a language header sent by the visitor

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice(3);
    headers.set(LOCALE_HEADER, "en");
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static files, images and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)"],
};
