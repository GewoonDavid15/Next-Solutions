/** Languages of the website. Dutch lives on the plain URLs, English under /en. */
export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

/** Header the middleware sets for English requests (read by server components). */
export const LOCALE_HEADER = "x-ns-taal";

/** Paths that exist only in Dutch (the owner's bot dashboard and API routes). */
const UNTRANSLATED = [/^\/dashboard(\/|$)/, /^\/api\//];

/** "/diensten" -> "/en/diensten" for English, unchanged for Dutch. External links and anchors stay as they are. */
export function localePath(locale: Locale, href: string) {
  if (locale === defaultLocale || !href.startsWith("/") || href.startsWith("//") || UNTRANSLATED.some((r) => r.test(href))) return href;
  return href === "/" ? "/en" : `/en${href}`;
}

/** "/en/diensten" -> "/diensten" */
export function stripLocale(pathname: string) {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** Fills placeholders: fmt("Hi {name}", { name: "Jan" }) -> "Hi Jan" */
export function fmt(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

export const dateLocale = (locale: Locale) => (locale === "en" ? "en-GB" : "nl-NL");
