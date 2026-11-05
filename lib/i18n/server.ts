import "server-only";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getContent } from "@/lib/data";
import { LOCALE_HEADER, localePath, type Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";
import { nl, type Messages } from "@/lib/i18n/messages/nl";
import { site } from "@/lib/site";

const dictionaries: Record<Locale, Messages> = { nl, en };

export async function getLocale(): Promise<Locale> {
  return (await headers()).get(LOCALE_HEADER) === "en" ? "en" : "nl";
}

/** Everything a server component needs: the language, its texts, its content and a link helper. */
export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: dictionaries[locale],
    content: getContent(locale),
    lp: (href: string) => localePath(locale, href),
  };
}

export function getMessages(locale: Locale) {
  return dictionaries[locale];
}

/** Title, description, canonical URL and hreflang links for a page in the current language. */
export async function pageMetadata(path: string, title: string | undefined, description: string, extra: Metadata = {}): Promise<Metadata> {
  const locale = await getLocale();
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: { "nl-NL": path, en: localePath("en", path), "x-default": path },
    },
    openGraph: { title: title ? `${title} · ${site.name}` : site.name, description, locale: locale === "en" ? "en_GB" : "nl_NL", type: "website" },
    ...extra,
  };
}
