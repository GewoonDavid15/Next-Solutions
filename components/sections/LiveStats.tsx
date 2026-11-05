"use client";

import { Activity, Layers, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";

const texts = {
  nl: { members: "Discord leden", services: "Diensten", uptime: "Uptime (30 dagen)" },
  en: { members: "Discord members", services: "Services", uptime: "Uptime (30 days)" },
};

/**
 * Only real numbers: the member count comes live from Discord and the uptime from the bot's status monitor.
 * A number that is not available is left out instead of being filled with an example value.
 */
export function LiveStats({ services, uptime }: { services: number; uptime: number | null }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [members, setMembers] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/discord")
      .then((r) => r.json())
      .then((d) => active && d.live && typeof d.memberCount === "number" && d.memberCount > 0 && setMembers(d.memberCount))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const items = [
    members !== null && { key: "members", icon: Users, label: tx.members, value: members, decimals: 0, suffix: "", pulse: false },
    { key: "services", icon: Layers, label: tx.services, value: services, decimals: 0, suffix: "", pulse: false },
    uptime !== null && { key: "uptime", icon: Activity, label: tx.uptime, value: uptime, decimals: uptime >= 99.995 ? 0 : 1, suffix: "%", pulse: true },
  ].filter((i): i is Exclude<typeof i, false> => Boolean(i));

  return (
    <section className="py-10">
      <div className="container">
        <Stagger
          className={cn(
            "glass grid divide-y divide-white/5 rounded-3xl sm:divide-x sm:divide-y-0",
            items.length === 3 ? "sm:grid-cols-3" : items.length === 2 ? "sm:grid-cols-2" : "mx-auto max-w-sm",
          )}
        >
          {items.map(({ key, icon: Icon, label, value, decimals, suffix, pulse }) => (
            <StaggerItem key={key} className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Icon className="mb-1 size-6 text-brand-400" />
              <div className="font-display text-4xl font-semibold text-white sm:text-5xl">
                <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
              </div>
              <p className="flex items-center gap-2 text-sm text-zinc-400">
                {pulse && <span className="size-2 animate-pulse rounded-full bg-emerald-400" />}
                {label}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
