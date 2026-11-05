"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Languages, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/site";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { locale, t, lp } = useI18n();
  const pathname = stripLocale(usePathname());
  const other = locale === "nl" ? "en" : "nl";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4">
      <motion.nav
        aria-label={t.nav.aria}
        animate={{
          maxWidth: scrolled ? 1040 : 1280,
          paddingTop: scrolled ? 8 : 14,
          paddingBottom: scrolled ? 8 : 14,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "w-full rounded-3xl border px-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 sm:px-6",
          scrolled || open
            ? "border-white/10 bg-ink/60 shadow-glass backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Logo href={lp("/")} />

          <ul className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={lp(link.href)}
                  className={cn(
                    "relative whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href) ? "text-white" : "text-zinc-400 hover:text-white",
                  )}
                >
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl border border-brand-500/30 bg-brand-600/15"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {t.nav.links[link.href] ?? link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* A plain <a> on purpose: the language lives in the root layout, so switching needs a full page load */}
            <a
              href={localePath(other, pathname)}
              hrefLang={other}
              title={t.nav.switchTo}
              aria-label={t.nav.switchTo}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase text-zinc-300 transition-colors hover:border-brand-500/40 hover:text-white"
            >
              <Languages className="size-3.5" /> {other}
            </a>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={lp("/contact")}>{t.nav.quote}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden xl:hidden"
            >
              <div className="flex flex-col gap-1 pb-2 pt-4">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={lp(link.href)}
                      className={cn(
                        "block rounded-xl px-4 py-3 font-display text-base",
                        isActive(link.href) ? "bg-brand-600/15 text-white" : "text-zinc-300 hover:bg-white/5",
                      )}
                    >
                      {t.nav.links[link.href] ?? link.label}
                    </Link>
                  </motion.li>
                ))}
                <li className="pt-2 sm:hidden">
                  <Button asChild className="w-full">
                    <Link href={lp("/contact")}>{t.nav.quote}</Link>
                  </Button>
                </li>
              </div>
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
