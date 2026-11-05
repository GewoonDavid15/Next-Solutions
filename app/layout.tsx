import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { Navbar } from "@/components/layout/Navbar";
import { getLocale, getMessages } from "@/lib/i18n/server";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { site } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s · ${site.name}` },
    description: t.meta.description,
    openGraph: { title: site.name, description: t.meta.description, type: "website", locale: locale === "en" ? "en_GB" : "nl_NL" },
  };
}

export const viewport: Viewport = { themeColor: "#09090b" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = getMessages(locale);
  return (
    <html lang={locale} className={`${fredoka.variable} ${inter.variable}`}>
      <body>
        <I18nProvider locale={locale} messages={t}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
            {t.skipLink}
          </a>
          <ScrollProgress />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <BackToTop />
        </I18nProvider>
      </body>
    </html>
  );
}
