"use client";

import { createContext, useContext } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/nl";

const I18nContext = createContext<{ locale: Locale; t: Messages } | null>(null);

/** Makes the texts of the current language available to client components. */
export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: messages }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return { ...ctx, lp: (href: string) => localePath(ctx.locale, href) };
}
