import { Gift, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicGiveaway } from "@/lib/live";

const texts = {
  nl: {
    title: "Lopende giveaways",
    intro: "Doe mee in het kanaal 🎁・giveaways in onze Discord. Verifieer je eerst, dan zie je het kanaal.",
    ends: "Eindigt",
    participants: "{n} deelnemer(s)",
    winners: "{n} winnaar(s)",
  },
  en: {
    title: "Running giveaways",
    intro: "Join in the 🎁・giveaways channel in our Discord. Verify yourself first to see the channel.",
    ends: "Ends",
    participants: "{n} participant(s)",
    winners: "{n} winner(s)",
  },
};

/** Running giveaways from giveaways.js in the Discord bot. Renders nothing when there are none. */
export function GiveawaysCard({ giveaways, locale = "nl", discordInvite }: { giveaways: PublicGiveaway[]; locale?: Locale; discordInvite: string }) {
  if (!giveaways.length) return null;
  const tx = texts[locale];
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nl-NL", { timeZone: "Europe/Amsterdam", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-2xl text-white">
        <Gift className="size-6 text-brand-400" /> {tx.title}
      </h2>
      <p className="mt-1 max-w-xl text-sm text-zinc-400">{tx.intro}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {giveaways.map((g) => (
          <li key={`${g.prijs}-${g.eindigt}`} className="rounded-2xl border border-brand-500/30 bg-brand-600/5 p-4">
            <p className="font-display text-lg text-white">{g.prijs}</p>
            <p className="mt-1 text-sm text-zinc-400">
              {tx.ends} {dateFmt.format(new Date(g.eindigt))}
            </p>
            <p className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {tx.participants.replace("{n}", String(g.deelnemers))}</span>
              <span>{tx.winners.replace("{n}", String(g.winnaars))}</span>
            </p>
          </li>
        ))}
      </ul>
      <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-medium text-brand-300 hover:text-white">
        Discord →
      </a>
    </div>
  );
}
