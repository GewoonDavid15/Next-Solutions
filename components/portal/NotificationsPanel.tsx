"use client";

import { Bell, BriefcaseBusiness, CalendarDays, CheckCheck, FileDown, FolderKanban, Loader2, Receipt, Ticket, Bug } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { Notification } from "@/lib/profile";
import { cn } from "@/lib/utils";

export const NOTIFICATION_ICONS: Record<string, typeof Bell> = { ticket: Ticket, project: FolderKanban, bestand: FileDown, offerte: Receipt, bug: Bug, sollicitatie: BriefcaseBusiness, afspraak: CalendarDays };

const texts = {
  nl: { title: "Meldingen", empty: "Nog geen meldingen. Hier zie je straks antwoorden op tickets, projectupdates, nieuwe offertes en meer.", allRead: "Alles gelezen", failed: "Kon de meldingen niet laden." },
  en: { title: "Notifications", empty: "No notifications yet. Replies to tickets, project updates, new quotes and more will show up here.", allRead: "Mark all read", failed: "Could not load notifications." },
};

export function timeAgo(t: number, locale: "nl" | "en") {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const s = Math.round((t - Date.now()) / 1000);
  const a = Math.abs(s);
  if (a < 60) return rtf.format(s, "second");
  if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}

/** Hook used by both the bell in the navbar and the notifications tab. */
export function useNotifications(intervalMs = 45_000) {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [available, setAvailable] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/portaal/meldingen", { cache: "no-store" }).catch(() => null);
    if (!res || res.status === 401 || res.status === 503) { setAvailable(false); return; }
    const data = (await res.json().catch(() => null)) as { meldingen?: Notification[]; ongelezen?: number } | null;
    if (res.ok && data?.meldingen) { setItems(data.meldingen); setUnread(data.ongelezen ?? 0); setAvailable(true); }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), intervalMs);
    return () => clearInterval(timer);
  }, [load, intervalMs]);

  const markRead = useCallback(async (ids?: string[]) => {
    setItems((list) => list?.map((m) => (!ids || ids.includes(m.id) ? { ...m, gelezen: true } : m)) ?? list);
    setUnread((n) => (ids ? Math.max(0, n - ids.length) : 0));
    await fetch("/api/portaal/meldingen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ids ? { ids } : {}) }).catch(() => null);
  }, []);

  return { items, unread, available, reload: load, markRead };
}

export function NotificationList({ items, onOpen, locale, compact = false }: { items: Notification[]; onOpen: (n: Notification) => void; locale: "nl" | "en"; compact?: boolean }) {
  return (
    <ul className="divide-y divide-white/5">
      {items.map((n) => {
        const Icon = NOTIFICATION_ICONS[n.soort] ?? Bell;
        const inner = (
          <>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", n.gelezen ? "bg-white/5 text-zinc-500" : "bg-brand-600/20 text-brand-300")}><Icon className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-sm", n.gelezen ? "text-zinc-300" : "font-medium text-white")}>{n.titel}</span>
              {n.tekst && <span className={cn("block text-xs text-zinc-500", compact && "truncate")}>{n.tekst}</span>}
              <span className="mt-0.5 block text-[11px] text-zinc-600">{timeAgo(n.t, locale)}</span>
            </span>
            {!n.gelezen && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-400" aria-label="ongelezen" />}
          </>
        );
        const cls = "flex w-full items-start gap-3 px-2 py-3 text-left transition hover:bg-white/[0.03]";
        return (
          <li key={n.id}>
            {n.link ? <Link href={n.link} onClick={() => onOpen(n)} className={cls}>{inner}</Link> : <button type="button" onClick={() => onOpen(n)} className={cls}>{inner}</button>}
          </li>
        );
      })}
    </ul>
  );
}

export function NotificationsPanel() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const { items, unread, available, markRead } = useNotifications(30_000);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Bell className="size-5 text-brand-300" /> {tx.title}</h2>
        {unread > 0 && <button type="button" onClick={() => markRead()} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><CheckCheck className="size-4" /> {tx.allRead}</button>}
      </div>
      <div className="glass mt-4 rounded-3xl p-3">
        {!available ? <p className="p-4 text-sm text-zinc-400">{tx.failed}</p>
          : !items ? <Loader2 className="m-4 size-5 animate-spin text-zinc-500" />
            : items.length === 0 ? <p className="p-4 text-sm text-zinc-400">{tx.empty}</p>
              : <NotificationList items={items} locale={locale} onOpen={(n) => !n.gelezen && markRead([n.id])} />}
      </div>
    </div>
  );
}
