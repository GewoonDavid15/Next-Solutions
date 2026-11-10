"use client";

import { Mail } from "lucide-react";
import { Panel } from "@/components/dashboard/ui";
import { timeAgo, useBotData } from "@/lib/beheer";

/** Clients who log in with email instead of Discord. */
export function EmailClientsPanel() {
  const { data } = useBotData<{ klanten: { id: string; naam: string; email: string; t: number; laatst: number | null }[] }>("beheer/emailklanten", 5 * 60_000);
  if (!data?.klanten.length) return null;
  return (
    <Panel title={`Klanten zonder Discord • ${data.klanten.length}`} icon={Mail} className="lg:col-span-2">
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {data.klanten.map((k) => (
          <li key={k.id} className="rounded-xl bg-white/[0.03] px-3 py-2">
            <b className="text-white">{k.naam}</b> <a href={`mailto:${k.email}`} className="text-brand-300 hover:underline">{k.email}</a>
            <span className="block text-xs text-zinc-500">klantnummer {k.id} • {k.laatst ? `laatst ingelogd ${timeAgo(k.laatst)}` : `aangemaakt ${timeAgo(k.t)}`}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
