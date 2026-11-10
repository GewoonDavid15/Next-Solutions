"use client";

import { Palmtree, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

/** "We are away": shown while away mode is on (dashboard or app), can be closed per visit. */
export function AwayBanner() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [away, setAway] = useState<{ tekst: string; tekstEn: string } | null>(null);
  useEffect(() => {
    fetch("/api/afwezig").then((r) => (r.ok ? r.json() : null)).then((a: { tekst: string; tekstEn: string } | null) => {
      if (!a) return;
      try { if (sessionStorage.getItem("ns_afwezig_dicht") === a.tekst) return; } catch { /* no storage */ }
      setAway(a);
    }).catch(() => {});
  }, []);
  if (!away || pathname?.startsWith("/dashboard")) return null;
  return (
    <div role="status" className="fixed bottom-6 left-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-amber-400/30 bg-[#1b1708]/95 p-4 text-sm text-amber-100 shadow-2xl backdrop-blur sm:left-6">
      <Palmtree className="mt-0.5 size-5 shrink-0 text-amber-300" />
      <p className="flex-1">{locale === "en" ? away.tekstEn : away.tekst}</p>
      <button type="button" aria-label={locale === "en" ? "Close" : "Sluiten"} onClick={() => { try { sessionStorage.setItem("ns_afwezig_dicht", away.tekst); } catch { /* ignore */ } setAway(null); }} className="text-amber-200/70 hover:text-white"><X className="size-4" /></button>
    </div>
  );
}
