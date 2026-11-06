"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { NotificationList, useNotifications } from "@/components/portal/NotificationsPanel";

/** Bell with unread count in the navbar. Only shown to logged-in clients. */
export function NotificationBell() {
  // Only ask for notifications when someone is logged in (the hint cookie is set at login)
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(document.cookie.split("; ").some((c) => c === "ns_in=1")), []);
  return loggedIn ? <Bell2 /> : null;
}

function Bell2() {
  const { locale, lp } = useI18n();
  const { items, unread, available, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (!available || !items) return null;
  const en = locale === "en";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={en ? `Notifications (${unread} unread)` : `Meldingen (${unread} ongelezen)`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:border-brand-500/40 hover:text-white"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-ink">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-ink/95 p-2 shadow-glass backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold">{en ? "Notifications" : "Meldingen"}</p>
              {unread > 0 && <button type="button" onClick={() => markRead()} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"><CheckCheck className="size-3.5" /> {en ? "All read" : "Alles gelezen"}</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-zinc-500">{en ? "No notifications yet." : "Nog geen meldingen."}</p>
              ) : (
                <NotificationList items={items.slice(0, 12)} locale={locale} compact onOpen={(n) => { if (!n.gelezen) markRead([n.id]); setOpen(false); }} />
              )}
            </div>
            <Link href={`${lp("/klantportaal")}#meldingen`} onClick={() => setOpen(false)} className="block rounded-2xl px-2 py-2 text-center text-xs text-brand-300 hover:bg-white/5">
              {en ? "All notifications" : "Alle meldingen"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
