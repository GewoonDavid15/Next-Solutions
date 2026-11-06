"use client";

import { CheckSquare, Loader2, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface List { kanaalId: string; titel: string; items: { tekst: string; klaar: boolean }[] }

/** Checklist the bot starts after payment. Clients tick off what they delivered. */
export function OnboardingChecklist({ projectId }: { projectId: string }) {
  const { locale } = useI18n();
  const [list, setList] = useState<List | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/portaal/onboarding", { cache: "no-store" }).then((r) => r.json()).then((d: { lijsten?: List[] }) => setList(d.lijsten?.find((l) => l.kanaalId === projectId) ?? null)).catch(() => null);
  }, [projectId]);

  if (!list) return null;
  const done = list.items.filter((i) => i.klaar).length;

  async function toggle(index: number) {
    if (!list) return;
    setBusy(index);
    const res = await fetch("/api/portaal/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kanaalId: projectId, index, klaar: !list.items[index].klaar }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { items?: List["items"] } | null;
    if (res?.ok && json?.items) setList({ ...list, items: json.items });
    setBusy(null);
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{locale === "en" ? "Project start checklist" : "Checklist projectstart"}</h3>
        <span className="text-sm text-zinc-400">{done}/{list.items.length}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(done / list.items.length) * 100}%` }} /></div>
      <ul className="mt-4 space-y-1">
        {list.items.map((item, i) => (
          <li key={i}>
            <button type="button" onClick={() => toggle(i)} disabled={busy !== null} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-white/[0.04]">
              {busy === i ? <Loader2 className="size-5 animate-spin text-zinc-500" /> : item.klaar ? <CheckSquare className="size-5 text-brand-300" /> : <Square className="size-5 text-zinc-500" />}
              <span className={cn(item.klaar ? "text-zinc-500 line-through" : "text-zinc-200")}>{item.tekst}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-zinc-500">{locale === "en" ? "Tick off what you've done. The team sees it straight away in Discord." : "Vink af wat je hebt gedaan. Het team ziet het meteen in Discord."}</p>
    </div>
  );
}
