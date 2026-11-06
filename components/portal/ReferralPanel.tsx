"use client";

import { Check, Copy, Gift, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

interface Referral { aan: boolean; code?: string; link?: string; beloning?: string | null; aanvragen?: number; klanten?: number; aangebracht?: { naam: string; t: number; status: "aanvraag" | "klant" }[] }

const texts = {
  nl: {
    title: "Breng iemand mee", intro: "Ken je iemand die ook een website, bot of hulp met social media kan gebruiken? Deel je eigen link. Wordt diegene klant, dan krijg je een bedankje van ons.",
    reward: "Jouw bedankje per nieuwe klant:", rewardDefault: "spreken we samen af",
    copy: "Link kopiëren", copied: "Gekopieerd", share: "Delen", requests: "aanvragen via jouw link", clients: "klant geworden",
    request: "Aanvraag gedaan", client: "Klant 🎉", shareText: "Hier regel ik mijn website, Discord en social media. Misschien iets voor jou:",
  },
  en: {
    title: "Refer someone", intro: "Know someone who could use a website, bot or help with social media? Share your own link. If they become a client, we'll thank you for it.",
    reward: "Your thank-you per new client:", rewardDefault: "we'll agree on it together",
    copy: "Copy link", copied: "Copied", share: "Share", requests: "requests via your link", clients: "became a client",
    request: "Sent a request", client: "Client 🎉", shareText: "This is where I get my website, Discord and social media done. Maybe something for you:",
  },
};

/** The member's own referral link, with who came in through it. */
export function ReferralPanel() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [data, setData] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/portaal/doorverwijzing", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  }, []);

  if (!data?.aan || !data.link) return null;
  const link = locale === "en" ? data.link.replace(/\/\?ref=/, "/en?ref=") : data.link;

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><Gift className="size-5 text-brand-300" /> {tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
      <p className="mt-2 text-sm text-zinc-300">{tx.reward} <b className="text-white">{data.beloning || tx.rewardDefault}</b></p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} aria-label="Link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 font-mono text-sm text-zinc-200" />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check /> : <Copy />} {copied ? tx.copied : tx.copy}</Button>
          {typeof navigator !== "undefined" && "share" in navigator && <Button size="sm" variant="secondary" onClick={() => navigator.share({ title: "Next Solutions", text: tx.shareText, url: link }).catch(() => {})}><Share2 /> {tx.share}</Button>}
        </div>
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <p><b className="text-2xl text-white">{data.aanvragen ?? 0}</b> <span className="text-zinc-400">{tx.requests}</span></p>
        <p><b className="text-2xl text-brand-300">{data.klanten ?? 0}</b> <span className="text-zinc-400">{tx.clients}</span></p>
      </div>
      {!!data.aangebracht?.length && (
        <ul className="mt-3 space-y-1 text-sm">
          {data.aangebracht.slice(0, 8).map((a, i) => (
            <li key={i} className="flex justify-between rounded-xl bg-white/[0.03] px-3 py-1.5"><span>{a.naam}</span><span className={a.status === "klant" ? "text-brand-300" : "text-zinc-500"}>{a.status === "klant" ? tx.client : tx.request}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
