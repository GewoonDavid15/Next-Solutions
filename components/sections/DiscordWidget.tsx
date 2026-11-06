"use client";

import { motion } from "framer-motion";
import { Hash, RefreshCw, Users, Wifi } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { useI18n } from "@/components/i18n/I18nProvider";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import type { CommunityStats } from "@/lib/discord";
import { cn } from "@/lib/utils";

const statusColor = { online: "bg-emerald-400", idle: "bg-amber-400", dnd: "bg-rose-500" } as const;

export function DiscordWidget({ initial }: { initial: CommunityStats }) {
  const { locale } = useI18n();
  const en = locale === "en";
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/discord", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  const operational = data.status === "operational";

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#5865F2] to-brand-700 p-6 sm:p-8">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <DiscordIcon className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{data.name}</h2>
              <p className="flex items-center gap-2 text-sm text-white/80">
                <span className={cn("size-2 rounded-full", operational ? "bg-emerald-300" : "bg-amber-300")} />
                {operational ? (en ? "All systems operational" : "Alle systemen operationeel") : en ? "Live data temporarily unavailable" : "Live data tijdelijk niet beschikbaar"}
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            aria-label={en ? "Refresh" : "Vernieuwen"}
            className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
        <div className="p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-zinc-400">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            {en ? "Online now" : "Nu online"}
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-white">
            {data.online !== null ? <AnimatedCounter value={data.online} duration={1.2} /> : "—"}
          </p>
        </div>
        <div className="p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-zinc-400">
            <Users className="size-4" /> {en ? "Members" : "Leden"}
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-white">
            {data.memberCount ? <AnimatedCounter value={data.memberCount} duration={1.2} /> : "—"}
          </p>
        </div>
      </div>

      <div className={cn("grid gap-6 p-6 sm:p-8", data.channels.length > 0 && "md:grid-cols-2")}>
        {data.channels.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">{en ? "Channels" : "Kanalen"}</h3>
          <ul className="space-y-1">
            {data.channels.map((c) => (
              <li key={c.id} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
                <Hash className="size-4 text-zinc-500" /> {c.name}
              </li>
            ))}
          </ul>
        </div>
        )}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">{en ? "Online members" : "Online leden"}</h3>
          {data.members.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {data.members.map((m, i) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  title={m.username}
                  className="relative"
                >
                  <Image src={m.avatar_url} alt={m.username} width={40} height={40} unoptimized className="size-10 rounded-full border border-white/10" />
                  <span className={cn("absolute bottom-0 right-0 size-3 rounded-full border-2 border-ink", statusColor[m.status])} />
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 p-4 text-sm text-zinc-500">
              <Wifi className="size-4" />
              {data.members.length === 0 && data.channels.length > 0
                ? en ? "Nobody visible right now." : "Nu even niemand zichtbaar."
                : en ? "Join the server to see who is online and to chat with the team." : "Join de server om te zien wie er online is en om met het team te praten."}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-white/5 p-6 sm:p-8">
        <JoinButton href={data.invite} />
        <p className="text-xs text-zinc-500">
          {data.live ? (en ? "Live from Discord" : "Live uit Discord") : en ? "Live numbers temporarily unavailable" : "Live cijfers tijdelijk niet beschikbaar"} · {en ? "updated" : "bijgewerkt"}{" "}
          {new Date(data.updatedAt).toLocaleTimeString(en ? "en-GB" : "nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

/** Animated, pulsing "Join de Server" button. */
export function JoinButton({ href }: { href: string }) {
  const { locale } = useI18n();
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-3 rounded-2xl bg-[#5865F2] px-8 py-4 font-display text-lg font-semibold text-white shadow-[0_0_40px_-6px_rgba(88,101,242,0.9)]"
    >
      <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-2xl bg-[#5865F2]" />
      <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-2xl bg-brand-600 [animation-delay:1s]" />
      <span className="relative flex items-center gap-3">
        <DiscordIcon className="size-6" /> {locale === "en" ? "Join the Server" : "Join de Server"}
      </span>
    </motion.a>
  );
}
