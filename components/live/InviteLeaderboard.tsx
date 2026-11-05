import { Trophy, UserPlus } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { PublicInvites } from "@/lib/live";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    title: "Top uitnodigers",
    intro: "Nodig vrienden uit voor onze Discord en verdien beloningen. Alleen leden die blijven tellen mee.",
    joined: "{n} leden kwamen binnen via een invite",
    rewards: "Beloningen",
    invites: "invites",
    empty: "Nog niemand op het leaderboard. Maak in Discord een invite-link en word de eerste!",
    howTo: "Bekijk je eigen invites in Discord met /invites bekijk of in je klantportaal.",
  },
  en: {
    title: "Top inviters",
    intro: "Invite friends to our Discord and earn rewards. Only members who stay are counted.",
    joined: "{n} members joined through an invite",
    rewards: "Rewards",
    invites: "invites",
    empty: "Nobody on the leaderboard yet. Create an invite link in Discord and be the first!",
    howTo: "Check your own invites in Discord with /invites bekijk or in your client portal.",
  },
};

const medals = ["🥇", "🥈", "🥉"];

/** Invite leaderboard from invites.js in the Discord bot. */
export function InviteLeaderboard({ invites, locale = "nl" }: { invites: PublicInvites; locale?: Locale }) {
  const tx = texts[locale];
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl text-white">
            <Trophy className="size-6 text-amber-400" /> {tx.title}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">{tx.intro}</p>
        </div>
        {invites.totaal > 0 && (
          <p className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1.5 text-sm text-brand-200">
            <UserPlus className="size-4" /> {tx.joined.replace("{n}", String(invites.totaal))}
          </p>
        )}
      </div>

      {invites.top.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-400">{tx.empty}</p>
      ) : (
        <ol className="mt-6 grid gap-2 sm:grid-cols-2">
          {invites.top.map((r, i) => (
            <li
              key={`${r.naam}-${i}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                i < 3 ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.02]",
              )}
            >
              <span className="w-7 text-center font-display text-lg text-zinc-400">{medals[i] ?? i + 1}</span>
              {r.avatar ? (
                <Image src={r.avatar} alt="" width={32} height={32} className="size-8 rounded-full" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-brand-gradient text-sm text-white">{r.naam.charAt(0)}</span>
              )}
              <span className="min-w-0 flex-1 truncate text-white">{r.naam}</span>
              <span className="shrink-0 font-display text-white">
                {r.invites} <span className="text-xs text-zinc-500">{tx.invites}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {invites.beloningen.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{tx.rewards}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {invites.beloningen.map((b) => (
              <li key={b.invites} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-zinc-300">
                {b.invites} {tx.invites}{b.rol ? ` → ${b.rol}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-5 text-xs text-zinc-500">{tx.howTo}</p>
    </div>
  );
}
