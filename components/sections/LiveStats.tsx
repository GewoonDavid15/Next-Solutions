"use client";

import { Activity, FolderKanban, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { stats } from "@/lib/data";

const icons = [Users, FolderKanban, Activity];

/** Live counter. Member count is replaced with the real Discord count when the widget API is configured. */
export function LiveStats() {
  const [members, setMembers] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/discord")
      .then((r) => r.json())
      .then((d) => active && d.live && typeof d.memberCount === "number" && setMembers(d.memberCount))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const values = stats.map((s, i) => (i === 0 && members ? { ...s, value: members } : s));

  return (
    <section className="py-10">
      <div className="container">
        <Stagger className="glass grid divide-y divide-white/5 rounded-3xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {values.map((s, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={s.label} className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Icon className="mb-1 size-6 text-brand-400" />
                <div className="font-display text-4xl font-semibold text-white sm:text-5xl">
                  <AnimatedCounter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <p className="flex items-center gap-2 text-sm text-zinc-400">
                  {i === 2 && <span className="size-2 animate-pulse rounded-full bg-emerald-400" />}
                  {s.label}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
