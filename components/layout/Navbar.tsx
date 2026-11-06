"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Activity, BookOpen, Briefcase, ChevronDown, Folder, Info, Languages, Menu, Newspaper, Sparkles, Star, UserRound, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { moreNav, primaryNav } from "@/lib/site";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const ICONS = { book: BookOpen, info: Info, sparkles: Sparkles, users: Users, star: Star, newspaper: Newspaper, briefcase: Briefcase, activity: Activity, folder: Folder } as const;

export function Navbar() {
  const { locale, t, lp } = useI18n();
  const pathname = stripLocale(usePathname());
  const other = locale === "nl" ? "en" : "nl";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close the "More" menu on a click outside it or on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => !moreRef.current?.contains(e.target as Node) && setMoreOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  // No scrolling behind the open mobile menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const label = (href: string) => t.nav.links[href] ?? href;
  const moreActive = moreNav.some((l) => isActive(l.href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4">
      <motion.nav
        aria-label={t.nav.aria}
        animate={{ maxWidth: scrolled ? 1100 : 1280, paddingTop: scrolled ? 8 : 14, paddingBottom: scrolled ? 8 : 14 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "w-full rounded-3xl border px-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 sm:px-6",
          scrolled || open ? "border-white/10 bg-ink/70 shadow-glass backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Logo href={lp("/")} />

          <ul className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((href) => (
              <li key={href}>
                <Link
                  href={lp(href)}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn("relative whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors", isActive(href) ? "text-white" : "text-zinc-400 hover:text-white")}
                >
                  {isActive(href) && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-xl border border-brand-500/30 bg-brand-600/15" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  {label(href)}
                </Link>
              </li>
            ))}
            <li ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={cn("inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors", moreActive || moreOpen ? "text-white" : "text-zinc-400 hover:text-white")}
              >
                {t.nav.more} <ChevronDown className={cn("size-4 transition-transform", moreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-3 w-[440px] rounded-3xl border border-white/10 bg-ink/95 p-2 shadow-glass backdrop-blur-xl"
                  >
                    <ul className="grid grid-cols-2 gap-1">
                      {moreNav.map(({ href, icon }) => {
                        const Icon = ICONS[icon];
                        return (
                          <li key={href}>
                            <Link
                              href={lp(href)}
                              className={cn("group flex items-start gap-3 rounded-2xl p-3 transition", isActive(href) ? "bg-brand-600/15" : "hover:bg-white/[0.05]")}
                            >
                              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] transition group-hover:border-brand-500/40">
                                <Icon className="size-4 text-brand-300" />
                              </span>
                              <span>
                                <span className="block text-sm font-medium text-white">{label(href)}</span>
                                <span className="block text-xs leading-snug text-zinc-500">{t.nav.descriptions[href]}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            {/* A plain <a> on purpose: the language lives in the root layout, so switching needs a full page load */}
            <a
              href={localePath(other, pathname)}
              hrefLang={other}
              title={t.nav.switchTo}
              aria-label={`${other.toUpperCase()}: ${t.nav.switchTo}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase text-zinc-300 transition-colors hover:border-brand-500/40 hover:text-white"
            >
              <Languages className="size-3.5" /> {other}
            </a>
            <NotificationBell />
            <Link
              href={lp("/klantportaal")}
              title={t.nav.portal}
              aria-label={t.nav.portal}
              className={cn(
                "hidden size-9 place-items-center rounded-xl border transition-colors sm:grid",
                isActive("/klantportaal") ? "border-brand-500/50 bg-brand-600/15 text-white" : "border-white/10 text-zinc-300 hover:border-brand-500/40 hover:text-white",
              )}
            >
              <UserRound className="size-4" />
            </Link>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={lp("/contact")}>{t.nav.quote}</Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto pb-3 pt-4">
                <ul className="grid gap-1">
                  {primaryNav.map((href, i) => (
                    <motion.li key={href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                      <Link href={lp(href)} className={cn("block rounded-xl px-4 py-3 font-display text-lg", isActive(href) ? "bg-brand-600/15 text-white" : "text-zinc-200 hover:bg-white/5")}>
                        {label(href)}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{t.nav.more}</p>
                <ul className="mt-1 grid grid-cols-2 gap-1">
                  {moreNav.map(({ href, icon }) => {
                    const Icon = ICONS[icon];
                    return (
                      <li key={href}>
                        <Link href={lp(href)} className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm", isActive(href) ? "bg-brand-600/15 text-white" : "text-zinc-300 hover:bg-white/5")}>
                          <Icon className="size-4 text-brand-300" /> {label(href)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 grid gap-2 sm:hidden">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={lp("/klantportaal")}><UserRound /> {t.nav.portal}</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href={lp("/contact")}>{t.nav.quote}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
